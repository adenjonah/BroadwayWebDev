import Link from 'next/link';
import ScrollReveal from '@/components/scroll-reveal';
import MagneticButton from '@/components/magnetic-button';
import '@/styles/home.css';

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-grid-lines"></div>
          <div className="hero-bg-gradient"></div>
          <div className="hero-bg-gradient-2"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" aria-hidden="true"></span>
              NYC Web Agency
            </div>
            <h1>
              <span className="line"><span>Your business</span></span>
              <span className="line"><span>deserves to be</span></span>
              <span className="line"><span className="text-gradient">found online.</span></span>
            </h1>
            <p className="hero-sub">
              We build fast, beautiful websites for NYC small businesses &mdash;
              delis, barbershops, restaurants, salons. We&apos;ll build your site
              and show it to you before you spend a dime.
            </p>
            <div className="hero-actions">
              <MagneticButton href="/contact" className="btn btn-primary">
                Get a Free Prototype
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </MagneticButton>
              <Link href="/work" className="btn btn-outline">See Our Work</Link>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section" id="services">
        <div className="container">
          <ScrollReveal><span className="section-label">What We Do</span></ScrollReveal>
          <ScrollReveal><h2 className="section-heading">Everything you need.<br />Nothing you don&apos;t.</h2></ScrollReveal>
          <ScrollReveal><p className="section-desc">We handle design, content, and hosting. You focus on running your business.</p></ScrollReveal>
          <ScrollReveal stagger className="services-grid">
            <div className="service-card reveal from-bottom">
              <div className="service-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
              </div>
              <h3>Landing Pages</h3>
              <p>Beautiful, fast single-page sites that tell your story and bring customers through the door. Our bread and butter.</p>
            </div>
            <div className="service-card reveal from-bottom">
              <div className="service-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
              </div>
              <h3>Multi-Page Sites</h3>
              <p>Need more than a landing page? We build full sites with dedicated pages for menus, services, galleries, and more.</p>
            </div>
            <div className="service-card reveal from-bottom">
              <div className="service-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
              </div>
              <h3>Photo &amp; Video</h3>
              <p>We send a photographer to your location to capture your business at its best. Use the content on your site and social media.</p>
            </div>
            <div className="service-card reveal from-bottom">
              <div className="service-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              <h3>Dedicated Editor</h3>
              <p>Need to update your hours, menu, or photos? Just email us. Our editor makes every change within 24 hours &mdash; you never touch a thing.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="container"><div className="divider-gradient"></div></div>

      {/* PROCESS */}
      <section className="section" id="process">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
            <ScrollReveal><span className="section-label">How It Works</span></ScrollReveal>
            <ScrollReveal><h2 className="section-heading">From zero to live<br />in four steps.</h2></ScrollReveal>
            <ScrollReveal><p className="section-desc" style={{ margin: '0 auto var(--space-lg)' }}>We take on all the risk. You only commit if you love what you see.</p></ScrollReveal>
          </div>
          <ScrollReveal stagger className="process-track">
            <div className="process-step reveal from-bottom">
              <div className="process-num">01</div>
              <h3>We Find You &amp; Build</h3>
              <p>We find great businesses without a website and build a real, working prototype before we ever reach out.</p>
            </div>
            <div className="process-step reveal from-bottom">
              <div className="process-num">02</div>
              <h3>We Call You</h3>
              <p>We reach out to show you what we&apos;ve built. No pitch deck &mdash; just your business, already looking great online.</p>
            </div>
            <div className="process-step reveal from-bottom">
              <div className="process-num">03</div>
              <h3>You Review It</h3>
              <p>We walk through the site together. You give feedback, we dial it in until it&apos;s exactly right.</p>
            </div>
            <div className="process-step reveal from-bottom">
              <div className="process-num">04</div>
              <h3>We Go Live</h3>
              <p>We launch your site, point your domain, and handle everything from there. You&apos;re online with ongoing support.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="container"><div className="divider-gradient"></div></div>

      {/* FEATURED WORK */}
      <section className="section" id="work">
        <div className="container">
          <div className="featured-project">
            <ScrollReveal direction="from-left" className="featured-project-visual">
              <div className="featured-project-visual-inner">
                <div className="featured-project-visual-logo">Haji&apos;s Famous Deli</div>
                <div className="featured-project-visual-sub">Morningside Heights, NYC</div>
              </div>
              <div className="featured-project-visual-bar" aria-hidden="true"></div>
            </ScrollReveal>
            <ScrollReveal direction="from-right" className="featured-project-info">
              <span className="section-label">Featured Project</span>
              <h3>Haji&apos;s Famous Deli</h3>
              <p>
                Home of the original chopped cheese. A complete marketing site
                with menu, reviews, location, and online ordering &mdash; built
                to bring Morningside Heights&apos; favorite deli to the web.
              </p>
              <div className="featured-project-tags">
                <span className="tag">Restaurant</span>
                <span className="tag">Menu</span>
                <span className="tag">Reviews</span>
                <span className="tag">SEO</span>
              </div>
              <a href="https://hajis-famous-deli.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                View Live Site
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10" /></svg>
              </a>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <div className="container"><div className="divider-gradient"></div></div>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <ScrollReveal direction="from-scale" className="cta-banner">
            <div className="cta-banner-glow" aria-hidden="true"></div>
            <div className="cta-banner-content">
              <h2>Ready to see your business online?</h2>
              <p>
                We&apos;ll build a free prototype of your site &mdash; no commitment,
                no pressure. If you love it, we&apos;ll launch it.
              </p>
              <MagneticButton href="/contact" className="btn btn-primary">
                Let&apos;s Talk
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
