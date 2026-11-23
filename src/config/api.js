/**
 * Environment-aware API configuration.
 *
 * In local development, falls back to 'http://localhost:5000' if VITE_API_URL is unset.
 * In production builds (Vercel), requires VITE_API_URL so requests are never routed to localhost.
 */
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Guard against accidental localhost calls in production builds
  if (import.meta.env.PROD) {
    console.error('⚠️ [API Configuration Warning]: VITE_API_URL is not configured in production environment.');
    return '';
  }

  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
