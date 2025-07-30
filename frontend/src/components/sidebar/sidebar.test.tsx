import { render, screen } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { Sidebar } from "./sidebar";
import { CartProvider } from "../../contexts/CartContext";
import { AppRoles } from "../../types/auth";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("Sidebar", () => {
  const renderSidebarWithRouter = (
    initialRoute = "/",
    userRole = AppRoles.REQUESTOR
  ) => {
    // Mock the useAuth hook with the specified role
    mockUseAuth.mockReturnValue({
      userInfo: {
        id: "test-user-123",
        username: "testuser",
        email: "test@advana.mil",
        firstName: "Test",
        lastName: "User",
        roles: [userRole],
        permissions: ["READ", "WRITE"],
      },
      getUserInfo: () => ({
        id: "test-user-123",
        username: "testuser",
        email: "test@advana.mil",
        firstName: "Test",
        lastName: "User",
        roles: [userRole],
      }),
      keycloak: {},
      isAuthenticated: true,
      isRequestor: () => userRole === AppRoles.REQUESTOR,
      isApprover: () => userRole === AppRoles.APPROVER,
      hasRole: (role: AppRoles) => userRole === role,
      hasPermission: () => true,
      logout: vi.fn(),
      login: vi.fn(),
    });

    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <CartProvider>
          <Sidebar />
        </CartProvider>
      </MemoryRouter>
    );
  };

  const renderSidebarWithBrowserRouter = (userRole = AppRoles.REQUESTOR) => {
    // Mock the useAuth hook with the specified role
    mockUseAuth.mockReturnValue({
      userInfo: {
        id: "test-user-123",
        username: "testuser",
        email: "test@advana.mil",
        firstName: "Test",
        lastName: "User",
        roles: [userRole],
        permissions: ["READ", "WRITE"],
      },
      getUserInfo: () => ({
        id: "test-user-123",
        username: "testuser",
        email: "test@advana.mil",
        firstName: "Test",
        lastName: "User",
        roles: [userRole],
      }),
      keycloak: {},
      isAuthenticated: true,
      isRequestor: () => userRole === AppRoles.REQUESTOR,
      isApprover: () => userRole === AppRoles.APPROVER,
      hasRole: (role: AppRoles) => userRole === role,
      hasPermission: () => true,
      logout: vi.fn(),
      login: vi.fn(),
    });

    return render(
      <BrowserRouter>
        <CartProvider>
          <Sidebar />
        </CartProvider>
      </BrowserRouter>
    );
  };

  test("should render successfully", () => {
    const { container } = renderSidebarWithBrowserRouter(AppRoles.REQUESTOR);
    const sidebar = container.querySelector(".sidebar");
    const nav = container.querySelector(".sidebar-nav");

    expect(sidebar).toBeInTheDocument();
    expect(nav).toBeInTheDocument();
  });

  test("should render all navigation links for REQUESTOR role", () => {
    renderSidebarWithBrowserRouter(AppRoles.REQUESTOR);

    // REQUESTOR should see all three navigation links
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

  test("should render limited navigation links for APPROVER role", () => {
    renderSidebarWithBrowserRouter(AppRoles.APPROVER);

    // APPROVER should only see the home link (which shows as "Requests")
    const homeLink = screen.getByRole("link", {
      name: /go to home page/i,
    });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveTextContent("Requests");

    // APPROVER should not see cart or separate requests links
    expect(
      screen.queryByRole("link", { name: /go to cart page/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /go to requests page/i })
    ).not.toBeInTheDocument();
  });

  test("should have correct link URLs for REQUESTOR role", () => {
    renderSidebarWithBrowserRouter(AppRoles.REQUESTOR);

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

  test("should have correct link URLs for APPROVER role", () => {
    renderSidebarWithBrowserRouter(AppRoles.APPROVER);

    const homeLink = screen.getByRole("link", {
      name: /go to home page/i,
    });

    expect(homeLink).toHaveAttribute("href", "/");
  });

  test("should have proper semantic structure for REQUESTOR role", () => {
    const { container } = renderSidebarWithBrowserRouter(AppRoles.REQUESTOR);

    const nav = container.querySelector("nav.sidebar-nav");
    const list = nav?.querySelector("ul");
    const listItems = nav?.querySelectorAll("li.sidebar-nav__item");

    expect(nav).toBeInTheDocument();
    expect(list).toBeInTheDocument();
    expect(listItems).toHaveLength(3);
  });

  test("should have proper semantic structure for APPROVER role", () => {
    const { container } = renderSidebarWithBrowserRouter(AppRoles.APPROVER);

    const nav = container.querySelector("nav.sidebar-nav");
    const list = nav?.querySelector("ul");
    const listItems = nav?.querySelectorAll("li.sidebar-nav__item");

    expect(nav).toBeInTheDocument();
    expect(list).toBeInTheDocument();
    expect(listItems).toHaveLength(1);
  });

  test("should display cart and requests counters for REQUESTOR role", () => {
    renderSidebarWithBrowserRouter(AppRoles.REQUESTOR);

    const cartCounter = screen.getByText("(0)", {
      selector: ".sidebar__cart-count",
    });
    const requestsCounter = screen.getByText("(0)", {
      selector: ".sidebar__requests-count",
    });

    expect(cartCounter).toBeInTheDocument();
    expect(requestsCounter).toBeInTheDocument();
  });

  test("should display only requests counter for APPROVER role", () => {
    renderSidebarWithBrowserRouter(AppRoles.APPROVER);

    const requestsCounter = screen.getByText("(31)", {
      selector: ".sidebar__requests-count",
    });

    expect(requestsCounter).toBeInTheDocument();

    // Cart counter should not be present for APPROVER
    expect(
      screen.queryByText("(0)", {
        selector: ".sidebar__cart-count",
      })
    ).not.toBeInTheDocument();
  });

  test("should have correct CSS classes for REQUESTOR role", () => {
    const { container } = renderSidebarWithBrowserRouter(AppRoles.REQUESTOR);

    const sidebar = container.querySelector(".sidebar");
    const nav = container.querySelector(".sidebar-nav");
    const listItems = container.querySelectorAll(".sidebar-nav__item");

    expect(sidebar).toHaveClass("sidebar");
    expect(nav).toHaveClass("sidebar-nav");
    expect(listItems).toHaveLength(3);
    listItems.forEach((item) => {
      expect(item).toHaveClass("sidebar-nav__item");
    });
  });

  test("should have correct CSS classes for APPROVER role", () => {
    const { container } = renderSidebarWithBrowserRouter(AppRoles.APPROVER);

    const sidebar = container.querySelector(".sidebar");
    const nav = container.querySelector(".sidebar-nav");
    const listItems = container.querySelectorAll(".sidebar-nav__item");

    expect(sidebar).toHaveClass("sidebar");
    expect(nav).toHaveClass("sidebar-nav");
    expect(listItems).toHaveLength(1);
    listItems.forEach((item) => {
      expect(item).toHaveClass("sidebar-nav__item");
    });
  });

  test("should have proper accessibility attributes for REQUESTOR role", () => {
    renderSidebarWithBrowserRouter(AppRoles.REQUESTOR);

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

  test("should have proper accessibility attributes for APPROVER role", () => {
    renderSidebarWithBrowserRouter(AppRoles.APPROVER);

    const homeLink = screen.getByRole("link", {
      name: /go to home page/i,
    });

    expect(homeLink).toHaveAttribute("aria-label", "Go to home page");
  });

  test("should have correct aria-current attributes for active links on home page", () => {
    renderSidebarWithRouter("/", AppRoles.REQUESTOR);

    const homeLink = screen.getByRole("link", { name: /go to home page/i });
    expect(homeLink).toHaveAttribute("aria-current", "page");
  });

  test("should apply active class correctly to navigation items for REQUESTOR", () => {
    const testCases = [
      { path: "/", expectedActiveIndex: 0 },
      { path: "/cart", expectedActiveIndex: 1 },
      { path: "/requests", expectedActiveIndex: 2 },
    ];

    testCases.forEach(({ path, expectedActiveIndex }) => {
      const { container } = renderSidebarWithRouter(path, AppRoles.REQUESTOR);
      const listItems = container.querySelectorAll(".sidebar-nav__item");
      const activeItems = container.querySelectorAll(
        ".sidebar-nav__item.active"
      );

      expect(listItems).toHaveLength(3);
      expect(activeItems).toHaveLength(1);
      expect(listItems[expectedActiveIndex]).toHaveClass("active");
    });
  });

  test("should apply active class correctly for APPROVER on home page", () => {
    const { container } = renderSidebarWithRouter("/", AppRoles.APPROVER);
    const listItems = container.querySelectorAll(".sidebar-nav__item");
    const activeItems = container.querySelectorAll(".sidebar-nav__item.active");

    expect(listItems).toHaveLength(1);
    expect(activeItems).toHaveLength(1);
    expect(listItems[0]).toHaveClass("active");
  });

  test("should handle router context properly for REQUESTOR", () => {
    const { container } = renderSidebarWithBrowserRouter(AppRoles.REQUESTOR);
    expect(container.querySelector(".sidebar")).toBeInTheDocument();
    expect(container.querySelectorAll("a")).toHaveLength(3);
  });

  test("should handle router context properly for APPROVER", () => {
    const { container } = renderSidebarWithBrowserRouter(AppRoles.APPROVER);
    expect(container.querySelector(".sidebar")).toBeInTheDocument();
    expect(container.querySelectorAll("a")).toHaveLength(1);
  });

  test("should have proper DOM structure for REQUESTOR", () => {
    const { container } = renderSidebarWithBrowserRouter(AppRoles.REQUESTOR);

    const sidebar = container.querySelector(".sidebar");
    const nav = container.querySelector("nav.sidebar-nav");
    const ul = nav?.querySelector("ul");
    const listItems = container.querySelectorAll("li.sidebar-nav__item");

    expect(sidebar).toBeInTheDocument();
    expect(nav).toBeInTheDocument();
    expect(nav?.parentElement).toBe(sidebar);
    expect(ul?.parentElement).toBe(nav);
    expect(listItems).toHaveLength(3);

    // Check that each list item contains a link
    listItems.forEach((item) => {
      const link = item.querySelector("a");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href");
    });
  });

  test("should have proper DOM structure for APPROVER", () => {
    const { container } = renderSidebarWithBrowserRouter(AppRoles.APPROVER);

    const sidebar = container.querySelector(".sidebar");
    const nav = container.querySelector("nav.sidebar-nav");
    const ul = nav?.querySelector("ul");
    const listItems = container.querySelectorAll("li.sidebar-nav__item");

    expect(sidebar).toBeInTheDocument();
    expect(nav).toBeInTheDocument();
    expect(nav?.parentElement).toBe(sidebar);
    expect(ul?.parentElement).toBe(nav);
    expect(listItems).toHaveLength(1);

    // Check that the list item contains a link
    const link = listItems[0].querySelector("a");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href");
  });

  test("should render component snapshot consistently for REQUESTOR", () => {
    const { container } = renderSidebarWithBrowserRouter(AppRoles.REQUESTOR);

    expect(container.innerHTML).toContain('class="sidebar"');
    expect(container.innerHTML).toContain('class="sidebar-nav"');
    expect(container.innerHTML).toContain('class="sidebar-nav__item"');
    expect(container.innerHTML).toContain('class="sidebar__cart-count"');
    expect(container.innerHTML).toContain('class="sidebar__requests-count"');
  });

  test("should render component snapshot consistently for APPROVER", () => {
    const { container } = renderSidebarWithBrowserRouter(AppRoles.APPROVER);

    expect(container.innerHTML).toContain('class="sidebar"');
    expect(container.innerHTML).toContain('class="sidebar-nav"');
    expect(container.innerHTML).toContain("sidebar-nav__item");
    expect(container.innerHTML).not.toContain('class="sidebar__cart-count"');
    expect(container.innerHTML).toContain('class="sidebar__requests-count"');
  });

  test("should have no accessibility violations", async () => {
    const { container } = renderSidebarWithBrowserRouter(AppRoles.REQUESTOR);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("should meet WCAG accessibility standards for REQUESTOR", () => {
    const { container } = renderSidebarWithBrowserRouter(AppRoles.REQUESTOR);

    // Test navigation structure
    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute("role", "navigation");

    // Test list structure
    const list = container.querySelector("ul");
    expect(list).toBeInTheDocument();

    // Test link accessibility
    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(3);

    links.forEach((link) => {
      expect(link).toHaveAttribute("href");
      expect(link).toHaveAttribute("aria-label");
    });
  });

  test("should meet WCAG accessibility standards for APPROVER", () => {
    const { container } = renderSidebarWithBrowserRouter(AppRoles.APPROVER);

    // Test navigation structure
    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute("role", "navigation");

    // Test list structure
    const list = container.querySelector("ul");
    expect(list).toBeInTheDocument();

    // Test link accessibility
    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(1);

    links.forEach((link) => {
      expect(link).toHaveAttribute("href");
      expect(link).toHaveAttribute("aria-label");
    });
  });

  test("should have correct navigation semantics for REQUESTOR", () => {
    const { container } = renderSidebarWithBrowserRouter(AppRoles.REQUESTOR);

    // Test semantic navigation structure
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

  test("should have correct navigation semantics for APPROVER", () => {
    const { container } = renderSidebarWithBrowserRouter(AppRoles.APPROVER);

    // Test semantic navigation structure
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
    expect(listItems).toHaveLength(1);

    // Check that the list item contains a link
    const link = listItems[0].querySelector("a");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href");
  });

  test("should handle navigation state consistently for REQUESTOR", () => {
    const { container } = renderSidebarWithRouter("/", AppRoles.REQUESTOR);

    // Home list item should have active class
    const homeListItem = container.querySelector("li.sidebar-nav__item.active");
    expect(homeListItem).toBeInTheDocument();

    // Home link should have aria-current="page"
    const homeLink = screen.getByRole("link", { name: /go to home page/i });
    expect(homeLink).toHaveAttribute("aria-current", "page");

    // Cart and requests list items should not have active class
    const allListItems = container.querySelectorAll(".sidebar-nav__item");
    const activeItems = container.querySelectorAll(".sidebar-nav__item.active");
    expect(allListItems).toHaveLength(3);
    expect(activeItems).toHaveLength(1);

    // Cart and requests links should not have aria-current
    const cartLink = screen.getByRole("link", { name: /go to cart page/i });
    const requestsLink = screen.getByRole("link", {
      name: /go to requests page/i,
    });
    expect(cartLink).not.toHaveAttribute("aria-current");
    expect(requestsLink).not.toHaveAttribute("aria-current");
  });

  test("should handle navigation state consistently for APPROVER", () => {
    const { container } = renderSidebarWithRouter("/", AppRoles.APPROVER);

    // Home list item should have active class
    const homeListItem = container.querySelector("li.sidebar-nav__item.active");
    expect(homeListItem).toBeInTheDocument();

    // Home link should have aria-current="page"
    const homeLink = screen.getByRole("link", { name: /go to home page/i });
    expect(homeLink).toHaveAttribute("aria-current", "page");

    // Should only have one list item for APPROVER
    const allListItems = container.querySelectorAll(".sidebar-nav__item");
    const activeItems = container.querySelectorAll(".sidebar-nav__item.active");
    expect(allListItems).toHaveLength(1);
    expect(activeItems).toHaveLength(1);
  });
});
