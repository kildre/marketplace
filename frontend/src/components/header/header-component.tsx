import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";

export const Header = (): React.ReactElement => {
  const { cartCount } = useCart();

  return (
    <header className="header">
      <Link to="/" aria-label="Go to home page">
        <img
          src="/assets/logos/LOGOS.png"
          alt="Logo"
          className="header__logo"
        />
      </Link>
      <Link
        className="header__cart-wrapper"
        to="/cart"
        aria-label="Go to cart page"
      >
        <img
          src="/assets/icons/cart-icon.png"
          alt="Cart Icon"
          className="header__cart-icon"
        />
        <span className="header__cart-count">({cartCount})</span>
      </Link>
    </header>
  );
};
