const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]
const DAY_LABELS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export default function AboutSection({ storeInfo, storeHours }) {
  const hasContact = storeInfo?.phone || storeInfo?.address
  const hasHours =
    storeHours && DAYS.some((day) => storeHours[day])

  return (
    <section id="about" className="py-20 bg-surface">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl mb-3">Visit Us</h2>
          <p className="text-muted text-lg">
            Come see us at the store &mdash; we&apos;d love to help
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact */}
          <div className="bg-surface-alt rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shrink-0">
                <PhoneIcon />
              </div>
              <h3 className="font-serif text-xl font-bold">Contact</h3>
            </div>
            {hasContact ? (
              <div className="space-y-3">
                {storeInfo.phone && (
                  <p className="text-lg font-medium">{storeInfo.phone}</p>
                )}
                {storeInfo.address && <p>{storeInfo.address}</p>}
                {storeInfo.city && <p>{storeInfo.city}</p>}
                {storeInfo.email && (
                  <a
                    href={`mailto:${storeInfo.email}`}
                    className="text-primary hover:underline block"
                  >
                    {storeInfo.email}
                  </a>
                )}
              </div>
            ) : (
              <p className="text-muted">Contact information coming soon.</p>
            )}
          </div>

          {/* Hours */}
          <div className="bg-surface-alt rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shrink-0">
                <ClockIcon />
              </div>
              <h3 className="font-serif text-xl font-bold">Hours</h3>
            </div>
            {hasHours ? (
              <div className="space-y-0">
                {DAYS.map((day, i) => (
                  <div
                    key={day}
                    className="flex justify-between py-2 border-b border-black/5 last:border-0"
                  >
                    <span className="font-medium">{DAY_LABELS[i]}</span>
                    <span className="text-muted">
                      {storeHours[day] || 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">Store hours coming soon.</p>
            )}
          </div>
        </div>

        {/* Community */}
        {storeInfo?.communityText && (
          <div className="bg-surface-alt rounded-xl p-8 text-center max-w-3xl mx-auto">
            <h3 className="font-serif text-2xl font-bold mb-4">
              Community Involvement
            </h3>
            <p className="text-muted text-lg leading-relaxed">
              {storeInfo.communityText}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function PhoneIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  )
}
