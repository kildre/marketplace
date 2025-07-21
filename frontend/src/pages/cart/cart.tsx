import { Link } from "react-router-dom";
import { PageTitle } from "@/components/page-title/page-title";
import { useCart } from "../../contexts/CartContext";
import { CartForm } from "@/components/cart-form/cart-form";
import { FormPersonalInformation } from "@/components/form-personal-information/form-personal-information";
import { FormSelectedApplications } from "@/components/form-selected-applications/form-selected-applications";
import { FormCostDetails } from "@/components/form-cost-details/form-cost-details";

export const Cart = (): React.ReactElement => {
  const { cartCount } = useCart();

  if (cartCount === 0) {
    return (
      <div className="cart-page marketplace-content">
        <Link to="/" className="cart-form__breadcrumb">
          Return to Catalog
        </Link>
        <PageTitle title="Cart" />
        <div className="cart-page__content-wrapper">
          <div className="cart-page__content-left">
            <h2>Your cart is empty</h2>
            <p>
              Please return to the <Link to="/">Product Catalog</Link> to select
              items to be requested.
            </p>
          </div>
          <div className="cart-page__content-right">
            <div className="form-personal-information">
              <FormPersonalInformation />
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="cart-page marketplace-content">
        <Link to="/" className="cart-form__breadcrumb">
          Return to Catalog
        </Link>
        <PageTitle title="Cart" />
        <div className="cart-page__content-wrapper">
          <div className="cart-page__content-left">
            <CartForm />
            <FormSelectedApplications />
          </div>
          <div className="cart-page__content-right">
            <div className="form-personal-information">
              <FormPersonalInformation />
              <FormCostDetails />
            </div>
          </div>
        </div>
      </div>
    );
  }
};
