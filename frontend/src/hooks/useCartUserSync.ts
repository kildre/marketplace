import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import { useAuth } from './useAuth';

/**
 * Storage key for tracking the current cart owner
 */
const CART_USER_KEY = 'marketplace_cart_user';

/**
 * Hook to synchronize cart with current user
 * Automatically clears cart when user changes
 */
export const useCartUserSync = () => {
  const dispatch = useDispatch();
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  const previousUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userInfo?.email) {
      return;
    }

    const currentUserId = userInfo.email;

    // Get the stored cart owner
    const storedCartUser = typeof window !== 'undefined' 
      ? window.localStorage.getItem(CART_USER_KEY)
      : null;

    // If this is the first time checking, store the current user
    if (previousUserRef.current === null) {
      previousUserRef.current = currentUserId;
      
      // If there's a cart from a different user, clear it
      if (storedCartUser && storedCartUser !== currentUserId) {
        // eslint-disable-next-line no-console
        console.log(`Cart user changed from ${storedCartUser} to ${currentUserId}. Clearing cart.`);
        dispatch(clearCart());
      }
      
      // Update the stored cart user
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(CART_USER_KEY, currentUserId);
      }
      return;
    }

    // If user has changed since last check, clear the cart
    if (previousUserRef.current !== currentUserId) {
      // eslint-disable-next-line no-console
      console.log(`User changed from ${previousUserRef.current} to ${currentUserId}. Clearing cart.`);
      dispatch(clearCart());
      previousUserRef.current = currentUserId;
      
      // Update the stored cart user
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(CART_USER_KEY, currentUserId);
      }
    }
  }, [userInfo?.email, dispatch, getUserInfo]);
};
