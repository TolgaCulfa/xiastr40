'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, LogOut, ArrowRight, User } from 'lucide-react';
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
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid #1a1a1a',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Brand / Logo */}
        <Link 
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: '#ffffff',
            color: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '14px',
          }}>
            X
          </div>
          <div>
            <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              XIAS<span style={{ color: '#888888' }}>.DNS</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link
            href="/"
            style={{
              padding: '7px 12px',
              fontSize: '13px',
              fontWeight: 500,
              color: pathname === '/' ? '#ffffff' : '#888888',
              backgroundColor: pathname === '/' ? '#111111' : 'transparent',
              borderRadius: 'var(--radius-sm)',
              border: pathname === '/' ? '1px solid #222222' : '1px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            Ana Sayfa
          </Link>

          <Link
            href="/subdomain-al"
            style={{
              padding: '7px 12px',
              fontSize: '13px',
              fontWeight: 500,
              color: pathname === '/subdomain-al' ? '#ffffff' : '#888888',
              backgroundColor: pathname === '/subdomain-al' ? '#111111' : 'transparent',
              borderRadius: 'var(--radius-sm)',
              border: pathname === '/subdomain-al' ? '1px solid #222222' : '1px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            Subdomain Al
          </Link>

          <Link
            href="/dashboard"
            style={{
              padding: '7px 12px',
              fontSize: '13px',
              fontWeight: 500,
              color: pathname === '/dashboard' ? '#ffffff' : '#888888',
              backgroundColor: pathname === '/dashboard' ? '#111111' : 'transparent',
              borderRadius: 'var(--radius-sm)',
              border: pathname === '/dashboard' ? '1px solid #222222' : '1px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            Dashboard
          </Link>
        </nav>

        {/* Right Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                href="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#0a0a0a',
                  border: '1px solid #222222',
                  color: '#ffffff',
                  fontSize: '12px',
                }}
              >
                <User size={13} />
                <span>{currentUser.name}</span>
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'transparent',
                  border: '1px solid #222222',
                  color: '#888888',
                  fontSize: '12px',
                }}
                title="Çıkış Yap"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                href="/login"
                style={{
                  padding: '7px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#a3a3a3',
                }}
              >
                Giriş
              </Link>

              <Link
                href="/register"
                className="btn-primary"
                style={{ padding: '7px 14px', fontSize: '12px' }}
              >
                <span>Kayıt Ol</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
