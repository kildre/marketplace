import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useCart } from "../../contexts/CartContext";
import { getIconPath, formatPrice } from "../../utils/helper-functions";

export const FormSelectedApplications = (): React.ReactElement => {
  const { cartItems, cartCount, removeFromCart, clearCart } = useCart();

  return (
    <div className="form-selected-applications__container">
      <Accordion defaultExpanded slotProps={{ heading: { component: "h2" } }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="selected-applications-content"
          id="selected-applications-header"
        >
          Selected Applications ({cartCount}{" "}
          {cartCount === 1 ? "product" : "products"})
        </AccordionSummary>
        <AccordionDetails className="form-selected-applications__accordion-details">
          {cartItems.map(({ product, quantity }) => (
            <div key={product.id} className="cart-item-card">
              <img
                className="cart-item-card__icon"
                src={getIconPath(product.type)}
                alt={`${product.type} icon`}
              />
              <div className="cart-item-card__details">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p className="cart-item-card__qty">
                  Qty Requested: <span>{quantity}</span>
                </p>
                <button
                  className="button--remove-item"
                  onClick={() => removeFromCart(product.id)}
                >
                  Remove
                </button>
              </div>
              <div className="cart-item-card__price">
                <p>
                  Cost: <span>{formatPrice(product.price, product.rom)}</span>
                </p>
              </div>
            </div>
          ))}

          <button className="button button--clear-cart" onClick={clearCart}>
            Clear Cart
          </button>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};
