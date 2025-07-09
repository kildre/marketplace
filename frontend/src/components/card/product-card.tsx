/// <reference lib="dom" />
import React, { useRef, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Box,
  TextField,
} from '@mui/material';
import { Product } from '../../types/products';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onUpdateCartQuantity?: (product: Product, newQuantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product,
  onAddToCart,
  onUpdateCartQuantity,
}) => {
  const increaseIntervalRef = useRef<number | null>(null);
  const decreaseIntervalRef = useRef<number | null>(null);
  const currentQuantityRef = useRef<number>(product.currentlyInCart || 0);

  // Keep the ref synchronized with the product prop
  useEffect(() => {
    currentQuantityRef.current = product.currentlyInCart || 0;
  }, [product.currentlyInCart]);

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
    onAddToCart?.(product);
  };

  const startIncreasing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    // Update the ref immediately
    currentQuantityRef.current += 1;
    onUpdateCartQuantity?.(product, currentQuantityRef.current);
    
    increaseIntervalRef.current = window.setInterval(() => {
      // Use the ref value and update it immediately
      currentQuantityRef.current += 1;
      onUpdateCartQuantity?.(product, currentQuantityRef.current);
    }, 150); // Repeat every 150ms
  };

  const startDecreasing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    // Update the ref immediately
    currentQuantityRef.current = Math.max(0, currentQuantityRef.current - 1);
    onUpdateCartQuantity?.(product, currentQuantityRef.current);
    
    decreaseIntervalRef.current = window.setInterval(() => {
      // Use the ref value and update it immediately
      currentQuantityRef.current = Math.max(0, currentQuantityRef.current - 1);
      onUpdateCartQuantity?.(product, currentQuantityRef.current);
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
    if (value === '' || (!isNaN(numValue) && numValue >= 0)) {
      const newQuantity = value === '' ? 0 : numValue;
      onUpdateCartQuantity?.(product, newQuantity);
    }
  };

  const formatPrice = (price: number, rom?: string) => {
    if (price === 0) return 'Free';
    if (rom) return rom;
    return `$${price.toLocaleString()}`;
  };

  const getIconPath = (type: string) => {
    switch (type) {
      case 'Usage Based Tool':
        return '/assets/icons/icon_user-tool.png';
      case 'Bundle':
        return '/assets/icons/icon_bundle.png';
      case 'Seat Based Tool':
        return '/assets/icons/icon_seat-based-tool.png';
      default:
        return '/assets/icons/icon_user-tool.png';
    }
  };

  const isUnavailable = product.cartStatus === 'unavailable';

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
            width: '61px',
            height: '61px',
            objectFit: 'contain'
          }}
        />
      </Box>
      
      <Box className="type-price-row">
        <Typography className="type-chip" aria-label={`Product type: ${product.type}`}>
          {product.type}
        </Typography>
        <Typography className="price-text" aria-label={`Price: ${formatPrice(product.price, product.rom)}`}>
          {formatPrice(product.price, product.rom)}
        </Typography>
      </Box>
      
      <Typography className="product-title" id={`product-title-${product.id}`}>
        {product.name}
      </Typography>

      <Typography className="description-text" aria-describedby={`product-title-${product.id}`}>
        {product.description}
      </Typography>

      <Box className="bottom-section">
        {product.currentlyInCart > 0 && (
          <Typography className="cart-status-text" aria-live="polite" aria-atomic="true">
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
            disabled={product.currentlyInCart === 0}
          >
            −
          </Button>
            <TextField
            type="number"
            value={product.currentlyInCart || 0}
            onChange={handleQuantityChange}
            slotProps={{
              input: {
                style: { textAlign: 'center' },
                'aria-label': `Quantity for ${product.name}`,
              }
            }}
            inputProps={{
              min: 0,
              'aria-describedby': `quantity-help-${product.id}`
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
          Enter quantity (minimum 0)
        </span>

        <Button
          variant="outlined"
          onClick={handleAddToCart}
          disabled={isUnavailable}
          className="add-to-cart-button"
          aria-label={`Add ${product.name} to cart`}
          aria-describedby={isUnavailable ? `unavailable-${product.id}` : undefined}
        >
          Add to Cart
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
