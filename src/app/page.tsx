'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import SubdomainSearch from '@/components/SubdomainSearch';
import Dashboard from '@/components/Dashboard';
import SetupGuides from '@/components/SetupGuides';
import ClaimModal from '@/components/ClaimModal';
import CloudflareSettingsModal from '@/components/CloudflareSettingsModal';
import Footer from '@/components/Footer';
import {
  ClaimedSubdomain,
  CloudflareConfig,
  DnsRecord,
  DomainZone,
  UrlRedirect,
} from '@/lib/types';
import {
  getStoredSubdomains,
  saveStoredSubdomains,
  getStoredCloudflareConfig,
  saveStoredCloudflareConfig,
} from '@/lib/storage';
import { CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [subdomains, setSubdomains] = useState<ClaimedSubdomain[]>([]);
  const [selectedSubdomain, setSelectedSubdomain] = useState<ClaimedSubdomain | null>(null);
  const [cfConfig, setCfConfig] = useState<CloudflareConfig>({
    apiToken: '',
    zoneIdXiasTr: '',
    zoneIdXiasInfo: '',
    autoProxyNewRecords: true,
  });

  const [activeSection, setActiveSection] = useState('search');
  const [claimTarget, setClaimTarget] = useState<{ subdomain: string; zone: DomainZone } | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadedSubs = getStoredSubdomains();
    setSubdomains(loadedSubs);
    if (loadedSubs.length > 0) {
      setSelectedSubdomain(loadedSubs[0]);
    }
    const loadedConfig = getStoredCloudflareConfig();
    setCfConfig(loadedConfig);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Subdomain claiming
  const handleOpenClaimModal = (subdomain: string, zone: DomainZone) => {
    setClaimTarget({ subdomain, zone });
  };

  const handleClaimSuccess = (newSub: ClaimedSubdomain) => {
    const updated = [newSub, ...subdomains];
    setSubdomains(updated);
    setSelectedSubdomain(newSub);
    saveStoredSubdomains(updated);
    setClaimTarget(null);
    showToast(`"${newSub.fullDomain}" başarıyla kaydedildi ve DNS kaydı aktif edildi!`);

    // Smooth scroll to dashboard
    handleNavigate('dashboard');
  };

  // DNS Record Handlers
  const handleAddDnsRecord = (newRecData: Omit<DnsRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedSubdomain) return;

    const now = new Date().toISOString();
    const newRecord: DnsRecord = {
      ...newRecData,
      id: `rec-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    const updatedSubdomains = subdomains.map((s) => {
      if (s.id === selectedSubdomain.id) {
        return {
          ...s,
          dnsRecords: [...s.dnsRecords, newRecord],
        };
      }
      return s;
    });

    setSubdomains(updatedSubdomains);
    saveStoredSubdomains(updatedSubdomains);

    const updatedCurrent = updatedSubdomains.find((s) => s.id === selectedSubdomain.id) || null;
    setSelectedSubdomain(updatedCurrent);
    showToast('Yeni DNS kaydı başarıyla eklendi.');
  };

  const handleDeleteDnsRecord = (recordId: string) => {
    if (!selectedSubdomain) return;

    const updatedSubdomains = subdomains.map((s) => {
      if (s.id === selectedSubdomain.id) {
        return {
          ...s,
          dnsRecords: s.dnsRecords.filter((r) => r.id !== recordId),
        };
      }
      return s;
    });

    setSubdomains(updatedSubdomains);
    saveStoredSubdomains(updatedSubdomains);

    const updatedCurrent = updatedSubdomains.find((s) => s.id === selectedSubdomain.id) || null;
    setSelectedSubdomain(updatedCurrent);
    showToast('DNS kaydı silindi.');
  };

  const handleToggleProxy = (recordId: string) => {
    if (!selectedSubdomain) return;

    const updatedSubdomains = subdomains.map((s) => {
      if (s.id === selectedSubdomain.id) {
        return {
          ...s,
          dnsRecords: s.dnsRecords.map((r) => {
            if (r.id === recordId) {
              return { ...r, proxied: !r.proxied, updatedAt: new Date().toISOString() };
            }
            return r;
          }),
        };
      }
      return s;
    });

    setSubdomains(updatedSubdomains);
    saveStoredSubdomains(updatedSubdomains);

    const updatedCurrent = updatedSubdomains.find((s) => s.id === selectedSubdomain.id) || null;
    setSelectedSubdomain(updatedCurrent);
    showToast('Cloudflare Proxy durumu güncellendi.');
  };

  // URL Redirect Update
  const handleUpdateRedirect = (redirect: UrlRedirect | undefined) => {
    if (!selectedSubdomain) return;

    const updatedSubdomains = subdomains.map((s) => {
      if (s.id === selectedSubdomain.id) {
        return {
          ...s,
          redirect: redirect,
        };
      }
      return s;
    });

    setSubdomains(updatedSubdomains);
    saveStoredSubdomains(updatedSubdomains);

    const updatedCurrent = updatedSubdomains.find((s) => s.id === selectedSubdomain.id) || null;
    setSelectedSubdomain(updatedCurrent);
    showToast(redirect ? 'URL Yönlendirme kuralı aktif edildi.' : 'URL Yönlendirme kuralı kaldırıldı.');
  };

  // Subdomain Deletion
  const handleDeleteSubdomain = (subdomainId: string) => {
    const updated = subdomains.filter((s) => s.id !== subdomainId);
    setSubdomains(updated);
    saveStoredSubdomains(updated);
    setSelectedSubdomain(updated.length > 0 ? updated[0] : null);
    showToast('Subdomain ve ilişkili tüm kayıtlar silindi.');
  };

  // Navigation
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'search') {
      const el = document.getElementById('search-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'dashboard') {
      const el = document.getElementById('dashboard-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'guides') {
      const el = document.getElementById('guides-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Save Cloudflare Settings
  const handleSaveCfConfig = (newConfig: CloudflareConfig) => {
    setCfConfig(newConfig);
    saveStoredCloudflareConfig(newConfig);
    showToast('Cloudflare API yapılandırması başarıyla kaydedildi.');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="animate-slide-down"
          style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            zIndex: 110,
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--cf-orange-border)',
            boxShadow: 'var(--shadow-modal)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: '#ffffff',
          }}
        >
          <CheckCircle2 size={16} style={{ color: 'var(--cf-orange)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        onOpenSettings={() => setShowSettingsModal(true)}
        onNavigate={handleNavigate}
        activeSection={activeSection}
        hasCfToken={Boolean(cfConfig.apiToken)}
      />

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <HeroSection
          onScrollToSearch={() => handleNavigate('search')}
          onScrollToDashboard={() => handleNavigate('dashboard')}
        />

        {/* Subdomain Search & Claim Section */}
        <SubdomainSearch
          claimedSubdomains={subdomains}
          onClaimSubdomain={handleOpenClaimModal}
        />

        {/* Dashboard Section */}
        <Dashboard
          subdomains={subdomains}
          onSelectSubdomain={setSelectedSubdomain}
          selectedSubdomain={selectedSubdomain}
          onAddDnsRecord={handleAddDnsRecord}
          onDeleteDnsRecord={handleDeleteDnsRecord}
          onToggleProxy={handleToggleProxy}
          onUpdateRedirect={handleUpdateRedirect}
          onDeleteSubdomain={handleDeleteSubdomain}
          onNavigateToSearch={() => handleNavigate('search')}
        />

        {/* Standalone Entegrasyon Kılavuzları Bölümü */}
        <section id="guides-section" style={{ padding: '48px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            <SetupGuides activeDomain={selectedSubdomain ? selectedSubdomain.fullDomain : 'projeniz.xias.tr'} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Claim Modal */}
      {claimTarget && (
        <ClaimModal
          subdomain={claimTarget.subdomain}
          domainZone={claimTarget.zone}
          onClose={() => setClaimTarget(null)}
          onSuccess={handleClaimSuccess}
        />
      )}

      {/* Cloudflare Settings Modal */}
      {showSettingsModal && (
        <CloudflareSettingsModal
          config={cfConfig}
          onSave={handleSaveCfConfig}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

    </div>
  );
}
