import path from 'path'
import { $ } from 'bun'
import { Glob } from 'bun'
import fs from 'node:fs/promises'
import { fromMarkdown } from 'mdast-util-from-markdown'

const glob = new Glob('**/*.mdx')

// Get all mdx files in /docs
const docsDir = path.resolve(__dirname, '../content/docs')
for await (const file of glob.scan(docsDir)) {
  const doc = await fs.readFile(path.resolve(docsDir, file), 'utf-8')
  const tree = fromMarkdown(doc)
  console.log(tree)
}
