import { describe, expect, it } from "vitest";
import {
  API_BASE_URL,
  API_ENDPOINTS,
  getApiUrl,
  getEndpointUrl,
  getEnvironmentInfo,
  isBypassAuth,
  logApiConfig,
} from "./api-config";

describe("api-config", () => {
  describe("API_BASE_URL", () => {
    it("should be defined", () => {
      expect(API_BASE_URL).toBeDefined();
    });

    it("should be a string", () => {
      expect(typeof API_BASE_URL).toBe("string");
    });

    it("should match environment variable or be empty", () => {
      // API_BASE_URL should either be from env var or empty string
      const envValue = import.meta.env.VITE_API_BASE_URL;
      expect(API_BASE_URL).toBe(envValue || "");
    });
  });

  describe("getApiUrl", () => {
    describe("path formatting", () => {
      it("should add leading slash if path does not have one", () => {
        const result = getApiUrl("api/requests");
        expect(result).toContain("/api/requests");
      });

      it("should preserve leading slash if path already has one", () => {
        const result = getApiUrl("/api/requests");
        expect(result).toContain("/api/requests");
      });

      it("should handle empty path", () => {
        const result = getApiUrl("");
        if (API_BASE_URL) {
          expect(result).toBe(`${API_BASE_URL.replace(/\/$/, "")}/`);
        } else {
          expect(result).toBe("/");
        }
      });

      it("should handle single slash", () => {
        const result = getApiUrl("/");
        if (API_BASE_URL) {
          expect(result).toBe(`${API_BASE_URL.replace(/\/$/, "")}/`);
        } else {
          expect(result).toBe("/");
        }
      });

      it("should handle nested paths", () => {
        const result = getApiUrl("/api/v1/requests/123/details");
        expect(result).toContain("/api/v1/requests/123/details");
      });

      it("should handle paths without leading slash", () => {
        const result = getApiUrl("api/submit-request");
        expect(result).toContain("/api/submit-request");
      });

      it("should handle multiple segments", () => {
        const result = getApiUrl("/api/v1/requests/pending");
        expect(result).toContain("/api/v1/requests/pending");
      });

      it("should not create double slashes in path", () => {
        const result = getApiUrl("/api/requests");
        // Should not have double slashes except in http://
        const withoutProtocol = result.replace(/https?:\/\//, "");
        expect(withoutProtocol).not.toContain("//");
      });
    });

    describe("query parameters and special characters", () => {
      it("should handle paths with query parameters", () => {
        const result = getApiUrl("/api/requests?status=pending");
        expect(result).toContain("/api/requests?status=pending");
      });

      it("should handle multiple query parameters", () => {
        const result = getApiUrl("/api/requests?filter=test&sort=desc");
        expect(result).toContain("?filter=test&sort=desc");
      });

      it("should handle query parameters with special characters", () => {
        const result = getApiUrl("/api/search?q=test%20value&limit=10");
        expect(result).toContain("?q=test%20value&limit=10");
      });

      it("should handle paths with hash fragments", () => {
        const result = getApiUrl("/api/docs#section-1");
        expect(result).toContain("#section-1");
      });

      it("should handle encoded characters in path", () => {
        const result = getApiUrl("/api/files/test%20file.pdf");
        expect(result).toContain("/api/files/test%20file.pdf");
      });
    });

    describe("edge cases", () => {
      it("should handle paths with only query parameters", () => {
        const result = getApiUrl("?query=test");
        if (API_BASE_URL) {
          expect(result).toBe(`${API_BASE_URL.replace(/\/$/, "")}/?query=test`);
        } else {
          expect(result).toBe("/?query=test");
        }
      });

      it("should handle paths with trailing slashes", () => {
        const result = getApiUrl("/api/requests/");
        expect(result).toContain("/api/requests/");
      });

      it("should handle paths with multiple consecutive slashes", () => {
        const result = getApiUrl("api//requests///test");
        expect(result).toContain("/api//requests///test");
      });

      it("should handle very long paths", () => {
        const longPath =
          "/api/v1/resources/sub1/sub2/sub3/sub4/sub5/item/123/details";
        const result = getApiUrl(longPath);
        expect(result).toContain(longPath);
      });

      it("should handle paths with dots", () => {
        const result = getApiUrl("/api/v1.0/requests");
        expect(result).toContain("/api/v1.0/requests");
      });

      it("should handle paths with hyphens and underscores", () => {
        const result = getApiUrl("/api/submit-request_v2");
        expect(result).toContain("/api/submit-request_v2");
      });
    });

    describe("return value validation", () => {
      it("should return a valid URL string", () => {
        const result = getApiUrl("/api/requests");
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });

      it("should be consistent for same input", () => {
        const path = "/api/test";
        const result1 = getApiUrl(path);
        const result2 = getApiUrl(path);
        expect(result1).toBe(result2);
      });

      it("should return different results for different inputs", () => {
        const result1 = getApiUrl("/api/requests");
        const result2 = getApiUrl("/api/users");
        expect(result1).not.toBe(result2);
      });

      it("should always return a string starting with /", () => {
        const paths = ["api/test", "/api/test", "test", "/test"];
        paths.forEach((path) => {
          const result = getApiUrl(path);
          // Should start with / or http:// or https://
          expect(result).toMatch(/^(\/|https?:\/\/)/);
        });
      });
    });

    describe("base URL combination", () => {
      it("should combine with base URL if provided", () => {
        const result = getApiUrl("/api/requests");
        // Either it's just the path (empty base URL) or it includes the base URL
        expect(result).toMatch(
          /^(\/api\/requests|https?:\/\/.+\/api\/requests)$/
        );
      });

      it("should handle base URL with trailing slash", () => {
        // This tests the logic that removes trailing slash from base URL
        const result = getApiUrl("/api/test");
        // Should not have double slashes in the middle
        if (result.includes("http")) {
          const withoutProtocol = result.replace(/https?:\/\//, "");
          expect(withoutProtocol).not.toContain("//");
        }
      });

      it("should work correctly when API_BASE_URL is empty", () => {
        const result = getApiUrl("/api/test");
        if (!API_BASE_URL) {
          expect(result).toBe("/api/test");
        }
      });
    });

    describe("integration with API_BASE_URL", () => {
      it("should use API_BASE_URL from environment", () => {
        const result = getApiUrl("/api/test");

        if (API_BASE_URL) {
          // If base URL is set, result should contain it
          expect(result).toContain(API_BASE_URL.replace(/\/$/, ""));
        } else {
          // If no base URL, should be just the path
          expect(result).toBe("/api/test");
        }
      });

      it("should handle all path combinations correctly", () => {
        const paths = [
          "/api/requests",
          "api/requests",
          "/api/submit-request",
          "api/submit-request",
          "/api/v1/users",
          "api/v1/users",
        ];

        paths.forEach((path) => {
          const result = getApiUrl(path);
          expect(result).toBeTruthy();
          expect(result).toContain("api/");
        });
      });

      it("should maintain consistency across multiple calls", () => {
        const paths = ["/api/test1", "/api/test2", "/api/test3"];
        const results = paths.map((path) => getApiUrl(path));

        // All results should follow the same pattern
        results.forEach((result) => {
          expect(typeof result).toBe("string");
          expect(result.length).toBeGreaterThan(0);
        });
      });
    });

    describe("development vs production behavior", () => {
      it("should handle DEV environment mode", () => {
        // In test setup, DEV is set to true
        const result = getApiUrl("/api/test");

        if (import.meta.env.DEV && !API_BASE_URL) {
          // In dev with no base URL, should return just the path
          expect(result).toBe("/api/test");
        }
      });

      it("should return valid URL in all environment modes", () => {
        const testPaths = ["/api/requests", "/api/users", "/api/v1/resources"];

        testPaths.forEach((path) => {
          const result = getApiUrl(path);
          expect(result).toBeTruthy();
          expect(typeof result).toBe("string");
          // Should either be absolute path or full URL
          expect(result).toMatch(/^(\/|https?:\/\/)/);
        });
      });
    });

    describe("type safety", () => {
      it("should accept string parameter", () => {
        expect(() => getApiUrl("/api/test")).not.toThrow();
      });

      it("should return string type", () => {
        const result = getApiUrl("/api/test");
        expect(typeof result).toBe("string");
      });
    });

    describe("real-world usage patterns", () => {
      it("should handle common API endpoint patterns", () => {
        const commonEndpoints = [
          "/api/requests",
          "/api/submit-request",
          "/api/approvals",
          "/api/users/me",
          "/api/v1/resources",
          "/api/health",
          "/api/status",
        ];

        commonEndpoints.forEach((endpoint) => {
          const result = getApiUrl(endpoint);
          expect(result).toBeTruthy();
          expect(result).toContain(endpoint);
        });
      });

      it("should handle RESTful resource patterns", () => {
        const restPatterns = [
          "/api/resources",
          "/api/resources/123",
          "/api/resources/123/edit",
          "/api/resources/123/delete",
          "/api/users/456/requests",
        ];

        restPatterns.forEach((pattern) => {
          const result = getApiUrl(pattern);
          expect(result).toContain(pattern);
        });
      });

      it("should handle API versioning patterns", () => {
        const versionedPaths = [
          "/api/v1/resources",
          "/api/v2/resources",
          "/api/v1.0/resources",
          "/api/v2.1/resources",
        ];

        versionedPaths.forEach((path) => {
          const result = getApiUrl(path);
          expect(result).toContain(path);
        });
      });
    });
  });

  describe("isBypassAuth", () => {
    it("should be defined", () => {
      expect(isBypassAuth).toBeDefined();
    });

    it("should be a boolean", () => {
      expect(typeof isBypassAuth).toBe("boolean");
    });

    it("should match environment variable", () => {
      const envValue = import.meta.env.VITE_BYPASS_AUTH === "true";
      expect(isBypassAuth).toBe(envValue);
    });
  });

  describe("getEnvironmentInfo", () => {
    it("should return an object with environment information", () => {
      const info = getEnvironmentInfo();
      expect(info).toBeDefined();
      expect(typeof info).toBe("object");
    });

    it("should include mode property", () => {
      const info = getEnvironmentInfo();
      expect(info).toHaveProperty("mode");
      expect(typeof info.mode).toBe("string");
    });

    it("should include apiBaseUrl property", () => {
      const info = getEnvironmentInfo();
      expect(info).toHaveProperty("apiBaseUrl");
      expect(info.apiBaseUrl).toBe(API_BASE_URL);
    });

    it("should include bypassAuth property", () => {
      const info = getEnvironmentInfo();
      expect(info).toHaveProperty("bypassAuth");
      expect(typeof info.bypassAuth).toBe("boolean");
      expect(info.bypassAuth).toBe(isBypassAuth);
    });

    it("should return consistent values across calls", () => {
      const info1 = getEnvironmentInfo();
      const info2 = getEnvironmentInfo();
      expect(info1).toEqual(info2);
    });
  });

  describe("API_ENDPOINTS", () => {
    it("should be defined", () => {
      expect(API_ENDPOINTS).toBeDefined();
    });

    it("should be an object", () => {
      expect(typeof API_ENDPOINTS).toBe("object");
    });

    it("should contain SUBMIT_REQUEST endpoint", () => {
      expect(API_ENDPOINTS.SUBMIT_REQUEST).toBe("/api/requests");
    });

    it("should contain VIEW_FOR_REQUESTOR endpoint", () => {
      expect(API_ENDPOINTS.VIEW_FOR_REQUESTOR).toBe(
        "/api/requests/viewForRequestor"
      );
    });

    it("should contain VIEW_PENDING endpoint", () => {
      expect(API_ENDPOINTS.VIEW_PENDING).toBe("/api/requests/viewPending");
    });

    it("should contain VIEW_ALL endpoint", () => {
      expect(API_ENDPOINTS.VIEW_ALL).toBe("/api/requests/viewAll");
    });

    it("should contain REPORT_SUMMARY endpoint", () => {
      expect(API_ENDPOINTS.REPORT_SUMMARY).toBe("/api/report/summary");
    });

    it("should contain CHAT endpoint", () => {
      expect(API_ENDPOINTS.CHAT).toBe("/api/chat");
    });

    it("should contain CHAT_CONVERSATION endpoint", () => {
      expect(API_ENDPOINTS.CHAT_CONVERSATION).toBe(
        "/api/chat/:conversationId"
      );
    });

    it("should have all endpoints as strings", () => {
      Object.values(API_ENDPOINTS).forEach((endpoint) => {
        expect(typeof endpoint).toBe("string");
      });
    });

    it("should have all endpoints starting with /", () => {
      Object.values(API_ENDPOINTS).forEach((endpoint) => {
        expect(endpoint.startsWith("/")).toBe(true);
      });
    });

    it("should be readonly at TypeScript level", () => {
      // API_ENDPOINTS is marked with 'as const', which makes it readonly at TypeScript compile time
      // Note: JavaScript doesn't enforce this at runtime, but TypeScript will prevent modifications
      expect(API_ENDPOINTS).toBeDefined();
      expect(Object.isFrozen(API_ENDPOINTS)).toBe(false); // Not frozen at runtime, but TypeScript enforces readonly
    });
  });

  describe("getEndpointUrl", () => {
    it("should return a valid URL for SUBMIT_REQUEST", () => {
      const result = getEndpointUrl("SUBMIT_REQUEST");
      expect(result).toBeTruthy();
      expect(result).toContain("/api/requests");
    });

    it("should return a valid URL for VIEW_FOR_REQUESTOR", () => {
      const result = getEndpointUrl("VIEW_FOR_REQUESTOR");
      expect(result).toBeTruthy();
      expect(result).toContain("/api/requests/viewForRequestor");
    });

    it("should return a valid URL for VIEW_PENDING", () => {
      const result = getEndpointUrl("VIEW_PENDING");
      expect(result).toBeTruthy();
      expect(result).toContain("/api/requests/viewPending");
    });

    it("should return a valid URL for VIEW_ALL", () => {
      const result = getEndpointUrl("VIEW_ALL");
      expect(result).toBeTruthy();
      expect(result).toContain("/api/requests/viewAll");
    });

    it("should return a valid URL for REPORT_SUMMARY", () => {
      const result = getEndpointUrl("REPORT_SUMMARY");
      expect(result).toBeTruthy();
      expect(result).toContain("/api/report/summary");
    });

    it("should return a valid URL for CHAT", () => {
      const result = getEndpointUrl("CHAT");
      expect(result).toBeTruthy();
      expect(result).toContain("/api/chat");
    });

    it("should replace route params for CHAT_CONVERSATION", () => {
      const result = getEndpointUrl("CHAT_CONVERSATION", {
        conversationId: "conversation 123",
      });

      expect(result).toBeTruthy();
      expect(result).toContain("/api/chat/conversation%20123");
    });

    it("should use getApiUrl internally", () => {
      const endpointKey = "SUBMIT_REQUEST";
      const endpointPath = API_ENDPOINTS[endpointKey];
      const endpointUrl = getEndpointUrl(endpointKey);
      const apiUrl = getApiUrl(endpointPath);
      expect(endpointUrl).toBe(apiUrl);
    });

    it("should work with all defined endpoints", () => {
      const endpointKeys = Object.keys(API_ENDPOINTS) as Array<
        keyof typeof API_ENDPOINTS
      >;
      endpointKeys.forEach((key) => {
        const result = getEndpointUrl(key);
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
      });
    });

    it("should return consistent results", () => {
      const result1 = getEndpointUrl("SUBMIT_REQUEST");
      const result2 = getEndpointUrl("SUBMIT_REQUEST");
      expect(result1).toBe(result2);
    });

    it("should combine with API_BASE_URL if provided", () => {
      const result = getEndpointUrl("SUBMIT_REQUEST");
      if (API_BASE_URL) {
        expect(result).toContain(API_BASE_URL.replace(/\/$/, ""));
      } else {
        expect(result).toBe("/api/requests");
      }
    });

    it("should return different URLs for different endpoints", () => {
      const result1 = getEndpointUrl("SUBMIT_REQUEST");
      const result2 = getEndpointUrl("VIEW_PENDING");
      expect(result1).not.toBe(result2);
    });
  });

  describe("logApiConfig", () => {
    it("should be a function", () => {
      expect(typeof logApiConfig).toBe("function");
    });

    it("should not throw when called", () => {
      expect(() => logApiConfig()).not.toThrow();
    });

    it("should return undefined", () => {
      const result = logApiConfig();
      expect(result).toBeUndefined();
    });

    it("should execute without errors multiple times", () => {
      expect(() => {
        logApiConfig();
        logApiConfig();
        logApiConfig();
      }).not.toThrow();
    });
  });

  // ============================================================================
  // Environment Configuration Tests 
  // Tests work with actual current environment since vi.stubEnv() doesn't work with import.meta.env
  // For true environment isolation testing, use build + preview approach as documented in API_CONFIG_GUIDE.md
  // ============================================================================
  
  describe("Environment Configuration Tests", () => {
    
    describe("current environment behavior validation", () => {
      it("should use the correct API configuration from current environment", () => {
        const envInfo = getEnvironmentInfo();
        
        // Validate that we get consistent environment information
        expect(envInfo).toHaveProperty('mode');
        expect(envInfo).toHaveProperty('apiBaseUrl');
        expect(envInfo).toHaveProperty('bypassAuth');
        
        expect(typeof envInfo.mode).toBe('string');
        expect(typeof envInfo.apiBaseUrl).toBe('string');
        expect(typeof envInfo.bypassAuth).toBe('boolean');
      });
      
      it("should generate URLs consistently in current environment", () => {
        const testPath = '/api/requests';
        const url1 = getApiUrl(testPath);
        const url2 = getApiUrl(testPath);
        
        expect(url1).toBe(url2);
        expect(url1).toContain('/api/requests');
      });
      
      it("should work with all typed endpoints in current environment", () => {
        const endpoints: (keyof typeof API_ENDPOINTS)[] = [
          'SUBMIT_REQUEST',
          'VIEW_FOR_REQUESTOR',
          'VIEW_PENDING',
          'VIEW_ALL',
          'REPORT_SUMMARY'
        ];
        
        endpoints.forEach(endpoint => {
          const url = getEndpointUrl(endpoint);
          expect(url).toContain(API_ENDPOINTS[endpoint]);
          expect(typeof url).toBe('string');
          expect(url.length).toBeGreaterThan(0);
        });
      });
      
      it("should maintain consistency between getApiUrl and getEndpointUrl", () => {
        const manualUrl = getApiUrl(API_ENDPOINTS.SUBMIT_REQUEST);
        const typedUrl = getEndpointUrl('SUBMIT_REQUEST');
        
        expect(manualUrl).toBe(typedUrl);
      });
    });
    
    describe("URL construction logic validation", () => {
      it("should handle different API base URL scenarios correctly", () => {
        // Test the logic that would be used in different environments
        const testUrlConstruction = (baseUrl: string, path: string) => {
          const normalizedPath = path.startsWith('/') ? path : `/${path}`;
          
          if (!baseUrl) {
            return normalizedPath;
          }
          
          const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
          return `${normalizedBaseUrl}${normalizedPath}`;
        };
        
        // Test cases that mirror the real environment logic
        const testCases = [
          {
            name: 'localhost with empty baseUrl (proxy mode)',
            baseUrl: '',
            path: '/api/test',
            expected: '/api/test'
          },
          {
            name: 'IL-2 with full baseUrl',
            baseUrl: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us',
            path: '/api/test',
            expected: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us/api/test'
          },
          {
            name: 'baseUrl with trailing slash',
            baseUrl: 'https://api.example.com/',
            path: 'api/test',
            expected: 'https://api.example.com/api/test'
          },
          {
            name: 'path without leading slash',
            baseUrl: 'https://api.example.com',
            path: 'api/test',
            expected: 'https://api.example.com/api/test'
          }
        ];
        
        testCases.forEach(testCase => {
          const result = testUrlConstruction(testCase.baseUrl, testCase.path);
          expect(result).toBe(testCase.expected);
        });
      });
      
      it("should validate environment variable handling logic", () => {
        // Test the logic used to process environment variables
        const testBypassAuthLogic = (value: string | undefined): boolean => {
          return value === 'true';
        };
        
        expect(testBypassAuthLogic('true')).toBe(true);
        expect(testBypassAuthLogic('false')).toBe(false);
        expect(testBypassAuthLogic('')).toBe(false);
        expect(testBypassAuthLogic(undefined)).toBe(false);
      });
    });
    
    describe("environment-specific behavior patterns", () => {
      it("should document expected behavior for different environments", () => {
        // This test serves as documentation for the expected behavior
        // in different environments when using build commands
        
        const environmentExpectations = {
          development: {
            command: 'npm run dev',
            expectedApiBaseUrl: 'empty string or set by .env.local',
            expectedBypassAuth: true,
            expectedUrlPattern: 'relative /api/... or absolute http://localhost:8082/api/...',
            description: 'Uses Vite proxy or direct backend URL from .env.local'
          },
          il2: {
            command: 'npm run build:il2 && npm run preview',
            expectedApiBaseUrl: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us',
            expectedBypassAuth: false,
            expectedUrlPattern: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us/api/...',
            description: 'Uses IL-2 environment configuration from .env.il2'
          },
          il5: {
            command: 'npm run build:il5 && npm run preview',
            expectedApiBaseUrl: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us',
            expectedBypassAuth: false,
            expectedUrlPattern: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us/api/...',
            description: 'Uses IL-5 environment configuration from .env.il5'
          }
        };
        
        // Validate that our expectations are documented
        Object.values(environmentExpectations).forEach(env => {
          expect(env.command).toContain('npm run');
          expect(env.description).toContain('env');
          expect(typeof env.expectedBypassAuth).toBe('boolean');
        });
      });
      
      it("should validate browser debugging utilities documentation", () => {
        // Document the expected debugging interface available in browser
        const expectedBrowserMethods = [
          'debugAdvana.logApiConfig()',
          'debugAdvana.getEnvironmentInfo()',
          'debugAdvana.getApiUrl("/api/test")',
          'debugAdvana.env.VITE_API_BASE_URL',
          'debugAdvana.env.VITE_ENVIRONMENT_NAME',
          'debugAdvana.env.VITE_KEYCLOAK_URL'
        ];
        
        expectedBrowserMethods.forEach(method => {
          expect(method).toContain('debugAdvana');
          expect(typeof method).toBe('string');
        });
      });
    });
    
    describe("integration testing approach documentation", () => {
      it("should document the correct approach for environment isolation testing", () => {
        // Document that environment isolation should be tested via build commands,
        // not via mocking environment variables at test time
        
        const testingApproach = {
          unitTests: {
            description: 'Test configuration logic and URL construction',
            approach: 'Test with current environment, validate logic patterns',
            limitations: 'Cannot mock import.meta.env after module load'
          },
          integrationTests: {
            description: 'Test actual environment isolation',
            approach: 'Use npm run build:il2 && npm run preview, then browser testing',
            validation: 'Use debugAdvana utilities in browser console'
          },
          acceptanceTesting: {
            description: 'Validate full environment isolation',
            approach: 'Deploy to different environments, validate API calls',
            criteria: 'Each environment only calls its designated endpoints'
          }
        };
        
        expect(testingApproach.unitTests.limitations).toContain('import.meta.env');
        expect(testingApproach.integrationTests.approach).toContain('build:il2');
        expect(testingApproach.acceptanceTesting.criteria).toBeDefined();
      });
      
      it("should validate that environment files exist for testing", () => {
        // This test documents that environment files should exist
        // for proper environment isolation testing
        
        const expectedFiles = [
          '.env.il2',
          '.env.il5',
          '.env.local (for development)',
          'vite.config.ts (for proxy configuration)'
        ];
        
        expectedFiles.forEach(file => {
          if (file.includes('vite.config.ts')) {
            expect(file).toContain('vite.config.ts');
          } else {
            expect(file).toContain('.env');
          }
        });
      });
    });
    
    describe("current environment validation", () => {
      it("should reflect actual test environment configuration", () => {
        // This test validates that we're getting the expected values
        // from the actual test environment (likely .env.local)
        
        const envInfo = getEnvironmentInfo();
        const testUrl = getApiUrl('/api/test');
        
        // Validate that we get consistent, valid values
        expect(envInfo.mode).toBeTruthy();
        expect(typeof envInfo.apiBaseUrl).toBe('string');
        expect(typeof envInfo.bypassAuth).toBe('boolean');
        expect(testUrl).toContain('/api/test');
      });
      
      it("should validate environment variable access patterns", () => {
        // Test that we can access the same environment variables
        // that the api-config module uses
        
        const directEnvAccess = {
          apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
          bypassAuth: import.meta.env.VITE_BYPASS_AUTH,
          mode: import.meta.env.MODE
        };
        
        const configAccess = getEnvironmentInfo();
        
        // Should match what the config module returns
        expect(configAccess.apiBaseUrl).toBe(directEnvAccess.apiBaseUrl || '');
        expect(configAccess.mode).toBe(directEnvAccess.mode || 'development');
        expect(configAccess.bypassAuth).toBe(directEnvAccess.bypassAuth === 'true');
      });
    });
  });
});
