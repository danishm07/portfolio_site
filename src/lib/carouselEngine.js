export const FRICTION = 0.9;
export const WHEEL_SENS = 0.012;
export const DRAG_SENS = 0.01;

export function getCardWidth() {
  const w = window.innerWidth;
  if (w <= 767) return w * 0.82;
  if (w <= 1199) return 260;
  return 320;
}

export function getCardHeight() {
  const w = window.innerWidth;
  if (w <= 767) return Math.round(w * 0.82 * (4 / 3));
  if (w <= 1199) return 340;
  return 420;
}

export function getRadius() {
  const w = window.innerWidth;
  if (w <= 767) return 360;
  if (w <= 1199) return 400;
  return 460;
}

export function isMobileViewport() {
  return window.innerWidth <= 767;
}

export function getRelativeIndex(cardIndex, offset, itemCount) {
  let rel = cardIndex - offset;
  while (rel > itemCount / 2) rel -= itemCount;
  while (rel < -itemCount / 2) rel += itemCount;
  return rel;
}

function normalizeAngle(deg) {
  let a = deg % 360;
  if (a > 180) a -= 360;
  if (a < -180) a += 360;
  return a;
}

function readCardIndex(el) {
  const raw = el.getAttribute('data-carousel-index');
  if (raw != null) return Number(raw);
  return Number(el.getAttribute('data-carousel-card'));
}

export function createCarouselEngine(
  rigEl,
  { onActiveIndex, itemCount, initialOffset = 0 } = {}
) {
  const angleStep = 360 / itemCount;

  let offset = initialOffset;
  let velocity = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragStartOffset = 0;
  let lastDragDx = 0;
  let radius = getRadius();
  let rafId = null;
  let lastReportedIndex = -1;
  let frozen = false;

  function getCards() {
    return rigEl.querySelectorAll('[data-carousel-index]');
  }

  function paint() {
    if (isMobileViewport()) return;

    const rigRotation = -offset * angleStep;
    rigEl.style.transform = `translate(-50%, -50%) rotateY(${rigRotation}deg)`;

    getCards().forEach((el) => {
      const i = readCardIndex(el);
      if (Number.isNaN(i)) return;

      const slotAngle = i * angleStep;
      const relAngle = normalizeAngle((i - offset) * angleStep);
      const abs = Math.abs(relAngle);
      const hideAngle = 128;
      const opacity =
        abs >= hideAngle ? 0 : Math.max(0.34, 1 - (abs / hideAngle) * 0.38);
      el.style.transform = `translate(-50%, -50%) rotateY(${slotAngle}deg) translateZ(${radius}px)`;
      el.style.opacity = String(opacity);
      el.style.zIndex = String(Math.round(100 - abs));
    });

    let idx = Math.round(offset) % itemCount;
    if (idx < 0) idx += itemCount;
    if (idx !== lastReportedIndex) {
      lastReportedIndex = idx;
      onActiveIndex?.(idx);
    }
  }

  function loop() {
    if (!frozen) {
      if (!dragging && Math.abs(velocity) > 0.0003) {
        velocity *= FRICTION;
        offset += velocity;
      }
      paint();
    }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (!rafId) rafId = requestAnimationFrame(loop);
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function onWheel(e) {
    if (isMobileViewport()) return;
    if (Math.abs(e.deltaX) < 2) return;
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    velocity = 0;
    offset += e.deltaX * WHEEL_SENS;
  }

  function onPointerDown(e) {
    if (isMobileViewport() || e.button !== 0) return;
    dragging = true;
    dragStartX = e.clientX;
    dragStartOffset = offset;
    lastDragDx = 0;
    velocity = 0;
  }

  function onPointerMove(e) {
    if (!dragging) return;
    const dx = e.clientX - dragStartX;
    lastDragDx = dx;
    offset = dragStartOffset - dx * DRAG_SENS;
  }

  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    velocity = -lastDragDx * DRAG_SENS * 0.45;
  }

  function onResize() {
    radius = getRadius();
  }

  function getOffset() {
    return offset;
  }

  function isDragging() {
    return dragging;
  }

  function setFrozen(value) {
    frozen = value;
    if (!frozen) paint();
  }

  start();
  paint();

  return {
    getOffset,
    isDragging,
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onResize,
    stop,
    paint,
    setFrozen,
  };
}
