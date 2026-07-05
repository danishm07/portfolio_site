'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Nav.module.css';

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/danishmohammed' },
  { label: 'Resume', href: '/resume.pdf' },
  { label: 'Email', href: 'mailto:danish@example.com' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}
    >
      <div className={styles.right}>
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={styles.link}
            data-nav-item
            target={link.href.startsWith('http') ? '_blank' : undefined}
            rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
