import { describe, it, expect } from 'vitest';
import { AppRoles, Resources, Actions, ROLE_PERMISSIONS } from './auth';

describe('auth types', () => {
  describe('AppRoles enum', () => {
    it('should have REQUESTOR role', () => {
      expect(AppRoles.REQUESTOR).toBe('REQUESTOR');
    });

    it('should have APPROVER role', () => {
      expect(AppRoles.APPROVER).toBe('APPROVER');
    });

    it('should have exactly 2 roles', () => {
      const roles = Object.values(AppRoles);
      expect(roles).toHaveLength(2);
    });
  });

  describe('Resources enum', () => {
    it('should have REQUESTS resource', () => {
      expect(Resources.REQUESTS).toBe('requests');
    });

    it('should have PRODUCTS resource', () => {
      expect(Resources.PRODUCTS).toBe('products');
    });

    it('should have APPROVALS resource', () => {
      expect(Resources.APPROVALS).toBe('approvals');
    });

    it('should have exactly 3 resources', () => {
      const resources = Object.values(Resources);
      expect(resources).toHaveLength(3);
    });
  });

  describe('Actions enum', () => {
    it('should have CREATE action', () => {
      expect(Actions.CREATE).toBe('create');
    });

    it('should have READ action', () => {
      expect(Actions.READ).toBe('read');
    });

    it('should have UPDATE action', () => {
      expect(Actions.UPDATE).toBe('update');
    });

    it('should have DELETE action', () => {
      expect(Actions.DELETE).toBe('delete');
    });

    it('should have APPROVE action', () => {
      expect(Actions.APPROVE).toBe('approve');
    });

    it('should have REJECT action', () => {
      expect(Actions.REJECT).toBe('reject');
    });

    it('should have exactly 6 actions', () => {
      const actions = Object.values(Actions);
      expect(actions).toHaveLength(6);
    });
  });

  describe('ROLE_PERMISSIONS', () => {
    describe('REQUESTOR permissions', () => {
      it('should have permissions defined', () => {
        expect(ROLE_PERMISSIONS[AppRoles.REQUESTOR]).toBeDefined();
        expect(Array.isArray(ROLE_PERMISSIONS[AppRoles.REQUESTOR])).toBe(true);
      });

      it('should have requests resource permissions', () => {
        const requestsPermission = ROLE_PERMISSIONS[AppRoles.REQUESTOR].find(
          p => p.resource === Resources.REQUESTS
        );
        expect(requestsPermission).toBeDefined();
        expect(requestsPermission?.actions).toContain(Actions.CREATE);
        expect(requestsPermission?.actions).toContain(Actions.READ);
        expect(requestsPermission?.actions).toContain(Actions.UPDATE);
        expect(requestsPermission?.actions).not.toContain(Actions.DELETE);
      });

      it('should have products resource permissions', () => {
        const productsPermission = ROLE_PERMISSIONS[AppRoles.REQUESTOR].find(
          p => p.resource === Resources.PRODUCTS
        );
        expect(productsPermission).toBeDefined();
        expect(productsPermission?.actions).toContain(Actions.READ);
        expect(productsPermission?.actions).toHaveLength(1);
      });

      it('should not have approvals resource permissions', () => {
        const approvalsPermission = ROLE_PERMISSIONS[AppRoles.REQUESTOR].find(
          p => p.resource === Resources.APPROVALS
        );
        expect(approvalsPermission).toBeUndefined();
      });

      it('should not have approve or reject actions', () => {
        const allActions = ROLE_PERMISSIONS[AppRoles.REQUESTOR].flatMap(p => p.actions);
        expect(allActions).not.toContain(Actions.APPROVE);
        expect(allActions).not.toContain(Actions.REJECT);
      });
    });

    describe('APPROVER permissions', () => {
      it('should have permissions defined', () => {
        expect(ROLE_PERMISSIONS[AppRoles.APPROVER]).toBeDefined();
        expect(Array.isArray(ROLE_PERMISSIONS[AppRoles.APPROVER])).toBe(true);
      });

      it('should have requests resource permissions', () => {
        const requestsPermission = ROLE_PERMISSIONS[AppRoles.APPROVER].find(
          p => p.resource === Resources.REQUESTS
        );
        expect(requestsPermission).toBeDefined();
        expect(requestsPermission?.actions).toContain(Actions.READ);
        expect(requestsPermission?.actions).toContain(Actions.UPDATE);
        expect(requestsPermission?.actions).toContain(Actions.APPROVE);
        expect(requestsPermission?.actions).toContain(Actions.REJECT);
        expect(requestsPermission?.actions).not.toContain(Actions.CREATE);
      });

      it('should have products resource permissions', () => {
        const productsPermission = ROLE_PERMISSIONS[AppRoles.APPROVER].find(
          p => p.resource === Resources.PRODUCTS
        );
        expect(productsPermission).toBeDefined();
        expect(productsPermission?.actions).toContain(Actions.READ);
      });

      it('should have approvals resource permissions', () => {
        const approvalsPermission = ROLE_PERMISSIONS[AppRoles.APPROVER].find(
          p => p.resource === Resources.APPROVALS
        );
        expect(approvalsPermission).toBeDefined();
        expect(approvalsPermission?.actions).toContain(Actions.READ);
        expect(approvalsPermission?.actions).toContain(Actions.APPROVE);
        expect(approvalsPermission?.actions).toContain(Actions.REJECT);
      });

      it('should have approve and reject actions', () => {
        const allActions = ROLE_PERMISSIONS[AppRoles.APPROVER].flatMap(p => p.actions);
        expect(allActions).toContain(Actions.APPROVE);
        expect(allActions).toContain(Actions.REJECT);
      });
    });

    it('should have permissions for all defined roles', () => {
      const roles = Object.values(AppRoles);
      roles.forEach(role => {
        expect(ROLE_PERMISSIONS[role]).toBeDefined();
      });
    });

    it('should have valid permission structure', () => {
      Object.entries(ROLE_PERMISSIONS).forEach(([_role, permissions]) => {
        expect(Array.isArray(permissions)).toBe(true);
        permissions.forEach(permission => {
          expect(permission).toHaveProperty('resource');
          expect(permission).toHaveProperty('actions');
          expect(typeof permission.resource).toBe('string');
          expect(Array.isArray(permission.actions)).toBe(true);
        });
      });
    });
  });
});
