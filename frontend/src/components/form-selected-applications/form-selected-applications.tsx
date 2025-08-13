import * as React from "react";
import { useState, useRef, useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button, Box, TextField } from "@mui/material";
import { useCart } from "../../contexts/CartContext";
import { getIconPath, formatPrice } from "../../utils/helper-functions";
import { FormSelectedApplicationsProps } from "../../interfaces";

export const FormSelectedApplications = ({
  mode = "edit",
  viewData,
}: FormSelectedApplicationsProps = {}): React.ReactElement => {
  const {
    cartItems,
    cartCount,
    removeFromCart,
    clearCart,
    updateCartQuantity,
  } = useCart();

  const isViewMode = mode === "view";

  // Use viewData for view mode, cart data for edit mode
  const displayCount = isViewMode && viewData ? viewData.totalItems : cartCount;

  // State to track quantity inputs for each product
  const [inputQuantities, setInputQuantities] = useState<
    Record<number, number>
  >({});

  // Refs for interval management
  const increaseIntervalRefs = useRef<Record<number, number | null>>({});
  const decreaseIntervalRefs = useRef<Record<number, number | null>>({});

  // Initialize input quantities when cart items change
  useEffect(() => {
    const newQuantities: Record<number, number> = {};
    cartItems.forEach(({ product, quantity }) => {
      newQuantities[product.id] = quantity;
    });
    setInputQuantities(newQuantities);
  }, [cartItems]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(increaseIntervalRefs.current).forEach((interval) => {
        if (interval) window.clearInterval(interval);
      });
      Object.values(decreaseIntervalRefs.current).forEach((interval) => {
        if (interval) window.clearInterval(interval);
      });
    };
  }, []);

  const handleQuantityChange = (productId: number, value: string) => {
    const numValue = parseInt(value, 10);

    // Only update if it's a valid number >= 0 or if the input is empty
    if (value === "" || (!isNaN(numValue) && numValue >= 0)) {
      const newQuantity = value === "" ? 0 : numValue;
      setInputQuantities((prev) => ({
        ...prev,
        [productId]: newQuantity,
      }));
    }
  };

  const handleUpdateQuantity = (productId: number) => {
    const product = cartItems.find(
      (item) => item.product.id === productId
    )?.product;
    if (product) {
      const newQuantity = inputQuantities[productId] || 0;
      if (newQuantity === 0) {
        removeFromCart(productId);
      } else {
        updateCartQuantity(product, newQuantity);
      }
    }
  };

  const startIncreasing = (productId: number) => {
    setInputQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));

    increaseIntervalRefs.current[productId] = window.setInterval(() => {
      setInputQuantities((prev) => ({
        ...prev,
        [productId]: (prev[productId] || 0) + 1,
      }));
    }, 150);
  };

  const startDecreasing = (productId: number) => {
    setInputQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) - 1),
    }));

    decreaseIntervalRefs.current[productId] = window.setInterval(() => {
      setInputQuantities((prev) => ({
        ...prev,
        [productId]: Math.max(0, (prev[productId] || 0) - 1),
      }));
    }, 150);
  };

  const stopIncreasing = (productId: number) => {
    if (increaseIntervalRefs.current[productId]) {
      window.clearInterval(increaseIntervalRefs.current[productId]!);
      increaseIntervalRefs.current[productId] = null;
    }
  };

  const stopDecreasing = (productId: number) => {
    if (decreaseIntervalRefs.current[productId]) {
      window.clearInterval(decreaseIntervalRefs.current[productId]!);
      decreaseIntervalRefs.current[productId] = null;
    }
  };

  const getButtonText = (productId: number, currentQuantity: number) => {
    const inputQuantity = inputQuantities[productId] || 0;

    if (inputQuantity === 0) {
      return "Remove";
    }

    if (inputQuantity !== currentQuantity) {
      return "Update";
    }

    return "Current";
  };

  const isButtonDisabled = (productId: number, currentQuantity: number) => {
    const inputQuantity = inputQuantities[productId] || 0;
    return inputQuantity === currentQuantity;
  };

  return (
    <div className="form-selected-applications__container">
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="selected-applications-content"
          id="selected-applications-header"
          component="h2"
        >
          Selected Applications ({displayCount}{" "}
          {displayCount === 1 ? "product" : "products"})
        </AccordionSummary>
        <AccordionDetails className="form-selected-applications__accordion-details">
          {isViewMode
            ? // View mode - simple display
              viewData?.cartItems.map((item) => (
                <div key={item.productId} className="cart-item-card">
                  <img
                    className="cart-item-card__icon"
                    src={getIconPath(item.productType)}
                    alt={`${item.productType} icon`}
                  />
                  <div className="cart-item-card__details">
                    <h4>{item.productName}</h4>
                    <p>
                      Description: <span>{item.description}</span>
                    </p>
                    <p>
                      Qty requested: <span>{item.quantity}</span>
                    </p>
                  </div>
                  <div className="cart-item-card__price">
                    <p>
                      Cost:{" "}
                      <span>
                        {item.price === null
                          ? formatPrice(null, item.rom)
                          : formatPrice(
                              (item.price ?? 0) * item.quantity,
                              item.rom
                            )}
                      </span>
                    </p>
                  </div>
                </div>
              ))
            : // Edit mode - existing interactive functionality
              cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="cart-item-card">
                  <img
                    className="cart-item-card__icon"
                    src={getIconPath(product.type)}
                    alt={`${product.type} icon`}
                  />
                  <div className="cart-item-card__details">
                    <h4>{product.name}</h4>
                    <p>
                      Description: <span>{product.description}</span>
                    </p>
                    <p>
                      Qty requested: <span>{quantity}</span>
                    </p>
                    <Box className="quantity-selector-container">
                      <Box
                        className="quantity-selector"
                        role="group"
                        aria-label={`Quantity selector for ${product.name}`}
                      >
                        <Button
                          className="quantity-button decrease"
                          onMouseDown={() => startDecreasing(product.id)}
                          onMouseUp={() => stopDecreasing(product.id)}
                          onMouseLeave={() => stopDecreasing(product.id)}
                          onTouchStart={() => startDecreasing(product.id)}
                          onTouchEnd={() => stopDecreasing(product.id)}
                          aria-label={`Decrease quantity for ${product.name}`}
                          disabled={(inputQuantities[product.id] || 0) <= 0}
                          size="small"
                        >
                          −
                        </Button>

                        <TextField
                          id={`quantity-${product.id}`}
                          type="number"
                          value={inputQuantities[product.id] || 0}
                          onChange={(e) =>
                            handleQuantityChange(product.id, e.target.value)
                          }
                          InputProps={{
                            style: { textAlign: "center" },
                            "aria-label": `Quantity for ${product.name}`,
                          }}
                          className="quantity-input quantity-input-clean"
                          size="small"
                        />

                        <Button
                          className="quantity-button increase"
                          onMouseDown={() => startIncreasing(product.id)}
                          onMouseUp={() => stopIncreasing(product.id)}
                          onMouseLeave={() => stopIncreasing(product.id)}
                          onTouchStart={() => startIncreasing(product.id)}
                          onTouchEnd={() => stopIncreasing(product.id)}
                          aria-label={`Increase quantity for ${product.name}`}
                          size="small"
                        >
                          +
                        </Button>
                      </Box>

                      {/* Hidden helper text for screen readers */}
                      <span
                        id={`quantity-help-${product.id}`}
                        className="sr-only"
                      >
                        Enter quantity (minimum 0, use 0 to remove from cart)
                      </span>

                      <div className="cart-item-card__actions">
                        {inputQuantities[product.id] === 0 ? null : (
                          <Button
                            variant="text"
                            onClick={() => handleUpdateQuantity(product.id)}
                            disabled={isButtonDisabled(product.id, quantity)}
                            className="update-quantity-button"
                            aria-label={`${getButtonText(
                              product.id,
                              quantity
                            )} ${product.name}`}
                            size="medium"
                          >
                            {getButtonText(product.id, quantity)}
                          </Button>
                        )}

                        <Button
                          variant="text"
                          color="error"
                          className="button--remove-item"
                          onClick={() => removeFromCart(product.id)}
                          aria-label={`Remove ${product.name} from cart`}
                          size="medium"
                        >
                          Remove
                        </Button>
                      </div>
                    </Box>
                  </div>
                  <div className="cart-item-card__price">
                    <p>
                      Cost:{" "}
                      <span>
                        {product.price === null
                          ? formatPrice(null, product.rom)
                          : formatPrice(quantity * product.price, product.rom)}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
          {/* Only show clear cart button in edit mode */}
          {!isViewMode && (
            <button
              className="button button--clear-cart"
              onClick={clearCart}
              aria-label="Clear all items from cart"
            >
              Clear Cart
            </button>
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
};
