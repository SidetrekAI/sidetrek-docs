import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import mdx from '@astrojs/mdx'
import rehypePrettyCode from 'rehype-pretty-code'
import theme from './syntax-theme.json'

const prettyCodeOptions = {
  theme,
  onVisitTitle(node) {
    console.log(node)
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
    console.log(node)
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
    extendDefaultPlugins: true,
    rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
  },
})
