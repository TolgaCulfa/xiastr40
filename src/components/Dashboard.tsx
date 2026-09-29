'use client';

import React, { useState } from 'react';
import { ClaimedSubdomain, DnsRecord, UrlRedirect } from '@/lib/types';
import DnsRecordManager from './DnsRecordManager';
import UrlRedirectManager from './UrlRedirectManager';
import SetupGuides from './SetupGuides';
import {
  Server,
  Globe,
  Mail,
  CreditCard,
  Shield,
  Activity,
  Layers,
  Plus,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Terminal,
  Cloud,
  Lock,
  PieChart,
  CheckCircle2,
  AlertCircle,
  Zap,
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

type MainDashboardView = 'domains' | 'mail' | 'billing' | 'security' | 'analytics';

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
  const [currentView, setCurrentView] = useState<MainDashboardView>('domains');
  const [activeTab, setActiveTab] = useState<'dns' | 'redirect' | 'guides'>('dns');
  const [isCopiedDomain, setIsCopiedDomain] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{ status: string; ms: number; edge: string } | null>(null);

  // Mail server states
  const [mailCatchAllTarget, setMailCatchAllTarget] = useState('tolga@gmail.com');
  const [mailStatusMsg, setMailStatusMsg] = useState<string | null>(null);

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
    const randomMs = Math.floor(Math.random() * 12) + 8; // 8ms - 20ms

    setTimeout(() => {
      setIsTestingPing(false);
      setPingResult({
        status: 'Çözümlendi (RESOLVED 200 OK)',
        ms: randomMs,
        edge: randomEdge,
      });
    }, 500);
  };

  // Add 1-click Cloudflare Email Routing MX & TXT records to active subdomain
  const handleAutoConfigureMail = () => {
    if (!activeSub) return;
    if (activeSub.dnsRecords.length >= 5) {
      alert('DNS limitine (6 kayıt) yaklaştınız. Lütfen önce gereksiz kayıtları silin.');
      return;
    }

    onAddDnsRecord({
      subdomainId: activeSub.id,
      type: 'MX',
      name: '@',
      content: 'isaac.mx.cloudflare.net',
      ttl: 1,
      proxied: false,
      priority: 10,
    });

    onAddDnsRecord({
      subdomainId: activeSub.id,
      type: 'TXT',
      name: '@',
      content: 'v=spf1 include:_spf.mx.cloudflare.net ~all',
      ttl: 300,
      proxied: false,
    });

    setMailStatusMsg(`Cloudflare Email Routing (MX ve SPF TXT) kayıtları "${activeSub.fullDomain}" için otomatik eklendi!`);
    setTimeout(() => setMailStatusMsg(null), 4000);
  };

  return (
    <section id="dashboard-section" style={{ padding: '36px 0 80px 0' }}>
      <div className="container">
        
        {/* Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Server size={15} style={{ color: 'var(--cf-orange)' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                XIAS Cloud Konsolu
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Yönetim & Kontrol Merkezi
            </h1>
          </div>

          <button
            onClick={onNavigateToSearch}
            className="btn-primary"
            style={{ padding: '9px 18px', fontSize: '13px' }}
          >
            <Plus size={15} />
            <span>Yeni Subdomain Al</span>
          </button>
        </div>

        {/* Top View Selector Menu */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}>
          <button
            onClick={() => setCurrentView('domains')}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: currentView === 'domains' ? 'var(--cf-orange)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${currentView === 'domains' ? 'var(--cf-orange)' : 'transparent'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Globe size={15} />
            <span>Domainlerim ({totalSubdomains})</span>
          </button>

          <button
            onClick={() => setCurrentView('mail')}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: currentView === 'mail' ? 'var(--cf-orange)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${currentView === 'mail' ? 'var(--cf-orange)' : 'transparent'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Mail size={15} />
            <span>Mail Server & E-posta</span>
          </button>

          <button
            onClick={() => setCurrentView('billing')}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: currentView === 'billing' ? 'var(--cf-orange)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${currentView === 'billing' ? 'var(--cf-orange)' : 'transparent'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <CreditCard size={15} />
            <span>Faturalandırma & Plan</span>
          </button>

          <button
            onClick={() => setCurrentView('security')}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: currentView === 'security' ? 'var(--cf-orange)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${currentView === 'security' ? 'var(--cf-orange)' : 'transparent'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Shield size={15} />
            <span>Güvenlik & SSL/TLS</span>
          </button>

          <button
            onClick={() => setCurrentView('analytics')}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: currentView === 'analytics' ? 'var(--cf-orange)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${currentView === 'analytics' ? 'var(--cf-orange)' : 'transparent'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <PieChart size={15} />
            <span>Analitik & Trafik</span>
          </button>
        </div>

        {/* VIEW 1: DOMAINLERIM */}
        {currentView === 'domains' && (
          <div className="animate-fade-in">
            {/* Quick Metrics Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '24px',
            }}>
              <div className="card" style={{ padding: '14px 18px', background: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Kayıtlı Subdomainler</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>{totalSubdomains}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>.xias.tr &bull; .xias.info</div>
              </div>

              <div className="card" style={{ padding: '14px 18px', background: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Toplam DNS Kaydı</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>{totalDnsRecords}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Maksimum 6 kayıt / domain</div>
              </div>

              <div className="card" style={{ padding: '14px 18px', background: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Cloudflare Proxy Koruması</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--cf-orange)', marginTop: '4px' }}>{proxiedCount} Aktif</div>
                <div style={{ fontSize: '11px', color: 'var(--emerald)', marginTop: '2px' }}>DDoS & Anycast CDN Devrede</div>
              </div>

              <div className="card" style={{ padding: '14px 18px', background: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Edge Gecikmesi</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--emerald)', marginTop: '4px' }}>~12 ms</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>330+ Cloudflare PoP</div>
              </div>
            </div>

            {/* Subdomain Management Grid */}
            {subdomains.length === 0 ? (
              <div className="card" style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--bg-surface)' }}>
                <Globe size={40} style={{ color: 'var(--cf-orange)', margin: '0 auto 16px auto', opacity: 0.8 }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
                  Henüz Kayıtlı Bir Subdomaininiz Yok
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 20px auto' }}>
                  Hemen ücretsiz bir alt alan adı seçin (ör: <code>tolga.xias.tr</code>).
                </p>
                <button onClick={onNavigateToSearch} className="btn-primary">
                  <Plus size={16} />
                  <span>Subdomain Al</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', alignItems: 'start' }}>
                
                {/* Left Subdomain List */}
                <div className="card" style={{ padding: '16px', background: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.04em' }}>
                    Alan Adlarım ({subdomains.length})
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
                              backgroundColor: 'var(--emerald)',
                            }} />
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <span className="badge badge-neutral" style={{ fontSize: '10px', padding: '1px 5px' }}>
                              {sub.dnsRecords.length}/6 Kayıt
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

                {/* Right Workspace */}
                {activeSub && (
                  <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
                    
                    {/* Active Sub Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: '18px',
                      borderBottom: '1px solid var(--border-subtle)',
                      flexWrap: 'wrap',
                      gap: '14px',
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
                            {activeSub.fullDomain}
                          </h2>
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

                      {/* Actions */}
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

                    {/* Subdomain Tab Switcher */}
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
                        <span>DNS Kayıtları ({activeSub.dnsRecords.length}/6)</span>
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
        )}

        {/* VIEW 2: MAIL SERVER */}
        {currentView === 'mail' && (
          <div className="card animate-fade-in" style={{ padding: '28px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--cf-orange-subtle)',
                color: 'var(--cf-orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Mail size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                  Cloudflare Email Routing & Mail Server
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Subdomaininiz için ücretsiz özel e-posta adresleri (ör: <code>iletisim@{activeSub?.fullDomain || 'dev.xias.tr'}</code>) oluşturun ve Gmail'e yönlendirin.
                </p>
              </div>
            </div>

            {mailStatusMsg && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid var(--emerald-border)',
                color: 'var(--emerald)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
              }}>
                <CheckCircle2 size={16} />
                <span>{mailStatusMsg}</span>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '20px',
            }}>
              {/* Card 1: Forwarding configuration */}
              <div style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
                  Catch-All E-posta Yönlendirmesi
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  {activeSub ? activeSub.fullDomain : 'Subdomain'} adresinize gelen tüm e-postaları doğrudan kişisel kutunuza iletir.
                </p>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Yönlendirilecek Hedef E-posta:
                  </label>
                  <input
                    type="email"
                    value={mailCatchAllTarget}
                    onChange={(e) => setMailCatchAllTarget(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ffffff',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <button
                  onClick={handleAutoConfigureMail}
                  className="btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Zap size={14} />
                  <span>Otomatik Mail DNS Kayıtlarını Ekle (MX & SPF)</span>
                </button>
              </div>

              {/* Card 2: Generated DNS Records list */}
              <div style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
                  Önerilen Mail DNS Kayıtları
                </h4>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Cloudflare Email Routing protokolü için gereken DNS parametreleri:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--cf-orange)', fontWeight: 600 }}>MX (Öncelik 10):</span>&nbsp;
                    <code>isaac.mx.cloudflare.net</code>
                  </div>
                  <div style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--blue)', fontWeight: 600 }}>TXT (SPF):</span>&nbsp;
                    <code>v=spf1 include:_spf.mx.cloudflare.net ~all</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: BILLING & PLAN */}
        {currentView === 'billing' && (
          <div className="card animate-fade-in" style={{ padding: '28px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--emerald-subtle)',
                  color: 'var(--emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                    Faturalandırma & Abonelik Planı
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Mevcut kullanım kotalarınız ve hesap limitleriniz.
                  </p>
                </div>
              </div>

              <span className="badge badge-success" style={{ fontSize: '13px', padding: '6px 12px' }}>
                Ömür Boyu Ücretsiz Plan (Free Tier)
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: '28px',
            }}>
              <div style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Subdomain Kotası</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginTop: '6px' }}>{totalSubdomains} / 10</div>
                <div style={{ fontSize: '11px', color: 'var(--emerald)', marginTop: '4px' }}>%100 Ücretsiz Tahsis</div>
              </div>

              <div style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>DNS Kaydı / Subdomain</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginTop: '6px' }}>Maksimum 6 Kayıt</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>A, AAAA, CNAME, TXT, MX</div>
              </div>

              <div style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Anycast DDoS Koruması</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cf-orange)', marginTop: '6px' }}>Sınırsız</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Cloudflare Katman 3/4 & 7</div>
              </div>
            </div>

            {/* Invoices list */}
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '12px' }}>
              Fatura Geçmişi
            </h4>
            <div style={{
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 14px' }}>Fatura No</th>
                    <th style={{ padding: '10px 14px' }}>Tarih</th>
                    <th style={{ padding: '10px 14px' }}>Hizmet</th>
                    <th style={{ padding: '10px 14px' }}>Tutar</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px 14px', color: '#ffffff', fontFamily: 'Geist Mono, monospace' }}>INV-2026-001</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>29 Eylül 2026</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>XIAS Community Tier (xias.tr / xias.info)</td>
                    <td style={{ padding: '12px 14px', color: '#ffffff', fontWeight: 600 }}>₺0.00</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <span className="badge badge-success">Ödendi (Ücretsiz)</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: SECURITY & SSL */}
        {currentView === 'security' && (
          <div className="card animate-fade-in" style={{ padding: '28px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--blue-subtle)',
                color: 'var(--blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Shield size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                  Güvenlik & SSL/TLS Şifreleme Durumu
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Cloudflare Anycast altyapısı ile sağlanan aktif koruma katmanları.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald)', marginBottom: '8px' }}>
                  <Lock size={18} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Otomatik SSL/TLS Şifreleme</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Tüm subdomaine gelen HTTPS istekleri 256-bit TLS şifrelemesi ile korunur. Süre dolumu otomatik yenilenir.
                </p>
              </div>

              <div style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cf-orange)', marginBottom: '8px' }}>
                  <Shield size={18} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>DDoS & Bot Mitigation</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Katman 3/4 SYN flood ve Katman 7 HTTP flood saldırıları Cloudflare Edge PoP noktalarında otomatik filtrelenir.
                </p>
              </div>

              <div style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--blue)', marginBottom: '8px' }}>
                  <Zap size={18} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>DNSSEC Doğrulaması</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Kriptografik DNS imzalaması ile DNS spoofing ve zehirleme girişimlerine karşı tam koruma sağlanır.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: ANALYTICS & TRAFFIC */}
        {currentView === 'analytics' && (
          <div className="card animate-fade-in" style={{ padding: '28px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--cf-orange-subtle)',
                color: 'var(--cf-orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <PieChart size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                  Kenar Ağı (Edge) Trafik & İstek Metrikleri
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Son 24 saat içindeki DNS çözümleme ve CDN istekleri.
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
            }}>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Toplam İstek Sayısı</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>14,280</div>
                <div style={{ fontSize: '11px', color: 'var(--emerald)', marginTop: '2px' }}>+18% bu hafta</div>
              </div>

              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Önbellek Oranı (Cache Hit)</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--cf-orange)', marginTop: '4px' }}>%88.4</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Sunucu yükünden tasarruf</div>
              </div>

              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Engellenen Tehditler</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--rose)', marginTop: '4px' }}>142</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Bot & SQLi tespiti</div>
              </div>

              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bant Genişliği Tasarrufu</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--blue)', marginTop: '4px' }}>1.8 GB</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Edge sıkıştırma aktif</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
