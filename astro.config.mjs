import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import mdx from '@astrojs/mdx'
import theme from './syntax-theme.json'
import rehypePrettyCode from 'rehype-pretty-code'
import { attachHeadingSlugsPlugin } from './src/lib/rehype-plugins/attach-heading-slugs'
import { attachHeadingAnchorsPlugin } from './src/lib/rehype-plugins/attach-heading-anchors'
import vercel from '@astrojs/vercel/serverless'

const prettyCodeOptions = {
  theme,
  onVisitTitle(node) {
    node.children = [
      {
        type: 'element',
        tagName: 'span',
        properties: {
          className: 'title',
        },
        children: [
          {
            type: 'text',
            value: node.children[0].value,
          },
        ],
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
    '/get-started': '/get-started/overview',
  },
  output: 'hybrid',
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
    rehypePlugins: [attachHeadingSlugsPlugin, attachHeadingAnchorsPlugin, [rehypePrettyCode, prettyCodeOptions]],
  },
  adapter: vercel(),
})
