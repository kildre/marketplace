import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { PageTitle } from "./page-title";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("PageTitle", () => {
  const defaultProps = {
    title: "Test Page Title",
  };

  const renderPageTitle = (
    props: { title: string; id?: string } = defaultProps
  ) => {
    return render(<PageTitle {...props} />);
  };

  test("should render successfully", () => {
    const { container } = renderPageTitle();
    const section = container.querySelector(".section__page-title");

    expect(section).toBeInTheDocument();
  });

  test("should render page title with correct text", () => {
    renderPageTitle();

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Test Page Title");
  });

  test("should generate ID from title by default", () => {
    renderPageTitle({ title: "Product Catalog" });

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveAttribute("id", "product-catalog-heading");
  });

  test("should handle spaces in title when generating ID", () => {
    renderPageTitle({ title: "Shopping Cart Items" });

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveAttribute("id", "shopping-cart-items-heading");
  });

  test("should handle multiple spaces in title when generating ID", () => {
    renderPageTitle({ title: "My   Account   Settings" });

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveAttribute("id", "my-account-settings-heading");
  });

  test("should convert uppercase letters to lowercase in generated ID", () => {
    renderPageTitle({ title: "USER PROFILE SETTINGS" });

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveAttribute("id", "user-profile-settings-heading");
  });

  test("should have correct CSS class", () => {
    const { container } = renderPageTitle();

    const section = container.querySelector(".section__page-title");
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass("section__page-title");
  });

  test("should have proper ARIA attributes", () => {
    renderPageTitle({ title: "Product Catalog" });

    const section = screen.getByRole("region");
    const heading = screen.getByRole("heading", { level: 1 });

    expect(section).toHaveAttribute(
      "aria-labelledby",
      "product-catalog-heading"
    );
    expect(heading).toHaveAttribute("id", "product-catalog-heading");
  });

  test("should have proper semantic structure", () => {
    renderPageTitle();

    const section = screen.getByRole("region");
    const heading = screen.getByRole("heading", { level: 1 });

    expect(section).toBeInTheDocument();
    expect(heading).toBeInTheDocument();
    expect(section).toContainElement(heading);
  });

  test("should render different titles correctly", () => {
    const titles = [
      "Home",
      "About Us",
      "Contact Information",
      "Product Details Page",
    ];

    titles.forEach((title) => {
      const { unmount } = renderPageTitle({ title });
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent(title);
      unmount();
    });
  });

  test("should have no accessibility violations", async () => {
    const { container } = renderPageTitle();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("should have no accessibility violations with custom ID", async () => {
    const { container } = renderPageTitle({
      title: "Product Catalog",
      id: "custom-heading",
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("should have no accessibility violations with complex title", async () => {
    const { container } = renderPageTitle({
      title: "Complex Page Title With Multiple Words",
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
