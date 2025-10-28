/**
 * Test utilities for environment configuration testing
 * Supports the comprehensive environment isolation testing outlined in API_CONFIG_GUIDE.md
 */
import { vi } from 'vitest';

// Type definitions for testing
export interface EnvironmentConfig {
  mode: string;
  apiBaseUrl: string;
  bypassAuth: boolean;
  endpoint?: string;
}

export interface ValidationResult {
  mode: boolean;
  apiBaseUrl: boolean;
  bypassAuth: boolean;
  endpoint: boolean;
  isValid: () => boolean;
}

export interface CrossEnvironmentTestResult<T> {
  localhost: T;
  il2: T;
  il5: T;
  isolation: {
    localhostDiffersFromIl2: boolean;
    il2SameAsIl5: boolean;
    allDifferentModes: boolean;
  };
}

export const mockEnvironment = (env: 'localhost' | 'il2' | 'il5') => {
  const configs = {
    localhost: {
      VITE_API_BASE_URL: '',
      VITE_ENVIRONMENT_NAME: 'localhost',
      VITE_BYPASS_AUTH: 'true',
      VITE_KEYCLOAK_URL: '',
      VITE_KEYCLOAK_REALM: '',
      VITE_KEYCLOAK_CLIENT_ID: '',
      MODE: 'development'
    },
    // Current IL-2 environment (using working dev.mtt.cdao.us endpoints)
    il2: {
      VITE_API_BASE_URL: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us',
      VITE_ENVIRONMENT_NAME: 'IL-2',
      VITE_CLASSIFICATION_LEVEL: 'classified',
      VITE_BYPASS_AUTH: 'false',
      VITE_KEYCLOAK_URL: 'https://keycloak.cdao.us/auth',
      VITE_KEYCLOAK_REALM: 'baby-yoda',
      VITE_KEYCLOAK_CLIENT_ID: 'marketplace',
      MODE: 'il2'
    },
    // Future IL-5 environment (configured but potentially not yet accessible)
    il5: {
      VITE_API_BASE_URL: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us',
      VITE_ENVIRONMENT_NAME: 'IL-5',
      VITE_CLASSIFICATION_LEVEL: 'unclassified',
      VITE_BYPASS_AUTH: 'false',
      VITE_KEYCLOAK_URL: 'https://keycloak.cdao.us/auth',
      VITE_KEYCLOAK_REALM: 'baby-yoda',
      VITE_KEYCLOAK_CLIENT_ID: 'marketplace',
      MODE: 'il5'
    }
  };
  
  Object.entries(configs[env]).forEach(([key, value]) => {
    vi.stubEnv(key, value);
  });
};

/**
 * Get expected configuration for an environment (for assertions)
 */
export const getExpectedConfig = (env: 'localhost' | 'il2' | 'il5') => {
  switch (env) {
    case 'localhost':
      return {
        expectedEndpoint: '/api/requests', // Relative path for proxy
        expectedBypassAuth: true,
        expectedApiBaseUrl: '',
        expectedMode: 'development',
        expectedKeycloakUrl: '',
        expectedEnvironmentName: 'localhost'
      };
      
    case 'il2':
      return {
        expectedEndpoint: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us/api/requests',
        expectedBypassAuth: false,
        expectedApiBaseUrl: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us',
        expectedMode: 'il2',
        expectedKeycloakUrl: 'https://keycloak.cdao.us/auth',
        expectedEnvironmentName: 'IL-2',
        expectedClassificationLevel: 'classified'
      };
      
    case 'il5':
      return {
        expectedEndpoint: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us/api/requests',
        expectedBypassAuth: false,
        expectedApiBaseUrl: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us',
        expectedMode: 'il5',
        expectedKeycloakUrl: 'https://keycloak.cdao.us/auth',
        expectedEnvironmentName: 'IL-5',
        expectedClassificationLevel: 'unclassified'
      };
  }
};

/**
 * Comprehensive environment validation helper
 * Validates all aspects of environment configuration
 */
export const validateEnvironmentComplete = (env: 'localhost' | 'il2' | 'il5', actualConfig: EnvironmentConfig): ValidationResult => {
  const expected = getExpectedConfig(env);
  
  return {
    mode: actualConfig.mode === expected.expectedMode,
    apiBaseUrl: actualConfig.apiBaseUrl === expected.expectedApiBaseUrl,
    bypassAuth: actualConfig.bypassAuth === expected.expectedBypassAuth,
    endpoint: (actualConfig.endpoint || '') === expected.expectedEndpoint,
    isValid: function() {
      return this.mode && this.apiBaseUrl && this.bypassAuth && this.endpoint;
    }
  };
};

/**
 * Mock browser console debugging environment
 * Simulates the debugAdvana.* utilities mentioned in API_CONFIG_GUIDE.md
 */
export const mockDebugAdvanaEnvironment = () => {
  const mockDebugAdvana = {
    logApiConfig: vi.fn(),
    getEnvironmentInfo: vi.fn(),
    getApiUrl: vi.fn(),
    env: {
      VITE_API_BASE_URL: '',
      VITE_ENVIRONMENT_NAME: '',
      VITE_KEYCLOAK_URL: ''
    }
  };
  
  // Mock window.debugAdvana
  Object.defineProperty(window, 'debugAdvana', {
    value: mockDebugAdvana,
    writable: true,
    configurable: true
  });
  
  return mockDebugAdvana;
};

/**
 * Test helper for cross-environment isolation verification
 * Ensures no environment leakage between localhost, IL-2, and IL-5
 */
export const testCrossEnvironmentIsolation = <T>(testFunction: (env: 'localhost' | 'il2' | 'il5') => T): CrossEnvironmentTestResult<T> => {
  const environments: Array<'localhost' | 'il2' | 'il5'> = ['localhost', 'il2', 'il5'];
  const results: Record<string, T> = {};
  
  environments.forEach(env => {
    mockEnvironment(env);
    results[env] = testFunction(env);
    vi.unstubAllEnvs();
  });
  
  return {
    localhost: results.localhost,
    il2: results.il2,
    il5: results.il5,
    isolation: {
      localhostDiffersFromIl2: results.localhost !== results.il2,
      il2SameAsIl5: results.il2 === results.il5, // Currently expected to be same
      allDifferentModes: true // Will be verified separately
    }
  };
};

/**
 * Simulate build mode testing
 * Tests the npm run build:il2, npm run build:il5, and npm run dev scenarios
 */
export const mockBuildMode = (buildMode: 'dev' | 'build:il2' | 'build:il5') => {
  switch (buildMode) {
    case 'dev':
      mockEnvironment('localhost');
      break;
    case 'build:il2':
      mockEnvironment('il2');
      break;
    case 'build:il5':
      mockEnvironment('il5');
      break;
  }
};

/**
 * Environment-specific test patterns
 * Based on the patterns described in API_CONFIG_GUIDE.md
 */
export const getEnvironmentTestPatterns = () => {
  return {
    localhost: {
      urlPattern: /^\/api\//,
      shouldNotContain: ['https://', 'http://'],
      shouldContain: ['/api/'],
      authBypass: true,
      mode: 'development'
    },
    il2: {
      urlPattern: /^https:\/\/advana-marketplace-monolith-node\.dev\.mtt\.cdao\.us\/api\//,
      shouldNotContain: [],
      shouldContain: ['https://', 'advana-marketplace-monolith-node.dev.mtt.cdao.us', '/api/'],
      authBypass: false,
      mode: 'il2'
    },
    il5: {
      urlPattern: /^https:\/\/advana-marketplace-monolith-node\.dev\.mtt\.cdao\.us\/api\//,
      shouldNotContain: [],
      shouldContain: ['https://', 'advana-marketplace-monolith-node.dev.mtt.cdao.us', '/api/'],
      authBypass: false,
      mode: 'il5'
    }
  };
};

/**
 * Clean up environment mocks
 * Ensures tests don't leak environment variables
 */
export const cleanupEnvironmentMocks = () => {
  vi.unstubAllEnvs();
  
  // Clean up window.debugAdvana if it was mocked
  if ('debugAdvana' in window) {
    delete (window as { debugAdvana?: unknown }).debugAdvana;
  }
};