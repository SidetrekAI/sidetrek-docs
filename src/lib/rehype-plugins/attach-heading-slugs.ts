import { visit } from 'unist-util-visit'
import slugify from '@sindresorhus/slugify'
import { head } from 'ramda'

function transformer(ast: any) {
  visit(ast, 'heading', visitor)

  function visitor(node: any, index?: number, parent?: Node) {
    const textNodeValue = node.children.find((child: any) => child.type === 'text')?.value
    const slug = slugify(textNodeValue)

    return {
      ...node,
      data: {
        ...node.data,
        id: slug,
      },
    }
  }
}

function plugin() {
  return transformer
}

export default plugin
