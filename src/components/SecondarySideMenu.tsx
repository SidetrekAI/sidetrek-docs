import { lazy, useEffect, useState } from 'react'
import { HEADER_HEIGHT } from '@/lib/constants'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'
import { mdxFromMarkdown, mdxToMarkdown } from 'mdast-util-mdx'
import { mdxjs } from 'micromark-extension-mdxjs'
import { toc } from 'mdast-util-toc'

interface SecondarySideMenuProps {
  page: string
}

export default function SecondarySideMenu({ page }: SecondarySideMenuProps) {
  const [tocTree, setTocTree] = useState<any>(null)
  useEffect(() => {
    const fn = async () => {
      const mdastTree = fromMarkdown(page, { extensions: [mdxjs()], mdastExtensions: [mdxFromMarkdown()] })
      const _tocTree = toc(mdastTree)
      // console.log('_tocTree', _tocTree)
      const mdx = toMarkdown(
        { type: 'root', children: _tocTree?.map?.children as any },
        { extensions: [mdxToMarkdown()] }
      )
      console.log('mdx', mdx)
      const tocMdast = fromMarkdown(mdx, { extensions: [mdxjs()], mdastExtensions: [mdxFromMarkdown()] })
      console.log('tocMdast', tocMdast)
      // const tocTreeTextNodes = extractTextFromTocTree(_tocTree.map)
      // console.log('tocTreeTextNodes', tocTreeTextNodes)
    }
    fn()
  }, [])

  return (
    <div className="relative w-[240px] shrink-0">
      <nav
        className="fixed hidden xl:block h-fit pl-4 pr-4 py-6 text-sm text-slate-600 border-b border-slate-200 overflow-auto"
        style={{ top: `${HEADER_HEIGHT}px`, width: 'inherit' }}
      >
        PLACEHOLDER
      </nav>
    </div>
  )
}

function extractTextFromTocTree(node: any, level: number = 0): Array<{ value: string; children?: any[] }> {
  if (node.type === 'text') {
    return [{ value: node.value }]
  }

  if (Array.isArray(node.children)) {
    return node.children.flatMap((child: any) => {
      const childResult = extractTextFromTocTree(child, level + 1)
      if (childResult.length > 0) {
        return [{ value: node.value, level, children: childResult }]
      } else {
        return []
      }
    })
  }

  return []
}
