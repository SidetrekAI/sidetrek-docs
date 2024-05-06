import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import mdx from '@astrojs/mdx'

import expressiveCode from 'astro-expressive-code'

// https://astro.build/config
export default defineConfig({
  redirects: {
    '/start-here': '/start-here/getting-started'
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    expressiveCode({
      themes: ['dark-plus', 'catppuccin-mocha', 'github-dark-default'],
    }),
    mdx(),
  ],
})
