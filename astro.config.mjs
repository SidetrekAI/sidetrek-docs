import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import mdx from '@astrojs/mdx'
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerNotationErrorLevel,
  transformerMetaHighlight,
  transformerMetaWordHighlight,
} from '@shikijs/transformers'

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
    shikiConfig: {
      theme: 'catppuccin-mocha',
      langs: ['python', 'markdown', 'bash'],
      wrap: false,
      transformers: [
        {
          line(node, line) {
            // Add line number class to line nodes
            // USAGE: Add `no_line_numbers` to the meta block in the mdx code fence
            node.properties['data-line'] = line
            const metaOptions = this.options.meta ? this.options.meta.__raw.split(' ') : []
            const hasNoLineNumberOption = metaOptions.includes('no_line_numbers')
            if (!hasNoLineNumberOption) {
              this.addClassToHast(node, 'astro-code-line-number')
            }

            // Add class to code blocks
            // USAGE: Add `filename=your-filename` to the meta block in the mdx code fence
            const filenameOpt = metaOptions.find((opt) => opt.startsWith('filename='))
            const filename = filenameOpt ? filenameOpt.split('=')[1] : null
            if (filename) {
              node.properties['data-astro-code-block-filename'] = filename
            }
          },
        },
        transformerNotationDiff,
        transformerNotationErrorLevel,
        transformerMetaHighlight,
        transformerMetaWordHighlight,
      ],
    },
  },
})
