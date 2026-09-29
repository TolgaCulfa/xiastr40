'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import Footer from '@/components/Footer';
import { ClaimedSubdomain, DnsRecord, UrlRedirect, MaintenanceConfig, SslCertificate } from '@/lib/types';
import { getStoredSubdomains, saveStoredSubdomains } from '@/lib/storage';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function DomainRoutingContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const [subdomains, setSubdomains] = useState<ClaimedSubdomain[]>([]);
  const [selectedSubdomain, setSelectedSubdomain] = useState<ClaimedSubdomain | null>(null);
  const [initialSubTab, setInitialSubTab] = useState<'dns' | 'email' | 'redirect' | 'ssl' | 'guides'>('dns');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loaded = getStoredSubdomains();
    setSubdomains(loaded);

    // Parse URL slug: /dashboard/domains/:username?token/:domain/:tab
    // In Next.js, params.slug can be an array of segments
    const slug = (params?.slug as string[]) || [];
    let targetDomain = '';
    let targetTab: any = 'dns';

    if (slug.length >= 2) {
      targetDomain = slug[1];
      if (slug[2]) targetTab = slug[2];
    } else if (slug.length === 1) {
      targetDomain = slug[0];
    }

    // Also check window.location.pathname in case of special characters like '?'
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      // Example: ['dashboard', 'domains', 'tolga?849201', 'codexiaweb.info', 'dns']
      const domainsIdx = pathParts.indexOf('domains');
      if (domainsIdx !== -1 && pathParts.length > domainsIdx + 2) {
        targetDomain = pathParts[domainsIdx + 2];
        if (pathParts[domainsIdx + 3]) {
          targetTab = pathParts[domainsIdx + 3];
        }
      }
    }

    if (['dns', 'email', 'redirect', 'ssl', 'guides'].includes(targetTab)) {
      setInitialSubTab(targetTab);
    }

    if (loaded.length > 0) {
      if (targetDomain) {
        const found = loaded.find((s) => s.fullDomain.toLowerCase() === targetDomain.toLowerCase());
        if (found) {
          setSelectedSubdomain(found);
        } else {
          setSelectedSubdomain(loaded[0]);
        }
      } else {
        setSelectedSubdomain(loaded[0]);
      }
    }
  }, [params]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleAddDnsRecord = (newRecData: Omit<DnsRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedSubdomain) return;
    const now = new Date().toISOString();
    const newRecord: DnsRecord = {
      ...newRecData,
      id: `rec-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = subdomains.map((s) => {
      if (s.id === selectedSubdomain.id) {
        return { ...s, dnsRecords: [...s.dnsRecords, newRecord] };
      }
      return s;
    });
    setSubdomains(updated);
    saveStoredSubdomains(updated);
    const updatedCurrent = updated.find((s) => s.id === selectedSubdomain.id) || null;
    setSelectedSubdomain(updatedCurrent);
    showToast('Yeni DNS kaydı başarıyla eklendi.');
  };

  const handleDeleteDnsRecord = (recordId: string) => {
    if (!selectedSubdomain) return;
    const updated = subdomains.map((s) => {
      if (s.id === selectedSubdomain.id) {
        return { ...s, dnsRecords: s.dnsRecords.filter((r) => r.id !== recordId) };
      }
      return s;
    });
    setSubdomains(updated);
    saveStoredSubdomains(updated);
    const updatedCurrent = updated.find((s) => s.id === selectedSubdomain.id) || null;
    setSelectedSubdomain(updatedCurrent);
    showToast('DNS kaydı silindi.');
  };

  const handleToggleProxy = (recordId: string) => {
    if (!selectedSubdomain) return;
    const updated = subdomains.map((s) => {
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
    setSubdomains(updated);
    saveStoredSubdomains(updated);
    const updatedCurrent = updated.find((s) => s.id === selectedSubdomain.id) || null;
    setSelectedSubdomain(updatedCurrent);
    showToast('Proxy durumu güncellendi.');
  };

  const handleUpdateRedirect = (redirect: UrlRedirect | undefined) => {
    if (!selectedSubdomain) return;
    const updated = subdomains.map((s) => {
      if (s.id === selectedSubdomain.id) {
        return { ...s, redirect };
      }
      return s;
    });
    setSubdomains(updated);
    saveStoredSubdomains(updated);
    const updatedCurrent = updated.find((s) => s.id === selectedSubdomain.id) || null;
    setSelectedSubdomain(updatedCurrent);
    showToast('Yönlendirme kuralı kaydedildi.');
  };

  const handleDeleteSubdomain = (subdomainId: string) => {
    const updated = subdomains.filter((s) => s.id !== subdomainId);
    setSubdomains(updated);
    saveStoredSubdomains(updated);
    setSelectedSubdomain(updated.length > 0 ? updated[0] : null);
    showToast('Alan adı listeden kaldırıldı.');
  };

  const handleToggleDdosShield = (subdomainId: string) => {
    const updated = subdomains.map((s) => {
      if (s.id === subdomainId) {
        return { ...s, ddosShieldEnabled: !s.ddosShieldEnabled };
      }
      return s;
    });
    setSubdomains(updated);
    saveStoredSubdomains(updated);
    const updatedCurrent = updated.find((s) => s.id === subdomainId) || null;
    setSelectedSubdomain(updatedCurrent);
  };

  const handleUpdateMaintenance = (subdomainId: string, config: MaintenanceConfig) => {
    const updated = subdomains.map((s) => {
      if (s.id === subdomainId) {
        return { ...s, maintenanceConfig: config };
      }
      return s;
    });
    setSubdomains(updated);
    saveStoredSubdomains(updated);
    const updatedCurrent = updated.find((s) => s.id === subdomainId) || null;
    setSelectedSubdomain(updatedCurrent);
  };

  const handleUpdateSsl = (subdomainId: string, sslCert: SslCertificate) => {
    const updated = subdomains.map((s) => {
      if (s.id === subdomainId) {
        return { ...s, sslCert };
      }
      return s;
    });
    setSubdomains(updated);
    saveStoredSubdomains(updated);
    const updatedCurrent = updated.find((s) => s.id === subdomainId) || null;
    setSelectedSubdomain(updatedCurrent);
  };

  const handleAddSubdomain = (newSub: ClaimedSubdomain) => {
    const updated = [...subdomains, newSub];
    setSubdomains(updated);
    saveStoredSubdomains(updated);
    setSelectedSubdomain(newSub);
    showToast(`"${newSub.fullDomain}" eklendi!`);
  };

  const handleUpdateSubdomain = (updatedSub: ClaimedSubdomain) => {
    const updated = subdomains.map((s) => (s.id === updatedSub.id ? updatedSub : s));
    setSubdomains(updated);
    saveStoredSubdomains(updated);
    setSelectedSubdomain(updatedSub);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000000' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '24px 16px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <Dashboard
            subdomains={subdomains}
            onSelectSubdomain={setSelectedSubdomain}
            selectedSubdomain={selectedSubdomain}
            onAddDnsRecord={handleAddDnsRecord}
            onDeleteDnsRecord={handleDeleteDnsRecord}
            onToggleProxy={handleToggleProxy}
            onUpdateRedirect={handleUpdateRedirect}
            onDeleteSubdomain={handleDeleteSubdomain}
            onToggleDdosShield={handleToggleDdosShield}
            onUpdateMaintenance={handleUpdateMaintenance}
            onUpdateSsl={handleUpdateSsl}
            onAddSubdomain={handleAddSubdomain}
            onUpdateSubdomain={handleUpdateSubdomain}
            onNavigateToSearch={() => router.push('/subdomain-al')}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function DomainRoutingPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' }}>
          <Loader2 size={32} className="animate-spin text-white" />
        </div>
      }
    >
      <DomainRoutingContent />
    </Suspense>
  );
}
