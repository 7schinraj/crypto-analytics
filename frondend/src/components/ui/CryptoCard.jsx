import { useNavigate } from 'react-router-dom';
import StatBadge from './StatBadge';

const fmt = (n) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });

const fmtVol = (n) => {
  const v = Number(n);
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  return `$${v.toLocaleString()}`;
};

// Deterministic Sparkline Generator — Seeded based on token name
// BTCUSDT always gets its unique waves signature trend, ETHUSDT has its own, etc.
const generateSeededTrend = (symbol, changePercent) => {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const points = [];
  const count = 12;
  const isUp = parseFloat(changePercent) >= 0;
  
  for (let i = 0; i < count; i++) {
    const progress = i / (count - 1);
    // Base waveform
    let val = 50 + Math.sin(progress * Math.PI * 1.8) * 15 + (Math.sin(hash + i * 2) * 12);
    
    // Adjust trendline direction based on price change
    if (isUp) {
      val += progress * 16;
    } else {
      val -= progress * 16;
    }
    
    // Bounds clamping
    val = Math.max(12, Math.min(88, val));
    points.push(val);
  }
  return points;
};

function Sparkline({ symbol, changePercent }) {
  const points = generateSeededTrend(symbol, changePercent);
  const width = 110;
  const height = 44;
  const step = width / (points.length - 1);
  
  const svgPoints = points.map((p, i) => {
    const x = i * step;
    const y = height - (p / 100) * height;
    return `${x},${y}`;
  });
  
  const pathData = `M ${svgPoints.join(' L ')}`;
  const isUp = parseFloat(changePercent) >= 0;
  const color = isUp ? '#0ecb81' : '#f6465d';
  
  return (
    <div className="sparkline-container" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {/* Fill Area under Sparkline */}
        <path
          d={`${pathData} L ${width},${height} L 0,${height} Z`}
          fill={`url(#grad-${symbol})`}
          stroke="none"
        />
        {/* Beautiful curved sparkline path */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function CryptoCard({ market, isStarred, onToggleStar }) {
  const navigate = useNavigate();
  const { symbol, price, price_change_percent_24h, volume_24h, high_24h, low_24h } = market;
  const isUp = parseFloat(price_change_percent_24h) >= 0;

  return (
    <div
      className={`card crypto-card fade-in ${isUp ? 'up-glow' : 'down-glow'}`}
      onClick={() => navigate(`/chart/${symbol}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/chart/${symbol}`)}
    >
      <div className="crypto-card-header">
        <span className="crypto-symbol">
          {symbol.replace('USDT', '')}
          <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 13 }}>/USDT</span>
        </span>

        {/* Watchlist Star Button */}
        <button
          className={`star-btn ${isStarred ? 'starred' : ''}`}
          onClick={(e) => onToggleStar(e, symbol)}
          title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
          aria-label="Toggle Watchlist"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isStarred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      </div>

      <div className="crypto-body-row" style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div className="crypto-price" style={{ margin: 0 }}>${fmt(price)}</div>
          <div style={{ marginTop: 6 }}>
            <StatBadge value={price_change_percent_24h} />
          </div>
        </div>

        {/* Dynamic Micro Sparkline Visualizer */}
        <Sparkline symbol={symbol} changePercent={price_change_percent_24h} />
      </div>

      <div className="crypto-stats">
        <div className="crypto-stat">
          <span className="crypto-stat-label">Volume</span>
          <span className="crypto-stat-value">{fmtVol(volume_24h)}</span>
        </div>
        <div className="crypto-stat">
          <span className="crypto-stat-label">High</span>
          <span className="crypto-stat-value">${fmt(high_24h)}</span>
        </div>
        <div className="crypto-stat">
          <span className="crypto-stat-label">Low</span>
          <span className="crypto-stat-value">${fmt(low_24h)}</span>
        </div>
      </div>
    </div>
  );
}
