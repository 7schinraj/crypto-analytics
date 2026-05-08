import React, { useState } from 'react';
import AppLayout      from '../components/layout/AppLayout';
import MomentumChart  from '../components/charts/MomentumChart';
import StatBadge      from '../components/ui/StatBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState     from '../components/ui/EmptyState';
import { useAnalytics } from '../hooks/useAnalytics';

const WINDOWS = [
  { label: '30m',  value: 30   },
  { label: '1h',   value: 60   },
  { label: '4h',   value: 240  },
  { label: '24h',  value: 1440 },
];

const fmt    = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
const fmtPct = (n) => {
  const v = parseFloat(n);
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
};

const GRID_COLS = '60px 1.2fr 1fr 1fr 1fr 1.2fr';

export default function Analytics() {
  const { analytics, loading, error, windowMinutes, setWindowMinutes } = useAnalytics();
  const [expandedSymbol, setExpandedSymbol] = useState(null);
  const [chartType, setChartType] = useState('line');

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Momentum scoring and price comparisons over a selected window</p>
      </div>

      {/* Window Selector */}
      <div className="window-pills">
        {WINDOWS.map(({ label, value }) => (
          <button
            key={value}
            className={`window-pill${windowMinutes === value ? ' active' : ''}`}
            onClick={() => setWindowMinutes(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label="Computing analytics..." large />
      ) : error ? (
        <EmptyState icon="⚠️" title="Error loading analytics" description={error} />
      ) : analytics.length === 0 ? (
        <EmptyState
          icon="📊"
          title="No analytics data"
          description="Not enough historical data for this window. Try a shorter window or wait for more snapshots."
        />
      ) : (
        <>
          {/* Momentum Chart */}
          <div className="chart-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              <p className="chart-title" style={{ margin: 0 }}>Momentum Score Ranking</p>
              
              {/* Chart Type Selector Pills */}
              <div className="window-pills" style={{ margin: 0 }}>
                <button
                  className={`window-pill${chartType === 'horizontal' ? ' active' : ''}`}
                  style={{ fontSize: 11, padding: '5px 10px' }}
                  onClick={() => setChartType('horizontal')}
                >
                  Horizontal Bar
                </button>
                <button
                  className={`window-pill${chartType === 'vertical' ? ' active' : ''}`}
                  style={{ fontSize: 11, padding: '5px 10px' }}
                  onClick={() => setChartType('vertical')}
                >
                  Vertical Bar
                </button>
                <button
                  className={`window-pill${chartType === 'line' ? ' active' : ''}`}
                  style={{ fontSize: 11, padding: '5px 10px' }}
                  onClick={() => setChartType('line')}
                >
                  Smooth Line
                </button>
              </div>
            </div>
            
            <MomentumChart data={analytics} type={chartType} height={280} />
          </div>

          {/* Premium Data Grid */}
          <div className="dg-wrap">
            {/* Header */}
            <div className="dg-header">
              <div>
                <div className="dg-title">Market Analytics</div>
                <div className="dg-subtitle">
                  Price &amp; volume momentum — {windowMinutes}m window
                </div>
              </div>
              <span className="dg-count">{analytics.length} assets</span>
            </div>

            {/* Column Labels */}
            <div className="dg-cols" style={{ gridTemplateColumns: GRID_COLS }}>
              <span className="dg-col-label">Rank</span>
              <span className="dg-col-label">Symbol</span>
              <span className="dg-col-label">Price</span>
              <span className="dg-col-label">Price Δ</span>
              <span className="dg-col-label">Volume Δ</span>
              <span className="dg-col-label">Momentum</span>
            </div>

            {/* Rows */}
            <div className="dg-body">
              {analytics.map((row) => (
                <div
                  key={row.symbol}
                  className="dg-row"
                  style={{ gridTemplateColumns: GRID_COLS }}
                >
                  {/* Rank */}
                  <div className="dg-cell">
                    <RankBadge rank={row.rank} />
                  </div>

                  {/* Symbol */}
                  <div className="dg-cell">
                    <span className="dg-symbol-main">{row.symbol.replace('USDT', '')}</span>
                    <span className="dg-symbol-pair">/USDT</span>
                  </div>

                  {/* Price */}
                  <div className="dg-cell">
                    <span className="dg-mono">${fmt(row.current_price)}</span>
                  </div>

                  {/* Price Change */}
                  <div className="dg-cell">
                    <PctCell value={row.price_change_pct} />
                  </div>

                  {/* Volume Change */}
                  <div className="dg-cell">
                    <PctCell value={row.volume_change_pct} />
                  </div>

                  {/* Momentum */}
                  <div className="dg-cell">
                    <MomentumCell score={row.momentum_score} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Card Layout */}
          <div className="mobile-cards-wrap">
            {analytics.map((row) => {
              const isExpanded = expandedSymbol === row.symbol;
              return (
                <div
                  key={row.symbol}
                  className={`mobile-card${isExpanded ? ' active' : ''}`}
                  onClick={() => setExpandedSymbol(isExpanded ? null : row.symbol)}
                >
                  {/* Collapsed Header */}
                  <div className="mobile-card-header">
                    <div className="mobile-card-title-sec">
                      <RankBadge rank={row.rank} />
                      <span className="dg-symbol-main">{row.symbol.replace('USDT', '')}</span>
                      <span className="dg-symbol-pair">/USDT</span>
                    </div>
                    <div className="mobile-card-price-sec">
                      <span className="dg-mono" style={{ fontSize: 14, fontWeight: 700 }}>
                        ${fmt(row.current_price)}
                      </span>
                      <span className="mobile-card-chevron">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Expanded Content Tray */}
                  <div className="mobile-card-tray">
                    <div className="mobile-stat-row">
                      <span className="mobile-stat-label">Price Change ({windowMinutes}m)</span>
                      <span className="mobile-stat-value">
                        <PctCell value={row.price_change_pct} />
                      </span>
                    </div>
                    <div className="mobile-stat-row">
                      <span className="mobile-stat-label">Volume Change ({windowMinutes}m)</span>
                      <span className="mobile-stat-value">
                        <PctCell value={row.volume_change_pct} />
                      </span>
                    </div>
                    <div className="mobile-stat-row">
                      <span className="mobile-stat-label">Momentum Score</span>
                      <span className="mobile-stat-value">
                        <MomentumCell score={row.momentum_score} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </AppLayout>
  );
}

/* ── HELPERS ────────────────────────────────────────────────────────────── */

function RankBadge({ rank }) {
  const r = parseInt(rank);
  if (r === 1) return <span className="dg-rank-pill gold">🥇 1</span>;
  if (r === 2) return <span className="dg-rank-pill silver">🥈 2</span>;
  if (r === 3) return <span className="dg-rank-pill bronze">🥉 3</span>;
  return <span className="dg-rank-pill default">{r}</span>;
}

function PctCell({ value }) {
  const v = parseFloat(value);
  const isUp = v >= 0;
  return (
    <span className={`dg-pct-pill ${isUp ? 'up' : 'down'}`}>
      {isUp ? '▲' : '▼'} {Math.abs(v).toFixed(2)}%
    </span>
  );
}

function MomentumCell({ score }) {
  const s = parseFloat(score);
  const color = s >= 0 ? 'var(--success)' : 'var(--danger)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color }}>
        {s >= 0 ? '+' : ''}{s.toFixed(2)}
      </span>
      <div style={{ width: '100%', height: 4, background: 'rgba(0,0,0,0.04)', borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${Math.min(Math.abs(s) * 20, 100)}%`,
            background: color,
            borderRadius: 2,
            transition: 'width 0.4s ease'
          }}
        />
      </div>
    </div>
  );
}
