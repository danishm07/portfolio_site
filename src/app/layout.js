import './globals.css';
import { getBasePath } from '@/lib/assetPath';

const basePath = getBasePath();

export const metadata = {
  metadataBase: new URL('https://danishmohammed.com'),
  title: 'Danish Mohammed — AI Engineer',
  description:
    'Portfolio of Danish Mohammed — AI Engineer based in Chicago. Mechanistic interpretability, agentic systems, and production engineering.',
  openGraph: {
    title: 'Danish Mohammed — AI Engineer',
    description:
      'Portfolio of Danish Mohammed — AI Engineer based in Chicago.',
    url: 'https://danishmohammed.com',
    siteName: 'Danish Mohammed',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Danish Mohammed — AI Engineer',
    description:
      'Portfolio of Danish Mohammed — AI Engineer based in Chicago.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={`${basePath}/favicon.svg`} type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
