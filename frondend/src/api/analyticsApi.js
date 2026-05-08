import axios from '../lib/api.js';

export const getAnalytics = (window_minutes = 60) =>
  axios.get('/analytics', { params: { window_minutes } });
