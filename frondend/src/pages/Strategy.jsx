import { useState } from 'react';
import AppLayout      from '../components/layout/AppLayout';
import SignalChart    from '../components/charts/SignalChart';
import SignalBadge    from '../components/ui/SignalBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState     from '../components/ui/EmptyState';
import { useStrategy } from '../hooks/useStrategy';

const fmt = (n) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

function Toast({ message, onClose }) {
  return (
    <div className="toast">
      <span>✅</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 16 }}
      >
        ×
      </button>
    </div>
  );
}

const GRID_COLS = '1fr 110px 150px 150px 200px 140px';

function ConfidenceCell({ value }) {
  const v = parseFloat(value);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
      <span className="dg-mono" style={{ minWidth: 48, fontSize: 12 }}>
        {v.toFixed(2)}%
      </span>
      <div className="dg-bar-wrap">
        <div
          className="dg-bar-fill primary"
          style={{ width: `${Math.min(v, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function Strategy() {
  const { results, loading, running, error, runStrategy } = useStrategy();
  const [toast, setToast] = useState(null);
  const [expandedSymbol, setExpandedSymbol] = useState(null);

  const handleRun = async () => {
    await runStrategy();
    setToast(`Strategy completed for ${results.length || 10} symbols`);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <AppLayout>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Strategy Engine</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Moving Average Crossover — Short MA (10) vs Long MA (50)</p>
        </div>

        {/* Run button */}
        <button
          className="btn-primary"
          style={{ fontSize: 14, padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          onClick={handleRun}
          disabled={running}
          id="run-strategy-btn"
        >
          {running ? (
            <>
              <div className="spinner" style={{ borderTopColor: '#000', width: 14, height: 14, borderWidth: '1.5px' }} />
              Running analysis...
            </>
          ) : (
            '▶ Run Strategy'
          )}
        </button>
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
        <LoadingSpinner label="Loading strategy results..." large />
      ) : results.length === 0 ? (
        <EmptyState
          icon="🧠"
          title="No strategy results yet"
          description="Click 'Run Strategy' to analyze all 10 symbols."
        />
      ) : (
        <>
          {/* Signal columns visual */}
          <SignalChart results={results} />

          {/* Premium Data Grid */}
          <div className="dg-wrap">
            {/* Header */}
            <div className="dg-header">
              <div>
                <div className="dg-title">Strategy Results</div>
                <div className="dg-subtitle">Moving Average Crossover signals</div>
              </div>
              <span className="dg-count">{results.length} symbols</span>
            </div>

            {/* Column Labels */}
            <div className="dg-cols" style={{ gridTemplateColumns: GRID_COLS }}>
              <span className="dg-col-label">Symbol</span>
              <span className="dg-col-label">Signal</span>
              <span className="dg-col-label">Short MA (10)</span>
              <span className="dg-col-label">Long MA (50)</span>
              <span className="dg-col-label">Confidence</span>
              <span className="dg-col-label">Run At</span>
            </div>

            {/* Rows */}
            <div className="dg-body">
              {results.map((r) => (
                <div
                  key={r.symbol}
                  className="dg-row"
                  style={{ gridTemplateColumns: GRID_COLS }}
                >
                  {/* Symbol */}
                  <div className="dg-cell">
                    <span className="dg-symbol-main">{r.symbol.replace('USDT', '')}</span>
                    <span className="dg-symbol-pair">/USDT</span>
                  </div>

                  {/* Signal Badge */}
                  <div className="dg-cell">
                    <SignalBadge signal={r.signal} />
                  </div>

                  {/* Short MA */}
                  <div className="dg-cell">
                    <span className="dg-mono">${fmt(r.short_ma)}</span>
                  </div>

                  {/* Long MA */}
                  <div className="dg-cell">
                    <span className="dg-mono">${fmt(r.long_ma)}</span>
                  </div>

                  {/* Confidence */}
                  <div className="dg-cell">
                    <ConfidenceCell value={r.confidence_score} />
                  </div>

                  {/* Date */}
                  <div className="dg-cell">
                    <span className="dg-date">{fmtDate(r.run_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Card Layout */}
          <div className="mobile-cards-wrap">
            {results.map((r) => {
              const isExpanded = expandedSymbol === r.symbol;
              return (
                <div
                  key={r.symbol}
                  className={`mobile-card${isExpanded ? ' active' : ''}`}
                  onClick={() => setExpandedSymbol(isExpanded ? null : r.symbol)}
                >
                  {/* Collapsed Header */}
                  <div className="mobile-card-header">
                    <div className="mobile-card-title-sec">
                      <span className="dg-symbol-main">{r.symbol.replace('USDT', '')}</span>
                      <span className="dg-symbol-pair">/USDT</span>
                    </div>
                    <div className="mobile-card-price-sec">
                      <SignalBadge signal={r.signal} />
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
                      <span className="mobile-stat-label">Short MA (10)</span>
                      <span className="mobile-stat-value dg-mono">${fmt(r.short_ma)}</span>
                    </div>
                    <div className="mobile-stat-row">
                      <span className="mobile-stat-label">Long MA (50)</span>
                      <span className="mobile-stat-value dg-mono">${fmt(r.long_ma)}</span>
                    </div>
                    <div className="mobile-stat-row">
                      <span className="mobile-stat-label">Confidence Score</span>
                      <span className="mobile-stat-value" style={{ width: '60%' }}>
                        <ConfidenceCell value={r.confidence_score} />
                      </span>
                    </div>
                    <div className="mobile-stat-row">
                      <span className="mobile-stat-label">Execution Time</span>
                      <span className="mobile-stat-value">{fmtDate(r.run_at)}</span>
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
