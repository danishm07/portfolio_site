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

export function getBasePath() {
  return buildBasePath;
}
