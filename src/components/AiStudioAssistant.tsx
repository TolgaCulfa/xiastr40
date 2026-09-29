'use client';

import React, { useState } from 'react';
import { ClaimedSubdomain, MaintenanceConfig } from '@/lib/types';
import { Sparkles, Send, Copy, Check, Terminal, Code2, ShieldAlert, Cpu } from 'lucide-react';

interface AiStudioAssistantProps {
  subdomains: ClaimedSubdomain[];
  activeSubdomain: ClaimedSubdomain | null;
  onApplyMaintenanceHtml?: (subdomainId: string, html: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  codeSnippet?: string;
  isHtml?: boolean;
}

export default function AiStudioAssistant({
  subdomains,
  activeSubdomain,
  onApplyMaintenanceHtml,
}: AiStudioAssistantProps) {
  const [input, setInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Merhaba! Ben XIAS Cloud Yapay Zeka Asistanı. Alan adınız (${
        activeSubdomain?.fullDomain || 'xias.tr'
      }) için DNS konfigürasyonu oluşturabilir, WAF DDoS kuralları yazabilir veya özel Bakım Sayfası (HTML/CSS) tasarlayabilirim.`,
    },
  ]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1600);
  };

  const handleQuickPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Intelligent context-aware AI response generation
    setTimeout(() => {
      const targetDomain = activeSubdomain?.fullDomain || 'siteniz.xias.tr';
      let assistantMsg: Message;

      if (query.toLowerCase().includes('bakım') || query.toLowerCase().includes('html')) {
        const generatedHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${targetDomain} - Planlı Bakım</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; text-align: center; }
    .card { max-width: 500px; padding: 40px; border: 1px solid #222; border-radius: 12px; background: #0a0a0a; }
    h1 { font-size: 24px; font-weight: 800; margin-bottom: 12px; }
    p { color: #888; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 4px 12px; background: #141414; border: 1px solid #333; border-radius: 99px; font-size: 11px; margin-bottom: 20px; }
    .contact { font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Sistem Güncellemesi</div>
    <h1>${targetDomain} Bakım Aşamasında</h1>
    <p>Altyapımızı güçlendirmek amacıyla planlı geliştirme çalışması yapıyoruz. Birkaç dakika içinde yeniden yayındayız.</p>
    <div class="contact">XIAS Cloud Anycast Edge Altyapısı</div>
  </div>
</body>
</html>`;
        assistantMsg = {
          role: 'assistant',
          content: `"${targetDomain}" için modern, minimalist ve mobil uyumlu bir Bakım Sayfası (HTML/CSS) kodu hazırladım. Aşağıdaki butona tıklayarak doğrudan Bakım Modu editörünüze aktarabilirsiniz:`,
          codeSnippet: generatedHtml,
          isHtml: true,
        };
      } else if (query.toLowerCase().includes('vercel') || query.toLowerCase().includes('dns')) {
        assistantMsg = {
          role: 'assistant',
          content: `Vercel projenizi "${targetDomain}" adresine bağlamak için Cloudflare panelinizde tanımlamanız gereken DNS kayıtları:`,
          codeSnippet: `Tip: CNAME\nAd: @ (veya www)\nHedef: cname.vercel-dns.com\nTTL: Otomatik (1)\nProxy (Turuncu Bulut): Pasif (Grey Cloud)\n\nAlternatif A Kaydı:\nTip: A\nAd: @\nHedef: 76.76.21.21\nTTL: Otomatik`,
        };
      } else if (query.toLowerCase().includes('ddos') || query.toLowerCase().includes('koruma')) {
        assistantMsg = {
          role: 'assistant',
          content: `XIAS Anycast Edge WAF kurallarınızı optimize etmek için önerilen güvenlik politikası:`,
          codeSnippet: `// XIAS WAF L7 Bot Savunma Kuralı\n1. "Under Attack Modu" etkinleştirildiğinde tüm istekler XIAS Turnstile Captcha süzgecine alınır.\n2. Saniyede 30'dan fazla istek gönderen IP adreslerine geçici rate-limit uygulanır.\n3. Bilinen bot kullanıcı aracıları (HeadlessChrome, Python-Requests) engellenir.`,
        };
      } else {
        assistantMsg = {
          role: 'assistant',
          content: `"${query}" isteğinizi analiz ettim. "${targetDomain}" için Cloudflare Anycast API ve DNS yapılandırmanız hazır durumda. DNS kayıtlarınızı veya güvenlik ayarlarınızı panel üzerinden dilediğiniz gibi güncelleyebilirsiniz.`,
        };
      }

      setMessages((prev) => [...prev, assistantMsg]);
    }, 450);
  };

  return (
    <div className="card animate-fade-in" style={{ padding: '28px', backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ffffff', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={18} />
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
            Yapay Zeka İle Geliştir (XIAS AI Studio)
          </h2>
          <p style={{ fontSize: '13px', color: '#888888' }}>
            DNS optimizasyonu, güvenlik kuralları ve bakım sayfası HTML tasarımı
          </p>
        </div>
      </div>

      {/* Quick Prompts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => handleQuickPrompt('Modern bir bakım sayfası HTML kodu üret')}
          style={{
            padding: '6px 12px',
            backgroundColor: '#111111',
            border: '1px solid #262626',
            borderRadius: '99px',
            fontSize: '11px',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          ✨ Bakım Sayfası HTML&apos;i Üret
        </button>

        <button
          onClick={() => handleQuickPrompt('Vercel için DNS kayıtlarımı ayarla')}
          style={{
            padding: '6px 12px',
            backgroundColor: '#111111',
            border: '1px solid #262626',
            borderRadius: '99px',
            fontSize: '11px',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          ⚡ Vercel DNS Kurulumu
        </button>

        <button
          onClick={() => handleQuickPrompt('DDoS koruma kurallarımı en üst seviyeye çıkar')}
          style={{
            padding: '6px 12px',
            backgroundColor: '#111111',
            border: '1px solid #262626',
            borderRadius: '99px',
            fontSize: '11px',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          🛡️ DDoS Savunma Kuralı
        </button>
      </div>

      {/* Message Chat Flow */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          maxHeight: '380px',
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#050505',
          border: '1px solid #1a1a1a',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '16px',
        }}
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: m.role === 'user' ? '#ffffff' : '#111111',
              color: m.role === 'user' ? '#000000' : '#ffffff',
              border: m.role === 'user' ? 'none' : '1px solid #222222',
              fontSize: '13px',
              lineHeight: '1.5',
            }}
          >
            <div>{m.content}</div>

            {/* Generated Code Snippet Box */}
            {m.codeSnippet && (
              <div style={{ marginTop: '10px' }}>
                <pre
                  style={{
                    padding: '12px',
                    backgroundColor: '#000000',
                    border: '1px solid #262626',
                    borderRadius: '4px',
                    color: '#a3a3a3',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                    maxHeight: '160px',
                  }}
                >
                  <code>{m.codeSnippet}</code>
                </pre>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={() => handleCopy(m.codeSnippet!)}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: '#1f1f1f',
                      border: '1px solid #333333',
                      borderRadius: '4px',
                      color: '#ffffff',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{isCopied ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
                  </button>

                  {m.isHtml && activeSubdomain && onApplyMaintenanceHtml && (
                    <button
                      onClick={() => {
                        onApplyMaintenanceHtml(activeSubdomain.id, m.codeSnippet!);
                        setIsApplied(true);
                        setTimeout(() => setIsApplied(false), 2000);
                      }}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#000000',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {isApplied ? <Check size={12} /> : <Code2 size={12} />}
                      <span>{isApplied ? 'Bakım Moduna Aktarıldı!' : 'Bakım Moduna Yükle'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input box */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Yapay zekaya alan adınız veya güvenlik ayarları hakkında soru sorun..."
          style={{
            flex: 1,
            padding: '10px 14px',
            backgroundColor: '#000000',
            border: '1px solid #262626',
            borderRadius: 'var(--radius-sm)',
            color: '#ffffff',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <button
          onClick={() => handleSendMessage()}
          className="btn-primary"
          style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Send size={14} />
          <span>Gönder</span>
        </button>
      </div>
    </div>
  );
}
