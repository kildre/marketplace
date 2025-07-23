import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import App from './App';
import { CartProvider } from './contexts/CartContext';
import keycloak from './keycloak';
import './styles/main.scss';

const root = ReactDOM.createRoot(document.getElementById('root')!);

// Check if we should bypass authentication in development
const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';

// Keycloak initialization options
const keycloakInitOptions = {
  onLoad: 'login-required', // Forces login on app load
  checkLoginIframe: false,  // Disable iframe-based check for better performance
  pkceMethod: 'S256'        // Use PKCE for enhanced security
};

// Loading component while Keycloak initializes
const LoadingComponent = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <div>Loading authentication...</div>
  </div>
);

// Development banner component
const DevBanner = () => (
  <div style={{
    backgroundColor: '#ff9800',
    color: 'white',
    padding: '8px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '14px'
  }}>
    🚧 DEVELOPMENT MODE - Authentication Bypassed 🚧
  </div>
);

// Choose rendering approach based on environment
if (bypassAuth) {
  // Development mode without Keycloak
  root.render(
    <React.StrictMode>
      <DevBanner />
      <BrowserRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  // Production mode with Keycloak
  root.render(
    <React.StrictMode>
      <ReactKeycloakProvider
        authClient={keycloak}
        initOptions={keycloakInitOptions}
        LoadingComponent={LoadingComponent}
      >
        <BrowserRouter>
          <CartProvider>
            <App />
          </CartProvider>
        </BrowserRouter>
      </ReactKeycloakProvider>
    </React.StrictMode>
  );
}