import { useEffect, useState, useMemo, useRef } from 'react';
import AppLayout    from '../components/layout/AppLayout';
import CryptoCard   from '../components/ui/CryptoCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState   from '../components/ui/EmptyState';
import { useMarkets } from '../hooks/useMarkets';

import { getWatchlist, toggleWatchlist } from '../api/watchlistApi';

function useElapsed(lastUpdated) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!lastUpdated) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [lastUpdated]);
  return elapsed;
}

const SkeletonCard = () => (
  <div className="card crypto-card" style={{ gap: 12 }}>
    <div className="skeleton" style={{ height: 20, width: '60%' }} />
    <div className="skeleton" style={{ height: 32, width: '80%', marginTop: 8 }} />
    <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
      <div className="skeleton" style={{ height: 30, flex: 1 }} />
      <div className="skeleton" style={{ height: 30, flex: 1 }} />
      <div className="skeleton" style={{ height: 30, flex: 1 }} />
    </div>
  </div>
);

export default function Dashboard() {
  const { markets, loading, error, lastUpdated } = useMarkets();
  const elapsed = useElapsed(lastUpdated);

  // Active Category Filter state
  const [filterTab, setFilterTab] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Watchlist (starred tokens) loaded from backend database
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    let active = true;
    getWatchlist()
      .then((res) => {
        if (active && res?.data) {
          setWatchlist(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load watchlist from backend:', err);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleToggleWatchlist = async (e, symbol) => {
    e.stopPropagation();
    
    // Optimistic UI state update for instant, lightning-fast interactivity
    const isAlreadyStarred = watchlist.includes(symbol);
    const updated = isAlreadyStarred
      ? watchlist.filter((s) => s !== symbol)
      : [...watchlist, symbol];
    setWatchlist(updated);

    try {
      await toggleWatchlist(symbol);
    } catch (err) {
      console.error('Failed to toggle watchlist in backend:', err);
      // Revert state if backend request fails
      setWatchlist(watchlist);
    }
  };

  // Memoized Filtered and Sorted Markets List
  const processedMarkets = useMemo(() => {
    if (!markets) return [];

    let result = [...markets];

    // 1. Apply Category Filter
    if (filterTab === 'gainers') {
      result = result.filter((m) => parseFloat(m.price_change_percent_24h) > 0);
    } else if (filterTab === 'losers') {
      result = result.filter((m) => parseFloat(m.price_change_percent_24h) < 0);
    } else if (filterTab === 'volume') {
      result = result.sort((a, b) => parseFloat(b.volume_24h) - parseFloat(a.volume_24h));
    }

    // 2. Dynamic Starred Pinning (only if not viewing volume list)
    if (filterTab !== 'volume') {
      result = result.sort((a, b) => {
        const aStarred = watchlist.includes(a.symbol);
        const bStarred = watchlist.includes(b.symbol);
        if (aStarred && !bStarred) return -1;
        if (!aStarred && bStarred) return 1;
        return 0;
      });
    }

    return result;
  }, [markets, filterTab, watchlist]);

  const dropdownOptions = [
    { key: 'all',     label: 'All Markets',    icon: '🌐' },
    { key: 'gainers', label: 'Top Gainers',    icon: '🟢' },
    { key: 'losers',  label: 'Top Losers',     icon: '🔴' },
    { key: 'volume',  label: 'High Volume',    icon: '⚡' }
  ];

  const selectedOption = dropdownOptions.find(opt => opt.key === filterTab) || dropdownOptions[0];

  return (
    <AppLayout>
      {/* Sleek Row combining heading left and custom dropdown right */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            Market Overview
            <span className="live-dot" />
          </h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Live data · Updates every 60s
            {lastUpdated && (
              <span style={{ marginLeft: 12, color: 'var(--accent)' }}>
                · Updated {elapsed}s ago
              </span>
            )}
          </p>
        </div>

        {/* Custom Premium Dropdown (Search is completely removed) */}
        <div className="custom-dropdown-wrap" ref={dropdownRef}>
          <button
            className="dropdown-trigger-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
          >
            <span className="dropdown-trigger-icon">{selectedOption.icon}</span>
            <span className="dropdown-trigger-label">{selectedOption.label}</span>
            <svg className={`dropdown-chevron ${isDropdownOpen ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          
          {isDropdownOpen && (
            <ul className="dropdown-options-menu">
              {dropdownOptions.map((opt) => (
                <li key={opt.key}>
                  <button
                    className={`dropdown-option-item ${filterTab === opt.key ? 'active' : ''}`}
                    onClick={() => {
                      setFilterTab(opt.key);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <span className="option-icon">{opt.icon}</span>
                    <span className="option-label">{opt.label}</span>
                    {filterTab === opt.key && (
                      <svg className="option-check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(246,70,93,0.1)',
          border: '1px solid rgba(246,70,93,0.3)',
          borderRadius: 'var(--radius)',
          padding: '14px 18px',
          color: 'var(--danger)',
          marginBottom: 20,
          fontSize: 13,
        }}>
          ⚠ {error}
        </div>
      )}

      {loading ? (
        <div className="crypto-grid">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : processedMarkets.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No assets found"
          description="No assets found in this category right now."
        />
      ) : (
        <div className="crypto-grid">
          {processedMarkets.map((m) => (
            <CryptoCard
              key={m.symbol}
              market={m}
              isStarred={watchlist.includes(m.symbol)}
              onToggleStar={handleToggleWatchlist}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
