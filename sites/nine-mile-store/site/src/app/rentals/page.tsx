import { client } from '@/lib/sanity'
import { groq } from 'next-sanity'
import RentalsGrid from './RentalsGrid'

const query = groq`
  *[_type == "rentalItem"] {
    _id,
    name,
    slug,
    image,
    description,
    dailyRate,
    weeklyRate,
    "category": category->value.current,
    "categoryTitle": category->title
  }
`

export const metadata = {
  title: 'Equipment Rentals | Nine Mile Feed & Hardware',
  description:
    'Browse professional-grade tools and equipment for rent. Daily and weekly rates available.',
}

export default async function RentalsPage() {
  let rentalItems = []
  try {
    const result = await client.fetch(query)
    rentalItems = Array.isArray(result) ? result : []
  } catch {
    rentalItems = []
  }

  return <RentalsGrid items={rentalItems} />
}
