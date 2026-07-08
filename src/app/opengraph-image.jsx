import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Danish Mohammed — AI Engineer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#EDE7D9',
          color: '#18160F',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontFamily: 'Georgia, serif',
            marginBottom: 32,
          }}
        >
          Danish
        </div>
        <div
          style={{
            fontSize: 72,
            fontFamily: 'Georgia, serif',
            marginBottom: 32,
          }}
        >
          Mohammed
        </div>
        <div
          style={{
            width: 40,
            height: 1,
            background: '#C8C2B4',
            marginBottom: 24,
          }}
        />
        <div
          style={{
            fontSize: 14,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#9A9488',
          }}
        >
         Chicago
        </div>
      </div>
    ),
    { ...size }
  );
}
