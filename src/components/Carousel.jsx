'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { artPath } from '@/lib/assetPath';
import { cards } from '@/data/projects';
import { createCarouselEngine, getRelativeIndex, isMobileViewport } from '@/lib/carouselEngine';
import { extractMutedTone } from '@/lib/extractImageTone';
import Card from './Card';
import DetailOverlay from './DetailOverlay';
import styles from './Carousel.module.css';

const DEFAULT_GLOW = { r: 154, g: 148, b: 136 };
const VIEW_STORAGE_KEY = 'portfolio-view';
const INITIAL_INDEX = 1;

function readStoredView() {
  if (typeof window === 'undefined') return 'carousel';
  const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
  return stored === 'grid' ? 'grid' : 'carousel';
}

export default function Carousel() {
  const [activeIndex, setActiveIndex] = useState(INITIAL_INDEX);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [cardRect, setCardRect] = useState(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [dimmed, setDimmed] = useState(false);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [glowTone, setGlowTone] = useState(DEFAULT_GLOW);
  const [viewMode, setViewMode] = useState('carousel');

  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const mobileTrackRef = useRef(null);
  const engineRef = useRef(null);
  const dragMovedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const idleTimerRef = useRef(null);
  const glowToneRef = useRef(DEFAULT_GLOW);
  const glowAnimRef = useRef(null);
  const mobileScrolledRef = useRef(false);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  useEffect(() => {
    setViewMode(readStoredView());
  }, []);

  useLayoutEffect(() => {
    if (viewMode !== 'carousel') {
      engineRef.current?.stop();
      engineRef.current = null;
      return undefined;
    }

    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return undefined;

    const engine = createCarouselEngine(track, {
      onActiveIndex: setActiveIndex,
      itemCount: cards.length,
      initialOffset: activeIndexRef.current,
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
    engine.paint();
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
  }, [viewMode]);

  useEffect(() => {
    if (!isMobile || mobileScrolledRef.current || viewMode !== 'carousel') return undefined;

    const track = mobileTrackRef.current;
    if (!track) return undefined;

    const scrollToInitial = () => {
      const card = track.querySelector(`[data-mobile-card="${INITIAL_INDEX}"]`);
      if (card) {
        const left = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
        track.scrollTo({ left, behavior: 'instant' in track ? 'instant' : 'auto' });
        mobileScrolledRef.current = true;
      }
    };

    const timer = window.setTimeout(scrollToInitial, 50);
    return () => window.clearTimeout(timer);
  }, [isMobile, viewMode]);

  useEffect(() => {
    if (isMobile || viewMode === 'grid') return undefined;

    let cancelled = false;
    const card = cards[activeIndex];
    if (!card) return undefined;

    extractMutedTone(artPath(card.art)).then((target) => {
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
  }, [activeIndex, isMobile, viewMode]);

  useEffect(() => {
    cards.forEach((card) => {
      extractMutedTone(artPath(card.art));
    });
  }, []);

  const getCardElement = useCallback((index, isMobileCard, isGridCard) => {
    if (isGridCard) {
      return document.querySelector(`[data-grid-card="${index}"]`);
    }
    if (isMobileCard) {
      return document.querySelector(`[data-mobile-card="${index}"]`);
    }
    return document.querySelector(`[data-carousel-index="${index}"]`);
  }, []);

  const handleCardClick = useCallback(
    (card, index, { isMobileCard = false, isGridCard = false } = {}) => {
      if (dragMovedRef.current) return;

      if (!isMobileCard && !isGridCard) {
        const engine = engineRef.current;
        if (!engine) return;
        const rel = getRelativeIndex(index, engine.getOffset(), cards.length);
        if (Math.abs(rel) > 0.55) return;
      }

      const el = getCardElement(index, isMobileCard, isGridCard);
      if (!el) return;

      const art = el.querySelector('[data-card-art]');
      engineRef.current?.setFrozen(true);
      window.dispatchEvent(
        new CustomEvent('portfolio:overlay', { detail: { open: true } })
      );

      setCardRect((art ?? el).getBoundingClientRect());
      setSelectedCardIndex(index);
      setSelectedCard(card);
      setOverlayOpen(true);
      setDimmed(true);
    },
    [getCardElement]
  );

  const handleRevealCard = useCallback(() => {
    setCardRevealed(true);
  }, []);

  const handleClose = useCallback(() => {
    setOverlayOpen(false);
    setSelectedCard(null);
    setSelectedCardIndex(null);
    setCardRect(null);
    setDimmed(false);
    setCardRevealed(false);
    engineRef.current?.setFrozen(false);
    window.dispatchEvent(
      new CustomEvent('portfolio:overlay', { detail: { open: false } })
    );
  }, []);

  const handleViewChange = useCallback((mode) => {
    if (mode === 'carousel') {
      mobileScrolledRef.current = false;
    }
    setViewMode(mode);
    window.localStorage.setItem(VIEW_STORAGE_KEY, mode);
  }, []);

  useEffect(() => {
    const openAbout = () => {
      const index = cards.findIndex((c) => c.id === 'about');
      if (index < 0) return;
      const isMobileCard = isMobileViewport();
      const isGridCard = readStoredView() === 'grid';
      handleCardClick(cards[index], index, { isMobileCard, isGridCard });
    };

    window.addEventListener('portfolio:open-about', openAbout);
    return () => window.removeEventListener('portfolio:open-about', openAbout);
  }, [handleCardClick]);

  const showCarousel = viewMode === 'carousel';

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
      <div className={styles.viewToggle}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.toggleActive : ''}`}
          onClick={() => handleViewChange('grid')}
        >
          ⊞ Grid
        </button>
        <span className={styles.toggleSep}> / </span>
        <button
          type="button"
          className={`${styles.toggleBtn} ${viewMode === 'carousel' ? styles.toggleActive : ''}`}
          onClick={() => handleViewChange('carousel')}
        >
          ◎ Carousel
        </button>
      </div>

      {showCarousel && (
        <>
          <div className={styles.floorGrid} aria-hidden="true" />
          <div className={styles.ambientGlow} aria-hidden="true" />

          <div
            ref={stageRef}
            className={`${styles.stage} ${dimmed ? styles.dimmed : ''} ${interacting ? styles.interacting : ''}`}
          >
            <div ref={trackRef} className={styles.track}>
              {cards.map((card, i) => (
                <Card
                  key={card.id}
                  project={card}
                  isActive={activeIndex === i}
                  carouselIndex={i}
                  concealed={overlayOpen && selectedCardIndex === i && !cardRevealed}
                  onClick={() => handleCardClick(card, i)}
                />
              ))}
            </div>
          </div>

          <div ref={mobileTrackRef} className={styles.mobileTrack}>
            {cards.map((card, i) => (
              <Card
                key={`mobile-${card.id}`}
                project={card}
                isActive
                isMobile
                mobileIndex={i}
                concealed={overlayOpen && selectedCardIndex === i && !cardRevealed}
                onClick={() => handleCardClick(card, i, { isMobileCard: true })}
              />
            ))}
          </div>
        </>
      )}

      {!showCarousel && (
        <div className={styles.gridView}>
          {cards.map((card, i) => (
            <Card
              key={`grid-${card.id}`}
              project={card}
              isActive
              isGrid
              carouselIndex={i}
              concealed={overlayOpen && selectedCardIndex === i && !cardRevealed}
              onClick={() => handleCardClick(card, i, { isGridCard: true })}
            />
          ))}
        </div>
      )}

      {selectedCard && overlayOpen && (
        <DetailOverlay
          project={selectedCard}
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
