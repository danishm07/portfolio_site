import styles from './Footer.module.css';

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/danishmohammed' },
  { label: 'Resume', href: '/resume.pdf' },
  { label: 'Email', href: 'mailto:danish@example.com' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.left}>Chicago, IL · 2026</span>
      <div className={styles.center}>
        <div className={styles.rule} />
      </div>
      <div className={styles.right}>
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={styles.link}
            target={link.href.startsWith('http') ? '_blank' : undefined}
            rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
