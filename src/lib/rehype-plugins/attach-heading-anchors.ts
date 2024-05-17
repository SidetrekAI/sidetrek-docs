import type { RehypePlugin } from '@astrojs/markdown-remark'
import { visit } from 'unist-util-visit'
import { heading as isHeading } from 'hast-util-heading'

export const attachHeadingAnchorsPlugin: RehypePlugin = () => {
  return async (tree) => {
    visit(tree, (node) => {
      if (!isHeading(node)) return

      const nodeData = node.data as any
      const headingId = nodeData?.id

      node.children = [
        {
          type: 'element',
          tagName: 'a',
          properties: {
            href: `#${headingId}`,
            className: ['heading-anchor'],
          },
          children: [],
        },
        ...node.children,
      ]
    })
  }
}
