import { useState, useEffect, useCallback } from 'react';
import { runStrategy as runStrategyApi, getStrategyResults } from '../api/strategyApi';

export function useStrategy() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError]     = useState(null);

  const fetchResults = useCallback(async () => {
    try {
      const { data } = await getStrategyResults();
      // Sort: BUY first, HOLD next, SELL last
      const order = { BUY: 0, HOLD: 1, SELL: 2 };
      const sorted = [...data].sort(
        (a, b) => (order[a.signal] ?? 99) - (order[b.signal] ?? 99)
      );
      setResults(sorted);
    } catch (err) {
      setError(err.message || 'Failed to fetch strategy results');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const runStrategy = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      await runStrategyApi();
      await fetchResults();
    } catch (err) {
      setError(err.message || 'Strategy run failed');
    } finally {
      setRunning(false);
    }
  }, [fetchResults]);

  return { results, loading, running, error, runStrategy, refetch: fetchResults };
}
