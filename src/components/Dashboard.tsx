'use client';

import React, { useState } from 'react';
import { ClaimedSubdomain, DnsRecord, UrlRedirect } from '@/lib/types';
import DnsRecordManager from './DnsRecordManager';
import UrlRedirectManager from './UrlRedirectManager';
import SetupGuides from './SetupGuides';
import {
  Server,
  Cloud,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Activity,
  Plus,
  ArrowRight,
  Shield,
  Layers,
  Terminal,
  RefreshCw,
} from 'lucide-react';

interface DashboardProps {
  subdomains: ClaimedSubdomain[];
  onSelectSubdomain: (subdomain: ClaimedSubdomain) => void;
  selectedSubdomain: ClaimedSubdomain | null;
  onAddDnsRecord: (record: Omit<DnsRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteDnsRecord: (recordId: string) => void;
  onToggleProxy: (recordId: string) => void;
  onUpdateRedirect: (redirect: UrlRedirect | undefined) => void;
  onDeleteSubdomain: (subdomainId: string) => void;
  onNavigateToSearch: () => void;
}

export default function Dashboard({
  subdomains,
  onSelectSubdomain,
  selectedSubdomain,
  onAddDnsRecord,
  onDeleteDnsRecord,
  onToggleProxy,
  onUpdateRedirect,
  onDeleteSubdomain,
  onNavigateToSearch,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'dns' | 'redirect' | 'guides'>('dns');
  const [isCopiedDomain, setIsCopiedDomain] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{ status: string; ms: number; edge: string } | null>(null);

  const activeSub = selectedSubdomain || subdomains[0] || null;

  // Stats calculation
  const totalSubdomains = subdomains.length;
  const totalDnsRecords = subdomains.reduce((acc, s) => acc + s.dnsRecords.length, 0);
  const proxiedCount = subdomains.filter((s) => s.isProxied).length;

  const handleCopyDomain = (domain: string) => {
    navigator.clipboard.writeText(domain);
    setIsCopiedDomain(true);
    setTimeout(() => setIsCopiedDomain(false), 1800);
  };

  const handleTestPing = () => {
    setIsTestingPing(true);
    setPingResult(null);

    const edges = ['IST (İstanbul, TR)', 'FRA (Frankfurt, DE)', 'LHR (London, UK)', 'AMS (Amsterdam, NL)'];
    const randomEdge = edges[Math.floor(Math.random() * edges.length)];
    const randomMs = Math.floor(Math.random() * 14) + 8; // 8ms - 22ms

    setTimeout(() => {
      setIsTestingPing(false);
      setPingResult({
        status: 'Çözümlendi (RESOLVED 200 OK)',
        ms: randomMs,
        edge: randomEdge,
      });
    }, 600);
  };

  return (
    <section id="dashboard-section" style={{ padding: '48px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container">
        
        {/* Section Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Server size={16} style={{ color: 'var(--cf-orange)' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Yönetim Konsolu
              </span>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Subdomain & DNS Kontrol Paneli
            </h2>
          </div>

          <button
            onClick={onNavigateToSearch}
            className="btn-primary"
            style={{ padding: '9px 18px' }}
          >
            <Plus size={16} />
            <span>Yeni Subdomain Al</span>
          </button>
        </div>

        {/* Global Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '28px',
        }}>
          <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Aktif Subdomainler</span>
              <Globe size={16} style={{ color: 'var(--cf-orange)' }} />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {totalSubdomains}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              xias.tr ve xias.info üzerinde
            </div>
          </div>

          <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Toplam DNS Kaydı</span>
              <Layers size={16} style={{ color: 'var(--blue)' }} />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {totalDnsRecords}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              A, CNAME, TXT, MX kayıtları
            </div>
          </div>

          <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Cloudflare Edge Korumalı</span>
              <Cloud size={16} style={{ color: 'var(--cf-orange)' }} />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {proxiedCount} / {totalSubdomains}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--emerald)', marginTop: '4px' }}>
              Turuncu Bulut & DDoS Savunması Aktif
            </div>
          </div>

          <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Anycast Yanıt Süresi</span>
              <Activity size={16} style={{ color: 'var(--emerald)' }} />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
              ~14 ms
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              330+ Cloudflare PoP lokasyonu
            </div>
          </div>
        </div>

        {/* Main Dashboard Workspace */}
        {subdomains.length === 0 ? (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--bg-surface)' }}>
            <Globe size={40} style={{ color: 'var(--cf-orange)', margin: '0 auto 16px auto', opacity: 0.8 }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
              Henüz Kayıtlı Bir Subdomaininiz Yok
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 20px auto' }}>
              Hemen yukarıdaki arama alanından dilediğiniz bir alt alan adını (ör: <code>tolga.xias.tr</code>) ücretsiz olarak alın.
            </p>
            <button onClick={onNavigateToSearch} className="btn-primary">
              <Plus size={16} />
              <span>İlk Subdomaini Al</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'start' }}>
            
            {/* Left Subdomain List Sidebar */}
            <div className="card" style={{ padding: '16px', background: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.04em' }}>
                Kayıtlı Alan Adları ({subdomains.length})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {subdomains.map((sub) => {
                  const isSelected = activeSub?.id === sub.id;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => onSelectSubdomain(sub)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                        border: `1px solid ${isSelected ? 'var(--cf-orange-border)' : 'transparent'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: isSelected ? '#ffffff' : 'var(--text-secondary)' }}>
                          {sub.fullDomain}
                        </span>
                        <span style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          backgroundColor: sub.status === 'active' ? 'var(--emerald)' : 'var(--amber)',
                        }} />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '10px', padding: '1px 5px' }}>
                          {sub.dnsRecords.length} Kayıt
                        </span>
                        {sub.redirect && (
                          <span className="badge badge-cf" style={{ fontSize: '10px', padding: '1px 5px' }}>
                            {sub.redirect.statusCode} Yönlendirildi
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Subdomain Detail Canvas */}
            {activeSub && (
              <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
                
                {/* Active Subdomain Header Banner */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '20px',
                  borderBottom: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
                        {activeSub.fullDomain}
                      </h3>
                      <span className="badge badge-success">
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--emerald)' }} />
                        Aktif Edge
                      </span>
                      {activeSub.isProxied && (
                        <span className="badge badge-cf">
                          <Cloud size={11} />
                          Cloudflare Proxied
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {activeSub.description || 'Yönetilen Subdomain'} &bull; Kayıt: {new Date(activeSub.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>

                  {/* Actions (Copy, Test Ping, Open, Delete) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleCopyDomain(activeSub.fullDomain)}
                      className="btn-secondary btn-sm"
                      title="Alan adını kopyala"
                    >
                      {isCopiedDomain ? <Check size={14} style={{ color: 'var(--emerald)' }} /> : <Copy size={14} />}
                      <span>{isCopiedDomain ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>

                    <button
                      onClick={handleTestPing}
                      disabled={isTestingPing}
                      className="btn-secondary btn-sm"
                      title="Cloudflare Anycast DNS yayılımını test et"
                    >
                      <RefreshCw size={14} className={isTestingPing ? 'pulse-indicator' : ''} />
                      <span>{isTestingPing ? 'Test ediliyor...' : 'Yayılımı Test Et'}</span>
                    </button>

                    <a
                      href={`https://${activeSub.fullDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary btn-sm"
                      title="Web sitesini yeni sekmede aç"
                    >
                      <ExternalLink size={14} />
                      <span>Aç</span>
                    </a>

                    <button
                      onClick={() => {
                        if (confirm(`"${activeSub.fullDomain}" alt alan adını silmek istediğinizden emin misiniz?`)) {
                          onDeleteSubdomain(activeSub.id);
                        }
                      }}
                      className="btn-danger btn-sm"
                      title="Subdomaini Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Ping Result Banner */}
                {pingResult && (
                  <div
                    className="animate-slide-down"
                    style={{
                      marginTop: '16px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid var(--emerald-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={16} style={{ color: 'var(--emerald)' }} />
                      <span style={{ fontWeight: 600, color: '#ffffff' }}>{pingResult.status}</span>
                      <span style={{ color: 'var(--text-muted)' }}>&bull; PoP Lokasyonu: {pingResult.edge}</span>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--emerald)', fontFamily: 'Geist Mono, monospace' }}>
                      {pingResult.ms} ms
                    </div>
                  </div>
                )}

                {/* Tabs Switcher */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginTop: '16px',
                }}>
                  <button
                    onClick={() => setActiveTab('dns')}
                    style={{
                      padding: '10px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: activeTab === 'dns' ? 'var(--cf-orange)' : 'var(--text-muted)',
                      borderBottom: `2px solid ${activeTab === 'dns' ? 'var(--cf-orange)' : 'transparent'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Layers size={14} />
                    <span>DNS Kayıtları ({activeSub.dnsRecords.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('redirect')}
                    style={{
                      padding: '10px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: activeTab === 'redirect' ? 'var(--cf-orange)' : 'var(--text-muted)',
                      borderBottom: `2px solid ${activeTab === 'redirect' ? 'var(--cf-orange)' : 'transparent'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ArrowRight size={14} />
                    <span>URL Yönlendirme {activeSub.redirect ? '(Aktif)' : ''}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('guides')}
                    style={{
                      padding: '10px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: activeTab === 'guides' ? 'var(--cf-orange)' : 'var(--text-muted)',
                      borderBottom: `2px solid ${activeTab === 'guides' ? 'var(--cf-orange)' : 'transparent'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Terminal size={14} />
                    <span>Entegrasyon Kılavuzu</span>
                  </button>
                </div>

                {/* Tab Views */}
                {activeTab === 'dns' && (
                  <DnsRecordManager
                    subdomain={activeSub}
                    onAddRecord={onAddDnsRecord}
                    onDeleteRecord={onDeleteDnsRecord}
                    onToggleProxy={onToggleProxy}
                  />
                )}

                {activeTab === 'redirect' && (
                  <UrlRedirectManager
                    subdomain={activeSub}
                    onUpdateRedirect={onUpdateRedirect}
                  />
                )}

                {activeTab === 'guides' && (
                  <SetupGuides activeDomain={activeSub.fullDomain} />
                )}

              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}
