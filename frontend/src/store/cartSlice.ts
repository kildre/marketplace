import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../interfaces';

// Cart item interface - maintains 1:1 relationship
export interface CartItem {
  product: Product;
  quantity: number; // Total quantity for this product
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const { product, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        state.items[existingItemIndex].quantity = quantity;
      } else {
        // Add new item to cart
        state.items.push({ product, quantity });
      }
    },

    updateCartQuantity: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const { product, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        state.items = state.items.filter((item) => item.product.id !== product.id);
        return;
      }

      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        state.items[existingItemIndex].quantity = quantity;
      } else {
        // Add new item
        state.items.push({ product, quantity });
      }
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.product.id !== productId);
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, updateCartQuantity, removeFromCart, clearCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartCount = (state: { cart: CartState }) => state.cart.items.length;
export const selectPendingPriceCount = (state: { cart: CartState }) => 
  state.cart.items.filter((item) => item.product.price === null).length;

export const selectProductCartQuantity = (state: { cart: CartState }, productId: number): number => {
  const cartItem = state.cart.items.find((item) => item.product.id === productId);
  return cartItem ? cartItem.quantity : 0;
};

export const selectIsProductInCart = (state: { cart: CartState }, productId: number): boolean => {
  return state.cart.items.some((item) => item.product.id === productId);
};

export default cartSlice.reducer;