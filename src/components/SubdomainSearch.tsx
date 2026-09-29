'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { DomainZone, ClaimedSubdomain, AvailabilityResult } from '@/lib/types';
import { sanitizeSubdomainName, validateSubdomainFormat, RESERVED_SUBDOMAINS } from '@/lib/storage';
import { Search, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Sparkles, Globe, Loader2 } from 'lucide-react';

interface SubdomainSearchProps {
  claimedSubdomains: ClaimedSubdomain[];
  onClaimSubdomain: (subdomain: string, zone: DomainZone) => void;
}

const POPULAR_SUGGESTIONS = ['portfolio', 'dev', 'app', 'studio', 'cloud', 'hub', 'link', 'me'];

export default function SubdomainSearch({ claimedSubdomains, onClaimSubdomain }: SubdomainSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<DomainZone>('xias.tr');
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Instant check logic with debounce
  useEffect(() => {
    const clean = sanitizeSubdomainName(searchTerm);
    if (!clean) {
      setResult(null);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    const timer = setTimeout(() => {
      // 1. Format check
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

      // 2. Reserved check
      if (RESERVED_SUBDOMAINS.has(clean)) {
        setResult({
          subdomain: clean,
          domainZone: selectedZone,
          fullDomain: `${clean}.${selectedZone}`,
          available: false,
          reason: 'reserved',
          message: `"${clean}" sistem tarafından ayrılmıştır ve kullanıma açılamaz.`,
        });
        setIsChecking(false);
        return;
      }

      // 3. Claimed in local state check
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
          message: `"${clean}.${selectedZone}" alan adı daha önce kaydedilmiş.`,
        });
        setIsChecking(false);
        return;
      }

      // 4. Available!
      setResult({
        subdomain: clean,
        domainZone: selectedZone,
        fullDomain: `${clean}.${selectedZone}`,
        available: true,
        reason: 'available',
        message: `Harika! "${clean}.${selectedZone}" şu anda boşta ve tamamen ücretsiz.`,
      });
      setIsChecking(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedZone, claimedSubdomains]);

  const handleSelectSuggestion = (word: string) => {
    setSearchTerm(word);
  };

  const handleSwitchZone = (zone: DomainZone) => {
    setSelectedZone(zone);
  };

  const alternativeZone: DomainZone = selectedZone === 'xias.tr' ? 'xias.info' : 'xias.tr';
  const isAltAvailable = result && !result.available && result.reason === 'taken' &&
    !claimedSubdomains.some(
      (s) => s.name.toLowerCase() === sanitizeSubdomainName(searchTerm) && s.domainZone === alternativeZone
    );

  return (
    <section id="search-section" style={{ padding: '48px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Globe size={16} style={{ color: 'var(--cf-orange)' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Subdomain Sorgulama & Tahsis
            </span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
            İstediğiniz Alan Adını Kontrol Edin
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Kullanmak istediğiniz adı yazın, Cloudflare DNS sistemimizde anında ücretsiz etkinleştirin.
          </p>
        </div>

        {/* Search Card */}
        <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
          {/* Domain Zone Switcher Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '18px',
            padding: '4px',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            width: 'fit-content',
          }}>
            <button
              onClick={() => handleSwitchZone('xias.tr')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 600,
                color: selectedZone === 'xias.tr' ? '#ffffff' : 'var(--text-muted)',
                background: selectedZone === 'xias.tr' ? 'var(--cf-orange)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <span>.xias.tr</span>
              <span style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                background: selectedZone === 'xias.tr' ? 'rgba(0,0,0,0.25)' : 'var(--bg-surface-elevated)',
                color: selectedZone === 'xias.tr' ? '#ffffff' : 'var(--text-secondary)',
              }}>
                TR Kök Domain
              </span>
            </button>

            <button
              onClick={() => handleSwitchZone('xias.info')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 600,
                color: selectedZone === 'xias.info' ? '#ffffff' : 'var(--text-muted)',
                background: selectedZone === 'xias.info' ? 'var(--cf-orange)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <span>.xias.info</span>
              <span style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                background: selectedZone === 'xias.info' ? 'rgba(0,0,0,0.25)' : 'var(--bg-surface-elevated)',
                color: selectedZone === 'xias.info' ? '#ffffff' : 'var(--text-secondary)',
              }}>
                Global INFO
              </span>
            </button>
          </div>

          {/* Input Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '4px 8px 4px 16px',
            gap: '8px',
            transition: 'border-color 0.15s ease',
          }}>
            <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="örnek: dev, app, portfolyo, tolga"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 500,
                padding: '12px 0',
              }}
              autoComplete="off"
              spellCheck={false}
            />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--cf-orange)',
              fontWeight: 600,
              fontSize: '14px',
              userSelect: 'none',
              flexShrink: 0,
            }}>
              .{selectedZone}
            </div>

            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Temizle
              </button>
            )}
          </div>

          {/* Quick Suggestions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} style={{ color: 'var(--cf-orange)' }} />
              Örnekler:
            </span>
            {POPULAR_SUGGESTIONS.map((word) => (
              <button
                key={word}
                onClick={() => handleSelectSuggestion(word)}
                style={{
                  fontSize: '12px',
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {word}
              </button>
            ))}
          </div>

          {/* Live Result State */}
          {isChecking && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '20px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '14px',
            }} className="animate-fade-in">
              <Loader2 size={16} className="pulse-indicator" />
              <span>Domain uygunluğu kontrol ediliyor...</span>
            </div>
          )}

          {!isChecking && result && (
            <div
              style={{
                marginTop: '20px',
                padding: '18px 20px',
                borderRadius: 'var(--radius-md)',
                background: result.available
                  ? 'rgba(16, 185, 129, 0.06)'
                  : result.reason === 'taken'
                  ? 'rgba(244, 63, 94, 0.06)'
                  : 'rgba(245, 158, 11, 0.06)',
                border: `1px solid ${
                  result.available
                    ? 'var(--emerald-border)'
                    : result.reason === 'taken'
                    ? 'var(--rose-border)'
                    : 'var(--amber-border)'
                }`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
              }}
              className="animate-slide-down"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  color: result.available
                    ? 'var(--emerald)'
                    : result.reason === 'taken'
                    ? 'var(--rose)'
                    : 'var(--amber)',
                }}>
                  {result.available ? (
                    <CheckCircle2 size={24} />
                  ) : result.reason === 'taken' ? (
                    <XCircle size={24} />
                  ) : (
                    <AlertTriangle size={24} />
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
                      {result.fullDomain}
                    </span>
                    <span className={result.available ? 'badge badge-success' : 'badge badge-neutral'}>
                      {result.available ? 'Müsait' : result.reason === 'taken' ? 'Dolu' : 'Ayrılmış'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    {result.message}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {result.available && (
                  <button
                    onClick={() => onClaimSubdomain(result.subdomain, result.domainZone)}
                    className="btn-primary"
                    style={{ padding: '9px 18px' }}
                  >
                    <span>Hemen Ücretsiz Al</span>
                    <ArrowRight size={15} />
                  </button>
                )}

                {isAltAvailable && (
                  <button
                    onClick={() => handleSwitchZone(alternativeZone)}
                    className="btn-secondary btn-sm"
                    style={{ borderColor: 'var(--cf-orange-border)', color: 'var(--cf-orange)' }}
                  >
                    <span>.{alternativeZone} olarak dene</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
