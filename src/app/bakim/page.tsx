'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getStoredSubdomains } from '@/lib/storage';
import { MaintenanceConfig } from '@/lib/types';
import { Wrench, Clock, Mail, ShieldAlert, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

function BakimContent() {
  const searchParams = useSearchParams();
  const domainParam = searchParams.get('domain') || '';

  const [activeDomain, setActiveDomain] = useState<string>('domain.com');
  const [config, setConfig] = useState<MaintenanceConfig>({
    enabled: true,
    template: 'minimal-dark',
    title: 'Sistem Bakım Çalışması',
    message: 'Daha iyi bir hizmet sunabilmek için altyapımızda planlı bakım çalışması yürütülmektedir. En kısa sürede tekrar yayındayız.',
    contactEmail: 'destek@domain.com',
    estimatedMinutes: 45,
    updatedAt: new Date().toISOString(),
  });
  const [countdownSeconds, setCountdownSeconds] = useState(45 * 60);

  useEffect(() => {
    // Detect domain from query or hostname
    let detected = domainParam;
    if (!detected && typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host !== 'localhost' && !host.includes('vercel.app')) {
        detected = host;
      } else {
        detected = 'deneme.xias.tr';
      }
    }
    setActiveDomain(detected);

    // Look up saved maintenance config for this domain
    const stored = getStoredSubdomains();
    const found = stored.find((s) => s.fullDomain.toLowerCase() === detected.toLowerCase());
    if (found?.maintenanceConfig) {
      setConfig(found.maintenanceConfig);
      if (found.maintenanceConfig.estimatedMinutes) {
        setCountdownSeconds(found.maintenanceConfig.estimatedMinutes * 60);
      }
    }
  }, [domainParam]);

  // Live countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // TEMPLATE 4: CUSTOM USER HTML
  if (config.template === 'custom-html' && config.customHtml) {
    return <div dangerouslySetInnerHTML={{ __html: config.customHtml }} />;
  }

  // TEMPLATE 3: CLOUDFLARE 503 SERVICE MAINTENANCE
  if (config.template === 'cloudflare-503') {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#000000',
          color: '#ffffff',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 24px',
        }}
      >
        <div style={{ maxWidth: '780px', margin: '60px auto 0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888888', fontSize: '13px', marginBottom: '16px' }}>
            <span style={{ fontWeight: 700, color: '#ffffff' }}>XIAS CLOUDFLARE EDGE</span>
            <span>&bull;</span>
            <span>Error 503</span>
          </div>

          <h1 style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            Service Temporarily Unavailable
          </h1>

          <p style={{ fontSize: '16px', color: '#888888', lineHeight: '1.6', marginBottom: '28px' }}>
            The server for <strong style={{ color: '#ffffff' }}>{activeDomain}</strong> is currently undergoing scheduled maintenance. Please check back in a few minutes.
          </p>

          <div
            style={{
              padding: '20px',
              backgroundColor: '#0a0a0a',
              border: '1px solid #1f1f1f',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              color: '#888888',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div>Host: <span style={{ color: '#ffffff' }}>{activeDomain}</span></div>
            <div>Status: <span style={{ color: '#ffffff' }}>503 Service Unavailable (Maintenance Active)</span></div>
            <div>PoP Location: <span style={{ color: '#ffffff' }}>IST (Istanbul Anycast Node #01)</span></div>
            <div>Ray ID: <span style={{ color: '#ffffff' }}>xias_503_{activeDomain.replace(/[^a-z0-9]/gi, '')}_cf</span></div>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '11px', color: '#444444', borderTop: '1px solid #141414', paddingTop: '20px' }}>
          Performance & Security by XIAS Anycast Cloud Network
        </div>
      </div>
    );
  }

  // TEMPLATE 2: CORPORATE / COMPANY
  if (config.template === 'corporate') {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#000000',
          color: '#ffffff',
          fontFamily: 'var(--font-sans)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '540px',
            width: '100%',
            backgroundColor: '#0a0a0a',
            border: '1px solid #1c1c1c',
            borderRadius: '12px',
            padding: '48px 36px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '10px',
              background: '#ffffff',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto',
            }}
          >
            <Wrench size={26} strokeWidth={2.2} />
          </div>

          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#888888',
              marginBottom: '8px',
            }}
          >
            {activeDomain}
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '12px' }}>
            {config.title || 'Planlı Bakım Çalışması'}
          </h1>

          <p style={{ fontSize: '14px', color: '#888888', lineHeight: '1.6', marginBottom: '28px' }}>
            {config.message || 'Hizmet kalitemizi ve sistem performansımızı artırmak amacıyla güncellemeler yapmaktayız.'}
          </p>

          {/* Contact Box */}
          <div
            style={{
              padding: '14px',
              backgroundColor: '#000000',
              border: '1px solid #222222',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '13px',
              color: '#ffffff',
            }}
          >
            <Mail size={16} style={{ color: '#888888' }} />
            <span>İletişim: <strong>{config.contactEmail || `info@${activeDomain}`}</strong></span>
          </div>

          <div style={{ marginTop: '24px', fontSize: '11px', color: '#555555' }}>
            &copy; {new Date().getFullYear()} {activeDomain} &bull; XIAS Cloud Koruma
          </div>
        </div>
      </div>
    );
  }

  // TEMPLATE 1: MINIMALIST DARK CYBER (DEFAULT)
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        userSelect: 'none',
      }}
    >
      <div style={{ maxWidth: '520px', width: '100%' }}>
        {/* Status Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            backgroundColor: '#111111',
            border: '1px solid #262626',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#ffffff',
            marginBottom: '24px',
          }}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
          <span>Sistem Bakım Modu Aktif</span>
        </div>

        {/* Domain Name */}
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#666666', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '8px' }}>
          {activeDomain}
        </div>

        {/* Main Title */}
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            marginBottom: '14px',
            lineHeight: '1.2',
          }}
        >
          {config.title || 'Çok Yakında Tekrar Yayındayız'}
        </h1>

        {/* Description */}
        <p style={{ fontSize: '15px', color: '#888888', lineHeight: '1.6', marginBottom: '36px' }}>
          {config.message || 'Sitemiz şu anda planlı geliştirme ve sunucu bakımı aşamasındadır. Hizmetlerimiz kısa süre içerisinde yeniden erişilebilir olacaktır.'}
        </p>

        {/* Live Countdown Box */}
        <div
          style={{
            padding: '24px',
            backgroundColor: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '8px',
            marginBottom: '32px',
          }}
        >
          <div style={{ fontSize: '11px', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Tahmini Kalan Süre
          </div>
          <div
            style={{
              fontSize: '36px',
              fontWeight: 800,
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              color: '#ffffff',
            }}
          >
            {formatCountdown(countdownSeconds)}
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: '11px', color: '#444444' }}>
          XIAS Cloud Anycast Edge Altyapısı ile Korunmaktadır
        </div>
      </div>
    </div>
  );
}

export default function BakimPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            color: '#666666',
          }}
        >
          <Loader2 size={24} className="pulse-indicator" />
        </div>
      }
    >
      <BakimContent />
    </Suspense>
  );
}
