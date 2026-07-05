const DUST_RGB = { r: 154, g: 148, b: 136 };
const LERP_SPEED = 0.12;
const SPACING = 12;
const DOT_RADIUS = 1;
const AMBIENT_ALPHA = 0.015;
const PEAK_ALPHA = 0.07;
const TRAIL_LERP = 0.06;

function smoothstep(t) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

function buildDotGrid(width, height) {
  const dots = [];
  const cols = Math.ceil(width / SPACING) + 2;
  const rows = Math.ceil(height / SPACING) + 2;

  for (let row = 0; row < rows; row += 1) {
    const y = row * SPACING - SPACING;
    const xOffset = (row % 2) * (SPACING * 0.5);
    for (let col = 0; col < cols; col += 1) {
      const x = col * SPACING + xOffset - SPACING;
      dots.push({ x, y });
    }
  }

  return dots;
}

export function initCursorHalftone(canvas, options = {}) {
  let revealRadius = options.revealRadius ?? 160;
  let disabled = options.disabled ?? false;
  let faded = false;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dots = [];
  let animationId = null;
  let cursorX = -9999;
  let cursorY = -9999;
  let targetX = -9999;
  let targetY = -9999;
  let trailX = -9999;
  let trailY = -9999;
  let pointerActive = false;
  let isVisible = true;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr * 0.5);
    canvas.height = Math.floor(height * dpr * 0.5);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr * 0.5, 0, 0, dpr * 0.5, 0, 0);
    dots = buildDotGrid(width, height);
  }

  function sampleAlpha(px, py, dx, dy) {
    if (!pointerActive || faded) return AMBIENT_ALPHA;

    const distCursor = Math.hypot(dx - px, dy - py);
    const distTrail = Math.hypot(dx - trailX, dy - trailY);

    const boost = Math.max(
      smoothstep(1 - distCursor / revealRadius),
      smoothstep(1 - distTrail / (revealRadius * 0.72)) * 0.5
    );

    return AMBIENT_ALPHA + boost * (PEAK_ALPHA - AMBIENT_ALPHA);
  }

  function draw() {
    if (!isVisible) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    if (disabled || faded) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    cursorX += (targetX - cursorX) * LERP_SPEED;
    cursorY += (targetY - cursorY) * LERP_SPEED;
    trailX += (cursorX - trailX) * TRAIL_LERP;
    trailY += (cursorY - trailY) * TRAIL_LERP;

    const px = pointerActive ? cursorX : -9999;
    const py = pointerActive ? cursorY : -9999;

    for (let i = 0; i < dots.length; i += 1) {
      const dot = dots[i];
      const alpha = sampleAlpha(px, py, dot.x, dot.y);
      if (alpha < 0.008) continue;

      ctx.fillStyle = `rgba(${DUST_RGB.r}, ${DUST_RGB.g}, ${DUST_RGB.b}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    animationId = requestAnimationFrame(draw);
  }

  function onMouseMove(e) {
    pointerActive = true;
    targetX = e.clientX;
    targetY = e.clientY;
  }

  function onMouseLeave() {
    pointerActive = false;
  }

  function onVisibilityChange() {
    isVisible = !document.hidden;
    if (!isVisible) {
      ctx.clearRect(0, 0, width, height);
    }
  }

  resize();
  draw();

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('mouseleave', onMouseLeave);
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onVisibilityChange);

  return {
    destroy() {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    },
    setRevealRadius(radius) {
      revealRadius = radius;
    },
    setDisabled(value) {
      disabled = value;
      if (value) {
        ctx.clearRect(0, 0, width, height);
      }
    },
    setFaded(value) {
      faded = value;
      if (value) {
        ctx.clearRect(0, 0, width, height);
      }
    },
  };
}
