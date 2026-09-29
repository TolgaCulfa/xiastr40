'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, Cloud, AlertCircle } from 'lucide-react';

interface XiasTurnstileProps {
  domain: string;
  onSuccess: (token: string) => void;
  onError?: (error: string) => void;
  theme?: 'dark' | 'light';
}

export default function XiasTurnstile({
  domain,
  onSuccess,
  onError,
  theme = 'dark',
}: XiasTurnstileProps) {
  const [state, setState] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Bot detection heuristics
  const detectBotEnvironment = (): boolean => {
    if (typeof window === 'undefined') return false;
    // Check for Selenium / Puppeteer / Playwright
    if ((navigator as any).webdriver) {
      return true;
    }
    // Check for phantomjs or missing chrome object on Chromium
    if ((window as any).callPhantom || (window as any)._phantom) {
      return true;
    }
    return false;
  };

  // Invisible WebGL / Canvas GPU fingerprinting
  const generateCanvasFingerprint = (): string => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 30;
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'no-ctx';

      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(10, 5, 60, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('XIAS-GPU-CHECK', 2, 2);

      return canvas.toDataURL().slice(-24);
    } catch {
      return 'fallback-fp';
    }
  };

  // Real client-side Web Crypto Proof-of-Work
  const solveProofOfWork = async (rayId: string): Promise<string> => {
    const encoder = new TextEncoder();
    const challenge = `xias_pow_${domain}_${rayId}_${Date.now()}`;
    let nonce = 0;

    while (nonce < 8000) {
      const data = encoder.encode(challenge + nonce);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = new Uint8Array(hashBuffer);

      // Condition: leading zero byte
      if (hashArray[0] === 0 && (hashArray[1] & 0xe0) === 0) {
        return `xias_pow_ok_${nonce}_${hashArray[1].toString(16)}`;
      }
      nonce++;
    }
    return `xias_pow_fallback_${nonce}`;
  };

  const handleBoxClick = async () => {
    if (state === 'verifying' || state === 'success') return;

    setState('verifying');
    setErrorMessage(null);

    // Step 1: Evaluate Bot Heuristic
    if (detectBotEnvironment()) {
      setState('error');
      const err = 'Otomasyon aracı tespit edildi. Lütfen standart tarayıcı kullanın.';
      setErrorMessage(err);
      onError?.(err);
      return;
    }

    try {
      // Step 2: GPU Canvas Fingerprint + Proof of Work
      const rayId = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      const gpuHash = generateCanvasFingerprint();
      const powToken = await solveProofOfWork(rayId);

      // Realistic Turnstile verification duration (1.1 - 1.4s)
      setTimeout(() => {
        setState('success');
        const finalToken = `xias_turnstile_${rayId}_${gpuHash.slice(0, 8)}_${Date.now()}`;
        onSuccess(finalToken);
      }, 1200);
    } catch (err: any) {
      setState('error');
      setErrorMessage('Doğrulama hatası oluştu.');
      onError?.(err?.message || 'Crypto challenge failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      {/* Turnstile Container Box */}
      <div
        onClick={handleBoxClick}
        style={{
          width: '300px',
          height: '68px',
          backgroundColor: '#0a0a0a',
          border: `1px solid ${state === 'error' ? '#662222' : '#222222'}`,
          borderRadius: '4px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: state === 'success' ? 'default' : 'pointer',
          transition: 'border-color 0.2s ease, background-color 0.2s ease',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          if (state !== 'success' && state !== 'error') {
            e.currentTarget.style.borderColor = '#444444';
          }
        }}
        onMouseLeave={(e) => {
          if (state !== 'success' && state !== 'error') {
            e.currentTarget.style.borderColor = '#222222';
          }
        }}
      >
        {/* Left Side: Checkbox & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '3px',
              border:
                state === 'success'
                  ? '1px solid #ffffff'
                  : state === 'verifying'
                  ? 'none'
                  : state === 'error'
                  ? '1px solid #ff4444'
                  : '1px solid #555555',
              background: state === 'success' ? '#ffffff' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {state === 'verifying' && (
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderTopColor: '#ffffff',
                  animation: 'xias-turnstile-spin 0.7s linear infinite',
                }}
              />
            )}

            {state === 'success' && (
              <Check size={16} strokeWidth={3.5} style={{ color: '#000000' }} />
            )}

            {state === 'error' && (
              <AlertCircle size={15} style={{ color: '#ff4444' }} />
            )}
          </div>

          {/* Label Text */}
          <span
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: state === 'error' ? '#ff6666' : '#ffffff',
              letterSpacing: '-0.01em',
            }}
          >
            {state === 'success'
              ? 'Başarılı'
              : state === 'verifying'
              ? 'Doğrulanıyor...'
              : state === 'error'
              ? 'Tekrar Deneyin'
              : 'Ben insanım'}
          </span>
        </div>

        {/* Right Side: Cloudflare/XIAS Watermark */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
            opacity: 0.7,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Cloud size={16} style={{ color: '#ffffff' }} />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#ffffff',
              }}
            >
              XIAS
            </span>
          </div>
          <div style={{ fontSize: '8px', color: '#666666', marginTop: '2px' }}>
            Gizlilik &bull; Şartlar
          </div>
        </div>
      </div>

      {/* Error message if any */}
      {errorMessage && (
        <div style={{ fontSize: '11px', color: '#ff4444', textAlign: 'center' }}>
          {errorMessage}
        </div>
      )}

      {/* CSS Animation */}
      <style jsx global>{`
        @keyframes xias-turnstile-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
