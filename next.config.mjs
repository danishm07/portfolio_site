/** @type {import('next').NextConfig} */

const forGithubPages = process.env.GITHUB_PAGES === 'true';
const repoName = process.env.GITHUB_REPOSITORY?.split('/')?.[1] ?? 'portfoliosite';
const isUserSite = repoName.endsWith('.github.io');
const basePath = forGithubPages && !isUserSite ? `/${repoName}` : '';

const nextConfig = {
  ...(forGithubPages ? { output: 'export' } : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  images: { unoptimized: true },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
