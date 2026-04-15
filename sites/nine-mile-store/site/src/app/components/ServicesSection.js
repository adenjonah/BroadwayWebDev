import Image from 'next/image'
import { urlForImage } from '../../lib/sanity-image'

export default function ServicesSection({ services }) {
  if (services.length === 0) return null

  const gridClass =
    services.length === 1
      ? 'max-w-md mx-auto'
      : services.length === 2
        ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto'
        : services.length === 3
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto'
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

  return (
    <section id="services" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl mb-3">Our Services</h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            We offer a variety of services to help with your home and garden
            needs
          </p>
        </div>

        <div className={`grid gap-8 ${gridClass}`}>
          {services.map((service) => {
            const imageUrl = service.image
              ? urlForImage(service.image).width(400).height(300).url()
              : null

            return (
              <div
                key={service._id}
                className="group bg-surface rounded-xl border border-black/5 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 bg-surface-alt overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-lg font-bold mb-2">
                    {service.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
