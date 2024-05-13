import path from 'node:path'
import { buildDbObjectsFromMdx } from './update-search-db'

const docsDir = path.resolve(__dirname, '../src/content/docs')

const testFn = async () => {
  const file = 'start-here/getting-started.mdx'
  const dbObjects = await buildDbObjectsFromMdx(path.resolve(docsDir, file))
  console.log('dbObjects', dbObjects)
}
await testFn()
