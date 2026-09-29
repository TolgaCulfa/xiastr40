'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Globe, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000000' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <HeroSection />

        {/* 3 Step Minimal Section */}
        <section style={{ padding: '40px 0 70px 0', borderTop: '1px solid #1a1a1a', backgroundColor: '#000000' }}>
          <div className="container" style={{ maxWidth: '920px' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Hızlı Başlangıç
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', marginTop: '6px' }}>
                3 Adımda Yayına Alın
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
            }}>
              {/* Step 1 */}
              <div className="card" style={{ padding: '22px', background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                  01 / SUBDOMAIN SEÇİN
                </div>
                <p style={{ fontSize: '13px', color: '#888888', lineHeight: '1.5' }}>
                  <code>.xias.tr</code> veya <code>.xias.info</code> kök domainlerinden adınızı anında sorgulayın.
                </p>
              </div>

              {/* Step 2 */}
              <div className="card" style={{ padding: '22px', background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                  02 / DNS VEYA IP GİRİN
                </div>
                <p style={{ fontSize: '13px', color: '#888888', lineHeight: '1.5' }}>
                  A, AAAA, CNAME gibi 6 adede kadar kayıt tanımlayın veya doğrudan URL yönlendirmesi yapın.
                </p>
              </div>

              {/* Step 3 */}
              <div className="card" style={{ padding: '22px', background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                  03 / YAYINA ALIN
                </div>
                <p style={{ fontSize: '13px', color: '#888888', lineHeight: '1.5' }}>
                  Cloudflare Anycast ağıyla otomatik SSL/TLS sertifikası ve DDoS koruması aktif olsun.
                </p>
              </div>
            </div>

            {/* Bottom CTA Box */}
            <div
              className="card"
              style={{
                marginTop: '36px',
                padding: '28px',
                background: '#0a0a0a',
                border: '1px solid #222222',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
                  Ücretsiz Alan Adınızı Şimdi Alın
                </h3>
                <p style={{ fontSize: '13px', color: '#666666', marginTop: '2px' }}>
                  Kredi kartı gerekmez. Anında aktif olur.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link href="/subdomain-al" className="btn-primary">
                  <Globe size={15} />
                  <span>Subdomain Al</span>
                  <ArrowRight size={14} />
                </Link>
                <Link href="/login" className="btn-secondary">
                  <span>Giriş Yap</span>
                </Link>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
