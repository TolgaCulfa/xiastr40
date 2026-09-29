'use client';

import React, { useState } from 'react';
import { DomainZone, ClaimedSubdomain, DnsRecord } from '@/lib/types';
import { X, Globe, Sparkles, Server, Copy, Check, ShieldCheck, ArrowRight, AlertTriangle, RefreshCw } from 'lucide-react';

interface AddDomainModalProps {
  onClose: () => void;
  onSuccess: (newDomain: ClaimedSubdomain) => void;
}

export default function AddDomainModal({ onClose, onSuccess }: AddDomainModalProps) {
  const [activeTab, setActiveTab] = useState<'free' | 'custom'>('free');

  // Free Subdomain State
  const [subName, setSubName] = useState('');
  const [zone, setZone] = useState<DomainZone>('xias.tr');
  const [isCheckingFree, setIsCheckingFree] = useState(false);
  const [freeError, setFreeError] = useState<string | null>(null);

  // Custom Domain State
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [copiedNS, setCopiedNS] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNS(text);
    setTimeout(() => setCopiedNS(null), 2000);
  };

  // Submit Free Subdomain
  const handleFreeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFreeError(null);
    const clean = subName.trim().toLowerCase();
    if (!clean) {
      setFreeError('Lütfen bir alt alan adı girin.');
      return;
    }

    try {
      setIsCheckingFree(true);
      const res = await fetch(`/api/check?subdomain=${encodeURIComponent(clean)}&zone=${zone}`);
      const data = await res.json();

      if (!data.available) {
        setFreeError(data.message || 'Bu alan adı müsait değil.');
        setIsCheckingFree(false);
        return;
      }

      const fullDomain = `${clean}.${zone}`;
      const now = new Date().toISOString();
      const subId = `sub-${Date.now()}`;

      const defaultRecords: DnsRecord[] = [
        {
          id: `rec-${Date.now()}-1`,
          subdomainId: subId,
          type: 'A',
          name: '@',
          content: '191.44.68.250',
          ttl: 300,
          proxied: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: `rec-${Date.now()}-2`,
          subdomainId: subId,
          type: 'CNAME',
          name: 'www',
          content: fullDomain,
          ttl: 300,
          proxied: true,
          createdAt: now,
          updatedAt: now,
        }
      ];

      // Save to VDS PostgreSQL PowerDNS backend
      try {
        await fetch('/api/dns/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: fullDomain,
            name: '@',
            type: 'A',
            content: '191.44.68.250',
            ttl: 300,
          })
        });
      } catch (err) {
        console.warn('Backend sync failed, storing locally:', err);
      }

      const newDomain: ClaimedSubdomain = {
        id: subId,
        name: clean,
        domainZone: zone,
        fullDomain,
        description: 'Ücretsiz XIAS Cloud Subdomain',
        status: 'active',
        isProxied: true,
        ddosShieldEnabled: false,
        createdAt: now,
        dnsRecords: defaultRecords,
        isCustomDomain: false,
        nameserverStatus: 'active',
        assignedNameservers: ['ns1.xias.tr', 'ns2.xias.tr'],
      };

      onSuccess(newDomain);
    } catch (err) {
      setFreeError('Bağlantı hatası oluştu.');
    } finally {
      setIsCheckingFree(false);
    }
  };

  // Submit Custom Domain
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    let clean = customDomainInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    
    // basic regex for domain.com
    if (!clean || !clean.includes('.')) {
      setCustomError('Lütfen geçerli bir alan adı girin (örn: sitem.com veya app.domain.org)');
      return;
    }

    setIsSubmitting(true);
    const now = new Date().toISOString();
    const domId = `custom-${Date.now()}`;

    const defaultRecords: DnsRecord[] = [
      {
        id: `rec-${Date.now()}-1`,
        subdomainId: domId,
        type: 'A',
        name: '@',
        content: '191.44.68.250',
        ttl: 300,
        proxied: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `rec-${Date.now()}-2`,
        subdomainId: domId,
        type: 'CNAME',
        name: 'www',
        content: clean,
        ttl: 300,
        proxied: true,
        createdAt: now,
        updatedAt: now,
      }
    ];

    // Sync zone to VDS PowerDNS
    try {
      await fetch('/api/dns/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: clean,
          name: '@',
          type: 'A',
          content: '191.44.68.250',
          ttl: 300,
        })
      });
    } catch (err) {
      console.warn('Backend sync failed, saving locally:', err);
    }

    const newDomain: ClaimedSubdomain = {
      id: domId,
      name: clean.split('.')[0],
      domainZone: 'xias.tr',
      fullDomain: clean,
      description: 'Özel Alan Adı (Custom Domain)',
      status: 'active',
      isProxied: true,
      ddosShieldEnabled: false,
      createdAt: now,
      dnsRecords: defaultRecords,
      isCustomDomain: true,
      nameserverStatus: 'pending', // YELLOW PENDING STATUS!
      assignedNameservers: ['ns1.xias.tr', 'ns2.xias.tr'],
    };

    setIsSubmitting(false);
    onSuccess(newDomain);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    }}>
      <div 
        className="card animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '680px',
          background: '#0a0a0a',
          border: '1px solid #222222',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #1a1a1a',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
              Yeni Alan Adı (Domain) Ekle
            </h2>
            <p style={{ fontSize: '13px', color: '#888888', marginTop: '2px' }}>
              Ücretsiz bir XIAS subdomain tahsis edin veya kendi tescil ettiğiniz alan adını bağlayın
            </p>
          </div>

          <button onClick={onClose} style={{ color: '#888888', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #1a1a1a', background: '#050505' }}>
          <button
            type="button"
            onClick={() => setActiveTab('free')}
            style={{
              padding: '14px 20px',
              background: activeTab === 'free' ? '#0a0a0a' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'free' ? '2px solid #ffffff' : '2px solid transparent',
              color: activeTab === 'free' ? '#ffffff' : '#777777',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={16} style={{ color: activeTab === 'free' ? '#22c55e' : '#777' }} />
            <span>Ücretsiz Subdomain Al</span>
            <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px', background: '#1c1c1c', color: '#22c55e' }}>Anında</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            style={{
              padding: '14px 20px',
              background: activeTab === 'custom' ? '#0a0a0a' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'custom' ? '2px solid #ffffff' : '2px solid transparent',
              color: activeTab === 'custom' ? '#ffffff' : '#777777',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <Globe size={16} style={{ color: activeTab === 'custom' ? '#eab308' : '#777' }} />
            <span>Kendi Domainini Ekle</span>
            <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px', background: '#241a05', color: '#eab308', border: '1px solid #3b2c07' }}>Nameserver</span>
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '24px' }}>
          {activeTab === 'free' ? (
            /* Free Subdomain Form */
            <form onSubmit={handleFreeSubmit}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#a3a3a3', marginBottom: '8px' }}>
                  İstediğiniz Subdomain Adını Yazın:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    placeholder="projem, ornek, siteniz"
                    style={{
                      flex: 1,
                      padding: '11px 14px',
                      background: '#000000',
                      border: '1px solid #222222',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  />
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value as DomainZone)}
                    style={{
                      padding: '11px 16px',
                      background: '#000000',
                      border: '1px solid #222222',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="xias.tr">.xias.tr</option>
                    <option value="xias.info">.xias.info</option>
                  </select>
                </div>

                {subName.trim() && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                    Tam Domain: <strong style={{ color: '#fff' }}>{subName.trim().toLowerCase()}.{zone}</strong>
                  </div>
                )}

                {freeError && (
                  <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '4px', background: '#240a0a', border: '1px solid #4a1515', color: '#ef4444', fontSize: '12px' }}>
                    {freeError}
                  </div>
                )}
              </div>

              {/* Perks */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '22px' }}>
                <div style={{ padding: '12px', borderRadius: '6px', background: '#050505', border: '1px solid #1c1c1c' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>Işık Hızında</div>
                  <div style={{ fontSize: '11px', color: '#777', marginTop: '2px' }}>Anında hazır, NS beklemesi yok</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '6px', background: '#050505', border: '1px solid #1c1c1c' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>WAF & Turnstile</div>
                  <div style={{ fontSize: '11px', color: '#777', marginTop: '2px' }}>DDoS savunması varsayılan açık</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '6px', background: '#050505', border: '1px solid #1c1c1c' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>Ücretsiz SSL</div>
                  <div style={{ fontSize: '11px', color: '#777', marginTop: '2px' }}>Otomatik TLS 1.3 desteği</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={onClose} className="btn-secondary btn-sm">
                  İptal
                </button>
                <button type="submit" disabled={isCheckingFree} className="btn-primary btn-sm" style={{ minWidth: '130px' }}>
                  {isCheckingFree ? 'Kontrol Ediliyor...' : 'Subdomain Oluştur'}
                </button>
              </div>
            </form>
          ) : (
            /* Custom Domain Form */
            <form onSubmit={handleCustomSubmit}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#a3a3a3', marginBottom: '8px' }}>
                  Kendi Alan Adınızı (Domain) Girin:
                </label>
                <input
                  type="text"
                  required
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                  placeholder="ornek.com veya subdomain.sirketiniz.net"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: '#000000',
                    border: '1px solid #222222',
                    borderRadius: 'var(--radius-sm)',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                />

                {customError && (
                  <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '4px', background: '#240a0a', border: '1px solid #4a1515', color: '#ef4444', fontSize: '12px' }}>
                    {customError}
                  </div>
                )}
              </div>

              {/* Nameserver Instructions Card */}
              <div style={{ padding: '16px', borderRadius: '8px', background: '#050505', border: '1px solid #241a05', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <AlertTriangle size={15} style={{ color: '#eab308' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#eab308' }}>
                    Nameserver (İsim Sunucusu) Yönlendirmesi
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#888888', lineHeight: '1.5' }}>
                  Alan adınızı kaydettiğiniz firmada (GoDaddy, Natro, Namecheap, Turhost vb.) mevcut NS kayıtlarını silip aşağıdaki <strong>XIAS Anycast Nameserver</strong> adreslerini ekleyin:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  {/* NS 1 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#0a0a0a',
                    border: '1px solid #222',
                    borderRadius: '4px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#eab308', fontWeight: 700 }}>NS 1</span>
                      <code style={{ fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' }}>ns1.xias.tr</code>
                      <span style={{ fontSize: '11px', color: '#666' }}>(191.44.68.250)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('ns1.xias.tr')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedNS === 'ns1.xias.tr' ? '#22c55e' : '#888',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                      }}
                    >
                      {copiedNS === 'ns1.xias.tr' ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedNS === 'ns1.xias.tr' ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>

                  {/* NS 2 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#0a0a0a',
                    border: '1px solid #222',
                    borderRadius: '4px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#eab308', fontWeight: 700 }}>NS 2</span>
                      <code style={{ fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' }}>ns2.xias.tr</code>
                      <span style={{ fontSize: '11px', color: '#666' }}>(191.44.68.250)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('ns2.xias.tr')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedNS === 'ns2.xias.tr' ? '#22c55e' : '#888',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                      }}
                    >
                      {copiedNS === 'ns2.xias.tr' ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedNS === 'ns2.xias.tr' ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#eab308', marginTop: '12px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308', display: 'inline-block' }} />
                  <span>Domain eklendiğinde panelde <strong>"🟡 Nameserver Bekleniyor"</strong> rozeti ve dönen yenileme butonu çıkacaktır.</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={onClose} className="btn-secondary btn-sm">
                  İptal
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary btn-sm" style={{ minWidth: '150px' }}>
                  {isSubmitting ? 'Bağlanıyor...' : 'Domaini Ekle & NS Bağla'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
