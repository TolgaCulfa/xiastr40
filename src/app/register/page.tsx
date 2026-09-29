'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Fingerprint,
} from 'lucide-react';
import { registerUser, getCurrentUser } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const existing = getCurrentUser();
    if (existing) {
      router.push('/dashboard');
    }
  }, [router]);

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'Girilmedi', color: '#333333' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, text: 'Zayıf', color: '#555555' };
    if (score <= 3) return { score: 2, text: 'Orta', color: '#888888' };
    if (score <= 4) return { score: 3, text: 'Güçlü', color: '#cccccc' };
    return { score: 4, text: 'Kurumsal Seviye (256-Bit)', color: '#ffffff' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }

    if (!termsAccepted) {
      setError('Devam etmek için hizmet koşullarını kabul etmelisiniz.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser(name, email, password);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Kayıt işlemi gerçekleştirilemedi.');
      }
    } catch (err: any) {
      setError(err?.message || 'Sunucu ile bağlantı kurulamadı.');
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

      {/* Main Register Card */}
      <div
        className="card animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '440px',
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
            <span>Ücretsiz & Limitsiz DNS Hesabı</span>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Yeni Hesap Oluştur
          </h1>
          <p style={{ fontSize: '13px', color: '#777777', marginTop: '4px' }}>
            xias.tr ve xias.info uzantılarını ücretsiz kaydedin
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
          <Link
            href="/login"
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
            Giriş Yap
          </Link>
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
            Kayıt Ol
          </button>
        </div>

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
            <AlertCircle size={16} style={{ color: '#ffffff', flexShrink: 0, marginTop: '2px' }} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#a3a3a3', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ad Soyad
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tolga Culfa"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  background: '#000000',
                  border: '1px solid #262626',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666666' }} />
            </div>
          </div>

          {/* Email Field */}
          <div style={{ marginBottom: '14px' }}>
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
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  background: '#000000',
                  border: '1px solid #262626',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666666' }} />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Şifre Belirleyin
              </label>
              {password && (
                <span style={{ fontSize: '11px', fontWeight: 600, color: strength.color }}>
                  {strength.text}
                </span>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 6 karakter"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 36px',
                  background: '#000000',
                  border: '1px solid #262626',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
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

            {/* Strength bar indicator */}
            {password && (
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    style={{
                      flex: 1,
                      height: '3px',
                      background: strength.score >= step ? strength.color : '#1a1a1a',
                      borderRadius: '1px',
                      transition: 'background 0.2s ease',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#a3a3a3', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Şifre Tekrarı
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Şifrenizi tekrar girin"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  background: '#000000',
                  border: '1px solid #262626',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666666' }} />
            </div>
          </div>

          {/* Terms checkbox */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', color: '#888888', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{
                  width: '15px',
                  height: '15px',
                  accentColor: '#ffffff',
                  cursor: 'pointer',
                  marginTop: '2px',
                }}
              />
              <span>
                Kullanım koşullarını ve XIAS Cloud DNS Hizmet Şartlarını okudum, kabul ediyorum.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
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
            <span>{isLoading ? 'Hesap Oluşturuluyor...' : 'Ücretsiz Hesabımı Başlat'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Footer */}
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
            <span>Kredi Kartı Gerekmez &bull; %100 Ücretsiz</span>
          </div>
          <div style={{ textAlign: 'center', color: '#555555' }}>
            Zaten bir hesabınız var mı? <Link href="/login" style={{ color: '#ffffff', fontWeight: 600, textDecoration: 'underline' }}>Giriş Yapın</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
