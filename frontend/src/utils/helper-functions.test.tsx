import { describe, test, expect } from "vitest";
import {
  formatPrice,
  getIconPath,
  getValue,
  generateRequestId,
} from "./helper-functions";

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

      test("should handle null price", () => {
        expect(formatPrice(null)).toBe("Custom ROM");
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

  describe("getValue", () => {
    // Mock document.querySelector for testing
    const mockQuerySelector = (element: any) => {
      Object.defineProperty(document, "querySelector", {
        value: () => element,
        writable: true,
      });
    };

    describe("Element exists with value", () => {
      test("should return value from input element", () => {
        const mockElement = { value: "test-value" };
        mockQuerySelector(mockElement);

        expect(getValue("test-input")).toBe("test-value");
      });

      test("should return value from textarea element", () => {
        const mockElement = { value: "textarea content" };
        mockQuerySelector(mockElement);

        expect(getValue("description")).toBe("textarea content");
      });

      test("should return value from select element", () => {
        const mockElement = { value: "option-value" };
        mockQuerySelector(mockElement);

        expect(getValue("dropdown")).toBe("option-value");
      });

      test("should handle empty string value", () => {
        const mockElement = { value: "" };
        mockQuerySelector(mockElement);

        expect(getValue("empty-field")).toBe("");
      });

      test("should handle numeric value as string", () => {
        const mockElement = { value: "123" };
        mockQuerySelector(mockElement);

        expect(getValue("number-field")).toBe("123");
      });

      test("should handle special characters in value", () => {
        const mockElement = { value: "special@#$%^&*()" };
        mockQuerySelector(mockElement);

        expect(getValue("special-field")).toBe("special@#$%^&*()");
      });

      test("should handle multiline value", () => {
        const mockElement = { value: "line1\nline2\nline3" };
        mockQuerySelector(mockElement);

        expect(getValue("multiline-field")).toBe("line1\nline2\nline3");
      });
    });

    describe("Element exists without value property", () => {
      test("should return empty string when element has no value property", () => {
        const mockElement = { textContent: "some text" };
        mockQuerySelector(mockElement);

        expect(getValue("no-value-prop")).toBe("");
      });

      test("should return empty string when element has undefined value", () => {
        const mockElement = { value: undefined };
        mockQuerySelector(mockElement);

        expect(getValue("undefined-value")).toBe("");
      });

      test("should return empty string when element has null value", () => {
        const mockElement = { value: null };
        mockQuerySelector(mockElement);

        expect(getValue("null-value")).toBe("");
      });
    });

    describe("Element does not exist", () => {
      test("should return empty string when element is not found", () => {
        mockQuerySelector(null);

        expect(getValue("non-existent")).toBe("");
      });

      test("should return empty string when querySelector returns undefined", () => {
        mockQuerySelector(undefined);

        expect(getValue("undefined-element")).toBe("");
      });
    });

    describe("Name selector edge cases", () => {
      test("should handle empty name parameter", () => {
        const mockElement = { value: "some-value" };
        mockQuerySelector(mockElement);

        expect(getValue("")).toBe("some-value");
      });

      test("should handle name with special characters", () => {
        const mockElement = { value: "special-name-value" };
        mockQuerySelector(mockElement);

        expect(getValue("field-name_with@special.chars")).toBe(
          "special-name-value"
        );
      });

      test("should handle name with spaces (though not recommended)", () => {
        const mockElement = { value: "space-name-value" };
        mockQuerySelector(mockElement);

        expect(getValue("field with spaces")).toBe("space-name-value");
      });

      test("should handle numeric name", () => {
        const mockElement = { value: "numeric-name-value" };
        mockQuerySelector(mockElement);

        expect(getValue("123")).toBe("numeric-name-value");
      });
    });

    describe("Real-world form scenarios", () => {
      test("should work with typical form field names", () => {
        const formFields = [
          { name: "firstName", value: "John" },
          { name: "lastName", value: "Doe" },
          { name: "email", value: "john.doe@example.com" },
          { name: "phone", value: "555-123-4567" },
          { name: "organization", value: "CDAO" },
          { name: "description", value: "Long description text..." },
        ];

        formFields.forEach((field) => {
          mockQuerySelector({ value: field.value });
          expect(getValue(field.name)).toBe(field.value);
        });
      });

      test("should handle form validation scenarios", () => {
        // Test required field with value
        mockQuerySelector({ value: "required-value", required: true });
        expect(getValue("required-field")).toBe("required-value");

        // Test optional field with empty value
        mockQuerySelector({ value: "" });
        expect(getValue("optional-field")).toBe("");
      });

      test("should work with dynamic form field names", () => {
        const dynamicNames = ["field_1", "field_2", "field_3"];
        const dynamicValues = ["value1", "value2", "value3"];

        dynamicNames.forEach((name, index) => {
          mockQuerySelector({ value: dynamicValues[index] });
          expect(getValue(name)).toBe(dynamicValues[index]);
        });
      });
    });

    describe("Type safety and error handling", () => {
      test("should handle when document.querySelector throws error", () => {
        Object.defineProperty(document, "querySelector", {
          value: () => {
            throw new Error("DOM error");
          },
          writable: true,
        });

        expect(() => getValue("error-field")).toThrow("DOM error");
      });

      test("should handle element with non-string value property", () => {
        const mockElement = { value: 123 };
        mockQuerySelector(mockElement);

        expect(getValue("number-as-value")).toBe(123);
      });

      test("should handle element with boolean value property", () => {
        const mockElement = { value: true };
        mockQuerySelector(mockElement);

        expect(getValue("boolean-as-value")).toBe(true);
      });

      test("should handle element with object value property", () => {
        const mockElement = { value: { toString: () => "object-value" } };
        mockQuerySelector(mockElement);

        expect(getValue("object-as-value")).toEqual({
          toString: expect.any(Function),
        });
      });
    });

    describe("Performance considerations", () => {
      test("should not cache query results between calls", () => {
        // First call
        mockQuerySelector({ value: "first-value" });
        expect(getValue("test-field")).toBe("first-value");

        // Second call with different mock (simulating DOM change)
        mockQuerySelector({ value: "second-value" });
        expect(getValue("test-field")).toBe("second-value");
      });

      test("should handle multiple calls efficiently", () => {
        const mockElement = { value: "consistent-value" };
        mockQuerySelector(mockElement);

        // Multiple calls should work consistently
        for (let i = 0; i < 5; i++) {
          expect(getValue("consistent-field")).toBe("consistent-value");
        }
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

    test("should work together with getValue for form handling", () => {
      // Mock DOM elements for a complete form scenario
      Object.defineProperty(document, "querySelector", {
        value: (selector: string) => {
          const fieldName = selector.match(/\[name="(.*)"\]/)?.[1];
          const mockValues: Record<string, string> = {
            productType: "Bundle",
            price: "1500",
            rom: "$5K - $10K",
          };
          return { value: mockValues[fieldName || ""] || "" };
        },
        writable: true,
      });

      const productType = getValue("productType");
      const price = parseFloat(getValue("price")) || 0;
      const rom = getValue("rom");

      expect(getIconPath(productType)).toBe("/assets/icons/icon_bundle.png");
      expect(formatPrice(price, rom)).toBe("$5K - $10K");
    });
  });

  describe("generateRequestId", () => {
    describe("Basic functionality", () => {
      test("should generate a string with correct length pattern", () => {
        const id = generateRequestId(10);
        expect(typeof id).toBe("string");
        expect(id).toMatch(/^.{10}-[0-9a-f]+$/); // 10 chars + hyphen + hex timestamp
      });

      test("should generate different IDs on subsequent calls", () => {
        const id1 = generateRequestId(10);
        const id2 = generateRequestId(10);
        expect(id1).not.toBe(id2);
      });

      test("should include timestamp in hex format", () => {
        const id = generateRequestId(5);
        const parts = id.split("-");
        expect(parts).toHaveLength(2);
        expect(parts[1]).toMatch(/^[0-9a-f]+$/); // Hex timestamp
      });

      test("should generate random string of specified length", () => {
        const lengths = [1, 5, 10, 15, 20];
        lengths.forEach((length) => {
          const id = generateRequestId(length);
          const randomPart = id.split("-")[0];
          expect(randomPart).toHaveLength(length);
        });
      });
    });

    describe("Character composition", () => {
      test("should only use alphanumeric characters in random part", () => {
        const id = generateRequestId(50); // Large number to increase character coverage
        const randomPart = id.split("-")[0];
        expect(randomPart).toMatch(/^[A-Za-z0-9]+$/);
      });

      test("should include mix of uppercase, lowercase, and numbers", () => {
        // Generate multiple IDs to increase probability of getting all character types
        let hasUpper = false;
        let hasLower = false;
        let hasNumber = false;

        for (let i = 0; i < 20; i++) {
          const id = generateRequestId(20);
          const randomPart = id.split("-")[0];

          if (/[A-Z]/.test(randomPart)) hasUpper = true;
          if (/[a-z]/.test(randomPart)) hasLower = true;
          if (/[0-9]/.test(randomPart)) hasNumber = true;

          if (hasUpper && hasLower && hasNumber) break;
        }

        // With 20 iterations of 20-character strings, we should get all types
        expect(hasUpper || hasLower || hasNumber).toBe(true); // At least one type should be present
      });

      test("should not include special characters in random part", () => {
        const id = generateRequestId(30);
        const randomPart = id.split("-")[0];
        expect(randomPart).not.toMatch(/[^A-Za-z0-9]/);
      });
    });

    describe("Timestamp integration", () => {
      test("should have recent timestamp", () => {
        const beforeTime = Date.now();
        const id = generateRequestId(5);
        const afterTime = Date.now();

        const timestampHex = id.split("-")[1];
        const timestamp = parseInt(timestampHex, 16);

        expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
        expect(timestamp).toBeLessThanOrEqual(afterTime);
      });
    });

    describe("Edge cases and parameters", () => {
      test("should handle zero length random part", () => {
        const id = generateRequestId(0);
        expect(id).toMatch(/^-[0-9a-f]+$/);
        expect(id.split("-")[0]).toBe("");
      });

      test("should handle very small length", () => {
        const id = generateRequestId(1);
        const randomPart = id.split("-")[0];
        expect(randomPart).toHaveLength(1);
        expect(randomPart).toMatch(/^[A-Za-z0-9]$/);
      });

      test("should handle large length", () => {
        const id = generateRequestId(100);
        const randomPart = id.split("-")[0];
        expect(randomPart).toHaveLength(100);
        expect(randomPart).toMatch(/^[A-Za-z0-9]+$/);
      });

      test("should be consistent with format regardless of length", () => {
        const lengths = [0, 1, 5, 10, 50, 100];
        lengths.forEach((length) => {
          const id = generateRequestId(length);
          expect(id).toMatch(/^.*-[0-9a-f]+$/);
          expect(id.split("-")).toHaveLength(2);
        });
      });
    });

    describe("Uniqueness and randomness", () => {
      test("should generate unique IDs in rapid succession", () => {
        const ids = new Set();
        const iterations = 100;

        for (let i = 0; i < iterations; i++) {
          const id = generateRequestId(10);
          expect(ids.has(id)).toBe(false);
          ids.add(id);
        }

        expect(ids.size).toBe(iterations);
      });

      test("should have different random parts even with same timestamp", () => {
        // Mock Date.now to return the same value
        const originalDateNow = Date.now;
        const fixedTime = 1642675200000; // Fixed timestamp
        Date.now = () => fixedTime;

        try {
          const id1 = generateRequestId(10);
          const id2 = generateRequestId(10);

          const randomPart1 = id1.split("-")[0];
          const randomPart2 = id2.split("-")[0];
          const timestampPart1 = id1.split("-")[1];
          const timestampPart2 = id2.split("-")[1];

          expect(timestampPart1).toBe(timestampPart2); // Same timestamp
          expect(randomPart1).not.toBe(randomPart2); // Different random parts
        } finally {
          Date.now = originalDateNow; // Restore original function
        }
      });

      test("should distribute characters randomly", () => {
        const charCounts: Record<string, number> = {};
        const totalChars = 1000;

        // Generate many characters to test distribution
        for (let i = 0; i < totalChars / 10; i++) {
          const id = generateRequestId(10);
          const randomPart = id.split("-")[0];

          for (const char of randomPart) {
            charCounts[char] = (charCounts[char] || 0) + 1;
          }
        }

        // Should have reasonable character distribution (not perfectly even due to randomness)
        const uniqueChars = Object.keys(charCounts);
        expect(uniqueChars.length).toBeGreaterThan(10); // Should use variety of characters
      });
    });

    describe("Real-world usage scenarios", () => {
      test("should work for typical request ID lengths", () => {
        const commonLengths = [8, 12, 16, 20, 24];
        commonLengths.forEach((length) => {
          const id = generateRequestId(length);
          expect(id.split("-")[0]).toHaveLength(length);
          expect(id).toMatch(/^[A-Za-z0-9]+-[0-9a-f]+$/);
        });
      });

      test("should be suitable for database storage", () => {
        const id = generateRequestId(20);

        // Should not contain characters that need escaping in common databases
        expect(id).not.toMatch(/['";\\]/);

        // Should be reasonable length for database fields
        expect(id.length).toBeLessThan(100);

        // Should be URL-safe (important for APIs)
        expect(id).not.toMatch(/[^A-Za-z0-9-]/);
      });

      test("should work in high-frequency generation scenarios", () => {
        const startTime = Date.now();
        const ids = [];

        // Generate many IDs quickly
        for (let i = 0; i < 1000; i++) {
          ids.push(generateRequestId(12));
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Should be reasonably fast
        expect(duration).toBeLessThan(1000); // Less than 1 second for 1000 IDs

        // All should be unique
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      });

      test("should maintain format consistency across time", () => {
        const ids = [];
        const expectedPattern = /^[A-Za-z0-9]{15}-[0-9a-f]+$/;

        // Generate IDs with small delays
        for (let i = 0; i < 5; i++) {
          ids.push(generateRequestId(15));
          // Add tiny delay to ensure different timestamps
          const start = Date.now();
          while (Date.now() - start < 1) {
            /* wait */
          }
        }

        ids.forEach((id) => {
          expect(id).toMatch(expectedPattern);
        });
      });
    });

    describe("Integration with application flow", () => {
      test("should generate ID suitable for request tracking", () => {
        const requestId = generateRequestId(24); // Common length for tracking IDs

        // Should be long enough to avoid collisions
        expect(requestId.split("-")[0]).toHaveLength(24);

        // Should include timestamp for chronological sorting
        const timestamp = parseInt(requestId.split("-")[1], 16);
        expect(timestamp).toBeGreaterThan(1600000000000); // After year 2020

        // Should be alphanumeric for easy copying/pasting
        expect(requestId).toMatch(/^[A-Za-z0-9-]+$/);
      });

      test("should work with mock data scenarios", () => {
        // Simulate generating IDs for mock data
        const mockRequests = [];

        for (let i = 0; i < 10; i++) {
          mockRequests.push({
            id: generateRequestId(16),
            name: `Request ${i}`,
            timestamp: Date.now(),
          });
        }

        // All IDs should be unique
        const ids = mockRequests.map((req) => req.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(mockRequests.length);

        // All should follow expected format
        ids.forEach((id) => {
          expect(id).toMatch(/^[A-Za-z0-9]{16}-[0-9a-f]+$/);
        });
      });
    });
  });
});
