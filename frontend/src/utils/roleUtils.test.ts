import { describe, test, expect } from "vitest";
import {
  MARKETPLACE_ROLES,
  hasMarketplaceRole,
  isApprover,
  isRequestor,
  getMarketplaceRoles,
  hasAnyRole,
  hasAllRoles,
  type MarketplaceRole,
  type KeycloakTokenParsed,
} from "./roleUtils";

describe("roleUtils", () => {
  // Test data helpers
  const createTokenParsed = (
    marketplaceRoles: string[] = []
  ): KeycloakTokenParsed => ({
    preferred_username: "testuser",
    email: "test@example.com",
    given_name: "Test",
    family_name: "User",
    resource_access: {
      marketplace: {
        roles: marketplaceRoles,
      },
      account: {
        roles: ["manage-account", "view-profile"],
      },
    },
  });

  const createTokenWithoutMarketplace = (): KeycloakTokenParsed => ({
    preferred_username: "testuser",
    email: "test@example.com",
    given_name: "Test",
    family_name: "User",
    resource_access: {
      account: {
        roles: ["manage-account"],
      },
    },
  });

  describe("MARKETPLACE_ROLES", () => {
    test("should have correct role constants", () => {
      expect(MARKETPLACE_ROLES.REQUESTOR).toBe("marketplace-requestor");
      expect(MARKETPLACE_ROLES.APPROVER).toBe("marketplace-approver");
    });

    test("should be readonly", () => {
      // TypeScript enforces this at compile time, but we can test the structure
      expect(Object.keys(MARKETPLACE_ROLES)).toEqual(["REQUESTOR", "APPROVER"]);
      expect(Object.values(MARKETPLACE_ROLES)).toEqual([
        "marketplace-requestor",
        "marketplace-approver",
      ]);
    });
  });

  describe("hasMarketplaceRole", () => {
    test("should return true when user has the specified role", () => {
      const tokenParsed = createTokenParsed([MARKETPLACE_ROLES.REQUESTOR]);

      expect(hasMarketplaceRole(tokenParsed, MARKETPLACE_ROLES.REQUESTOR)).toBe(
        true
      );
    });

    test("should return false when user does not have the specified role", () => {
      const tokenParsed = createTokenParsed([MARKETPLACE_ROLES.REQUESTOR]);

      expect(hasMarketplaceRole(tokenParsed, MARKETPLACE_ROLES.APPROVER)).toBe(
        false
      );
    });

    test("should return true when user has multiple roles including the specified one", () => {
      const tokenParsed = createTokenParsed([
        MARKETPLACE_ROLES.REQUESTOR,
        MARKETPLACE_ROLES.APPROVER,
      ]);

      expect(hasMarketplaceRole(tokenParsed, MARKETPLACE_ROLES.REQUESTOR)).toBe(
        true
      );
      expect(hasMarketplaceRole(tokenParsed, MARKETPLACE_ROLES.APPROVER)).toBe(
        true
      );
    });

    test("should return false when tokenParsed is undefined", () => {
      expect(hasMarketplaceRole(undefined, MARKETPLACE_ROLES.REQUESTOR)).toBe(
        false
      );
    });

    test("should return false when resource_access is undefined", () => {
      const tokenParsed: KeycloakTokenParsed = {
        preferred_username: "testuser",
        email: "test@example.com",
      };

      expect(hasMarketplaceRole(tokenParsed, MARKETPLACE_ROLES.REQUESTOR)).toBe(
        false
      );
    });

    test("should return false when marketplace resource is not present", () => {
      const tokenParsed = createTokenWithoutMarketplace();

      expect(hasMarketplaceRole(tokenParsed, MARKETPLACE_ROLES.REQUESTOR)).toBe(
        false
      );
    });

    test("should return false when marketplace roles array is empty", () => {
      const tokenParsed = createTokenParsed([]);

      expect(hasMarketplaceRole(tokenParsed, MARKETPLACE_ROLES.REQUESTOR)).toBe(
        false
      );
    });

    test("should handle custom marketplace roles", () => {
      const tokenParsed = createTokenParsed([
        "custom-role",
        MARKETPLACE_ROLES.REQUESTOR,
      ]);

      expect(hasMarketplaceRole(tokenParsed, MARKETPLACE_ROLES.REQUESTOR)).toBe(
        true
      );
      expect(
        hasMarketplaceRole(tokenParsed, "custom-role" as MarketplaceRole)
      ).toBe(true);
    });
  });

  describe("isApprover", () => {
    test("should return true when user has approver role", () => {
      const tokenParsed = createTokenParsed([MARKETPLACE_ROLES.APPROVER]);

      expect(isApprover(tokenParsed)).toBe(true);
    });

    test("should return false when user does not have approver role", () => {
      const tokenParsed = createTokenParsed([MARKETPLACE_ROLES.REQUESTOR]);

      expect(isApprover(tokenParsed)).toBe(false);
    });

    test("should return true when user has both approver and requestor roles", () => {
      const tokenParsed = createTokenParsed([
        MARKETPLACE_ROLES.APPROVER,
        MARKETPLACE_ROLES.REQUESTOR,
      ]);

      expect(isApprover(tokenParsed)).toBe(true);
    });

    test("should return false when tokenParsed is undefined", () => {
      expect(isApprover(undefined)).toBe(false);
    });

    test("should return false when user has no marketplace roles", () => {
      const tokenParsed = createTokenParsed([]);

      expect(isApprover(tokenParsed)).toBe(false);
    });

    test("should return false when marketplace resource is not present", () => {
      const tokenParsed = createTokenWithoutMarketplace();

      expect(isApprover(tokenParsed)).toBe(false);
    });
  });

  describe("isRequestor", () => {
    test("should return true when user has requestor role", () => {
      const tokenParsed = createTokenParsed([MARKETPLACE_ROLES.REQUESTOR]);

      expect(isRequestor(tokenParsed)).toBe(true);
    });

    test("should return false when user does not have requestor role", () => {
      const tokenParsed = createTokenParsed([MARKETPLACE_ROLES.APPROVER]);

      expect(isRequestor(tokenParsed)).toBe(false);
    });

    test("should return true when user has both requestor and approver roles", () => {
      const tokenParsed = createTokenParsed([
        MARKETPLACE_ROLES.REQUESTOR,
        MARKETPLACE_ROLES.APPROVER,
      ]);

      expect(isRequestor(tokenParsed)).toBe(true);
    });

    test("should return false when tokenParsed is undefined", () => {
      expect(isRequestor(undefined)).toBe(false);
    });

    test("should return false when user has no marketplace roles", () => {
      const tokenParsed = createTokenParsed([]);

      expect(isRequestor(tokenParsed)).toBe(false);
    });

    test("should return false when marketplace resource is not present", () => {
      const tokenParsed = createTokenWithoutMarketplace();

      expect(isRequestor(tokenParsed)).toBe(false);
    });
  });

  describe("getMarketplaceRoles", () => {
    test("should return array of marketplace roles when user has roles", () => {
      const roles = [MARKETPLACE_ROLES.REQUESTOR, MARKETPLACE_ROLES.APPROVER];
      const tokenParsed = createTokenParsed(roles);

      expect(getMarketplaceRoles(tokenParsed)).toEqual(roles);
    });

    test("should return empty array when user has no marketplace roles", () => {
      const tokenParsed = createTokenParsed([]);

      expect(getMarketplaceRoles(tokenParsed)).toEqual([]);
    });

    test("should return empty array when tokenParsed is undefined", () => {
      expect(getMarketplaceRoles(undefined)).toEqual([]);
    });

    test("should return empty array when resource_access is undefined", () => {
      const tokenParsed: KeycloakTokenParsed = {
        preferred_username: "testuser",
        email: "test@example.com",
      };

      expect(getMarketplaceRoles(tokenParsed)).toEqual([]);
    });

    test("should return empty array when marketplace resource is not present", () => {
      const tokenParsed = createTokenWithoutMarketplace();

      expect(getMarketplaceRoles(tokenParsed)).toEqual([]);
    });

    test("should return custom roles along with marketplace roles", () => {
      const roles = [
        "custom-role",
        MARKETPLACE_ROLES.REQUESTOR,
        "another-custom",
      ];
      const tokenParsed = createTokenParsed(roles);

      expect(getMarketplaceRoles(tokenParsed)).toEqual(roles);
    });

    test("should return single role as array", () => {
      const tokenParsed = createTokenParsed([MARKETPLACE_ROLES.APPROVER]);

      expect(getMarketplaceRoles(tokenParsed)).toEqual([
        MARKETPLACE_ROLES.APPROVER,
      ]);
    });
  });

  describe("hasAnyRole", () => {
    test("should return true when user has at least one of the specified roles", () => {
      const tokenParsed = createTokenParsed([MARKETPLACE_ROLES.REQUESTOR]);
      const rolesToCheck = [
        MARKETPLACE_ROLES.REQUESTOR,
        MARKETPLACE_ROLES.APPROVER,
      ];

      expect(hasAnyRole(tokenParsed, rolesToCheck)).toBe(true);
    });

    test("should return true when user has all of the specified roles", () => {
      const tokenParsed = createTokenParsed([
        MARKETPLACE_ROLES.REQUESTOR,
        MARKETPLACE_ROLES.APPROVER,
      ]);
      const rolesToCheck = [
        MARKETPLACE_ROLES.REQUESTOR,
        MARKETPLACE_ROLES.APPROVER,
      ];

      expect(hasAnyRole(tokenParsed, rolesToCheck)).toBe(true);
    });

    test("should return false when user has none of the specified roles", () => {
      const tokenParsed = createTokenParsed(["some-other-role"]);
      const rolesToCheck = [
        MARKETPLACE_ROLES.REQUESTOR,
        MARKETPLACE_ROLES.APPROVER,
      ];

      expect(hasAnyRole(tokenParsed, rolesToCheck)).toBe(false);
    });

    test("should return false when tokenParsed is undefined", () => {
      const rolesToCheck = [
        MARKETPLACE_ROLES.REQUESTOR,
        MARKETPLACE_ROLES.APPROVER,
      ];

      expect(hasAnyRole(undefined, rolesToCheck)).toBe(false);
    });

    test("should return false when roles array is empty", () => {
      const tokenParsed = createTokenParsed([MARKETPLACE_ROLES.REQUESTOR]);

      expect(hasAnyRole(tokenParsed, [])).toBe(false);
    });

    test("should return true with single role in array", () => {
      const tokenParsed = createTokenParsed([MARKETPLACE_ROLES.APPROVER]);

      expect(hasAnyRole(tokenParsed, [MARKETPLACE_ROLES.APPROVER])).toBe(true);
    });

    test("should return false with single role not possessed by user", () => {
      const tokenParsed = createTokenParsed([MARKETPLACE_ROLES.REQUESTOR]);

      expect(hasAnyRole(tokenParsed, [MARKETPLACE_ROLES.APPROVER])).toBe(false);
    });

    test("should handle marketplace resource not present", () => {
      const tokenParsed = createTokenWithoutMarketplace();
      const rolesToCheck = [MARKETPLACE_ROLES.REQUESTOR];

      expect(hasAnyRole(tokenParsed, rolesToCheck)).toBe(false);
    });
  });

  describe("hasAllRoles", () => {
    test("should return true when user has all of the specified roles", () => {
      const tokenParsed = createTokenParsed([
        MARKETPLACE_ROLES.REQUESTOR,
        MARKETPLACE_ROLES.APPROVER,
      ]);
      const rolesToCheck = [
        MARKETPLACE_ROLES.REQUESTOR,
        MARKETPLACE_ROLES.APPROVER,
      ];

      expect(hasAllRoles(tokenParsed, rolesToCheck)).toBe(true);
    });

    test("should return false when user has only some of the specified roles", () => {
      const tokenParsed = createTokenParsed([MARKETPLACE_ROLES.REQUESTOR]);
      const rolesToCheck = [
        MARKETPLACE_ROLES.REQUESTOR,
        MARKETPLACE_ROLES.APPROVER,
      ];

      expect(hasAllRoles(tokenParsed, rolesToCheck)).toBe(false);
    });

    test("should return false when user has none of the specified roles", () => {
      const tokenParsed = createTokenParsed(["some-other-role"]);
      const rolesToCheck = [
        MARKETPLACE_ROLES.REQUESTOR,
        MARKETPLACE_ROLES.APPROVER,
      ];

      expect(hasAllRoles(tokenParsed, rolesToCheck)).toBe(false);
    });

    test("should return false when tokenParsed is undefined", () => {
      const rolesToCheck = [
        MARKETPLACE_ROLES.REQUESTOR,
        MARKETPLACE_ROLES.APPROVER,
      ];

      expect(hasAllRoles(undefined, rolesToCheck)).toBe(false);
    });

    test("should return true when roles array is empty", () => {
      const tokenParsed = createTokenParsed([MARKETPLACE_ROLES.REQUESTOR]);

      expect(hasAllRoles(tokenParsed, [])).toBe(true);
    });

    test("should return true with single role that user has", () => {
      const tokenParsed = createTokenParsed([MARKETPLACE_ROLES.APPROVER]);

      expect(hasAllRoles(tokenParsed, [MARKETPLACE_ROLES.APPROVER])).toBe(true);
    });

    test("should return false with single role that user does not have", () => {
      const tokenParsed = createTokenParsed([MARKETPLACE_ROLES.REQUESTOR]);

      expect(hasAllRoles(tokenParsed, [MARKETPLACE_ROLES.APPROVER])).toBe(
        false
      );
    });

    test("should handle user with extra roles beyond required", () => {
      const tokenParsed = createTokenParsed([
        MARKETPLACE_ROLES.REQUESTOR,
        MARKETPLACE_ROLES.APPROVER,
        "extra-role",
      ]);
      const rolesToCheck = [MARKETPLACE_ROLES.REQUESTOR];

      expect(hasAllRoles(tokenParsed, rolesToCheck)).toBe(true);
    });

    test("should handle marketplace resource not present", () => {
      const tokenParsed = createTokenWithoutMarketplace();
      const rolesToCheck = [MARKETPLACE_ROLES.REQUESTOR];

      expect(hasAllRoles(tokenParsed, rolesToCheck)).toBe(false);
    });
  });

  describe("Edge Cases and Integration", () => {
    test("should handle malformed token structure", () => {
      const malformedToken: KeycloakTokenParsed = {
        preferred_username: "testuser",
        resource_access: {
          marketplace: {
            roles: [], // Empty roles array
          },
        },
      };

      expect(
        hasMarketplaceRole(malformedToken, MARKETPLACE_ROLES.REQUESTOR)
      ).toBe(false);
      expect(isApprover(malformedToken)).toBe(false);
      expect(isRequestor(malformedToken)).toBe(false);
      expect(getMarketplaceRoles(malformedToken)).toEqual([]);
      expect(hasAnyRole(malformedToken, [MARKETPLACE_ROLES.REQUESTOR])).toBe(
        false
      );
      expect(hasAllRoles(malformedToken, [MARKETPLACE_ROLES.REQUESTOR])).toBe(
        false
      );
    });

    test("should handle token with undefined marketplace roles", () => {
      const tokenParsed: KeycloakTokenParsed = {
        preferred_username: "testuser",
        resource_access: {
          marketplace: {
            roles: undefined as any, // Simulate undefined roles
          },
        },
      };

      expect(getMarketplaceRoles(tokenParsed)).toEqual([]);
      expect(hasMarketplaceRole(tokenParsed, MARKETPLACE_ROLES.REQUESTOR)).toBe(
        false
      );
    });

    test("should be consistent across all functions with same input", () => {
      const tokenParsed = createTokenParsed([MARKETPLACE_ROLES.APPROVER]);

      // All functions should agree on the user's status
      expect(isApprover(tokenParsed)).toBe(true);
      expect(isRequestor(tokenParsed)).toBe(false);
      expect(hasMarketplaceRole(tokenParsed, MARKETPLACE_ROLES.APPROVER)).toBe(
        true
      );
      expect(hasMarketplaceRole(tokenParsed, MARKETPLACE_ROLES.REQUESTOR)).toBe(
        false
      );
      expect(hasAnyRole(tokenParsed, [MARKETPLACE_ROLES.APPROVER])).toBe(true);
      expect(hasAllRoles(tokenParsed, [MARKETPLACE_ROLES.APPROVER])).toBe(true);
      expect(getMarketplaceRoles(tokenParsed)).toContain(
        MARKETPLACE_ROLES.APPROVER
      );
    });

    test("should handle user with dual roles consistently", () => {
      const tokenParsed = createTokenParsed([
        MARKETPLACE_ROLES.REQUESTOR,
        MARKETPLACE_ROLES.APPROVER,
      ]);

      expect(isApprover(tokenParsed)).toBe(true);
      expect(isRequestor(tokenParsed)).toBe(true);
      expect(
        hasAnyRole(tokenParsed, [
          MARKETPLACE_ROLES.REQUESTOR,
          MARKETPLACE_ROLES.APPROVER,
        ])
      ).toBe(true);
      expect(
        hasAllRoles(tokenParsed, [
          MARKETPLACE_ROLES.REQUESTOR,
          MARKETPLACE_ROLES.APPROVER,
        ])
      ).toBe(true);
      expect(getMarketplaceRoles(tokenParsed)).toHaveLength(2);
    });

    test("should handle empty and null inputs gracefully", () => {
      // Test with null/undefined inputs
      expect(hasMarketplaceRole(null as any, MARKETPLACE_ROLES.REQUESTOR)).toBe(
        false
      );
      expect(isApprover(null as any)).toBe(false);
      expect(isRequestor(null as any)).toBe(false);
      expect(getMarketplaceRoles(null as any)).toEqual([]);
      expect(hasAnyRole(null as any, [MARKETPLACE_ROLES.REQUESTOR])).toBe(
        false
      );
      expect(hasAllRoles(null as any, [MARKETPLACE_ROLES.REQUESTOR])).toBe(
        false
      );
    });
  });

  describe("TypeScript Type Safety", () => {
    test("should work with typed MarketplaceRole", () => {
      const tokenParsed = createTokenParsed([MARKETPLACE_ROLES.REQUESTOR]);
      const role: MarketplaceRole = MARKETPLACE_ROLES.REQUESTOR;

      expect(hasMarketplaceRole(tokenParsed, role)).toBe(true);
    });

    test("should work with arrays of MarketplaceRole", () => {
      const tokenParsed = createTokenParsed([MARKETPLACE_ROLES.REQUESTOR]);
      const roles: MarketplaceRole[] = [
        MARKETPLACE_ROLES.REQUESTOR,
        MARKETPLACE_ROLES.APPROVER,
      ];

      expect(hasAnyRole(tokenParsed, roles)).toBe(true);
      expect(hasAllRoles(tokenParsed, roles)).toBe(false);
    });
  });
});
