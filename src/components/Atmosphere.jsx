'use client';

import { useEffect, useRef, useState } from 'react';
import { initCursorHalftone } from '@/lib/cursorHalftone';
import styles from './Atmosphere.module.css';

function isMobileViewport() {
  return window.innerWidth <= 767;
}

export default function Atmosphere() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const onResize = () => setEnabled(!isMobileViewport());
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!enabled || !canvasRef.current) return undefined;

    engineRef.current = initCursorHalftone(canvasRef.current);
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    const onOverlay = (e) => {
      engineRef.current?.setFaded(Boolean(e.detail?.open));
    };
    window.addEventListener('portfolio:overlay', onOverlay);
    return () => window.removeEventListener('portfolio:overlay', onOverlay);
  }, []);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      aria-hidden="true"
    />
  );
}
