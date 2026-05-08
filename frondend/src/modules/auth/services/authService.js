import api from '../../../lib/api.js';

// Mirrors backend /auth/* endpoints exactly.

/**
 * POST /auth/signup
 * @param {{ username: string, email: string, password: string }} data
 */
export const signupUser = (data) => api.post('/auth/signup', data);

/**
 * POST /auth/login
 * @param {{ email: string, password: string }} data
 * @returns {{ access_token: string, token_type: string }}
 */
export const loginUser  = (data) => api.post('/auth/login', data);
