import type { Metadata, Viewport } from 'next';
import PublicShell from '@/components/public/PublicShell';
import './public.css';

export const metadata: Metadata = {
  title: { default: 'Aboet Adventure', template: '%s — Aboet Adventure' },
  description: 'Paket wisata & wahana outdoor di Sentul, Bogor: rafting, fun trekking, offroad, ATV, outbound, dan camping.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,400..800;1,400..800&family=Epilogue:ital,wght@0,600..800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}

export const dynamic = 'force-dynamic';
