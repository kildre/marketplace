import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useKeycloak } from './useKeycloak';

// Mock the external dependencies
vi.mock('@react-keycloak/web', () => ({
  useKeycloak: vi.fn()
}));

vi.mock('../contexts/MockKeycloakProvider', () => ({
  useMockKeycloak: vi.fn()
}));

// Import the mocked functions to set up their behavior
import { useKeycloak as useRealKeycloak } from '@react-keycloak/web';
import { useMockKeycloak } from '../contexts/MockKeycloakProvider';

describe('useKeycloak hook', () => {
  // Mock return values
  const mockRealKeycloakReturn = {
    keycloak: {
      authenticated: true,
      token: 'real-jwt-token',
      tokenParsed: {
        preferred_username: 'real-user',
        email: 'real-user@example.com',
        given_name: 'Real',
        family_name: 'User'
      },
      login: vi.fn(),
      logout: vi.fn(),
      updateToken: vi.fn(),
      hasRealmRole: vi.fn(),
      hasResourceRole: vi.fn()
    },
    initialized: true
  };

  const mockMockKeycloakReturn = {
    keycloak: {
      authenticated: true,
      token: 'mock-jwt-token',
      tokenParsed: {
        preferred_username: 'developer',
        email: 'developer@advana.mil',
        given_name: 'Dev',
        family_name: 'User'
      },
      login: vi.fn(),
      logout: vi.fn(),
      updateToken: vi.fn(),
      hasRealmRole: vi.fn(),
      hasResourceRole: vi.fn()
    },
    initialized: true
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Set up default mock implementations
    (useRealKeycloak as any).mockReturnValue(mockRealKeycloakReturn);
    (useMockKeycloak as any).mockReturnValue(mockMockKeycloakReturn);
  });

  afterEach(() => {
    // Clean up environment variables after each test
    delete (import.meta.env as any).VITE_BYPASS_AUTH;
  });

  describe('when VITE_BYPASS_AUTH is true', () => {
    beforeEach(() => {
      // Mock the environment variable for bypass mode
      (import.meta.env as any).VITE_BYPASS_AUTH = 'true';
    });

    it('should return mock Keycloak data', () => {
      const { result } = renderHook(() => useKeycloak());

      expect(result.current).toEqual(mockMockKeycloakReturn);
      expect(useMockKeycloak).toHaveBeenCalledTimes(1);
      expect(useRealKeycloak).not.toHaveBeenCalled();
    });

    it('should return mock user data with developer credentials', () => {
      const { result } = renderHook(() => useKeycloak());

      expect(result.current.keycloak.tokenParsed?.preferred_username).toBe('developer');
      expect(result.current.keycloak.tokenParsed?.email).toBe('developer@advana.mil');
      expect(result.current.keycloak.token).toBe('mock-jwt-token');
      expect(result.current.initialized).toBe(true);
    });
  });

  describe('when VITE_BYPASS_AUTH is false', () => {
    beforeEach(() => {
      // Mock the environment variable for production mode
      (import.meta.env as any).VITE_BYPASS_AUTH = 'false';
    });

    it('should return real Keycloak data', () => {
      const { result } = renderHook(() => useKeycloak());

      expect(result.current).toEqual(mockRealKeycloakReturn);
      expect(useRealKeycloak).toHaveBeenCalledTimes(1);
      expect(useMockKeycloak).not.toHaveBeenCalled();
    });

    it('should return real user data', () => {
      const { result } = renderHook(() => useKeycloak());

      expect(result.current.keycloak.tokenParsed?.preferred_username).toBe('real-user');
      expect(result.current.keycloak.tokenParsed?.email).toBe('real-user@example.com');
      expect(result.current.keycloak.token).toBe('real-jwt-token');
      expect(result.current.initialized).toBe(true);
    });
  });

  describe('when VITE_BYPASS_AUTH is undefined', () => {
    beforeEach(() => {
      // Don't set the environment variable (undefined)
      delete (import.meta.env as any).VITE_BYPASS_AUTH;
    });

    it('should default to real Keycloak (production mode)', () => {
      const { result } = renderHook(() => useKeycloak());

      expect(result.current).toEqual(mockRealKeycloakReturn);
      expect(useRealKeycloak).toHaveBeenCalledTimes(1);
      expect(useMockKeycloak).not.toHaveBeenCalled();
    });
  });

  describe('when VITE_BYPASS_AUTH has other values', () => {
    it.each([
      'TRUE',  // Wrong case
      'True',  // Wrong case
      '1',     // Number as string
      'yes',   // Different truthy string
      'false', // String false (not boolean false)
    ])('should use real Keycloak when VITE_BYPASS_AUTH is "%s"', (value) => {
      (import.meta.env as any).VITE_BYPASS_AUTH = value;

      const { result } = renderHook(() => useKeycloak());

      expect(result.current).toEqual(mockRealKeycloakReturn);
      expect(useRealKeycloak).toHaveBeenCalledTimes(1);
      expect(useMockKeycloak).not.toHaveBeenCalled();
    });
  });

  describe('hook behavior consistency', () => {
    it('should maintain the same interface for both mock and real Keycloak', () => {
      // Test with bypass auth
      (import.meta.env as any).VITE_BYPASS_AUTH = 'true';
      const { result: mockResult } = renderHook(() => useKeycloak());

      // Test with real auth
      (import.meta.env as any).VITE_BYPASS_AUTH = 'false';
      const { result: realResult } = renderHook(() => useKeycloak());

      // Both should have the same structure
      expect(mockResult.current).toHaveProperty('keycloak');
      expect(mockResult.current).toHaveProperty('initialized');
      expect(realResult.current).toHaveProperty('keycloak');
      expect(realResult.current).toHaveProperty('initialized');

      // Both should have the same keycloak interface
      const mockKeycloak = mockResult.current.keycloak;
      const realKeycloak = realResult.current.keycloak;

      expect(mockKeycloak).toHaveProperty('authenticated');
      expect(mockKeycloak).toHaveProperty('token');
      expect(mockKeycloak).toHaveProperty('tokenParsed');
      expect(mockKeycloak).toHaveProperty('login');
      expect(mockKeycloak).toHaveProperty('logout');

      expect(realKeycloak).toHaveProperty('authenticated');
      expect(realKeycloak).toHaveProperty('token');
      expect(realKeycloak).toHaveProperty('tokenParsed');
      expect(realKeycloak).toHaveProperty('login');
      expect(realKeycloak).toHaveProperty('logout');
    });
  });

  describe('environment variable edge cases', () => {
    it('should handle empty string as false', () => {
      (import.meta.env as any).VITE_BYPASS_AUTH = '';

      const { result } = renderHook(() => useKeycloak());

      expect(result.current).toEqual(mockRealKeycloakReturn);
      expect(useRealKeycloak).toHaveBeenCalledTimes(1);
      expect(useMockKeycloak).not.toHaveBeenCalled();
    });

    it('should handle whitespace as false', () => {
      (import.meta.env as any).VITE_BYPASS_AUTH = '   ';

      const { result } = renderHook(() => useKeycloak());

      expect(result.current).toEqual(mockRealKeycloakReturn);
      expect(useRealKeycloak).toHaveBeenCalledTimes(1);
      expect(useMockKeycloak).not.toHaveBeenCalled();
    });
  });
});
