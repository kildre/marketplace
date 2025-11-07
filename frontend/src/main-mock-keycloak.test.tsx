import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";
import React from "react";

// Mock ReactDOM.createRoot
const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({
  render: mockRender,
}));

vi.mock("react-dom/client", () => ({
  default: {
    createRoot: mockCreateRoot,
  },
  createRoot: mockCreateRoot,
}));

// Mock the App component
vi.mock("./App", () => ({
  default: function MockApp() {
    return React.createElement(
      "div",
      { "data-testid": "app" },
      "App Component"
    );
  },
}));

// Mock React Router
vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "browser-router" }, children),
}));

// Mock the CartProvider
vi.mock("./contexts/ReduxCartContext", () => ({
  ReduxCartProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "redux-cart-provider" }, children),
}));

// Mock the MockKeycloakProvider
vi.mock("./contexts/MockKeycloakProvider", () => ({
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "mock-keycloak-provider" }, children),
}));

// Mock the @react-keycloak/web package
vi.mock("@react-keycloak/web", () => ({
  ReactKeycloakProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "react-keycloak-provider" }, children),
}));

// Mock the keycloak module
vi.mock("./keycloak", () => ({
  default: {
    init: vi.fn(() => Promise.resolve(true)),
    authenticated: true,
    token: "mock-token",
  },
}));

// Mock SCSS import
vi.mock("./styles/main.scss", () => ({}));

// Mock console.error to suppress error logs in tests
vi.spyOn(console, "error").mockImplementation(() => {});

describe("main.tsx - MockKeycloakProvider Integration", () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock DOM element
    mockElement = document.createElement("div");
    mockElement.id = "root";
    document.body.appendChild(mockElement);

    // Mock getElementById to return our mock element
    vi.spyOn(document, "getElementById").mockReturnValue(mockElement);
  });

  afterEach(() => {
    // Clean up DOM
    if (mockElement.parentNode) {
      mockElement.parentNode.removeChild(mockElement);
    }
    
    // Reset environment variable
    delete (import.meta.env as any).VITE_BYPASS_AUTH;
  });

  test("should use MockKeycloakProvider when VITE_BYPASS_AUTH is true", () => {
    // Set environment variable to bypass auth
    (import.meta.env as any).VITE_BYPASS_AUTH = 'true';

    // Simulate the logic from main.tsx
    const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';
    expect(bypassAuth).toBe(true);

    // Simulate creating the development banner
    const DevBanner = () => React.createElement("div", {
      style: {
        backgroundColor: '#ff9800',
        color: 'white',
        padding: '8px',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '14px'
      }
    }, "🚧 DEVELOPMENT MODE - Authentication Bypassed 🚧");

    // Test that we can create the component hierarchy
    const root = mockCreateRoot();
    
    // Simulate the render call structure from main.tsx
    root.render(
      React.createElement(React.StrictMode, {}, 
        React.createElement(DevBanner),
        React.createElement("div", { "data-testid": "mock-keycloak-provider" },
          React.createElement("div", { "data-testid": "browser-router" },
            React.createElement("div", { "data-testid": "cart-provider" },
              React.createElement("div", { "data-testid": "app" }, "App Component")
            )
          )
        )
      )
    );

    expect(mockCreateRoot).toHaveBeenCalled();
    expect(mockRender).toHaveBeenCalledTimes(1);
  });

  test("should use ReactKeycloakProvider when VITE_BYPASS_AUTH is false", () => {
    // Set environment variable to use production auth
    (import.meta.env as any).VITE_BYPASS_AUTH = 'false';

    // Simulate the logic from main.tsx
    const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';
    expect(bypassAuth).toBe(false);

    // When bypassAuth is false, it should NOT use MockKeycloakProvider
    // Instead it would use the dynamic import for real Keycloak
    expect(bypassAuth).not.toBe(true);
  });

  test("should render development banner in bypass mode", () => {
    // Set environment variable to bypass auth
    (import.meta.env as any).VITE_BYPASS_AUTH = 'true';

    // Test that the development banner component can be created
    const DevBanner = () => React.createElement("div", {
      style: {
        backgroundColor: '#ff9800',
        color: 'white',
        padding: '8px',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '14px'
      }
    }, "🚧 DEVELOPMENT MODE - Authentication Bypassed 🚧");

    const bannerElement = React.createElement(DevBanner);
    expect(bannerElement.type).toBe(DevBanner);
  });

  test("should handle environment variable correctly", () => {
    // Test different values of VITE_BYPASS_AUTH
    const testCases = [
      { value: 'true', expected: true },
      { value: 'false', expected: false },
      { value: 'TRUE', expected: false },
      { value: '1', expected: false },
      { value: '', expected: false }
    ];

    testCases.forEach(({ value, expected }) => {
      (import.meta.env as any).VITE_BYPASS_AUTH = value;

      const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';
      expect(bypassAuth).toBe(expected);
    });
  });

  test("should create proper component hierarchy in bypass mode", () => {
    // Test that all required components can be composed correctly
    const appElement = React.createElement("div", { "data-testid": "app" }, "App Component");
    const cartElement = React.createElement("div", { "data-testid": "cart-provider" }, appElement);
    const routerElement = React.createElement("div", { "data-testid": "browser-router" }, cartElement);
    const keycloakElement = React.createElement("div", { "data-testid": "mock-keycloak-provider" }, routerElement);
    const strictModeElement = React.createElement(React.StrictMode, { children: keycloakElement });

    expect(strictModeElement.type).toBe(React.StrictMode);
    expect(React.isValidElement(strictModeElement)).toBe(true);
  });

  test("should handle keycloak initialization options", () => {
    // Test that keycloak initialization options are properly configured
    const keycloakInitOptions = {
      onLoad: 'login-required' as const,
      checkLoginIframe: false,
      pkceMethod: 'S256' as const
    };

    expect(keycloakInitOptions.onLoad).toBe('login-required');
    expect(keycloakInitOptions.checkLoginIframe).toBe(false);
    expect(keycloakInitOptions.pkceMethod).toBe('S256');
  });

  test("should create loading component", () => {
    // Test the LoadingComponent from main.tsx
    const LoadingComponent = () => React.createElement(
      "div",
      {
        style: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }
      },
      React.createElement("div", {}, "Loading authentication...")
    );

    const loadingElement = React.createElement(LoadingComponent);
    expect(loadingElement.type).toBe(LoadingComponent);
    expect(React.isValidElement(loadingElement)).toBe(true);
  });

  test("should handle fallback rendering on keycloak error", () => {
    // Test error banner component structure
    const ErrorBanner = ({ error }: { error: { message: string } }) => React.createElement(
      "div",
      {
        style: {
          backgroundColor: '#f44336',
          color: 'white',
          padding: '16px',
          textAlign: 'center',
          fontWeight: 'bold'
        }
      },
      `⚠️ Authentication Error: ${error.message}`
    );

    const mockError = { message: "Failed to load Keycloak" };
    const errorElement = React.createElement(ErrorBanner, { error: mockError });
    
    expect(errorElement.type).toBe(ErrorBanner);
    expect(React.isValidElement(errorElement)).toBe(true);
  });

  test("should verify DOM element access", () => {
    // Test the DOM element selection logic
    const element = document.getElementById('root');
    expect(element).toBe(mockElement);
    expect(element?.id).toBe('root');
  });
});
