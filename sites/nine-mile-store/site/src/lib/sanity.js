import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: 'f0k2uz7k',
  dataset: 'production-new',
  apiVersion: '2023-05-03',
  useCdn: process.env.NODE_ENV === 'production',
  perspective: 'published',
  token: process.env.SANITY_API_TOKEN,
  stega: {
    enabled: process.env.NODE_ENV === 'development',
    studioUrl: '/studio',
  }
}) 