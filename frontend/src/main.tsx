import { ReactKeycloakProvider } from "@react-keycloak/web";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import {
  EnhancedMockKeycloakProvider,
  MockUserSwitcher,
} from "./contexts/EnhancedMockKeycloakProvider";
import { ReduxCartProvider } from "./contexts/ReduxCartContext";
import { initInstrumentation } from './instrumentation';
import { queryClient } from "./lib/queryClient";
import { AuthService } from "./services/authService";
import { SessionService } from "./services/sessionService";
import { persistor, store } from "./store/store";
import "./styles/main.scss";
import { getApiUrl, getEnvironmentInfo, logApiConfig } from "./utils/api-config";

// Initialize OpenTelemetry before anything else
initInstrumentation();

// Expose debugging utilities to window for browser console access
if (typeof window !== "undefined") {
  // @ts-ignore - Adding to window for debugging
  window.debugAdvana = {
    logApiConfig,
    getEnvironmentInfo,
    getApiUrl,
    env: import.meta.env,

    // Comprehensive debug function for authentication state
    debugAuth: () => {
      /* eslint-disable no-console */
      // @ts-ignore - Accessing custom window properties
      const debugAdvana = window.debugAdvana;
      // @ts-ignore - Accessing custom window properties
      const keycloak = window.keycloak;

      console.log("=== ADVANA MARKETPLACE DEBUG ===");
      console.log("Environment:", debugAdvana.env?.VITE_ENVIRONMENT);
      console.log("Bypass Auth:", debugAdvana.env?.VITE_BYPASS_AUTH);
      console.log("Keycloak URL:", debugAdvana.env?.VITE_KEYCLOAK_URL);
      console.log("Keycloak Realm:", debugAdvana.env?.VITE_KEYCLOAK_REALM);

      console.log("\n=== AUTHENTICATION STATE ===");
      if (keycloak) {
        console.log("✅ Keycloak found - Production mode");
        console.log("Authenticated:", keycloak.authenticated);

        // Only log token metadata in development with explicit debug flag
        if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_AUTH === "true") {
          console.log("Has token:", !!keycloak.token);
          console.log("Token length:", keycloak.token?.length);
          console.log("User email:", keycloak.tokenParsed?.email);
          console.log(
            "User roles:",
            keycloak.tokenParsed?.resource_access?.marketplace?.roles
          );
        }
      } else {
        console.log("❌ Keycloak not found - Development mode or not loaded");
      }

      console.log("\n=== LOCALSTORAGE ===");
      const userInfo = window.localStorage.getItem("marketplace_user_info");
      const cartData = window.localStorage.getItem("persist:cart");
      console.log("User info:", userInfo ? JSON.parse(userInfo) : "Not found");
      console.log(
        "Cart items:",
        cartData ? JSON.parse(cartData)?.items : "No cart data"
      );

      console.log("\n=== COOKIES ===");
      const cookies = document.cookie
        .split(";")
        .map((c) => c.trim())
        .filter((c) => c);
      const keycloakCookies = cookies.filter(
        (c) => c.includes("KEYCLOAK") || c.includes("AUTH_SESSION")
      );
      console.log("Total cookies:", cookies.length);
      console.log("Keycloak cookies:", keycloakCookies.length);
      if (keycloakCookies.length > 0) {
        keycloakCookies.forEach((cookie) =>
          console.log("  -", cookie.split("=")[0])
        );
      }

      console.log("\n=== QUICK COMMANDS ===");
      console.log(
        "Run 'window.debugAdvana.debugAuth()' to see this info again"
      );
      console.log(
        "Run 'window.debugAdvana.logApiConfig()' to see API configuration"
      );
      console.log(
        "Run 'window.debugAdvana.getEnvironmentInfo()' to see environment details"
      );
      /* eslint-enable no-console */
    },
  };
}

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
      <Provider store={store}>
        <PersistGate loading={<div>Loading cart...</div>} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <EnhancedMockKeycloakProvider>
              <BrowserRouter>
                <ReduxCartProvider>
                  <App />
                  <MockUserSwitcher />
                </ReduxCartProvider>
              </BrowserRouter>
            </EnhancedMockKeycloakProvider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </React.StrictMode>
  );
} else {
  // Production mode with Keycloak - import only when needed
  import("./keycloak")
    .then(({ default: keycloak }) => {
      // Immediately expose keycloak instance globally
      // This needs to happen BEFORE rendering so ApiService can access it
      // @ts-ignore
      window.keycloak = keycloak;
      // eslint-disable-next-line no-console
      console.log("[main] 🔐 Keycloak instance loaded and exposed to window (pre-init)", {
        hasKeycloak: !!keycloak
      });

      // Handle Keycloak events - called when Keycloak state changes
      const handleKeycloakEvent = (event: string) => {
        // eslint-disable-next-line no-console
        console.log("[main] 🔐 Keycloak event:", event, {
          authenticated: keycloak.authenticated,
          hasToken: !!keycloak.token,
          tokenLength: keycloak.token?.length
        });
        
        // Update the window reference (in case keycloak instance changes)
        // @ts-ignore
        window.keycloak = keycloak;
        
        if (event === 'onReady' || event === 'onAuthSuccess') {
          // eslint-disable-next-line no-console
          console.log("[main] ✅ Keycloak ready/authenticated", {
            authenticated: keycloak.authenticated,
            hasToken: !!keycloak.token,
            windowKeycloakSet: !!(window as any).keycloak
          });
        }
      };
      
      // Token capture callback - Keycloak manages tokens in memory/cookies
      // We only need to store user info for quick access
      const handleTokens = async (tokens: { 
        token?: string; 
        refreshToken?: string; 
        idToken?: string;
      }) => {
        if (tokens.token && keycloak.tokenParsed) {
          // Extract and store ONLY user info from the token (for role checks and user ID)
          const userInfo = AuthService.createUserInfoFromToken(
            keycloak.tokenParsed
          );
          AuthService.storeUserInfo(userInfo);

          // SECURITY: We explicitly do NOT store the token in localStorage
          // Keycloak manages tokens securely in memory and httpOnly cookies
          // Always use keycloak.token to get the current (potentially refreshed) token

          // Initialize session if session storage is enabled
          try {
            await SessionService.initializeSession(tokens.token, tokens.refreshToken);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.warn("[main] Failed to initialize session, continuing with direct token mode:", error);
            // Continue without session - will use direct token mode
          }
        } else {
          // eslint-disable-next-line no-console
          console.warn(
            "[main] onTokens called but no token or tokenParsed available"
          );
        }
      };

      root.render(
        <React.StrictMode>
          <Provider store={store}>
            <PersistGate
              loading={<div>Loading cart...</div>}
              persistor={persistor}
            >
              <QueryClientProvider client={queryClient}>
                <ReactKeycloakProvider
                  authClient={keycloak}
                  initOptions={keycloakInitOptions}
                  LoadingComponent={<LoadingComponent />}
                  onEvent={handleKeycloakEvent}
                  onTokens={handleTokens}
                >
                  <BrowserRouter>
                    <ReduxCartProvider>
                      <App />
                    </ReduxCartProvider>
                  </BrowserRouter>
                </ReactKeycloakProvider>
              </QueryClientProvider>
            </PersistGate>
          </Provider>
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
          <Provider store={store}>
            <PersistGate
              loading={<div>Loading cart...</div>}
              persistor={persistor}
            >
              <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                  <ReduxCartProvider>
                    <App />
                  </ReduxCartProvider>
                </BrowserRouter>
              </QueryClientProvider>
            </PersistGate>
          </Provider>
        </React.StrictMode>
      );
    });
}
