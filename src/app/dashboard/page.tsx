'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import Footer from '@/components/Footer';
import { ClaimedSubdomain, DnsRecord, UrlRedirect } from '@/lib/types';
import { getStoredSubdomains, saveStoredSubdomains } from '@/lib/storage';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const claimedParam = searchParams.get('claimed');

  const [subdomains, setSubdomains] = useState<ClaimedSubdomain[]>([]);
  const [selectedSubdomain, setSelectedSubdomain] = useState<ClaimedSubdomain | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loaded = getStoredSubdomains();
    setSubdomains(loaded);
    if (loaded.length > 0) {
      if (claimedParam) {
        const found = loaded.find((s) => s.fullDomain === claimedParam);
        setSelectedSubdomain(found || loaded[0]);
        setToastMessage(`"${claimedParam}" başarıyla oluşturuldu ve DNS yapılandırmasına hazır!`);
      } else {
        setSelectedSubdomain(loaded[0]);
      }
    }
  }, [claimedParam]);

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
        return {
          ...s,
          dnsRecords: [...s.dnsRecords, newRecord],
        };
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
        return {
          ...s,
          dnsRecords: s.dnsRecords.filter((r) => r.id !== recordId),
        };
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
    showToast('Cloudflare Proxy durumu değiştirildi.');
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
    showToast(redirect ? 'URL Yönlendirme kuralı aktif edildi.' : 'URL Yönlendirme kaldırıldı.');
  };

  const handleDeleteSubdomain = (subdomainId: string) => {
    const updated = subdomains.filter((s) => s.id !== subdomainId);
    setSubdomains(updated);
    saveStoredSubdomains(updated);
    setSelectedSubdomain(updated.length > 0 ? updated[0] : null);
    showToast('Subdomain ve DNS kayıtları silindi.');
  };

  return (
    <>
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

      <Dashboard
        subdomains={subdomains}
        selectedSubdomain={selectedSubdomain}
        onSelectSubdomain={setSelectedSubdomain}
        onAddDnsRecord={handleAddDnsRecord}
        onDeleteDnsRecord={handleDeleteDnsRecord}
        onToggleProxy={handleToggleProxy}
        onUpdateRedirect={handleUpdateRedirect}
        onDeleteSubdomain={handleDeleteSubdomain}
        onNavigateToSearch={() => router.push('/subdomain-al')}
      />
    </>
  );
}

export default function DashboardPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <Suspense fallback={
          <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="pulse-indicator" style={{ margin: '0 auto 12px auto' }} />
            <div>Dashboard yükleniyor...</div>
          </div>
        }>
          <DashboardContent />
        </Suspense>
      </main>

      <Footer onNavigate={() => {}} onOpenSettings={() => {}} />
    </div>
  );
}
