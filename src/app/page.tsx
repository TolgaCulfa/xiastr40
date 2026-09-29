'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Globe, ArrowRight, Server, ShieldCheck, Zap, Layers } from 'lucide-react';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Clean Hero Section without deleted items */}
        <HeroSection />

        {/* 3 Step How It Works Section */}
        <section style={{ padding: '48px 0 80px 0', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="container" style={{ maxWidth: '960px' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cf-orange)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Basit & Hızlı Kurulum
              </span>
              <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', marginTop: '6px' }}>
                3 Adımda Projenizi Yayına Alın
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
            }}>
              {/* Step 1 */}
              <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--cf-orange-subtle)',
                  border: '1px solid var(--cf-orange-border)',
                  color: 'var(--cf-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '15px',
                  marginBottom: '16px',
                }}>
                  1
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
                  Subdomain Seçin
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  <code>.xias.tr</code> veya <code>.xias.info</code> kök domainlerinden projenize uygun alt alan adını anında sorgulayın.
                </p>
              </div>

              {/* Step 2 */}
              <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--blue-subtle)',
                  border: '1px solid var(--blue-border)',
                  color: 'var(--blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '15px',
                  marginBottom: '16px',
                }}>
                  2
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
                  DNS veya IP Girin
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  A, AAAA, CNAME gibi 6 adede kadar DNS kaydı tanımlayın veya doğrudan 301/302 URL yönlendirmesi yapın.
                </p>
              </div>

              {/* Step 3 */}
              <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--emerald-subtle)',
                  border: '1px solid var(--emerald-border)',
                  color: 'var(--emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '15px',
                  marginBottom: '16px',
                }}>
                  3
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
                  Anında Yayında
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Cloudflare Anycast ağıyla otomatik SSL/TLS sertifikası ve DDoS koruması saniyeler içinde devreye girsin.
                </p>
              </div>
            </div>

            {/* Bottom CTA Box */}
            <div
              className="card"
              style={{
                marginTop: '48px',
                padding: '36px 32px',
                background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%)',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                  Hemen Ücretsiz Alan Adınızı Oluşturun
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Kredi kartı veya karmaşık onay süreçleri gerekmez.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link href="/subdomain-al" className="btn-primary" style={{ padding: '11px 22px' }}>
                  <Globe size={16} />
                  <span>Subdomain Al</span>
                  <ArrowRight size={15} />
                </Link>
                <Link href="/login" className="btn-secondary" style={{ padding: '11px 20px' }}>
                  <span>Giriş Yap</span>
                </Link>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer onNavigate={() => {}} onOpenSettings={() => {}} />
    </div>
  );
}
