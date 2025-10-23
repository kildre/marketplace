/**
 * API Configuration Module
 *
 * Centralizes all API endpoint configuration with environment-aware URL handling.
 * Supports development (proxy), staging, and production environments.
 */

// ============================================================================
// Environment Configuration
// ============================================================================

/**
 * Get the API base URL from environment variables
 * Priority: VITE_API_BASE_URL > fallback to empty string (uses proxy in dev)
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Check if bypass auth is enabled (for local development)
 */
export const isBypassAuth = import.meta.env.VITE_BYPASS_AUTH === "true";

// ============================================================================
// Environment Information (for debugging)
// ============================================================================

export const getEnvironmentInfo = () => ({
  mode: import.meta.env.MODE,
  apiBaseUrl: API_BASE_URL,
  bypassAuth: isBypassAuth,
});

// ============================================================================
// API URL Construction
// ============================================================================

/**
 * Get the complete API endpoint URL
 *
 * @param path - The API path (e.g., '/api/requests' or 'api/requests')
 * @returns Complete URL for the API endpoint
 *
 * @example
 * // Development with Vite proxy (VITE_API_BASE_URL empty)
 * getApiUrl('/api/requests') // => '/api/requests' (proxied to localhost:8082)
 *
 * @example
 * // Local backend (VITE_API_BASE_URL='http://localhost:8082')
 * getApiUrl('/api/requests') // => 'http://localhost:8082/api/requests'
 *
 * @example
 * // Production (VITE_API_BASE_URL='https://api.example.com')
 * getApiUrl('/api/requests') // => 'https://api.example.com/api/requests'
 */
export const getApiUrl = (path: string): string => {
  // Normalize path: ensure it starts with a slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // If no API_BASE_URL is configured, use relative paths
  // In development, Vite proxy will forward /api/* to the backend
  if (!API_BASE_URL) {
    return cleanPath;
  }

  // Construct full URL: remove trailing slash from base and combine with path
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  return `${baseUrl}${cleanPath}`;
};

/**
 * Common API endpoints for easy access
 */
export const API_ENDPOINTS = {
  // Request Management
  SUBMIT_REQUEST: "/api/requests",
  VIEW_FOR_REQUESTOR: "/api/requests/viewForRequestor",
  VIEW_PENDING: "/api/requests/viewPending",
  VIEW_ALL: "/api/requests/viewAll",

  // Report/Metrics
  REPORT_SUMMARY: "/api/report/summary",

  // Future endpoints can be added here
  // USER_PROFILE: "/api/users/profile",
  // ADMIN: "/api/admin",
} as const;

/**
 * Get a typed API endpoint URL
 *
 * @param endpoint - Key from API_ENDPOINTS
 * @returns Complete URL for the endpoint
 *
 * @example
 * getEndpointUrl('SUBMIT_REQUEST') // => 'http://localhost:8082/api/requests'
 */
export const getEndpointUrl = (
  endpoint: keyof typeof API_ENDPOINTS
): string => {
  return getApiUrl(API_ENDPOINTS[endpoint]);
};

/**
 * Log current API configuration (useful for debugging)
 */
export const logApiConfig = (): void => {
  // eslint-disable-next-line no-console
  console.group("📡 API Configuration");
  // eslint-disable-next-line no-console
  console.table(getEnvironmentInfo());
  // eslint-disable-next-line no-console
  console.log("Example endpoint:", getApiUrl("/api/requests"));
  // eslint-disable-next-line no-console
  console.groupEnd();
};
