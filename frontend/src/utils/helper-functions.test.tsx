import { describe, test, expect } from "vitest";
import { formatPrice, getIconPath } from "./helper-functions";

describe("Helper Functions", () => {
  describe("formatPrice", () => {
    describe("ROM (Rough Order of Magnitude) pricing", () => {
      test("should return ROM string when ROM is provided, regardless of price", () => {
        expect(formatPrice(100, "$5K - $10K")).toBe("$5K - $10K");
        expect(formatPrice(0, "$1M - $5M")).toBe("$1M - $5M");
        expect(formatPrice(999999, "TBD")).toBe("TBD");
      });

      test("should handle empty ROM string", () => {
        expect(formatPrice(100, "")).toBe("$100");
      });

      test("should handle ROM with special characters", () => {
        expect(formatPrice(0, "$100K+")).toBe("$100K+");
        expect(formatPrice(0, "€50K - €100K")).toBe("€50K - €100K");
        expect(formatPrice(0, "Contact for pricing")).toBe(
          "Contact for pricing"
        );
      });
    });

    describe("Free pricing", () => {
      test("should return 'Free' when price is 0 and no ROM provided", () => {
        expect(formatPrice(0)).toBe("Free");
        expect(formatPrice(0, undefined)).toBe("Free");
      });

      test("should prioritize ROM over free pricing", () => {
        expect(formatPrice(0, "$1K - $5K")).toBe("$1K - $5K");
      });
    });

    describe("Regular pricing", () => {
      test("should format positive prices with dollar sign", () => {
        expect(formatPrice(1)).toBe("$1");
        expect(formatPrice(100)).toBe("$100");
        expect(formatPrice(1000)).toBe("$1,000");
        expect(formatPrice(1234567)).toBe("$1,234,567");
      });

      test("should handle decimal prices correctly", () => {
        expect(formatPrice(99.99)).toBe("$99.99");
        expect(formatPrice(1000.5)).toBe("$1,000.5");
        expect(formatPrice(123.456)).toBe("$123.456");
      });

      test("should format large numbers with commas", () => {
        expect(formatPrice(1000)).toBe("$1,000");
        expect(formatPrice(10000)).toBe("$10,000");
        expect(formatPrice(100000)).toBe("$100,000");
        expect(formatPrice(1000000)).toBe("$1,000,000");
        expect(formatPrice(1234567890)).toBe("$1,234,567,890");
      });

      test("should handle edge case numbers", () => {
        expect(formatPrice(1)).toBe("$1");
        expect(formatPrice(999)).toBe("$999");
        expect(formatPrice(1001)).toBe("$1,001");
      });
    });

    describe("Edge cases and type safety", () => {
      test("should handle negative prices (though not expected in normal use)", () => {
        expect(formatPrice(-100)).toBe("$-100");
        expect(formatPrice(-1000)).toBe("$-1,000");
      });

      test("should handle very large numbers", () => {
        expect(formatPrice(Number.MAX_SAFE_INTEGER)).toBe(
          "$9,007,199,254,740,991"
        );
      });

      test("should handle null/undefined ROM parameter", () => {
        expect(formatPrice(100, null as any)).toBe("$100");
        expect(formatPrice(100, undefined)).toBe("$100");
      });
    });

    describe("Priority order", () => {
      test("should prioritize ROM over price value", () => {
        expect(formatPrice(999999, "Contact Sales")).toBe("Contact Sales");
      });

      test("should prioritize ROM over free pricing", () => {
        expect(formatPrice(0, "Free Trial Available")).toBe(
          "Free Trial Available"
        );
      });

      test("should show 'Free' only when price is 0 and no ROM", () => {
        expect(formatPrice(0)).toBe("Free");
        expect(formatPrice(1)).toBe("$1");
      });
    });
  });

  describe("getIconPath", () => {
    describe("Known product types", () => {
      test("should return correct icon for 'Usage Based Tool'", () => {
        expect(getIconPath("Usage Based Tool")).toBe(
          "/assets/icons/icon_user-tool.png"
        );
      });

      test("should return correct icon for 'Bundle'", () => {
        expect(getIconPath("Bundle")).toBe("/assets/icons/icon_bundle.png");
      });

      test("should return correct icon for 'Seat Based Tool'", () => {
        expect(getIconPath("Seat Based Tool")).toBe(
          "/assets/icons/icon_seat-based-tool.png"
        );
      });
    });

    describe("Case sensitivity", () => {
      test("should be case sensitive - incorrect casing returns default", () => {
        expect(getIconPath("usage based tool")).toBe(
          "/assets/icons/icon_user-tool.png"
        );
        expect(getIconPath("USAGE BASED TOOL")).toBe(
          "/assets/icons/icon_user-tool.png"
        );
        expect(getIconPath("Bundle ")).toBe("/assets/icons/icon_user-tool.png");
        expect(getIconPath(" Bundle")).toBe("/assets/icons/icon_user-tool.png");
      });

      test("should handle exact string matches only", () => {
        expect(getIconPath("Usage Based")).toBe(
          "/assets/icons/icon_user-tool.png"
        );
        expect(getIconPath("Based Tool")).toBe(
          "/assets/icons/icon_user-tool.png"
        );
        expect(getIconPath("Tool")).toBe("/assets/icons/icon_user-tool.png");
      });
    });

    describe("Unknown/invalid product types", () => {
      test("should return default icon for unknown types", () => {
        expect(getIconPath("Unknown Type")).toBe(
          "/assets/icons/icon_user-tool.png"
        );
        expect(getIconPath("License Based")).toBe(
          "/assets/icons/icon_user-tool.png"
        );
        expect(getIconPath("Custom Tool")).toBe(
          "/assets/icons/icon_user-tool.png"
        );
        expect(getIconPath("Software Package")).toBe(
          "/assets/icons/icon_user-tool.png"
        );
      });

      test("should return default icon for empty/null/undefined inputs", () => {
        expect(getIconPath("")).toBe("/assets/icons/icon_user-tool.png");
        expect(getIconPath(null as any)).toBe(
          "/assets/icons/icon_user-tool.png"
        );
        expect(getIconPath(undefined as any)).toBe(
          "/assets/icons/icon_user-tool.png"
        );
      });

      test("should return default icon for special characters", () => {
        expect(getIconPath("@#$%")).toBe("/assets/icons/icon_user-tool.png");
        expect(getIconPath("123")).toBe("/assets/icons/icon_user-tool.png");
        expect(getIconPath("🔧")).toBe("/assets/icons/icon_user-tool.png");
      });
    });

    describe("Edge cases", () => {
      test("should handle whitespace variations", () => {
        expect(getIconPath("Usage Based Tool ")).toBe(
          "/assets/icons/icon_user-tool.png"
        );
        expect(getIconPath(" Usage Based Tool")).toBe(
          "/assets/icons/icon_user-tool.png"
        );
        expect(getIconPath("Usage  Based  Tool")).toBe(
          "/assets/icons/icon_user-tool.png"
        );
      });

      test("should handle very long strings", () => {
        const longString =
          "This is a very long product type name that should return the default icon";
        expect(getIconPath(longString)).toBe(
          "/assets/icons/icon_user-tool.png"
        );
      });

      test("should be consistent with default fallback", () => {
        const unknownTypes = ["random", "test", "foo", "bar", "baz"];
        unknownTypes.forEach((type) => {
          expect(getIconPath(type)).toBe("/assets/icons/icon_user-tool.png");
        });
      });
    });

    describe("All supported types coverage", () => {
      test("should have icons for all expected product types", () => {
        const supportedTypes = [
          "Usage Based Tool",
          "Bundle",
          "Seat Based Tool",
        ];

        const expectedPaths = [
          "/assets/icons/icon_user-tool.png",
          "/assets/icons/icon_bundle.png",
          "/assets/icons/icon_seat-based-tool.png",
        ];

        supportedTypes.forEach((type, index) => {
          expect(getIconPath(type)).toBe(expectedPaths[index]);
        });
      });

      test("should always return a valid path", () => {
        const testTypes = [
          "Usage Based Tool",
          "Bundle",
          "Seat Based Tool",
          "Unknown",
          "",
          null,
          undefined,
        ];

        testTypes.forEach((type) => {
          const result = getIconPath(type as any);
          expect(result).toMatch(/^\/assets\/icons\/icon_.*\.png$/);
          expect(result).toBeTruthy();
        });
      });
    });
  });

  describe("Integration scenarios", () => {
    test("should work together for product display scenarios", () => {
      // Simulate real product data scenarios
      const products = [
        { name: "Analytics Tool", type: "Usage Based Tool", price: 1500 },
        {
          name: "Enterprise Suite",
          type: "Bundle",
          price: 0,
          rom: "$50K - $100K",
        },
        { name: "Collaboration Platform", type: "Seat Based Tool", price: 0 },
        { name: "Legacy System", type: "Custom License", price: 25000 },
      ];

      products.forEach((product) => {
        const iconPath = getIconPath(product.type);
        const priceDisplay = formatPrice(product.price, product.rom);

        // Icon should always be a valid path
        expect(iconPath).toMatch(/^\/assets\/icons\/icon_.*\.png$/);

        // Price should always be formatted
        expect(priceDisplay).toBeTruthy();
        expect(typeof priceDisplay).toBe("string");
      });
    });

    test("should handle product catalog rendering data", () => {
      const catalogItem = {
        type: "Bundle",
        price: 0,
        rom: "Contact Sales",
      };

      expect(getIconPath(catalogItem.type)).toBe(
        "/assets/icons/icon_bundle.png"
      );
      expect(formatPrice(catalogItem.price, catalogItem.rom)).toBe(
        "Contact Sales"
      );
    });

    test("should handle cart item calculation scenarios", () => {
      const cartItem = {
        type: "Usage Based Tool",
        unitPrice: 100,
        quantity: 5,
      };

      const totalPrice = cartItem.unitPrice * cartItem.quantity;
      expect(getIconPath(cartItem.type)).toBe(
        "/assets/icons/icon_user-tool.png"
      );
      expect(formatPrice(totalPrice)).toBe("$500");
    });
  });
});
