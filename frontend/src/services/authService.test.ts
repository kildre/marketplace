import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from './authService';
import { AppRoles } from '../types/auth';

describe('AuthService', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  describe('mapKeycloakRolesToAppRoles', () => {
    it('should map marketplace-approver to APPROVER', () => {
      const roles = AuthService.mapKeycloakRolesToAppRoles(['marketplace-approver']);
      expect(roles).toEqual([AppRoles.APPROVER]);
    });

    it('should map marketplace-requestor to REQUESTOR', () => {
      const roles = AuthService.mapKeycloakRolesToAppRoles(['marketplace-requestor']);
      expect(roles).toEqual([AppRoles.REQUESTOR]);
    });

    it('should map legacy APPROVER to APPROVER', () => {
      const roles = AuthService.mapKeycloakRolesToAppRoles(['APPROVER']);
      expect(roles).toEqual([AppRoles.APPROVER]);
    });

    it('should map legacy REQUESTOR to REQUESTOR', () => {
      const roles = AuthService.mapKeycloakRolesToAppRoles(['REQUESTOR']);
      expect(roles).toEqual([AppRoles.REQUESTOR]);
    });

    it('should map multiple roles', () => {
      const roles = AuthService.mapKeycloakRolesToAppRoles([
        'marketplace-approver',
        'marketplace-requestor',
      ]);
      expect(roles).toContain(AppRoles.APPROVER);
      expect(roles).toContain(AppRoles.REQUESTOR);
      expect(roles).toHaveLength(2);
    });

    it('should filter out unmapped roles', () => {
      const roles = AuthService.mapKeycloakRolesToAppRoles([
        'marketplace-approver',
        'some-other-role',
        'marketplace-requestor',
      ]);
      expect(roles).toHaveLength(2);
      expect(roles).toContain(AppRoles.APPROVER);
      expect(roles).toContain(AppRoles.REQUESTOR);
    });

    it('should return empty array for no matching roles', () => {
      const roles = AuthService.mapKeycloakRolesToAppRoles(['other-role', 'another-role']);
      expect(roles).toEqual([]);
    });

    it('should handle empty array', () => {
      const roles = AuthService.mapKeycloakRolesToAppRoles([]);
      expect(roles).toEqual([]);
    });
  });

  describe('extractRolesFromToken', () => {
    it('should extract realm roles', () => {
      const tokenParsed = {
        realm_access: {
          roles: ['role1', 'role2'],
        },
      };
      const roles = AuthService.extractRolesFromToken(tokenParsed);
      expect(roles).toContain('role1');
      expect(roles).toContain('role2');
    });

    it('should extract resource roles', () => {
      const tokenParsed = {
        resource_access: {
          marketplace: {
            roles: ['marketplace-approver'],
          },
        },
      };
      const roles = AuthService.extractRolesFromToken(tokenParsed);
      expect(roles).toContain('marketplace-approver');
    });

    it('should extract both realm and resource roles', () => {
      const tokenParsed = {
        realm_access: {
          roles: ['realm-role'],
        },
        resource_access: {
          marketplace: {
            roles: ['marketplace-approver'],
          },
        },
      };
      const roles = AuthService.extractRolesFromToken(tokenParsed);
      expect(roles).toContain('realm-role');
      expect(roles).toContain('marketplace-approver');
    });

    it('should handle multiple resource clients', () => {
      const tokenParsed = {
        resource_access: {
          marketplace: {
            roles: ['marketplace-approver'],
          },
          'other-client': {
            roles: ['other-role'],
          },
        },
      };
      const roles = AuthService.extractRolesFromToken(tokenParsed);
      expect(roles).toContain('marketplace-approver');
      expect(roles).toContain('other-role');
    });

    it('should return empty array for token without roles', () => {
      const tokenParsed = {};
      const roles = AuthService.extractRolesFromToken(tokenParsed);
      expect(roles).toEqual([]);
    });
  });

  describe('storeTokens', () => {
    it('should store access token', () => {
      AuthService.storeTokens('test-token');
      expect(window.localStorage.getItem('marketplace_auth_token')).toBe('test-token');
    });

    it('should store both access and refresh tokens', () => {
      AuthService.storeTokens('test-token', 'refresh-token');
      expect(window.localStorage.getItem('marketplace_auth_token')).toBe('test-token');
      expect(window.localStorage.getItem('marketplace_refresh_token')).toBe('refresh-token');
    });

    it('should handle missing refresh token', () => {
      AuthService.storeTokens('test-token');
      expect(window.localStorage.getItem('marketplace_auth_token')).toBe('test-token');
      expect(window.localStorage.getItem('marketplace_refresh_token')).toBeNull();
    });
  });

  describe('getStoredToken', () => {
    it('should retrieve stored token', () => {
      window.localStorage.setItem('marketplace_auth_token', 'stored-token');
      const token = AuthService.getStoredToken();
      expect(token).toBe('stored-token');
    });

    it('should return null when no token stored', () => {
      const token = AuthService.getStoredToken();
      expect(token).toBeNull();
    });
  });

  describe('getStoredRefreshToken', () => {
    it('should retrieve stored refresh token', () => {
      window.localStorage.setItem('marketplace_refresh_token', 'stored-refresh-token');
      const token = AuthService.getStoredRefreshToken();
      expect(token).toBe('stored-refresh-token');
    });

    it('should return null when no refresh token stored', () => {
      const token = AuthService.getStoredRefreshToken();
      expect(token).toBeNull();
    });
  });

  describe('storeUserInfo', () => {
    it('should store user information', () => {
      const userInfo = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        roles: [AppRoles.REQUESTOR],
        keycloakRoles: ['marketplace-requestor'],
      };
      AuthService.storeUserInfo(userInfo);
      const stored = window.localStorage.getItem('marketplace_user_info');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(userInfo);
    });
  });

  describe('getStoredUserInfo', () => {
    it('should retrieve stored user information', () => {
      const userInfo = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        roles: [AppRoles.REQUESTOR],
        keycloakRoles: ['marketplace-requestor'],
      };
      window.localStorage.setItem('marketplace_user_info', JSON.stringify(userInfo));
      const retrieved = AuthService.getStoredUserInfo();
      expect(retrieved).toEqual(userInfo);
    });

    it('should return null when no user info stored', () => {
      const retrieved = AuthService.getStoredUserInfo();
      expect(retrieved).toBeNull();
    });

    it('should handle corrupted JSON', () => {
      window.localStorage.setItem('marketplace_user_info', 'invalid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const retrieved = AuthService.getStoredUserInfo();
      expect(retrieved).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('clearStoredAuth', () => {
    it('should clear all stored authentication data', () => {
      window.localStorage.setItem('marketplace_auth_token', 'token');
      window.localStorage.setItem('marketplace_refresh_token', 'refresh');
      window.localStorage.setItem('marketplace_user_info', '{}');

      AuthService.clearStoredAuth();

      expect(window.localStorage.getItem('marketplace_auth_token')).toBeNull();
      expect(window.localStorage.getItem('marketplace_refresh_token')).toBeNull();
      expect(window.localStorage.getItem('marketplace_user_info')).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired token', () => {
      const tokenParsed = {
        exp: Math.floor(Date.now() / 1000) - 100, // 100 seconds ago
      };
      expect(AuthService.isTokenExpired(tokenParsed)).toBe(true);
    });

    it('should return false for valid token', () => {
      const tokenParsed = {
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };
      expect(AuthService.isTokenExpired(tokenParsed)).toBe(false);
    });

    it('should return true for token expiring within buffer time', () => {
      const tokenParsed = {
        exp: Math.floor(Date.now() / 1000) + 15, // 15 seconds from now (within 30s buffer)
      };
      expect(AuthService.isTokenExpired(tokenParsed)).toBe(true);
    });

    it('should return true for token without exp field', () => {
      const tokenParsed = {};
      expect(AuthService.isTokenExpired(tokenParsed)).toBe(true);
    });

    it('should return true for null token', () => {
      expect(AuthService.isTokenExpired(null as never)).toBe(true);
    });
  });

  describe('parseJwtToken', () => {
    it('should parse valid JWT token', () => {
      // Create a simple JWT-like token (header.payload.signature)
      const payload = { sub: '123', email: 'test@example.com' };
      const base64Payload = window.btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      const parsed = AuthService.parseJwtToken(token);
      expect(parsed).toEqual(payload);
    });

    it('should handle token with URL-safe base64', () => {
      const payload = { sub: '123', email: 'test@example.com' };
      const base64Payload = window.btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
      const token = `header.${base64Payload}.signature`;

      const parsed = AuthService.parseJwtToken(token);
      expect(parsed).toBeTruthy();
    });

    it('should return null for invalid token', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const parsed = AuthService.parseJwtToken('invalid-token');
      expect(parsed).toBeNull();
      consoleSpy.mockRestore();
    });

    it('should return null for empty token', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const parsed = AuthService.parseJwtToken('');
      expect(parsed).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('createUserInfoFromToken', () => {
    it('should create user info from complete token', () => {
      const tokenParsed = {
        sub: '123',
        preferred_username: 'testuser',
        email: 'test@example.com',
        given_name: 'Test',
        family_name: 'User',
        designation: 'Engineer',
        agency: 'CDAO',
        exp: Math.floor(Date.now() / 1000) + 3600,
        realm_access: {
          roles: ['marketplace-requestor'],
        },
      };

      const userInfo = AuthService.createUserInfoFromToken(tokenParsed);

      expect(userInfo.id).toBe('123');
      expect(userInfo.username).toBe('testuser');
      expect(userInfo.email).toBe('test@example.com');
      expect(userInfo.firstName).toBe('Test');
      expect(userInfo.lastName).toBe('User');
      expect(userInfo.designation).toBe('Engineer');
      expect(userInfo.agency).toBe('CDAO');
      expect(userInfo.roles).toContain(AppRoles.REQUESTOR);
      expect(userInfo.keycloakRoles).toContain('marketplace-requestor');
      expect(userInfo.tokenExpiry).toBeDefined();
    });

    it('should handle token with missing optional fields', () => {
      const tokenParsed = {
        sub: '123',
        realm_access: {
          roles: ['marketplace-approver'],
        },
      };

      const userInfo = AuthService.createUserInfoFromToken(tokenParsed);

      expect(userInfo.id).toBe('123');
      expect(userInfo.username).toBeTruthy(); // Will have fallback value
      expect(userInfo.email).toBe('');
      expect(userInfo.firstName).toBe('');
      expect(userInfo.lastName).toBe('');
      expect(userInfo.designation).toBe('');
      expect(userInfo.agency).toBe('');
      expect(userInfo.roles).toContain(AppRoles.APPROVER);
    });

    it('should fallback to name when preferred_username is missing', () => {
      const tokenParsed = {
        sub: '123',
        name: 'Test User',
        realm_access: {
          roles: [],
        },
      };

      const userInfo = AuthService.createUserInfoFromToken(tokenParsed);
      expect(userInfo.username).toBe('Test User');
    });

    it('should use "unknown" when both preferred_username and name are missing', () => {
      const tokenParsed = {
        realm_access: {
          roles: [],
        },
      };

      const userInfo = AuthService.createUserInfoFromToken(tokenParsed);
      expect(userInfo.id).toBe('unknown');
      expect(userInfo.username).toBe('unknown');
    });
  });
});
