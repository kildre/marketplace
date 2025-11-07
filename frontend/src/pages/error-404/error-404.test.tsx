import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { Error404 } from "./error-404";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Create a test theme for Material-UI components
const testTheme = createTheme();

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Error404 Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderError404 = () => {
    return render(
      <BrowserRouter>
        <ThemeProvider theme={testTheme}>
          <Error404 />
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  describe("Rendering", () => {
    it("should render the 404 error page", () => {
      renderError404();

      expect(screen.getByText("404")).toBeInTheDocument();
      expect(screen.getByText("Page Not Found")).toBeInTheDocument();
    });

    it("should display the error message", () => {
      renderError404();

      expect(
        screen.getByText("The page you're looking for doesn't exist.")
      ).toBeInTheDocument();
    });

    it("should display the error description", () => {
      renderError404();

      expect(
        screen.getByText(/The page may have been moved, deleted/i)
      ).toBeInTheDocument();
    });

    it("should render both action buttons", () => {
      renderError404();

      const homeButton = screen.getByRole("button", {
        name: /go to home page/i,
      });
      const backButton = screen.getByRole("button", { name: /go back/i });

      expect(homeButton).toBeInTheDocument();
      expect(backButton).toBeInTheDocument();
    });

    it("should apply correct CSS classes", () => {
      const { container } = renderError404();

      expect(container.querySelector(".error-page")).toBeInTheDocument();
      expect(container.querySelector(".error-404")).toBeInTheDocument();
      expect(container.querySelector(".error-content")).toBeInTheDocument();
      expect(container.querySelector(".error-code")).toBeInTheDocument();
      expect(container.querySelector(".error-title")).toBeInTheDocument();
      expect(container.querySelector(".error-message")).toBeInTheDocument();
      expect(container.querySelector(".error-description")).toBeInTheDocument();
      expect(container.querySelector(".error-actions")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("should navigate to home page when 'Go to Home' button is clicked", () => {
      renderError404();

      const homeButton = screen.getByRole("button", {
        name: /go to home page/i,
      });
      fireEvent.click(homeButton);

      expect(mockNavigate).toHaveBeenCalledWith("/");
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it("should navigate back when 'Go Back' button is clicked", () => {
      // Mock window.history.length to simulate having history
      const originalHistoryLength = window.history.length;
      Object.defineProperty(window.history, "length", {
        configurable: true,
        writable: true,
        value: 3, // Simulate having meaningful history
      });

      renderError404();

      const backButton = screen.getByRole("button", { name: /go back/i });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
      expect(mockNavigate).toHaveBeenCalledTimes(1);

      // Restore original history length
      Object.defineProperty(window.history, "length", {
        configurable: true,
        writable: true,
        value: originalHistoryLength,
      });
    });

    it("should navigate to home when 'Go Back' is clicked with insufficient history", () => {
      // Mock window.history.length to simulate no history
      const originalHistoryLength = window.history.length;
      Object.defineProperty(window.history, "length", {
        configurable: true,
        writable: true,
        value: 1,
      });

      renderError404();

      const backButton = screen.getByRole("button", { name: /go back/i });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
      expect(mockNavigate).toHaveBeenCalledTimes(1);

      // Restore original history length
      Object.defineProperty(window.history, "length", {
        configurable: true,
        writable: true,
        value: originalHistoryLength,
      });
    });
  });

  describe("Material-UI Integration", () => {
    it("should render Material-UI Button components", () => {
      renderError404();

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);

      buttons.forEach((button) => {
        expect(button).toHaveClass("MuiButton-root");
        expect(button).toHaveClass("MuiButton-outlined");
      });
    });

    it("should have proper aria-labels on buttons", () => {
      renderError404();

      expect(
        screen.getByRole("button", { name: "Go to home page" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Go Back" })
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have no accessibility violations", async () => {
      const { container } = renderError404();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have appropriate heading hierarchy", () => {
      renderError404();

      const heading = screen.getByRole("heading", { name: /page not found/i });
      expect(heading.tagName).toBe("H1");
    });

    it("should have accessible button labels", () => {
      renderError404();

      const homeButton = screen.getByRole("button", {
        name: /go to home page/i,
      });
      const backButton = screen.getByRole("button", { name: /go back/i });

      expect(homeButton).toHaveAttribute("aria-label", "Go to home page");
      expect(backButton).toHaveAttribute("aria-label", "Go Back");
    });
  });

  describe("Content", () => {
    it("should display the correct error code", () => {
      renderError404();

      const errorCode = screen.getByText("404");
      expect(errorCode).toHaveClass("error-code");
    });

    it("should display helpful guidance for the user", () => {
      renderError404();

      expect(
        screen.getByText(/Please check the URL or navigate back/i)
      ).toBeInTheDocument();
    });
  });
});
