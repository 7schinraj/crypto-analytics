import { useState, useEffect } from 'react';
import { getAnalytics } from '../api/analyticsApi';

export function useAnalytics() {
  const [analytics, setAnalytics]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [windowMinutes, setWindowMinutes] = useState(60);

  useEffect(() => {
    let cancelled = false;

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getAnalytics(windowMinutes);
        if (!cancelled) setAnalytics(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to fetch analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => { cancelled = true; };
  }, [windowMinutes]);

  return { analytics, loading, error, windowMinutes, setWindowMinutes };
}
