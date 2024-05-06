import { z, defineCollection } from 'astro:content'

const docsCollection = defineCollection({
  type: 'content',
  schema: z.object({}),
})

export const collections = {
  docs: docsCollection,
}
