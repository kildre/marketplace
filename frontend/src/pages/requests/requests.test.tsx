import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { Requests } from "./requests";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("Requests", () => {
  const renderRequestsWithRouter = () => {
    return render(
      <BrowserRouter>
        <Requests />
      </BrowserRouter>
    );
  };

  test("should render successfully", () => {
    const { container } = renderRequestsWithRouter();
    const requestsContainer = container.querySelector(".requests-page");
    const section = container.querySelector("section");

    expect(requestsContainer).toBeInTheDocument();
    expect(section).toBeInTheDocument();
  });

  test("should render main heading", () => {
    renderRequestsWithRouter();

    const mainHeading = screen.getByText("Requests");
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading.tagName).toBe("H1");
  });

  test("should have proper semantic structure", () => {
    const { container } = renderRequestsWithRouter();

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby", "requests-heading");
  });

  test("should have correct CSS classes", () => {
    const { container } = renderRequestsWithRouter();

    const containerDiv = container.querySelector(".requests-page");
    expect(containerDiv).toBeInTheDocument();
    expect(containerDiv).toHaveClass("requests-page");
  });

  test("should render without router (standalone)", () => {
    render(<Requests />);

    expect(screen.getByText("Requests")).toBeInTheDocument();
  });

  test("should have proper heading hierarchy", () => {
    renderRequestsWithRouter();

    const h1 = screen.getByRole("heading", { level: 1 });

    expect(h1).toHaveTextContent("Requests");
  });

  test("should be accessible", () => {
    renderRequestsWithRouter();

    // Check for proper heading structure - Requests has 1 heading
    const headings = screen.getAllByRole("heading");
    expect(headings).toHaveLength(1);

    // Check for semantic section
    const section = screen.getByRole("region");
    expect(section).toBeInTheDocument();
  });

  test("should render all text content correctly", () => {
    renderRequestsWithRouter();

    // Test exact text content
    expect(screen.getByText("Requests")).toBeInTheDocument();

    // Test text is visible
    expect(screen.getByText("Requests")).toBeVisible();
  });

  test("should have correct DOM structure", () => {
    const { container } = renderRequestsWithRouter();

    // Check the overall structure
    const outerDiv = container.firstChild;
    expect(outerDiv).toHaveClass("requests-page");

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section?.parentElement).toHaveClass("requests-page");

    // Check heading element is within section
    const h1 = container.querySelector("h1");
    expect(h1?.parentElement).toBe(section);
  });

  test("should render component snapshot consistently", () => {
    const { container } = renderRequestsWithRouter();

    // Verify the component structure doesn't change unexpectedly
    expect(container.innerHTML).toContain(
      'class="requests-page marketplace-content"'
    );
    expect(container.innerHTML).toContain('aria-labelledby="requests-heading"');
    expect(container.innerHTML).toContain('id="requests-heading"');
    expect(container.innerHTML).toContain("<h1");
    expect(container.innerHTML).toContain("Requests");
  });

  test("should have no accessibility violations", async () => {
    const { container } = renderRequestsWithRouter();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("should meet WCAG accessibility standards", async () => {
    const { container } = renderRequestsWithRouter();

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
