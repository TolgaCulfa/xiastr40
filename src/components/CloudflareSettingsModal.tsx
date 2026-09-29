'use client';

import React, { useState } from 'react';
import { CloudflareConfig } from '@/lib/types';
import { X, Cloud, Key, Check, AlertCircle, RefreshCw, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface CloudflareSettingsModalProps {
  config: CloudflareConfig;
  onSave: (config: CloudflareConfig) => void;
  onClose: () => void;
}

export default function CloudflareSettingsModal({
  config,
  onSave,
  onClose,
}: CloudflareSettingsModalProps) {
  const [apiToken, setApiToken] = useState(config.apiToken || '');
  const [zoneIdXiasTr, setZoneIdXiasTr] = useState(config.zoneIdXiasTr || '');
  const [zoneIdXiasInfo, setZoneIdXiasInfo] = useState(config.zoneIdXiasInfo || '');
  const [autoProxy, setAutoProxy] = useState(config.autoProxyNewRecords ?? true);

  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    if (!apiToken.trim()) {
      setTestResult({
        success: false,
        message: 'Lütfen test etmeden önce bir Cloudflare API Token girin.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/cloudflare/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiToken: apiToken.trim() }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Bağlantı hatası.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      apiToken: apiToken.trim(),
      zoneIdXiasTr: zoneIdXiasTr.trim(),
      zoneIdXiasInfo: zoneIdXiasInfo.trim(),
      autoProxyNewRecords: autoProxy,
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px',
    }}>
      <div
        className="card animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-modal)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--cf-orange-subtle)',
              border: '1px solid var(--cf-orange-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--cf-orange)',
            }}>
              <Cloud size={18} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                Cloudflare API Yapılandırması
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                xias.tr ve xias.info alan adları için DNS senkronizasyonu
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          
          {/* Cloudflare API Token */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Cloudflare API Token:
              </label>
              <a
                href="https://dash.cloudflare.com/profile/api-tokens"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '11px', color: 'var(--cf-orange)', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <span>Token Al &rarr;</span>
              </a>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showToken ? 'text' : 'password'}
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Ör: V1w7fJ_m8N_xxxxxxxxxxxxxx"
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontFamily: 'Geist Mono, monospace',
                }}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              >
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Gerekli Yetki: <code>Zone - DNS - Edit</code>.
            </div>
          </div>

          {/* Zone ID xias.tr */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Zone ID (.xias.tr):
            </label>
            <input
              type="text"
              value={zoneIdXiasTr}
              onChange={(e) => setZoneIdXiasTr(e.target.value)}
              placeholder="32 karakterli Zone ID (Cloudflare Dashboard Overview sekmesinde)"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                fontSize: '13px',
                fontFamily: 'Geist Mono, monospace',
              }}
            />
          </div>

          {/* Zone ID xias.info */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Zone ID (.xias.info):
            </label>
            <input
              type="text"
              value={zoneIdXiasInfo}
              onChange={(e) => setZoneIdXiasInfo(e.target.value)}
              placeholder="32 karakterli Zone ID"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                fontSize: '13px',
                fontFamily: 'Geist Mono, monospace',
              }}
            />
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className="animate-slide-down"
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: testResult.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                border: `1px solid ${testResult.success ? 'var(--emerald-border)' : 'var(--rose-border)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: testResult.success ? 'var(--emerald)' : 'var(--rose)',
                marginBottom: '18px',
              }}
            >
              {testResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Auto proxy toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '22px',
          }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Yeni kayıtlarda otomatik Turuncu Bulut (Proxy) aktif olsun
            </div>
            <input
              type="checkbox"
              checked={autoProxy}
              onChange={(e) => setAutoProxy(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--cf-orange)' }}
            />
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="btn-secondary btn-sm"
            >
              <RefreshCw size={13} className={testing ? 'pulse-indicator' : ''} />
              <span>{testing ? 'Test ediliyor...' : 'Bağlantıyı Test Et'}</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary btn-sm"
              >
                Kapat
              </button>

              <button
                type="submit"
                className="btn-primary btn-sm"
              >
                Ayarları Kaydet
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
