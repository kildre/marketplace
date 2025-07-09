import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { Header } from "./header-component";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("Header", () => {
  const renderHeader = () => {
    return render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
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
    expect(logo).toHaveClass("header__logo");
  });

  test("should wrap logo in a link to home page", () => {
    renderHeader();

    const logoLink = screen.getByLabelText("Go to home page");
    const logo = screen.getByAltText("Logo");

    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute("href", "/");
    expect(logoLink).toContainElement(logo);
  });

  test("should render header with correct CSS class", () => {
    const { container } = renderHeader();

    const header = container.querySelector(".header");
    const logo = container.querySelector(".header__logo");

    expect(header).toBeInTheDocument();
    expect(logo).toBeInTheDocument();
  });

  test("should render cart link with correct attributes", () => {
    renderHeader();

    const cartLink = screen.getByLabelText("Go to cart page");
    expect(cartLink).toBeInTheDocument();
    expect(cartLink).toHaveAttribute("href", "/cart");
    expect(cartLink).toHaveClass("header__cart-wrapper");
  });

  test("should render cart icon with correct attributes", () => {
    renderHeader();

    const cartIcon = screen.getByAltText("Cart Icon");
    expect(cartIcon).toBeInTheDocument();
    expect(cartIcon).toHaveAttribute("src", "/assets/icons/cart-icon.png");
    expect(cartIcon).toHaveClass("header__cart-icon");
  });

  test("should display cart count", () => {
    renderHeader();

    const cartCount = screen.getByText("(0)");
    expect(cartCount).toBeInTheDocument();
    expect(cartCount).toHaveClass("header__cart-count");
  });

  test("should have proper navigation structure", () => {
    renderHeader();

    const homeLink = screen.getByLabelText("Go to home page");
    const cartLink = screen.getByLabelText("Go to cart page");

    expect(homeLink).toBeInTheDocument();
    expect(cartLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
    expect(cartLink).toHaveAttribute("href", "/cart");
  });

  test("should have no accessibility violations", async () => {
    const { container } = renderHeader();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
