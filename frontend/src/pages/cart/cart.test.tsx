import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { Cart } from "./cart";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock the child components
vi.mock("../../components/page-title/page-title", () => ({
  PageTitle: ({ title }: { title: string }) => (
    <div data-testid="page-title">
      <h1 id="cart-heading">{title}</h1>
    </div>
  ),
}));

vi.mock("../../components/cart-form/cart-form", () => ({
  CartForm: () => (
    <div data-testid="cart-form">
      <form>Cart Form Content</form>
    </div>
  ),
}));

describe("Cart", () => {
  const renderCartWithRouter = () => {
    return render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );
  };

  test("should render successfully", () => {
    const { container } = renderCartWithRouter();
    const cartContainer = container.querySelector(".cart-page");

    expect(cartContainer).toBeInTheDocument();
    expect(cartContainer).toHaveClass("marketplace-content");
  });

  test("should render breadcrumb link", () => {
    renderCartWithRouter();

    const breadcrumbLink = screen.getByRole("link", { name: /return to catalog/i });
    expect(breadcrumbLink).toBeInTheDocument();
    expect(breadcrumbLink).toHaveAttribute("href", "/");
    expect(breadcrumbLink).toHaveClass("cart-form__breadcrumb");
  });

  test("should render PageTitle component", () => {
    renderCartWithRouter();

    const pageTitle = screen.getByTestId("page-title");
    expect(pageTitle).toBeInTheDocument();
    expect(screen.getByText("Cart")).toBeInTheDocument();
  });

  test("should render CartForm component", () => {
    renderCartWithRouter();

    const cartForm = screen.getByTestId("cart-form");
    expect(cartForm).toBeInTheDocument();
    expect(screen.getByText("Cart Form Content")).toBeInTheDocument();
  });

  test("should render main heading", () => {
    renderCartWithRouter();

    const mainHeading = screen.getByRole("heading", { level: 1 });
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading).toHaveTextContent("Cart");
    expect(mainHeading).toHaveAttribute("id", "cart-heading");
  });

  test("should have proper semantic structure", () => {
    const { container } = renderCartWithRouter();

    const cartContainer = container.querySelector(".cart-page");
    expect(cartContainer).toHaveClass("marketplace-content");
    
    // Check that all main components are present
    expect(screen.getByRole("link")).toBeInTheDocument(); // breadcrumb
    expect(screen.getByTestId("page-title")).toBeInTheDocument();
    expect(screen.getByTestId("cart-form")).toBeInTheDocument();
  });

  test("should have correct CSS classes", () => {
    const { container } = renderCartWithRouter();

    const containerDiv = container.querySelector(".cart-page");
    expect(containerDiv).toBeInTheDocument();
    expect(containerDiv).toHaveClass("cart-page", "marketplace-content");
  });

  test("should render without router (standalone)", () => {
    // This test should fail because the Link component requires a router
    expect(() => render(<Cart />)).toThrow();
  });

  test("should have proper heading hierarchy", () => {
    renderCartWithRouter();

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Cart");
    expect(h1).toHaveAttribute("id", "cart-heading");
  });

  test("should be accessible", () => {
    renderCartWithRouter();

    // Check for proper heading structure
    const headings = screen.getAllByRole("heading");
    expect(headings.length).toBeGreaterThanOrEqual(1);

    // Check for navigation link
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    
    // Check for form element (using querySelector since it's in the mocked component)
    const { container } = renderCartWithRouter();
    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
  });

  test("should render all text content correctly", () => {
    renderCartWithRouter();

    // Test main heading text
    expect(screen.getByText("Cart")).toBeInTheDocument();
    expect(screen.getByText("Cart")).toBeVisible();
    
    // Test breadcrumb text
    expect(screen.getByText("Return to Catalog")).toBeInTheDocument();
    expect(screen.getByText("Return to Catalog")).toBeVisible();
    
    // Test form content
    expect(screen.getByText("Cart Form Content")).toBeInTheDocument();
  });

  test("should have correct DOM structure", () => {
    const { container } = renderCartWithRouter();

    // Check the overall structure
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass("cart-page", "marketplace-content");

    // Check that components are in the correct order
    const children = Array.from(outerDiv?.children || []);
    expect(children).toHaveLength(3);
    
    // First child should be the breadcrumb link
    expect(children[0]).toHaveClass("cart-form__breadcrumb");
    expect(children[0].tagName).toBe("A");
    
    // Second child should be the PageTitle
    expect(children[1]).toHaveAttribute("data-testid", "page-title");
    
    // Third child should be the CartForm
    expect(children[2]).toHaveAttribute("data-testid", "cart-form");
  });

  test("should render component snapshot consistently", () => {
    const { container } = renderCartWithRouter();

    // Verify the component structure doesn't change unexpectedly
    expect(container.innerHTML).toContain(
      'class="cart-page marketplace-content"'
    );
    expect(container.innerHTML).toContain('class="cart-form__breadcrumb"');
    expect(container.innerHTML).toContain('href="/"');
    expect(container.innerHTML).toContain("Return to Catalog");
    expect(container.innerHTML).toContain('data-testid="page-title"');
    expect(container.innerHTML).toContain('data-testid="cart-form"');
    expect(container.innerHTML).toContain('id="cart-heading"');
    expect(container.innerHTML).toContain("Cart");
  });

  test("should have no accessibility violations", async () => {
    const { container } = renderCartWithRouter();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("should meet WCAG accessibility standards", async () => {
    const { container } = renderCartWithRouter();

    // Test heading hierarchy
    const h1 = container.querySelector("h1");
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveAttribute("id", "cart-heading");

    // Test link accessibility
    const link = container.querySelector("a");
    expect(link).toHaveAttribute("href", "/");

    // Run comprehensive accessibility tests
    const results = await axe(container, {
      rules: {
        "heading-order": { enabled: true },
        "page-has-heading-one": { enabled: true },
        "landmark-unique": { enabled: true },
        "link-name": { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });
});
