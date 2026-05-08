import axios from '../lib/api.js';

export const runStrategy = () =>
  axios.post('/strategy/run');

export const getStrategyResults = (symbol = null) =>
  axios.get('/strategy/results', {
    params: symbol ? { symbol } : {},
  });
