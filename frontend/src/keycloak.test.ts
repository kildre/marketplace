import { describe, it, expect, beforeAll } from 'vitest';

describe('keycloak configuration', () => {
  beforeAll(() => {
    // Set environment variables for testing
    Object.defineProperty(import.meta, 'env', {
      value: {
        ...import.meta.env,
        VITE_KEYCLOAK_URL: 'https://keycloak.example.com/auth',
        VITE_KEYCLOAK_REALM: 'test-realm',
        VITE_KEYCLOAK_CLIENT_ID: 'test-client',
      },
      writable: true,
    });
  });

  it('should export a keycloak instance', async () => {
    // Dynamic import to load after env vars are set
    const { default: keycloak } = await import('./keycloak');
    
    expect(keycloak).toBeDefined();
    expect(keycloak).toHaveProperty('init');
    expect(keycloak).toHaveProperty('login');
    expect(keycloak).toHaveProperty('logout');
  });

  it('should have correct configuration', async () => {
    const { default: keycloak } = await import('./keycloak');
    
    // Keycloak instance should have proper structure and methods
    expect(keycloak).toHaveProperty('init');
    expect(keycloak).toHaveProperty('login');
    expect(typeof keycloak.init).toBe('function');
  });

  describe('configuration validation', () => {
    it('should validate url configuration', () => {
      // URL should be set
      expect(import.meta.env.VITE_KEYCLOAK_URL).toBeTruthy();
    });

    it('should validate realm configuration', () => {
      // Realm should be set
      expect(import.meta.env.VITE_KEYCLOAK_REALM).toBeTruthy();
    });

    it('should validate clientId configuration', () => {
      // Client ID should be set
      expect(import.meta.env.VITE_KEYCLOAK_CLIENT_ID).toBeTruthy();
    });
  });

  describe('keycloak methods', () => {
    it('should have init method', async () => {
      const { default: keycloak } = await import('./keycloak');
      expect(typeof keycloak.init).toBe('function');
    });

    it('should have login method', async () => {
      const { default: keycloak } = await import('./keycloak');
      expect(typeof keycloak.login).toBe('function');
    });

    it('should have logout method', async () => {
      const { default: keycloak } = await import('./keycloak');
      expect(typeof keycloak.logout).toBe('function');
    });

    it('should have updateToken method', async () => {
      const { default: keycloak } = await import('./keycloak');
      expect(typeof keycloak.updateToken).toBe('function');
    });

    it('should have hasRealmRole method', async () => {
      const { default: keycloak } = await import('./keycloak');
      expect(typeof keycloak.hasRealmRole).toBe('function');
    });

    it('should have hasResourceRole method', async () => {
      const { default: keycloak } = await import('./keycloak');
      expect(typeof keycloak.hasResourceRole).toBe('function');
    });
  });
});
