import { client } from '@/lib/sanity'
import { groq } from 'next-sanity'
import Image from 'next/image'
import { formatCurrency, generateSlug } from '@/lib/utils'
import { notFound } from 'next/navigation'
import { urlForImage } from '@/lib/sanity-image'

const getRentalItem = groq`
  *[_type == "rentalItem" && (slug.current == $slug || slug.current == $generatedSlug)][0] {
    _id,
    name,
    image,
    "additionalImages": additionalImages[].image,
    description,
    specifications,
    dailyRate,
    weeklyRate,
    "category": category->value.current,
    "categoryTitle": category->title
  }
`

interface RentalItemPageProps {
  params: Promise<{ slug: string }>
}

function getImageUrl(image: any, width = 800, height = 400) {
  try {
    return image?.asset
      ? urlForImage(image).width(width).height(height).fit('crop').url()
      : null
  } catch {
    return null
  }
}

export default async function RentalItemPage({ params }: RentalItemPageProps) {
  const { slug } = await params

  let item = null
  try {
    item = await client.fetch(getRentalItem, {
      slug,
      generatedSlug: generateSlug(decodeURIComponent(slug)),
    })
  } catch {
    notFound()
  }

  if (!item) notFound()

  const mainImageUrl = getImageUrl(item.image)
  const additionalImages =
    item.additionalImages?.filter((img: any) => img?.asset) || []
  const dailyRate = item.dailyRate || 0
  const weeklyRate = item.weeklyRate || null
  const categoryDisplay = item.categoryTitle || 'Uncategorized'

  const savings =
    weeklyRate && dailyRate > 0 && dailyRate * 7 > weeklyRate
      ? formatCurrency(dailyRate * 7 - weeklyRate)
      : null

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 pt-24">
      <div className="bg-surface rounded-xl shadow-sm overflow-hidden border border-black/5">
        {mainImageUrl && (
          <div className="relative h-96">
            <Image
              src={mainImageUrl}
              alt={item.name || 'Rental item'}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {additionalImages.length > 0 && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-surface-alt">
            {additionalImages.map((img: any, index: number) => {
              const imageUrl = getImageUrl(img, 300, 200)
              return imageUrl ? (
                <div key={index} className="relative h-32">
                  <Image
                    src={imageUrl}
                    alt={`${item.name} - Image ${index + 2}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ) : null
            })}
          </div>
        )}

        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6">{item.name}</h1>

          {/* Pricing */}
          <div className="bg-surface-alt rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Rental Rates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface border-2 border-primary/20 rounded-lg p-4">
                <p className="text-sm font-medium text-muted uppercase tracking-wide">
                  Daily Rate
                </p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {formatCurrency(dailyRate)}
                </p>
              </div>
              {weeklyRate && (
                <div className="bg-surface border-2 border-secondary/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-muted uppercase tracking-wide">
                    Weekly Rate
                  </p>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {formatCurrency(weeklyRate)}
                  </p>
                  {savings && (
                    <p className="text-xs text-muted mt-1">Save {savings}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-muted leading-relaxed">
              {item.description || 'No description available.'}
            </p>
          </div>

          {/* Specifications */}
          {item.specifications?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Specifications</h2>
              <ul className="list-disc list-inside text-muted space-y-1">
                {item.specifications.map((spec: string, index: number) => (
                  <li key={index}>{spec}</li>
                ))}
              </ul>
            </div>
          )}

          <span className="inline-block bg-surface-alt rounded-full px-4 py-2 text-sm font-medium">
            Category: {categoryDisplay}
          </span>
        </div>
      </div>
    </main>
  )
}
