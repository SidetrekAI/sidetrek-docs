import { z, defineCollection } from 'astro:content'

const docsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draft: z.boolean(),
  }),
})

export const collections = {
  docs: docsCollection,
}
