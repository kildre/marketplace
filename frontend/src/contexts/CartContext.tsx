import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../types/products';

// Cart item interface - maintains 1:1 relationship
interface CartItem {
  product: Product;
  quantity: number; // Total quantity for this product
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number; // Number of unique products in cart (1:1 relationship)
  addToCart: (product: Product, quantity: number) => void;
  updateCartQuantity: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  getProductCartQuantity: (productId: number) => number;
  isProductInCart: (productId: number) => boolean;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Cart count represents unique products (1:1 relationship)
  const cartCount = cartItems.length;

  const addToCart = (product: Product, quantity: number) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: quantity
        };
        return updatedItems;
      } else {
        // Add new item to cart
        return [...prevItems, { product, quantity }];
      }
    });
  };

  const updateCartQuantity = (product: Product, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(product.id);
      return;
    }
    
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: quantity
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const getProductCartQuantity = (productId: number): number => {
    const cartItem = cartItems.find(item => item.product.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const isProductInCart = (productId: number): boolean => {
    return cartItems.some(item => item.product.id === productId);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const value: CartContextType = {
    cartItems,
    cartCount,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    getProductCartQuantity,
    isProductInCart,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};