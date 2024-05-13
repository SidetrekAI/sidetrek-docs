import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import mdx from '@astrojs/mdx'
import theme from './syntax-theme.json'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import attachHeadingSlugs from './src/lib/rehype-plugins/attach-heading-slugs'

const prettyCodeOptions = {
  theme,
  onVisitTitle(node) {
    node.children = [
      {
        type: 'element',
        tagName: 'span',
        properties: { className: 'title' },
        children: [{ type: 'text', value: node.children[0].value }],
      },
    ]
  },
  onVisitHighlightedLine(node) {
    node?.properties?.className
      ? node.properties.className.push('highlighted')
      : (node.properties.className = ['highlighted'])
  },
  onVisitHighlightedChars(node) {
    node?.properties?.className
      ? node.properties.className.push('highlighted-chars')
      : (node.properties.className = ['highlighted-chars'])
  },
}

// https://astro.build/config
export default defineConfig({
  redirects: {
    '/start-here': '/start-here/getting-started',
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    mdx(),
  ],
  markdown: {
    syntaxHighlight: false,
    extendDefaultPlugins: false,
    rehypePlugins: [attachHeadingSlugs, rehypeAutolinkHeadings, [rehypePrettyCode, prettyCodeOptions]],
  },
})
