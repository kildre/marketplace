import { render, screen } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from 'jest-axe';
import { Header } from "./header-component";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("Header", () => {
  const renderHeaderWithRouter = (initialEntries = ["/"]) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Header />
      </MemoryRouter>
    );
  };

  test("should render successfully", () => {
    const { container } = renderHeaderWithRouter();
    const header = container.querySelector(".header");
    const nav = container.querySelector(".nav");

    expect(header).toBeInTheDocument();
    expect(nav).toBeInTheDocument();
  });

  test("should render header logo with correct attributes", () => {
    renderHeaderWithRouter();

    const logo = screen.getByAltText("Logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/assets/logos/LOGOS.png");
    expect(logo).toHaveClass("header-logo");
  });

  test("should render navigation links", () => {
    renderHeaderWithRouter();

    const homeLink = screen.getByText("Home");
    const aboutLink = screen.getByText("About");

    expect(homeLink).toBeInTheDocument();
    expect(aboutLink).toBeInTheDocument();
    expect(homeLink.closest("a")).toHaveAttribute("href", "/");
    expect(aboutLink.closest("a")).toHaveAttribute("href", "/about");
  });

  test("should apply active class to Home link when on home page", () => {
    renderHeaderWithRouter(["/"]);

    const homeLink = screen.getByText("Home");
    const aboutLink = screen.getByText("About");

    expect(homeLink).toHaveClass("nav-link", "active");
    expect(aboutLink).toHaveClass("nav-link");
    expect(aboutLink).not.toHaveClass("active");
  });

  test("should apply active class to About link when on about page", () => {
    renderHeaderWithRouter(["/about"]);

    const homeLink = screen.getByText("Home");
    const aboutLink = screen.getByText("About");

    expect(aboutLink).toHaveClass("nav-link", "active");
    expect(homeLink).toHaveClass("nav-link");
    expect(homeLink).not.toHaveClass("active");
  });

  test("should not apply active class to any link when on different page", () => {
    renderHeaderWithRouter(["/other-page"]);

    const homeLink = screen.getByText("Home");
    const aboutLink = screen.getByText("About");

    expect(homeLink).toHaveClass("nav-link");
    expect(homeLink).not.toHaveClass("active");
    expect(aboutLink).toHaveClass("nav-link");
    expect(aboutLink).not.toHaveClass("active");
  });

  test("should render all elements with correct CSS classes", () => {
    const { container } = renderHeaderWithRouter();

    const header = container.querySelector(".header");
    const logo = container.querySelector(".header-logo");
    const nav = container.querySelector(".nav");
    const navLinks = container.querySelectorAll(".nav-link");

    expect(header).toBeInTheDocument();
    expect(logo).toBeInTheDocument();
    expect(nav).toBeInTheDocument();
    expect(navLinks).toHaveLength(2);
  });

  test("should work with BrowserRouter as well", () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
  });

  test("should have no accessibility violations", async () => {
    const { container } = renderHeaderWithRouter();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("should have no accessibility violations on different routes", async () => {
    const { container } = renderHeaderWithRouter(["/about"]);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
