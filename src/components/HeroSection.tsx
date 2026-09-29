'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Server, Globe } from 'lucide-react';

export default function HeroSection() {
  return (
    <section style={{
      position: 'relative',
      paddingTop: '88px',
      paddingBottom: '88px',
      background: 'radial-gradient(ellipse 70% 45% at 50% -10%, rgba(243, 128, 32, 0.09), transparent)',
    }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '880px' }}>
        
        {/* Main Headline */}
        <h1 style={{
          fontSize: '48px',
          lineHeight: '1.16',
          fontWeight: 700,
          letterSpacing: '-0.035em',
          color: '#ffffff',
          marginBottom: '20px',
        }}>
          Projeleriniz İçin Hızlı, Güvenli ve{' '}
          <span style={{ color: 'var(--cf-orange)' }}>Ücretsiz Subdomain</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '18px',
          lineHeight: '1.6',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          margin: '0 auto 36px auto',
        }}>
          <strong style={{ color: 'var(--text-primary)' }}>xias.tr</strong> ve{' '}
          <strong style={{ color: 'var(--text-primary)' }}>xias.info</strong> kök alan adları ile saniyeler içinde
          alt alan adınızı kaydedin. Gelişmiş DNS kontrolü (A, AAAA, CNAME, TXT, MX) ve 301/302 URL yönlendirmeleri parmaklarınızın ucunda.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Link 
            href="/subdomain-al"
            className="btn-primary" 
            style={{ padding: '13px 28px', fontSize: '15px' }}
          >
            <Globe size={18} />
            <span>Hemen Subdomain Al</span>
            <ArrowRight size={16} />
          </Link>

          <Link 
            href="/dashboard"
            className="btn-secondary" 
            style={{ padding: '13px 24px', fontSize: '15px' }}
          >
            <Server size={18} />
            <span>DNS Yönetim Paneli</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
