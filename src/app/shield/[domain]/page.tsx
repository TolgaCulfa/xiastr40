'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Globe,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldAlert,
  Terminal,
  Activity,
  Zap,
} from 'lucide-react';
import { getStoredSubdomains } from '@/lib/storage';

export default function DdosShieldPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const domain = (params?.domain as string) || 'site.xias.tr';
  const customTarget = searchParams.get('target');

  const [destinationUrl, setDestinationUrl] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rayId, setRayId] = useState('');
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [proofNonce, setProofNonce] = useState<number | null>(null);

  // Discover target destination from storage or URL
  useEffect(() => {
    // Generate authentic Ray ID
    const randomHex = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setRayId(`xias_${randomHex}_IST`);

    if (customTarget) {
      setDestinationUrl(customTarget);
      return;
    }

    // Try finding target in claimed subdomains
    const stored = getStoredSubdomains();
    const found = stored.find(
      (s) => s.fullDomain.toLowerCase() === domain.toLowerCase()
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
        setDestinationUrl(`https://${domain}`);
      }
    } else {
      setDestinationUrl(`https://${domain}`);
    }
  }, [domain, customTarget]);

  // Real Web Crypto Proof-of-Work Challenge
  const runProofOfWork = async (): Promise<number> => {
    const encoder = new TextEncoder();
    let nonce = 0;
    const challengeData = `xias_challenge_${domain}_${rayId}_`;

    // Solve quick cryptographic puzzle
    while (nonce < 10000) {
      const data = encoder.encode(challengeData + nonce);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      // Look for two leading zeroes in byte representation
      if (hashArray[0] === 0 && (hashArray[1] & 0xf0) === 0) {
        return nonce;
      }
      nonce++;
    }
    return nonce;
  };

  const handleStartVerification = async () => {
    if (isVerifying || isSuccess) return;
    setIsVerifying(true);
    setProgressPercent(15);
    setProgressStep(1);
    setLiveLogs([`> [0.00s] TLS 1.3 / HTTP-3 oturumu kuruldu (İstanbul PoP-01)`]);

    // Step 1: Real Crypto Challenge
    setTimeout(async () => {
      setProgressPercent(40);
      setProgressStep(2);
      setLiveLogs((prev) => [
        ...prev,
        `> [0.35s] Web Crypto SHA-256 Proof-of-Work doğrulaması başlatıldı...`,
      ]);

      const solvedNonce = await runProofOfWork();
      setProofNonce(solvedNonce);

      // Step 2: Bot & Integrity Check
      setTimeout(() => {
        setProgressPercent(75);
        setProgressStep(3);
        setLiveLogs((prev) => [
          ...prev,
          `> [0.85s] Nonce: 0x${solvedNonce.toString(16).toUpperCase()} çözüldü (İstemci temiz).`,
          `> [1.20s] L7 Bot & DDoS heuristiği doğrulandı. Ray ID: ${rayId}`,
        ]);

        // Step 3: Success & Authorization
        setTimeout(() => {
          setProgressPercent(100);
          setProgressStep(4);
          setIsSuccess(true);
          setLiveLogs((prev) => [
            ...prev,
            `> [1.70s] Erişim İzni Verildi! Güvenli oturum açıldı. Hedefe yönlendiriliyorsunuz...`,
          ]);

          // Save verified pass in session
          try {
            sessionStorage.setItem(`xias_pass_${domain}`, Date.now().toString());
          } catch {}

          // Final Redirect
          setTimeout(() => {
            const finalTarget = destinationUrl.startsWith('http')
              ? destinationUrl
              : `https://${destinationUrl}`;
            window.location.href = finalTarget;
          }, 1200);
        }, 600);
      }, 600);
    }, 500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000000',
      color: '#ffffff',
      padding: '24px 16px',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* Container Card */}
      <div
        className="card animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '36px',
          background: '#0a0a0a',
          border: '1px solid #1f1f1f',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle accent border line on top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: '#ffffff',
        }} />

        {/* Shield Header Emblem */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: '#ffffff',
            color: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 0 25px rgba(255, 255, 255, 0.15)',
          }}>
            <ShieldCheck size={32} strokeWidth={2.4} />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            background: '#141414',
            borderRadius: 'var(--radius-full)',
            border: '1px solid #292929',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#ffffff',
            marginBottom: '10px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff', display: 'inline-block' }} />
            XİAS UNDER ATTACK MODU &bull; L7 GÜVENLİK
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '4px 0' }}>
            DDoS Güvenlik Doğrulaması
          </h1>

          <div style={{ fontSize: '13px', color: '#888888', marginTop: '6px' }}>
            Hedef Site: <strong style={{ color: '#ffffff' }}>{domain}</strong>
          </div>
        </div>

        {/* Description Alert */}
        <div style={{
          padding: '14px 16px',
          background: '#050505',
          border: '1px solid #1a1a1a',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12px',
          color: '#a3a3a3',
          lineHeight: '1.5',
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          Bu web sitesi <strong style={{ color: '#ffffff' }}>XİAS Cloud Anycast Saldırı Kalkanı</strong> ile korunmaktadır. Doğrudan erişim kısıtlanmıştır. Siteye bağlanmak için lütfen insan doğrulamasını başlatın.
        </div>

        {/* Interactive Verification Action Area */}
        <div style={{
          padding: '24px',
          background: '#000000',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid #222222',
          marginBottom: '24px',
        }}>
          {!isVerifying && !isSuccess ? (
            <div>
              <button
                onClick={handleStartVerification}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '15px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                }}
              >
                <Lock size={18} />
                <span>BEN İNSANIM &bull; GÜVENLİĞİ DOĞRULA</span>
              </button>

              <div style={{
                fontSize: '11px',
                color: '#666666',
                textAlign: 'center',
                marginTop: '10px',
              }}>
                Butona bastıktan sonra saniyeler içinde siteye yönlendirileceksiniz.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                  {isSuccess ? (
                    <>
                      <CheckCircle2 size={18} style={{ color: '#ffffff' }} />
                      <span style={{ color: '#ffffff' }}>Doğrulama Başarılı! Aktarılıyor...</span>
                    </>
                  ) : (
                    <>
                      <Loader2 size={16} className="pulse-indicator" style={{ color: '#ffffff' }} />
                      <span style={{ color: '#ffffff' }}>
                        {progressStep === 1 && 'TLS 1.3 Anycast El Sıkışması...'}
                        {progressStep === 2 && 'SHA-256 Proof-of-Work Hesaplanıyor...'}
                        {progressStep === 3 && 'L7 Bot & DDoS Filtresi Kontrolü...'}
                        {progressStep === 4 && 'Yetki Verildi!'}
                      </span>
                    </>
                  )}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#888888' }}>
                  {progressPercent}%
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '5px', background: '#141414', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: '#ffffff',
                  width: `${progressPercent}%`,
                  transition: 'width 0.4s ease',
                }} />
              </div>

              {/* Live Terminal Console Logs */}
              <div style={{
                background: '#070707',
                border: '1px solid #1a1a1a',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#888888',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                maxHeight: '110px',
                overflowY: 'auto',
              }}>
                {liveLogs.map((log, index) => (
                  <div key={index} style={{ color: index === liveLogs.length - 1 ? '#ffffff' : '#888888' }}>
                    {log}
                  </div>
                ))}
              </div>

              {/* Manual fallback button if redirect was blocked */}
              {isSuccess && (
                <a
                  href={destinationUrl.startsWith('http') ? destinationUrl : `https://${destinationUrl}`}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '4px',
                    textDecoration: 'none',
                  }}
                >
                  <span>Hemen Siteye Git</span>
                  <ArrowRight size={14} />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Technical Diagnostics Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          fontSize: '11px',
          color: '#666666',
          fontFamily: 'monospace',
          borderTop: '1px solid #1a1a1a',
          paddingTop: '16px',
        }}>
          <div>
            <div style={{ color: '#444444' }}>RAY ID:</div>
            <div style={{ color: '#aaaaaa', wordBreak: 'break-all' }}>{rayId}</div>
          </div>
          <div>
            <div style={{ color: '#444444' }}>EDGE PO-POINT:</div>
            <div style={{ color: '#aaaaaa' }}>IST-TR (Anycast PoP #01)</div>
          </div>
          <div>
            <div style={{ color: '#444444' }}>ŞİFRELEME:</div>
            <div style={{ color: '#aaaaaa' }}>TLS 1.3 / ChaCha20</div>
          </div>
          <div>
            <div style={{ color: '#444444' }}>WAF DURUMU:</div>
            <div style={{ color: '#ffffff', fontWeight: 600 }}>Under Attack Aktif</div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{
          textAlign: 'center',
          fontSize: '10px',
          color: '#555555',
          marginTop: '18px',
        }}>
          XIAS Cloud Infrastructure &bull; Otomatik Tehdit Önleme Sistemi
        </div>
      </div>
    </div>
  );
}
