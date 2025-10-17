import React from "react";
import { useCart } from "../../contexts/CartContext";
import { formatPrice } from "../../utils/helper-functions";
import { FormCostDetailsProps } from "../../interfaces";

export const FormCostDetails = ({
  source = "cart",
  summary,
}: FormCostDetailsProps): React.ReactElement => {
  const { cartItems, cartCount, pendingPriceCount } = useCart();

  // Use props data for 'request' source, cart data for 'cart' source
  if (source === "request" && summary) {
    return (
      <>
        <div className="form-personal-information__section">
          <h5>Cost Details</h5>
          <p>
            PRODUCTS REQUESTED<span>{summary.totalItems}</span>
          </p>
          <p>
            APPLICATIONS PENDING PRICE{" "}
            <span className="cost-warning">{summary.pendingPriceItems}</span>
          </p>
        </div>
        <h6>
          Estimated ROM{" "}
          <span id="estimatedRom">{summary.estimatedROM}</span>
        </h6>
      </>
    );
  }

  // Calculate total price from all cart items that have a price
  const calculateTotalPrice = () => {
    return cartItems.reduce((total, { product, quantity }) => {
      // Only include items with non-null prices in the total
      if (product.price !== null) {
        return total + quantity * product.price;
      }

      return total;
    }, 0);
  };

  const totalPrice = calculateTotalPrice();

  // Logic to check estimated ROM based on all cart item options
  const getEstimatedRom = () => {
    if (cartItems.length === 0) {
      // If cart is empty, return "Empty"
      return "Empty";
    } else if (
      // If price is 0, and there aren't any pending prices, return "Free"
      totalPrice === 0 &&
      pendingPriceCount === 0
    ) {
      return "Free";
    } else if (pendingPriceCount > 0 && totalPrice === 0) {
      // If price is 0 but there are pending prices, return "Pending"
      return "Pending";
    } else if (cartItems.length > 0 && totalPrice !== 0) {
      // If there are items with prices, format the total price
      return formatPrice(totalPrice);
    }
  };

  const estimatedRom = getEstimatedRom();

  return (
    <>
      <div className="form-personal-information__section">
        <h5>Cost Details</h5>
        <p>
          PRODUCTS REQUESTED<span>{cartCount}</span>
        </p>
        <p>
          APPLICATIONS PENDING PRICE{" "}
          <span className="cost-warning">{pendingPriceCount}</span>
        </p>
      </div>
      <h6>
        Estimated ROM{" "}
        <span id="estimatedRom">{estimatedRom}</span>
      </h6>
    </>
  );
};
