const CODE_LINES = [
  'guilt_features = [13305, 11883]',
  'ising_chain.fit(activations)',
  'bootstrap_ci(n=1000)',
  'steering_vec = acts[layer]',
  'pearson_r = corr(f1, f2)',
  '∇θ J(θ) = E[∇log π · A]',
  'sharpe = μ / σ',
  'livekit.connect(url, token)',
  'nova_sonic.stream(chunk)',
  'vec = bedrock.embed(text)',
  'mcp_server.register(fn)',
  'synthesize(paper_id)',
  'heal(error, traceback)',
  '#include <raylib.h>',
  'vec3 cel = floor(c*4.)/4.',
  'async def worker(self):',
  'optimizer.step()',
  'agent.run(task, ctx)',
  'rag_chain.invoke(question)',
  'await queue.join()',
];

const SAGE_RGB = { r: 107, g: 130, b: 106 };
const LERP_SPEED = 0.13;
const COLUMN_WIDTH = 104;
const LINE_HEIGHT = 13;
const FONT_SIZE = 7;
const AMBIENT_ALPHA = 0.018;
const PEAK_ALPHA = 0.35;
const PAD_X = 6;

function smoothstep(t) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

function distToSegment(px, py, x1, y, x2) {
  const cx = Math.max(x1, Math.min(px, x2));
  const dx = px - cx;
  const dy = py - y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function initCursorCode(canvas, options = {}) {
  let revealRadius = options.revealRadius ?? 170;
  let disabled = options.disabled ?? false;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let columns = [];
  let lineWidths = [];
  let animationId = null;
  let cursorX = -9999;
  let cursorY = -9999;
  let targetX = -9999;
  let targetY = -9999;
  let trailX = -9999;
  let trailY = -9999;
  let pointerActive = false;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.font = `300 ${FONT_SIZE}px "IBM Plex Mono", monospace`;
    lineWidths = CODE_LINES.map((line) => ctx.measureText(line).width);

    const colCount = Math.ceil(width / COLUMN_WIDTH) + 2;
    columns = Array.from({ length: colCount }, (_, i) => ({
      x: i * COLUMN_WIDTH - COLUMN_WIDTH * 0.25,
      yShift: (i % 2) * (LINE_HEIGHT * 0.55),
      offset: Math.random() * CODE_LINES.length * LINE_HEIGHT,
      speed: 0.22 + Math.random() * 0.38,
      lineStart: Math.floor(Math.random() * CODE_LINES.length),
    }));
  }

  function sampleAlpha(px, py, lx, ly, lw) {
    if (!pointerActive) return AMBIENT_ALPHA;

    const x1 = lx;
    const x2 = lx + lw;
    const y = ly + LINE_HEIGHT * 0.5;

    const dCursor = distToSegment(px, py, x1, y, x2);
    const dTrail = distToSegment(trailX, trailY, x1, y, x2);

    const boost = Math.max(
      smoothstep(1 - dCursor / revealRadius),
      smoothstep(1 - dTrail / (revealRadius * 0.72)) * 0.55
    );

    return AMBIENT_ALPHA + boost * (PEAK_ALPHA - AMBIENT_ALPHA);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    if (disabled) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    cursorX += (targetX - cursorX) * LERP_SPEED;
    cursorY += (targetY - cursorY) * LERP_SPEED;
    trailX += (cursorX - trailX) * 0.06;
    trailY += (cursorY - trailY) * 0.06;

    ctx.font = `300 ${FONT_SIZE}px "IBM Plex Mono", monospace`;
    ctx.textBaseline = 'top';

    const totalHeight = CODE_LINES.length * LINE_HEIGHT;
    const rowCount = Math.ceil(height / LINE_HEIGHT) + 3;

    for (const col of columns) {
      col.offset += col.speed;
      if (col.offset > totalHeight) col.offset -= totalHeight;

      for (let i = -2; i < rowCount; i++) {
        const lineIdx = (col.lineStart + i + CODE_LINES.length * 8) % CODE_LINES.length;
        const y = col.yShift + i * LINE_HEIGHT - col.offset;
        if (y < -LINE_HEIGHT || y > height + LINE_HEIGHT) continue;

        const lx = col.x + PAD_X;
        const lw = lineWidths[lineIdx];
        const alpha = sampleAlpha(cursorX, cursorY, lx, y, lw);

        if (alpha < 0.008) continue;

        ctx.fillStyle = `rgba(${SAGE_RGB.r}, ${SAGE_RGB.g}, ${SAGE_RGB.b}, ${alpha})`;
        ctx.fillText(CODE_LINES[lineIdx], lx, y);
      }
    }

    animationId = requestAnimationFrame(draw);
  }

  function onMouseMove(e) {
    pointerActive = true;
    const rect = canvas.getBoundingClientRect();
    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;
  }

  function onMouseLeave() {
    pointerActive = false;
  }

  resize();
  draw();

  const parent = canvas.parentElement;
  parent.addEventListener('mousemove', onMouseMove, { passive: true });
  parent.addEventListener('mouseleave', onMouseLeave);
  window.addEventListener('resize', resize);

  return {
    destroy() {
      cancelAnimationFrame(animationId);
      parent.removeEventListener('mousemove', onMouseMove);
      parent.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', resize);
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
  };
}
