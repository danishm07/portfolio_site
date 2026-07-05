'use client';

import { useState } from 'react';
import { assetPath } from '@/lib/assetPath';
import styles from './Card.module.css';

export default function Card({
  project,
  isActive,
  onClick,
  className,
  isMobile,
  carouselIndex,
  mobileIndex,
  concealed,
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <article
      data-carousel-index={isMobile ? undefined : carouselIndex}
      data-mobile-card={isMobile ? mobileIndex : undefined}
      className={`${styles.card} ${isActive ? styles.active : ''} ${concealed ? styles.concealed : ''} ${className || ''}`}
      style={isMobile ? { opacity: 1 } : undefined}
      onClick={() => onClick?.()}
      role="button"
      tabIndex={isActive ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`View ${project.title}`}
    >
      <div className={styles.inner}>
        <div className={styles.art} data-card-art>
          {!imgError ? (
            <img
              src={assetPath(project.art)}
              alt=""
              className={styles.artImage}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={styles.artPlaceholder}>
              <span className={styles.placeholderNo}>{project.no}</span>
            </div>
          )}
        </div>
        <div className={styles.divider} />
        <div className={styles.info}>
          <span className={styles.catalogueNo}>Cat. no. {project.no}</span>
          <h3 className={styles.title}>{project.title}</h3>
          <p className={styles.medium}>{project.medium}</p>
        </div>
      </div>
    </article>
  );
}
