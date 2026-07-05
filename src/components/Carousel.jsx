'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { assetPath } from '@/lib/assetPath';
import { projects } from '@/data/projects';
import { createCarouselEngine, getRelativeIndex, isMobileViewport } from '@/lib/carouselEngine';
import { extractMutedTone } from '@/lib/extractImageTone';
import Card from './Card';
import DetailOverlay from './DetailOverlay';
import styles from './Carousel.module.css';

const DEFAULT_GLOW = { r: 154, g: 148, b: 136 };

export default function Carousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [cardRect, setCardRect] = useState(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [dimmed, setDimmed] = useState(false);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [glowTone, setGlowTone] = useState(DEFAULT_GLOW);

  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const engineRef = useRef(null);
  const dragMovedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const idleTimerRef = useRef(null);
  const glowToneRef = useRef(DEFAULT_GLOW);
  const glowAnimRef = useRef(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    const engine = createCarouselEngine(track, {
      onActiveIndex: setActiveIndex,
    });
    engineRef.current = engine;

    const markInteracting = () => {
      setInteracting(true);
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => setInteracting(false), 1800);
    };

    const onWheel = (e) => {
      markInteracting();
      engine.onWheel(e);
    };

    const onPointerDown = (e) => {
      markInteracting();
      dragMovedRef.current = false;
      dragStartXRef.current = e.clientX;
      engine.onPointerDown(e);
    };

    const onPointerMove = (e) => {
      if (!engine.isDragging()) return;
      if (Math.abs(e.clientX - dragStartXRef.current) > 6) {
        dragMovedRef.current = true;
      }
      engine.onPointerMove(e);
    };

    const onPointerUp = () => {
      engine.onPointerUp();
      setTimeout(() => {
        dragMovedRef.current = false;
      }, 0);
    };

    const onResize = () => {
      setIsMobile(isMobileViewport());
      engine.onResize();
    };

    onResize();
    stage.addEventListener('wheel', onWheel, { passive: false });
    stage.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(idleTimerRef.current);
      engine.stop();
      engineRef.current = null;
      stage.removeEventListener('wheel', onWheel);
      stage.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (isMobile) return undefined;

    let cancelled = false;
    const project = projects[activeIndex];
    if (!project) return undefined;

    extractMutedTone(assetPath(project.art)).then((target) => {
      if (cancelled) return;

      const start = { ...glowToneRef.current };
      const startTime = performance.now();
      const duration = 1200;

      const tick = (now) => {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = t * t * (3 - 2 * t);
        const next = {
          r: Math.round(start.r + (target.r - start.r) * eased),
          g: Math.round(start.g + (target.g - start.g) * eased),
          b: Math.round(start.b + (target.b - start.b) * eased),
        };
        glowToneRef.current = next;
        setGlowTone(next);
        if (t < 1) {
          glowAnimRef.current = requestAnimationFrame(tick);
        }
      };

      cancelAnimationFrame(glowAnimRef.current);
      glowAnimRef.current = requestAnimationFrame(tick);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(glowAnimRef.current);
    };
  }, [activeIndex, isMobile]);

  useEffect(() => {
    projects.forEach((project) => {
      extractMutedTone(assetPath(project.art));
    });
  }, []);

  const handleCardClick = useCallback((project, index, isMobileCard) => {
    if (dragMovedRef.current) return;

    if (!isMobileCard) {
      const engine = engineRef.current;
      if (!engine) return;
      const rel = getRelativeIndex(index, engine.getOffset(), projects.length);
      if (Math.abs(rel) > 0.55) return;
    }

    const el = document.querySelector(
      isMobileCard
        ? `[data-mobile-card="${index}"]`
        : `[data-carousel-index="${index}"]`
    );
    if (!el) return;

    const art = el.querySelector('[data-card-art]');
    engineRef.current?.setFrozen(true);
    window.dispatchEvent(
      new CustomEvent('portfolio:overlay', { detail: { open: true } })
    );

    setCardRect((art ?? el).getBoundingClientRect());
    setSelectedCardIndex(index);
    setSelectedProject(project);
    setOverlayOpen(true);
    setDimmed(true);
  }, []);

  const handleRevealCard = useCallback(() => {
    setCardRevealed(true);
  }, []);

  const handleClose = useCallback(() => {
    setOverlayOpen(false);
    setSelectedProject(null);
    setSelectedCardIndex(null);
    setCardRect(null);
    setDimmed(false);
    setCardRevealed(false);
    engineRef.current?.setFrozen(false);
    window.dispatchEvent(
      new CustomEvent('portfolio:overlay', { detail: { open: false } })
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${dimmed ? styles.sectionGlowHidden : ''}`}
      id="work"
      style={{
        '--glow-r': glowTone.r,
        '--glow-g': glowTone.g,
        '--glow-b': glowTone.b,
      }}
    >
      <div className={styles.floorGrid} aria-hidden="true" />
      <div className={styles.ambientGlow} aria-hidden="true" />

      <div
        ref={stageRef}
        className={`${styles.stage} ${dimmed ? styles.dimmed : ''} ${interacting ? styles.interacting : ''}`}
      >
        <div ref={trackRef} className={styles.track}>
          {projects.map((project, i) => (
            <Card
              key={project.id}
              project={project}
              isActive={activeIndex === i}
              carouselIndex={i}
              concealed={overlayOpen && selectedCardIndex === i && !cardRevealed}
              onClick={() => handleCardClick(project, i, false)}
            />
          ))}
        </div>
      </div>

      <div className={styles.mobileTrack}>
        {projects.map((project, i) => (
            <Card
              key={`mobile-${project.id}`}
              project={project}
              isActive
              isMobile
              mobileIndex={i}
              concealed={overlayOpen && selectedCardIndex === i && !cardRevealed}
              onClick={() => handleCardClick(project, i, true)}
            />
        ))}
      </div>

      {selectedProject && (
        <DetailOverlay
          project={selectedProject}
          cardRect={cardRect}
          cardIndex={selectedCardIndex}
          isOpen={overlayOpen}
          onRevealCard={handleRevealCard}
          onClose={handleClose}
          isMobile={isMobile}
        />
      )}
    </section>
  );
}
