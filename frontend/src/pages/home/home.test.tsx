import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Home } from "./home";

describe("Home", () => {
  const renderHomeWithRouter = () => {
    return render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
  };

  test("should render successfully", () => {
    const { container } = renderHomeWithRouter();
    const homeContainer = container.querySelector(".container");
    const section = container.querySelector("section");

    expect(homeContainer).toBeInTheDocument();
    expect(section).toBeInTheDocument();
  });

  test("should render main heading", () => {
    renderHomeWithRouter();

    const mainHeading = screen.getByText("Advana Marketplace");
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading.tagName).toBe("H1");
  });

  test("should render welcome subheading", () => {
    renderHomeWithRouter();

    const welcomeHeading = screen.getByText(
      "Welcome to the Advana Marketplace!"
    );
    expect(welcomeHeading).toBeInTheDocument();
    expect(welcomeHeading.tagName).toBe("H3");
  });

  test("should have proper semantic structure", () => {
    const { container } = renderHomeWithRouter();

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby", "home-heading");
  });

  test("should have correct CSS classes", () => {
    const { container } = renderHomeWithRouter();

    const containerDiv = container.querySelector(".container");
    expect(containerDiv).toBeInTheDocument();
    expect(containerDiv).toHaveClass("container");
  });

  test("should render without router (standalone)", () => {
    render(<Home />);

    expect(screen.getByText("Advana Marketplace")).toBeInTheDocument();
    expect(
      screen.getByText("Welcome to the Advana Marketplace!")
    ).toBeInTheDocument();
  });

  test("should have proper heading hierarchy", () => {
    renderHomeWithRouter();

    const h1 = screen.getByRole("heading", { level: 1 });
    const h3 = screen.getByRole("heading", { level: 3 });

    expect(h1).toHaveTextContent("Advana Marketplace");
    expect(h3).toHaveTextContent("Welcome to the Advana Marketplace!");
  });

  test("should be accessible", () => {
    renderHomeWithRouter();

    // Check for proper heading structure
    const headings = screen.getAllByRole("heading");
    expect(headings).toHaveLength(2);

    // Check for semantic section
    const section = screen.getByRole("region");
    expect(section).toBeInTheDocument();
  });

  test("should render all text content correctly", () => {
    renderHomeWithRouter();

    // Test exact text content
    expect(screen.getByText("Advana Marketplace")).toBeInTheDocument();
    expect(
      screen.getByText("Welcome to the Advana Marketplace!")
    ).toBeInTheDocument();

    // Test text is visible
    expect(screen.getByText("Advana Marketplace")).toBeVisible();
    expect(
      screen.getByText("Welcome to the Advana Marketplace!")
    ).toBeVisible();
  });

  test("should have correct DOM structure", () => {
    const { container } = renderHomeWithRouter();

    // Check the overall structure
    const outerDiv = container.firstChild;
    expect(outerDiv).toHaveClass("container");

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section?.parentElement).toHaveClass("container");

    // Check heading elements are within section
    const h1 = container.querySelector("h1");
    const h3 = container.querySelector("h3");
    expect(h1?.parentElement).toBe(section);
    expect(h3?.parentElement).toBe(section);
  });

  test("should render component snapshot consistently", () => {
    const { container } = renderHomeWithRouter();

    // Verify the component structure doesn't change unexpectedly
    expect(container.innerHTML).toContain('class="container"');
    expect(container.innerHTML).toContain('aria-labelledby="home-heading"');
    expect(container.innerHTML).toContain("<h1>");
    expect(container.innerHTML).toContain("<h3>");
    expect(container.innerHTML).toContain("Advana Marketplace");
    expect(container.innerHTML).toContain("Welcome to the Advana Marketplace!");
  });
});
