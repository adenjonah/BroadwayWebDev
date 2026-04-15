'use client';

import { useState, type FormEvent } from 'react';

type FormState = 'idle' | 'sending' | 'success' | 'error';

export default function ContactForm() {
  const [state, setState] = useState<FormState>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState('sending');

    const form = e.currentTarget;

    try {
      const res = await fetch('https://formspree.io/f/mpqkzbon', {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        setState('success');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <div className="form-success" style={{ display: 'block' }}>
        <div className="form-success-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3>Message sent!</h3>
        <p>We&apos;ll be in touch within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Contact form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Your Name</label>
          <input type="text" id="name" name="name" placeholder="Maria Santos" autoComplete="name" required />
        </div>
        <div className="form-group">
          <label htmlFor="business">Business Name</label>
          <input type="text" id="business" name="business" placeholder="Santos Deli & Cafe" required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input type="tel" id="phone" name="phone" placeholder="(212) 555-0100" autoComplete="tel" />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" placeholder="maria@example.com" autoComplete="email" />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="type">Type of Business</label>
        <select id="type" name="type" defaultValue="">
          <option value="" disabled>Select one</option>
          <option>Restaurant / Deli</option>
          <option>Barbershop / Salon</option>
          <option>Cafe / Bakery</option>
          <option>Retail Store</option>
          <option>Auto / Repair Shop</option>
          <option>Professional Services</option>
          <option>Other</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="message">Anything else? (optional)</label>
        <textarea id="message" name="message" placeholder="Tell us about your business, what you're looking for, or just say hi." />
      </div>
      <button
        type="submit"
        className="form-submit"
        disabled={state === 'sending'}
        style={state === 'error' ? { background: '#ef4444' } : undefined}
      >
        {state === 'sending' ? 'Sending...' : state === 'error' ? 'Something went wrong. Try again.' : 'Send Message'}
      </button>
    </form>
  );
}
