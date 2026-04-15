import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import Nav from '@/components/nav';
import Footer from '@/components/footer';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Broadway Web Dev — Websites for NYC Small Businesses',
    template: '%s — Broadway Web Dev',
  },
  description:
    'Broadway Web Dev builds fast, beautiful marketing websites for NYC small businesses. We find you, build a free prototype, and get you online in days.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="grain">
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
