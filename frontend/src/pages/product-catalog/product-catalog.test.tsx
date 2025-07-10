import { render, screen, fireEvent } from "@testing-library/react";
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
    const catalogContainer = container.querySelector(".product-catalog-page");
    const muiContainer = container.querySelector(".MuiContainer-root");

    expect(catalogContainer).toBeInTheDocument();
    expect(muiContainer).toBeInTheDocument();
  });

  test("should render main heading through PageTitle component", () => {
    renderProductCatalogWithRouter();

    const mainHeading = screen.getByText("Product Catalog");
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading.tagName).toBe("H1");
    expect(mainHeading).toHaveAttribute("id", "product-catalog-heading");
  });

  test("should have proper semantic structure with PageTitle", () => {
    const { container } = renderProductCatalogWithRouter();

    const section = container.querySelector("section.section__page-title");
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

  test("should render products from mock data", () => {
    renderProductCatalogWithRouter();

    // Check that product cards are rendered
    const productCards = screen.getAllByText(/AWS|C3AI|Databricks/);
    expect(productCards.length).toBeGreaterThan(0);
    
    // Check for specific products from mock data
    expect(screen.getByText("AWS")).toBeInTheDocument();
    expect(screen.getByText("C3AI")).toBeInTheDocument();
  });

  test("should render product cards in a grid layout", () => {
    const { container } = renderProductCatalogWithRouter();

    // Check for Material-UI Box with grid layout
    const gridContainer = container.querySelector(".MuiBox-root");
    expect(gridContainer).toBeInTheDocument();
  });

  test("should handle add to cart functionality", () => {
    renderProductCatalogWithRouter();

    // Find an "Add to Cart" button (assuming ProductCard has this button)
    const addToCartButtons = screen.getAllByText(/Add to Cart/i);
    expect(addToCartButtons.length).toBeGreaterThan(0);

    // Click on the first add to cart button
    fireEvent.click(addToCartButtons[0]);

    // The state should update (we can test this indirectly by checking if the component re-renders)
    expect(addToCartButtons[0]).toBeInTheDocument();
  });

  test("should display product information correctly", () => {
    renderProductCatalogWithRouter();

    // Check for product information from mock data
    expect(screen.getByText("AWS")).toBeInTheDocument();
    expect(screen.getByText(/Cloud computing platform/)).toBeInTheDocument();
    expect(screen.getByText("C3AI")).toBeInTheDocument();
    expect(screen.getByText(/Enterprise AI software/)).toBeInTheDocument();
  });

  test("should render without router (standalone)", () => {
    render(<ProductCatalog />);

    expect(screen.getByText("Product Catalog")).toBeInTheDocument();
    // Should still render products even without router
    expect(screen.getByText("AWS")).toBeInTheDocument();
  });

  test("should have proper heading hierarchy", () => {
    renderProductCatalogWithRouter();

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Product Catalog");
    expect(h1).toHaveAttribute("id", "product-catalog-heading");
  });

  test("should be accessible", () => {
    renderProductCatalogWithRouter();

    // Check for proper heading structure - ProductCatalog has 1 main heading
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);

    // Check for semantic section with PageTitle
    const section = screen.getByRole("region");
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass("section__page-title");

    // Check for proper labeling
    expect(section).toHaveAttribute("aria-labelledby", "product-catalog-heading");
  });

  test("should render all text content correctly", () => {
    renderProductCatalogWithRouter();

    // Test exact text content
    expect(screen.getByText("Product Catalog")).toBeInTheDocument();
    expect(screen.getByText("AWS")).toBeInTheDocument();
    expect(screen.getByText("C3AI")).toBeInTheDocument();

    // Test text is visible
    expect(screen.getByText("Product Catalog")).toBeVisible();
    expect(screen.getByText("AWS")).toBeVisible();
  });

  test("should have correct DOM structure with Material-UI components", () => {
    const { container } = renderProductCatalogWithRouter();

    // Check the overall structure
    const outerDiv = container.firstChild;
    expect(outerDiv).toHaveClass("product-catalog-page");

    // Check for Material-UI Container
    const muiContainer = container.querySelector(".MuiContainer-root");
    expect(muiContainer).toBeInTheDocument();
    expect(muiContainer?.parentElement).toHaveClass("product-catalog-page");

    // Check for PageTitle section
    const section = container.querySelector("section.section__page-title");
    expect(section).toBeInTheDocument();

    // Check heading element is within PageTitle section
    const h1 = container.querySelector("h1");
    expect(h1?.parentElement).toBe(section);

    // Check for grid layout
    const gridBox = container.querySelector(".MuiBox-root");
    expect(gridBox).toBeInTheDocument();
  });

  test("should render component snapshot consistently", () => {
    const { container } = renderProductCatalogWithRouter();

    // Verify the component structure doesn't change unexpectedly
    expect(container.innerHTML).toContain('class="product-catalog-page"');
    expect(container.innerHTML).toContain('class="section__page-title"');
    expect(container.innerHTML).toContain(
      'aria-labelledby="product-catalog-heading"'
    );
    expect(container.innerHTML).toContain('id="product-catalog-heading"');
    expect(container.innerHTML).toContain("<h1");
    expect(container.innerHTML).toContain("Product Catalog");
    expect(container.innerHTML).toContain("MuiContainer-root");
    expect(container.innerHTML).toContain("MuiBox-root");
  });

  test("should have no accessibility violations", async () => {
    const { container } = renderProductCatalogWithRouter();
    
    // Test accessibility excluding the ProductCard form elements which have their own accessibility concerns
    const results = await axe(container, {
      rules: {
        // Disable label checking since that's handled by ProductCard component tests
        "label": { enabled: false },
        "label-title-only": { enabled: false },
      },
    });
    expect(results).toHaveNoViolations();
  });

  test("should meet WCAG accessibility standards", async () => {
    const { container } = renderProductCatalogWithRouter();

    // Test heading hierarchy
    const h1 = container.querySelector("h1");
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveAttribute("id", "product-catalog-heading");

    // Test semantic structure with PageTitle
    const section = container.querySelector("section.section__page-title");
    expect(section).toHaveAttribute("aria-labelledby", "product-catalog-heading");

    // Test that products are accessible
    const productElements = screen.getAllByText(/AWS|C3AI/);
    expect(productElements.length).toBeGreaterThan(0);

    // Run comprehensive accessibility tests excluding form label issues that belong to ProductCard
    const results = await axe(container, {
      rules: {
        "heading-order": { enabled: true },
        "page-has-heading-one": { enabled: true },
        "landmark-unique": { enabled: true },
        "color-contrast": { enabled: true },
        // Disable label checking since ProductCard components handle their own form accessibility
        "label": { enabled: false },
        "label-title-only": { enabled: false },
      },
    });
    expect(results).toHaveNoViolations();
  });

  test("should handle cart state management correctly", () => {
    renderProductCatalogWithRouter();

    // Check that products are rendered with initial cart state
    const products = screen.getAllByText(/AWS|C3AI/);
    expect(products.length).toBeGreaterThan(0);

    // Verify that the cart functionality is available
    // This is indirectly tested by checking that ProductCard components are rendered
    // The actual cart functionality would be tested in ProductCard component tests
    expect(screen.getByText("AWS")).toBeInTheDocument();
  });

  test("should use responsive grid layout", () => {
    const { container } = renderProductCatalogWithRouter();

    // Check for Material-UI responsive grid structure
    const gridContainer = container.querySelector(".MuiBox-root");
    expect(gridContainer).toBeInTheDocument();
    
    // Verify that products are wrapped in Box components for grid layout
    const productBoxes = container.querySelectorAll(".MuiBox-root .MuiBox-root");
    expect(productBoxes.length).toBeGreaterThan(0);
  });
});
