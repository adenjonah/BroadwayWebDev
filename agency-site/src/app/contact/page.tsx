import type { Metadata } from 'next';
import ScrollReveal from '@/components/scroll-reveal';
import ContactForm from '@/components/contact-form';
import '@/styles/contact.css';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Broadway Web Dev. We\'ll build a free prototype of your business website — no commitment required.',
};

export default function ContactPage() {
  return (
    <>
      {/* PAGE HERO */}
      <section className="page-hero">
        <div className="page-hero-glow" aria-hidden="true"></div>
        <div className="container">
          <div className="page-hero-content">
            <span className="section-label">Contact</span>
            <h1>Let&apos;s get your<br />business online.</h1>
            <p>
              Drop us your info and we&apos;ll reach out to schedule a quick intro.
              No commitment, no pressure &mdash; just a conversation.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="contact-grid">

            {/* Info */}
            <ScrollReveal direction="from-left" className="contact-info">
              <h2>Reach out directly.</h2>
              <p>
                Prefer a call or email? We&apos;re real people, not a support ticket system.
                Reach out however works best for you.
              </p>
              <div className="contact-details">
                <div className="contact-detail">
                  <div className="contact-detail-icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12 19.79 19.79 0 0 1 1.62 3.41 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.28 6.28l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  </div>
                  <div className="contact-detail-text">
                    <span className="contact-detail-label">Phone</span>
                    <a href="tel:+15099519616" className="contact-detail-value">(509) 951-9616</a>
                  </div>
                </div>
                <div className="contact-detail">
                  <div className="contact-detail-icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  </div>
                  <div className="contact-detail-text">
                    <span className="contact-detail-label">Email</span>
                    <a href="mailto:jonah@broadwaywebsites.com" className="contact-detail-value">jonah@broadwaywebsites.com</a>
                  </div>
                </div>
                <div className="contact-detail">
                  <div className="contact-detail-icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  </div>
                  <div className="contact-detail-text">
                    <span className="contact-detail-label">Location</span>
                    <span className="contact-detail-value">New York City</span>
                  </div>
                </div>
              </div>

              <div className="promise-grid">
                <div className="promise-card">
                  <h4>Free Prototype</h4>
                  <p>See your site before committing</p>
                </div>
                <div className="promise-card">
                  <h4>Fast Turnaround</h4>
                  <p>Sites delivered in days, not months</p>
                </div>
                <div className="promise-card">
                  <h4>Dedicated Editor</h4>
                  <p>Email us changes, done in 24 hours</p>
                </div>
                <div className="promise-card">
                  <h4>Fully Managed</h4>
                  <p>Hosting, updates, and ongoing support</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Form */}
            <ScrollReveal direction="from-right" className="contact-form-wrap">
              <h3>Send us a message.</h3>
              <p>We&apos;ll get back to you within 24 hours.</p>
              <ContactForm />
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
