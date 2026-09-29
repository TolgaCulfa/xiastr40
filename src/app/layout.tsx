import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'XIAS Cloud DNS — Ücretsiz Profesyonel Subdomain & DNS Platformu',
  description: 'xias.tr ve xias.info için anında ücretsiz subdomain tahsis edin. Cloudflare Anycast altyapısı, otomatik SSL/TLS sertifikası, DDoS koruması ve esnek DNS / URL yönlendirme kontrol paneli.',
  keywords: ['subdomain', 'dns', 'cloudflare', 'xias.tr', 'xias.info', 'free subdomain', 'url redirect', 'anycast dns'],
  authors: [{ name: 'XIAS Infrastructure' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
