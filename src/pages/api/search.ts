export const prerender = false // Server-render on demand

import type { APIRoute } from 'astro'
import weaviate, { type WeaviateClient } from 'weaviate-client'

// Connect to Weaviate DB
const weaviateClusterUrl = 'https://aqgyk2vxr1kvwtb0ebdz6w.c0.us-west3.gcp.weaviate.cloud'
const dbClient: WeaviateClient = await weaviate.connectToWCS(weaviateClusterUrl, {
  authCredentials: new weaviate.ApiKey(import.meta.env.WEAVIATE_API_KEY || ''),
  headers: {
    'X-OpenAI-Api-Key': import.meta.env.OPENAI_API_KEY || '', // Replace with your inference API key
  },
})

export const POST: APIRoute = async ({ params, request }) => {
  const { searchQuery } = await request.json()
  const collectionName = 'Docs'
  const docsCollection = await dbClient.collections.get(collectionName)

  const searchResults = await docsCollection.query.hybrid(searchQuery, {
    returnProperties: ['content', 'pathname', 'headingId', 'heading', 'excerpt'],
    limit: 10,
  })
  console.log('searchResults', searchResults)

  return new Response(JSON.stringify(searchResults?.objects || []))
}
