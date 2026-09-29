'use client';

import React, { useState } from 'react';
import { DomainZone, ClaimedSubdomain, DnsRecord, UrlRedirect } from '@/lib/types';
import { X, Server, Globe, Link as LinkIcon, Cloud } from 'lucide-react';

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
      records.push({
        id: `rec-${Date.now()}-1`,
        subdomainId: subId,
        type: 'A',
        name: '@',
        content: '192.0.2.1',
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
      // A record
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
      description: description.trim() || `${setupType.toUpperCase()} Kaydı`,
      status: 'active',
      isProxied: setupType === 'redirect' ? true : isProxied,
      ddosShieldEnabled: false,
      lastPingMs: 12,
      createdAt: now,
      dnsRecords: records,
      redirect: redirectConfig,
    };

    setTimeout(() => {
      onSuccess(newSubdomain);
    }, 250);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(6px)',
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
          maxWidth: '520px',
          background: '#0a0a0a',
          border: '1px solid #222222',
          boxShadow: 'var(--shadow-modal)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 22px',
          borderBottom: '1px solid #1a1a1a',
        }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
              {fullDomain}
            </div>
            <div style={{ fontSize: '12px', color: '#777777', marginTop: '2px' }}>
              Subdomain yapılandırması
            </div>
          </div>

          <button onClick={onClose} style={{ color: '#777777', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '22px' }}>
          
          {/* Setup Type */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#a3a3a3', marginBottom: '8px' }}>
              Kayıt Türü:
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setSetupType('cname');
                  setTargetValue('cname.vercel-dns.com');
                }}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: setupType === 'cname' ? '#ffffff' : '#000000',
                  color: setupType === 'cname' ? '#000000' : '#888888',
                  border: `1px solid ${setupType === 'cname' ? '#ffffff' : '#1c1c1c'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <Server size={15} />
                <span>CNAME</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSetupType('a_record');
                  setTargetValue('185.199.108.153');
                }}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: setupType === 'a_record' ? '#ffffff' : '#000000',
                  color: setupType === 'a_record' ? '#000000' : '#888888',
                  border: `1px solid ${setupType === 'a_record' ? '#ffffff' : '#1c1c1c'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <Globe size={15} />
                <span>A Kaydı (IP)</span>
              </button>

              <button
                type="button"
                onClick={() => setSetupType('redirect')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: setupType === 'redirect' ? '#ffffff' : '#000000',
                  color: setupType === 'redirect' ? '#000000' : '#888888',
                  border: `1px solid ${setupType === 'redirect' ? '#ffffff' : '#1c1c1c'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <LinkIcon size={15} />
                <span>URL Yönlendir</span>
              </button>
            </div>
          </div>

          {/* Dynamic input */}
          {setupType === 'cname' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#a3a3a3', marginBottom: '6px' }}>
                Hedef CNAME (Alan Adı):
              </label>
              <input
                type="text"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="ör: cname.vercel-dns.com"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: '#000000',
                  border: '1px solid #222222',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontSize: '13px',
                }}
              />
            </div>
          )}

          {setupType === 'a_record' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#a3a3a3', marginBottom: '6px' }}>
                Hedef IPv4 IP Adresi:
              </label>
              <input
                type="text"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="ör: 185.199.108.153"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: '#000000',
                  border: '1px solid #222222',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontSize: '13px',
                }}
              />
            </div>
          )}

          {setupType === 'redirect' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#a3a3a3', marginBottom: '6px' }}>
                Yönlendirilecek Hedef Web Linki (URL):
              </label>
              <input
                type="url"
                required
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://github.com/..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: '#000000',
                  border: '1px solid #222222',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontSize: '13px',
                }}
              />
            </div>
          )}

          {/* Proxy checkbox */}
          {setupType !== 'redirect' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: '#000000',
              border: '1px solid #1a1a1a',
              marginBottom: '16px',
            }}>
              <div style={{ fontSize: '12px', color: '#ffffff' }}>
                Cloudflare Proxy (CDN & DDoS Koruması)
              </div>
              <input
                type="checkbox"
                checked={isProxied}
                onChange={(e) => setIsProxied(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#ffffff' }}
              />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="btn-secondary btn-sm">
              İptal
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary btn-sm">
              {isSubmitting ? 'Kaydediliyor...' : 'Etkinleştir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
