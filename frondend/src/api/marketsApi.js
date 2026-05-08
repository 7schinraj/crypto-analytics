import axios from '../lib/api.js';

export const getMarkets = () =>
  axios.get('/markets');

export const getPrice = (symbol) =>
  axios.get('/markets/prices', { params: { symbol } });

export const getHistory = (symbol, limit = 100) =>
  axios.get('/markets/history', { params: { symbol, limit } });
