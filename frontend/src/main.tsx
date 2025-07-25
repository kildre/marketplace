import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { CartProvider } from "./contexts/CartContext";
import MockKeycloakProvider from "./contexts/MockKeycloakProvider";
import { queryClient } from "./lib/queryClient";
import "./styles/main.scss";

const root = ReactDOM.createRoot(document.getElementById("root")!);

// Check if we should bypass authentication in development
const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === "true";

// Keycloak initialization options
const keycloakInitOptions = {
  onLoad: "login-required", // Forces login on app load
  checkLoginIframe: false, // Disable iframe-based check for better performance
  pkceMethod: "S256", // Use PKCE for enhanced security
};

// Loading component while Keycloak initializes
const LoadingComponent = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}
  >
    <div>Loading authentication...</div>
  </div>
);

// Development banner component
const DevBanner = () => (
  <div
    style={{
      backgroundColor: "#ff9800",
      color: "white",
      padding: "8px",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: "14px",
    }}
  >
    🚧 DEVELOPMENT MODE - Authentication Bypassed 🚧
  </div>
);

// Choose rendering approach based on environment
if (bypassAuth) {
  // Development mode with mock authentication
  root.render(
    <React.StrictMode>
      <DevBanner />
      <QueryClientProvider client={queryClient}>
        <MockKeycloakProvider>
          <BrowserRouter>
            <CartProvider>
              <App />
            </CartProvider>
          </BrowserRouter>
        </MockKeycloakProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
} else {
  // Production mode with Keycloak - import only when needed
  import("./keycloak")
    .then(({ default: keycloak }) => {
      root.render(
        <React.StrictMode>
          <QueryClientProvider client={queryClient}>
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
          </QueryClientProvider>
        </React.StrictMode>
      );
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Failed to load Keycloak configuration:", error);
      // Fallback to bypass mode if Keycloak fails to load
      root.render(
        <React.StrictMode>
          <div
            style={{
              backgroundColor: "#f44336",
              color: "white",
              padding: "16px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            ⚠️ Authentication Error: {error.message}
          </div>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <CartProvider>
                <App />
              </CartProvider>
            </BrowserRouter>
          </QueryClientProvider>
        </React.StrictMode>
      );
    });
}
