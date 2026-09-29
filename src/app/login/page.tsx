'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Clock,
  Fingerprint,
} from 'lucide-react';
import { loginUser, getCurrentUser } from '@/lib/auth';

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Check existing session or remembered email
  useEffect(() => {
    const existing = getCurrentUser();
    if (existing) {
      router.push('/dashboard');
      return;
    }

    const savedEmail = localStorage.getItem('xias_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }

    const savedAttempts = parseInt(localStorage.getItem('xias_login_fails') || '0', 10);
    const lockoutUntil = parseInt(localStorage.getItem('xias_lockout_until') || '0', 10);
    const now = Date.now();

    if (lockoutUntil > now) {
      const remainingSec = Math.ceil((lockoutUntil - now) / 1000);
      setLockoutTimer(remainingSec);
      setFailedAttempts(savedAttempts);
    } else if (savedAttempts > 0) {
      setFailedAttempts(savedAttempts);
    }
  }, [router]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          localStorage.removeItem('xias_lockout_until');
          localStorage.setItem('xias_login_fails', '0');
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (lockoutTimer > 0) {
      setError(`Güvenlik Protokolü: Lütfen ${lockoutTimer} saniye bekleyin.`);
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser(email, password);

      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('xias_remembered_email', email);
        } else {
          localStorage.removeItem('xias_remembered_email');
        }

        // Reset fail counters
        localStorage.removeItem('xias_login_fails');
        localStorage.removeItem('xias_lockout_until');

        router.push('/dashboard');
      } else {
        const nextFails = failedAttempts + 1;
        setFailedAttempts(nextFails);
        localStorage.setItem('xias_login_fails', nextFails.toString());

        if (nextFails >= MAX_ATTEMPTS) {
          const lockTime = Date.now() + LOCKOUT_SECONDS * 1000;
          localStorage.setItem('xias_lockout_until', lockTime.toString());
          setLockoutTimer(LOCKOUT_SECONDS);
          setError(`Çok fazla hatalı deneme! Güvenlik nedeniyle oturum ${LOCKOUT_SECONDS} saniye kilitlendi.`);
        } else {
          setError(`${result.error || 'Hatalı e-posta veya şifre.'} (Kalan hak: ${MAX_ATTEMPTS - nextFails})`);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Giriş işlemi sırasında bağlantı hatası oluştu.');
    } finally {
      setIsLoading(false);
    }
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
    }}>
      {/* Brand Header */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', textDecoration: 'none' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-sm)',
          background: '#ffffff',
          color: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: '16px',
          letterSpacing: '-0.05em',
        }}>
          X
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            XIAS.DNS
          </span>
          <span style={{ fontSize: '10px', color: '#666666', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Cloud Subdomain Gateway
          </span>
        </div>
      </Link>

      {/* Main Login Card */}
      <div
        className="card animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '32px',
          background: '#0a0a0a',
          border: '1px solid #1a1a1a',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            background: '#111111',
            borderRadius: 'var(--radius-full)',
            border: '1px solid #222222',
            fontSize: '11px',
            color: '#a3a3a3',
            marginBottom: '12px',
          }}>
            <Fingerprint size={12} style={{ color: '#ffffff' }} />
            <span>256-Bit SHA Güvenli Oturum</span>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Yönetim Paneline Giriş
          </h1>
          <p style={{ fontSize: '13px', color: '#777777', marginTop: '4px' }}>
            xias.tr ve xias.info alt alan adlarınızı yönetin
          </p>
        </div>

        {/* Tab switch */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#000000',
          padding: '3px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid #1c1c1c',
          marginBottom: '20px',
        }}>
          <button
            type="button"
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 600,
              background: '#ffffff',
              color: '#000000',
              cursor: 'default',
            }}
          >
            Giriş Yap
          </button>
          <Link
            href="/register"
            style={{
              padding: '8px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 500,
              color: '#777777',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
          >
            Kayıt Ol
          </Link>
        </div>

        {/* Error / Lockout Banner */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: '#141414',
            border: '1px solid #333333',
            color: '#ffffff',
            fontSize: '12px',
            lineHeight: '1.4',
            marginBottom: '16px',
          }}>
            {lockoutTimer > 0 ? (
              <Clock size={16} style={{ color: '#ffffff', flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <AlertCircle size={16} style={{ color: '#ffffff', flexShrink: 0, marginTop: '2px' }} />
            )}
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* E-mail Field */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#a3a3a3', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              E-posta Adresi
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="isim@sirket.com"
                disabled={lockoutTimer > 0 || isLoading}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  background: '#000000',
                  border: '1px solid #262626',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                }}
              />
              <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666666' }} />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Hesap Şifresi
              </label>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={lockoutTimer > 0 || isLoading}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 36px',
                  background: '#000000',
                  border: '1px solid #262626',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                }}
              />
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666666' }} />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666666',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Remember Me and Security Check */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            fontSize: '12px',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#a3a3a3' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '15px',
                  height: '15px',
                  accentColor: '#ffffff',
                  cursor: 'pointer',
                }}
              />
              <span>Beni Hatırla</span>
            </label>

            <span style={{ color: '#666666', fontSize: '11px' }}>
              SHA-256 Korumalı
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || lockoutTimer > 0}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>
              {lockoutTimer > 0
                ? `Kilitli (${lockoutTimer}s)`
                : isLoading
                ? 'Doğrulanıyor...'
                : 'Güvenli Giriş Yap'}
            </span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Security Footer Details */}
        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #1a1a1a',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '11px',
          color: '#666666',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <ShieldCheck size={14} style={{ color: '#ffffff' }} />
            <span>Cloudflare DDoS & Anycast Altyapısı</span>
          </div>
          <div style={{ textAlign: 'center', color: '#555555' }}>
            Hesabınız yok mu? <Link href="/register" style={{ color: '#ffffff', fontWeight: 600, textDecoration: 'underline' }}>Hemen Ücretsiz Kayıt Olun</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
