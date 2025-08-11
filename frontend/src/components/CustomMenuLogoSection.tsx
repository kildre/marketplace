import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../hooks/useAuth';
import { AppRoles } from '../types/auth';

// Import images statically - these will work with Vite
import AdvanaDarkTheme from '/assets/images/AdvanaDarkTheme.png';
import DODLogo from '/assets/images/DOD_color.png';
import CDAOLogo from '/assets/images/cdao_Logo.png';
import JupiterDONLogo from '/assets/images/Jupiter_DON_logo.png';
import JupiterUSMCLogo from '/assets/images/Jupiter_USMC_logo.png';
import JupiterUSNLogo from '/assets/images/Jupiter_USN_logo.png';
import JupiterLogo from '/assets/images/Jupiter_logo.png';

const styles = {
  logo: {
    width: '40px',
    height: '40px',
    position: 'relative' as const,
    left: '1%',
    marginRight: '12px'
  },
  advanaLogo: {
    maxWidth: '180px',
    height: '42px',
    cursor: 'pointer'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    flex: 1
  },
  cartContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'absolute' as const,
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)'
  },
  cartLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
    backgroundColor: 'transparent'
  },
  cartIcon: {
    width: '24px',
    height: '24px',
    marginRight: '8px',
    filter: 'brightness(0) invert(1)' // Make icon white
  },
  cartCount: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'white'
  },
  mainContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    position: 'relative' as const,
    height: '100%'
  }
};

interface CustomMenuLogoSectionProps {
  enclave?: string;
  alternateLogo?: string;
  megaMenuBaseDomain?: string;
  isCRA?: boolean;
}

const CustomMenuLogoSection: React.FC<CustomMenuLogoSectionProps> = ({ 
  enclave = 'advana', 
  alternateLogo, 
  megaMenuBaseDomain,
  isCRA = true 
}) => {
  const { cartCount } = useCart();
  const { hasRole } = useAuth();
  
  // Only show cart for REQUESTOR role
  const showCart = hasRole(AppRoles.REQUESTOR);

  // Function to handle page changes (copied from original AdvanaMenu logic)
  const changePage = (path: string, domain?: string, newTab = false, isCRAMode = true) => {
    if (newTab) {
      window.open(isCRAMode ? path : `${domain}${path}`, '_blank');
    } else {
      if (isCRAMode) {
        window.location.hash = path;
      } else {
        window.location.href = `${domain}${path}`;
      }
    }
  };

  if (enclave === 'jupiter') {
    return (
      <div style={styles.mainContainer}>
        <div style={styles.logoContainer}>
          <img
            alt="_navydeptlogo"
            onClick={() => changePage('#/', megaMenuBaseDomain, false, isCRA)}
            src={JupiterDONLogo}
            style={styles.logo}
          />
          <img
            alt="_marineslogo"
            onClick={() => changePage('#/', megaMenuBaseDomain, false, isCRA)}
            src={JupiterUSMCLogo}
            style={styles.logo}
          />
          <img
            alt="_navylogo"
            onClick={() => changePage('#/', megaMenuBaseDomain, false, isCRA)}
            src={JupiterUSNLogo}
            style={styles.logo}
          />
          <img
            alt="jupiter_logo"
            onClick={() => changePage('#/', megaMenuBaseDomain, false, isCRA)}
            src={JupiterLogo}
            style={styles.advanaLogo}
          />
        </div>
        {showCart && (
          <div style={styles.cartContainer}>
            <Link 
              to="/cart" 
              style={styles.cartLink}
              aria-label={`Go to cart page. ${cartCount} items in cart`}
            >
              <img
                src="/assets/icons/cart-icon.png"
                alt="Cart Icon"
                style={styles.cartIcon}
              />
              <span style={styles.cartCount}>({cartCount})</span>
            </Link>
          </div>
        )}
      </div>
    );
  } else {
    // Default (Advana) enclave
    return (
      <div style={styles.mainContainer}>
        <div style={styles.logoContainer}>
          <img
            alt="dod_logo"
            src={DODLogo}
            style={styles.logo}
          />
          <img
            alt="cdao_logo"
            src={CDAOLogo}
            style={styles.logo}
          />
          {alternateLogo ? (
            <img
              alt="alternate_logo"
              src={alternateLogo}
              style={styles.logo}
            />
          ) : (
            <img
              alt="advana_logo"
              onClick={() => changePage('#/', megaMenuBaseDomain, false, isCRA)}
              src={AdvanaDarkTheme}
              style={styles.advanaLogo}
            />
          )}
        </div>
        {showCart && (
          <div style={styles.cartContainer}>
            <Link 
              to="/cart" 
              style={styles.cartLink}
              aria-label={`Go to cart page. ${cartCount} items in cart`}
            >
              <img
                src="/assets/icons/cart-icon.png"
                alt="Cart Icon"
                style={styles.cartIcon}
              />
              <span style={styles.cartCount}>({cartCount})</span>
            </Link>
          </div>
        )}
      </div>
    );
  }
};

export default CustomMenuLogoSection;
