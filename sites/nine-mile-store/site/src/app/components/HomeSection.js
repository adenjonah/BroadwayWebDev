import Image from 'next/image'
import { urlForImage } from '../../lib/sanity-image'

export default function HomeSection({ heroImage, blurbPhotos }) {
  const heroUrl = heroImage?.image
    ? urlForImage(heroImage.image).width(1600).height(800).url()
    : null
  const blurbUrl = blurbPhotos[0]?.image
    ? urlForImage(blurbPhotos[0].image).width(800).height(600).url()
    : null

  return (
    <section id="home">
      {/* Hero */}
      <div className="relative h-[70vh] min-h-[500px] flex items-center justify-center">
        {heroUrl ? (
          <Image
            src={heroUrl}
            alt="Nine Mile Hardware Store"
            fill
            priority
            className="object-cover"
          />
        ) : null}
        <div
          className={`absolute inset-0 ${
            heroUrl
              ? 'bg-primary-dark/60'
              : 'bg-gradient-to-br from-primary-dark to-primary'
          }`}
        />
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-bold mb-4 drop-shadow-lg">
            Nine Mile Feed &amp; Hardware
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow">
            Your local hardware store for all your home and garden needs
          </p>
          <a
            href="#services"
            className="inline-block bg-white text-primary-dark font-semibold px-8 py-3 rounded-full hover:bg-primary-light hover:text-white transition-all duration-300 shadow-lg"
          >
            Explore Our Services
          </a>
        </div>
      </div>

      {/* Family-Owned Blurb */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl mb-6">
              Family-Owned &amp; Community-Driven
            </h2>
            <p className="text-muted text-lg leading-relaxed mb-4">
              Nine Mile Hardware is a family-owned and operated business that has
              been serving the Nine Mile Falls community for over 25 years. We
              pride ourselves on personal service and quality products.
            </p>
            <p className="text-muted text-lg leading-relaxed mb-4">
              Our knowledgeable staff is always ready to help you find exactly
              what you need for your project, big or small.
            </p>
            <p className="text-muted text-lg leading-relaxed">
              Whether you&apos;re a professional contractor or a weekend DIY
              enthusiast, you&apos;ll find everything you need here.
            </p>
          </div>
          {blurbUrl && (
            <div className="relative h-80 md:h-[28rem] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={blurbUrl}
                alt="Inside our store"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
