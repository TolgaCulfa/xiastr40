'use client';

import React from 'react';
import { Shield, Zap, Lock, RefreshCw, Server, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onScrollToSearch: () => void;
  onScrollToDashboard: () => void;
}

export default function HeroSection({ onScrollToSearch, onScrollToDashboard }: HeroSectionProps) {
  return (
    <section style={{
      position: 'relative',
      paddingTop: '64px',
      paddingBottom: '52px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(243, 128, 32, 0.08), transparent)',
    }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '860px' }}>
        {/* Top pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-medium)',
          marginBottom: '24px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
        }}>
          <span style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--cf-orange)',
          }} />
          <span style={{ fontWeight: 600, color: '#ffffff' }}>Cloudflare DNS Omurgası</span>
          <span style={{ color: 'var(--text-dim)' }}>&bull;</span>
          <span>%100 Ücretsiz & Reklamsız</span>
        </div>

        {/* Main Headline */}
        <h1 style={{
          fontSize: '44px',
          lineHeight: '1.18',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: '#ffffff',
          marginBottom: '18px',
        }}>
          Projeleriniz İçin Hızlı, Güvenli ve{' '}
          <span style={{ color: 'var(--cf-orange)' }}>Ücretsiz Subdomain</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '17px',
          lineHeight: '1.6',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          margin: '0 auto 32px auto',
        }}>
          <strong style={{ color: 'var(--text-primary)' }}>xias.tr</strong> ve{' '}
          <strong style={{ color: 'var(--text-primary)' }}>xias.info</strong> alan adları ile saniyeler içinde
          alt alan adınızı kaydedin. Gelişmiş DNS kontrolü (A, AAAA, CNAME, TXT, MX) ve 301/302 URL yönlendirmeleri parmaklarınızın ucunda.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button 
            onClick={onScrollToSearch}
            className="btn-primary" 
            style={{ padding: '12px 24px', fontSize: '15px' }}
          >
            <span>Subdomain Müsaitliğini Ara</span>
            <ArrowRight size={16} />
          </button>

          <button 
            onClick={onScrollToDashboard}
            className="btn-secondary" 
            style={{ padding: '12px 22px', fontSize: '15px' }}
          >
            <Server size={16} />
            <span>DNS Yönetim Paneli</span>
          </button>
        </div>

        {/* Feature Grid / Trust indicators */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginTop: '48px',
          textAlign: 'left',
        }}>
          <div className="card" style={{ padding: '16px 18px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ color: 'var(--cf-orange)' }}>
                <Shield size={18} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>DDoS Savunması</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Cloudflare Anycast ağıyla otomatik katman 3/4 ve katman 7 saldırı engelleme.
            </p>
          </div>

          <div className="card" style={{ padding: '16px 18px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ color: 'var(--emerald)' }}>
                <Lock size={18} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Otomatik SSL/TLS</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Tüm yönlendirmelerde ve proxied kayıtlarda ücretsiz HTTPS şifrelemesi.
            </p>
          </div>

          <div className="card" style={{ padding: '16px 18px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ color: 'var(--blue)' }}>
                <Zap size={18} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Anlık Yayılım</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              1 dakika gibi düşük TTL seçenekleri ile DNS değişiklikleri saniyeler içinde aktif.
            </p>
          </div>

          <div className="card" style={{ padding: '16px 18px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ color: 'var(--amber)' }}>
                <RefreshCw size={18} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>301 / 302 Yönlendirme</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Sunucu kurmadan doğrudan GitHub, Vercel, LinkedIn veya harici linke yönlendirin.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
