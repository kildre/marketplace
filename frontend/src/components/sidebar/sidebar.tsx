import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";

export const Sidebar = (): React.ReactElement => {
  const location = useLocation();
  const { cartCount } = useCart();

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

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
              Requests <span className="sidebar__requests-count">(0)</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};
