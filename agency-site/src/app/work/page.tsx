import type { Metadata } from 'next';
import ScrollReveal from '@/components/scroll-reveal';
import MagneticButton from '@/components/magnetic-button';
import '@/styles/work.css';

export const metadata: Metadata = {
  title: 'Our Work',
  description:
    'See the websites Broadway Web Dev has built for NYC small businesses. Real sites for real businesses.',
};

export default function WorkPage() {
  return (
    <>
      {/* PAGE HERO */}
      <section className="page-hero">
        <div className="page-hero-glow" aria-hidden="true"></div>
        <div className="container">
          <div className="page-hero-content">
            <span className="section-label">Our Work</span>
            <h1>Sites we&apos;ve built.</h1>
            <p>
              Every project starts with a real NYC business that deserves
              to be found online. Here&apos;s what we&apos;ve shipped so far.
            </p>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="projects-grid">
            <ScrollReveal className="project-feature">
              <div className="project-feature-visual">
                <div className="project-feature-visual-inner">
                  <div className="project-feature-visual-logo">Haji&apos;s Famous Deli</div>
                  <div className="project-feature-visual-sub">Morningside Heights, NYC</div>
                </div>
                <div className="project-feature-visual-bar" aria-hidden="true"></div>
              </div>
              <div className="project-feature-info">
                <span className="section-label">Restaurant &amp; Deli</span>
                <h3>Haji&apos;s Famous Deli</h3>
                <p>
                  Home of the original chopped cheese. A complete marketing
                  site with menu, customer reviews, location info, hours,
                  and online ordering links.
                </p>
                <div className="project-tags">
                  <span className="tag">Menu</span>
                  <span className="tag">Reviews</span>
                  <span className="tag">Online Ordering</span>
                  <span className="tag">Local SEO</span>
                </div>
                <a href="https://hajis-famous-deli.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  View Live Site
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10" /></svg>
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <div className="container"><div className="divider-gradient"></div></div>

      {/* COMING SOON */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
            <ScrollReveal><span className="section-label">In the Pipeline</span></ScrollReveal>
            <ScrollReveal><h2 className="section-heading">More sites on the way.</h2></ScrollReveal>
            <ScrollReveal><p className="section-desc" style={{ margin: '0 auto var(--space-lg)' }}>
              We&apos;re actively building for businesses across the city.
              These are the types of projects we&apos;re working on next.
            </p></ScrollReveal>
          </div>
          <ScrollReveal stagger className="coming-soon-grid">
            <div className="coming-soon-card reveal from-bottom">
              <div className="coming-soon-icon" aria-hidden="true">&#9986;</div>
              <h4>Barbershops &amp; Salons</h4>
              <p>Booking links, gallery, walk-in hours</p>
            </div>
            <div className="coming-soon-card reveal from-bottom">
              <div className="coming-soon-icon" aria-hidden="true">&#9749;</div>
              <h4>Cafes &amp; Bakeries</h4>
              <p>Menu, catering info, daily specials</p>
            </div>
            <div className="coming-soon-card reveal from-bottom">
              <div className="coming-soon-icon" aria-hidden="true">&#9881;</div>
              <h4>Auto &amp; Repair Shops</h4>
              <p>Services, pricing, appointment booking</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <ScrollReveal className="work-cta">
            <h2>Want your business on this page?</h2>
            <p>
              We&apos;ll build you a free prototype. If you love it, we&apos;ll make it live.
              If you don&apos;t, no hard feelings.
            </p>
            <MagneticButton href="/contact" className="btn btn-primary">
              Get a Free Prototype
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </MagneticButton>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
