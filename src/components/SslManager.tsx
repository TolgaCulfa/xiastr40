'use client';

import React, { useState } from 'react';
import { ClaimedSubdomain, SslCertificate } from '@/lib/types';
import { Lock, CheckCircle2, ShieldCheck, RefreshCw, KeyRound, Globe, ArrowRight } from 'lucide-react';

interface SslManagerProps {
  subdomains: ClaimedSubdomain[];
  activeSubdomain: ClaimedSubdomain | null;
  onUpdateSsl: (subdomainId: string, sslCert: SslCertificate) => void;
}

export default function SslManager({
  subdomains,
  activeSubdomain,
  onUpdateSsl,
}: SslManagerProps) {
  const [selectedId, setSelectedId] = useState<string>(
    activeSubdomain ? activeSubdomain.id : subdomains[0]?.id || ''
  );
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueStep, setIssueStep] = useState(0);
  const [stepMessage, setStepMessage] = useState('');

  const currentDomain = subdomains.find((s) => s.id === selectedId) || activeSubdomain;

  // 5-Second Realistic SSL Issuance Engine
  const handleIssueSsl = () => {
    if (!currentDomain || isIssuing) return;

    setIsIssuing(true);
    setIssueStep(1);
    setStepMessage('2048-bit ECC Özel Anahtar (Private Key) üretiliyor...');

    setTimeout(() => {
      setIssueStep(2);
      setStepMessage('Cloudflare Universal CA & Let\'s Encrypt CSR imzalanıyor...');
    }, 1000);

    setTimeout(() => {
      setIssueStep(3);
      setStepMessage('Anycast Edge PoP Doğrulama Meydan Okuması (HTTP-01)...');
    }, 2000);

    setTimeout(() => {
      setIssueStep(4);
      setStepMessage('TLS 1.3 Sertifika Zinciri Şifreleniyor & Kuruluyor...');
    }, 3200);

    setTimeout(() => {
      setIssueStep(5);
      setStepMessage('Sertifika Anycast uç düğümlerine dağıtılıyor...');
    }, 4200);

    setTimeout(() => {
      const now = new Date();
      const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

      const newCert: SslCertificate = {
        issued: true,
        issuer: 'Cloudflare Universal CA & Let\'s Encrypt Authority',
        validFrom: now.toLocaleDateString('tr-TR'),
        validUntil: nextYear.toLocaleDateString('tr-TR'),
        cipher: 'TLS_AES_128_GCM_SHA256 &bull; ECDHE 256-Bit',
        serialNumber: `0x${Array.from({ length: 8 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('')}`,
        autoRenew: true,
      };

      onUpdateSsl(currentDomain.id, newCert);
      setIsIssuing(false);
      setIssueStep(0);
      setStepMessage('');
    }, 5000);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '440px',
        padding: '20px',
      }}
    >
      <div
        className="card animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: '#0a0a0a',
          border: '1px solid #1a1a1a',
          borderRadius: 'var(--radius-md)',
          padding: '36px 32px',
          textAlign: 'center',
        }}
      >
        {/* Minimalist Top Padlock Icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            color: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
          }}
        >
          <Lock size={28} strokeWidth={2.4} />
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '6px' }}>
          SSL / TLS 1.3 Sertifika Yöneticisi
        </h2>

        <p style={{ fontSize: '13px', color: '#888888', marginBottom: '24px' }}>
          Tüm subdomain ve domainler için otomatik, ücretsiz 256-bit şifreleme.
        </p>

        {/* Domain Selector */}
        {subdomains.length > 0 ? (
          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#666666', textTransform: 'uppercase', marginBottom: '6px' }}>
              İşlem Yapılacak Domaini Seçin
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={isIssuing}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#000000',
                border: '1px solid #262626',
                borderRadius: 'var(--radius-sm)',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {subdomains.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.fullDomain} {sub.sslCert?.issued ? '(SSL Aktif)' : ''}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div style={{ padding: '12px', backgroundColor: '#111111', borderRadius: '4px', fontSize: '12px', color: '#888888', marginBottom: '20px' }}>
            Önce &quot;Ücretsiz Domain Al&quot; kısmından bir subdomain kaydedin.
          </div>
        )}

        {/* 5-Second Issuing Progress State */}
        {isIssuing ? (
          <div style={{ padding: '24px', backgroundColor: '#000000', border: '1px solid #222222', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, color: '#ffffff', marginBottom: '16px' }}>
              <RefreshCw size={16} className="pulse-indicator" />
              <span>{stepMessage}</span>
            </div>

            {/* Progress bar (fills in 5s) */}
            <div style={{ width: '100%', height: '5px', backgroundColor: '#141414', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  backgroundColor: '#ffffff',
                  width: `${issueStep * 20}%`,
                  transition: 'width 1s ease',
                }}
              />
            </div>
            <div style={{ fontSize: '11px', color: '#666666', marginTop: '10px' }}>
              Cloudflare Anycast SSL motoru bağlanıyor... ({issueStep}/5)
            </div>
          </div>
        ) : currentDomain?.sslCert?.issued ? (
          /* Already Issued Certificate Badge */
          <div style={{ padding: '20px', backgroundColor: '#050505', border: '1px solid #1a1a1a', borderRadius: 'var(--radius-sm)', marginBottom: '20px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>
              <CheckCircle2 size={18} style={{ color: '#ffffff' }} />
              <span>SSL Sertifikası Aktif & Kurulu</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#888888' }}>
              <div>Sağlayıcı: <strong style={{ color: '#ffffff' }}>{currentDomain.sslCert.issuer}</strong></div>
              <div>Geçerlilik: <strong style={{ color: '#ffffff' }}>{currentDomain.sslCert.validFrom} &ndash; {currentDomain.sslCert.validUntil}</strong></div>
              <div>Şifreleme: <code style={{ color: '#a3a3a3' }}>{currentDomain.sslCert.cipher}</code></div>
              <div>Seri No: <code style={{ color: '#a3a3a3' }}>{currentDomain.sslCert.serialNumber}</code></div>
            </div>

            <button
              onClick={handleIssueSsl}
              className="btn-secondary btn-sm"
              style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <RefreshCw size={13} />
              <span>Sertifikayı Yeniden Üret & Yenile (5sn)</span>
            </button>
          </div>
        ) : (
          /* Issuance Button */
          <button
            onClick={handleIssueSsl}
            disabled={!currentDomain || isIssuing}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <ShieldCheck size={16} />
            <span>Ücretsiz SSL Sertifikası Al (5 Saniye)</span>
          </button>
        )}

        <div style={{ fontSize: '11px', color: '#555555', marginTop: '16px' }}>
          Otomatik SSL yenileme aktiftir &bull; Sıfır kesinti garantisi
        </div>
      </div>
    </div>
  );
}
