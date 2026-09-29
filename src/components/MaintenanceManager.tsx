'use client';

import React, { useState } from 'react';
import { ClaimedSubdomain, MaintenanceConfig, MaintenanceTemplate } from '@/lib/types';
import { Wrench, Check, ExternalLink, Code2, Monitor, Save, AlertCircle, Eye } from 'lucide-react';

interface MaintenanceManagerProps {
  subdomain: ClaimedSubdomain;
  onUpdateMaintenance: (subdomainId: string, config: MaintenanceConfig) => void;
}

export default function MaintenanceManager({
  subdomain,
  onUpdateMaintenance,
}: MaintenanceManagerProps) {
  const currentConfig: MaintenanceConfig = subdomain.maintenanceConfig || {
    enabled: false,
    template: 'minimal-dark',
    title: 'Sistem Bakım Çalışması',
    message: 'Daha iyi bir hizmet sunabilmek amacıyla planlı altyapı çalışması yürütülmektedir.',
    contactEmail: `destek@${subdomain.fullDomain}`,
    estimatedMinutes: 30,
    customHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bakım Modu</title>
  <style>
    body { background: #000; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    p { color: #888; font-size: 1.1rem; }
  </style>
</head>
<body>
  <div>
    <h1>Bakımdayız</h1>
    <p>Sitemiz kısa süre içinde yenilenmiş olarak dönecektir.</p>
  </div>
</body>
</html>`,
    updatedAt: new Date().toISOString(),
  };

  const [enabled, setEnabled] = useState(currentConfig.enabled);
  const [template, setTemplate] = useState<MaintenanceTemplate>(currentConfig.template);
  const [title, setTitle] = useState(currentConfig.title || '');
  const [message, setMessage] = useState(currentConfig.message || '');
  const [contactEmail, setContactEmail] = useState(currentConfig.contactEmail || '');
  const [estimatedMinutes, setEstimatedMinutes] = useState(currentConfig.estimatedMinutes || 30);
  const [customHtml, setCustomHtml] = useState(currentConfig.customHtml || '');
  const [isSaved, setIsSaved] = useState(false);
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);

  const handleSave = () => {
    const newConfig: MaintenanceConfig = {
      enabled,
      template,
      title,
      message,
      contactEmail,
      estimatedMinutes,
      customHtml,
      updatedAt: new Date().toISOString(),
    };

    onUpdateMaintenance(subdomain.id, newConfig);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const maintenanceUrl = `/bakim?domain=${encodeURIComponent(subdomain.fullDomain)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Master Toggle */}
      <div
        style={{
          padding: '20px',
          backgroundColor: enabled ? '#120d04' : '#080808',
          border: `1px solid ${enabled ? '#d97706' : '#1f1f1f'}`,
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: enabled ? '#d97706' : '#141414',
              color: enabled ? '#ffffff' : '#666666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Wrench size={20} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                Bakım Modu (Maintenance Mode)
              </h3>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: enabled ? '#d97706' : '#1c1c1c',
                  color: '#ffffff',
                }}
              >
                {enabled ? 'BAKIM MODU AÇIK' : 'KAPALI'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#888888', marginTop: '2px' }}>
              URL: <strong style={{ color: '#ffffff' }}>{subdomain.fullDomain}/bakim</strong> &bull; Açıldığında sitenize gelenler bakım şablonunu görür.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href={maintenanceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ExternalLink size={13} />
            <span>Sayfayı Gör & Test Et</span>
          </a>

          <button
            onClick={() => {
              const next = !enabled;
              setEnabled(next);
              const newConfig: MaintenanceConfig = {
                enabled: next,
                template,
                title,
                message,
                contactEmail,
                estimatedMinutes,
                customHtml,
                updatedAt: new Date().toISOString(),
              };
              onUpdateMaintenance(subdomain.id, newConfig);
            }}
            className={enabled ? 'btn-danger btn-sm' : 'btn-primary btn-sm'}
            style={{ fontWeight: 700 }}
          >
            {enabled ? 'Bakımı Kapat' : 'Bakımı Aç'}
          </button>
        </div>
      </div>

      {/* Template Selector Cards (4 Options) */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#888888', textTransform: 'uppercase', marginBottom: '10px' }}>
          Bakım Sayfası Şablonu Seçin (4 Seçenek)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {/* Option 1 */}
          <div
            onClick={() => setTemplate('minimal-dark')}
            style={{
              padding: '16px',
              backgroundColor: '#0a0a0a',
              border: `1px solid ${template === 'minimal-dark' ? '#ffffff' : '#1f1f1f'}`,
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              1. Minimalist Siber Koyu
            </div>
            <p style={{ fontSize: '11px', color: '#777777', lineHeight: '1.4' }}>
              Geri sayım sayacı, sade siyah arka plan ve modern durum rozeti.
            </p>
          </div>

          {/* Option 2 */}
          <div
            onClick={() => setTemplate('corporate')}
            style={{
              padding: '16px',
              backgroundColor: '#0a0a0a',
              border: `1px solid ${template === 'corporate' ? '#ffffff' : '#1f1f1f'}`,
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              2. Kurumsal & Şirket
            </div>
            <p style={{ fontSize: '11px', color: '#777777', lineHeight: '1.4' }}>
              İletişim e-posta kutusu, kurumsal bildirim ve şirket logosu yeri.
            </p>
          </div>

          {/* Option 3 */}
          <div
            onClick={() => setTemplate('cloudflare-503')}
            style={{
              padding: '16px',
              backgroundColor: '#0a0a0a',
              border: `1px solid ${template === 'cloudflare-503' ? '#ffffff' : '#1f1f1f'}`,
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              3. Cloudflare 503 Style
            </div>
            <p style={{ fontSize: '11px', color: '#777777', lineHeight: '1.4' }}>
              Resmi Cloudflare 503 Service Unavailable ekranı, Ray ID ve teknik detaylar.
            </p>
          </div>

          {/* Option 4 */}
          <div
            onClick={() => setTemplate('custom-html')}
            style={{
              padding: '16px',
              backgroundColor: '#0a0a0a',
              border: `1px solid ${template === 'custom-html' ? '#ffffff' : '#1f1f1f'}`,
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              4. Özel Kendi HTML Kodun
            </div>
            <p style={{ fontSize: '11px', color: '#777777', lineHeight: '1.4' }}>
              İstediğin HTML, CSS ve JavaScript kodunu doğrudan yapıştır.
            </p>
          </div>
        </div>
      </div>

      {/* If Template 4 (Custom HTML) selected: Code Editor + Live Preview */}
      {template === 'custom-html' ? (
        <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: 'var(--radius-sm)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
              <Code2 size={16} />
              <span>Özel HTML / CSS Kodu</span>
            </div>

            <button
              onClick={() => setShowHtmlPreview(!showHtmlPreview)}
              className="btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Eye size={13} />
              <span>{showHtmlPreview ? 'Kodu Düzenle' : 'Canlı Önizleme'}</span>
            </button>
          </div>

          {showHtmlPreview ? (
            <div style={{ border: '1px solid #333333', borderRadius: '4px', overflow: 'hidden', height: '280px', background: '#000' }}>
              <iframe
                title="Preview"
                srcDoc={customHtml}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          ) : (
            <textarea
              value={customHtml}
              onChange={(e) => setCustomHtml(e.target.value)}
              rows={10}
              placeholder="<html>...</html>"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#000000',
                border: '1px solid #262626',
                borderRadius: '4px',
                color: '#ffffff',
                fontFamily: 'monospace',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          )}
        </div>
      ) : (
        /* Template Customization Fields */
        <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: 'var(--radius-sm)', padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#888888', marginBottom: '6px', textTransform: 'uppercase' }}>
                Sayfa Başlığı
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Çok Yakında Tekrar Yayındayız"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: '#000000',
                  border: '1px solid #262626',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontSize: '13px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#888888', marginBottom: '6px', textTransform: 'uppercase' }}>
                İletişim E-posta Adresi
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="destek@siteniz.com"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: '#000000',
                  border: '1px solid #262626',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#888888', marginBottom: '6px', textTransform: 'uppercase' }}>
                Açıklama Mesajı
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Ziyaretçilere gösterilecek açıklama..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: '#000000',
                  border: '1px solid #262626',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontSize: '13px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#888888', marginBottom: '6px', textTransform: 'uppercase' }}>
                Tahmini Kalan Süre (Dakika)
              </label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 0)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: '#000000',
                  border: '1px solid #262626',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={handleSave}
          className="btn-primary"
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isSaved ? <Check size={15} /> : <Save size={15} />}
          <span>{isSaved ? 'Ayarlar Kaydedildi!' : 'Bakım Ayarlarını Kaydet'}</span>
        </button>

        <a
          href={maintenanceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ExternalLink size={14} />
          <span>Canlı Bakım Sayfasını Aç</span>
        </a>
      </div>
    </div>
  );
}
