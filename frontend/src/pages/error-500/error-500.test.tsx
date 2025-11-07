import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { Error500 } from "./error-500";

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

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, "location", {
  value: {
    reload: mockReload,
  },
  writable: true,
});

describe("Error500 Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderError500 = () => {
    return render(
      <BrowserRouter>
        <ThemeProvider theme={testTheme}>
          <Error500 />
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  describe("Rendering", () => {
    it("should render the 500 error page", () => {
      renderError500();

      expect(screen.getByText("500")).toBeInTheDocument();
      expect(screen.getByText("Internal Server Error")).toBeInTheDocument();
    });

    it("should display the error message", () => {
      renderError500();

      expect(
        screen.getByText("Something went wrong on our end.")
      ).toBeInTheDocument();
    });

    it("should display the error description", () => {
      renderError500();

      expect(
        screen.getByText(/We're experiencing technical difficulties/i)
      ).toBeInTheDocument();
    });

    it("should render both action buttons", () => {
      renderError500();

      const refreshButton = screen.getByRole("button", {
        name: /refresh the page/i,
      });
      const homeButton = screen.getByRole("button", {
        name: /go to home page/i,
      });

      expect(refreshButton).toBeInTheDocument();
      expect(homeButton).toBeInTheDocument();
    });

    it("should apply correct CSS classes", () => {
      const { container } = renderError500();

      expect(container.querySelector(".error-page")).toBeInTheDocument();
      expect(container.querySelector(".error-500")).toBeInTheDocument();
      expect(container.querySelector(".error-content")).toBeInTheDocument();
      expect(container.querySelector(".error-code")).toBeInTheDocument();
      expect(container.querySelector(".error-title")).toBeInTheDocument();
      expect(container.querySelector(".error-message")).toBeInTheDocument();
      expect(container.querySelector(".error-description")).toBeInTheDocument();
      expect(container.querySelector(".error-actions")).toBeInTheDocument();
    });
  });

  describe("Navigation and Actions", () => {
    it("should reload the page when 'Refresh Page' button is clicked", () => {
      renderError500();

      const refreshButton = screen.getByRole("button", {
        name: /refresh the page/i,
      });
      fireEvent.click(refreshButton);

      expect(mockReload).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should navigate to home page when 'Go to Home' button is clicked", () => {
      renderError500();

      const homeButton = screen.getByRole("button", {
        name: /go to home page/i,
      });
      fireEvent.click(homeButton);

      expect(mockNavigate).toHaveBeenCalledWith("/");
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockReload).not.toHaveBeenCalled();
    });
  });

  describe("Material-UI Integration", () => {
    it("should render Material-UI Button components", () => {
      renderError500();

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);

      buttons.forEach((button) => {
        expect(button).toHaveClass("MuiButton-root");
        expect(button).toHaveClass("MuiButton-outlined");
      });
    });

    it("should have proper aria-labels on buttons", () => {
      renderError500();

      expect(
        screen.getByRole("button", { name: "Refresh the page" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Go to home page" })
      ).toBeInTheDocument();
    });

    it("should have custom class names for styling", () => {
      const { container } = renderError500();

      const refreshButton = container.querySelector(
        ".error-actions__button--left"
      );
      const homeButton = container.querySelector(
        ".error-actions__button--right"
      );

      expect(refreshButton).toBeInTheDocument();
      expect(homeButton).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have no accessibility violations", async () => {
      const { container } = renderError500();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have appropriate heading hierarchy", () => {
      renderError500();

      const heading = screen.getByRole("heading", {
        name: /internal server error/i,
      });
      expect(heading.tagName).toBe("H1");
    });

    it("should have accessible button labels", () => {
      renderError500();

      const refreshButton = screen.getByRole("button", {
        name: /refresh the page/i,
      });
      const homeButton = screen.getByRole("button", {
        name: /go to home page/i,
      });

      expect(refreshButton).toHaveAttribute("aria-label", "Refresh the page");
      expect(homeButton).toHaveAttribute("aria-label", "Go to home page");
    });
  });

  describe("Content", () => {
    it("should display the correct error code", () => {
      renderError500();

      const errorCode = screen.getByText("500");
      expect(errorCode).toHaveClass("error-code");
    });

    it("should display helpful guidance for the user", () => {
      renderError500();

      expect(
        screen.getByText(/Please try refreshing the page or come back later/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/If the problem persists, contact support/i)
      ).toBeInTheDocument();
    });
  });
});
