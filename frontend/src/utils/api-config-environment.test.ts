/**
 * Environment-specific tests for API configuration
 * Based on acceptance criteria from API_CONFIG_GUIDE.md
 * 
 * These tests validate the environment isolation requirements:
 * "Given: The site exists on localhost, IL-2, and IL-5
 *  When: A user interacts on either side
 *  Then: They only interact with the corresponding environment"
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  API_ENDPOINTS,
  getApiUrl,
  getEndpointUrl,
  getEnvironmentInfo,
  getIsBypassAuth,
  logApiConfig,
} from "./api-config";
import {
  cleanupEnvironmentMocks,
  getEnvironmentTestPatterns,
  getExpectedConfig,
  mockBuildMode,
  mockDebugAdvanaEnvironment,
  mockEnvironment,
  testCrossEnvironmentIsolation,
  validateEnvironmentComplete,
} from "./test-utils";

describe("API Configuration Environment Isolation", () => {
  afterEach(() => {
    cleanupEnvironmentMocks();
  });

  describe("Acceptance Criteria: Environment Isolation", () => {
    it("should ensure localhost, IL-2, and IL-5 environments are completely isolated", () => {
      const isolationTest = testCrossEnvironmentIsolation((_env) => {
        const config = getEnvironmentInfo();
        const endpoint = getApiUrl('/api/requests');
        
        return {
          mode: config.mode,
          apiBaseUrl: config.apiBaseUrl,
          bypassAuth: config.bypassAuth,
          endpoint: endpoint
        };
      });

      // Verify isolation between environments
      expect(isolationTest.isolation.localhostDiffersFromIl2).toBe(true);
      
      // Verify localhost uses relative paths
      expect(isolationTest.localhost.endpoint).toBe('/api/requests');
      expect(isolationTest.localhost.bypassAuth).toBe(true);
      
      // Verify IL-2 uses absolute URLs
      expect(isolationTest.il2.endpoint).toContain('https://advana-marketplace-monolith-node.dev.mtt.cdao.us');
      expect(isolationTest.il2.bypassAuth).toBe(false);
      
      // Verify IL-5 uses absolute URLs but different mode
      expect(isolationTest.il5.endpoint).toContain('https://advana-marketplace-monolith-node.dev.mtt.cdao.us');
      expect(isolationTest.il5.bypassAuth).toBe(false);
      expect(isolationTest.il5.mode).not.toBe(isolationTest.il2.mode);
    });

    it("should prevent cross-environment API leakage", () => {
      const testEndpoints = Object.keys(API_ENDPOINTS) as Array<keyof typeof API_ENDPOINTS>;
      
      // Test each environment with all endpoints
      testEndpoints.forEach(endpointKey => {
        const isolationResults = testCrossEnvironmentIsolation(() => {
          return getEndpointUrl(endpointKey);
        });
        
        // Localhost should always be relative
        expect(isolationResults.localhost.startsWith('/')).toBe(true);
        expect(isolationResults.localhost).not.toContain('http');
        
        // IL-2 and IL-5 should be absolute URLs
        expect(isolationResults.il2).toContain('https://');
        expect(isolationResults.il5).toContain('https://');
        
        // No environment should leak into another
        expect(isolationResults.localhost).not.toBe(isolationResults.il2);
      });
    });
  });

  describe("Browser Console Debugging Validation", () => {
    beforeEach(() => {
      mockDebugAdvanaEnvironment();
    });

    it("should provide debugAdvana.* utilities for localhost environment validation", () => {
      mockEnvironment('localhost');
      
      const envInfo = getEnvironmentInfo();
      
      // Simulate browser console validation from API_CONFIG_GUIDE.md
      expect(envInfo.mode).toBe('development');
      expect(envInfo.apiBaseUrl).toBe('');
      expect(envInfo.bypassAuth).toBe(true);
      
      const testEndpoint = getApiUrl('/api/requests');
      expect(testEndpoint).toBe('/api/requests'); // Relative path for proxy
    });

    it("should provide debugAdvana.* utilities for IL-2 environment validation", () => {
      mockEnvironment('il2');
      
      const envInfo = getEnvironmentInfo();
      
      // Expected values from API_CONFIG_GUIDE.md
      expect(envInfo.mode).toBe('il2');
      expect(envInfo.apiBaseUrl).toBe('https://advana-marketplace-monolith-node.dev.mtt.cdao.us');
      expect(envInfo.bypassAuth).toBe(false);
      
      const testEndpoint = getApiUrl('/api/requests');
      expect(testEndpoint).toBe('https://advana-marketplace-monolith-node.dev.mtt.cdao.us/api/requests');
    });

    it("should provide debugAdvana.* utilities for IL-5 environment validation", () => {
      mockEnvironment('il5');
      
      const envInfo = getEnvironmentInfo();
      
      // Expected values from API_CONFIG_GUIDE.md
      expect(envInfo.mode).toBe('il5');
      expect(envInfo.apiBaseUrl).toBe('https://advana-marketplace-monolith-node.dev.mtt.cdao.us');
      expect(envInfo.bypassAuth).toBe(false);
      
      const testEndpoint = getApiUrl('/api/requests');
      expect(testEndpoint).toBe('https://advana-marketplace-monolith-node.dev.mtt.cdao.us/api/requests');
      
      // Verify environment isolation
      expect(envInfo.mode).not.toBe('il2');
      expect(envInfo.mode).not.toBe('development');
    });
  });

  describe("Build Mode Compatibility Tests", () => {
    it("should work correctly with npm run dev (development mode)", () => {
      mockBuildMode('dev');
      
      const patterns = getEnvironmentTestPatterns().localhost;
      const testPaths = ['/api/requests', '/api/users', '/api/health'];
      
      testPaths.forEach(path => {
        const result = getApiUrl(path);
        expect(result).toMatch(patterns.urlPattern);
        
        patterns.shouldNotContain.forEach(forbidden => {
          expect(result).not.toContain(forbidden);
        });
        
        patterns.shouldContain.forEach(required => {
          expect(result).toContain(required);
        });
      });
      
      expect(getIsBypassAuth()).toBe(patterns.authBypass);
      expect(getEnvironmentInfo().mode).toBe(patterns.mode);
    });

    it("should work correctly with npm run build:il2", () => {
      mockBuildMode('build:il2');
      
      const patterns = getEnvironmentTestPatterns().il2;
      const testPaths = ['/api/requests', '/api/users', '/api/health'];
      
      testPaths.forEach(path => {
        const result = getApiUrl(path);
        expect(result).toMatch(patterns.urlPattern);
        
        patterns.shouldContain.forEach(required => {
          expect(result).toContain(required);
        });
      });
      
      expect(getIsBypassAuth()).toBe(patterns.authBypass);
      expect(getEnvironmentInfo().mode).toBe(patterns.mode);
    });

    it("should work correctly with npm run build:il5", () => {
      mockBuildMode('build:il5');
      
      const patterns = getEnvironmentTestPatterns().il5;
      const testPaths = ['/api/requests', '/api/users', '/api/health'];
      
      testPaths.forEach(path => {
        const result = getApiUrl(path);
        expect(result).toMatch(patterns.urlPattern);
        
        patterns.shouldContain.forEach(required => {
          expect(result).toContain(required);
        });
      });
      
      expect(getIsBypassAuth()).toBe(patterns.authBypass);
      expect(getEnvironmentInfo().mode).toBe(patterns.mode);
    });
  });

  describe("Network Tab Verification Patterns", () => {
    it("should generate localhost URLs that work with Vite proxy", () => {
      mockEnvironment('localhost');
      
      const testEndpoints = Object.keys(API_ENDPOINTS) as Array<keyof typeof API_ENDPOINTS>;
      testEndpoints.forEach(endpoint => {
        const url = getEndpointUrl(endpoint);
        
        // Should be relative paths for proxy
        expect(url.startsWith('/')).toBe(true);
        expect(url).not.toContain('localhost:8082'); // Proxy handles this
        expect(url).not.toContain('http'); // No protocol in relative URLs
      });
    });

    it("should generate IL-2 URLs that bypass proxy", () => {
      mockEnvironment('il2');
      
      const testEndpoints = Object.keys(API_ENDPOINTS) as Array<keyof typeof API_ENDPOINTS>;
      testEndpoints.forEach(endpoint => {
        const url = getEndpointUrl(endpoint);
        
        // Should be absolute URLs
        expect(url).toContain('https://');
        expect(url).toContain('advana-marketplace-monolith-node.dev.mtt.cdao.us');
        expect(url).toContain(API_ENDPOINTS[endpoint]);
      });
    });

    it("should handle CORS correctly for each environment", () => {
      // Localhost: No CORS issues due to proxy
      mockEnvironment('localhost');
      const localhostUrl = getApiUrl('/api/test');
      expect(localhostUrl).toBe('/api/test'); // Same origin via proxy
      
      // IL-2: Direct API calls, CORS handled by backend
      mockEnvironment('il2');
      const il2Url = getApiUrl('/api/test');
      expect(il2Url).toContain('https://advana-marketplace-monolith-node.dev.mtt.cdao.us');
      // Different origin, requires proper CORS headers
    });
  });

  describe("Environment Variable Integration", () => {
    it("should properly load environment-specific variables", () => {
      const environments: Array<'localhost' | 'il2' | 'il5'> = ['localhost', 'il2', 'il5'];
      
      environments.forEach(env => {
        mockEnvironment(env);
        const expected = getExpectedConfig(env);
        const actual = getEnvironmentInfo();
        
        const validation = validateEnvironmentComplete(env, {
          ...actual,
          endpoint: getApiUrl('/api/requests')
        });
        
        expect(validation.isValid()).toBe(true);
        expect(actual.mode).toBe(expected.expectedMode);
        expect(actual.apiBaseUrl).toBe(expected.expectedApiBaseUrl);
        expect(actual.bypassAuth).toBe(expected.expectedBypassAuth);
      });
    });

    it("should maintain consistency across multiple function calls", () => {
      mockEnvironment('il2');
      
      // Call multiple times and ensure consistency
      const results = Array.from({ length: 5 }, () => ({
        envInfo: getEnvironmentInfo(),
        apiUrl: getApiUrl('/api/requests'),
        endpointUrl: getEndpointUrl('SUBMIT_REQUEST'),
        bypassAuth: getIsBypassAuth()
      }));
      
      // All results should be identical
      results.forEach(result => {
        expect(result.envInfo).toEqual(results[0].envInfo);
        expect(result.apiUrl).toBe(results[0].apiUrl);
        expect(result.endpointUrl).toBe(results[0].endpointUrl);
        expect(result.bypassAuth).toBe(results[0].bypassAuth);
      });
    });
  });

  describe("Integration with logApiConfig", () => {
    it("should provide debugging output for each environment", () => {
      const environments: Array<'localhost' | 'il2' | 'il5'> = ['localhost', 'il2', 'il5'];
      
      environments.forEach(env => {
        mockEnvironment(env);
        
        // Should not throw in any environment
        expect(() => logApiConfig()).not.toThrow();
        
        // Verify environment state is correct for debugging
        const envInfo = getEnvironmentInfo();
        const expected = getExpectedConfig(env);
        
        expect(envInfo.mode).toBe(expected.expectedMode);
        expect(envInfo.apiBaseUrl).toBe(expected.expectedApiBaseUrl);
        expect(envInfo.bypassAuth).toBe(expected.expectedBypassAuth);
      });
    });
  });

  describe("Future IL-5 Endpoint Migration", () => {
    it("should be ready for IL-5 endpoint changes", () => {
      mockEnvironment('il5');
      
      // Currently IL-5 uses same endpoints as IL-2
      const il5Endpoint = getApiUrl('/api/requests');
      expect(il5Endpoint).toBe('https://advana-marketplace-monolith-node.dev.mtt.cdao.us/api/requests');
      
      // But has different mode identifier for future separation
      expect(getEnvironmentInfo().mode).toBe('il5');
      
      // When IL-5 gets its own endpoints, this test will need updating
      // but the environment isolation will already be in place
    });

    it("should maintain proper separation when IL-5 gets unique endpoints", () => {
      // Test the pattern for when IL-5 eventually gets different endpoints
      
      // Mock future IL-5 with different URL
      vi.stubEnv('VITE_API_BASE_URL', 'https://advana-marketplace-monolith-node.il5.mtt.cdao.us');
      vi.stubEnv('MODE', 'il5');
      
      const il5Url = getApiUrl('/api/requests');
      expect(il5Url).toBe('https://advana-marketplace-monolith-node.il5.mtt.cdao.us/api/requests');
      
      // Clean up
      vi.unstubAllEnvs();
      
      // Verify IL-2 still works independently
      mockEnvironment('il2');
      const il2Url = getApiUrl('/api/requests');
      expect(il2Url).toBe('https://advana-marketplace-monolith-node.dev.mtt.cdao.us/api/requests');
      expect(il2Url).not.toBe(il5Url);
    });
  });
});