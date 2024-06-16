import type { RehypePlugin } from '@astrojs/markdown-remark'
import { visit, type VisitorResult } from 'unist-util-visit'
import { heading as isHeading } from 'hast-util-heading'
import type { ElementContent, Text } from 'hast'
import slugify from '@sindresorhus/slugify'

export const attachHeadingSlugsPlugin: RehypePlugin = () => {
  return (tree) => {
    visit(tree, (node) => {
      if (!isHeading(node)) return

      const headingTextNode = node.children.find((child: ElementContent) => child.type === 'text') as Text
      const headingTextNodeValue = headingTextNode?.value
      const slug = slugify(headingTextNodeValue)

      node.properties = { ...node.properties, id: slug }
    })
  }
}
