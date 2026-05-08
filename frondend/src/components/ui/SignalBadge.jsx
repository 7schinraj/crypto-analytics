export default function SignalBadge({ signal }) {
  const cls = signal?.toLowerCase() || 'hold';
  return (
    <span className={`signal-badge ${cls}`}>
      {signal === 'BUY'  && '▲ '}
      {signal === 'SELL' && '▼ '}
      {signal === 'HOLD' && '— '}
      {signal}
    </span>
  );
}
