import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from 'jest-axe';
import { Header } from "./header-component";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("Header", () => {
  const renderHeader = () => {
    return render(<Header />);
  };

  test("should render successfully", () => {
    const { container } = renderHeader();
    const header = container.querySelector(".header");

    expect(header).toBeInTheDocument();
  });

  test("should render header logo with correct attributes", () => {
    renderHeader();

    const logo = screen.getByAltText("Logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/assets/logos/LOGOS.png");
    expect(logo).toHaveClass("header-logo");
  });

  test("should render header with correct CSS class", () => {
    const { container } = renderHeader();

    const header = container.querySelector(".header");
    const logo = container.querySelector(".header-logo");

    expect(header).toBeInTheDocument();
    expect(logo).toBeInTheDocument();
  });

  test("should have no accessibility violations", async () => {
    const { container } = renderHeader();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
