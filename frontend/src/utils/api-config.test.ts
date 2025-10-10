import { describe, it, expect } from 'vitest';
import { API_BASE_URL, getApiUrl } from './api-config';

describe('api-config', () => {
  describe('API_BASE_URL', () => {
    it('should be defined', () => {
      expect(API_BASE_URL).toBeDefined();
    });

    it('should be a string', () => {
      expect(typeof API_BASE_URL).toBe('string');
    });
  });

  describe('getApiUrl', () => {
    it('should add leading slash if path does not have one', () => {
      const result = getApiUrl('api/requests');
      expect(result).toContain('/api/requests');
    });

    it('should preserve leading slash if path already has one', () => {
      const result = getApiUrl('/api/requests');
      expect(result).toContain('/api/requests');
    });

    it('should handle empty path', () => {
      const result = getApiUrl('');
      expect(result).toContain('/');
    });

    it('should handle nested paths', () => {
      const result = getApiUrl('/api/v1/requests/123/details');
      expect(result).toContain('/api/v1/requests/123/details');
    });

    it('should return a valid URL string', () => {
      const result = getApiUrl('/api/requests');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle paths with query parameters', () => {
      const result = getApiUrl('/api/requests?status=pending');
      expect(result).toContain('/api/requests?status=pending');
    });

    it('should handle paths without leading slash', () => {
      const result = getApiUrl('api/submit-request');
      expect(result).toContain('/api/submit-request');
    });

    it('should combine with base URL if provided', () => {
      const result = getApiUrl('/api/requests');
      // Either it's just the path (empty base URL) or it includes the base URL
      expect(result).toMatch(/^(\/api\/requests|https?:\/\/.+\/api\/requests)$/);
    });

    it('should not create double slashes', () => {
      const result = getApiUrl('/api/requests');
      // Should not have double slashes except in http://
      const withoutProtocol = result.replace(/https?:\/\//, '');
      expect(withoutProtocol).not.toContain('//');
    });

    it('should handle multiple segments', () => {
      const result = getApiUrl('/api/v1/requests/pending');
      expect(result).toContain('/api/v1/requests/pending');
    });

    it('should be consistent for same input', () => {
      const path = '/api/test';
      const result1 = getApiUrl(path);
      const result2 = getApiUrl(path);
      expect(result1).toBe(result2);
    });

    it('should handle special characters in path', () => {
      const result = getApiUrl('/api/requests?filter=test&sort=desc');
      expect(result).toContain('?filter=test&sort=desc');
    });
  });

  describe('getApiUrl integration with API_BASE_URL', () => {
    it('should use API_BASE_URL from environment', () => {
      const result = getApiUrl('/api/test');
      
      if (API_BASE_URL) {
        // If base URL is set, result should start with it
        expect(result).toContain(API_BASE_URL);
      } else {
        // If no base URL, should be just the path
        expect(result).toBe('/api/test');
      }
    });

    it('should handle all combinations correctly', () => {
      const paths = [
        '/api/requests',
        'api/requests',
        '/api/submit-request',
        'api/submit-request',
      ];

      paths.forEach(path => {
        const result = getApiUrl(path);
        expect(result).toBeTruthy();
        expect(result).toContain('api/');
      });
    });
  });
});
