'use client';

import React from 'react';
import { Cloud, Shield, Heart, ExternalLink, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (section: string) => void;
  onOpenSettings: () => void;
}

export default function Footer({ onNavigate, onOpenSettings }: FooterProps) {
  return (
    <footer style={{
      background: 'var(--bg-main)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '48px 0 32px 0',
      color: 'var(--text-muted)',
      fontSize: '13px',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          marginBottom: '40px',
        }}>
          {/* Brand info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Cloud size={20} style={{ color: 'var(--cf-orange)' }} />
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                XIAS<span style={{ color: 'var(--cf-orange)' }}>.DNS</span>
              </span>
            </div>
            <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Geliştiriciler, hobi projeleri ve girişimciler için ücretsiz, yüksek performanslı Cloudflare Anycast subdomain ve DNS altyapısı.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-cf" style={{ fontSize: '11px' }}>xias.tr</span>
              <span className="badge badge-cf" style={{ fontSize: '11px' }}>xias.info</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', marginBottom: '12px' }}>
              Platform
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <button
                  onClick={() => onNavigate('search')}
                  style={{ color: 'var(--text-secondary)', fontSize: '13px' }}
                >
                  Subdomain Arama & Tahsis
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  style={{ color: 'var(--text-secondary)', fontSize: '13px' }}
                >
                  DNS Yönetim Konsolu
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('guides')}
                  style={{ color: 'var(--text-secondary)', fontSize: '13px' }}
                >
                  Vercel & GitHub Dağıtım Rehberi
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSettings}
                  style={{ color: 'var(--cf-orange)', fontSize: '13px', fontWeight: 500 }}
                >
                  Cloudflare API Yapılandırması
                </button>
              </li>
            </ul>
          </div>

          {/* Altyapı & Güvenlik */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', marginBottom: '12px' }}>
              Altyapı & Güvenlik
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} style={{ color: 'var(--emerald)' }} />
                <span>Cloudflare DDoS Koruması</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={14} style={{ color: 'var(--blue)' }} />
                <span>330+ Global Anycast PoP</span>
              </li>
              <li>
                <span>Ücretsiz Otomatik SSL/TLS</span>
              </li>
              <li>
                <span>301/302 URL Forwarding Motoru</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '24px',
          borderTop: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            &copy; {new Date().getFullYear()} XIAS Cloud DNS Platformu. Tüm hakları saklıdır.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <span>Powered by</span>
            <strong style={{ color: 'var(--cf-orange)' }}>Cloudflare DNS</strong>
            <span>&bull; Hosted on</span>
            <strong style={{ color: '#ffffff' }}>Vercel</strong>
          </div>
        </div>
      </div>
    </footer>
  );
}
