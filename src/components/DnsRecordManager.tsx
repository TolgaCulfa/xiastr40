'use client';

import React, { useState } from 'react';
import { ClaimedSubdomain, DnsRecord, DnsRecordType } from '@/lib/types';
import { Plus, Trash2, Cloud, Check, Copy, AlertCircle, ShieldAlert, Layers } from 'lucide-react';

interface DnsRecordManagerProps {
  subdomain: ClaimedSubdomain;
  onAddRecord: (record: Omit<DnsRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteRecord: (recordId: string) => void;
  onToggleProxy: (recordId: string) => void;
}

const MAX_RECORDS_PER_SUBDOMAIN = 6;

export default function DnsRecordManager({
  subdomain,
  onAddRecord,
  onDeleteRecord,
  onToggleProxy,
}: DnsRecordManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [recordType, setRecordType] = useState<DnsRecordType>('A');
  const [recordName, setRecordName] = useState('@');
  const [recordContent, setRecordContent] = useState('');
  const [recordTtl, setRecordTtl] = useState<number>(1);
  const [recordProxied, setRecordProxied] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isLimitReached = subdomain.dnsRecords.length >= MAX_RECORDS_PER_SUBDOMAIN;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (isLimitReached) {
      setValidationError(`Bu alt alan adı için maksimum ${MAX_RECORDS_PER_SUBDOMAIN} DNS kaydı sınırına ulaştınız.`);
      return;
    }

    const cleanContent = recordContent.trim();
    if (!cleanContent) {
      setValidationError('Hedef IP veya değer boş bırakılamaz.');
      return;
    }

    // Basic IPv4 format validation for A records
    if (recordType === 'A') {
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipv4Regex.test(cleanContent)) {
        setValidationError('Lütfen geçerli bir IPv4 adresi girin (Örnek: 185.199.108.153).');
        return;
      }
    }

    onAddRecord({
      subdomainId: subdomain.id,
      type: recordType,
      name: recordName.trim() || '@',
      content: cleanContent,
      ttl: recordTtl,
      proxied: recordType === 'TXT' || recordType === 'MX' ? false : recordProxied,
    });

    setRecordContent('');
    setRecordName('@');
    setShowAddForm(false);
  };

  return (
    <div style={{ padding: '20px 0' }}>
      
      {/* Action Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
              DNS Kayıt Yönetimi (A, AAAA, CNAME, TXT, MX)
            </h4>
            <span className={isLimitReached ? 'badge badge-neutral' : 'badge badge-cf'} style={{ fontSize: '11px' }}>
              Kayıt Limiti: {subdomain.dnsRecords.length} / {MAX_RECORDS_PER_SUBDOMAIN}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Sunucu IP adresinizi veya CNAME hedefinizi girerek Cloudflare DNS ayarlarını yönetin.
          </p>
        </div>

        <button
          onClick={() => {
            if (isLimitReached) {
              alert(`Maksimum ${MAX_RECORDS_PER_SUBDOMAIN} DNS kaydı sınırına ulaştınız.`);
              return;
            }
            setShowAddForm(!showAddForm);
          }}
          disabled={isLimitReached}
          className={isLimitReached ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}
          style={{ opacity: isLimitReached ? 0.6 : 1 }}
        >
          <Plus size={14} />
          <span>Yeni DNS Kaydı Ekle</span>
        </button>
      </div>

      {/* Validation Error banner */}
      {validationError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--rose-subtle)',
          border: '1px solid var(--rose-border)',
          color: 'var(--rose)',
          fontSize: '12px',
          marginBottom: '14px',
        }}>
          <AlertCircle size={15} />
          <span>{validationError}</span>
        </div>
      )}

      {/* Add Record Form Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="animate-slide-down card"
          style={{
            padding: '18px',
            marginBottom: '20px',
            background: 'var(--bg-input)',
            border: '1px solid var(--cf-orange-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
              Yeni DNS Kaydı Ekle ({subdomain.dnsRecords.length + 1} / {MAX_RECORDS_PER_SUBDOMAIN})
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Subdomain: {subdomain.fullDomain}
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginBottom: '14px',
          }}>
            {/* Record Type */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Kayıt Türü:
              </label>
              <select
                value={recordType}
                onChange={(e) => {
                  const t = e.target.value as DnsRecordType;
                  setRecordType(t);
                  setRecordContent('');
                }}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontSize: '13px',
                }}
              >
                <option value="A">A (IPv4 Adresi)</option>
                <option value="AAAA">AAAA (IPv6 Adresi)</option>
                <option value="CNAME">CNAME (Takma Alan Adı)</option>
                <option value="TXT">TXT (Metin / Doğrulama)</option>
                <option value="MX">MX (E-posta Sunucusu)</option>
              </select>
            </div>

            {/* Name / Subprefix */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Host / Ön-ek:
              </label>
              <input
                type="text"
                value={recordName}
                onChange={(e) => setRecordName(e.target.value)}
                placeholder="@ (kök) veya api"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontSize: '13px',
                }}
              />
            </div>

            {/* Target / Content with Dynamic Placeholder */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                {recordType === 'A' ? 'Hedef IPv4 Sunucu IP Adresi:' : recordType === 'AAAA' ? 'Hedef IPv6 Adresi:' : recordType === 'CNAME' ? 'Hedef CNAME Alan Adı:' : 'Kayıt Değeri / İçerik:'}
              </label>
              <input
                type="text"
                required
                value={recordContent}
                onChange={(e) => setRecordContent(e.target.value)}
                placeholder={
                  recordType === 'A'
                    ? 'Ör: 185.199.108.153'
                    : recordType === 'AAAA'
                    ? 'Ör: 2a00:1450:4001:82f::200e'
                    : recordType === 'CNAME'
                    ? 'Ör: cname.vercel-dns.com veya github.io'
                    : 'İçerik metni'
                }
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontSize: '13px',
                }}
              />
            </div>

            {/* TTL */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                TTL:
              </label>
              <select
                value={recordTtl}
                onChange={(e) => setRecordTtl(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontSize: '13px',
                }}
              >
                <option value={1}>Otomatik</option>
                <option value={60}>1 Dakika (Düşük Gecikme)</option>
                <option value={300}>5 Dakika</option>
                <option value={1800}>30 Dakika</option>
                <option value={3600}>1 Saat</option>
              </select>
            </div>

            {/* Proxy Toggle */}
            {recordType !== 'TXT' && recordType !== 'MX' && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Cloudflare Proxy:
                </label>
                <button
                  type="button"
                  onClick={() => setRecordProxied(!recordProxied)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: recordProxied ? 'var(--cf-orange-subtle)' : 'var(--bg-surface)',
                    border: `1px solid ${recordProxied ? 'var(--cf-orange-border)' : 'var(--border-subtle)'}`,
                    color: recordProxied ? 'var(--cf-orange)' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 600,
                    width: '100%',
                    justifyContent: 'center',
                  }}
                >
                  <Cloud size={14} />
                  <span>{recordProxied ? 'Proxied (Turuncu)' : 'DNS Only (Gri)'}</span>
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn-secondary btn-sm"
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn-primary btn-sm"
            >
              Kaydı Kaydet
            </button>
          </div>
        </form>
      )}

      {/* Table of Records */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
      }}>
        {subdomain.dnsRecords.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={24} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
            <div style={{ fontSize: '14px', fontWeight: 500 }}>Tanımlı DNS kaydı bulunmuyor.</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>Maksimum 6 adet DNS kaydı (A, AAAA, CNAME vb.) oluşturabilirsiniz.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Tür</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Ad (Host)</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Değer / IP Hedefi</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>TTL</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Proxy Durumu</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {subdomain.dnsRecords.map((rec) => {
                const isCopied = copiedId === rec.id;
                return (
                  <tr
                    key={rec.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Record Type Badge */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: rec.type === 'A' ? 'var(--blue-subtle)' : rec.type === 'CNAME' ? 'var(--emerald-subtle)' : 'var(--bg-surface-elevated)',
                        color: rec.type === 'A' ? 'var(--blue)' : rec.type === 'CNAME' ? 'var(--emerald)' : 'var(--text-secondary)',
                        border: `1px solid ${rec.type === 'A' ? 'var(--blue-border)' : rec.type === 'CNAME' ? 'var(--emerald-border)' : 'var(--border-subtle)'}`,
                      }}>
                        {rec.type}
                      </span>
                    </td>

                    {/* Name */}
                    <td style={{ padding: '12px 14px', fontWeight: 500, color: '#ffffff' }}>
                      {rec.name === '@' ? subdomain.fullDomain : `${rec.name}.${subdomain.fullDomain}`}
                    </td>

                    {/* Content */}
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontFamily: 'Geist Mono, monospace', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{rec.content}</span>
                        <button
                          onClick={() => handleCopy(rec.content, rec.id)}
                          style={{
                            color: isCopied ? 'var(--emerald)' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Panoya Kopyala"
                        >
                          {isCopied ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>

                    {/* TTL */}
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      {rec.ttl === 1 ? 'Otomatik' : `${rec.ttl} sn`}
                    </td>

                    {/* Cloudflare Proxy Toggle */}
                    <td style={{ padding: '12px 14px' }}>
                      {rec.type === 'TXT' || rec.type === 'MX' ? (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DNS Only</span>
                      ) : (
                        <button
                          onClick={() => onToggleProxy(rec.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '11px',
                            fontWeight: 500,
                            background: rec.proxied ? 'var(--cf-orange-subtle)' : 'var(--bg-surface-elevated)',
                            color: rec.proxied ? 'var(--cf-orange)' : 'var(--text-muted)',
                            border: `1px solid ${rec.proxied ? 'var(--cf-orange-border)' : 'var(--border-subtle)'}`,
                            transition: 'all 0.15s ease',
                          }}
                          title="Tıkla: Cloudflare Proxy durumunu değiştir"
                        >
                          <Cloud size={12} />
                          <span>{rec.proxied ? 'Proxied' : 'DNS Only'}</span>
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => onDeleteRecord(rec.id)}
                        style={{
                          color: 'var(--rose)',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                        }}
                        title="Kaydı Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
