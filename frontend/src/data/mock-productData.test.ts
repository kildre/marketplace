import { mockProducts } from "./mock-productData";
import { ProductItems, ProductType, CartStatus } from "../types/products";

describe("mock-productData", () => {
  describe("mockProducts", () => {
    test("should export mockProducts object", () => {
      expect(mockProducts).toBeDefined();
      expect(typeof mockProducts).toBe("object");
    });

    test("should have correct structure", () => {
      expect(mockProducts).toHaveProperty("items");
      expect(mockProducts).toHaveProperty("itemCount");
      expect(mockProducts).toHaveProperty("pageCount");
      expect(mockProducts).toHaveProperty("prevPage");
      expect(mockProducts).toHaveProperty("nextPage");
    });

    test("should have items array", () => {
      expect(Array.isArray(mockProducts.items)).toBe(true);
      expect(mockProducts.items.length).toBeGreaterThan(0);
    });

    test("should have correct itemCount", () => {
      expect(mockProducts.itemCount).toBe(mockProducts.items.length);
      expect(mockProducts.itemCount).toBe(10);
    });

    test("should have correct pagination values", () => {
      expect(mockProducts.pageCount).toBe(1);
      expect(mockProducts.prevPage).toBeNull();
      expect(mockProducts.nextPage).toBeNull();
    });

    test("should satisfy ProductItems interface", () => {
      const productItems: ProductItems = mockProducts;
      expect(productItems.items).toEqual(mockProducts.items);
      expect(productItems.itemCount).toBe(mockProducts.itemCount);
      expect(productItems.pageCount).toBe(mockProducts.pageCount);
      expect(productItems.prevPage).toBe(mockProducts.prevPage);
      expect(productItems.nextPage).toBe(mockProducts.nextPage);
    });
  });

  describe("Product items validation", () => {
    test("should have all required product properties", () => {
      mockProducts.items.forEach((product) => {
        expect(product).toHaveProperty("id");
        expect(product).toHaveProperty("type");
        expect(product).toHaveProperty("name");
        expect(product).toHaveProperty("description");
        expect(product).toHaveProperty("price");
        expect(product).toHaveProperty("unit");
        expect(product).toHaveProperty("inCart");
        expect(product).toHaveProperty("currentlyInCart");
        expect(product).toHaveProperty("cartStatus");
      });
    });

    test("should have valid product types", () => {
      const validTypes: ProductType[] = [
        "Consumption Based",
        "License Based",
        "Consumption Based Tool",
      ];

      mockProducts.items.forEach((product) => {
        expect(validTypes).toContain(product.type);
      });
    });

    test("should have valid cart statuses", () => {
      const validStatuses: CartStatus[] = ["available", "unavailable"];

      mockProducts.items.forEach((product) => {
        if (product.cartStatus) {
          expect(validStatuses).toContain(product.cartStatus);
        }
      });
    });

    test("should have unique product IDs", () => {
      const ids = mockProducts.items.map((product) => product.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds.length).toBe(ids.length);
    });

    test("should have positive prices", () => {
      mockProducts.items.forEach((product) => {
        expect(product.price).toBeGreaterThan(0);
      });
    });

    test("should have positive unit values", () => {
      mockProducts.items.forEach((product) => {
        expect(product.unit).toBeGreaterThan(0);
      });
    });

    test("should have non-negative currentlyInCart values", () => {
      mockProducts.items.forEach((product) => {
        expect(product.currentlyInCart).toBeGreaterThanOrEqual(0);
      });
    });

    test("should have non-empty names", () => {
      mockProducts.items.forEach((product) => {
        expect(product.name).toBeTruthy();
        expect(typeof product.name).toBe("string");
        expect(product.name.length).toBeGreaterThan(0);
      });
    });

    test("should have non-empty descriptions", () => {
      mockProducts.items.forEach((product) => {
        expect(product.description).toBeTruthy();
        expect(typeof product.description).toBe("string");
        expect(product.description.length).toBeGreaterThan(0);
      });
    });

    test("should have boolean inCart values", () => {
      mockProducts.items.forEach((product) => {
        expect(typeof product.inCart).toBe("boolean");
      });
    });
  });

  describe("Specific products validation", () => {
    test("should contain expected products", () => {
      const productNames = mockProducts.items.map((product) => product.name);

      expect(productNames).toContain("AWS");
      expect(productNames).toContain("C3AI");
      expect(productNames).toContain("Databricks");
      expect(productNames).toContain("DataRobot");
      expect(productNames).toContain("Gitlab");
      expect(productNames).toContain("Palantir");
      expect(productNames).toContain("Tableau");
      expect(productNames).toContain("UI Path");
      expect(productNames).toContain("Custom Analytics Package");
      expect(productNames).toContain("Enterprise Security Suite");
    });

    test("should have correct product types for specific items", () => {
      const aws = mockProducts.items.find((p) => p.name === "AWS");
      const databricks = mockProducts.items.find(
        (p) => p.name === "Databricks"
      );
      const customAnalytics = mockProducts.items.find(
        (p) => p.name === "Custom Analytics Package"
      );

      expect(aws?.type).toBe("License Based");
      expect(databricks?.type).toBe("Consumption Based Tool");
      expect(customAnalytics?.type).toBe("Consumption Based");
    });

    test("should have unavailable products", () => {
      const unavailableProducts = mockProducts.items.filter(
        (product) => product.cartStatus === "unavailable"
      );

      expect(unavailableProducts.length).toBeGreaterThan(0);
      expect(unavailableProducts.some((p) => p.name === "DataRobot")).toBe(
        true
      );
      expect(
        unavailableProducts.some((p) => p.name === "Enterprise Security Suite")
      ).toBe(true);
    });

    test("should have available products", () => {
      const availableProducts = mockProducts.items.filter(
        (product) => product.cartStatus === "available"
      );

      expect(availableProducts.length).toBeGreaterThan(0);
      expect(availableProducts.some((p) => p.name === "AWS")).toBe(true);
      expect(availableProducts.some((p) => p.name === "Tableau")).toBe(true);
    });

    test("should have ROM field for specific products", () => {
      const customAnalytics = mockProducts.items.find(
        (p) => p.name === "Custom Analytics Package"
      );

      expect(customAnalytics?.rom).toBe("Custom ROM v2.1");
    });
  });

  describe("Data consistency", () => {
    test("should have consistent data structure", () => {
      mockProducts.items.forEach((product) => {
        expect(typeof product.id).toBe("number");
        expect(typeof product.name).toBe("string");
        expect(typeof product.description).toBe("string");
        expect(typeof product.price).toBe("number");
        expect(typeof product.unit).toBe("number");
        expect(typeof product.inCart).toBe("boolean");
        expect(typeof product.currentlyInCart).toBe("number");
      });
    });

    test("should have all products with inCart set to false initially", () => {
      mockProducts.items.forEach((product) => {
        expect(product.inCart).toBe(false);
      });
    });

    test("should have all products with currentlyInCart set to 0 initially", () => {
      mockProducts.items.forEach((product) => {
        expect(product.currentlyInCart).toBe(0);
      });
    });
  });
});
