'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

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
    setTimeout(() => setCopiedCode(null), 1600);
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

  const tunnelSnippet = `# 1. Cloudflared kurun
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# 2. Tüneli başlatın
cloudflared tunnel --url http://localhost:3000`;

  return (
    <div style={{ padding: '20px 0' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
          Entegrasyon & Dağıtım Kılavuzları
        </h4>
        <p style={{ fontSize: '12px', color: '#888888' }}>
          <strong>{activeDomain}</strong> adresini popüler platformlara bağlama adımları.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: '#000000',
        padding: '3px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid #1c1c1c',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => setActiveTab('vercel')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            background: activeTab === 'vercel' ? '#ffffff' : 'transparent',
            color: activeTab === 'vercel' ? '#000000' : '#888888',
          }}
        >
          ▲ Vercel
        </button>

        <button
          onClick={() => setActiveTab('github')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            background: activeTab === 'github' ? '#ffffff' : 'transparent',
            color: activeTab === 'github' ? '#000000' : '#888888',
          }}
        >
          GitHub Pages
        </button>

        <button
          onClick={() => setActiveTab('vps')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            background: activeTab === 'vps' ? '#ffffff' : 'transparent',
            color: activeTab === 'vps' ? '#000000' : '#888888',
          }}
        >
          VPS / Nginx
        </button>

        <button
          onClick={() => setActiveTab('tunnel')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            background: activeTab === 'tunnel' ? '#ffffff' : 'transparent',
            color: activeTab === 'tunnel' ? '#000000' : '#888888',
          }}
        >
          Cloudflare Tunnel
        </button>
      </div>

      {/* Vercel */}
      {activeTab === 'vercel' && (
        <div style={{ background: '#000000', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #1a1a1a' }}>
          <ol style={{ paddingLeft: '18px', fontSize: '12px', color: '#a3a3a3', lineHeight: '1.8' }}>
            <li>Vercel projenizde <strong>Settings &rarr; Domains</strong> sekmesine gidin.</li>
            <li><strong style={{ color: '#ffffff' }}>{activeDomain}</strong> adresini yazıp ekleyin.</li>
            <li>DNS panelinde CNAME kaydı olarak <code style={{ color: '#ffffff' }}>cname.vercel-dns.com</code> ekleyin.</li>
            <li>SSL sertifikanız otomatik oluşturulacaktır.</li>
          </ol>
        </div>
      )}

      {/* GitHub */}
      {activeTab === 'github' && (
        <div style={{ background: '#000000', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #1a1a1a' }}>
          <ol style={{ paddingLeft: '18px', fontSize: '12px', color: '#a3a3a3', lineHeight: '1.8' }}>
            <li>GitHub reponuzda <strong>Settings &rarr; Pages</strong> sekmesine gidin.</li>
            <li>Custom domain kutusuna <strong style={{ color: '#ffffff' }}>{activeDomain}</strong> yazıp kaydedin.</li>
            <li>DNS panelinde CNAME kaydı olarak <code style={{ color: '#ffffff' }}>kullaniciadi.github.io</code> ekleyin.</li>
          </ol>
        </div>
      )}

      {/* VPS */}
      {activeTab === 'vps' && (
        <div style={{ background: '#000000', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #1a1a1a' }}>
          <div style={{ fontSize: '12px', color: '#888888', marginBottom: '8px' }}>
            A kaydı olarak sunucunuzun IP adresini ekleyin, ardından Nginx yapılandırması:
          </div>
          <div style={{ position: 'relative', padding: '12px', background: '#050505', border: '1px solid #1c1c1c', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: '11px', color: '#ffffff' }}>
            <button
              onClick={() => handleCopy(nginxSnippet, 'nginx')}
              style={{ position: 'absolute', top: '8px', right: '8px', color: '#888888', fontSize: '11px' }}
            >
              {copiedCode === 'nginx' ? 'Kopyalandı' : 'Kopyala'}
            </button>
            <pre style={{ margin: 0 }}>{nginxSnippet}</pre>
          </div>
        </div>
      )}

      {/* Tunnel */}
      {activeTab === 'tunnel' && (
        <div style={{ background: '#000000', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #1a1a1a' }}>
          <div style={{ position: 'relative', padding: '12px', background: '#050505', border: '1px solid #1c1c1c', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: '11px', color: '#ffffff' }}>
            <button
              onClick={() => handleCopy(tunnelSnippet, 'tunnel')}
              style={{ position: 'absolute', top: '8px', right: '8px', color: '#888888', fontSize: '11px' }}
            >
              {copiedCode === 'tunnel' ? 'Kopyalandı' : 'Kopyala'}
            </button>
            <pre style={{ margin: 0 }}>{tunnelSnippet}</pre>
          </div>
        </div>
      )}

    </div>
  );
}
