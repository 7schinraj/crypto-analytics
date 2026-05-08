import SignalBadge from '../ui/SignalBadge';

export default function SignalChart({ results }) {
  const grouped = { BUY: [], HOLD: [], SELL: [] };
  results.forEach((r) => {
    if (grouped[r.signal]) grouped[r.signal].push(r);
  });

  const columns = [
    { key: 'BUY',  title: 'Buy Signals',  color: 'var(--success)', badgeBg: 'rgba(14,203,129,0.15)' },
    { key: 'HOLD', title: 'Hold',          color: 'var(--accent)',  badgeBg: 'rgba(240,185,11,0.15)' },
    { key: 'SELL', title: 'Sell Signals', color: 'var(--danger)',  badgeBg: 'rgba(246,70,93,0.15)'  },
  ];

  return (
    <div className="signal-columns">
      {columns.map(({ key, title, color, badgeBg }) => (
        <div
          key={key}
          className="card"
          style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg-elevated)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="signal-column-header">
            <span className="signal-column-title" style={{ color }}>
              {title}
            </span>
            <span
              className="signal-count-badge"
              style={{ background: badgeBg, color }}
            >
              {grouped[key].length}
            </span>
          </div>
          {grouped[key].length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No signals</div>
          ) : (
            grouped[key].map((r) => (
              <div key={r.symbol} className="signal-item">
                <span style={{ marginRight: 8, fontWeight: 500 }}>{r.symbol.replace('USDT', '')}</span>
                <SignalBadge signal={r.signal} />

                {/* Black & White Premium Dynamic Tooltip */}
                <div className="signal-tooltip">
                  <div className="tooltip-title">
                    {r.symbol.replace('USDT', '')} — Market Outlook
                  </div>
                  <div className="tooltip-reason">
                    {r.signal === 'BUY' && (
                      <span>Recent prices are showing strong upward momentum, climbing significantly faster than the long-term average. This indicates a solid bullish trend, suggesting a favorable entry point to <strong>BUY</strong>.</span>
                    )}
                    {r.signal === 'SELL' && (
                      <span>Recent prices are dropping rapidly below the long-term historical trend, indicating a strong downward momentum. With rising selling pressure, it is safer to exit or <strong>SELL</strong>.</span>
                    )}
                    {r.signal === 'HOLD' && (
                      <span>The asset price is currently stable with no strong upward or downward movements. It is in a steady sideways consolidation phase, making it safest to <strong>HOLD</strong> and wait for a clear market direction.</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}
