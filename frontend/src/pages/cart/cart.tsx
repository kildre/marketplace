import { Link } from "react-router-dom";
import { PageTitle } from "../../components/page-title/page-title";
import { CartForm } from "../../components/cart-form/cart-form";

export const Cart = (): React.ReactElement => {
  return (
    <div className="cart-page marketplace-content">
      <Link to="/" className="cart-form__breadcrumb">
        Return to Catalog
      </Link>
      <PageTitle title="Cart" />
      <CartForm />
    </div>
  );
};
