import path from 'node:path'
import fs from 'node:fs/promises'
import * as R from 'ramda'
import { $ } from 'bun'
import { Glob } from 'bun'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { mdxjs } from 'micromark-extension-mdxjs'
import { mdxFromMarkdown, mdxToMarkdown } from 'mdast-util-mdx'
import { toMarkdown } from 'mdast-util-to-markdown'
import slugify from '@sindresorhus/slugify'
import weaviate, { type WeaviateClient } from 'weaviate-client'

const glob = new Glob('**/*.mdx')
const docsDir = path.resolve(__dirname, '../src/content/docs')

// Connect to Weaviate DB
const weaviateClusterUrl = 'https://sidetrek-sandbox-z2qg54k4.weaviate.network'
const dbClient: WeaviateClient = await weaviate.connectToWCS(weaviateClusterUrl, {
  authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY || ''),
  headers: {
    'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '', // Replace with your inference API key
  },
})

const collectionName = 'Docs'

// Only creates it if it doesn't exist yet
const createWeaviateCollection = async (collectionName: string) => {
  // Add a new collection if it doesn't exist
  if (!(await dbClient.collections.exists(collectionName))) {
    const schema = {
      name: collectionName,
      // @ts-ignore
      vectorizer: weaviate.configure.vectorizer.text2VecOpenAI({
        model: 'text-embedding-3-small',
        dimensions: 1536,
      }),
      // vectorizer: [
      //   // @ts-ignore
      //   weaviate.configure.namedVectorizer('openai_te3_sm', {
      //     properties: ['openai_te3_sm'],
      //     // @ts-ignore
      //     vectorizerConfig: weaviate.configure.vectorizer.text2VecOpenAI({
      //       model: 'text-embedding-3-small',
      //       dimensions: 1536,
      //     }),
      //   }),
      //   // @ts-ignore
      //   weaviate.configure.namedVectorizer('openai_te3_lg_1024', {
      //     properties: ['openai_te3_lg_1024'],
      //     // @ts-ignore
      //     vectorizerConfig: weaviate.configure.vectorizer.text2VecOpenAI({
      //       model: 'text-embedding-3-large',
      //       dimensions: 1024,
      //     }),
      //   }),
      // ],
      generative: weaviate.configure.generative.openAI(),
    }

    // @ts-ignore
    const newCollection = await dbClient.collections.create(schema)
    console.log('Added a new class ', newCollection['name'])
  }
}

const getPathnameFromFilepath = (filepath: string): string => {
  return filepath.replace('src/content/docs', '')
}

const getAllDocFilepaths = async (): Promise<string[]> => {
  let allDocFiles: string[] = []
  for await (const file of glob.scan(docsDir)) {
    allDocFiles.push(file)
  }
  return allDocFiles.map((file) => `src/content/docs/${file}`)
}

const getChangedDocFilepaths = async (): Promise<string[]> => {
  const changedFilepathsStr =
    await $`echo $(git diff --name-only HEAD~ HEAD) $(git status --porcelain | awk '{print $2}')`.text()

  const changedDocFilepaths = changedFilepathsStr
    .slice(0, -1) // remove trailing newline
    .split(' ')
    .filter((file: string) => !file.endsWith('/')) // filter out directories
    .filter((file: string) => file.startsWith('src/content/docs')) // filter out non-doc files

  return changedDocFilepaths
}

interface DbObject {
  id?: string
  pathname: string
  content: string
  headingId: string | null
}

export const buildDbObjectsFromMdx = async (mdxFilepath: string): Promise<DbObject[]> => {
  const pathname = getPathnameFromFilepath(mdxFilepath)
  const file = (await fs.readFile(mdxFilepath, 'utf-8')).toString()
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

  // Create heading slugs (including handling duplicates)
  const headingSlugsState: string[] = []
  const headingSlugs = headingIndexes.map((headingIndex) => {
    const heading = children[headingIndex]
    const headingText = heading.children.find((child: any) => child.type === 'text').value
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
    }
  })
}

const main = async () => {
  await createWeaviateCollection(collectionName)

  const docsCollection = await dbClient.collections.get(collectionName)

  /**
   *
   * Get all doc files and create/update them in db (only if it doesn't exist)
   *
   *   NOTE: exclude changed files since they'll be overwritten in the next step
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

  // Filter out changed doc files
  existingDocPathnames = R.reject((_pathname: string) => changedDocFilepaths.includes(_pathname))(existingDocPathnames)
  console.log('existingDocPathnames', existingDocPathnames)

  for await (const filepath of allDocFilepaths) {
    const pathname = getPathnameFromFilepath(filepath)
    const pathnameExists = existingDocPathnames.includes(pathname)

    if (!pathnameExists) {
      const dbObjects = await buildDbObjectsFromMdx(filepath)

      if (dbObjects.length !== 0) {
        await docsCollection.data.insertMany(dbObjects)
      }
    }
  }

  /**
   *
   * Get changed doc files and overwrite them in db
   *
   */
  for await (const filepath of changedDocFilepaths) {
    const pathname = getPathnameFromFilepath(filepath)

    // Delete all objects in changed doc files first
    await docsCollection.data.deleteMany(docsCollection.filter.byProperty('pathname').like(pathname))

    const dbObjects = await buildDbObjectsFromMdx(filepath)

    if (dbObjects.length !== 0) {
      await docsCollection.data.insertMany(dbObjects)
    }
  }

  // Close the db connection
  dbClient.close()
}

// await main()

const queryTest = async () => {
  const docsCollection = await dbClient.collections.get(collectionName)

  const result = await docsCollection.query.nearText(['quick start'], {
    returnProperties: ['headingId'],
    limit: 5,
  })
  console.log('Query result:', result)
}
await queryTest()
