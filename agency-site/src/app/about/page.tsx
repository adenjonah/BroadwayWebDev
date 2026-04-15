import type { Metadata } from 'next';
import Link from 'next/link';
import ScrollReveal from '@/components/scroll-reveal';
import CounterAnimation from '@/components/counter-animation';
import MagneticButton from '@/components/magnetic-button';
import '@/styles/about.css';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Broadway Web Dev is a NYC web agency that builds marketing websites for small businesses. Learn about our story and approach.',
};

export default function AboutPage() {
  return (
    <>
      {/* PAGE HERO */}
      <section className="page-hero">
        <div className="page-hero-glow" aria-hidden="true"></div>
        <div className="container">
          <div className="page-hero-content">
            <span className="section-label">About Us</span>
            <h1>We build for the<br />businesses you walk<br />past every day.</h1>
            <p>
              Broadway Web Dev is a NYC web agency focused on one thing:
              giving small businesses the web presence they deserve.
            </p>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="story-grid">
            <ScrollReveal direction="from-left" className="story-text">
              <h2>The short version.</h2>
              <p>
                Most small businesses in New York don&apos;t have a website. Not because
                they don&apos;t want one &mdash; because the process is confusing, expensive,
                and full of people trying to sell them things they don&apos;t need.
              </p>
              <p>
                We started Broadway Web Dev to fix that. We find businesses that
                should be online, build them a real website as a prototype,
                and reach out to show them what we&apos;ve made. No cold pitch &mdash;
                just their business, already looking great.
              </p>
              <p>
                No templates. No drag-and-drop builders. No 6-week timelines.
                Just fast, clean, custom websites that help your neighbors find you
                on Google &mdash; with a dedicated editor on staff to keep everything
                up to date so you never have to.
              </p>
            </ScrollReveal>
            <ScrollReveal stagger className="story-stats">
              <div className="stat-card reveal from-right">
                <CounterAnimation target={3} className="stat-num" />
                <div className="stat-label">Days average<br />turnaround</div>
              </div>
              <div className="stat-card reveal from-right">
                <div className="stat-num">$0</div>
                <div className="stat-label">Cost to see<br />your prototype</div>
              </div>
              <div className="stat-card reveal from-right">
                <div className="stat-num">&lt;24h</div>
                <div className="stat-label">Turnaround on<br />any site update</div>
              </div>
              <div className="stat-card reveal from-right">
                <div className="stat-num">NYC</div>
                <div className="stat-label">Based &amp; focused<br />right here</div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <div className="container"><div className="divider-gradient"></div></div>

      {/* VALUES */}
      <section className="section">
        <div className="container">
          <ScrollReveal><span className="section-label">What We Believe</span></ScrollReveal>
          <ScrollReveal><h2 className="section-heading">Built different on purpose.</h2></ScrollReveal>
          <ScrollReveal><p className="section-desc">These aren&apos;t slogans. They&apos;re the rules we actually follow.</p></ScrollReveal>
          <ScrollReveal stagger className="values-grid">
            <div className="value-card reveal from-bottom">
              <div className="value-num">01</div>
              <h3>Show, Don&apos;t Sell</h3>
              <p>We build first, talk later. If the prototype doesn&apos;t speak for itself, we haven&apos;t done our job.</p>
            </div>
            <div className="value-card reveal from-bottom">
              <div className="value-num">02</div>
              <h3>Speed Is Respect</h3>
              <p>Small business owners don&apos;t have time for a 6-week design process. We move fast because your time matters.</p>
            </div>
            <div className="value-card reveal from-bottom">
              <div className="value-num">03</div>
              <h3>Local First</h3>
              <p>We know NYC. The neighborhoods, the culture, the kind of customer walking past your door. That context is in every site we build.</p>
            </div>
            <div className="value-card reveal from-bottom">
              <div className="value-num">04</div>
              <h3>You Run Your Business</h3>
              <p>Need something changed on your site? Email us. Our dedicated editor handles every update within 24 hours. You never touch the backend.</p>
            </div>
            <div className="value-card reveal from-bottom">
              <div className="value-num">05</div>
              <h3>Own Your Presence</h3>
              <p>A Yelp page isn&apos;t a website. We build something you actually own &mdash; your domain, your brand, your corner of the internet.</p>
            </div>
            <div className="value-card reveal from-bottom">
              <div className="value-num">06</div>
              <h3>Keep It Running</h3>
              <p>Launch is just the start. We handle hosting, updates, and ongoing support so your site stays fast and live without any effort on your end.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="container"><div className="divider-gradient"></div></div>

      {/* APPROACH */}
      <section className="section approach-section">
        <div className="container">
          <ScrollReveal><span className="section-label">Our Approach</span></ScrollReveal>
          <ScrollReveal><h2 className="section-heading">How we actually work.</h2></ScrollReveal>
          <ScrollReveal><p className="section-desc">No mystery. No drawn-out process. Here&apos;s exactly what working with us looks like.</p></ScrollReveal>
          <ScrollReveal stagger className="approach-steps">
            <div className="approach-step reveal from-bottom">
              <div className="approach-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              </div>
              <h3>We Research You</h3>
              <p>We pull your Google Maps listing, reviews, menu, hours &mdash; everything public. We learn your business before we touch a line of code.</p>
            </div>
            <div className="approach-step reveal from-bottom">
              <div className="approach-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
              </div>
              <h3>We Build Custom</h3>
              <p>Every site is hand-coded. No WordPress, no Squarespace, no drag-and-drop builders. Real code, real performance, real results.</p>
            </div>
            <div className="approach-step reveal from-bottom">
              <div className="approach-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <h3>We Keep It Live</h3>
              <p>Hosting on fast global infrastructure. SSL certificates. Automatic updates. You never think about the technical side again.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <ScrollReveal direction="from-scale" className="about-cta">
            <div className="about-cta-glow" aria-hidden="true"></div>
            <div className="about-cta-content">
              <h2>Like what you see?</h2>
              <p>
                Let us build a free prototype for your business.
                No strings. No commitment. Just a conversation.
              </p>
              <MagneticButton href="/contact" className="btn btn-primary">
                Get In Touch
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
