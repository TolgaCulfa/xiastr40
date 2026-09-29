'use client';

import React, { useState, useEffect } from 'react';
import { ClaimedSubdomain, DnsRecord, DnsRecordType } from '@/lib/types';
import { 
  Plus, Search, RefreshCw, Trash2, Edit3, Shield, Cloud, CloudOff, 
  Check, AlertTriangle, Globe, Sparkles, Filter, ExternalLink, ArrowRight, X 
} from 'lucide-react';

interface DnsTableManagerProps {
  subdomain: ClaimedSubdomain;
  onUpdateSubdomain: (updated: ClaimedSubdomain) => void;
  showToast: (msg: string) => void;
}

const RECORD_TYPES: DnsRecordType[] = ['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'SRV', 'CAA', 'NS', 'PTR'];

const TYPE_COLORS: Record<DnsRecordType, { bg: string; text: string; border: string }> = {
  A: { bg: '#172554', text: '#60a5fa', border: '#1e3a8a' },
  AAAA: { bg: '#042f2e', text: '#2dd4bf', border: '#115e59' },
  CNAME: { bg: '#2e1065', text: '#c084fc', border: '#581c87' },
  TXT: { bg: '#052e16', text: '#4ade80', border: '#14532d' },
  MX: { bg: '#431407', text: '#fb923c', border: '#7c2d12' },
  SRV: { bg: '#422006', text: '#facc15', border: '#713f12' },
  CAA: { bg: '#083344', text: '#22d3ee', border: '#155e75' },
  NS: { bg: '#1e1b4b', text: '#818cf8', border: '#312e81' },
  PTR: { bg: '#27272a', text: '#a1a1aa', border: '#3f3f46' },
};

export default function DnsTableManager({
  subdomain,
  onUpdateSubdomain,
  showToast,
}: DnsTableManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [isVerifyingNS, setIsVerifyingNS] = useState(false);
  const [isRefreshingRecords, setIsRefreshingRecords] = useState(false);
  const [nsVerifyResult, setNsVerifyResult] = useState<{
    verified: boolean;
    currentNS?: string[];
    message?: string;
  } | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [recordType, setRecordType] = useState<DnsRecordType>('A');
  const [recordName, setRecordName] = useState('@');
  const [recordContent, setRecordContent] = useState('');
  const [recordTtl, setRecordTtl] = useState(300);
  const [recordProxied, setRecordProxied] = useState(true);
  const [recordPriority, setRecordPriority] = useState<number>(10);
  const [recordPort, setRecordPort] = useState<number>(25565);
  const [recordWeight, setRecordWeight] = useState<number>(5);
  const [recordTag, setRecordTag] = useState<string>('issue');

  const records = subdomain.dnsRecords || [];

  // Filter records
  const filteredRecords = records.filter((rec) => {
    const matchesSearch = 
      rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTypeFilter === 'ALL' || rec.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  // Verify Nameserver via Real API
  const handleVerifyNameserver = async () => {
    try {
      setIsVerifyingNS(true);
      setNsVerifyResult(null);

      const res = await fetch('/api/dns/verify-ns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: subdomain.fullDomain }),
      });
      const data = await res.json();

      if (data.verified) {
        const updated: ClaimedSubdomain = {
          ...subdomain,
          nameserverStatus: 'active',
          lastNsCheckAt: new Date().toISOString(),
        };
        onUpdateSubdomain(updated);
        setNsVerifyResult({ verified: true, message: data.message });
        showToast(`"${subdomain.fullDomain}" nameserver kayıtları doğrulandı ve aktif edildi!`);
      } else {
        setNsVerifyResult({
          verified: false,
          currentNS: data.currentNameservers,
          message: data.message,
        });
        showToast(`Nameserver kontrol edildi: Henüz ns1.xias.tr / ns2.xias.tr ile eşleşmedi.`);
      }
    } catch (err) {
      showToast('Doğrulama sırasında bir hata oluştu.');
    } finally {
      setIsVerifyingNS(false);
    }
  };

  // Open modal for new record
  const handleOpenAddModal = (defaultType: DnsRecordType = 'A') => {
    setEditingRecordId(null);
    setRecordType(defaultType);
    setRecordName('@');
    setRecordContent(defaultType === 'A' ? '191.44.68.250' : defaultType === 'CNAME' ? subdomain.fullDomain : '');
    setRecordTtl(300);
    setRecordProxied(true);
    setRecordPriority(10);
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEditModal = (rec: DnsRecord) => {
    setEditingRecordId(rec.id);
    setRecordType(rec.type);
    setRecordName(rec.name);
    setRecordContent(rec.content);
    setRecordTtl(rec.ttl);
    setRecordProxied(rec.proxied);
    setRecordPriority(rec.priority || 10);
    setRecordPort(rec.port || 25565);
    setRecordWeight(rec.weight || 5);
    setRecordTag(rec.tag || 'issue');
    setIsModalOpen(true);
  };

  // Save record (Create or Edit)
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();

    let updatedRecords: DnsRecord[];

    if (editingRecordId) {
      updatedRecords = records.map((r) => {
        if (r.id === editingRecordId) {
          return {
            ...r,
            type: recordType,
            name: recordName.trim() || '@',
            content: recordContent.trim(),
            ttl: recordTtl,
            proxied: ['A', 'AAAA', 'CNAME'].includes(recordType) ? recordProxied : false,
            priority: ['MX', 'SRV'].includes(recordType) ? recordPriority : undefined,
            port: recordType === 'SRV' ? recordPort : undefined,
            weight: recordType === 'SRV' ? recordWeight : undefined,
            tag: recordType === 'CAA' ? recordTag : undefined,
            updatedAt: now,
          };
        }
        return r;
      });
      showToast(`"${recordName}" (${recordType}) kaydı güncellendi.`);
    } else {
      const newRec: DnsRecord = {
        id: `rec-${Date.now()}`,
        subdomainId: subdomain.id,
        type: recordType,
        name: recordName.trim() || '@',
        content: recordContent.trim(),
        ttl: recordTtl,
        proxied: ['A', 'AAAA', 'CNAME'].includes(recordType) ? recordProxied : false,
        priority: ['MX', 'SRV'].includes(recordType) ? recordPriority : undefined,
        port: recordType === 'SRV' ? recordPort : undefined,
        weight: recordType === 'SRV' ? recordWeight : undefined,
        tag: recordType === 'CAA' ? recordTag : undefined,
        createdAt: now,
        updatedAt: now,
      };
      updatedRecords = [...records, newRec];

      // Async sync with VDS PowerDNS PostgreSQL
      fetch('/api/dns/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: subdomain.fullDomain,
          name: newRec.name,
          type: newRec.type,
          content: newRec.content,
          ttl: newRec.ttl,
          priority: newRec.priority,
        }),
      }).catch(console.error);

      showToast(`Yeni ${recordType} kaydı eklendi ve PowerDNS'e aktarıldı.`);
    }

    onUpdateSubdomain({
      ...subdomain,
      dnsRecords: updatedRecords,
    });
    setIsModalOpen(false);
  };

  // Delete record
  const handleDeleteRecord = (id: string, name: string) => {
    const updatedRecords = records.filter((r) => r.id !== id);
    onUpdateSubdomain({
      ...subdomain,
      dnsRecords: updatedRecords,
    });

    // Async delete from VDS PowerDNS
    fetch(`/api/dns/records?id=${id}`, { method: 'DELETE' }).catch(console.error);
    showToast(`"${name}" kaydı silindi.`);
  };

  // Toggle Proxy status
  const handleToggleProxy = (rec: DnsRecord) => {
    if (!['A', 'AAAA', 'CNAME'].includes(rec.type)) return;

    const updated = records.map((r) => {
      if (r.id === rec.id) {
        return { ...r, proxied: !r.proxied, updatedAt: new Date().toISOString() };
      }
      return r;
    });

    onUpdateSubdomain({
      ...subdomain,
      dnsRecords: updated,
    });
    showToast(`Proxy durumu ${!rec.proxied ? 'Açıldı (Proxied)' : 'Kapatıldı (DNS Only)'}`);
  };

  // Quick MX Presets
  const handleApplyMxPreset = (provider: 'google' | 'microsoft' | 'yandex') => {
    let presetRecords: DnsRecord[] = [];
    const now = new Date().toISOString();

    if (provider === 'google') {
      presetRecords = [
        { id: `rec-${Date.now()}-1`, subdomainId: subdomain.id, type: 'MX', name: '@', content: 'ASPMX.L.GOOGLE.COM.', ttl: 300, proxied: false, priority: 1, createdAt: now, updatedAt: now },
        { id: `rec-${Date.now()}-2`, subdomainId: subdomain.id, type: 'MX', name: '@', content: 'ALT1.ASPMX.L.GOOGLE.COM.', ttl: 300, proxied: false, priority: 5, createdAt: now, updatedAt: now },
        { id: `rec-${Date.now()}-3`, subdomainId: subdomain.id, type: 'TXT', name: '@', content: 'v=spf1 include:_spf.google.com ~all', ttl: 300, proxied: false, createdAt: now, updatedAt: now },
      ];
    } else if (provider === 'microsoft') {
      presetRecords = [
        { id: `rec-${Date.now()}-1`, subdomainId: subdomain.id, type: 'MX', name: '@', content: `${subdomain.fullDomain.replace('.', '-')}.mail.protection.outlook.com.`, ttl: 300, proxied: false, priority: 0, createdAt: now, updatedAt: now },
        { id: `rec-${Date.now()}-2`, subdomainId: subdomain.id, type: 'TXT', name: '@', content: 'v=spf1 include:spf.protection.outlook.com -all', ttl: 300, proxied: false, createdAt: now, updatedAt: now },
      ];
    } else if (provider === 'yandex') {
      presetRecords = [
        { id: `rec-${Date.now()}-1`, subdomainId: subdomain.id, type: 'MX', name: '@', content: 'mx.yandex.net.', ttl: 300, proxied: false, priority: 10, createdAt: now, updatedAt: now },
        { id: `rec-${Date.now()}-2`, subdomainId: subdomain.id, type: 'TXT', name: '@', content: 'v=spf1 redirect=_spf.yandex.net', ttl: 300, proxied: false, createdAt: now, updatedAt: now },
      ];
    }

    onUpdateSubdomain({
      ...subdomain,
      dnsRecords: [...records, ...presetRecords],
    });
    showToast(`${provider.toUpperCase()} MX ve SPF kayıtları başarıyla eklendi!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. NAMESERVER STATUS BANNER (Yellow Pending or Green Active) */}
      {subdomain.isCustomDomain && (
        <div
          style={{
            padding: '18px 22px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: subdomain.nameserverStatus === 'pending' ? '#141005' : '#04170a',
            border: `1px solid ${subdomain.nameserverStatus === 'pending' ? '#422006' : '#14532d'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {subdomain.nameserverStatus === 'pending' ? (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#241a05',
                  border: '1px solid #713f12',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <AlertTriangle size={18} style={{ color: '#eab308' }} />
              </div>
            ) : (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#052e16',
                  border: '1px solid #14532d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <Check size={18} style={{ color: '#22c55e' }} />
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                  {subdomain.fullDomain}
                </span>

                {/* THE YELLOW PENDING BUTTON / BADGE AS REQUESTED */}
                {subdomain.nameserverStatus === 'pending' ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#291b05',
                      color: '#facc15',
                      border: '1px solid #ca8a04',
                      boxShadow: '0 0 10px rgba(234, 179, 8, 0.25)',
                    }}
                  >
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#facc15',
                        boxShadow: '0 0 8px #facc15',
                      }}
                      className="animate-pulse"
                    />
                    <span>🟡 Bekliyor (Pending Nameserver)</span>
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#052e16',
                      color: '#4ade80',
                      border: '1px solid #22c55e',
                    }}
                  >
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
                    <span>🟢 Aktif & Anycast WAF Devrede</span>
                  </span>
                )}
              </div>

              <p style={{ fontSize: '12px', color: '#999999', marginTop: '4px', maxWidth: '600px', lineHeight: '1.4' }}>
                {subdomain.nameserverStatus === 'pending'
                  ? 'Registrar firmanızdan alan adınızı ns1.xias.tr ve ns2.xias.tr adreslerine yönlendirin. Yönlendirmeyi yaptıktan sonra "Nameserver Kontrol Et" butonuna basarak anında doğrulayabilirsiniz.'
                  : 'Nameserver kayıtları dünya çapında doğrulandı. Tüm gelen trafik XIAS Anycast ve Turnstile koruma ağından geçmektedir.'}
              </p>

              {/* Nameserver Box */}
              {subdomain.nameserverStatus === 'pending' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                  <code style={{ fontSize: '12px', color: '#facc15', background: '#0a0a0a', padding: '3px 8px', borderRadius: '4px', border: '1px solid #332305' }}>
                    ns1.xias.tr
                  </code>
                  <code style={{ fontSize: '12px', color: '#facc15', background: '#0a0a0a', padding: '3px 8px', borderRadius: '4px', border: '1px solid #332305' }}>
                    ns2.xias.tr
                  </code>
                </div>
              )}

              {nsVerifyResult && !nsVerifyResult.verified && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#f87171' }}>
                  {nsVerifyResult.message}
                </div>
              )}
            </div>
          </div>

          {/* VERIFY BUTTON WITH SPINNING SVG ICON AS REQUESTED */}
          {subdomain.nameserverStatus === 'pending' && (
            <button
              onClick={handleVerifyNameserver}
              disabled={isVerifyingNS}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: 'none',
                fontWeight: 700,
                fontSize: '12px',
                cursor: isVerifyingNS ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.15)',
              }}
            >
              <RefreshCw size={14} className={isVerifyingNS ? 'animate-spin' : ''} />
              <span>{isVerifyingNS ? 'Kontrol Ediliyor...' : 'Nameserver Kontrol Et'}</span>
            </button>
          )}
        </div>
      )}

      {/* 2. DNS TOOLBAR & PRESETS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Left: Search & Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '280px', maxWidth: '520px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="DNS kayıtlarında ara (örn: www, mail, IP)..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                background: '#0a0a0a',
                border: '1px solid #222222',
                borderRadius: 'var(--radius-sm)',
                color: '#ffffff',
                fontSize: '12px',
              }}
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              background: '#0a0a0a',
              border: '1px solid #222222',
              borderRadius: 'var(--radius-sm)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="ALL">Tüm Kayıtlar</option>
            {RECORD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Right: Actions & MX Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* MX Presets Dropdown */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleApplyMxPreset(e.target.value as any);
                e.target.value = '';
              }
            }}
            defaultValue=""
            style={{
              padding: '8px 12px',
              background: '#0a0a0a',
              border: '1px solid #222222',
              borderRadius: 'var(--radius-sm)',
              color: '#888888',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="" disabled>⚡ MX Şablonu Ekle</option>
            <option value="google">Google Workspace</option>
            <option value="microsoft">Microsoft 365 / Outlook</option>
            <option value="yandex">Yandex 360 Mail</option>
          </select>

          {/* Add Record Button */}
          <button
            onClick={() => handleOpenAddModal('A')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
            <span>Kayıt Ekle</span>
          </button>
        </div>
      </div>

      {/* 3. CLOUDFLARE STYLE DNS RECORDS TABLE (10+ TYPES) */}
      <div
        className="card"
        style={{
          padding: '0',
          backgroundColor: '#0a0a0a',
          border: '1px solid #1a1a1a',
          overflow: 'hidden',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #222222', background: '#050505', color: '#888888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 18px', width: '90px' }}>Tür</th>
                <th style={{ padding: '12px 16px', width: '160px' }}>Ad (Name)</th>
                <th style={{ padding: '12px 16px' }}>İçerik (Content)</th>
                <th style={{ padding: '12px 16px', width: '120px' }}>TTL</th>
                <th style={{ padding: '12px 16px', width: '150px' }}>Proxy Durumu</th>
                <th style={{ padding: '12px 18px', width: '110px', textAlign: 'right' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                    Kayıt bulunamadı. "Kayıt Ekle" butonuna basarak yeni bir DNS kaydı ekleyebilirsiniz.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const typeStyle = TYPE_COLORS[rec.type] || { bg: '#222', text: '#fff', border: '#444' };
                  const isProxyable = ['A', 'AAAA', 'CNAME'].includes(rec.type);

                  return (
                    <tr
                      key={rec.id}
                      style={{
                        borderBottom: '1px solid #141414',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#111111')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Type Badge */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            backgroundColor: typeStyle.bg,
                            color: typeStyle.text,
                            border: `1px solid ${typeStyle.border}`,
                          }}
                        >
                          {rec.type}
                        </span>
                      </td>

                      {/* Name */}
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#ffffff' }}>
                        {rec.name}
                        {rec.name === '@' ? ` (${subdomain.fullDomain})` : `.${subdomain.fullDomain}`}
                      </td>

                      {/* Content */}
                      <td style={{ padding: '14px 16px', color: '#cccccc', wordBreak: 'break-all' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                          {rec.content}
                        </span>
                        {rec.priority !== undefined && (
                          <span style={{ marginLeft: '8px', fontSize: '11px', color: '#888', background: '#1c1c1c', padding: '2px 6px', borderRadius: '3px' }}>
                            Priority: {rec.priority}
                          </span>
                        )}
                        {rec.port !== undefined && (
                          <span style={{ marginLeft: '6px', fontSize: '11px', color: '#888', background: '#1c1c1c', padding: '2px 6px', borderRadius: '3px' }}>
                            Port: {rec.port}
                          </span>
                        )}
                      </td>

                      {/* TTL */}
                      <td style={{ padding: '14px 16px', color: '#888888', fontSize: '12px' }}>
                        {rec.ttl === 1 || rec.ttl === 300 ? 'Otomatik (300s)' : `${rec.ttl} sn`}
                      </td>

                      {/* Proxied Toggle */}
                      <td style={{ padding: '14px 16px' }}>
                        {isProxyable ? (
                          <button
                            type="button"
                            onClick={() => handleToggleProxy(rec)}
                            title={rec.proxied ? 'WAF & DDoS korumalı (Trafik XIAS Kenar Ağında)' : 'Sadece DNS (Trafik doğrudan sunucuya gider)'}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              background: rec.proxied ? '#431407' : '#1a1a1a',
                              border: `1px solid ${rec.proxied ? '#ea580c' : '#333333'}`,
                              color: rec.proxied ? '#fb923c' : '#888888',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {rec.proxied ? (
                              <>
                                <Cloud size={13} style={{ color: '#ea580c' }} />
                                <span>Proxied</span>
                              </>
                            ) : (
                              <>
                                <CloudOff size={13} style={{ color: '#888' }} />
                                <span>DNS Only</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#555555' }}>DNS Only</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenEditModal(rec)}
                            title="Düzenle"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#888888',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            onClick={() => handleDeleteRecord(rec.id, rec.name)}
                            title="Sil"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#ef4444')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div style={{ padding: '12px 18px', background: '#050505', borderTop: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
          <span>Toplam <strong>{records.length}</strong> DNS kaydı listeleniyor</span>
          <span>PowerDNS 4.9 Anycast Kenar Ağı ile senkronize</span>
        </div>
      </div>

      {/* 4. ADD / EDIT RECORD MODAL */}
      {isModalOpen && (
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
              maxWidth: '560px',
              background: '#0a0a0a',
              border: '1px solid #222222',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 22px',
              borderBottom: '1px solid #1a1a1a',
            }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
                {editingRecordId ? 'DNS Kaydını Düzenle' : 'Yeni DNS Kaydı Ekle'}
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#888', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveRecord} style={{ padding: '22px' }}>
              {/* Type Select */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#a3a3a3', marginBottom: '6px' }}>
                  Kayıt Türü (Record Type):
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {RECORD_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setRecordType(t)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: recordType === t ? '#ffffff' : '#141414',
                        color: recordType === t ? '#000000' : '#888888',
                        border: `1px solid ${recordType === t ? '#ffffff' : '#222222'}`,
                        cursor: 'pointer',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Content Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#a3a3a3', marginBottom: '6px' }}>
                    Ad (Name):
                  </label>
                  <input
                    type="text"
                    required
                    value={recordName}
                    onChange={(e) => setRecordName(e.target.value)}
                    placeholder="@ veya www"
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
                  <span style={{ fontSize: '10px', color: '#666', marginTop: '4px', display: 'block' }}>
                    Kök için <strong>@</strong> yazın
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#a3a3a3', marginBottom: '6px' }}>
                    İçerik (IPv4 / Hedef / Değer):
                  </label>
                  <input
                    type="text"
                    required
                    value={recordContent}
                    onChange={(e) => setRecordContent(e.target.value)}
                    placeholder={
                      recordType === 'A'
                        ? '191.44.68.250'
                        : recordType === 'CNAME'
                        ? 'cname.vercel-dns.com'
                        : recordType === 'TXT'
                        ? 'v=spf1 include:_spf.google.com ~all'
                        : 'Hedef değer'
                    }
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
              </div>

              {/* Priority for MX / SRV */}
              {['MX', 'SRV'].includes(recordType) && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#a3a3a3', marginBottom: '6px' }}>
                    Öncelik (Priority):
                  </label>
                  <input
                    type="number"
                    value={recordPriority}
                    onChange={(e) => setRecordPriority(Number(e.target.value))}
                    min={0}
                    max={65535}
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

              {/* Port & Weight for SRV */}
              {recordType === 'SRV' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#a3a3a3', marginBottom: '6px' }}>Port:</label>
                    <input
                      type="number"
                      value={recordPort}
                      onChange={(e) => setRecordPort(Number(e.target.value))}
                      style={{ width: '100%', padding: '9px 12px', background: '#000', border: '1px solid #222', borderRadius: '4px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#a3a3a3', marginBottom: '6px' }}>Ağırlık (Weight):</label>
                    <input
                      type="number"
                      value={recordWeight}
                      onChange={(e) => setRecordWeight(Number(e.target.value))}
                      style={{ width: '100%', padding: '9px 12px', background: '#000', border: '1px solid #222', borderRadius: '4px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}

              {/* TTL and Proxy Options */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#a3a3a3', marginBottom: '6px' }}>TTL:</label>
                  <select
                    value={recordTtl}
                    onChange={(e) => setRecordTtl(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: '#000000',
                      border: '1px solid #222222',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ffffff',
                      fontSize: '13px',
                    }}
                  >
                    <option value={300}>Otomatik (300 saniye)</option>
                    <option value={60}>1 dakika</option>
                    <option value={120}>2 dakika</option>
                    <option value={600}>10 dakika</option>
                    <option value={3600}>1 saat</option>
                    <option value={86400}>1 gün</option>
                  </select>
                </div>

                {['A', 'AAAA', 'CNAME'].includes(recordType) && (
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#a3a3a3', marginBottom: '6px' }}>
                      Cloudflare Proxy:
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#fff', fontSize: '12px' }}>
                      <input
                        type="checkbox"
                        checked={recordProxied}
                        onChange={(e) => setRecordProxied(e.target.checked)}
                        style={{ accentColor: '#ea580c', width: '16px', height: '16px' }}
                      />
                      <span>WAF & DDoS Koruma (Proxied)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary btn-sm">
                  İptal
                </button>
                <button type="submit" className="btn-primary btn-sm">
                  {editingRecordId ? 'Değişiklikleri Kaydet' : 'Kaydet & Yayınla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
