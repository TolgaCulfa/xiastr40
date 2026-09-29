'use client';

import React, { useState } from 'react';
import { DomainZone, ClaimedSubdomain, DnsRecord } from '@/lib/types';
import { X, Globe, Sparkles, Server, Copy, Check, ShieldCheck, ArrowRight, AlertTriangle, RefreshCw, Zap, Lock, Plus } from 'lucide-react';

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

  /* ── Theme tokens (Blue/Black/White) ── */
  const BLUE = '#3B82F6';
  const BLUE_DIM = '#1D4ED8';
  const BLUE_GLOW = 'rgba(59, 130, 246, 0.15)';
  const BLUE_BORDER = 'rgba(59, 130, 246, 0.35)';
  const BG_MODAL = '#0A0A0A';
  const BG_CARD = '#000000';
  const BG_INPUT = '#050508';
  const BORDER = '#1A1A1A';
  const BORDER_LIGHT = '#222222';
  const TEXT_WHITE = '#FFFFFF';
  const TEXT_MUTED = '#888888';
  const TEXT_DIM = '#666666';
  const GREEN = '#22C55E';
  const YELLOW = '#EAB308';
  const RED = '#EF4444';

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
      nameserverStatus: 'pending',
      assignedNameservers: ['ns1.xias.tr', 'ns2.xias.tr'],
    };

    setIsSubmitting(false);
    onSuccess(newDomain);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          background: BG_MODAL,
          border: `1px solid ${BORDER_LIGHT}`,
          boxShadow: `0 0 80px ${BLUE_GLOW}, 0 24px 60px rgba(0, 0, 0, 0.8)`,
          borderRadius: '16px',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '22px 28px',
          borderBottom: `1px solid ${BORDER}`,
          background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, transparent 60%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_DIM} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 16px rgba(59,130,246,0.3)`,
            }}>
              <Globe size={20} style={{ color: TEXT_WHITE }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: TEXT_WHITE, letterSpacing: '-0.4px', margin: 0 }}>
                Domain Ekle
              </h2>
              <p style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '2px' }}>
                Ücretsiz subdomain al veya kendi domainini bağla
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              color: TEXT_DIM,
              background: 'transparent',
              border: `1px solid ${BORDER_LIGHT}`,
              borderRadius: '8px',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.color = TEXT_WHITE; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = BORDER_LIGHT; e.currentTarget.style.color = TEXT_DIM; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Tab Buttons ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0px',
          borderBottom: `1px solid ${BORDER}`,
          background: BG_CARD,
        }}>
          {/* Free Subdomain Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('free')}
            style={{
              padding: '16px 20px',
              background: activeTab === 'free' ? BG_MODAL : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'free' ? `3px solid ${BLUE}` : '3px solid transparent',
              color: activeTab === 'free' ? TEXT_WHITE : TEXT_DIM,
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
            }}
          >
            <Sparkles size={16} style={{ color: activeTab === 'free' ? BLUE : TEXT_DIM }} />
            <span>Ücretsiz Subdomain</span>
            <span style={{
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '12px',
              background: activeTab === 'free' ? BLUE_GLOW : '#111',
              color: activeTab === 'free' ? BLUE : TEXT_DIM,
              border: `1px solid ${activeTab === 'free' ? BLUE_BORDER : '#222'}`,
              fontWeight: 600,
            }}>
              Anında
            </span>
          </button>

          {/* Custom Domain Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            style={{
              padding: '16px 20px',
              background: activeTab === 'custom' ? BG_MODAL : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'custom' ? `3px solid ${BLUE}` : '3px solid transparent',
              color: activeTab === 'custom' ? TEXT_WHITE : TEXT_DIM,
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
              borderLeft: `1px solid ${BORDER}`,
            }}
          >
            <Globe size={16} style={{ color: activeTab === 'custom' ? BLUE : TEXT_DIM }} />
            <span>Kendi Domainini Ekle</span>
            <span style={{
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '12px',
              background: activeTab === 'custom' ? 'rgba(234,179,8,0.1)' : '#111',
              color: activeTab === 'custom' ? YELLOW : TEXT_DIM,
              border: `1px solid ${activeTab === 'custom' ? 'rgba(234,179,8,0.3)' : '#222'}`,
              fontWeight: 600,
            }}>
              NS Bağla
            </span>
          </button>
        </div>

        {/* ── Tab Content ── */}
        <div style={{ padding: '28px' }}>
          {activeTab === 'free' ? (
            /* ──────── FREE SUBDOMAIN ──────── */
            <form onSubmit={handleFreeSubmit}>
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: TEXT_MUTED, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Subdomain Adı
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    placeholder="projem, api, tolga"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: BG_INPUT,
                      border: `1px solid ${BORDER_LIGHT}`,
                      borderRadius: '8px',
                      color: TEXT_WHITE,
                      fontSize: '14px',
                      fontWeight: 600,
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = BLUE}
                    onBlur={(e) => e.currentTarget.style.borderColor = BORDER_LIGHT}
                  />
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value as DomainZone)}
                    style={{
                      padding: '12px 18px',
                      background: BG_INPUT,
                      border: `1px solid ${BORDER_LIGHT}`,
                      borderRadius: '8px',
                      color: BLUE,
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="xias.tr">.xias.tr</option>
                    <option value="xias.info">.xias.info</option>
                  </select>
                </div>

                {subName.trim() && (
                  <div style={{
                    marginTop: '10px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: BLUE_GLOW,
                    border: `1px solid ${BLUE_BORDER}`,
                    fontSize: '13px',
                    color: TEXT_MUTED,
                  }}>
                    Tam Domain: <strong style={{ color: BLUE }}>{subName.trim().toLowerCase()}.{zone}</strong>
                  </div>
                )}

                {freeError && (
                  <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: RED, fontSize: '12px' }}>
                    {freeError}
                  </div>
                )}
              </div>

              {/* Perks */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
                {[
                  { icon: <Zap size={16} style={{ color: BLUE }} />, title: 'Işık Hızında', desc: 'Anında hazır, NS beklemesi yok' },
                  { icon: <ShieldCheck size={16} style={{ color: BLUE }} />, title: 'WAF & Turnstile', desc: 'DDoS savunması varsayılan açık' },
                  { icon: <Lock size={16} style={{ color: BLUE }} />, title: 'Ücretsiz SSL', desc: 'Otomatik TLS 1.3 desteği' },
                ].map((perk, i) => (
                  <div key={i} style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: BG_CARD,
                    border: `1px solid ${BORDER}`,
                    transition: 'border-color 0.2s',
                  }}>
                    <div style={{ marginBottom: '6px' }}>{perk.icon}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT_WHITE }}>{perk.title}</div>
                    <div style={{ fontSize: '11px', color: TEXT_DIM, marginTop: '2px' }}>{perk.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: `1px solid ${BORDER_LIGHT}`,
                    color: TEXT_MUTED,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isCheckingFree}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_DIM} 100%)`,
                    border: 'none',
                    color: TEXT_WHITE,
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: isCheckingFree ? 'wait' : 'pointer',
                    opacity: isCheckingFree ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: `0 4px 16px rgba(59,130,246,0.3)`,
                    transition: 'all 0.2s ease',
                    minWidth: '150px',
                    justifyContent: 'center',
                  }}
                >
                  {isCheckingFree ? (
                    <>
                      <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Kontrol Ediliyor...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>Subdomain Oluştur</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* ──────── CUSTOM DOMAIN ──────── */
            <form onSubmit={handleCustomSubmit}>
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: TEXT_MUTED, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Alan Adınız (Domain)
                </label>
                <input
                  type="text"
                  required
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                  placeholder="ornek.com veya subdomain.sirketiniz.net"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: BG_INPUT,
                    border: `1px solid ${BORDER_LIGHT}`,
                    borderRadius: '8px',
                    color: TEXT_WHITE,
                    fontSize: '14px',
                    fontWeight: 600,
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = BLUE}
                  onBlur={(e) => e.currentTarget.style.borderColor = BORDER_LIGHT}
                />

                {customError && (
                  <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: RED, fontSize: '12px' }}>
                    {customError}
                  </div>
                )}
              </div>

              {/* ── Nameserver Instructions Card ── */}
              <div style={{
                padding: '20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(59,130,246,0.02) 100%)',
                border: `1px solid ${BLUE_BORDER}`,
                marginBottom: '22px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Server size={16} style={{ color: BLUE }} />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: TEXT_WHITE }}>
                    Nameserver Yönlendirmesi
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: TEXT_MUTED, lineHeight: '1.6', marginBottom: '16px' }}>
                  Alan adınızı aldığınız firmada (GoDaddy, Natro, Namecheap, Turhost vb.) mevcut NS kayıtlarını silip aşağıdaki <strong style={{ color: BLUE }}>XIAS Anycast Nameserver</strong> adreslerini yazın:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* NS 1 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: BG_CARD,
                    border: `1px solid ${BORDER_LIGHT}`,
                    borderRadius: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        fontSize: '10px',
                        color: BLUE,
                        fontWeight: 800,
                        background: BLUE_GLOW,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: `1px solid ${BLUE_BORDER}`,
                      }}>NS 1</span>
                      <code style={{ fontSize: '14px', color: TEXT_WHITE, fontFamily: 'monospace', fontWeight: 700 }}>ns1.xias.tr</code>
                      <span style={{ fontSize: '11px', color: TEXT_DIM }}>(191.44.68.250)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('ns1.xias.tr')}
                      style={{
                        background: copiedNS === 'ns1.xias.tr' ? 'rgba(34,197,94,0.1)' : 'transparent',
                        border: `1px solid ${copiedNS === 'ns1.xias.tr' ? GREEN : BORDER_LIGHT}`,
                        borderRadius: '6px',
                        color: copiedNS === 'ns1.xias.tr' ? GREEN : TEXT_MUTED,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '5px 10px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {copiedNS === 'ns1.xias.tr' ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedNS === 'ns1.xias.tr' ? 'Kopyalandı!' : 'Kopyala'}</span>
                    </button>
                  </div>

                  {/* NS 2 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: BG_CARD,
                    border: `1px solid ${BORDER_LIGHT}`,
                    borderRadius: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        fontSize: '10px',
                        color: BLUE,
                        fontWeight: 800,
                        background: BLUE_GLOW,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: `1px solid ${BLUE_BORDER}`,
                      }}>NS 2</span>
                      <code style={{ fontSize: '14px', color: TEXT_WHITE, fontFamily: 'monospace', fontWeight: 700 }}>ns2.xias.tr</code>
                      <span style={{ fontSize: '11px', color: TEXT_DIM }}>(191.44.68.250)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('ns2.xias.tr')}
                      style={{
                        background: copiedNS === 'ns2.xias.tr' ? 'rgba(34,197,94,0.1)' : 'transparent',
                        border: `1px solid ${copiedNS === 'ns2.xias.tr' ? GREEN : BORDER_LIGHT}`,
                        borderRadius: '6px',
                        color: copiedNS === 'ns2.xias.tr' ? GREEN : TEXT_MUTED,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '5px 10px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {copiedNS === 'ns2.xias.tr' ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedNS === 'ns2.xias.tr' ? 'Kopyalandı!' : 'Kopyala'}</span>
                    </button>
                  </div>
                </div>

                {/* Yellow Pending Badge Preview */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: YELLOW,
                  marginTop: '14px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'rgba(234,179,8,0.06)',
                  border: '1px solid rgba(234,179,8,0.15)',
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: YELLOW, display: 'inline-block', animation: 'pulse 2s infinite' }} />
                  <span>Domain eklendiğinde panelde <strong>&quot;🟡 Nameserver Bekleniyor&quot;</strong> rozeti ve dönen yenileme butonu çıkacaktır.</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: `1px solid ${BORDER_LIGHT}`,
                    color: TEXT_MUTED,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_DIM} 100%)`,
                    border: 'none',
                    color: TEXT_WHITE,
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'wait' : 'pointer',
                    opacity: isSubmitting ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: `0 4px 16px rgba(59,130,246,0.3)`,
                    transition: 'all 0.2s ease',
                    minWidth: '180px',
                    justifyContent: 'center',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Bağlanıyor...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight size={14} />
                      <span>Domaini Ekle & NS Bağla</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ── Keyframe Animations ── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
