// API Configuration
// Base configuration for API calls
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Get the complete API endpoint URL
 * @param path - The API path (e.g., '/api/requests')
 * @returns Complete URL for the API endpoint
 */
export const getApiUrl = (path: string): string => {
  // Remove leading slash from path if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // If API_BASE_URL is empty, check if we're in development or production
  if (!API_BASE_URL) {
    // In development with Vite dev server, return just the path (for Vite proxy)
    if (import.meta.env.DEV) {
      return cleanPath;
    }
    // In production/Docker, assume backend is on same host but different port
    // or return just the path if backend is served from same origin
    return cleanPath;
  }

  // Remove trailing slash from base URL and combine with path
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  return `${baseUrl}${cleanPath}`;
};
