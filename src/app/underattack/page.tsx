'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getStoredSubdomains } from '@/lib/storage';
import XiasTurnstile from '@/components/XiasTurnstile';
import { Loader2 } from 'lucide-react';

function UnderAttackContent() {
  const searchParams = useSearchParams();
  const domainParam = searchParams.get('domain') || 'deneme.xias.tr';
  const customTarget = searchParams.get('target');
  const tokenParam = searchParams.get('token') || '';

  const [destinationUrl, setDestinationUrl] = useState<string>('');
  const [rayId, setRayId] = useState('');
  const [clientIp, setClientIp] = useState('176.234.89.14');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Generate authentic Ray ID like Cloudflare
    const hex = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setRayId(hex);

    // Determine target URL from claimed subdomains or parameter
    if (customTarget) {
      setDestinationUrl(customTarget);
      return;
    }

    const stored = getStoredSubdomains();
    const found = stored.find(
      (s) => s.fullDomain.toLowerCase() === domainParam.toLowerCase()
    );

    if (found?.redirect?.destinationUrl) {
      setDestinationUrl(found.redirect.destinationUrl);
    } else if (found?.dnsRecords?.length) {
      const cname = found.dnsRecords.find((r) => r.type === 'CNAME');
      const aRec = found.dnsRecords.find((r) => r.type === 'A');
      if (cname) {
        setDestinationUrl(`https://${cname.content}`);
      } else if (aRec) {
        setDestinationUrl(`http://${aRec.content}`);
      } else {
        setDestinationUrl(`https://${domainParam}`);
      }
    } else {
      setDestinationUrl(`https://${domainParam}`);
    }
  }, [domainParam, customTarget]);

  const handleSuccess = (token: string) => {
    setIsRedirecting(true);
    try {
      sessionStorage.setItem(`xias_underattack_pass_${domainParam}`, token);
    } catch {}

    setTimeout(() => {
      const target = destinationUrl.startsWith('http')
        ? destinationUrl
        : `https://${destinationUrl}`;
      window.location.href = target;
    }, 700);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        color: '#ffffff',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
        padding: '24px',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Hostname Header */}
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            marginBottom: '8px',
          }}
        >
          {domainParam}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '15px',
            color: '#888888',
            marginBottom: '32px',
            fontWeight: 400,
          }}
        >
          Site bağlantınızın güvenli olup olmadığı doğrulanıyor
        </p>

        {/* 1:1 CLOUDFLARE TURNSTILE CHALLENGE WIDGET */}
        <div style={{ marginBottom: '28px' }}>
          <XiasTurnstile domain={domainParam} onSuccess={handleSuccess} />
        </div>

        {/* Security Notice Text */}
        <p
          style={{
            fontSize: '13px',
            color: '#666666',
            lineHeight: '1.5',
            maxWidth: '380px',
            margin: '0 auto',
          }}
        >
          <strong>{domainParam}</strong> devam etmeden önce bağlantınızın güvenliğini gözden
          geçirmelidir.
        </p>

        {/* Fallback button if popup/redirect is delayed */}
        {isRedirecting && (
          <a
            href={
              destinationUrl.startsWith('http')
                ? destinationUrl
                : `https://${destinationUrl}`
            }
            style={{
              marginTop: '16px',
              fontSize: '12px',
              color: '#888888',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Yönlendirilmediniz mi? Buraya tıklayın
          </a>
        )}
      </div>

      {/* Cloudflare-style Clean Footer */}
      <footer
        style={{
          position: 'absolute',
          bottom: '24px',
          textAlign: 'center',
          fontSize: '11px',
          color: '#444444',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div>
          Ray ID: <span style={{ fontFamily: 'monospace', color: '#666666' }}>{rayId}</span>{' '}
          &bull; İstemci IP:{' '}
          <span style={{ fontFamily: 'monospace', color: '#666666' }}>{clientIp}</span>
        </div>
        <div>XIAS ile Performans ve Güvenlik</div>
      </footer>
    </div>
  );
}

export default function UnderAttackPage() {
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
      <UnderAttackContent />
    </Suspense>
  );
}
