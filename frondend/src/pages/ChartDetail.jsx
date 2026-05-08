import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout        from '../components/layout/AppLayout';
import PriceLineChart   from '../components/charts/PriceLineChart';
import VolumeBarChart   from '../components/charts/VolumeBarChart';
import StatBadge        from '../components/ui/StatBadge';
import LoadingSpinner   from '../components/ui/LoadingSpinner';
import EmptyState       from '../components/ui/EmptyState';
import { useHistory }   from '../hooks/useHistory';

const fmt = (n) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });

const fmtVol = (n) => {
  const v = Number(n);
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  return v.toLocaleString();
};

const filterByHours = (data, hours) => {
  if (!data || data.length === 0) return [];
  const latestTime = new Date(data[data.length - 1].timestamp).getTime();
  const limitMs = hours * 60 * 60 * 1000;
  return data.filter((d) => {
    const diff = latestTime - new Date(d.timestamp).getTime();
    return diff <= limitMs;
  });
};

const ChartDropdown = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const currentOption = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '5px 12px',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          background: 'var(--bg)',
          color: 'var(--text-primary)',
          fontSize: '11px',
          fontWeight: 700,
          cursor: 'pointer',
          outline: 'none',
          minWidth: '85px',
          height: '32px',
          transition: 'all 0.15s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary-light)';
          e.currentTarget.style.background = 'var(--bg-2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.background = 'var(--bg)';
        }}
      >
        <span style={{ textTransform: 'uppercase' }}>{currentOption.label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: 'var(--text-secondary)'
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 1000,
            minWidth: '120px',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--primary-border)',
            borderRadius: '12px',
            padding: '5px',
            boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.12), 0 8px 10px -6px rgba(124, 58, 237, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            animation: 'dropdownFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 11px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isSelected ? 'var(--primary)' : 'transparent',
                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: isSelected ? 700 : 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.15s ease',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'var(--primary-bg)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function ChartDetail() {
  const { symbol }  = useParams();
  const navigate    = useNavigate();
  
  // Local UX state configurations
  const [limit, setLimit] = useState(50);
  const [priceChartType, setPriceChartType] = useState('area');
  const [volumeChartType, setVolumeChartType] = useState('bar');
  const [volumeWindow, setVolumeWindow] = useState(24);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Trigger dynamic useHistory query loading whenever symbol or limit changes
  const { history, loading, error } = useHistory(symbol, limit);

  const latest = history.at(-1);
  const oldest = history[0];

  const priceChange = latest && oldest
    ? ((parseFloat(latest.price) - parseFloat(oldest.price)) / parseFloat(oldest.price)) * 100
    : null;

  const high   = history.length ? Math.max(...history.map((d) => parseFloat(d.price))) : null;
  const low    = history.length ? Math.min(...history.map((d) => parseFloat(d.price))) : null;
  const avgVol = history.length
    ? history.reduce((s, d) => s + parseFloat(d.volume_24h), 0) / history.length
    : null;

  return (
    <AppLayout>
      {/* Page Navigation & Dynamic Snapshots Limit Filter row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <button className="btn-back-circle" onClick={() => navigate('/dashboard')} title="Back to Dashboard">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>

        {/* Snapshots Limit Filter (Query Parameter propagation) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter:</span>
          {isMobile ? (
            <ChartDropdown
              value={limit}
              onChange={setLimit}
              options={[
                { value: 20, label: 'Last 20' },
                { value: 50, label: 'Last 50' },
                { value: 100, label: 'Last 100' }
              ]}
            />
          ) : (
            <div className="window-pills" style={{ margin: 0 }}>
              {[20, 50, 100].map((v) => (
                <button
                  key={v}
                  className={`window-pill${limit === v ? ' active' : ''}`}
                  style={{ fontSize: 11, padding: '5px 11px' }}
                  onClick={() => setLimit(v)}
                >
                  Last {v}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading historical chart data..." large />
      ) : error ? (
        <EmptyState icon="⚠️" title="Error loading data" description={error} />
      ) : history.length === 0 ? (
        <EmptyState icon="📉" title="No history found" description={`No historical data available for ${symbol}`} />
      ) : (
        <>
          {/* Hero Header */}
          <div className="chart-detail-hero">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {symbol?.replace('USDT', '')}
                <span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 400 }}> / USDT</span>
              </h1>
              {priceChange !== null && <StatBadge value={priceChange} />}
            </div>
            <div className="chart-hero-price">
              ${fmt(latest?.price)}
            </div>
            <div className="chart-hero-stats">
              {high && (
                <div className="hero-stat-pill">
                  <span className="hero-stat-label">High (window)</span>
                  <span className="hero-stat-value">${fmt(high)}</span>
                </div>
              )}
              {low && (
                <div className="hero-stat-pill">
                  <span className="hero-stat-label">Low (window)</span>
                  <span className="hero-stat-value">${fmt(low)}</span>
                </div>
              )}
              {avgVol && (
                <div className="hero-stat-pill">
                  <span className="hero-stat-label">Avg Volume</span>
                  <span className="hero-stat-value">{fmtVol(avgVol)}</span>
                </div>
              )}
              <div className="hero-stat-pill">
                <span className="hero-stat-label">Data Points</span>
                <span className="hero-stat-value">{history.length} Updates</span>
              </div>
            </div>
          </div>

          {/* Price Chart Card with Interactive Layout Selectors */}
          <div className="chart-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              <p className="chart-title" style={{ margin: 0 }}>Price History</p>
              
              {/* Price Graph Type Selectors */}
              {isMobile ? (
                <ChartDropdown
                  value={priceChartType}
                  onChange={setPriceChartType}
                  options={[
                    { value: 'area', label: 'Area' },
                    { value: 'line', label: 'Line' },
                    { value: 'bar', label: 'Bar' }
                  ]}
                />
              ) : (
                <div className="window-pills" style={{ margin: 0 }}>
                  {['area', 'line', 'bar'].map((type) => (
                    <button
                      key={type}
                      className={`window-pill${priceChartType === type ? ' active' : ''}`}
                      style={{ fontSize: 10, padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: 600 }}
                      onClick={() => setPriceChartType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <PriceLineChart data={history} type={priceChartType} height={isMobile ? 220 : 300} />
          </div>

          {/* Volume Chart Card with Interactive Layout & Time-Range Selectors */}
          <div className="chart-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              <p className="chart-title" style={{ margin: 0 }}>Volume ({volumeWindow}h)</p>
              
              {isMobile ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {/* Mobile Time Range Dropdown */}
                  <ChartDropdown
                    value={volumeWindow}
                    onChange={setVolumeWindow}
                    options={[
                      { value: 1, label: '1h' },
                      { value: 4, label: '4h' },
                      { value: 12, label: '12h' },
                      { value: 24, label: '24h' }
                    ]}
                  />

                  {/* Mobile Chart Type Dropdown */}
                  <ChartDropdown
                    value={volumeChartType}
                    onChange={setVolumeChartType}
                    options={[
                      { value: 'bar', label: 'Bar' },
                      { value: 'area', label: 'Area' },
                      { value: 'line', label: 'Line' }
                    ]}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Time Range Selector */}
                  <div className="window-pills" style={{ margin: 0 }}>
                    {[1, 4, 12, 24].map((h) => (
                      <button
                        key={h}
                        className={`window-pill${volumeWindow === h ? ' active' : ''}`}
                        style={{ fontSize: 11, padding: '5px 12px', fontWeight: 700 }}
                        onClick={() => setVolumeWindow(h)}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>

                  <div style={{ width: 1, height: 18, background: 'var(--border)' }} />

                  {/* Volume Graph Type Selectors */}
                  <div className="window-pills" style={{ margin: 0 }}>
                    {['bar', 'area', 'line'].map((type) => (
                      <button
                        key={type}
                        className={`window-pill${volumeChartType === type ? ' active' : ''}`}
                        style={{ fontSize: 11, padding: '5px 12px', textTransform: 'uppercase', fontWeight: 700 }}
                        onClick={() => setVolumeChartType(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <VolumeBarChart data={filterByHours(history, volumeWindow)} type={volumeChartType} height={isMobile ? 200 : 280} />
          </div>
        </>
      )}
    </AppLayout>
  );
}
