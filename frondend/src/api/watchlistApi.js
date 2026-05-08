import axios from '../lib/api.js';

export const getWatchlist = () =>
  axios.get('/markets/watchlist');

export const toggleWatchlist = (symbol) =>
  axios.post('/markets/watchlist/toggle', { symbol });
