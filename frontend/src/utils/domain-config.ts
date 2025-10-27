/**
 * Domain Configuration Module
 * 
 * Provides environment-aware configuration for multi-environment deployments:
 * - localhost (development)
 * - IL-2 (classified environment)
 * - IL-5 (unclassified environment)
 */

import { API_BASE_URL, isBypassAuth, API_ENDPOINTS, getEndpointUrl } from './api-config';

export interface DomainConfig {
  environment: {
    name: 'localhost' | 'IL-2' | 'IL-5' | 'unknown';
    mode: string;
    classification: 'unclassified' | 'classified' | 'development';
  };
  api: {
    baseUrl: string;
    endpoints: Record<string, string>;
  };
  auth: {
    bypassEnabled: boolean;
    keycloakUrl?: string;
    keycloakRealm?: string;
    keycloakClientId?: string;
  };
  networking: {
    allowedDomains: string[];
    corsEnabled: boolean;
  };
}

/**
 * Detect environment based on current hostname and configuration
 */
const detectEnvironment = (): DomainConfig['environment'] => {
  const hostname = window.location.hostname;
  const mode = import.meta.env.MODE;

  // Development environment detection
  if (hostname === 'localhost' || hostname === '127.0.0.1' || mode === 'development') {
    return {
      name: 'localhost',
      mode,
      classification: 'development'
    };
  }

  // IL-2 (Classified) environment detection
  if (hostname.includes('il2') || hostname.includes('classified') || hostname.includes('.mil.local')) {
    return {
      name: 'IL-2',
      mode,
      classification: 'classified'
    };
  }

  // IL-5 (Unclassified) environment detection  
  if (hostname.includes('il5') || hostname.includes('unclass') || hostname.includes('.cdao.us')) {
    return {
      name: 'IL-5',
      mode,
      classification: 'unclassified'
    };
  }

  // Unknown environment
  return {
    name: 'unknown',
    mode,
    classification: 'unclassified'
  };
};

/**
 * Get environment-specific allowed domains for network security
 */
const getAllowedDomains = (envName: string): string[] => {
  switch (envName) {
    case 'localhost':
      return ['localhost', '127.0.0.1', 'localhost:8080', 'localhost:8082', 'localhost:8085'];
    case 'IL-2':
      return ['*.mil.local', '*.classified.local', '*.il2.local'];
    case 'IL-5':
      return ['*.cdao.us', '*.mtt.cdao.us', '*.unclass.local', '*.il5.local'];
    default:
      return [];
  }
};

/**
 * Get complete domain configuration with environment detection
 * @returns Comprehensive configuration object with environment isolation
 */
export const getDomainConfig = (): DomainConfig => {
  const environment = detectEnvironment();
  
  // Get all endpoint URLs
  const endpoints: Record<string, string> = {};
  Object.keys(API_ENDPOINTS).forEach(key => {
    endpoints[key] = getEndpointUrl(key as keyof typeof API_ENDPOINTS);
  });

  return {
    environment,
    api: {
      baseUrl: API_BASE_URL,
      endpoints,
    },
    auth: {
      bypassEnabled: isBypassAuth,
      keycloakUrl: import.meta.env.VITE_KEYCLOAK_URL,
      keycloakRealm: import.meta.env.VITE_KEYCLOAK_REALM,
      keycloakClientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    },
    networking: {
      allowedDomains: getAllowedDomains(environment.name),
      corsEnabled: environment.name === 'localhost'
    }
  };
};

/**
 * Validate that current environment configuration is secure and isolated
 * @returns Validation results with any security concerns
 */
export const validateEnvironmentIsolation = () => {
  const config = getDomainConfig();
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check API endpoint isolation
  if (config.environment.name === 'IL-2') {
    if (config.api.baseUrl.includes('cdao.us') || config.api.baseUrl.includes('localhost')) {
      issues.push('IL-2 environment is pointing to non-classified endpoints');
    }
  }

  if (config.environment.name === 'IL-5') {
    if (config.api.baseUrl.includes('.mil.local') || config.api.baseUrl.includes('localhost')) {
      issues.push('IL-5 environment is pointing to inappropriate endpoints');
    }
  }

  // Check auth configuration isolation
  if (config.auth.keycloakUrl) {
    try {
      const authUrl = new globalThis.URL(config.auth.keycloakUrl);
      const authDomain = authUrl.hostname;
      const isAuthDomainAllowed = config.networking.allowedDomains.some(domain => 
        authDomain.includes(domain.replace('*', ''))
      );
      
      if (!isAuthDomainAllowed) {
        warnings.push(`Auth domain ${authDomain} not in allowed domains for ${config.environment.name}`);
      }
    } catch {
      warnings.push('Invalid Keycloak URL format');
    }
  }

  // Check bypass auth in production
  if (config.auth.bypassEnabled && config.environment.name !== 'localhost') {
    issues.push('Auth bypass should not be enabled in production environments');
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    environment: config.environment,
    config
  };
};

/**
 * Log complete domain configuration for debugging
 */
export const logDomainConfig = (): void => {
  const config = getDomainConfig();
  const validation = validateEnvironmentIsolation();
  
  // eslint-disable-next-line no-console
  console.group('🏗️ Domain Configuration');
  // eslint-disable-next-line no-console
  console.log('Environment:', config.environment);
  // eslint-disable-next-line no-console
  console.log('API Configuration:', config.api);
  // eslint-disable-next-line no-console
  console.log('Auth Configuration:', config.auth);
  // eslint-disable-next-line no-console
  console.log('Networking:', config.networking);
  // eslint-disable-next-line no-console
  console.log('Validation:', validation);
  // eslint-disable-next-line no-console
  console.groupEnd();
};

export default getDomainConfig;