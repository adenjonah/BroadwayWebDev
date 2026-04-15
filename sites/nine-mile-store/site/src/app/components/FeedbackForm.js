'use client'

import { useState, useRef, useEffect } from 'react'

export default function FeedbackForm() {
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    feedback: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const iframeRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const handleLoad = () => {
      if (formSubmitted) {
        setIsSubmitting(false)
        setIsSubmitted(true)
        setFormSubmitted(false)
        setFormValues({ firstName: '', lastName: '', mobile: '', feedback: '' })
        setTimeout(() => setIsSubmitted(false), 5000)
      }
    }

    iframe.addEventListener('load', handleLoad)
    return () => iframe.removeEventListener('load', handleLoad)
  }, [formSubmitted])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formValues.firstName || !formValues.feedback) return
    setIsSubmitting(true)
    setFormSubmitted(true)
    formRef.current.submit()
  }

  return (
    <section id="contact" className="py-20">
      <div className="max-w-2xl mx-auto px-4">
        {isSubmitted && (
          <div className="bg-green-50 border border-green-200 p-8 rounded-xl text-center mb-8">
            <svg
              className="w-16 h-16 mx-auto text-green-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <h2 className="text-2xl font-serif mb-2">Thank You!</h2>
            <p className="text-muted">
              Your feedback has been submitted. We appreciate your input!
            </p>
          </div>
        )}

        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl mb-3">We Want Your Feedback</h2>
          <p className="text-muted text-lg">
            Help us understand what you&apos;d like to see at Nine Mile Feed
            &amp; Hardware
          </p>
        </div>

        <iframe
          name="hidden-iframe"
          style={{ display: 'none' }}
          ref={iframeRef}
        />

        <form
          action="https://formsubmit.co/jeff@ninemilefeed.com"
          method="POST"
          target="hidden-iframe"
          onSubmit={handleSubmit}
          ref={formRef}
          className="bg-surface rounded-xl p-8 shadow-sm border border-black/5"
        >
          <input
            type="hidden"
            name="_subject"
            value="New Feedback for Nine Mile Store"
          />
          <input type="hidden" name="_template" value="table" />
          <input type="text" name="_honey" style={{ display: 'none' }} />
          <input type="hidden" name="_captcha" value="false" />

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                htmlFor="firstName"
              >
                First Name <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formValues.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-black/10 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                htmlFor="lastName"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formValues.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-black/10 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="mobile"
            >
              Mobile Number (optional)
            </label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formValues.mobile}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-black/10 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          <div className="mb-8">
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="feedback"
            >
              What would you like to see at our store?{' '}
              <span className="text-accent">*</span>
            </label>
            <textarea
              id="feedback"
              name="feedback"
              value={formValues.feedback}
              onChange={handleChange}
              rows={5}
              required
              className="w-full px-4 py-3 rounded-lg border border-black/10 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
              isSubmitting
                ? 'bg-primary/60 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark shadow-sm hover:shadow'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </section>
  )
}
