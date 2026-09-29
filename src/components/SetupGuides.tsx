'use client';

import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

interface SetupGuidesProps {
  activeDomain?: string;
}

type GuideTab = 'vercel' | 'github' | 'vps' | 'tunnel';

export default function SetupGuides({ activeDomain = 'ornek.xias.tr' }: SetupGuidesProps) {
  const [activeTab, setActiveTab] = useState<GuideTab>('vercel');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const nginxSnippet = `server {
    listen 80;
    server_name ${activeDomain};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`;

  const tunnelSnippet = `# 1. Cloudflared CLI aracını kurun
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# 2. Tüneli başlatın (Örnek: localhost:3000 portunu yönlendirir)
cloudflared tunnel --url http://localhost:3000`;

  return (
    <div id="guides-section" style={{ padding: '24px 0' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '18px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
          Entegrasyon & Dağıtım Kılavuzları
        </h4>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          <strong>{activeDomain}</strong> adresini popüler barındırma platformlarına kolayca bağlayın.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'var(--bg-input)',
        padding: '4px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '18px',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => setActiveTab('vercel')}
          style={{
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            background: activeTab === 'vercel' ? 'var(--cf-orange)' : 'transparent',
            color: activeTab === 'vercel' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          ▲ Vercel
        </button>

        <button
          onClick={() => setActiveTab('github')}
          style={{
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            background: activeTab === 'github' ? 'var(--cf-orange)' : 'transparent',
            color: activeTab === 'github' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          🐙 GitHub Pages
        </button>

        <button
          onClick={() => setActiveTab('vps')}
          style={{
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            background: activeTab === 'vps' ? 'var(--cf-orange)' : 'transparent',
            color: activeTab === 'vps' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          🖥️ VPS / Nginx
        </button>

        <button
          onClick={() => setActiveTab('tunnel')}
          style={{
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            background: activeTab === 'tunnel' ? 'var(--cf-orange)' : 'transparent',
            color: activeTab === 'tunnel' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          ☁️ Cloudflare Tunnel (Ev / Docker)
        </button>
      </div>

      {/* Vercel Guide */}
      {activeTab === 'vercel' && (
        <div className="card" style={{ padding: '20px', background: 'var(--bg-surface)' }}>
          <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '12px' }}>
            Vercel Projenize Bağlama Adımları
          </h5>
          <ol style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <li>
              Vercel Kontrol Panelinize gidin ve projenizi açın.
            </li>
            <li>
              <strong>Settings &rarr; Domains</strong> sekmesine tıklayın.
            </li>
            <li>
              Alan adı kutusuna <strong style={{ color: '#ffffff' }}>{activeDomain}</strong> yazıp <strong>Add</strong> butonuna basın.
            </li>
            <li>
              DNS Yönetim Panelimizde aşağıdaki <strong>CNAME</strong> kaydının ekli olduğundan emin olun:
              <div style={{
                marginTop: '8px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                fontFamily: 'Geist Mono, monospace',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span>CNAME &nbsp; @ &nbsp; cname.vercel-dns.com</span>
                <button
                  onClick={() => handleCopy('cname.vercel-dns.com', 'vc-cname')}
                  style={{ color: copiedCode === 'vc-cname' ? 'var(--emerald)' : 'var(--text-muted)' }}
                >
                  {copiedCode === 'vc-cname' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </li>
            <li style={{ marginTop: '8px' }}>
              Vercel alan adınızı birkaç saniye içinde doğrulayacak ve ücretsiz SSL sertifikanızı oluşturacaktır!
            </li>
          </ol>
        </div>
      )}

      {/* GitHub Pages Guide */}
      {activeTab === 'github' && (
        <div className="card" style={{ padding: '20px', background: 'var(--bg-surface)' }}>
          <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '12px' }}>
            GitHub Pages ile Custom Domain Kullanımı
          </h5>
          <ol style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <li>
              GitHub reponuzda <strong>Settings &rarr; Pages</strong> sekmesine gidin.
            </li>
            <li>
              <strong>Custom domain</strong> kısmına <strong style={{ color: '#ffffff' }}>{activeDomain}</strong> yazıp <strong>Save</strong> yapın.
            </li>
            <li>
              DNS Yönetim Panelimizde bir <strong>CNAME</strong> kaydı oluşturup içeriğine GitHub kullanıcı adresinizi yazın (ör: <code>kullaniciadi.github.io</code>).
            </li>
            <li>
              GitHub sayfasında <strong>Enforce HTTPS</strong> kutucuğunu işaretleyin.
            </li>
          </ol>
        </div>
      )}

      {/* VPS / Nginx Guide */}
      {activeTab === 'vps' && (
        <div className="card" style={{ padding: '20px', background: 'var(--bg-surface)' }}>
          <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '12px' }}>
            VPS / Linux Sunucu & Nginx Yapılandırması
          </h5>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            DNS panelinde sunucunuzun public IP adresini <strong>A Kaydı</strong> olarak ekleyin, ardından sunucunuzda aşağıdaki Nginx bloğunu kullanın:
          </div>

          <div style={{
            position: 'relative',
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-medium)',
            fontFamily: 'Geist Mono, monospace',
            fontSize: '12px',
            color: 'var(--text-primary)',
            overflowX: 'auto',
          }}>
            <button
              onClick={() => handleCopy(nginxSnippet, 'nginx')}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                color: copiedCode === 'nginx' ? 'var(--emerald)' : 'var(--text-muted)',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {copiedCode === 'nginx' ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedCode === 'nginx' ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
            </button>
            <pre style={{ margin: 0 }}>{nginxSnippet}</pre>
          </div>
        </div>
      )}

      {/* Tunnel Guide */}
      {activeTab === 'tunnel' && (
        <div className="card" style={{ padding: '20px', background: 'var(--bg-surface)' }}>
          <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '12px' }}>
            Cloudflare Tunnel (Port Açmadan / Statik IP Olmadan Yayınlama)
          </h5>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Ev bilgisayarınızdaki (localhost) veya Raspberry Pi üzerindeki bir servisi modeminizden port açmadan internete açabilirsiniz:
          </div>

          <div style={{
            position: 'relative',
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-medium)',
            fontFamily: 'Geist Mono, monospace',
            fontSize: '12px',
            color: 'var(--text-primary)',
            overflowX: 'auto',
          }}>
            <button
              onClick={() => handleCopy(tunnelSnippet, 'tunnel')}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                color: copiedCode === 'tunnel' ? 'var(--emerald)' : 'var(--text-muted)',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {copiedCode === 'tunnel' ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedCode === 'tunnel' ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
            </button>
            <pre style={{ margin: 0 }}>{tunnelSnippet}</pre>
          </div>
        </div>
      )}

    </div>
  );
}
