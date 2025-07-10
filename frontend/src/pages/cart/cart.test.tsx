import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { Cart } from "./cart";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

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
    const section = container.querySelector("section");

    expect(cartContainer).toBeInTheDocument();
    expect(section).toBeInTheDocument();
  });

  test("should render main heading", () => {
    renderCartWithRouter();

    const mainHeading = screen.getByText("Cart");
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading.tagName).toBe("H1");
  });

  test("should have proper semantic structure", () => {
    const { container } = renderCartWithRouter();

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby", "cart-heading");
  });

  test("should have correct CSS classes", () => {
    const { container } = renderCartWithRouter();

    const containerDiv = container.querySelector(".cart-page");
    expect(containerDiv).toBeInTheDocument();
    expect(containerDiv).toHaveClass("cart-page");
  });

  test("should render without router (standalone)", () => {
    render(<Cart />);

    expect(screen.getByText("Cart")).toBeInTheDocument();
  });

  test("should have proper heading hierarchy", () => {
    renderCartWithRouter();

    const h1 = screen.getByRole("heading", { level: 1 });

    expect(h1).toHaveTextContent("Cart");
  });

  test("should be accessible", () => {
    renderCartWithRouter();

    // Check for proper heading structure - Cart has 1 heading
    const headings = screen.getAllByRole("heading");
    expect(headings).toHaveLength(1);

    // Check for semantic section
    const section = screen.getByRole("region");
    expect(section).toBeInTheDocument();
  });

  test("should render all text content correctly", () => {
    renderCartWithRouter();

    // Test exact text content
    expect(screen.getByText("Cart")).toBeInTheDocument();

    // Test text is visible
    expect(screen.getByText("Cart")).toBeVisible();
  });

  test("should have correct DOM structure", () => {
    const { container } = renderCartWithRouter();

    // Check the overall structure
    const outerDiv = container.firstChild;
    expect(outerDiv).toHaveClass("cart-page");

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section?.parentElement).toHaveClass("cart-page");

    // Check heading element is within section
    const h1 = container.querySelector("h1");
    expect(h1?.parentElement).toBe(section);
  });

  test("should render component snapshot consistently", () => {
    const { container } = renderCartWithRouter();

    // Verify the component structure doesn't change unexpectedly
    expect(container.innerHTML).toContain(
      'class="cart-page marketplace-content"'
    );
    expect(container.innerHTML).toContain('aria-labelledby="cart-heading"');
    expect(container.innerHTML).toContain('id="cart-heading"');
    expect(container.innerHTML).toContain("<h1");
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
