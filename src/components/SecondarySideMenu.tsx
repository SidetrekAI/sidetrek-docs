import { useEffect, useState } from 'react'
import * as R from 'ramda'
import { HEADER_HEIGHT } from '@/lib/constants'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'
import { mdxFromMarkdown, mdxToMarkdown } from 'mdast-util-mdx'
import { mdxjs } from 'micromark-extension-mdxjs'
import { toc } from 'mdast-util-toc'
import { toHast } from 'mdast-util-to-hast'
import { toHtml } from 'hast-util-to-html'

interface SecondarySideMenuProps {
  page: string
}

export default function SecondarySideMenu({ page }: SecondarySideMenuProps) {
  const [tocHtml, setTocHtml] = useState<any>(null)
  useEffect(() => {
    const fn = async () => {
      const mdastTree = fromMarkdown(page, { extensions: [mdxjs()], mdastExtensions: [mdxFromMarkdown()] })

      // Filter out the first heading
      const mdastTreePruned = R.reject((node: any) => node.type === 'heading' && node.depth === 1, mdastTree.children)

      const _tocTree = toc({ type: 'root', children: mdastTreePruned })

      const mdx = toMarkdown(
        { type: 'root', children: _tocTree?.map?.children as any },
        { extensions: [mdxToMarkdown()] }
      )
      const mdast = fromMarkdown(mdx, { extensions: [mdxjs()], mdastExtensions: [mdxFromMarkdown()] })
      const hast = toHast(mdast)
      const html = toHtml(hast)
      setTocHtml(html)
    }
    fn()
  }, [])

  return (
    <aside className="toc relative w-[280px] shrink-0">
      <div
        className="fixed hidden xl:block h-fit pl-4 pr-4 py-4 text-sm text-slate-600 border-b border-slate-200 overflow-auto"
        style={{ top: `${HEADER_HEIGHT}px`, width: 'inherit' }}
      >
        <div className="font-semibold text-slate-900 mt-2 mb-4 uppercase">On this page</div>
        <div dangerouslySetInnerHTML={{ __html: tocHtml }} />
      </div>
    </aside>
  )
}
