import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import App from "./App";

// Mock the child components to focus on App structure
vi.mock("./components/government-banner/government-banner", () => ({
  GovernmentBanner: () => (
    <div data-testid="government-banner">Government Banner</div>
  ),
}));

vi.mock("./components/header/header-component", () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

vi.mock("./components/sidebar/sidebar", () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock("./components/footer/footer-component", () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

vi.mock("./pages/product-catalog/product-catalog", () => ({
  ProductCatalog: () => (
    <div data-testid="product-catalog">Product Catalog</div>
  ),
}));

vi.mock("./pages/cart/cart", () => ({
  Cart: () => <div data-testid="cart">Cart</div>,
}));

vi.mock("./pages/requests/requests", () => ({
  Requests: () => <div data-testid="requests">Requests</div>,
}));

vi.mock("./pages/request-detail/request-detail", () => ({
  RequestDetail: () => <div data-testid="request-detail">Request Detail</div>,
}));

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("App", () => {
  const renderAppWithRouter = (initialRoute = "/") => {
    window.history.pushState({}, "Test page", initialRoute);
    return render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  };

  test("should render successfully", () => {
    const { container } = renderAppWithRouter();

    expect(container.querySelector(".app-wrapper")).toBeInTheDocument();
    expect(container.querySelector("main.main-content")).toBeInTheDocument();
  });

  test("should render all main layout components", () => {
    renderAppWithRouter();

    expect(screen.getByTestId("government-banner")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  test("should have correct DOM structure", () => {
    const { container } = renderAppWithRouter();

    const appWrapper = container.querySelector(".app-wrapper");
    const mainContent = container.querySelector("main.main-content");

    expect(appWrapper).toBeInTheDocument();
    expect(mainContent).toBeInTheDocument();
    expect(mainContent?.parentElement).toBe(appWrapper);
  });

  test("should render ProductCatalog component on root route", () => {
    renderAppWithRouter("/");

    expect(screen.getByTestId("product-catalog")).toBeInTheDocument();
    expect(screen.queryByTestId("cart")).not.toBeInTheDocument();
    expect(screen.queryByTestId("requests")).not.toBeInTheDocument();
    expect(screen.queryByTestId("request-detail")).not.toBeInTheDocument();
  });

  test("should render Cart component on /cart route", () => {
    renderAppWithRouter("/cart");

    expect(screen.getByTestId("cart")).toBeInTheDocument();
    expect(screen.queryByTestId("product-catalog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("requests")).not.toBeInTheDocument();
    expect(screen.queryByTestId("request-detail")).not.toBeInTheDocument();
  });

  test("should render Requests component on /requests route", () => {
    renderAppWithRouter("/requests");

    expect(screen.getByTestId("requests")).toBeInTheDocument();
    expect(screen.queryByTestId("product-catalog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cart")).not.toBeInTheDocument();
    expect(screen.queryByTestId("request-detail")).not.toBeInTheDocument();
  });

  test("should render RequestDetail component on /request-detail route", () => {
    renderAppWithRouter("/request-detail");

    expect(screen.getByTestId("request-detail")).toBeInTheDocument();
    expect(screen.queryByTestId("product-catalog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cart")).not.toBeInTheDocument();
    expect(screen.queryByTestId("requests")).not.toBeInTheDocument();
  });

  test("should have proper semantic HTML structure", () => {
    const { container } = renderAppWithRouter();

    const main = container.querySelector("main");
    expect(main).toHaveClass("main-content");
    expect(main?.tagName).toBe("MAIN");
  });

  test("should maintain layout components across all routes", () => {
    const routes = ["/", "/cart", "/requests", "/request-detail"];

    routes.forEach((route) => {
      const { container } = renderAppWithRouter(route);

      expect(
        container.querySelector('[data-testid="government-banner"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-testid="header"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-testid="sidebar"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-testid="footer"]')
      ).toBeInTheDocument();
    });
  });

  test("should render component snapshot consistently", () => {
    const { container } = renderAppWithRouter();

    expect(container.innerHTML).toContain('class="app-wrapper"');
    expect(container.innerHTML).toContain('class="main-content"');
    expect(container.innerHTML).toContain("<main");
  });

  test("should have correct CSS classes", () => {
    const { container } = renderAppWithRouter();

    const appWrapper = container.querySelector(".app-wrapper");
    const mainContent = container.querySelector(".main-content");

    expect(appWrapper).toHaveClass("app-wrapper");
    expect(mainContent).toHaveClass("main-content");
  });

  test("should have no accessibility violations", async () => {
    const { container } = renderAppWithRouter();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("should meet WCAG accessibility standards", async () => {
    const { container } = renderAppWithRouter();

    // Test semantic structure
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();

    // Run comprehensive accessibility tests
    const results = await axe(container, {
      rules: {
        "landmark-unique": { enabled: true },
        "page-has-heading-one": { enabled: false }, // We're testing the overall structure
      },
    });
    expect(results).toHaveNoViolations();
  });

  test("should render routes correctly with different URL paths", () => {
    const testCases = [
      { path: "/", expectedTestId: "product-catalog" },
      { path: "/cart", expectedTestId: "cart" },
      { path: "/requests", expectedTestId: "requests" },
      { path: "/request-detail", expectedTestId: "request-detail" },
    ];

    testCases.forEach(({ path, expectedTestId }) => {
      renderAppWithRouter(path);
      expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
    });
  });
});
