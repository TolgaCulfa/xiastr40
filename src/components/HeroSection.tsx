'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Server, Globe } from 'lucide-react';

export default function HeroSection() {
  return (
    <section style={{
      position: 'relative',
      paddingTop: '80px',
      paddingBottom: '80px',
      backgroundColor: '#000000',
    }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '820px' }}>
        
        {/* Main Headline */}
        <h1 style={{
          fontSize: '44px',
          lineHeight: '1.15',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: '#ffffff',
          marginBottom: '16px',
        }}>
          Geliştiriciler İçin Hızlı ve Ücretsiz Subdomain
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#888888',
          maxWidth: '620px',
          margin: '0 auto 32px auto',
        }}>
          <strong style={{ color: '#ffffff' }}>xias.tr</strong> ve{' '}
          <strong style={{ color: '#ffffff' }}>xias.info</strong> kök alan adları ile saniyeler içinde
          alt alan adınızı oluşturun. A, AAAA, CNAME ve URL yönlendirmeleri ile tam kontrol.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link 
            href="/subdomain-al"
            className="btn-primary" 
            style={{ padding: '11px 24px', fontSize: '14px' }}
          >
            <Globe size={16} />
            <span>Subdomain Al</span>
            <ArrowRight size={15} />
          </Link>

          <Link 
            href="/dashboard"
            className="btn-secondary" 
            style={{ padding: '11px 22px', fontSize: '14px' }}
          >
            <Server size={16} />
            <span>Dashboard</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
