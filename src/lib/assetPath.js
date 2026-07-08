import { ART_VERSIONS } from '@/data/artVersions';

const buildBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function getRuntimeBasePath() {
  if (typeof window === 'undefined') return '';
  const { hostname, pathname } = window.location;
  if (!hostname.endsWith('github.io')) return '';
  const segment = pathname.split('/').filter(Boolean)[0];
  return segment ? `/${segment}` : '';
}

export function assetPath(path) {
  if (!path) return path;
  if (!path.startsWith('/')) return path;
  const base = buildBasePath || getRuntimeBasePath();
  return `${base}${path}`;
}

export function openPdfPopup(event, path = '/resume.pdf') {
  if (event) event.preventDefault();

  const pdfUrl = assetPath(path);
  const popup = window.open(
    '',
    '_blank',
    'popup=yes,width=980,height=720,scrollbars=yes,resizable=yes'
  );

  if (!popup) {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  popup.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Resume</title>
        <style>
          html, body { margin: 0; height: 100%; background: #111; }
          iframe { width: 100%; height: 100vh; border: 0; }
        </style>
      </head>
      <body>
        <iframe src="${pdfUrl}"></iframe>
      </body>
    </html>
  `);
  popup.document.close();
}

/** Art images with content-hash cache busting — swap files freely, rerun dev/build to refresh. */
export function artPath(path) {
  const base = assetPath(path);
  const version = ART_VERSIONS[path];
  if (!version) return base;
  return `${base}?v=${version}`;
}

export function getBasePath() {
  return buildBasePath;
}
