'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SubdomainSearch from '@/components/SubdomainSearch';
import ClaimModal from '@/components/ClaimModal';
import Footer from '@/components/Footer';
import { ClaimedSubdomain, DomainZone } from '@/lib/types';
import { getStoredSubdomains, saveStoredSubdomains } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import { Globe, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';

export default function SubdomainAlPage() {
  const router = useRouter();
  const [subdomains, setSubdomains] = useState<ClaimedSubdomain[]>([]);
  const [claimTarget, setClaimTarget] = useState<{ subdomain: string; zone: DomainZone } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setSubdomains(getStoredSubdomains());
  }, []);

  const handleOpenClaimModal = (subdomain: string, zone: DomainZone) => {
    setClaimTarget({ subdomain, zone });
  };

  const handleClaimSuccess = (newSub: ClaimedSubdomain) => {
    const updated = [newSub, ...subdomains];
    setSubdomains(updated);
    saveStoredSubdomains(updated);
    setClaimTarget(null);

    // Redirect to dashboard with notification
    router.push('/dashboard?claimed=' + encodeURIComponent(newSub.fullDomain));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '40px 0 80px 0' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          
          {/* Header Banner */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--cf-orange-subtle)',
              border: '1px solid var(--cf-orange-border)',
              color: 'var(--cf-orange)',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px',
            }}>
              <Globe size={15} />
              <span>Anında Ücretsiz Subdomain</span>
            </div>

            <h1 style={{
              fontSize: '38px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              marginBottom: '12px',
            }}>
              Alan Adınızı Seçin & Etkinleştirin
            </h1>

            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto' }}>
              <strong>xias.tr</strong> veya <strong>xias.info</strong> uzantısıyla dilediğiniz subdomaini arayın, saniyeler içinde DNS ve yönlendirme ayarlarını tamamlayın.
            </p>
          </div>

          {/* Search Component */}
          <SubdomainSearch
            claimedSubdomains={subdomains}
            onClaimSubdomain={handleOpenClaimModal}
          />

          {/* Feature Highlights Minimal Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginTop: '36px',
          }}>
            <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-surface)' }}>
              <div style={{ color: 'var(--cf-orange)' }}>
                <Zap size={20} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>Anında Yayılım</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cloudflare Anycast 1 dk TTL desteği</div>
              </div>
            </div>

            <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-surface)' }}>
              <div style={{ color: 'var(--emerald)' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>Otomatik SSL & DDoS</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ücretsiz HTTPS ve saldırı koruması</div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer onNavigate={() => {}} onOpenSettings={() => {}} />

      {/* Claim Modal */}
      {claimTarget && (
        <ClaimModal
          subdomain={claimTarget.subdomain}
          domainZone={claimTarget.zone}
          onClose={() => setClaimTarget(null)}
          onSuccess={handleClaimSuccess}
        />
      )}
    </div>
  );
}
