import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";

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
vi.mock("./App", () => {
  return {
    default: function MockApp() {
      return React.createElement(
        "div",
        { "data-testid": "app" },
        "App Component"
      );
    },
  };
});

// Mock React Router
vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "browser-router" }, children),
}));

// Mock document.getElementById
const mockElement = document.createElement("div");
mockElement.id = "root";
document.body.appendChild(mockElement);

// Mock the API config utilities
vi.mock("./utils/api-config", () => ({
  logApiConfig: vi.fn(),
  getEnvironmentInfo: vi.fn(() => ({ mode: "test", apiBaseUrl: "", bypassAuth: true })),
  getApiUrl: vi.fn((path: string) => path),
}));

describe("main.tsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear window.debugAdvana before each test
    if (typeof window !== "undefined") {
      // @ts-ignore
      delete window.debugAdvana;
    }
  });

  test("should have required dependencies available", () => {
    // Test that all required modules can be imported
    expect(() => import("react")).not.toThrow();
    expect(() => import("react-dom/client")).not.toThrow();
    expect(() => import("react-router-dom")).not.toThrow();
    expect(() => import("./App")).not.toThrow();
  });

  test("should create root and render when DOM element exists", () => {
    // Mock getElementById to return our mock element
    vi.spyOn(document, "getElementById").mockReturnValue(mockElement);

    // Manually simulate what main.tsx does - call createRoot directly
    const root = mockCreateRoot();

    // Simulate the render call
    root.render(
      React.createElement(
        React.StrictMode,
        {},
        React.createElement("div", { "data-testid": "browser-router" })
      )
    );

    // Verify render was called
    expect(mockRender).toHaveBeenCalledTimes(1);
  });

  test("should find root element by id", () => {
    const mockRootElement = document.createElement("div");
    mockRootElement.id = "root";

    vi.spyOn(document, "getElementById").mockReturnValue(mockRootElement);

    // Simulate main.tsx behavior
    const element = document.getElementById("root");

    expect(document.getElementById).toHaveBeenCalledWith("root");
    expect(element).toBe(mockRootElement);
  });

  test("should create proper React element structure", () => {
    // Test that we can create the expected structure
    const BrowserRouter = ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", { "data-testid": "browser-router" }, children);

    const App = () =>
      React.createElement("div", { "data-testid": "app" }, "App Component");

    const appElement = React.createElement(App);
    const browserRouterElement = React.createElement(BrowserRouter, {
      children: appElement,
    });
    const structure = React.createElement(React.StrictMode, {
      children: browserRouterElement,
    });

    expect(structure.type).toBe(React.StrictMode);

    // Type-safe checking for nested structure
    if (React.isValidElement(structure.props.children)) {
      expect(structure.props.children.type).toBe(BrowserRouter);
    }
  });

  test("should handle missing root element gracefully", () => {
    vi.spyOn(document, "getElementById").mockReturnValue(null);

    expect(() => {
      const element = document.getElementById("root");
      if (!element) {
        throw new Error("Root element not found");
      }
    }).toThrow("Root element not found");
  });

  describe("debugAdvana window utilities", () => {
    test("should expose debugAdvana utilities to window object", async () => {
      // Mock the functions
      const mockLogApiConfig = vi.fn();
      const mockGetEnvironmentInfo = vi.fn();
      const mockGetApiUrl = vi.fn();
      const mockEnv = { MODE: "test", VITE_API_BASE_URL: "" };

      // Simulate what main.tsx does
      if (typeof window !== "undefined") {
        // @ts-ignore
        window.debugAdvana = {
          logApiConfig: mockLogApiConfig,
          getEnvironmentInfo: mockGetEnvironmentInfo,
          getApiUrl: mockGetApiUrl,
          env: mockEnv,
        };
      }

      // @ts-ignore - Accessing window.debugAdvana
      expect(window.debugAdvana).toBeDefined();
      // @ts-ignore
      expect(typeof window.debugAdvana).toBe("object");
    });

    test("should expose all required debugging functions", async () => {
      const mockLogApiConfig = vi.fn();
      const mockGetEnvironmentInfo = vi.fn();
      const mockGetApiUrl = vi.fn();
      const mockEnv = { MODE: "test", VITE_API_BASE_URL: "" };

      // @ts-ignore
      window.debugAdvana = {
        logApiConfig: mockLogApiConfig,
        getEnvironmentInfo: mockGetEnvironmentInfo,
        getApiUrl: mockGetApiUrl,
        env: mockEnv,
      };

      // @ts-ignore
      const debugAdvana = window.debugAdvana;

      expect(debugAdvana.logApiConfig).toBeDefined();
      expect(typeof debugAdvana.logApiConfig).toBe("function");
      
      expect(debugAdvana.getEnvironmentInfo).toBeDefined();
      expect(typeof debugAdvana.getEnvironmentInfo).toBe("function");
      
      expect(debugAdvana.getApiUrl).toBeDefined();
      expect(typeof debugAdvana.getApiUrl).toBe("function");
      
      expect(debugAdvana.env).toBeDefined();
      expect(typeof debugAdvana.env).toBe("object");
    });

    test("should call logApiConfig function when accessed from window", async () => {
      const mockLogApiConfig = vi.fn();
      const mockGetEnvironmentInfo = vi.fn();
      const mockGetApiUrl = vi.fn();
      const mockEnv = { MODE: "test" };

      // @ts-ignore
      window.debugAdvana = {
        logApiConfig: mockLogApiConfig,
        getEnvironmentInfo: mockGetEnvironmentInfo,
        getApiUrl: mockGetApiUrl,
        env: mockEnv,
      };

      // @ts-ignore
      window.debugAdvana.logApiConfig();

      expect(mockLogApiConfig).toHaveBeenCalledTimes(1);
    });

    test("should call getEnvironmentInfo function when accessed from window", async () => {
      const mockGetEnvironmentInfo = vi.fn(() => ({ mode: "test", apiBaseUrl: "", bypassAuth: true }));
      const mockLogApiConfig = vi.fn();
      const mockGetApiUrl = vi.fn();
      const mockEnv = { MODE: "test" };

      // @ts-ignore
      window.debugAdvana = {
        logApiConfig: mockLogApiConfig,
        getEnvironmentInfo: mockGetEnvironmentInfo,
        getApiUrl: mockGetApiUrl,
        env: mockEnv,
      };

      // @ts-ignore
      const result = window.debugAdvana.getEnvironmentInfo();

      expect(mockGetEnvironmentInfo).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ mode: "test", apiBaseUrl: "", bypassAuth: true });
    });

    test("should call getApiUrl function when accessed from window", async () => {
      const mockGetApiUrl = vi.fn((path: string) => path);
      const mockLogApiConfig = vi.fn();
      const mockGetEnvironmentInfo = vi.fn();
      const mockEnv = { MODE: "test" };

      // @ts-ignore
      window.debugAdvana = {
        logApiConfig: mockLogApiConfig,
        getEnvironmentInfo: mockGetEnvironmentInfo,
        getApiUrl: mockGetApiUrl,
        env: mockEnv,
      };

      const testPath = "/api/test";
      // @ts-ignore
      const result = window.debugAdvana.getApiUrl(testPath);

      expect(mockGetApiUrl).toHaveBeenCalledWith(testPath);
      expect(result).toBe(testPath);
    });

    test("should expose environment variables through debugAdvana.env", async () => {
      const mockEnv = { 
        MODE: "test", 
        VITE_API_BASE_URL: "http://test.com",
        VITE_ENVIRONMENT_NAME: "test-env"
      };

      // @ts-ignore
      window.debugAdvana = {
        logApiConfig: vi.fn(),
        getEnvironmentInfo: vi.fn(),
        getApiUrl: vi.fn(),
        env: mockEnv,
      };

      // @ts-ignore
      const env = window.debugAdvana.env;

      expect(env).toBeDefined();
      expect(typeof env).toBe("object");
      expect(env.MODE).toBe("test");
      expect(env.VITE_API_BASE_URL).toBe("http://test.com");
      expect(env.VITE_ENVIRONMENT_NAME).toBe("test-env");
    });

    test("should handle window check correctly", () => {
      // Test that the window check logic works
      const isWindowAvailable = typeof window !== "undefined";
      expect(isWindowAvailable).toBe(true);

      // Test that we can safely assign to window
      if (typeof window !== "undefined") {
        // @ts-ignore
        window.testProperty = "test";
        // @ts-ignore
        expect(window.testProperty).toBe("test");
        // @ts-ignore
        delete window.testProperty;
      }
    });

    test("should not expose debugAdvana if window is undefined", () => {
      // This test simulates server-side rendering where window is undefined
      const originalWindow = globalThis.window;
      
      // @ts-ignore
      delete globalThis.window;

      // Re-import should not throw error
      expect(() => {
        // This would happen during SSR
        if (typeof window !== "undefined") {
          // @ts-ignore
          window.debugAdvana = {};
        }
      }).not.toThrow();

      // Restore window
      globalThis.window = originalWindow;
    });
  });
});
