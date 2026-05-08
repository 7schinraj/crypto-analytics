export default function StatBadge({ value }) {
  const num      = parseFloat(value) || 0;
  const positive = num >= 0;
  const label    = `${positive ? '↑' : '↓'} ${Math.abs(num).toFixed(2)}%`;

  return (
    <span className={`stat-badge ${positive ? 'positive' : 'negative'}`}>
      {label}
    </span>
  );
}
