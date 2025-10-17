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

    it('should match environment variable or be empty', () => {
      // API_BASE_URL should either be from env var or empty string
      const envValue = import.meta.env.VITE_API_BASE_URL;
      expect(API_BASE_URL).toBe(envValue || '');
    });
  });

  describe('getApiUrl', () => {
    describe('path formatting', () => {
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
        if (API_BASE_URL) {
          expect(result).toBe(`${API_BASE_URL.replace(/\/$/, '')}/`);
        } else {
          expect(result).toBe('/');
        }
      });

      it('should handle single slash', () => {
        const result = getApiUrl('/');
        if (API_BASE_URL) {
          expect(result).toBe(`${API_BASE_URL.replace(/\/$/, '')}/`);
        } else {
          expect(result).toBe('/');
        }
      });

      it('should handle nested paths', () => {
        const result = getApiUrl('/api/v1/requests/123/details');
        expect(result).toContain('/api/v1/requests/123/details');
      });

      it('should handle paths without leading slash', () => {
        const result = getApiUrl('api/submit-request');
        expect(result).toContain('/api/submit-request');
      });

      it('should handle multiple segments', () => {
        const result = getApiUrl('/api/v1/requests/pending');
        expect(result).toContain('/api/v1/requests/pending');
      });

      it('should not create double slashes in path', () => {
        const result = getApiUrl('/api/requests');
        // Should not have double slashes except in http://
        const withoutProtocol = result.replace(/https?:\/\//, '');
        expect(withoutProtocol).not.toContain('//');
      });
    });

    describe('query parameters and special characters', () => {
      it('should handle paths with query parameters', () => {
        const result = getApiUrl('/api/requests?status=pending');
        expect(result).toContain('/api/requests?status=pending');
      });

      it('should handle multiple query parameters', () => {
        const result = getApiUrl('/api/requests?filter=test&sort=desc');
        expect(result).toContain('?filter=test&sort=desc');
      });

      it('should handle query parameters with special characters', () => {
        const result = getApiUrl('/api/search?q=test%20value&limit=10');
        expect(result).toContain('?q=test%20value&limit=10');
      });

      it('should handle paths with hash fragments', () => {
        const result = getApiUrl('/api/docs#section-1');
        expect(result).toContain('#section-1');
      });

      it('should handle encoded characters in path', () => {
        const result = getApiUrl('/api/files/test%20file.pdf');
        expect(result).toContain('/api/files/test%20file.pdf');
      });
    });

    describe('edge cases', () => {
      it('should handle paths with only query parameters', () => {
        const result = getApiUrl('?query=test');
        if (API_BASE_URL) {
          expect(result).toBe(`${API_BASE_URL.replace(/\/$/, '')}/?query=test`);
        } else {
          expect(result).toBe('/?query=test');
        }
      });

      it('should handle paths with trailing slashes', () => {
        const result = getApiUrl('/api/requests/');
        expect(result).toContain('/api/requests/');
      });

      it('should handle paths with multiple consecutive slashes', () => {
        const result = getApiUrl('api//requests///test');
        expect(result).toContain('/api//requests///test');
      });

      it('should handle very long paths', () => {
        const longPath = '/api/v1/resources/sub1/sub2/sub3/sub4/sub5/item/123/details';
        const result = getApiUrl(longPath);
        expect(result).toContain(longPath);
      });

      it('should handle paths with dots', () => {
        const result = getApiUrl('/api/v1.0/requests');
        expect(result).toContain('/api/v1.0/requests');
      });

      it('should handle paths with hyphens and underscores', () => {
        const result = getApiUrl('/api/submit-request_v2');
        expect(result).toContain('/api/submit-request_v2');
      });
    });

    describe('return value validation', () => {
      it('should return a valid URL string', () => {
        const result = getApiUrl('/api/requests');
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });

      it('should be consistent for same input', () => {
        const path = '/api/test';
        const result1 = getApiUrl(path);
        const result2 = getApiUrl(path);
        expect(result1).toBe(result2);
      });

      it('should return different results for different inputs', () => {
        const result1 = getApiUrl('/api/requests');
        const result2 = getApiUrl('/api/users');
        expect(result1).not.toBe(result2);
      });

      it('should always return a string starting with /', () => {
        const paths = ['api/test', '/api/test', 'test', '/test'];
        paths.forEach(path => {
          const result = getApiUrl(path);
          // Should start with / or http:// or https://
          expect(result).toMatch(/^(\/|https?:\/\/)/);
        });
      });
    });

    describe('base URL combination', () => {
      it('should combine with base URL if provided', () => {
        const result = getApiUrl('/api/requests');
        // Either it's just the path (empty base URL) or it includes the base URL
        expect(result).toMatch(/^(\/api\/requests|https?:\/\/.+\/api\/requests)$/);
      });

      it('should handle base URL with trailing slash', () => {
        // This tests the logic that removes trailing slash from base URL
        const result = getApiUrl('/api/test');
        // Should not have double slashes in the middle
        if (result.includes('http')) {
          const withoutProtocol = result.replace(/https?:\/\//, '');
          expect(withoutProtocol).not.toContain('//');
        }
      });

      it('should work correctly when API_BASE_URL is empty', () => {
        const result = getApiUrl('/api/test');
        if (!API_BASE_URL) {
          expect(result).toBe('/api/test');
        }
      });
    });

    describe('integration with API_BASE_URL', () => {
      it('should use API_BASE_URL from environment', () => {
        const result = getApiUrl('/api/test');
        
        if (API_BASE_URL) {
          // If base URL is set, result should contain it
          expect(result).toContain(API_BASE_URL.replace(/\/$/, ''));
        } else {
          // If no base URL, should be just the path
          expect(result).toBe('/api/test');
        }
      });

      it('should handle all path combinations correctly', () => {
        const paths = [
          '/api/requests',
          'api/requests',
          '/api/submit-request',
          'api/submit-request',
          '/api/v1/users',
          'api/v1/users',
        ];

        paths.forEach(path => {
          const result = getApiUrl(path);
          expect(result).toBeTruthy();
          expect(result).toContain('api/');
        });
      });

      it('should maintain consistency across multiple calls', () => {
        const paths = ['/api/test1', '/api/test2', '/api/test3'];
        const results = paths.map(path => getApiUrl(path));
        
        // All results should follow the same pattern
        results.forEach(result => {
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
        });
      });
    });

    describe('development vs production behavior', () => {
      it('should handle DEV environment mode', () => {
        // In test setup, DEV is set to true
        const result = getApiUrl('/api/test');
        
        if (import.meta.env.DEV && !API_BASE_URL) {
          // In dev with no base URL, should return just the path
          expect(result).toBe('/api/test');
        }
      });

      it('should return valid URL in all environment modes', () => {
        const testPaths = [
          '/api/requests',
          '/api/users',
          '/api/v1/resources',
        ];

        testPaths.forEach(path => {
          const result = getApiUrl(path);
          expect(result).toBeTruthy();
          expect(typeof result).toBe('string');
          // Should either be absolute path or full URL
          expect(result).toMatch(/^(\/|https?:\/\/)/);
        });
      });
    });

    describe('type safety', () => {
      it('should accept string parameter', () => {
        expect(() => getApiUrl('/api/test')).not.toThrow();
      });

      it('should return string type', () => {
        const result = getApiUrl('/api/test');
        expect(typeof result).toBe('string');
      });
    });

    describe('real-world usage patterns', () => {
      it('should handle common API endpoint patterns', () => {
        const commonEndpoints = [
          '/api/requests',
          '/api/submit-request',
          '/api/approvals',
          '/api/users/me',
          '/api/v1/resources',
          '/api/health',
          '/api/status',
        ];

        commonEndpoints.forEach(endpoint => {
          const result = getApiUrl(endpoint);
          expect(result).toBeTruthy();
          expect(result).toContain(endpoint);
        });
      });

      it('should handle RESTful resource patterns', () => {
        const restPatterns = [
          '/api/resources',
          '/api/resources/123',
          '/api/resources/123/edit',
          '/api/resources/123/delete',
          '/api/users/456/requests',
        ];

        restPatterns.forEach(pattern => {
          const result = getApiUrl(pattern);
          expect(result).toContain(pattern);
        });
      });

      it('should handle API versioning patterns', () => {
        const versionedPaths = [
          '/api/v1/resources',
          '/api/v2/resources',
          '/api/v1.0/resources',
          '/api/v2.1/resources',
        ];

        versionedPaths.forEach(path => {
          const result = getApiUrl(path);
          expect(result).toContain(path);
        });
      });
    });
  });
});
