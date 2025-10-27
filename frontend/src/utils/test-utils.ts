/**
 * Test utilities for environment configuration testing
 */
import { vi } from 'vitest';

export const mockEnvironment = (env: 'localhost' | 'il2' | 'il5') => {
  const configs = {
    localhost: {
      VITE_API_BASE_URL: '',
      VITE_ENVIRONMENT_NAME: 'localhost',
      VITE_BYPASS_AUTH: 'true',
      VITE_KEYCLOAK_URL: '',
      VITE_KEYCLOAK_REALM: '',
      VITE_KEYCLOAK_CLIENT_ID: ''
    },
    // Current IL-2 environment (using working dev.mtt.cdao.us endpoints)
    il2: {
      VITE_API_BASE_URL: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us',
      VITE_ENVIRONMENT_NAME: 'IL-2',
      VITE_CLASSIFICATION_LEVEL: 'classified',
      VITE_BYPASS_AUTH: 'false',
      VITE_KEYCLOAK_URL: 'https://keycloak.cdao.us/auth',
      VITE_KEYCLOAK_REALM: 'baby-yoda',
      VITE_KEYCLOAK_CLIENT_ID: 'marketplace'
    },
    // Future IL-5 environment (configured but potentially not yet accessible)
    il5: {
      VITE_API_BASE_URL: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us',
      VITE_ENVIRONMENT_NAME: 'IL-5',
      VITE_CLASSIFICATION_LEVEL: 'unclassified',
      VITE_BYPASS_AUTH: 'false',
      VITE_KEYCLOAK_URL: 'https://keycloak.cdao.us/auth',
      VITE_KEYCLOAK_REALM: 'baby-yoda',
      VITE_KEYCLOAK_CLIENT_ID: 'marketplace'
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
        expectedApiBaseUrl: ''
      };
      
    case 'il2':
      return {
        expectedEndpoint: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us/api/requests',
        expectedBypassAuth: false,
        expectedApiBaseUrl: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us'
      };
      
    case 'il5':
      return {
        expectedEndpoint: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us/api/requests',
        expectedBypassAuth: false,
        expectedApiBaseUrl: 'https://advana-marketplace-monolith-node.dev.mtt.cdao.us'
      };
  }
};