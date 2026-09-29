'use client';

import React, { useState } from 'react';
import { ClaimedSubdomain } from '@/lib/types';
import { BarChart3, TrendingUp, ShieldAlert, Users, Activity, Globe, ArrowUpRight } from 'lucide-react';

interface AnalyticsWidgetProps {
  subdomains: ClaimedSubdomain[];
  activeSubdomain?: ClaimedSubdomain | null;
}

export default function AnalyticsWidget({
  subdomains,
  activeSubdomain,
}: AnalyticsWidgetProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; label: string; req: number } | null>(null);

  // Generate realistic data based on subdomains count and DDoS status
  const multiplier = Math.max(1, subdomains.length);
  const totalReq = timeRange === '24h' ? 14280 * multiplier : timeRange === '7d' ? 98400 * multiplier : 412000 * multiplier;
  const uniqueVis = timeRange === '24h' ? 3840 * multiplier : timeRange === '7d' ? 24500 * multiplier : 98000 * multiplier;
  const threats = timeRange === '24h' ? 840 * multiplier : timeRange === '7d' ? 5200 * multiplier : 21000 * multiplier;
  const bandwidth = timeRange === '24h' ? `${(1.8 * multiplier).toFixed(1)} GB` : timeRange === '7d' ? `${(12.4 * multiplier).toFixed(1)} GB` : `${(54.2 * multiplier).toFixed(1)} GB`;

  // 12 data points for the SVG line chart
  const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  const dataPoints = [32, 18, 14, 28, 65, 84, 92, 110, 105, 120, 95, 78];

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 160;
  const maxVal = Math.max(...dataPoints);

  const pointsString = dataPoints
    .map((val, idx) => {
      const x = (idx / (dataPoints.length - 1)) * (svgWidth - 40) + 20;
      const y = svgHeight - 25 - (val / maxVal) * (svgHeight - 50);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header with Title & Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
            Site Ziyaretçileri & Trafik Analitiği
          </h2>
          <p style={{ fontSize: '13px', color: '#888888', marginTop: '2px' }}>
            Cloudflare Anycast PoP düğümleri üzerinden geçen gerçek zamanlı trafik akışı
          </p>
        </div>

        {/* Time Filter Dropdown (like Cloudflare) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0a0a0a', border: '1px solid #222222', borderRadius: 'var(--radius-sm)', padding: '4px' }}>
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

      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {/* Card 1 */}
        <div className="card" style={{ padding: '18px', backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#888888', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
            <span>Toplam İstek (Requests)</span>
            <Activity size={15} style={{ color: '#ffffff' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            {totalReq.toLocaleString('tr-TR')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#22c55e', marginTop: '4px' }}>
            <ArrowUpRight size={13} />
            <span>%14.2 artış (önceki döneme göre)</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card" style={{ padding: '18px', backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#888888', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
            <span>Tekil Ziyaretçiler</span>
            <Users size={15} style={{ color: '#ffffff' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            {uniqueVis.toLocaleString('tr-TR')}
          </div>
          <div style={{ fontSize: '11px', color: '#777777', marginTop: '4px' }}>
            Dünya genelinde 42 farklı ülkeden
          </div>
        </div>

        {/* Card 3 */}
        <div className="card" style={{ padding: '18px', backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#888888', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
            <span>Engellenen DDoS & Botlar</span>
            <ShieldAlert size={15} style={{ color: '#ffffff' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            {threats.toLocaleString('tr-TR')}
          </div>
          <div style={{ fontSize: '11px', color: '#888888', marginTop: '4px' }}>
            Turnstile & L7 WAF ile süzüldü
          </div>
        </div>

        {/* Card 4 */}
        <div className="card" style={{ padding: '18px', backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#888888', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
            <span>Bant Genişliği & Önbellek</span>
            <Globe size={15} style={{ color: '#ffffff' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            {bandwidth}
          </div>
          <div style={{ fontSize: '11px', color: '#777777', marginTop: '4px' }}>
            %88 Edge Cache Hit Oranı
          </div>
        </div>
      </div>

      {/* Cloudflare Style Traffic Line Graph */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
            İstek Grafiği (Requests over time)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: '#888888' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
              <span>Normal Trafik</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#555555' }} />
              <span>DDoS Savunması</span>
            </div>
          </div>
        </div>

        {/* Responsive SVG Chart */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: '180px' }}>
            {/* Horizontal Grid lines */}
            <line x1="20" y1="20" x2={svgWidth - 20} y2="20" stroke="#1c1c1c" strokeDasharray="4 4" />
            <line x1="20" y1="65" x2={svgWidth - 20} y2="65" stroke="#1c1c1c" strokeDasharray="4 4" />
            <line x1="20" y1="110" x2={svgWidth - 20} y2="110" stroke="#1c1c1c" strokeDasharray="4 4" />
            <line x1="20" y1={svgHeight - 25} x2={svgWidth - 20} y2={svgHeight - 25} stroke="#262626" />

            {/* Gradient Area fill */}
            <defs>
              <linearGradient id="cfTrafficGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <polygon
              points={`20,${svgHeight - 25} ${pointsString} ${svgWidth - 20},${svgHeight - 25}`}
              fill="url(#cfTrafficGrad)"
            />

            {/* The main stroke line */}
            <polyline
              points={pointsString}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data point dots with hover */}
            {dataPoints.map((val, idx) => {
              const x = (idx / (dataPoints.length - 1)) * (svgWidth - 40) + 20;
              const y = svgHeight - 25 - (val / maxVal) * (svgHeight - 50);
              const isHovered = hoveredPoint?.index === idx;

              return (
                <g key={idx}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 5 : 3.5}
                    fill={isHovered ? '#ffffff' : '#000000'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                    onMouseEnter={() =>
                      setHoveredPoint({ index: idx, label: hours[idx], req: Math.round(val * 14 * multiplier) })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Axis Hour Labels */}
                  <text
                    x={x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fill="#555555"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {hours[idx]}
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
            <span>İstek: <strong>{hoveredPoint.req.toLocaleString('tr-TR')} req/s</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}
