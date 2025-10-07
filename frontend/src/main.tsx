import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { CartProvider } from "./contexts/CartContext";
import {
  EnhancedMockKeycloakProvider,
  MockUserSwitcher,
} from "./contexts/EnhancedMockKeycloakProvider";
import { queryClient } from "./lib/queryClient";
import { AuthService } from "./services/authService";
import "./styles/main.scss";

const root = ReactDOM.createRoot(document.getElementById("root")!);

// Check if we should bypass authentication in development
const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === "true";

// Keycloak initialization options
const keycloakInitOptions = {
  onLoad: "login-required" as const, // Forces login on app load
  checkLoginIframe: false, // Disable iframe-based check for better performance
  pkceMethod: "S256" as const, // Use PKCE for enhanced security
  flow: "standard" as const, // Use standard authorization code flow (NOT implicit)
  // This ensures tokens are stored in memory (keycloak.token) not just in cookies
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
// const DevBanner = () => (
//   <div
//     style={{
//       backgroundColor: "#ff9800",
//       color: "white",
//       padding: "8px",
//       textAlign: "center",
//       fontWeight: "bold",
//       fontSize: "14px",
//     }}
//   >
//     🚧 DEVELOPMENT MODE - Authentication Bypassed 🚧
//   </div>
// );

// Choose rendering approach based on environment
if (bypassAuth) {
  // Development mode with enhanced mock authentication
  root.render(
    <React.StrictMode>
      {/* <DevBanner /> */}
      <QueryClientProvider client={queryClient}>
        <EnhancedMockKeycloakProvider>
          <BrowserRouter>
            <CartProvider>
              <App />
              <MockUserSwitcher />
            </CartProvider>
          </BrowserRouter>
        </EnhancedMockKeycloakProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
} else {
  // Production mode with Keycloak - import only when needed
  import("./keycloak")
    .then(({ default: keycloak }) => {
      // Token capture callback - Keycloak manages tokens in memory/cookies
      // We only need to store user info for quick access
      const handleTokens = (tokens: { token?: string; refreshToken?: string; idToken?: string }) => {
        if (tokens.token && keycloak.tokenParsed) {
          // Extract and store user info from the token (for role checks)
          const userInfo = AuthService.createUserInfoFromToken(keycloak.tokenParsed);
          AuthService.storeUserInfo(userInfo);
          
          // NOTE: We do NOT store the token in localStorage
          // Keycloak manages tokens in memory and cookies automatically
          // Always use keycloak.token to get the current (potentially refreshed) token
        } else {
          // eslint-disable-next-line no-console
          console.warn("[main] onTokens called but no token or tokenParsed available");
        }
      };

      root.render(
        <React.StrictMode>
          <QueryClientProvider client={queryClient}>
            <ReactKeycloakProvider
              authClient={keycloak}
              initOptions={keycloakInitOptions}
              LoadingComponent={LoadingComponent}
              onTokens={handleTokens}
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
