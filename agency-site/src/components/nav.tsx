'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = '';
  };

  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    document.body.style.overflow = next ? 'hidden' : '';
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`} aria-label="Site navigation">
        <div className="nav-inner">
          <Link href="/" className="nav-brand">
            <img src="/logo.png" alt="Broadway Web Dev logo" />
            <div className="nav-brand-text">Broadway<span>.</span>web</div>
          </Link>
          <div className="nav-links">
            <Link href="/" className={`nav-link${isActive('/') ? ' active' : ''}`}>Home</Link>
            <Link href="/work" className={`nav-link${isActive('/work') ? ' active' : ''}`}>Work</Link>
            <Link href="/about" className={`nav-link${isActive('/about') ? ' active' : ''}`}>About</Link>
            <Link href="/contact" className="nav-cta">Get Started</Link>
          </div>
          <button
            className={`nav-toggle${menuOpen ? ' open' : ''}`}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={toggleMenu}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <div className={`nav-mobile${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <Link href="/" onClick={closeMenu}>Home</Link>
        <Link href="/work" onClick={closeMenu}>Work</Link>
        <Link href="/about" onClick={closeMenu}>About</Link>
        <Link href="/contact" onClick={closeMenu}>Contact</Link>
      </div>
    </>
  );
}
