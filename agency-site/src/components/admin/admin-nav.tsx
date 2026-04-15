'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SignOutButton from '@/components/sign-out-button';

interface AdminNavProps {
  userEmail: string;
}

export default function AdminNav({ userEmail }: AdminNavProps) {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/scraping', label: 'Scraping' },
  ];

  return (
    <div className="admin-nav">
      <div className="container">
        <div className="admin-nav-inner">
          <div className="admin-nav-links">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`admin-nav-link${pathname === link.href ? ' active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="admin-nav-user">
            <span className="admin-nav-email">{userEmail}</span>
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
