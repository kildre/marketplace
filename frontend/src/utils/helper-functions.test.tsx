import { describe, test, expect } from "vitest";
import { formatPrice, getIconPath, getValue } from "./helper-functions";

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
});
