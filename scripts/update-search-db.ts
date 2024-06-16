import path from 'node:path'
import fs from 'node:fs'
import * as R from 'ramda'
import { $, Glob } from 'bun'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { mdxjs } from 'micromark-extension-mdxjs'
import { mdxFromMarkdown, mdxToMarkdown } from 'mdast-util-mdx'
import { toMarkdown } from 'mdast-util-to-markdown'
import slugify from '@sindresorhus/slugify'
import weaviate, { type WeaviateClient } from 'weaviate-client'

const glob = new Glob('**/*.mdx')
const docsDir = path.resolve(__dirname, '../src/content/docs')

// Connect to Weaviate DB
const weaviateClusterUrl = 'https://aqgyk2vxr1kvwtb0ebdz6w.c0.us-west3.gcp.weaviate.cloud'
const dbClient: WeaviateClient = await weaviate.connectToWCS(weaviateClusterUrl, {
  authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY || ''),
  headers: {
    'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '', // Replace with your inference API key
  },
})

const collectionName = 'Docs'

// Only creates it if it doesn't exist yet
const createWeaviateCollection = async (collectionName: string) => {
  const collectionExists = await dbClient.collections.exists(collectionName)
  console.log('collection exists?', collectionExists)

  // Add a new collection if it doesn't exist
  if (!collectionExists) {
    const schema = {
      name: collectionName,
      properties: [
        {
          name: 'pathname',
          dataType: 'text' as const,
          description: 'Doc pathname' as const,
        },
        {
          name: 'content',
          dataType: 'text' as const,
          description: 'Section content' as const,
        },
        {
          name: 'headingId',
          dataType: 'text' as const,
          description: 'Heading ID of the section' as const,
        },
        {
          name: 'heading',
          dataType: 'text' as const,
          description: 'Heading text of the section' as const,
        },
        {
          name: 'excerpt',
          dataType: 'text' as const,
          description: 'Except text for the section' as const,
        },
      ],
      vectorizers: [
        weaviate.configure.vectorizer.text2VecOpenAI('default', {
          model: 'text-embedding-3-small',
          dimensions: 1536,
        }),
      ],
      // vectorizers: [
      //   weaviate.configure.vectorizer('openai_te3_sm', {
      //     properties: ['openai_te3_sm'],
      //     vectorizerConfig: weaviate.configure.vectorizer.text2VecOpenAI({
      //       model: 'text-embedding-3-small',
      //       dimensions: 1536,
      //     }),
      //   }),
      // ],
      generative: weaviate.configure.generative.openAI(),
    }

    const newCollection = await dbClient.collections.create(schema)
    console.log('Added a new class ', newCollection['name'])
  }
}

const getPathnameFromFilepath = (filepath: string): string => {
  return filepath.replace('src/content/docs', '').split('.md')[0]
}

const getAllDocFilepaths = async (): Promise<string[]> => {
  let allDocFiles: string[] = []
  for await (const file of glob.scan(docsDir)) {
    allDocFiles.push(file)
  }

  // Filter out drafts
  const publishableDocFiles = allDocFiles
    .filter((file) => {
      const _path = `src/content/docs/${file}`
      const content = fs.readFileSync(`./${_path}`, 'utf-8').toString()
      const isDraft = R.compose(R.includes('draft: true') as any, R.nth(1), R.split('---'))(content)
      return !isDraft
    })
    .map((file) => `src/content/docs/${file}`)

  return publishableDocFiles
}

const getChangedDocFilepaths = async (): Promise<string[]> => {
  // We only want modified files (`--diff-filter=M`) because all the added/renamed files will be handled separately
  const changedFilepathsStr = await $`echo $(git diff --name-only --diff-filter=M HEAD~ HEAD)`.text()

  const changedDocFilepaths = changedFilepathsStr
    .slice(0, -1) // remove trailing newline
    .split(' ')
    .filter((file: string) => !file.endsWith('/')) // filter out directories
    .filter((file: string) => file.startsWith('src/content/docs')) // filter out non-doc files

  return changedDocFilepaths
}

const extractTextFromMdast = (node: any): string[] => {
  if (node.type === 'text') {
    return [node.value]
  }

  if (Array.isArray(node.children)) {
    return node.children.flatMap(extractTextFromMdast)
  }

  return []
}

interface DbObject {
  id?: string
  pathname: string
  content: string
  headingId: string
  heading: string
  excerpt: string
}

export const buildDbObjectsFromMdx = async (mdxFilepath: string): Promise<DbObject[]> => {
  const pathname = getPathnameFromFilepath(mdxFilepath)
  const file = fs.readFileSync(mdxFilepath, 'utf-8').toString()
  const mdastTree = fromMarkdown(file, { extensions: [mdxjs()], mdastExtensions: [mdxFromMarkdown()] })
  const children = mdastTree.children as any[]

  const headingIndexes: number[] = children
    .reduce((acc, child, i) => (child.type === 'heading' ? [...acc, i] : acc), [])
    ?.slice(1) // Remove the first heading (the title/description of the doc)

  // Each section is a heading + its content (i.e. everything until the next heading)
  const sectionsMdast = headingIndexes.map((headingIndex, i) => {
    if (i === headingIndexes.length - 1) {
      return children.slice(headingIndex)
    }
    const nextIndex = headingIndexes[i + 1]
    return children.slice(headingIndex, nextIndex)
  })

  const sectionsMdx = sectionsMdast.map((section) => {
    return toMarkdown({ type: 'root', children: section }, { extensions: [mdxToMarkdown()] })
  })

  const headingTexts = headingIndexes.map((headingIndex) => {
    const heading = children[headingIndex]
    return heading.children.find((child: any) => child.type === 'text').value
  })

  const excerpts = sectionsMdast.map((section) => {
    const excerptLen = 300
    const sectionTexts = section
      .flatMap((sectionNode) => {
        // Filter out heading text
        if (sectionNode.type === 'heading') {
          return []
        }

        return extractTextFromMdast(sectionNode)
      })
      .filter((text) => text.length > 0)
    const sectionText = sectionTexts.length > 0 ? sectionTexts.join(' ').slice(0, excerptLen) : ''
    return sectionText
  })

  // Create heading slugs (including handling duplicates)
  const headingSlugsState: string[] = []
  const headingSlugs = headingTexts.map((headingText) => {
    const headingSlug = slugify(headingText)
    const duplicateOccurence = headingSlugsState.filter((_slug) => _slug === headingSlug).length

    headingSlugsState.push(headingSlug)

    return duplicateOccurence > 0 ? `${headingSlug}-${duplicateOccurence}` : headingSlug
  })

  return sectionsMdx.map((sectionMdx, i) => {
    return {
      pathname,
      content: sectionMdx,
      headingId: headingSlugs[i],
      heading: headingTexts[i],
      excerpt: excerpts[i],
    }
  })
}

const main = async () => {
  await createWeaviateCollection(collectionName)

  const docsCollection = await dbClient.collections.get(collectionName)

  /**
   *
   * Sync the current docs with db by creating, updating (overwrite), and removing in db
   *
   */
  const allDocFilepaths = await getAllDocFilepaths()
  console.log('allDocFilepaths', allDocFilepaths)

  const changedDocFilepaths = await getChangedDocFilepaths()
  console.log('changedDocFilepaths', changedDocFilepaths)

  // Get all doc pathnames from db
  let existingDocPathnames: string[] = []
  for await (const item of docsCollection.iterator()) {
    existingDocPathnames.push(item.properties.pathname as string)
  }
  existingDocPathnames = R.uniq(existingDocPathnames)

  // Filter out changed docs during this step (because changed docs will be overwritten separately in the next step)
  // This will leave us with added/renamed docs
  const filteredExistingDocPathnames = R.reject((_pathname: string) => changedDocFilepaths.includes(_pathname))(
    existingDocPathnames
  )
  console.log('filteredExistingDocPathnames', filteredExistingDocPathnames)

  for await (const filepath of allDocFilepaths) {
    const pathname = getPathnameFromFilepath(filepath)
    const pathnameExists = filteredExistingDocPathnames.includes(pathname)

    if (!pathnameExists) {
      const dbObjects = await buildDbObjectsFromMdx(filepath)

      if (dbObjects.length !== 0) {
        await docsCollection.data.insertMany(dbObjects)
        console.log(`Inserted ${dbObjects.length} objects for ${pathname}`)
      }
    }
  }

  // Overwrite the change docs in db
  for await (const filepath of changedDocFilepaths) {
    const pathname = getPathnameFromFilepath(filepath)

    // Delete all objects in changed doc files first
    await docsCollection.data.deleteMany(docsCollection.filter.byProperty('pathname').like(pathname))

    const dbObjects = await buildDbObjectsFromMdx(filepath)

    if (dbObjects.length !== 0) {
      await docsCollection.data.insertMany(dbObjects)
      console.log(`Updated (overwrote) ${dbObjects.length} objects for ${pathname}`)
    }
  }

  // Remove deleted docs from db
  const deletedDocPathnames = R.difference(existingDocPathnames, allDocFilepaths.map(getPathnameFromFilepath))
  for await (const pathname of deletedDocPathnames) {
    await docsCollection.data.deleteMany(docsCollection.filter.byProperty('pathname').like(pathname))
    console.log(`Deleted all objects for ${pathname}`)
  }

  // Close the db connection
  dbClient.close()
}

await main()

// const queryTest = async () => {
//   const docsCollection = await dbClient.collections.get(collectionName)

//   const result = await docsCollection.query.nearText(['quick start'], {
//     returnProperties: ['headingId'],
//     limit: 5,
//   })
//   console.log('Query result:', result)

//   // Close the db connection
//   dbClient.close()
// }

// await queryTest()
