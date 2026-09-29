'use client';

import React from 'react';
import { Cloud, Shield, Server, Settings, Globe, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onNavigate: (sectionId: string) => void;
  activeSection: string;
  hasCfToken: boolean;
}

export default function Navbar({ onOpenSettings, onNavigate, activeSection, hasCfToken }: NavbarProps) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backgroundColor: 'rgba(9, 9, 11, 0.88)',
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
        <div 
          onClick={() => onNavigate('search')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
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
                Edge DNS
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
              xias.tr &bull; xias.info
            </div>
          </div>
        </div>

        {/* Center Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => onNavigate('search')}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 500,
              color: activeSection === 'search' ? '#ffffff' : 'var(--text-secondary)',
              backgroundColor: activeSection === 'search' ? 'var(--bg-surface-elevated)' : 'transparent',
              borderRadius: 'var(--radius-md)',
              border: activeSection === 'search' ? '1px solid var(--border-medium)' : '1px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            Subdomain Al
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 500,
              color: activeSection === 'dashboard' ? '#ffffff' : 'var(--text-secondary)',
              backgroundColor: activeSection === 'dashboard' ? 'var(--bg-surface-elevated)' : 'transparent',
              borderRadius: 'var(--radius-md)',
              border: activeSection === 'dashboard' ? '1px solid var(--border-medium)' : '1px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            DNS Paneli
          </button>

          <button
            onClick={() => onNavigate('guides')}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 500,
              color: activeSection === 'guides' ? '#ffffff' : 'var(--text-secondary)',
              backgroundColor: activeSection === 'guides' ? 'var(--bg-surface-elevated)' : 'transparent',
              borderRadius: 'var(--radius-md)',
              border: activeSection === 'guides' ? '1px solid var(--border-medium)' : '1px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            Entegrasyon Kılavuzları
          </button>
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Edge status badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: 'var(--emerald)',
              display: 'inline-block',
            }} className="pulse-indicator" />
            <span>330+ Edge Aktif</span>
          </div>

          {/* Cloudflare Settings Trigger */}
          <button
            onClick={onOpenSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '7px 12px',
              borderRadius: 'var(--radius-md)',
              background: hasCfToken ? 'var(--cf-orange-subtle)' : 'var(--bg-surface-elevated)',
              border: hasCfToken ? '1px solid var(--cf-orange-border)' : '1px solid var(--border-medium)',
              color: hasCfToken ? 'var(--cf-orange)' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
            title="Cloudflare API Yapılandırması"
          >
            <Settings size={14} />
            <span>Cloudflare API</span>
            {hasCfToken && (
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--cf-orange)',
              }} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
