import { render, screen } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { Sidebar } from "./sidebar";
import { CartProvider } from "../../contexts/CartContext";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("Sidebar", () => {
  const renderSidebarWithRouter = (initialRoute = "/") => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <CartProvider>
          <Sidebar />
        </CartProvider>
      </MemoryRouter>
    );
  };

  const renderSidebarWithBrowserRouter = () => {
    return render(
      <BrowserRouter>
        <CartProvider>
          <Sidebar />
        </CartProvider>
      </BrowserRouter>
    );
  };

  test("should render successfully", () => {
    const { container } = renderSidebarWithBrowserRouter();
    const sidebar = container.querySelector(".sidebar");
    const nav = container.querySelector(".sidebar-nav");

    expect(sidebar).toBeInTheDocument();
    expect(nav).toBeInTheDocument();
  });

  test("should render all navigation links", () => {
    renderSidebarWithBrowserRouter();

    // Check for navigation links
    const productCatalogLink = screen.getByRole("link", {
      name: /go to home page/i,
    });
    const cartLink = screen.getByRole("link", { name: /go to cart page/i });
    const requestsLink = screen.getByRole("link", {
      name: /go to requests page/i,
    });

    expect(productCatalogLink).toBeInTheDocument();
    expect(cartLink).toBeInTheDocument();
    expect(requestsLink).toBeInTheDocument();

    // Check link text content
    expect(productCatalogLink).toHaveTextContent("Product Catalog");
    expect(cartLink).toHaveTextContent("Cart");
    expect(requestsLink).toHaveTextContent("Requests");
  });

  test("should have correct link URLs", () => {
    renderSidebarWithBrowserRouter();

    const productCatalogLink = screen.getByRole("link", {
      name: /go to home page/i,
    });
    const cartLink = screen.getByRole("link", { name: /go to cart page/i });
    const requestsLink = screen.getByRole("link", {
      name: /go to requests page/i,
    });

    expect(productCatalogLink).toHaveAttribute("href", "/");
    expect(cartLink).toHaveAttribute("href", "/cart");
    expect(requestsLink).toHaveAttribute("href", "/requests");
  });

  test("should have proper semantic structure", () => {
    const { container } = renderSidebarWithBrowserRouter();

    const nav = container.querySelector("nav.sidebar-nav");
    const list = nav?.querySelector("ul");
    const listItems = nav?.querySelectorAll("li.sidebar-nav__item");

    expect(nav).toBeInTheDocument();
    expect(list).toBeInTheDocument();
    expect(listItems).toHaveLength(3);
  });

  test("should display cart and requests counters", () => {
    renderSidebarWithBrowserRouter();

    const cartCounter = screen.getByText("(0)", {
      selector: ".sidebar__cart-count",
    });
    const requestsCounter = screen.getByText("(0)", {
      selector: ".sidebar__requests-count",
    });

    expect(cartCounter).toBeInTheDocument();
    expect(requestsCounter).toBeInTheDocument();
  });

  test("should have correct CSS classes", () => {
    const { container } = renderSidebarWithBrowserRouter();

    const sidebar = container.querySelector(".sidebar");
    const nav = container.querySelector(".sidebar-nav");
    const listItems = container.querySelectorAll(".sidebar-nav__item");
    const cartCount = container.querySelector(".sidebar__cart-count");
    const requestsCount = container.querySelector(".sidebar__requests-count");

    expect(sidebar).toHaveClass("sidebar");
    expect(nav).toHaveClass("sidebar-nav");
    expect(listItems).toHaveLength(3);
    listItems.forEach((item) => {
      expect(item).toHaveClass("sidebar-nav__item");
    });
    expect(cartCount).toHaveClass("sidebar__cart-count");
    expect(requestsCount).toHaveClass("sidebar__requests-count");
  });

  test("should have proper accessibility attributes", () => {
    renderSidebarWithBrowserRouter();

    const productCatalogLink = screen.getByRole("link", {
      name: /go to home page/i,
    });
    const cartLink = screen.getByRole("link", { name: /go to cart page/i });
    const requestsLink = screen.getByRole("link", {
      name: /go to requests page/i,
    });

    expect(productCatalogLink).toHaveAttribute("aria-label", "Go to home page");
    expect(cartLink).toHaveAttribute("aria-label", "Go to cart page");
    expect(requestsLink).toHaveAttribute("aria-label", "Go to requests page");
  });

  test("should have correct aria-current attributes for active links", () => {
    // Test home page
    renderSidebarWithRouter("/");
    
    const homeLink = screen.getByRole("link", { name: /go to home page/i });
    const cartLink = screen.getByRole("link", { name: /go to cart page/i });
    const requestsLink = screen.getByRole("link", { name: /go to requests page/i });

    expect(homeLink).toHaveAttribute("aria-current", "page");
    expect(cartLink).not.toHaveAttribute("aria-current");
    expect(requestsLink).not.toHaveAttribute("aria-current");
  });

  test("should apply active class correctly to navigation items", () => {
    // Test different routes
    const routes = [
      { path: "/", expectedActiveIndex: 0 },
      { path: "/cart", expectedActiveIndex: 1 },
      { path: "/requests", expectedActiveIndex: 2 }
    ];

    routes.forEach(({ path, expectedActiveIndex }) => {
      const { container } = renderSidebarWithRouter(path);
      
      const listItems = container.querySelectorAll('.sidebar-nav__item');
      const activeItems = container.querySelectorAll('.sidebar-nav__item.active');
      
      expect(listItems).toHaveLength(3);
      expect(activeItems).toHaveLength(1);
      expect(listItems[expectedActiveIndex]).toHaveClass('active');
    });
  });

  test("should handle router context properly", () => {
    // This test ensures the component works correctly with router context
    const { container } = renderSidebarWithBrowserRouter();
    expect(container.querySelector(".sidebar")).toBeInTheDocument();
    expect(container.querySelectorAll("a")).toHaveLength(3);
  });

  test("should have proper DOM structure", () => {
    const { container } = renderSidebarWithBrowserRouter();

    // Check the overall structure
    const sidebar = container.querySelector(".sidebar");
    const nav = sidebar?.querySelector("nav.sidebar-nav");
    const ul = nav?.querySelector("ul");
    const listItems = ul?.querySelectorAll("li.sidebar-nav__item");

    expect(sidebar).toBeInTheDocument();
    expect(nav?.parentElement).toBe(sidebar);
    expect(ul?.parentElement).toBe(nav);
    expect(listItems).toHaveLength(3);

    // Check that each list item contains a link
    listItems?.forEach((item) => {
      const link = item.querySelector("a");
      expect(link).toBeInTheDocument();
    });
  });

  test("should render component snapshot consistently", () => {
    const { container } = renderSidebarWithBrowserRouter();

    expect(container.innerHTML).toContain('class="sidebar"');
    expect(container.innerHTML).toContain('class="sidebar-nav"');
    expect(container.innerHTML).toContain('class="sidebar-nav__item"');
    expect(container.innerHTML).toContain('class="sidebar__cart-count"');
    expect(container.innerHTML).toContain('class="sidebar__requests-count"');
    expect(container.innerHTML).toContain('aria-label="Go to home page"');
    expect(container.innerHTML).toContain('aria-label="Go to cart page"');
    expect(container.innerHTML).toContain('aria-label="Go to requests page"');
  });

  test("should have no accessibility violations", async () => {
    const { container } = renderSidebarWithBrowserRouter();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("should meet WCAG accessibility standards", async () => {
    const { container } = renderSidebarWithBrowserRouter();

    // Test navigation structure
    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();

    // Test link accessibility
    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(3);

    links.forEach((link) => {
      expect(link).toHaveAttribute("aria-label");
    });

    // Run comprehensive accessibility tests
    const results = await axe(container, {
      rules: {
        "landmark-unique": { enabled: true },
        "color-contrast": { enabled: true },
        "link-name": { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });

  test("should have correct navigation semantics", () => {
    const { container } = renderSidebarWithBrowserRouter();

    // Check for proper navigation landmark with role
    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass("sidebar-nav");
    expect(nav).toHaveAttribute("role", "navigation");

    // Check for proper list structure
    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();
    expect(list.parentElement).toBe(nav);

    // Check for proper list items
    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(3);

    // Check that each list item contains a link
    listItems.forEach((item) => {
      const link = item.querySelector("a");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href");
    });
  });

  test("should handle navigation state consistently", () => {
    const { container } = renderSidebarWithRouter("/");

    // Home list item should have active class
    const homeListItem = container.querySelector('li.sidebar-nav__item.active');
    expect(homeListItem).toBeInTheDocument();
    
    // Home link should have aria-current="page"
    const homeLink = screen.getByRole("link", { name: /go to home page/i });
    expect(homeLink).toHaveAttribute("aria-current", "page");

    // Cart and requests list items should not have active class
    const allListItems = container.querySelectorAll('.sidebar-nav__item');
    const activeItems = container.querySelectorAll('.sidebar-nav__item.active');
    expect(allListItems).toHaveLength(3);
    expect(activeItems).toHaveLength(1);

    // Cart and requests links should not have aria-current
    const cartLink = screen.getByRole("link", { name: /go to cart page/i });
    const requestsLink = screen.getByRole("link", { name: /go to requests page/i });
    expect(cartLink).not.toHaveAttribute("aria-current");
    expect(requestsLink).not.toHaveAttribute("aria-current");
  });

  test("should render active state correctly", () => {
    // Test home page active state
    const { container: homeContainer } = renderSidebarWithRouter("/");
    
    const homeListItem = homeContainer.querySelector('.sidebar-nav__item.active');
    const homeLink = screen.getByRole("link", { name: /go to home page/i });
    
    expect(homeListItem).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("aria-current", "page");

    // Test cart page active state
    const { container: cartContainer } = renderSidebarWithRouter("/cart");
    
    const cartListItems = cartContainer.querySelectorAll('.sidebar-nav__item');
    const activeCartItems = cartContainer.querySelectorAll('.sidebar-nav__item.active');
    expect(cartListItems).toHaveLength(3);
    expect(activeCartItems).toHaveLength(1);
    
    // The active item should be the second one (cart)
    expect(cartListItems[1]).toHaveClass('active');

    // Test requests page active state
    const { container: requestsContainer } = renderSidebarWithRouter("/requests");
    
    const requestsListItems = requestsContainer.querySelectorAll('.sidebar-nav__item');
    const activeRequestsItems = requestsContainer.querySelectorAll('.sidebar-nav__item.active');
    expect(requestsListItems).toHaveLength(3);
    expect(activeRequestsItems).toHaveLength(1);
    
    // The active item should be the third one (requests)
    expect(requestsListItems[2]).toHaveClass('active');
  });
});
