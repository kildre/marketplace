import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import { Product } from '../interfaces';

describe('CartContext', () => {
  const mockProduct1: Product = {
    id: 1,
    type: 'License Based',
    name: 'Test Product 1',
    description: 'Description 1',
    price: 100,
    unit: 1,
    inCart: false,
    currentlyInCart: 0,
  };

  const mockProduct2: Product = {
    id: 2,
    type: 'Consumption Based',
    name: 'Test Product 2',
    description: 'Description 2',
    price: 200,
    unit: 1,
    inCart: false,
    currentlyInCart: 0,
  };

  const mockProductWithNullPrice: Product = {
    id: 3,
    type: 'Consumption Based Tool',
    name: 'Pending Price Product',
    description: 'Product without price',
    price: null,
    unit: 1,
    inCart: false,
    currentlyInCart: 0,
    rom: 'Custom ROM',
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  );

  describe('useCart hook', () => {
    it('should throw error when used outside CartProvider', () => {
      // Suppress console.error for this test
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useCart());
      }).toThrow('useCart must be used within a CartProvider');
      
      spy.mockRestore();
    });
  });

  describe('initial state', () => {
    it('should start with empty cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.cartItems).toEqual([]);
      expect(result.current.cartCount).toBe(0);
      expect(result.current.pendingPriceCount).toBe(0);
    });
  });

  describe('addToCart', () => {
    it('should add product to cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].product).toEqual(mockProduct1);
      expect(result.current.cartItems[0].quantity).toBe(2);
      expect(result.current.cartCount).toBe(1);
    });

    it('should update quantity if product already in cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
        result.current.addToCart(mockProduct1, 5);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].quantity).toBe(5);
      expect(result.current.cartCount).toBe(1);
    });

    it('should handle multiple different products', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
        result.current.addToCart(mockProduct2, 2);
      });

      expect(result.current.cartItems).toHaveLength(2);
      expect(result.current.cartCount).toBe(2);
      expect(result.current.cartItems[0].product.id).toBe(1);
      expect(result.current.cartItems[1].product.id).toBe(2);
    });

    it('should add product with quantity 0', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 0);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].quantity).toBe(0);
    });

    it('should add product with null price', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProductWithNullPrice, 1);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.pendingPriceCount).toBe(1);
    });
  });

  describe('removeFromCart', () => {
    it('should remove product from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
        result.current.removeFromCart(mockProduct1.id);
      });

      expect(result.current.cartItems).toHaveLength(0);
      expect(result.current.cartCount).toBe(0);
    });

    it('should remove correct product when multiple products exist', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
        result.current.addToCart(mockProduct2, 2);
        result.current.removeFromCart(mockProduct1.id);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].product.id).toBe(2);
    });

    it('should handle removing non-existent product', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
        result.current.removeFromCart(999);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].product.id).toBe(1);
    });
  });

  describe('updateCartQuantity', () => {
    it('should update product quantity', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
        result.current.updateCartQuantity(mockProduct1, 5);
      });

      expect(result.current.cartItems[0].quantity).toBe(5);
    });

    it('should remove product if quantity is 0', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
        result.current.updateCartQuantity(mockProduct1, 0);
      });

      expect(result.current.cartItems).toHaveLength(0);
    });

    it('should remove product if quantity is negative', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
        result.current.updateCartQuantity(mockProduct1, -1);
      });

      expect(result.current.cartItems).toHaveLength(0);
    });

    it('should add product if not in cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.updateCartQuantity(mockProduct1, 3);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].quantity).toBe(3);
    });

    it('should update quantity for correct product when multiple exist', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
        result.current.addToCart(mockProduct2, 2);
        result.current.updateCartQuantity(mockProduct1, 10);
      });

      expect(result.current.cartItems[0].quantity).toBe(10);
      expect(result.current.cartItems[1].quantity).toBe(2);
    });
  });

  describe('isProductInCart', () => {
    it('should return true if product is in cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
      });

      expect(result.current.isProductInCart(mockProduct1.id)).toBe(true);
    });

    it('should return false if product is not in cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.isProductInCart(mockProduct1.id)).toBe(false);
    });

    it('should return false after product is removed', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
        result.current.removeFromCart(mockProduct1.id);
      });

      expect(result.current.isProductInCart(mockProduct1.id)).toBe(false);
    });
  });

  describe('getProductCartQuantity', () => {
    it('should return correct quantity', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 3);
      });

      expect(result.current.getProductCartQuantity(mockProduct1.id)).toBe(3);
    });

    it('should return 0 if product not in cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.getProductCartQuantity(mockProduct1.id)).toBe(0);
    });

    it('should return updated quantity after update', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
        result.current.updateCartQuantity(mockProduct1, 7);
      });

      expect(result.current.getProductCartQuantity(mockProduct1.id)).toBe(7);
    });

    it('should return correct quantity for specific product when multiple exist', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 5);
        result.current.addToCart(mockProduct2, 3);
      });

      expect(result.current.getProductCartQuantity(mockProduct1.id)).toBe(5);
      expect(result.current.getProductCartQuantity(mockProduct2.id)).toBe(3);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
        result.current.addToCart(mockProduct2, 2);
        result.current.clearCart();
      });

      expect(result.current.cartItems).toHaveLength(0);
      expect(result.current.cartCount).toBe(0);
    });

    it('should clear empty cart without error', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.cartItems).toHaveLength(0);
    });

    it('should reset pendingPriceCount', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProductWithNullPrice, 1);
        result.current.clearCart();
      });

      expect(result.current.pendingPriceCount).toBe(0);
    });
  });

  describe('pendingPriceCount', () => {
    it('should count items with null price', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProductWithNullPrice, 1);
        result.current.addToCart(mockProduct2, 1);
      });

      expect(result.current.pendingPriceCount).toBe(1);
    });

    it('should count multiple items with null price', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const anotherNullPriceProduct: Product = {
        ...mockProductWithNullPrice,
        id: 4,
        name: 'Another Pending',
      };

      act(() => {
        result.current.addToCart(mockProductWithNullPrice, 1);
        result.current.addToCart(anotherNullPriceProduct, 1);
        result.current.addToCart(mockProduct1, 1);
      });

      expect(result.current.pendingPriceCount).toBe(2);
    });

    it('should be 0 when no items have null price', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
        result.current.addToCart(mockProduct2, 1);
      });

      expect(result.current.pendingPriceCount).toBe(0);
    });

    it('should update when item with null price is removed', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProductWithNullPrice, 1);
        result.current.addToCart(mockProduct1, 1);
      });

      expect(result.current.pendingPriceCount).toBe(1);

      act(() => {
        result.current.removeFromCart(mockProductWithNullPrice.id);
      });

      expect(result.current.pendingPriceCount).toBe(0);
    });
  });

  describe('cartCount', () => {
    it('should reflect number of unique products', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 5);
        result.current.addToCart(mockProduct2, 3);
        result.current.addToCart(mockProductWithNullPrice, 1);
      });

      // Should be 3 unique products, not sum of quantities (9)
      expect(result.current.cartCount).toBe(3);
    });

    it('should not change when quantity is updated', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
      });

      expect(result.current.cartCount).toBe(1);

      act(() => {
        result.current.updateCartQuantity(mockProduct1, 100);
      });

      // Still 1 unique product
      expect(result.current.cartCount).toBe(1);
    });

    it('should decrease when product is removed', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
        result.current.addToCart(mockProduct2, 1);
      });

      expect(result.current.cartCount).toBe(2);

      act(() => {
        result.current.removeFromCart(mockProduct1.id);
      });

      expect(result.current.cartCount).toBe(1);
    });
  });
});
