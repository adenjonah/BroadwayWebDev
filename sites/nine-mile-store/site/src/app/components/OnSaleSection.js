import Image from 'next/image'
import { urlForImage } from '../../lib/sanity-image'

export default function OnSaleSection({ saleItems }) {
  if (saleItems.length === 0) return null

  return (
    <section id="on-sale" className="py-20 bg-surface-alt">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-block bg-accent/10 text-accent font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
            This Week&apos;s Specials
          </span>
          <h2 className="text-3xl md:text-4xl">On Sale Now</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {saleItems.map((item) => {
            const imageUrl = item.image
              ? urlForImage(item.image).width(400).height(300).url()
              : null

            return (
              <div
                key={item._id}
                className="group bg-surface rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-52 overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-surface-alt text-muted">
                      No image
                    </div>
                  )}
                  {item.salePrice && (
                    <div className="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                      SALE
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-lg font-bold mb-2">
                    {item.name}
                  </h3>
                  <p className="text-muted text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-3">
                    {item.regularPrice && (
                      <span className="text-muted line-through text-sm">
                        {item.regularPrice}
                      </span>
                    )}
                    {item.salePrice && (
                      <span className="bg-accent text-white px-3 py-1 rounded-full font-bold text-sm">
                        {item.salePrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
