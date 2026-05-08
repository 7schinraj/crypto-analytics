import { useState, useEffect } from 'react';
import { getHistory } from '../api/marketsApi';

export function useHistory(symbol, limit = 50) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getHistory(symbol, limit);
        if (!cancelled) {
          // Reverse to oldest-first for chronological charting
          setHistory([...data].reverse());
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to fetch history');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHistory();
    return () => { cancelled = true; };
  }, [symbol, limit]);

  return { history, loading, error };
}
