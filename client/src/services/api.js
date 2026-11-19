import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Universal API helper that attaches the user's Supabase JWT Bearer token
 * to every backend request for server-side Express RBAC verification.
 */
export async function apiRequest(endpoint, options = {}) {
  let session = null;
  try {
    ({ data: { session } } = await supabase.auth.getSession());
  } catch (err) {
    throw new Error('Cannot reach Supabase to verify your login. Check your internet connection.');
  }
  const token = session?.access_token;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: options.signal || AbortSignal.timeout(30000)
    });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new Error('The server took too long to respond. Please try again.');
    }
    throw new Error('Cannot reach the CivicConnect server. Is the backend running?');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
