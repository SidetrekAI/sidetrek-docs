export const prerender = false // Server-render on demand

import type { APIRoute } from 'astro'
import weaviate, { type WeaviateClient } from 'weaviate-client'

// Connect to Weaviate DB
const weaviateClusterUrl = 'https://sidetrek-sandbox-z2qg54k4.weaviate.network'
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

  // const searchResults = await docsCollection.query.nearText([searchQuery], {
  //   returnProperties: ['headingId', 'pathname', 'content'],
  //   limit: 10,
  // })
  const searchResults = await docsCollection.query.hybrid(searchQuery, {
    returnProperties: ['content', 'pathname', 'headingId', 'heading', 'excerpt'],
    limit: 10,
  })
  console.log('searchResults', searchResults)

  return new Response(JSON.stringify(searchResults?.objects || []))
}
