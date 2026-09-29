'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SubdomainSearch from '@/components/SubdomainSearch';
import ClaimModal from '@/components/ClaimModal';
import Footer from '@/components/Footer';
import { ClaimedSubdomain, DomainZone } from '@/lib/types';
import { getStoredSubdomains, saveStoredSubdomains } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import { Globe, ShieldCheck, Zap } from 'lucide-react';

export default function SubdomainAlPage() {
  const router = useRouter();
  const [subdomains, setSubdomains] = useState<ClaimedSubdomain[]>([]);
  const [claimTarget, setClaimTarget] = useState<{ subdomain: string; zone: DomainZone } | null>(null);

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

    router.push('/dashboard?claimed=' + encodeURIComponent(newSub.fullDomain));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000000' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '40px 0 80px 0', backgroundColor: '#000000' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
            }}>
              Subdomain Seçin & Etkinleştirin
            </h1>

            <p style={{ fontSize: '15px', color: '#888888', maxWidth: '520px', margin: '0 auto' }}>
              <strong>xias.tr</strong> veya <strong>xias.info</strong> uzantısıyla dilediğiniz subdomaini arayın, DNS veya IP yönlendirmesini tamamlayın.
            </p>
          </div>

          {/* Search Component */}
          <SubdomainSearch
            claimedSubdomains={subdomains}
            onClaimSubdomain={handleOpenClaimModal}
          />

          {/* Feature Highlights */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            marginTop: '28px',
          }}>
            <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
              <Zap size={18} style={{ color: '#ffffff' }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>Anında Yayılım</div>
                <div style={{ fontSize: '11px', color: '#666666' }}>Cloudflare Anycast altyapısı</div>
              </div>
            </div>

            <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
              <ShieldCheck size={18} style={{ color: '#ffffff' }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>Otomatik SSL & DDoS</div>
                <div style={{ fontSize: '11px', color: '#666666' }}>Ücretsiz HTTPS koruması</div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />

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
