'use client';

import React, { useState } from 'react';
import { DomainZone, ClaimedSubdomain, DnsRecord, UrlRedirect } from '@/lib/types';
import { X, Cloud, Shield, Globe, ArrowRight, Check, Server, Link as LinkIcon } from 'lucide-react';

interface ClaimModalProps {
  subdomain: string;
  domainZone: DomainZone;
  onClose: () => void;
  onSuccess: (newSubdomain: ClaimedSubdomain) => void;
}

type SetupType = 'cname' | 'a_record' | 'redirect';

export default function ClaimModal({ subdomain, domainZone, onClose, onSuccess }: ClaimModalProps) {
  const fullDomain = `${subdomain}.${domainZone}`;
  const [setupType, setSetupType] = useState<SetupType>('cname');
  const [targetValue, setTargetValue] = useState('cname.vercel-dns.com');
  const [redirectUrl, setRedirectUrl] = useState('https://github.com/');
  const [redirectType, setRedirectType] = useState<301 | 302>(301);
  const [isProxied, setIsProxied] = useState(true);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const subId = `sub-${Date.now()}`;
    const now = new Date().toISOString();

    let records: DnsRecord[] = [];
    let redirectConfig: UrlRedirect | undefined = undefined;

    if (setupType === 'redirect') {
      // 301/302 Redirect setup: dummy A record proxied through Cloudflare edge page rules
      records.push({
        id: `rec-${Date.now()}-1`,
        subdomainId: subId,
        type: 'A',
        name: '@',
        content: '192.0.2.1', // Cloudflare redirect placeholder IP
        ttl: 1,
        proxied: true,
        createdAt: now,
        updatedAt: now,
      });

      redirectConfig = {
        id: `redir-${Date.now()}`,
        subdomainId: subId,
        destinationUrl: redirectUrl.trim(),
        statusCode: redirectType,
        preservePath: true,
        active: true,
        createdAt: now,
      };
    } else if (setupType === 'cname') {
      records.push({
        id: `rec-${Date.now()}-1`,
        subdomainId: subId,
        type: 'CNAME',
        name: '@',
        content: targetValue.trim() || 'cname.vercel-dns.com',
        ttl: 1,
        proxied: isProxied,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      // A Record
      records.push({
        id: `rec-${Date.now()}-1`,
        subdomainId: subId,
        type: 'A',
        name: '@',
        content: targetValue.trim() || '185.199.108.153',
        ttl: 1,
        proxied: isProxied,
        createdAt: now,
        updatedAt: now,
      });
    }

    const newSubdomain: ClaimedSubdomain = {
      id: subId,
      name: subdomain,
      domainZone: domainZone,
      fullDomain: fullDomain,
      description: description.trim() || `${setupType.toUpperCase()} Yönlendirmesi`,
      status: 'active',
      isProxied: setupType === 'redirect' ? true : isProxied,
      lastPingMs: 16,
      createdAt: now,
      dnsRecords: records,
      redirect: redirectConfig,
    };

    setTimeout(() => {
      onSuccess(newSubdomain);
    }, 300);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px',
    }}>
      <div 
        className="card animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-modal)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                {fullDomain}
              </span>
              <span className="badge badge-success">Ücretsiz</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Subdomain tahsis sihirbazı & Cloudflare DNS yapılandırması
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          
          {/* Setup Type Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Yönlendirme / Kullanım Şekli:
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setSetupType('cname');
                  setTargetValue('cname.vercel-dns.com');
                }}
                style={{
                  padding: '12px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: setupType === 'cname' ? 'var(--cf-orange-subtle)' : 'var(--bg-input)',
                  border: `1px solid ${setupType === 'cname' ? 'var(--cf-orange-border)' : 'var(--border-subtle)'}`,
                  color: setupType === 'cname' ? 'var(--cf-orange)' : 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <Server size={18} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>CNAME</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Vercel, GitHub</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSetupType('a_record');
                  setTargetValue('185.199.108.153');
                }}
                style={{
                  padding: '12px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: setupType === 'a_record' ? 'var(--cf-orange-subtle)' : 'var(--bg-input)',
                  border: `1px solid ${setupType === 'a_record' ? 'var(--cf-orange-border)' : 'var(--border-subtle)'}`,
                  color: setupType === 'a_record' ? 'var(--cf-orange)' : 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <Globe size={18} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>A Kaydı</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>VPS / IP Adresi</span>
              </button>

              <button
                type="button"
                onClick={() => setSetupType('redirect')}
                style={{
                  padding: '12px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: setupType === 'redirect' ? 'var(--cf-orange-subtle)' : 'var(--bg-input)',
                  border: `1px solid ${setupType === 'redirect' ? 'var(--cf-orange-border)' : 'var(--border-subtle)'}`,
                  color: setupType === 'redirect' ? 'var(--cf-orange)' : 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <LinkIcon size={18} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>URL Yönlendir</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>301 / 302 Link</span>
              </button>
            </div>
          </div>

          {/* Dynamic Configuration Fields */}
          {setupType === 'cname' && (
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Hedef CNAME Değeri (Hedef Alan Adı):
              </label>
              <input
                type="text"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="ör: cname.vercel-dns.com veya kullanici.github.io"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff',
                  fontSize: '14px',
                }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Vercel için <code>cname.vercel-dns.com</code>, GitHub Pages için <code>kullanici.github.io</code> girin.
              </div>
            </div>
          )}

          {setupType === 'a_record' && (
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Hedef IPv4 Sunucu Adresi:
              </label>
              <input
                type="text"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="ör: 185.199.108.153"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff',
                  fontSize: '14px',
                }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                VPS sunucunuzun veya hosting firmanızın sağladığı IPv4 adresini yazın.
              </div>
            </div>
          )}

          {setupType === 'redirect' && (
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Yönlendirilecek Hedef Web Adresi (URL):
              </label>
              <input
                type="url"
                required
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://github.com/kullaniciadi veya https://linkedin.com/..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff',
                  fontSize: '14px',
                }}
              />

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="redirType"
                    checked={redirectType === 301}
                    onChange={() => setRedirectType(301)}
                  />
                  <span>301 Kalıcı (Önerilen - SEO Dostu)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="redirType"
                    checked={redirectType === 302}
                    onChange={() => setRedirectType(302)}
                  />
                  <span>302 Geçici</span>
                </label>
              </div>
            </div>
          )}

          {/* Cloudflare Proxy Option */}
          {setupType !== 'redirect' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cloud size={20} style={{ color: isProxied ? 'var(--cf-orange)' : 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                    Cloudflare Proxy & DDoS Koruması (Turuncu Bulut)
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {isProxied ? 'Aktif: Trafik Cloudflare Anycast CDN üzerinden geçer.' : 'Devre Dışı: Yalnızca DNS çözümlemesi yapılır.'}
                  </div>
                </div>
              </div>

              <input
                type="checkbox"
                checked={isProxied}
                onChange={(e) => setIsProxied(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--cf-orange)' }}
              />
            </div>
          )}

          {/* Note / Label */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Açıklama / Proje Adı (İsteğe Bağlı):
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ör: Portfolyo Sitem, API Backend, Blog"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              İptal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ padding: '8px 20px' }}
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Subdomaini Etkinleştir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
