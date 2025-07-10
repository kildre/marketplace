import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { RequestDetail } from "./request-detail";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("RequestDetail", () => {
  const renderRequestDetailWithRouter = () => {
    return render(
      <BrowserRouter>
        <RequestDetail />
      </BrowserRouter>
    );
  };

  test("should render successfully", () => {
    const { container } = renderRequestDetailWithRouter();
    const requestDetailContainer = container.querySelector(
      ".request-detail-page"
    );
    const section = container.querySelector("section");

    expect(requestDetailContainer).toBeInTheDocument();
    expect(section).toBeInTheDocument();
  });

  test("should render main heading", () => {
    renderRequestDetailWithRouter();

    const mainHeading = screen.getByText("Request Detail");
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading.tagName).toBe("H1");
  });

  test("should have proper semantic structure", () => {
    const { container } = renderRequestDetailWithRouter();

    const section = container.querySelector("section");
    expect(section).toHaveAttribute(
      "aria-labelledby",
      "request-detail-heading"
    );
  });

  test("should have correct CSS classes", () => {
    const { container } = renderRequestDetailWithRouter();

    const containerDiv = container.querySelector(".request-detail-page");
    expect(containerDiv).toBeInTheDocument();
    expect(containerDiv).toHaveClass("request-detail-page");
  });

  test("should render without router (standalone)", () => {
    render(<RequestDetail />);

    expect(screen.getByText("Request Detail")).toBeInTheDocument();
  });

  test("should have proper heading hierarchy", () => {
    renderRequestDetailWithRouter();

    const h1 = screen.getByRole("heading", { level: 1 });

    expect(h1).toHaveTextContent("Request Detail");
  });

  test("should be accessible", () => {
    renderRequestDetailWithRouter();

    // Check for proper heading structure - RequestDetail has 1 heading
    const headings = screen.getAllByRole("heading");
    expect(headings).toHaveLength(1);

    // Check for semantic section
    const section = screen.getByRole("region");
    expect(section).toBeInTheDocument();
  });

  test("should render all text content correctly", () => {
    renderRequestDetailWithRouter();

    // Test exact text content
    expect(screen.getByText("Request Detail")).toBeInTheDocument();

    // Test text is visible
    expect(screen.getByText("Request Detail")).toBeVisible();
  });

  test("should have correct DOM structure", () => {
    const { container } = renderRequestDetailWithRouter();

    // Check the overall structure
    const outerDiv = container.firstChild;
    expect(outerDiv).toHaveClass("request-detail-page");

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section?.parentElement).toHaveClass("request-detail-page");

    // Check heading element is within section
    const h1 = container.querySelector("h1");
    expect(h1?.parentElement).toBe(section);
  });

  test("should render component snapshot consistently", () => {
    const { container } = renderRequestDetailWithRouter();

    // Verify the component structure doesn't change unexpectedly
    expect(container.innerHTML).toContain(
      'class="request-detail-page marketplace-content"'
    );
    expect(container.innerHTML).toContain(
      'aria-labelledby="request-detail-heading"'
    );
    expect(container.innerHTML).toContain('id="request-detail-heading"');
    expect(container.innerHTML).toContain("<h1");
    expect(container.innerHTML).toContain("Request Detail");
  });

  test("should have no accessibility violations", async () => {
    const { container } = renderRequestDetailWithRouter();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("should meet WCAG accessibility standards", async () => {
    const { container } = renderRequestDetailWithRouter();

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
