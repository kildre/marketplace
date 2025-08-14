import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../hooks/useAuth";
import { AppRoles } from "../../types/auth";
import { useRequests } from "../../hooks/useRequests";

export const Sidebar = (): React.ReactElement => {
  const location = useLocation();
  const { cartCount } = useCart();
  const { hasRole } = useAuth();
  const { userId: urlUserId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get("userId");

  // Use the same logic as the requests page for consistency
  const currentUserId = urlUserId || queryUserId || undefined;

  // Fetch requests for sidebar counter - always enabled to ensure counter updates
  const { requestsCount } = useRequests(currentUserId, true);

  const isActive = (path: string): boolean => {
    // Handle requests page with or without user parameters
    if (path === "/requests") {
      return (
        location.pathname === "/requests" ||
        location.pathname.startsWith("/requests/")
      );
    }
    // For approvers, the home page (/) should be active when on /requests too
    if (path === "/" && hasRole(AppRoles.APPROVER)) {
      return (
        location.pathname === "/" ||
        location.pathname === "/requests" ||
        location.pathname.startsWith("/requests/")
      );
    }
    // Exact match for other paths
    return location.pathname === path;
  };

  if (hasRole(AppRoles.APPROVER)) {
    return (
      <div className="sidebar">
        <nav className="sidebar-nav" role="navigation">
          <ul>
            <li
              className={
                isActive("/") ? "sidebar-nav__item active" : "sidebar-nav__item"
              }
            >
              <Link
                to="/"
                aria-label="Go to home page"
                aria-current={isActive("/") ? "page" : undefined}
              >
                Requests{" "}
                <span className="sidebar__requests-count">
                  ({requestsCount})
                </span>
              </Link>
            </li>
            {/* Metrics link visible to APPROVERs only */}
            <li
              className={
                isActive("/metrics")
                  ? "sidebar-nav__item active"
                  : "sidebar-nav__item"
              }
            >
              <Link
                to="/metrics"
                aria-label="Go to metrics page"
                aria-current={isActive("/metrics") ? "page" : undefined}
              >
                Metrics
              </Link>
            </li>
            {/* Development-only auth status link */}
            {/* {import.meta.env.DEV &&
              import.meta.env.VITE_BYPASS_AUTH === "true" &&
              !import.meta.env.VITEST && (
                <li
                  className={
                    isActive("/auth-status")
                      ? "sidebar-nav__item active"
                      : "sidebar-nav__item"
                  }
                  style={{
                    borderTop: "1px solid #ddd",
                    marginTop: "10px",
                    paddingTop: "10px",
                  }}
                >
                  <Link
                    to="/auth-status"
                    aria-label="Go to auth status page"
                    aria-current={isActive("/auth-status") ? "page" : undefined}
                    style={{ fontSize: "12px", color: "#666" }}
                  >
                    🔐 Auth Status (Dev)
                  </Link>
                </li>
              )} */}
          </ul>
        </nav>
      </div>
    );
  } else {
    return (
      <div className="sidebar">
        <nav className="sidebar-nav" role="navigation">
          <ul>
            <li
              className={
                isActive("/") ? "sidebar-nav__item active" : "sidebar-nav__item"
              }
            >
              <Link
                to="/"
                aria-label="Go to home page"
                aria-current={isActive("/") ? "page" : undefined}
              >
                Product Catalog
              </Link>
            </li>
            <li
              className={
                isActive("/cart")
                  ? "sidebar-nav__item active"
                  : "sidebar-nav__item"
              }
            >
              <Link
                to="/cart"
                aria-label="Go to cart page"
                aria-current={isActive("/cart") ? "page" : undefined}
              >
                Cart <span className="sidebar__cart-count">({cartCount})</span>
              </Link>
            </li>
            <li
              className={
                isActive("/requests")
                  ? "sidebar-nav__item active"
                  : "sidebar-nav__item"
              }
            >
              <Link
                to="/requests"
                aria-label="Go to requests page"
                aria-current={isActive("/requests") ? "page" : undefined}
              >
                Requests{" "}
                <span className="sidebar__requests-count">
                  ({requestsCount})
                </span>
              </Link>
            </li>
            {/* Development-only auth status link */}
            {/* {import.meta.env.DEV &&
              import.meta.env.VITE_BYPASS_AUTH === "true" &&
              !import.meta.env.VITEST && (
                <li
                  className={
                    isActive("/auth-status")
                      ? "sidebar-nav__item active"
                      : "sidebar-nav__item"
                  }
                  style={{
                    borderTop: "1px solid #ddd",
                    marginTop: "10px",
                    paddingTop: "10px",
                  }}
                >
                  <Link
                    to="/auth-status"
                    aria-label="Go to auth status page"
                    aria-current={isActive("/auth-status") ? "page" : undefined}
                    style={{ fontSize: "12px", color: "#666" }}
                  >
                    🔐 Auth Status (Dev)
                  </Link>
                </li>
              )} */}
          </ul>
        </nav>
      </div>
    );
  }
};
