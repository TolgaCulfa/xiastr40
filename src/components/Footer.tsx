'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer({ onNavigate }: { onNavigate?: (s: string) => void; onOpenSettings?: () => void }) {
  return (
    <footer style={{
      background: '#000000',
      borderTop: '1px solid #1a1a1a',
      padding: '36px 0 28px 0',
      color: '#666666',
      fontSize: '12px',
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              XIAS.DNS
            </div>
            <div>
              &copy; {new Date().getFullYear()} XIAS Cloud DNS Platformu. xias.tr &bull; xias.info
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/subdomain-al" style={{ color: '#888888' }}>Subdomain Al</Link>
            <Link href="/dashboard" style={{ color: '#888888' }}>Dashboard</Link>
            <Link href="/login" style={{ color: '#888888' }}>Giriş</Link>
            <Link href="/register" style={{ color: '#888888' }}>Kayıt Ol</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
