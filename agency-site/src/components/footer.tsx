import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <Link href="/" className="footer-brand">
            <img src="/logo.png" alt="Broadway Web Dev logo" />
            <div className="footer-brand-text">Broadway<span>.</span>web</div>
          </Link>
          <div className="footer-links">
            <Link href="/work">Work</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="footer-meta">&copy; 2026 Broadway Web Dev &middot; New York City</div>
        </div>
      </div>
    </footer>
  );
}
