/// <reference lib="dom" />
import React, { useRef, useEffect, useState } from "react";
import { Card, Typography, Button, Box, TextField } from "@mui/material";
import { getIconPath, formatPrice } from "../../utils/helper-functions";
import { ProductCardProps } from "../../interfaces";

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart: _onAddToCart,
  onUpdateCartQuantity,
}) => {
  const increaseIntervalRef = useRef<number | null>(null);
  const decreaseIntervalRef = useRef<number | null>(null);

  // Local state for input quantity - defaults to current cart quantity, otherwise 1 for new items
  const [inputQuantity, setInputQuantity] = useState<number>(
    product.currentlyInCart > 0 ? product.currentlyInCart : 1
  );

  // Update input quantity when product.currentlyInCart changes from external sources
  useEffect(() => {
    setInputQuantity(product.currentlyInCart > 0 ? product.currentlyInCart : 1);
  }, [product.currentlyInCart]);

  /* v8 ignore next 11 */
  // Cleanup intervals on component unmount
  useEffect(() => {
    return () => {
      if (increaseIntervalRef.current) {
        window.clearInterval(increaseIntervalRef.current);
      }
      if (decreaseIntervalRef.current) {
        window.clearInterval(decreaseIntervalRef.current);
      }
    };
  }, []);

  const handleAddToCart = () => {
    // Set the product's cart quantity to exactly what's in the input field
    onUpdateCartQuantity?.(product, inputQuantity);
  };

  const startIncreasing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    // Update the input quantity immediately
    setInputQuantity((prev) => prev + 1);

    increaseIntervalRef.current = window.setInterval(() => {
      setInputQuantity((prev) => prev + 1);
    }, 150); // Repeat every 150ms
  };

  const startDecreasing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    // Update the input quantity immediately, minimum 0
    setInputQuantity((prev) => Math.max(0, prev - 1));

    decreaseIntervalRef.current = window.setInterval(() => {
      setInputQuantity((prev) => Math.max(0, prev - 1));
    }, 150); // Repeat every 150ms
  };

  const stopIncreasing = () => {
    if (increaseIntervalRef.current) {
      window.clearInterval(increaseIntervalRef.current);
      increaseIntervalRef.current = null;
    }
  };

  const stopDecreasing = () => {
    if (decreaseIntervalRef.current) {
      window.clearInterval(decreaseIntervalRef.current);
      decreaseIntervalRef.current = null;
    }
  };

  const handleQuantityChange = (event: { target: { value: string } }) => {
    const value = event.target.value;
    const numValue = parseInt(value, 10);

    // Only update if it's a valid number >= 0 or if the input is empty (for clearing)
    if (value === "" || (!isNaN(numValue) && numValue >= 0)) {
      const newQuantity = value === "" ? 0 : numValue;
      setInputQuantity(newQuantity);
    }
  };

  // Determine button text based on cart status and input changes
  const getButtonText = () => {
    // If item is not in cart, always show "Add to Cart"
    if (product.currentlyInCart === 0) {
      return "Add to Cart";
    }

    // If item is in cart and quantity has changed, show "Update Cart"
    if (inputQuantity !== product.currentlyInCart) {
      return "Update Cart";
    }

    // If item is in cart but quantity hasn't changed, show "Add to Cart"
    return "Add to Cart";
  };

  // Determine if button should be disabled
  const isButtonDisabled = () => {
    // Always disabled if product is unavailable
    if (isUnavailable) {
      return true;
    }

    // If item is not in cart, button should be enabled
    if (product.currentlyInCart === 0) {
      return false;
    }

    // If item is in cart but quantity hasn't changed, button should be disabled
    if (inputQuantity === product.currentlyInCart) {
      return true;
    }

    // If item is in cart and quantity has changed, button should be enabled
    return false;
  };

  const isUnavailable = product.cartStatus === "unavailable";

  return (
    <Card
      className="product-card"
      role="article"
      aria-label={`${product.name} product card`}
    >
      {/* IN CART pill - only show when items are in cart */}
      {product.currentlyInCart > 0 && (
        <Box
          className="in-cart-pill"
          role="status"
          aria-label={`${product.currentlyInCart} items in cart`}
        >
          IN CART
        </Box>
      )}

      <Box className="icon-container">
        <img
          src={getIconPath(product.type)}
          alt={`${product.type} icon`}
          style={{
            width: "61px",
            height: "61px",
            objectFit: "contain",
          }}
        />
      </Box>

      <Box className="type-price-row">
        <Typography
          className="type-chip"
          aria-label={`Product type: ${product.type}`}
        >
          {product.type}
        </Typography>
        <Typography
          className="price-text"
          aria-label={`Price: ${formatPrice(product.price, product.rom)}`}
        >
          {formatPrice(product.price, product.rom)}
        </Typography>
      </Box>

      <Typography className="product-title" id={`product-title-${product.id}`}>
        {product.name}
      </Typography>

      <Typography
        className="description-text"
        aria-describedby={`product-title-${product.id}`}
      >
        {product.description}
      </Typography>

      <Box className="bottom-section">
        {product.currentlyInCart > 0 && (
          <Typography
            className="cart-status-text"
            aria-live="polite"
            aria-atomic="true"
          >
            CURRENTLY IN CART: {product.currentlyInCart}
          </Typography>
        )}

        <Box
          className="quantity-selector"
          role="group"
          aria-label={`Quantity selector for ${product.name}`}
        >
          <Button
            className="quantity-button decrease"
            onMouseDown={startDecreasing}
            onMouseUp={stopDecreasing}
            onMouseLeave={stopDecreasing}
            onTouchStart={startDecreasing}
            onTouchEnd={stopDecreasing}
            aria-label={`Decrease quantity for ${product.name}`}
            disabled={inputQuantity <= 0}
          >
            −
          </Button>
          <TextField
            type="number"
            value={inputQuantity}
            onChange={handleQuantityChange}
            InputProps={{
              style: { textAlign: "center" },
              "aria-label": `Quantity for ${product.name}`,
            }}
            inputProps={{
              min: 0,
              "aria-describedby": `quantity-help-${product.id}`,
            }}
            className="quantity-input quantity-input-clean"
            size="small"
          />
          <Button
            className="quantity-button increase"
            onMouseDown={startIncreasing}
            onMouseUp={stopIncreasing}
            onMouseLeave={stopIncreasing}
            onTouchStart={startIncreasing}
            onTouchEnd={stopIncreasing}
            aria-label={`Increase quantity for ${product.name}`}
          >
            +
          </Button>
        </Box>

        {/* Hidden helper text for screen readers */}
        <span id={`quantity-help-${product.id}`} className="sr-only">
          Enter quantity (minimum 0, use 0 to remove from cart)
        </span>

        <Button
          variant="outlined"
          onClick={handleAddToCart}
          disabled={isButtonDisabled()}
          className="add-to-cart-button"
          aria-label={`${getButtonText()} ${product.name}`}
          aria-describedby={
            isUnavailable ? `unavailable-${product.id}` : undefined
          }
        >
          {getButtonText()}
        </Button>

        {/* Hidden helper text for unavailable items */}
        {isUnavailable && (
          <span id={`unavailable-${product.id}`} className="sr-only">
            This item is currently unavailable
          </span>
        )}
      </Box>
    </Card>
  );
};
