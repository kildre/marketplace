import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { ProductCatalog } from "./product-catalog";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("ProductCatalog", () => {
  const renderProductCatalogWithRouter = () => {
    return render(
      <BrowserRouter>
        <ProductCatalog />
      </BrowserRouter>
    );
  };

  test("should render successfully", () => {
    const { container } = renderProductCatalogWithRouter();
    const homeContainer = container.querySelector(".product-catalog-page");
    const section = container.querySelector("section");

    expect(homeContainer).toBeInTheDocument();
    expect(section).toBeInTheDocument();
  });

  test("should render main heading", () => {
    renderProductCatalogWithRouter();

    const mainHeading = screen.getByText("Product Catalog");
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading.tagName).toBe("H1");
  });

  test("should have proper semantic structure", () => {
    const { container } = renderProductCatalogWithRouter();

    const section = container.querySelector("section");
    expect(section).toHaveAttribute(
      "aria-labelledby",
      "product-catalog-heading"
    );
  });

  test("should have correct CSS classes", () => {
    const { container } = renderProductCatalogWithRouter();

    const containerDiv = container.querySelector(".product-catalog-page");
    expect(containerDiv).toBeInTheDocument();
    expect(containerDiv).toHaveClass("product-catalog-page");
  });

  test("should render without router (standalone)", () => {
    render(<ProductCatalog />);

    expect(screen.getByText("Product Catalog")).toBeInTheDocument();
  });

  test("should have proper heading hierarchy", () => {
    renderProductCatalogWithRouter();

    const h1 = screen.getByRole("heading", { level: 1 });

    expect(h1).toHaveTextContent("Product Catalog");
  });

  test("should be accessible", () => {
    renderProductCatalogWithRouter();

    // Check for proper heading structure - ProductCatalog has 1 heading
    const headings = screen.getAllByRole("heading");
    expect(headings).toHaveLength(1);

    // Check for semantic section
    const section = screen.getByRole("region");
    expect(section).toBeInTheDocument();
  });

  test("should render all text content correctly", () => {
    renderProductCatalogWithRouter();

    // Test exact text content
    expect(screen.getByText("Product Catalog")).toBeInTheDocument();

    // Test text is visible
    expect(screen.getByText("Product Catalog")).toBeVisible();
  });

  test("should have correct DOM structure", () => {
    const { container } = renderProductCatalogWithRouter();

    // Check the overall structure
    const outerDiv = container.firstChild;
    expect(outerDiv).toHaveClass("product-catalog-page");

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section?.parentElement).toHaveClass("product-catalog-page");

    // Check heading element is within section
    const h1 = container.querySelector("h1");
    expect(h1?.parentElement).toBe(section);
  });

  test("should render component snapshot consistently", () => {
    const { container } = renderProductCatalogWithRouter();

    // Verify the component structure doesn't change unexpectedly
    expect(container.innerHTML).toContain('class="product-catalog-page"');
    expect(container.innerHTML).toContain(
      'aria-labelledby="product-catalog-heading"'
    );
    expect(container.innerHTML).toContain('id="product-catalog-heading"');
    expect(container.innerHTML).toContain("<h1");
    expect(container.innerHTML).toContain("Product Catalog");
  });

  test("should have no accessibility violations", async () => {
    const { container } = renderProductCatalogWithRouter();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("should meet WCAG accessibility standards", async () => {
    const { container } = renderProductCatalogWithRouter();

    // Test heading hierarchy
    const h1 = container.querySelector("h1");
    expect(h1).toBeInTheDocument();

    // Test semantic structure
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby");

    // Run comprehensive accessibility tests
    const results = await axe(container, {
      rules: {
        "heading-order": { enabled: true },
        "page-has-heading-one": { enabled: true },
        "landmark-unique": { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });
});
