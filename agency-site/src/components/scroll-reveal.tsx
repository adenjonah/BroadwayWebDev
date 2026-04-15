'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  direction?: 'from-bottom' | 'from-left' | 'from-right' | 'from-scale';
  stagger?: boolean;
}

export default function ScrollReveal({
  children,
  className = '',
  direction = 'from-bottom',
  stagger = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    if (stagger) {
      el.querySelectorAll('.reveal').forEach((child) => observer.observe(child));
    } else {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [stagger]);

  if (stagger) {
    return (
      <div ref={ref} className={`stagger ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={`reveal ${direction} ${className}`}>
      {children}
    </div>
  );
}
