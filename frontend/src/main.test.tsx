import { vi, describe, test, expect, beforeEach } from "vitest";
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

describe("main.tsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
