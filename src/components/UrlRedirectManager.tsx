'use client';

import React, { useState } from 'react';
import { ClaimedSubdomain, UrlRedirect } from '@/lib/types';
import { ArrowRight, ExternalLink, Globe, Link2, Check } from 'lucide-react';

interface UrlRedirectManagerProps {
  subdomain: ClaimedSubdomain;
  onUpdateRedirect: (redirect: UrlRedirect | undefined) => void;
}

export default function UrlRedirectManager({ subdomain, onUpdateRedirect }: UrlRedirectManagerProps) {
  const currentRedirect = subdomain.redirect;

  const [destination, setDestination] = useState(currentRedirect?.destinationUrl || 'https://');
  const [statusCode, setStatusCode] = useState<301 | 302>(currentRedirect?.statusCode || 301);
  const [preservePath, setPreservePath] = useState(currentRedirect?.preservePath ?? true);
  const [isActive, setIsActive] = useState(currentRedirect?.active ?? true);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim() || destination.trim() === 'https://') return;

    const updated: UrlRedirect = {
      id: currentRedirect?.id || `redir-${Date.now()}`,
      subdomainId: subdomain.id,
      destinationUrl: destination.trim(),
      statusCode: statusCode,
      preservePath: preservePath,
      active: isActive,
      createdAt: currentRedirect?.createdAt || new Date().toISOString(),
    };

    onUpdateRedirect(updated);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleRemoveRedirect = () => {
    onUpdateRedirect(undefined);
  };

  return (
    <div style={{ padding: '20px 0' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
          URL Yönlendirme (HTTP 301 / 302)
        </h4>
        <p style={{ fontSize: '12px', color: '#888888' }}>
          <strong>{subdomain.fullDomain}</strong> adresini doğrudan harici bir web bağlantısına yönlendirin.
        </p>
      </div>

      {/* Visual Flow Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: 'var(--radius-sm)',
        background: '#000000',
        border: '1px solid #1c1c1c',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Globe size={14} style={{ color: '#ffffff' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
            https://{subdomain.fullDomain}
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          background: '#161616',
          border: '1px solid #262626',
          color: '#ffffff',
          fontSize: '11px',
        }}>
          <span>HTTP {statusCode}</span>
          <ArrowRight size={11} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link2 size={14} style={{ color: '#888888' }} />
          <span style={{
            fontSize: '13px',
            color: destination && destination !== 'https://' ? '#ffffff' : '#666666',
            maxWidth: '260px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {destination && destination !== 'https://' ? destination : 'Hedef URL bekleniyor...'}
          </span>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} style={{ background: '#0a0a0a' }}>
        
        {/* Destination URL */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#a3a3a3', marginBottom: '6px' }}>
            Hedef Web Bağlantısı:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="url"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="https://github.com/kullaniciadi veya https://linkedin.com/..."
              style={{
                flex: 1,
                padding: '9px 12px',
                background: '#000000',
                border: '1px solid #222222',
                borderRadius: 'var(--radius-sm)',
                color: '#ffffff',
                fontSize: '13px',
              }}
            />

            {destination && destination.startsWith('http') && (
              <a
                href={destination}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ padding: '9px 12px' }}
                title="Hedef linki yeni sekmede test et"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {/* Status Code Selection */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#a3a3a3', marginBottom: '8px' }}>
            Yönlendirme Türü:
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: '#000000',
              border: `1px solid ${statusCode === 301 ? '#ffffff' : '#1c1c1c'}`,
              cursor: 'pointer',
            }}>
              <input
                type="radio"
                name="statusSelection"
                checked={statusCode === 301}
                onChange={() => setStatusCode(301)}
                style={{ marginTop: '2px', accentColor: '#ffffff' }}
              />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>
                  301 Kalıcı (SEO Dostu)
                </div>
                <div style={{ fontSize: '11px', color: '#666666', marginTop: '2px' }}>
                  Arama motorları ve tarayıcılar için önerilen yönlendirme.
                </div>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: '#000000',
              border: `1px solid ${statusCode === 302 ? '#ffffff' : '#1c1c1c'}`,
              cursor: 'pointer',
            }}>
              <input
                type="radio"
                name="statusSelection"
                checked={statusCode === 302}
                onChange={() => setStatusCode(302)}
                style={{ marginTop: '2px', accentColor: '#ffffff' }}
              />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>
                  302 Geçici
                </div>
                <div style={{ fontSize: '11px', color: '#666666', marginTop: '2px' }}>
                  Hedef URL sık değişecekse tercih edilir.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Path Preservation & Active */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            background: '#000000',
            border: '1px solid #1c1c1c',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#a3a3a3',
          }}>
            <input
              type="checkbox"
              checked={preservePath}
              onChange={(e) => setPreservePath(e.target.checked)}
              style={{ accentColor: '#ffffff' }}
            />
            <span>Yolu Koru (/ornek &rarr; hedef/ornek)</span>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            background: '#000000',
            border: '1px solid #1c1c1c',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#a3a3a3',
          }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ accentColor: '#ffffff' }}
            />
            <span>Yönlendirme Aktif</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {currentRedirect && (
              <button type="button" onClick={handleRemoveRedirect} className="btn-danger btn-sm">
                Kaldır
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {savedFeedback && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff', fontSize: '12px' }}>
                <Check size={14} />
                <span>Kaydedildi</span>
              </div>
            )}

            <button type="submit" className="btn-primary btn-sm">
              Yapılandırmayı Kaydet
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
