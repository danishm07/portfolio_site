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
import { assetPath } from '@/lib/assetPath';
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
  return document.querySelector(
    isMobile
      ? `[data-mobile-card="${cardIndex}"]`
      : `[data-carousel-index="${cardIndex}"]`
  );
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
  const cardArtRectRef = useRef(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
    openedRef.current = false;
  }, [project.id]);

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

  const showPanelFallback = useCallback(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const morph = morphRef.current;
    if (!panel || !backdrop) return;

    killTimeline();
    gsap.set(morph, { opacity: 0, display: 'none', clearProps: 'transform' });
    gsap.set(backdrop, { opacity: 1 });
    gsap.set(panel, { opacity: 1 });
    openedRef.current = true;
  }, []);

  const runDesktopOpen = useCallback(() => {
    const morph = morphRef.current;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const artSection = artSectionRef.current;
    if (!morph || !panel || !backdrop || !artSection) return false;

    const startRect = resolveCardRect();
    if (!startRect) return false;

    cardArtRectRef.current = startRect;
    const endRect = artSection.getBoundingClientRect();

    killTimeline();
    closingRef.current = false;
    openedRef.current = false;

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
      onClose();
      return;
    }

    const startRect = resolveCardRect();
    if (!startRect) {
      onClose();
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

    const tl = gsap.timeline({
      onComplete: () => {
        closingRef.current = false;
        gsap.set(morph, { opacity: 0, display: 'none', clearProps: 'transform' });
        gsap.set(backdrop, { clearProps: 'opacity' });
        gsap.set(panel, { clearProps: 'opacity' });
        onRevealCard?.();
        onClose();
      },
    });
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
  }, [onClose, onRevealCard, resolveCardRect]);

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

    tl.to(overlay, { y: 0, duration: OVERLAY_MORPH_OPEN, ease: EASE_OPEN, force3D: true }, 0);
    tl.to(panel, { opacity: 1, duration: OVERLAY_PANEL_FADE, ease: 'power2.out' }, 0.1);

    return true;
  }, []);

  const runMobileClose = useCallback(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!overlay || !panel) {
      onClose();
      return;
    }

    killTimeline();
    closingRef.current = true;
    openedRef.current = false;

    const tl = gsap.timeline({
      onComplete: () => {
        closingRef.current = false;
        gsap.set(overlay, { clearProps: 'transform' });
        gsap.set(panel, { clearProps: 'opacity' });
        if (backdrop) gsap.set(backdrop, { clearProps: 'opacity' });
        onClose();
      },
    });
    timelineRef.current = tl;

    tl.to(panel, { opacity: 0, duration: 0.12, ease: 'power2.out' }, 0);
    tl.to(overlay, { y: '100%', duration: OVERLAY_MORPH_CLOSE, ease: EASE_CLOSE, force3D: true }, 0);
    if (backdrop) {
      tl.to(backdrop, { opacity: 0, duration: OVERLAY_MORPH_CLOSE, ease: 'power2.in' }, 0);
    }
  }, [onClose]);

  const runOpen = useCallback(() => {
    if (isMobile) return runMobileOpen();
    return runDesktopOpen();
  }, [isMobile, runDesktopOpen, runMobileOpen]);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    if (isMobile) {
      runMobileClose();
    } else {
      runDesktopClose();
    }
  }, [isMobile, runDesktopClose, runMobileClose]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    if (!isMobile && !cardRect && cardIndex == null) return;
    runOpen();
  }, [isOpen, cardRect, cardIndex, isMobile, runOpen]);

  // Safety net: if open animation couldn't run (refs not ready on first paint), show content.
  useEffect(() => {
    if (!isOpen) return undefined;

    const timer = window.setTimeout(() => {
      if (!openedRef.current && !closingRef.current) {
        showPanelFallback();
      }
    }, 80);

    return () => window.clearTimeout(timer);
  }, [isOpen, showPanelFallback]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleClose]);

  const overlay = (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      <div ref={backdropRef} className={styles.backdrop} aria-hidden="true" />

      <div ref={panelRef} className={styles.panel}>
        <div className={styles.navStrip}>
          <button type="button" className={styles.closeBtn} onClick={handleClose}>
            ✕ Close
          </button>
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

        <div ref={artSectionRef} className={styles.artSection}>
          {!imgError ? (
            <img
              src={assetPath(project.art)}
              alt=""
              className={styles.artImage}
              onError={() => setImgError(true)}
              draggable={false}
            />
          ) : (
            <div className={styles.artPlaceholder} />
          )}
        </div>

        <div className={styles.divider} />

        <div className={styles.content}>
          <p className={styles.catalogueNo}>Cat. no. {project.no}</p>
          <h2 className={styles.title}>{project.title}</h2>
          <p className={styles.medium}>{project.medium}</p>
          <div className={styles.contentRule} />
          <p className={styles.body}>{project.body}</p>
          <div className={styles.tech}>
            {project.tech.map((t) => (
              <span key={t} className={styles.chip}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div ref={morphRef} className={styles.morphShell} aria-hidden="true">
        {!imgError ? (
          <img src={assetPath(project.art)} alt="" className={styles.morphImage} draggable={false} />
        ) : (
          <div className={styles.morphPlaceholder} />
        )}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
