import path from 'node:path'
import * as R from 'ramda'

const docsDir = path.resolve(__dirname, '../src/content/docs')

const testFn = async () => {
  console.clear()

  const text = `---
  dsklfls
  draft: true
  sdklfjlds
  ---
  bladkjlfs
  `

  const result = R.compose(
    R.split('---') as any,
  )(text)

  console.log(result)
}
await testFn()
