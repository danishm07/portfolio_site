const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function assetPath(path) {
  if (!path) return path;
  if (!path.startsWith('/')) return path;
  return `${basePath}${path}`;
}

export function getBasePath() {
  return basePath;
}
