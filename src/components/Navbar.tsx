'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Cloud, User, LogOut, ArrowRight } from 'lucide-react';
import { getCurrentUser, logoutUser, User as AuthUser } from '@/lib/auth';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setLocalUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setLocalUser(getCurrentUser());
  }, [pathname]);

  const handleLogout = () => {
    logoutUser();
    setLocalUser(null);
    router.push('/login');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(9, 9, 11, 0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      transition: 'all 0.2s ease',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px',
      }}>
        {/* Brand / Logo */}
        <Link 
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #18181f 0%, #22222a 100%)',
            border: '1px solid var(--cf-orange-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cf-orange)',
          }}>
            <Cloud size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
                XIAS<span style={{ color: 'var(--cf-orange)' }}>.DNS</span>
              </span>
              <span className="badge badge-cf" style={{ fontSize: '11px', padding: '2px 7px' }}>
                Subdomain
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
              xias.tr &bull; xias.info
            </div>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            href="/"
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 500,
              color: pathname === '/' ? '#ffffff' : 'var(--text-secondary)',
              backgroundColor: pathname === '/' ? 'var(--bg-surface-elevated)' : 'transparent',
              borderRadius: 'var(--radius-md)',
              border: pathname === '/' ? '1px solid var(--border-medium)' : '1px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            Ana Sayfa
          </Link>

          <Link
            href="/subdomain-al"
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 600,
              color: pathname === '/subdomain-al' ? '#ffffff' : 'var(--cf-orange)',
              backgroundColor: pathname === '/subdomain-al' ? 'var(--cf-orange-subtle)' : 'transparent',
              borderRadius: 'var(--radius-md)',
              border: pathname === '/subdomain-al' ? '1px solid var(--cf-orange-border)' : '1px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            Subdomain Al
          </Link>

          <Link
            href="/dashboard"
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 500,
              color: pathname === '/dashboard' ? '#ffffff' : 'var(--text-secondary)',
              backgroundColor: pathname === '/dashboard' ? 'var(--bg-surface-elevated)' : 'transparent',
              borderRadius: 'var(--radius-md)',
              border: pathname === '/dashboard' ? '1px solid var(--border-medium)' : '1px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            Dashboard
          </Link>
        </nav>

        {/* Right Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link
                href="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--cf-orange)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                }}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span>{currentUser.name}</span>
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  transition: 'all 0.15s ease',
                }}
                title="Çıkış Yap"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                href="/login"
                style={{
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'color 0.15s ease',
                }}
              >
                Giriş Yap
              </Link>

              <Link
                href="/register"
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <span>Kayıt Ol</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
