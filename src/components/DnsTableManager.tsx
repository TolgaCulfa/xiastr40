'use client';

import React, { useState, useEffect } from 'react';
import { ClaimedSubdomain, DnsRecord, DnsRecordType } from '@/lib/types';
import { 
  Plus, Search, RefreshCw, Trash2, Edit3, Cloud, CloudOff, 
  Check, AlertTriangle, BookOpen, ChevronUp, ChevronDown, 
  Sliders, Filter, Upload, Download, Sparkles, HelpCircle, 
  Star, MoreVertical, X, Info
} from 'lucide-react';

interface DnsTableManagerProps {
  subdomain: ClaimedSubdomain;
  onUpdateSubdomain: (updated: ClaimedSubdomain) => void;
  showToast: (msg: string) => void;
}

const RECORD_TYPES: DnsRecordType[] = ['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'SRV', 'CAA', 'NS', 'PTR'];

const TTL_OPTIONS = [
  { label: 'Auto', value: 300 },
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
  { label: '30 min', value: 1800 },
  { label: '1 hr', value: 3600 },
  { label: '1 day', value: 86400 },
];

export default function DnsTableManager({
  subdomain,
  onUpdateSubdomain,
  showToast,
}: DnsTableManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isVerifyingNS, setIsVerifyingNS] = useState(false);
  const [nsVerifyResult, setNsVerifyResult] = useState<{
    verified: boolean;
    currentNS?: string[];
    message?: string;
  } | null>(null);

  // Recommendations accordion state
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Add / Edit Record Form State (Inline Expandable)
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [recordType, setRecordType] = useState<DnsRecordType>('A');
  const [recordName, setRecordName] = useState('@');
  const [recordContent, setRecordContent] = useState('');
  const [recordTtl, setRecordTtl] = useState(300);
  const [recordProxied, setRecordProxied] = useState(true);
  const [recordComment, setRecordComment] = useState('');
  const [recordPriority, setRecordPriority] = useState<number>(10);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const records = subdomain.dnsRecords || [];

  // Filter records
  const filteredRecords = records.filter((rec) => {
    const matchesSearch = 
      rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || rec.type === filterType;
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
    } catch {
      showToast('Doğrulama sırasında bir hata oluştu.');
    } finally {
      setIsVerifyingNS(false);
    }
  };

  // Open Form for new record
  const handleOpenAddForm = (defaultType: DnsRecordType = 'A') => {
    setEditingRecordId(null);
    setRecordType(defaultType);
    setRecordName('@');
    setRecordContent(defaultType === 'A' ? '191.44.68.250' : defaultType === 'CNAME' ? subdomain.fullDomain : '');
    setRecordTtl(300);
    setRecordProxied(true);
    setRecordComment('');
    setRecordPriority(10);
    setIsAddFormOpen(true);
  };

  // Open Form for edit
  const handleOpenEditForm = (rec: DnsRecord) => {
    setEditingRecordId(rec.id);
    setRecordType(rec.type);
    setRecordName(rec.name);
    setRecordContent(rec.content);
    setRecordTtl(rec.ttl);
    setRecordProxied(rec.proxied);
    setRecordComment(rec.tag || '');
    setRecordPriority(rec.priority || 10);
    setIsAddFormOpen(true);
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
            tag: recordComment.trim() || undefined,
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
        tag: recordComment.trim() || undefined,
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

      showToast(`Yeni ${recordType} kaydı eklendi.`);
    }

    onUpdateSubdomain({
      ...subdomain,
      dnsRecords: updatedRecords,
    });
    setIsAddFormOpen(false);
  };

  // Delete record
  const handleDeleteRecord = (id: string, name: string) => {
    const updatedRecords = records.filter((r) => r.id !== id);
    onUpdateSubdomain({
      ...subdomain,
      dnsRecords: updatedRecords,
    });

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

  // Export BIND Zone file
  const handleExportZone = () => {
    let zoneContent = `; BIND zone file for ${subdomain.fullDomain}\n; Exported from XiasTr Cloud DNS\n$ORIGIN ${subdomain.fullDomain}.\n$TTL 300\n\n`;
    records.forEach((r) => {
      const name = r.name === '@' ? '@' : r.name;
      zoneContent += `${name.padEnd(20)} ${r.ttl.toString().padEnd(8)} IN ${r.type.padEnd(6)} ${r.content}\n`;
    });

    const blob = new Blob([zoneContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${subdomain.fullDomain}.zone.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`"${subdomain.fullDomain}.zone.txt" başarıyla indirildi.`);
  };

  // Checkbox Selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRecords(filteredRecords.map((r) => r.id));
    } else {
      setSelectedRecords([]);
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedRecords.includes(id)) {
      setSelectedRecords(selectedRecords.filter((i) => i !== id));
    } else {
      setSelectedRecords([...selectedRecords, id]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#ffffff', fontFamily: 'inherit' }}>
      
      {/* 1. TOP BREADCRUMB / SITE BAR (Exact Cloudflare Header) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1a1a1e', paddingBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Star size={16} style={{ color: '#9ca3af', cursor: 'pointer' }} />
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
            {subdomain.fullDomain}
          </span>
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '9999px',
            border: '1px solid #2e2e34',
            backgroundColor: '#141416',
            color: '#9ca3af',
            fontWeight: 500,
          }}>
            free
          </span>
          <MoreVertical size={15} style={{ color: '#6b7280', cursor: 'pointer' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#d1d5db',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}>
            <Sparkles size={14} style={{ color: '#38bdf8' }} />
            <span>Ask AI</span>
          </button>

          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#d1d5db',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}>
            <HelpCircle size={14} style={{ color: '#9ca3af' }} />
            <span>Support</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN TITLE ROW */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px', margin: 0 }}>
            DNS records for {subdomain.fullDomain}
          </h1>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '6px', margin: 0 }}>
            Manage how the Internet finds your web content, verifies services, and routes traffic.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            padding: '6px 14px',
            borderRadius: '9999px',
            backgroundColor: '#141416',
            border: '1px solid #2e2e34',
            fontSize: '12px',
            fontWeight: 600,
            color: '#e5e7eb',
          }}>
            DNS Setup: Full
          </div>

          <a
            href="https://developers.cloudflare.com/dns/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: '#141416',
              border: '1px solid #2e2e34',
              fontSize: '12px',
              fontWeight: 600,
              color: '#e5e7eb',
              textDecoration: 'none',
            }}
          >
            <BookOpen size={13} style={{ color: '#9ca3af' }} />
            <span>DNS documentation</span>
          </a>
        </div>
      </div>

      {/* 3. NAMESERVER PENDING NOTICE (If Custom Domain & Not Active) */}
      {subdomain.isCustomDomain && subdomain.nameserverStatus === 'pending' && (
        <div style={{
          backgroundColor: '#0c1017',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#60a5fa' }}>
                Nameserver Kurulumunu Tamamlayın
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                (ns1.xias.tr & ns2.xias.tr)
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              Alan adı firmanızdan NS adreslerinizi yönlendirdikten sonra aşağıdaki butona basarak anında doğrulayabilirsiniz.
            </p>
          </div>

          <button
            onClick={handleVerifyNameserver}
            disabled={isVerifyingNS}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 14px',
              borderRadius: '6px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isVerifyingNS ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={13} className={isVerifyingNS ? 'animate-spin' : ''} />
            <span>{isVerifyingNS ? 'Kontrol Ediliyor...' : 'Nameserver Kontrol Et'}</span>
          </button>
        </div>
      )}

      {/* 4. RECOMMENDATIONS ACCORDION BOX (Exact Cloudflare Layout) */}
      <div style={{
        backgroundColor: '#0a0a0c',
        border: '1px solid #1f1f23',
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        {/* Accordion Header */}
        <div 
          onClick={() => setShowRecommendations(!showRecommendations)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            cursor: 'pointer',
            borderBottom: showRecommendations ? '1px solid #1f1f23' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
              Recommendations
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              borderRadius: '9999px',
              width: '18px',
              height: '18px',
              fontSize: '11px',
              fontWeight: 700,
            }}>
              3
            </span>
          </div>

          <div style={{ color: '#9ca3af' }}>
            {showRecommendations ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {/* Accordion Body */}
        {showRecommendations && (
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Item 1 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                marginTop: '6px',
                flexShrink: 0,
              }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                  Visitors cannot reach www.{subdomain.fullDomain}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                  Add an A, AAAA, or CNAME record for www and optionally <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>create a redirect rule</span> to send visitors to {subdomain.fullDomain}.
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                marginTop: '6px',
                flexShrink: 0,
              }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                  Visitors cannot reach {subdomain.fullDomain}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                  Add an A, AAAA, or CNAME record for the root domain.
                </div>
              </div>
            </div>

            {/* Bottom link */}
            <div style={{ textAlign: 'center', paddingTop: '8px' }}>
              <button 
                type="button"
                onClick={() => showToast('Tüm 3 optimizasyon önerisi gösteriliyor.')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#93c5fd',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Show all 3 recommendations
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. TOOLBAR ROW (Exact Cloudflare Search + Buttons) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginTop: '6px',
      }}>
        {/* Left: Search DNS Records */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search DNS Records"
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              backgroundColor: '#0c0d12',
              border: '1px solid #232530',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '12px',
              outline: 'none',
            }}
          />
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Filters Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                backgroundColor: '#121318',
                border: '1px solid #232530',
                borderRadius: '6px',
                color: '#d1d5db',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <Filter size={13} style={{ color: '#9ca3af' }} />
              <span>Filters</span>
            </button>

            {showFilterDropdown && (
              <div style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                backgroundColor: '#0c0d12',
                border: '1px solid #232530',
                borderRadius: '6px',
                padding: '6px',
                zIndex: 50,
                width: '140px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.7)',
              }}>
                <div
                  onClick={() => { setFilterType('ALL'); setShowFilterDropdown(false); }}
                  style={{ padding: '6px 10px', fontSize: '11px', color: filterType === 'ALL' ? '#60a5fa' : '#d1d5db', cursor: 'pointer', borderRadius: '4px' }}
                >
                  Tüm Kayıtlar
                </div>
                {RECORD_TYPES.map((t) => (
                  <div
                    key={t}
                    onClick={() => { setFilterType(t); setShowFilterDropdown(false); }}
                    style={{ padding: '6px 10px', fontSize: '11px', color: filterType === t ? '#60a5fa' : '#d1d5db', cursor: 'pointer', borderRadius: '4px' }}
                  >
                    {t} Kayıtları
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Display options */}
          <button
            onClick={() => showToast('Görüntüleme seçenekleri: Standart')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              backgroundColor: '#121318',
              border: '1px solid #232530',
              borderRadius: '6px',
              color: '#d1d5db',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Sliders size={13} style={{ color: '#9ca3af' }} />
            <span>Display options</span>
          </button>

          {/* Import */}
          <button
            onClick={() => {
              const input = prompt('BIND Zone formatında kayıt ekleyin veya IP girin (örn: 191.44.68.250):');
              if (input) {
                handleOpenAddForm('A');
                setRecordContent(input);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              backgroundColor: '#121318',
              border: '1px solid #232530',
              borderRadius: '6px',
              color: '#d1d5db',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Upload size={13} style={{ color: '#9ca3af' }} />
            <span>Import</span>
          </button>

          {/* Export */}
          <button
            onClick={handleExportZone}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              backgroundColor: '#121318',
              border: '1px solid #232530',
              borderRadius: '6px',
              color: '#d1d5db',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Download size={13} style={{ color: '#9ca3af' }} />
            <span>Export</span>
          </button>

          {/* + Add record (SOLID CLOUDFLARE BLUE) */}
          <button
            onClick={() => handleOpenAddForm('A')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              backgroundColor: '#0051c3',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0, 81, 195, 0.4)',
            }}
          >
            <Plus size={14} />
            <span>Add record</span>
          </button>
        </div>
      </div>

      {/* 6. RECORD COUNTER TEXT */}
      <div style={{ fontSize: '13px', color: '#9ca3af' }}>
        You have used <strong style={{ color: '#ffffff' }}>{records.length}</strong> of <strong>200</strong> available DNS records in this domain.
      </div>

      {/* 7. INLINE ADD / EDIT RECORD FORM (Cloudflare Inline Card) */}
      {isAddFormOpen && (
        <form
          onSubmit={handleSaveRecord}
          style={{
            backgroundColor: '#0d0e14',
            border: '1px solid #0051c3',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e202a', paddingBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
              {editingRecordId ? 'Edit DNS Record' : 'Add DNS Record'}
            </span>
            <button
              type="button"
              onClick={() => setIsAddFormOpen(false)}
              style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
            {/* Type */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>
                Type
              </label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value as DnsRecordType)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: '#050508',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {RECORD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>
                Name (use @ for root)
              </label>
              <input
                type="text"
                required
                value={recordName}
                onChange={(e) => setRecordName(e.target.value)}
                placeholder="@ or www"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: '#050508',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '12px',
                }}
              />
            </div>

            {/* IPv4 Address / Content */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>
                {recordType === 'A' ? 'IPv4 address' : recordType === 'AAAA' ? 'IPv6 address' : recordType === 'CNAME' ? 'Target' : 'Content'}
              </label>
              <input
                type="text"
                required
                value={recordContent}
                onChange={(e) => setRecordContent(e.target.value)}
                placeholder={recordType === 'A' ? '191.44.68.250' : 'Target domain or text'}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: '#050508',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            {/* Proxy Status Switch */}
            {['A', 'AAAA', 'CNAME'].includes(recordType) && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>
                  Proxy status
                </label>
                <button
                  type="button"
                  onClick={() => setRecordProxied(!recordProxied)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: recordProxied ? '#3c1808' : '#141416',
                    border: `1px solid ${recordProxied ? '#f38020' : '#27272a'}`,
                    color: recordProxied ? '#f38020' : '#9ca3af',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  {recordProxied ? <Cloud size={14} style={{ color: '#f38020' }} /> : <CloudOff size={14} />}
                  <span>{recordProxied ? 'Proxied' : 'DNS only'}</span>
                </button>
              </div>
            )}

            {/* TTL */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>
                TTL
              </label>
              <select
                value={recordTtl}
                onChange={(e) => setRecordTtl(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: '#050508',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '12px',
                }}
              >
                {TTL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Comment */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>
                Comment
              </label>
              <input
                type="text"
                value={recordComment}
                onChange={(e) => setRecordComment(e.target.value)}
                placeholder="Optional notes"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: '#050508',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '12px',
                }}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setIsAddFormOpen(false)}
              style={{
                padding: '7px 16px',
                backgroundColor: 'transparent',
                border: '1px solid #27272a',
                borderRadius: '6px',
                color: '#d1d5db',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '7px 18px',
                backgroundColor: '#0051c3',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* 8. EXACT CLOUDFLARE DNS TABLE */}
      <div style={{
        border: '1px solid #1f1f23',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#08080a',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{
                backgroundColor: '#0a0a0d',
                borderBottom: '1px solid #1f1f23',
                color: '#9ca3af',
                fontSize: '12px',
                fontWeight: 600,
              }}>
                <th style={{ padding: '12px 14px', width: '40px' }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredRecords.length > 0 && selectedRecords.length === filteredRecords.length}
                    style={{ accentColor: '#0051c3', cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '12px 14px', minWidth: '150px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Name</span>
                    <Info size={12} style={{ color: '#6b7280' }} />
                  </div>
                </th>
                <th style={{ padding: '12px 14px', width: '90px' }}>
                  <span>Type ^</span>
                </th>
                <th style={{ padding: '12px 14px', minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Content</span>
                    <Info size={12} style={{ color: '#6b7280' }} />
                  </div>
                </th>
                <th style={{ padding: '12px 14px', width: '130px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Proxy status</span>
                    <Info size={12} style={{ color: '#6b7280' }} />
                  </div>
                </th>
                <th style={{ padding: '12px 14px', width: '90px' }}>
                  <span>TTL</span>
                </th>
                <th style={{ padding: '12px 14px', width: '80px' }}>
                  <span>Tags</span>
                </th>
                <th style={{ padding: '12px 14px', width: '110px' }}>
                  <span>Comment</span>
                </th>
                <th style={{ padding: '12px 14px', width: '90px', textAlign: 'right' }}>
                  <span>Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '42px 20px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                    No DNS records. Add a DNS record individually or import a BIND file above.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isProxyable = ['A', 'AAAA', 'CNAME'].includes(rec.type);
                  const isSelected = selectedRecords.includes(rec.id);

                  return (
                    <tr
                      key={rec.id}
                      style={{
                        borderBottom: '1px solid #141416',
                        backgroundColor: isSelected ? 'rgba(0, 81, 195, 0.08)' : 'transparent',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#0e0f14';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '12px 14px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rec.id)}
                          style={{ accentColor: '#0051c3', cursor: 'pointer' }}
                        />
                      </td>

                      {/* Name */}
                      <td style={{ padding: '12px 14px', fontWeight: 500, color: '#ffffff' }}>
                        {rec.name === '@' ? subdomain.fullDomain : `${rec.name}.${subdomain.fullDomain}`}
                      </td>

                      {/* Type */}
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#ffffff' }}>
                        {rec.type}
                      </td>

                      {/* Content */}
                      <td style={{ padding: '12px 14px', color: '#d1d5db', fontFamily: 'monospace', fontSize: '12px' }}>
                        {rec.content}
                      </td>

                      {/* Proxy status */}
                      <td style={{ padding: '12px 14px' }}>
                        {isProxyable ? (
                          <button
                            type="button"
                            onClick={() => handleToggleProxy(rec)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: rec.proxied ? '#f38020' : '#9ca3af',
                              fontSize: '12px',
                              fontWeight: 500,
                              padding: 0,
                            }}
                          >
                            {rec.proxied ? (
                              <>
                                <Cloud size={14} style={{ color: '#f38020' }} />
                                <span>Proxied</span>
                              </>
                            ) : (
                              <>
                                <CloudOff size={14} style={{ color: '#9ca3af' }} />
                                <span>DNS only</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span style={{ color: '#6b7280', fontSize: '12px' }}>DNS only</span>
                        )}
                      </td>

                      {/* TTL */}
                      <td style={{ padding: '12px 14px', color: '#9ca3af' }}>
                        {rec.ttl === 300 || rec.ttl === 1 ? 'Auto' : `${rec.ttl}s`}
                      </td>

                      {/* Tags */}
                      <td style={{ padding: '12px 14px', color: '#6b7280' }}>
                        -
                      </td>

                      {/* Comment */}
                      <td style={{ padding: '12px 14px', color: '#9ca3af' }}>
                        {rec.tag || '-'}
                      </td>

                      {/* Details / Action */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenEditForm(rec)}
                            title="Edit"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#9ca3af',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(rec.id, rec.name)}
                            title="Delete"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          >
                            <Trash2 size={13} />
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
      </div>

    </div>
  );
}
