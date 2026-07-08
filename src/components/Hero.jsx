'use client';

import { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';
import { initCursorCode } from '@/lib/cursorCode';
import styles from './Hero.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const contentRef = useRef(null);
  const cursorCodeRef = useRef(null);
  const scrollTriggerRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section) return;

    const isMobile = window.innerWidth <= 767;
    const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1199;

    if (canvasRef.current && !isMobile) {
      cursorCodeRef.current = initCursorCode(canvasRef.current, {
        revealRadius: isTablet ? 150 : 170,
        disabled: isMobile,
      });
    }

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        if (content) {
          content.style.opacity = String(1 - self.progress * 0.6);
        }
      },
    });

    return () => {
      cursorCodeRef.current?.destroy();
      scrollTriggerRef.current?.kill();
      if (content) content.style.opacity = '';
    };
  }, []);

  const handleAboutClick = () => {
    window.dispatchEvent(new CustomEvent('portfolio:open-about'));
  };

  return (
    <section ref={sectionRef} className={styles.hero} id="hero">
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div ref={contentRef} className={styles.content}>
        <h1 className={styles.name}>Danish Mohammed</h1>
        <div className={styles.rule} />
        <p className={styles.descriptor}>
          Chicago &nbsp;·&nbsp; IIT Dec 2027
        </p>
        <p className={styles.aboutTrigger}>
          <span className={styles.aboutSep}>— or —</span>{' '}
          <button type="button" className={styles.aboutLink} onClick={handleAboutClick}>
            &ldquo;About me&rdquo;
          </button>
        </p>
      </div>
    </section>
  );
}
