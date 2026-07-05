const FALLBACK = { r: 154, g: 148, b: 136 };

function muteRgb(r, g, b, mix = 0.22) {
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  return {
    r: Math.round(r * (1 - mix) + gray * mix),
    g: Math.round(g * (1 - mix) + gray * mix),
    b: Math.round(b * (1 - mix) + gray * mix),
  };
}

const toneCache = new Map();

export function extractMutedTone(src) {
  if (toneCache.has(src)) {
    return Promise.resolve(toneCache.get(src));
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 28;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count += 1;
        }

        const tone = muteRgb(r / count, g / count, b / count);
        toneCache.set(src, tone);
        resolve(tone);
      } catch {
        resolve(FALLBACK);
      }
    };

    img.onerror = () => resolve(FALLBACK);
    img.src = src;
  });
}
