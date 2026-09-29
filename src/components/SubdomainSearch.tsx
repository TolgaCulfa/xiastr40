'use client';

import React, { useState, useEffect } from 'react';
import { DomainZone, ClaimedSubdomain, AvailabilityResult } from '@/lib/types';
import { sanitizeSubdomainName, validateSubdomainFormat, RESERVED_SUBDOMAINS } from '@/lib/storage';
import { Search, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Globe, Loader2 } from 'lucide-react';

interface SubdomainSearchProps {
  claimedSubdomains: ClaimedSubdomain[];
  onClaimSubdomain: (subdomain: string, zone: DomainZone) => void;
}

export default function SubdomainSearch({ claimedSubdomains, onClaimSubdomain }: SubdomainSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<DomainZone>('xias.tr');
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const clean = sanitizeSubdomainName(searchTerm);
    if (!clean) {
      setResult(null);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    const timer = setTimeout(() => {
      // 1. Format validation
      const validation = validateSubdomainFormat(clean);
      if (!validation.valid) {
        setResult({
          subdomain: clean,
          domainZone: selectedZone,
          fullDomain: `${clean}.${selectedZone}`,
          available: false,
          reason: 'invalid_format',
          message: validation.error || 'Geçersiz format.',
        });
        setIsChecking(false);
        return;
      }

      // 2. Reserved validation
      if (RESERVED_SUBDOMAINS.has(clean)) {
        setResult({
          subdomain: clean,
          domainZone: selectedZone,
          fullDomain: `${clean}.${selectedZone}`,
          available: false,
          reason: 'reserved',
          message: `"${clean}" sistem tarafından rezerve edilmiştir.`,
        });
        setIsChecking(false);
        return;
      }

      // 3. Taken validation in real user state (No fake data!)
      const isTaken = claimedSubdomains.some(
        (s) => s.name.toLowerCase() === clean && s.domainZone === selectedZone
      );

      if (isTaken) {
        setResult({
          subdomain: clean,
          domainZone: selectedZone,
          fullDomain: `${clean}.${selectedZone}`,
          available: false,
          reason: 'taken',
          message: `"${clean}.${selectedZone}" alan adı daha önce alınmış.`,
        });
        setIsChecking(false);
        return;
      }

      // 4. Available
      setResult({
        subdomain: clean,
        domainZone: selectedZone,
        fullDomain: `${clean}.${selectedZone}`,
        available: true,
        reason: 'available',
        message: `Tebrikler! "${clean}.${selectedZone}" şu anda boşta ve kullanılabilir.`,
      });
      setIsChecking(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedZone, claimedSubdomains]);

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      
      {/* Search Card */}
      <div className="card" style={{ padding: '24px', background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
        
        {/* Domain Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '16px',
          padding: '3px',
          background: '#000000',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid #1c1c1c',
          width: 'fit-content',
        }}>
          <button
            onClick={() => setSelectedZone('xias.tr')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 600,
              color: selectedZone === 'xias.tr' ? '#000000' : '#888888',
              background: selectedZone === 'xias.tr' ? '#ffffff' : 'transparent',
              transition: 'all 0.15s ease',
            }}
          >
            .xias.tr
          </button>

          <button
            onClick={() => setSelectedZone('xias.info')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 600,
              color: selectedZone === 'xias.info' ? '#000000' : '#888888',
              background: selectedZone === 'xias.info' ? '#ffffff' : 'transparent',
              transition: 'all 0.15s ease',
            }}
          >
            .xias.info
          </button>
        </div>

        {/* Input box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#000000',
          border: '1px solid #222222',
          borderRadius: 'var(--radius-sm)',
          padding: '4px 8px 4px 14px',
          gap: '8px',
        }}>
          <Search size={16} style={{ color: '#666666', flexShrink: 0 }} />
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="subdomain yazın (ör: app, api, tolga)"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 500,
              padding: '10px 0',
            }}
            autoComplete="off"
            spellCheck={false}
          />

          <div style={{
            padding: '5px 10px',
            borderRadius: 'var(--radius-sm)',
            background: '#111111',
            border: '1px solid #222222',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '13px',
            userSelect: 'none',
          }}>
            .{selectedZone}
          </div>

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                color: '#666666',
                fontSize: '12px',
                padding: '4px 6px',
              }}
            >
              Temizle
            </button>
          )}
        </div>

        {/* Checking state */}
        {isChecking && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: '#000000',
            border: '1px solid #1a1a1a',
            color: '#888888',
            fontSize: '13px',
          }}>
            <Loader2 size={14} className="pulse-indicator" />
            <span>Kontrol ediliyor...</span>
          </div>
        )}

        {/* Result state */}
        {!isChecking && result && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px 18px',
              borderRadius: 'var(--radius-sm)',
              background: '#000000',
              border: `1px solid ${result.available ? '#ffffff' : '#333333'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
            className="animate-slide-down"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                    {result.fullDomain}
                  </span>
                  <span className={result.available ? 'badge badge-white' : 'badge badge-outline'}>
                    {result.available ? 'Müsait' : 'Dolu'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#888888', marginTop: '2px' }}>
                  {result.message}
                </div>
              </div>
            </div>

            {result.available && (
              <button
                onClick={() => onClaimSubdomain(result.subdomain, result.domainZone)}
                className="btn-primary btn-sm"
              >
                <span>Hemen Al</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
