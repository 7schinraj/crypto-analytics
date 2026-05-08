// All environment variables are read once here.
// Import this file wherever you need a config value.

export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  APP_NAME:     import.meta.env.VITE_APP_NAME     || 'CryptoAnalytics',
};
