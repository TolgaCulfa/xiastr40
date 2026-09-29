'use client';

import React, { useState, useEffect } from 'react';
import { ClaimedSubdomain } from '@/lib/types';
import { BarChart3, TrendingUp, ShieldAlert, Users, Activity, Globe, ArrowUpRight, RefreshCw } from 'lucide-react';

interface AnalyticsWidgetProps {
  subdomains: ClaimedSubdomain[];
  activeSubdomain?: ClaimedSubdomain | null;
}

interface AnalyticsData {
  totalRequests: number;
  uniqueVisitors: number;
  threatsMitigated: number;
  bandwidth: string;
  timeline: { label: string; requests: number }[];
}

export default function AnalyticsWidget({
  subdomains,
  activeSubdomain,
}: AnalyticsWidgetProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; label: string; req: number } | null>(null);
  const [data, setData] = useState<AnalyticsData>({
    totalRequests: 0,
    uniqueVisitors: 0,
    threatsMitigated: 0,
    bandwidth: '0 MB',
    timeline: [
      { label: '00:00', requests: 0 },
      { label: '02:00', requests: 0 },
      { label: '04:00', requests: 0 },
      { label: '06:00', requests: 0 },
      { label: '08:00', requests: 0 },
      { label: '10:00', requests: 0 },
      { label: '12:00', requests: 0 },
      { label: '14:00', requests: 0 },
      { label: '16:00', requests: 0 },
      { label: '18:00', requests: 0 },
      { label: '20:00', requests: 0 },
      { label: '22:00', requests: 0 }
    ],
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const domainParam = activeSubdomain ? encodeURIComponent(activeSubdomain.fullDomain) : '';
      const res = await fetch(`/api/analytics?domain=${domainParam}&timeRange=${timeRange}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to load real analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 15000); // 15s auto-refresh
    return () => clearInterval(interval);
  }, [timeRange, activeSubdomain?.fullDomain]);

  // SVG Chart Calculation
  const svgWidth = 600;
  const svgHeight = 160;
  const dataPoints = data.timeline.map(t => t.requests);
  const maxVal = Math.max(...dataPoints, 1);

  const pointsString = data.timeline
    .map((item, idx) => {
      const x = (idx / Math.max(1, data.timeline.length - 1)) * (svgWidth - 40) + 20;
      const y = svgHeight - 25 - (item.requests / maxVal) * (svgHeight - 50);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header with Title & Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
              Site Ziyaretçileri & Gerçek Trafik Analitiği
            </h2>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: '#1c1c1c', color: '#22c55e', border: '1px solid #333' }}>
              ● Canlı PostgreSQL & PowerDNS
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#888888', marginTop: '2px' }}>
            {activeSubdomain ? `"${activeSubdomain.fullDomain}" için gerçek zamanlı veritabanı kayıtları` : 'Tüm domainleriniz için gerçek zamanlı ziyaretçi ve tehdit akışı'}
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => fetchAnalytics()}
            title="Yenile"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: '#0a0a0a',
              border: '1px solid #222',
              color: '#888',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Yenile</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#0a0a0a', border: '1px solid #222222', borderRadius: 'var(--radius-sm)', padding: '4px' }}>
            <button
              onClick={() => setTimeRange('24h')}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: timeRange === '24h' ? '#ffffff' : 'transparent',
                color: timeRange === '24h' ? '#000000' : '#888888',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Son 24 Saat
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: timeRange === '7d' ? '#ffffff' : 'transparent',
                color: timeRange === '7d' ? '#000000' : '#888888',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Son 7 Gün
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: timeRange === '30d' ? '#ffffff' : 'transparent',
                color: timeRange === '30d' ? '#000000' : '#888888',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Son 30 Gün
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards - PURE REAL DATABASE VALUES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {/* Card 1 */}
        <div className="card" style={{ padding: '18px', backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#888888', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
            <span>Toplam İstek (Requests)</span>
            <Activity size={15} style={{ color: '#ffffff' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            {data.totalRequests.toLocaleString('tr-TR')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: data.totalRequests > 0 ? '#22c55e' : '#666666', marginTop: '4px' }}>
            {data.totalRequests > 0 ? (
              <>
                <ArrowUpRight size={13} />
                <span>Gerçek zamanlı trafik aktif</span>
              </>
            ) : (
              <span>Henüz gelen istek yok</span>
            )}
          </div>
        </div>

        {/* Card 2 */}
        <div className="card" style={{ padding: '18px', backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#888888', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
            <span>Tekil Ziyaretçiler</span>
            <Users size={15} style={{ color: '#ffffff' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            {data.uniqueVisitors.toLocaleString('tr-TR')}
          </div>
          <div style={{ fontSize: '11px', color: '#777777', marginTop: '4px' }}>
            {data.uniqueVisitors > 0 ? 'Farklı IP adresleri süzüldü' : 'Tekil ziyaretçi bekleniyor'}
          </div>
        </div>

        {/* Card 3 */}
        <div className="card" style={{ padding: '18px', backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#888888', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
            <span>Engellenen DDoS & Botlar</span>
            <ShieldAlert size={15} style={{ color: '#ffffff' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            {data.threatsMitigated.toLocaleString('tr-TR')}
          </div>
          <div style={{ fontSize: '11px', color: '#888888', marginTop: '4px' }}>
            {data.threatsMitigated > 0 ? 'Turnstile WAF ile durduruldu' : 'Tehdit algılanmadı (Güvende)'}
          </div>
        </div>

        {/* Card 4 */}
        <div className="card" style={{ padding: '18px', backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#888888', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
            <span>Bant Genişliği & Veri</span>
            <Globe size={15} style={{ color: '#ffffff' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            {data.bandwidth}
          </div>
          <div style={{ fontSize: '11px', color: '#777777', marginTop: '4px' }}>
            Sunucu üzerinden aktarılan gerçek veri
          </div>
        </div>
      </div>

      {/* Traffic Line Graph */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
            İstek Grafiği (Zaman İçindeki Trafik)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: '#888888' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
              <span>Gerçek İstekler</span>
            </div>
          </div>
        </div>

        {/* Responsive SVG Chart */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: '180px' }}>
            {/* Grid lines */}
            <line x1="20" y1="20" x2={svgWidth - 20} y2="20" stroke="#1c1c1c" strokeDasharray="4 4" />
            <line x1="20" y1="65" x2={svgWidth - 20} y2="65" stroke="#1c1c1c" strokeDasharray="4 4" />
            <line x1="20" y1="110" x2={svgWidth - 20} y2="110" stroke="#1c1c1c" strokeDasharray="4 4" />
            <line x1="20" y1={svgHeight - 25} x2={svgWidth - 20} y2={svgHeight - 25} stroke="#262626" />

            <defs>
              <linearGradient id="cfTrafficGradReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {dataPoints.some(v => v > 0) && (
              <>
                <polygon
                  points={`20,${svgHeight - 25} ${pointsString} ${svgWidth - 20},${svgHeight - 25}`}
                  fill="url(#cfTrafficGradReal)"
                />
                <polyline
                  points={pointsString}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Data point dots */}
            {data.timeline.map((item, idx) => {
              const x = (idx / Math.max(1, data.timeline.length - 1)) * (svgWidth - 40) + 20;
              const y = svgHeight - 25 - (item.requests / maxVal) * (svgHeight - 50);
              const isHovered = hoveredPoint?.index === idx;

              return (
                <g key={idx}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 5 : item.requests > 0 ? 3.5 : 2}
                    fill={isHovered ? '#ffffff' : item.requests > 0 ? '#ffffff' : '#333333'}
                    stroke={item.requests > 0 ? '#ffffff' : '#444444'}
                    strokeWidth="1.5"
                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onMouseEnter={() =>
                      setHoveredPoint({ index: idx, label: item.label, req: item.requests })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  <text
                    x={x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fill="#555555"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover Tooltip Box */}
        {hoveredPoint && (
          <div
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              backgroundColor: '#111111',
              border: '1px solid #333333',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>Saat: <strong>{hoveredPoint.label}</strong></span>
            <span>&bull;</span>
            <span>İstek Sayısı: <strong>{hoveredPoint.req.toLocaleString('tr-TR')}</strong></span>
          </div>
        )}

        {!dataPoints.some(v => v > 0) && (
          <div style={{ textAlign: 'center', color: '#666', fontSize: '12px', marginTop: '12px' }}>
            Henüz kayıtlı trafik bulunmuyor. Domaininize istek geldikçe grafik burada gerçek zamanlı çizilecektir.
          </div>
        )}
      </div>
    </div>
  );
}
