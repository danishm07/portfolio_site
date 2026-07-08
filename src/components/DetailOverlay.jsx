'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import {
  EASE_CLOSE,
  EASE_OPEN,
  OVERLAY_BACKDROP_FADE,
  OVERLAY_MORPH_CLOSE,
  OVERLAY_MORPH_OPEN,
  OVERLAY_PANEL_DELAY,
  OVERLAY_PANEL_FADE,
} from '@/lib/motion';
import { artPath, assetPath, openPdfPopup } from '@/lib/assetPath';
import styles from './DetailOverlay.module.css';

function rectToTransform(rect) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  return {
    x: cx - vw / 2,
    y: cy - vh / 2,
    scaleX: rect.width / vw,
    scaleY: rect.height / vh,
  };
}

function getCardElement(cardIndex, isMobile) {
  const selectors = [
    `[data-mobile-card="${cardIndex}"]`,
    `[data-grid-card="${cardIndex}"]`,
    `[data-carousel-index="${cardIndex}"]`,
  ];
  if (!isMobile) {
    selectors.reverse();
  }
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}

function getFreshArtRect(cardIndex, isMobile) {
  const card = getCardElement(cardIndex, isMobile);
  const art = card?.querySelector('[data-card-art]');
  return (art ?? card)?.getBoundingClientRect() ?? null;
}

function applyMorphTransform(el, rect) {
  gsap.set(el, {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    transformOrigin: '50% 50%',
    ...rectToTransform(rect),
    force3D: true,
  });
}

function renderEmphasis(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderAboutBody(body, styles) {
  const paragraphs = body.split(/\n\n+/).filter(Boolean);
  return (
    <div className={styles.aboutBody}>
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 24)} className={`${styles.body} serifBlock`}>
          {renderEmphasis(paragraph)}
        </p>
      ))}
    </div>
  );
}

function renderProjectBody(body, writeup, styles) {
  const bodyClass = `${styles.body} serifBlock`;

  if (!writeup) {
    return <p className={bodyClass}>{body}</p>;
  }

  const splitIndex = body.indexOf('\n\n');
  if (splitIndex === -1) {
    return <p className={bodyClass}>{body}</p>;
  }

  const lead = body.slice(0, splitIndex);
  const rest = body.slice(splitIndex + 2);

  return (
    <>
      <p className={bodyClass}>{lead}</p>
      <p className={styles.writeupCta}>
        <a
          href={writeup}
          className={styles.writeupCtaLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the full writeup →
        </a>
      </p>
      {rest && <p className={bodyClass}>{rest}</p>}
    </>
  );
}

export default function DetailOverlay({
  project,
  cardRect,
  cardIndex,
  isOpen,
  onClose,
  onRevealCard,
  isMobile,
}) {
  const overlayRef = useRef(null);
  const backdropRef = useRef(null);
  const morphRef = useRef(null);
  const panelRef = useRef(null);
  const artSectionRef = useRef(null);
  const timelineRef = useRef(null);
  const closingRef = useRef(false);
  const openedRef = useRef(false);
  const openStartedRef = useRef(false);
  const cardArtRectRef = useRef(null);
  const touchStartYRef = useRef(null);
  const [imgError, setImgError] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isAbout = project.id === 'about';

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    setImgError(false);
    openedRef.current = false;
    openStartedRef.current = false;
  }, [project.id]);

  useEffect(() => {
    if (isOpen) return;
    openedRef.current = false;
    openStartedRef.current = false;
  }, [isOpen]);

  const killTimeline = () => {
    timelineRef.current?.kill();
    timelineRef.current = null;
  };

  useEffect(() => killTimeline, []);

  const resolveCardRect = useCallback(() => {
    const fresh =
      cardIndex != null ? getFreshArtRect(cardIndex, isMobile) : null;
    return fresh ?? cardArtRectRef.current ?? cardRect ?? null;
  }, [cardIndex, cardRect, isMobile]);

  const finishClose = useCallback(() => {
    closingRef.current = false;
    onRevealCard?.();
    onClose();
  }, [onClose, onRevealCard]);

  const showPanelFallback = useCallback(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const morph = morphRef.current;
    if (!panel || !backdrop) return;

    killTimeline();
    openStartedRef.current = true;
    if (morph) {
      gsap.set(morph, { opacity: 0, display: 'none', clearProps: 'transform' });
    }
    gsap.set(backdrop, { opacity: 1 });
    gsap.set(panel, { opacity: 1 });
    if (isMobile && overlayRef.current) {
      gsap.set(overlayRef.current, { y: 0, clearProps: 'transform' });
    }
    openedRef.current = true;
  }, [isMobile]);

  const runDesktopOpen = useCallback(() => {
    const morph = morphRef.current;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const artSection = artSectionRef.current;
    if (!morph || !panel || !backdrop || !artSection) return false;

    const startRect = resolveCardRect();

    killTimeline();
    closingRef.current = false;
    openedRef.current = false;

    if (!startRect) {
      gsap.set(morph, { opacity: 0, display: 'none', clearProps: 'transform' });
      gsap.set(backdrop, { opacity: 0 });
      gsap.set(panel, { opacity: 0 });
      const tl = gsap.timeline({
        onComplete: () => {
          openedRef.current = true;
        },
      });
      timelineRef.current = tl;
      tl.to(backdrop, { opacity: 1, duration: OVERLAY_BACKDROP_FADE, ease: 'power2.out' }, 0);
      tl.to(panel, { opacity: 1, duration: OVERLAY_PANEL_FADE, ease: 'power3.out' }, 0.1);
      return true;
    }

    cardArtRectRef.current = startRect;

    const endRect = artSection.getBoundingClientRect();
    if (!endRect.width || !endRect.height) return false;

    gsap.set(morph, { opacity: 1, display: 'block' });
    applyMorphTransform(morph, startRect);
    gsap.set(panel, { opacity: 0 });
    gsap.set(backdrop, { opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        openedRef.current = true;
      },
    });
    timelineRef.current = tl;

    tl.to(
      morph,
      {
        ...rectToTransform(endRect),
        duration: OVERLAY_MORPH_OPEN,
        ease: EASE_OPEN,
        force3D: true,
      },
      0
    );
    tl.to(
      backdrop,
      { opacity: 1, duration: OVERLAY_BACKDROP_FADE, ease: 'power2.out' },
      0.08
    );
    tl.to(
      panel,
      { opacity: 1, duration: OVERLAY_PANEL_FADE, ease: 'power3.out' },
      OVERLAY_MORPH_OPEN * OVERLAY_PANEL_DELAY
    );
    tl.set(morph, { opacity: 0, display: 'none' }, OVERLAY_MORPH_OPEN);

    return true;
  }, [resolveCardRect]);

  const runDesktopClose = useCallback(() => {
    const morph = morphRef.current;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const artSection = artSectionRef.current;
    if (!morph || !panel || !backdrop || !artSection) {
      finishClose();
      return;
    }

    const startRect = resolveCardRect();
    if (!startRect) {
      killTimeline();
      closingRef.current = true;
      openedRef.current = false;
      const tl = gsap.timeline({ onComplete: finishClose });
      timelineRef.current = tl;
      tl.to(panel, { opacity: 0, duration: OVERLAY_MORPH_CLOSE, ease: EASE_CLOSE }, 0);
      tl.to(backdrop, { opacity: 0, duration: OVERLAY_MORPH_CLOSE, ease: 'power2.inOut' }, 0);
      return;
    }

    cardArtRectRef.current = startRect;
    const endRect = artSection.getBoundingClientRect();

    killTimeline();
    closingRef.current = true;
    openedRef.current = false;

    gsap.set(morph, { display: 'block', opacity: 1 });
    applyMorphTransform(morph, endRect);
    gsap.set(panel, { opacity: 0 });
    gsap.set(backdrop, { opacity: 1 });

    const tl = gsap.timeline({ onComplete: finishClose });
    timelineRef.current = tl;

    tl.to(backdrop, { opacity: 0, duration: OVERLAY_MORPH_CLOSE, ease: 'power2.inOut' }, 0);
    tl.to(
      morph,
      {
        ...rectToTransform(startRect),
        duration: OVERLAY_MORPH_CLOSE,
        ease: EASE_CLOSE,
        force3D: true,
      },
      0
    );
    tl.set(morph, { opacity: 0, display: 'none', clearProps: 'transform' }, OVERLAY_MORPH_CLOSE);
  }, [finishClose, resolveCardRect]);

  const runMobileOpen = useCallback(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!overlay || !panel || !backdrop) return false;

    killTimeline();
    closingRef.current = false;
    openedRef.current = false;

    gsap.set(backdrop, { opacity: 1 });
    gsap.set(panel, { opacity: 0 });
    gsap.set(overlay, { y: '100%', x: 0, force3D: true });

    const tl = gsap.timeline({
      onComplete: () => {
        openedRef.current = true;
      },
    });
    timelineRef.current = tl;
    openStartedRef.current = true;

    tl.to(overlay, { y: 0, duration: 0.4, ease: EASE_OPEN, force3D: true }, 0);
    tl.to(panel, { opacity: 1, duration: OVERLAY_PANEL_FADE, ease: 'power2.out' }, 0.1);

    return true;
  }, []);

  const runMobileClose = useCallback(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!overlay || !panel) {
      finishClose();
      return;
    }

    killTimeline();
    closingRef.current = true;
    openedRef.current = false;

    const tl = gsap.timeline({ onComplete: finishClose });
    timelineRef.current = tl;

    tl.to(panel, { opacity: 0, duration: 0.12, ease: 'power2.out' }, 0);
    tl.to(
      overlay,
      { y: '100%', duration: 0.4, ease: EASE_CLOSE, force3D: true },
      0
    );
    if (backdrop) {
      tl.to(backdrop, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0);
    }
  }, [finishClose]);

  const runOpen = useCallback(() => {
    if (isMobile) return runMobileOpen();
    return runDesktopOpen();
  }, [isMobile, runDesktopOpen, runMobileOpen]);

  const tryOpen = useCallback(() => {
    const started = runOpen();
    openStartedRef.current = started;
    return started;
  }, [runOpen]);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    if (isMobile) {
      runMobileClose();
    } else {
      runDesktopClose();
    }
  }, [isMobile, runDesktopClose, runMobileClose]);

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === backdropRef.current) handleClose();
    },
    [handleClose]
  );

  const handleTouchStart = useCallback((e) => {
    touchStartYRef.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (touchStartYRef.current == null) return;
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
      touchStartYRef.current = null;
      if (deltaY > 80) handleClose();
    },
    [handleClose]
  );

  useLayoutEffect(() => {
    if (!mounted || !isOpen) return;
    if (!isMobile && !cardRect && cardIndex == null) return;

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        tryOpen();
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [mounted, isOpen, cardRect, cardIndex, isMobile, tryOpen]);

  useEffect(() => {
    if (!mounted || !isOpen) return undefined;

    const timer = window.setTimeout(() => {
      if (!openStartedRef.current && !closingRef.current) {
        showPanelFallback();
      }
    }, 150);

    return () => window.clearTimeout(timer);
  }, [isOpen, mounted, showPanelFallback]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleClose]);

  if (!mounted) return null;

  const overlay = (
    <div
      ref={overlayRef}
      className={`${styles.overlay} ${isMobile ? styles.overlayMobile : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      <div
        ref={backdropRef}
        className={styles.backdrop}
        aria-hidden="true"
        onClick={handleBackdropClick}
      />

      <div ref={panelRef} className={styles.panel}>
        {isMobile && <div className={styles.dragHandle} aria-hidden="true" />}

        <div className={styles.navStrip}>
          <button type="button" className={styles.closeBtn} onClick={handleClose}>
            ✕ Close
          </button>
          {!isAbout && (project.writeup || project.github) && (
            <div className={styles.navLinks}>
              {project.writeup && (
                <a
                  href={project.writeup}
                  className={styles.writeupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Writeup ↗
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  className={styles.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub ↗
                </a>
              )}
            </div>
          )}
        </div>

        <div
          ref={artSectionRef}
          className={`${styles.artSection} ${isAbout ? styles.artSectionAbout : ''}`}
        >
          {!imgError ? (
            <img
              src={artPath(project.art)}
              alt=""
              className={`${styles.artImage} halftoneArt`}
              onError={() => setImgError(true)}
              draggable={false}
            />
          ) : (
            <div className={styles.artPlaceholder} />
          )}
        </div>

        <div className={styles.divider} />

        <div className={styles.content}>
          {isAbout ? (
            <>
              <h2 className={`${styles.aboutTitle} serifBlock`}>{project.title}</h2>
              <div className={styles.contentRule} />
              {renderAboutBody(project.body, styles)}
              <div className={styles.contentRule} />
              <div className={styles.aboutMeta}>
                <p>Illinois Institute of Technology · BS CS · Dec 2027</p>
                <p>YC Startup School · Summer 2026</p>
                <p>Chicago, IL</p>
              </div>
              <div className={styles.aboutLinks}>
                {project.links?.map((link) => (
                  <a
                    key={link.label}
                    href={link.url.startsWith('/') ? assetPath(link.url) : link.url}
                    className={styles.aboutLink}
                    onClick={(event) => {
                      if (link.label === 'Resume') {
                        openPdfPopup(event, link.url);
                      }
                    }}
                    target={link.url.startsWith('http') ? '_blank' : undefined}
                    rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className={styles.catalogueNo}>Cat. no. {project.no}</p>
              <h2 className={`${styles.title} serifBlock`}>{project.title}</h2>
              <p className={styles.medium}>{project.medium}</p>
              {project.role && <p className={styles.role}>{project.role}</p>}
              {project.period && <p className={styles.period}>{project.period}</p>}
              <div className={styles.contentRule} />
              {renderProjectBody(project.body, project.writeup, styles)}
              <div className={styles.contentRule} />
              {project.tech && (
                <div className={styles.tech}>
                  {project.tech.map((t) => (
                    <span key={t} className={styles.chip}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!isMobile && (
        <div ref={morphRef} className={styles.morphShell} aria-hidden="true">
          {!imgError ? (
            <img src={artPath(project.art)} alt="" className={`${styles.morphImage} halftoneArt`} draggable={false} />
          ) : (
            <div className={styles.morphPlaceholder} />
          )}
        </div>
      )}
    </div>
  );

  return createPortal(overlay, document.body);
}
