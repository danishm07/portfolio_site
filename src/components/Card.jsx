'use client';

import { useState } from 'react';
import { artPath } from '@/lib/assetPath';
import styles from './Card.module.css';

export default function Card({
  project,
  isActive,
  onClick,
  className,
  isMobile,
  isGrid,
  carouselIndex,
  mobileIndex,
  concealed,
}) {
  const [imgError, setImgError] = useState(false);
  const isAbout = project.id === 'about';
  const hasCardLinks = project.writeup || project.github;

  const stopCardClick = (e) => e.stopPropagation();

  return (
    <article
      data-carousel-index={isMobile || isGrid ? undefined : carouselIndex}
      data-mobile-card={isMobile ? mobileIndex : undefined}
      data-grid-card={isGrid ? carouselIndex : undefined}
      className={`${styles.card} ${isActive ? styles.active : ''} ${concealed ? styles.concealed : ''} ${isGrid ? styles.gridCard : ''} ${className || ''}`}
      style={isMobile || isGrid ? { opacity: 1 } : undefined}
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
              src={artPath(project.art)}
              alt=""
              className={`${styles.artImage} halftoneArt`}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={styles.artPlaceholder}>
              {project.no && (
                <span className={styles.placeholderNo}>{project.no}</span>
              )}
            </div>
          )}
        </div>
        <div className={styles.divider} />
        <div className={styles.info}>
          {project.no && (
            <span className={styles.catalogueNo}>Cat. no. {project.no}</span>
          )}
          <h3 className={`${styles.title} serifBlock ${isAbout ? styles.aboutTitle : ''}`}>
            {project.title}
          </h3>
          {project.medium && <p className={styles.medium}>{project.medium}</p>}
          {hasCardLinks && (
            <div className={styles.cardLinks}>
              {project.writeup && (
                <a
                  href={project.writeup}
                  className={styles.writeupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={stopCardClick}
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
                  onClick={stopCardClick}
                >
                  GitHub ↗
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
