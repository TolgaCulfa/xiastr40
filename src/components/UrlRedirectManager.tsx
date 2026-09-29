'use client';

import React, { useState } from 'react';
import { ClaimedSubdomain, UrlRedirect } from '@/lib/types';
import { ArrowRight, ExternalLink, Globe, Link2, Check, RefreshCw, AlertCircle } from 'lucide-react';

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
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
          Doğrudan URL Yönlendirme (Page Rule Forwarding)
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Sunucu kurmadan veya kod yazmadan <strong>{subdomain.fullDomain}</strong> adresini doğrudan harici bir linke yönlendirin.
        </p>
      </div>

      {/* Visual Flow Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-input)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={16} style={{ color: 'var(--cf-orange)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
            https://{subdomain.fullDomain}
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 8px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--cf-orange-subtle)',
          border: '1px solid var(--cf-orange-border)',
          color: 'var(--cf-orange)',
          fontSize: '11px',
          fontWeight: 600,
        }}>
          <span>HTTP {statusCode}</span>
          <ArrowRight size={12} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link2 size={16} style={{ color: 'var(--blue)' }} />
          <span style={{
            fontSize: '13px',
            fontWeight: 500,
            color: destination && destination !== 'https://' ? 'var(--blue)' : 'var(--text-muted)',
            maxWidth: '240px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {destination && destination !== 'https://' ? destination : 'Hedef URL Bekleniyor...'}
          </span>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="card" style={{ padding: '20px', background: 'var(--bg-surface)' }}>
        
        {/* Destination URL */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Yönlendirilecek Hedef Web Adresi:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="url"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="https://github.com/kullaniciadi veya https://linkedin.com/in/..."
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                fontSize: '14px',
              }}
            />

            {destination && destination.startsWith('http') && (
              <a
                href={destination}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ padding: '10px 14px' }}
                title="Hedef linki yeni sekmede test et"
              >
                <ExternalLink size={15} />
              </a>
            )}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Kullanıcılar <strong>{subdomain.fullDomain}</strong> adresini ziyaret ettiğinde anında buraya yönlendirilir.
          </div>
        </div>

        {/* Status Code Selection */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Yönlendirme Durum Kodu (HTTP Response):
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: statusCode === 301 ? 'var(--cf-orange-subtle)' : 'var(--bg-input)',
              border: `1px solid ${statusCode === 301 ? 'var(--cf-orange-border)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
            }}>
              <input
                type="radio"
                name="statusSelection"
                checked={statusCode === 301}
                onChange={() => setStatusCode(301)}
                style={{ marginTop: '2px', accentColor: 'var(--cf-orange)' }}
              />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                  301 Moved Permanently
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Kalıcı yönlendirme. Arama motorları (SEO) için en uygunudur ve tarayıcılar tarafından önbelleğe alınır.
                </div>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: statusCode === 302 ? 'var(--cf-orange-subtle)' : 'var(--bg-input)',
              border: `1px solid ${statusCode === 302 ? 'var(--cf-orange-border)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
            }}>
              <input
                type="radio"
                name="statusSelection"
                checked={statusCode === 302}
                onChange={() => setStatusCode(302)}
                style={{ marginTop: '2px', accentColor: 'var(--cf-orange)' }}
              />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                  302 Found (Geçici)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Geçici yönlendirme. Hedef link sık sık değişecekse veya A/B testi yapılıyorsa tercih edilir.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Path Preservation & Active toggles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={preservePath}
              onChange={(e) => setPreservePath(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--cf-orange)' }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>
                Yolu Koru (Preserve Path)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                örn: /hakkimda otomatik olarak hedefe eklenir
              </div>
            </div>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--emerald)' }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>
                Yönlendirme Aktif
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Trafik Cloudflare Edge üzerinden anında yönlendirilir
              </div>
            </div>
          </label>
        </div>

        {/* Footer buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            {currentRedirect && (
              <button
                type="button"
                onClick={handleRemoveRedirect}
                className="btn-danger"
              >
                Yönlendirmeyi Kaldır
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {savedFeedback && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--emerald)', fontSize: '13px' }}>
                <Check size={16} />
                <span>Yönlendirme kuralı kaydedildi!</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '8px 20px' }}
            >
              Yapılandırmayı Kaydet
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
