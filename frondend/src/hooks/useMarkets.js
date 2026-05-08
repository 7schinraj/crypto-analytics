import { useState, useEffect, useCallback } from 'react';
import { getMarkets } from '../api/marketsApi';

const REFRESH_INTERVAL = 60000; // 60 seconds

export function useMarkets() {
  const [markets, setMarkets]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMarkets = useCallback(async () => {
    try {
      const { data } = await getMarkets();
      setMarkets(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch markets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
    const id = setInterval(fetchMarkets, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchMarkets]);

  return { markets, loading, error, lastUpdated, refetch: fetchMarkets };
}
