import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { Error403 } from "./error-403";

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

describe("Error403 Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderError403 = () => {
    return render(
      <BrowserRouter>
        <ThemeProvider theme={testTheme}>
          <Error403 />
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  describe("Rendering", () => {
    it("should render the 403 error page", () => {
      renderError403();

      expect(screen.getByText("403")).toBeInTheDocument();
      expect(screen.getByText("Access Forbidden")).toBeInTheDocument();
    });

    it("should display the error message", () => {
      renderError403();

      expect(
        screen.getByText("You don't have permission to access this resource.")
      ).toBeInTheDocument();
    });

    it("should display the error description", () => {
      renderError403();

      expect(
        screen.getByText(/If you believe you should have access to this page/i)
      ).toBeInTheDocument();
    });

    it("should render the 'Go to Home' button", () => {
      renderError403();

      const homeButton = screen.getByRole("button", {
        name: /go to home page/i,
      });
      expect(homeButton).toBeInTheDocument();
    });

    it("should apply correct CSS classes", () => {
      const { container } = renderError403();

      expect(container.querySelector(".error-page")).toBeInTheDocument();
      expect(container.querySelector(".error-403")).toBeInTheDocument();
      expect(container.querySelector(".error-content")).toBeInTheDocument();
      expect(container.querySelector(".error-code")).toBeInTheDocument();
      expect(container.querySelector(".error-title")).toBeInTheDocument();
      expect(container.querySelector(".error-message")).toBeInTheDocument();
      expect(container.querySelector(".error-description")).toBeInTheDocument();
    });
  });

  describe("Material-UI Integration", () => {
    it("should render Material-UI Button component", () => {
      renderError403();

      const button = screen.getByRole("button");
      expect(button).toHaveClass("MuiButton-root");
      expect(button).toHaveClass("MuiButton-outlined");
    });

    it("should have proper aria-label on button", () => {
      renderError403();

      expect(
        screen.getByRole("button", { name: "Go to home page" })
      ).toBeInTheDocument();
    });

    it("should have custom class names for styling", () => {
      const { container } = renderError403();

      const button = container.querySelector(".error-actions__button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("error-actions__button--left");
    });
  });

  describe("Navigation", () => {
    it("should navigate to home page when 'Go to Home' button is clicked", () => {
      renderError403();

      const homeButton = screen.getByRole("button", {
        name: /go to home page/i,
      });
      fireEvent.click(homeButton);

      expect(mockNavigate).toHaveBeenCalledWith("/");
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("should have no accessibility violations", async () => {
      const { container } = renderError403();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have appropriate heading hierarchy", () => {
      renderError403();

      const heading = screen.getByRole("heading", {
        name: /access forbidden/i,
      });
      expect(heading.tagName).toBe("H1");
    });

    it("should have accessible button label", () => {
      renderError403();

      const homeButton = screen.getByRole("button", {
        name: /go to home page/i,
      });
      expect(homeButton).toHaveAttribute("aria-label", "Go to home page");
    });
  });

  describe("Content", () => {
    it("should display the correct error code", () => {
      renderError403();

      const errorCode = screen.getByText("403");
      expect(errorCode).toHaveClass("error-code");
    });

    it("should display guidance for the user", () => {
      renderError403();

      expect(
        screen.getByText(/contact your administrator or verify/i)
      ).toBeInTheDocument();
    });
  });
});
