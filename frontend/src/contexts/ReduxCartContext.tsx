import React, { createContext, ReactNode, useContext } from "react";
import { Product } from "../interfaces";
import {
    addToCart as addToCartAction,
    CartItem,
    clearCart as clearCartAction,
    removeFromCart as removeFromCartAction,
    selectCartCount,
    selectCartItems,
    selectPendingPriceCount,
    updateCartQuantity as updateCartQuantityAction
} from "../store/cartSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number; // Number of unique products in cart (1:1 relationship)
  pendingPriceCount: number; // Number of cart items with null price
  addToCart: (product: Product, quantity: number) => void;
  updateCartQuantity: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  getProductCartQuantity: (productId: number) => number;
  isProductInCart: (productId: number) => boolean;
  clearCart: () => void;
}

const ReduxCartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(ReduxCartContext);
  if (!context) {
    throw new Error("useCart must be used within a ReduxCartProvider");
  }
  return context;
};

interface ReduxCartProviderProps {
  children: ReactNode;
}

export const ReduxCartProvider: React.FC<ReduxCartProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  
  // Get data from Redux store
  const cartItems = useAppSelector(selectCartItems);
  const cartCount = useAppSelector(selectCartCount);
  const pendingPriceCount = useAppSelector(selectPendingPriceCount);

  // Action creators that dispatch to Redux store
  const addToCart = (product: Product, quantity: number) => {
    dispatch(addToCartAction({ product, quantity }));
  };

  const updateCartQuantity = (product: Product, quantity: number) => {
    dispatch(updateCartQuantityAction({ product, quantity }));
  };

  const removeFromCart = (productId: number) => {
    dispatch(removeFromCartAction(productId));
  };

  const getProductCartQuantity = (productId: number): number => {
    const cartItem = cartItems.find((item) => item.product.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const isProductInCart = (productId: number): boolean => {
    return cartItems.some((item) => item.product.id === productId);
  };

  const clearCart = () => {
    dispatch(clearCartAction());
  };

  const value: CartContextType = {
    cartItems,
    cartCount,
    pendingPriceCount,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    getProductCartQuantity,
    isProductInCart,
    clearCart,
  };

  return <ReduxCartContext.Provider value={value}>{children}</ReduxCartContext.Provider>;
};