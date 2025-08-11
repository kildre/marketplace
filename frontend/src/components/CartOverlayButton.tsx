import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../hooks/useAuth';
import { AppRoles } from '../types/auth';

export const CartOverlayButton: React.FC = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { hasRole } = useAuth();

  if (!hasRole(AppRoles.REQUESTOR)) return null;

  return (
    <button
      type="button"
      className="cart-overlay-btn"
      aria-label={`Cart (${cartCount})`}
      onClick={() => navigate('/cart')}
    >
      <img src="/assets/icons/cart-icon.png" alt="Cart" className="cart-overlay-icon" />
      <span className="cart-overlay-count">({cartCount})</span>
    </button>
  );
};

export default CartOverlayButton;
