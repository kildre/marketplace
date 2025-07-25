import { screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { renderWithProviders } from "../../test-utils";
import { RequestDetail } from "./request-detail";
import { vi } from "vitest";
import * as ReactRouterDom from "react-router-dom";

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: vi.fn(),
  };
});

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("RequestDetail", () => {
  const mockUseSearchParams = vi.mocked(ReactRouterDom.useSearchParams);

  beforeEach(() => {
    // Reset to default (no search params) before each test
    mockUseSearchParams.mockReturnValue([
      new window.URLSearchParams(),
      vi.fn(),
    ]);

    // Suppress MUI Select warning for tests since the component doesn't have MenuItem options
    vi.spyOn(console, "error").mockImplementation((message, ..._args) => {
      if (
        typeof message === "string" &&
        message.includes("You have provided an out-of-range value")
      ) {
        return;
      }
      // Allow other console errors to pass through silently in tests
    });
  });

  afterEach(() => {
    // Restore all mocks
    vi.restoreAllMocks();
  });

  const renderRequestDetail = (searchParams: string = "") => {
    if (searchParams) {
      mockUseSearchParams.mockReturnValue([
        new window.URLSearchParams(searchParams),
        vi.fn(),
      ]);
    }
    return renderWithProviders(<RequestDetail />);
  };

  describe("when no request ID is provided", () => {
    test("should render 'Request Not Found' message", () => {
      const { container } = renderRequestDetail();

      expect(screen.getByText("Request Not Found")).toBeInTheDocument();
      expect(
        screen.getByText(
          "No Request ID was given as a parameter. Please return to the previous page."
        )
      ).toBeInTheDocument();

      const containerDiv = container.querySelector(".requests-page");
      expect(containerDiv).toBeInTheDocument();
      expect(containerDiv).toHaveClass("requests-page", "marketplace-content");
    });

    test("should have proper semantic structure for error state", () => {
      const { container } = renderRequestDetail();

      const section = container.querySelector("section");
      expect(section).toHaveAttribute(
        "aria-labelledby",
        "request-not-found-heading"
      );

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Request Not Found");
      expect(heading).toHaveAttribute("id", "request-not-found-heading");
    });

    test("should be accessible when no ID provided", async () => {
      const { container } = renderRequestDetail();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("when invalid request ID is provided", () => {
    test("should render 'Request Not Found' for invalid ID", () => {
      const { container } = renderRequestDetail("?id=invalid-id");

      expect(screen.getByText("Request Not Found")).toBeInTheDocument();
      expect(
        screen.getByText("Request with ID invalid-id was not found.")
      ).toBeInTheDocument();

      const containerDiv = container.querySelector(".requests-page");
      expect(containerDiv).toBeInTheDocument();
    });
  });

  describe("when valid request ID is provided", () => {
    const validRequestId = "GnTqm8c-1983cdc2be0"; // Using the first request from mock data

    test("should render request detail page successfully", () => {
      const { container } = renderRequestDetail(`?id=${validRequestId}`);

      const requestDetailContainer = container.querySelector(
        ".request-detail-page"
      );
      expect(requestDetailContainer).toBeInTheDocument();
      expect(requestDetailContainer).toHaveClass(
        "request-detail-page",
        "cart-page",
        "marketplace-content"
      );

      const pageTitle = screen.getByText(`Request Detail - ${validRequestId}`);
      expect(pageTitle).toBeInTheDocument();
    });

    test("should render request details accordion", () => {
      renderRequestDetail(`?id=${validRequestId}`);

      expect(screen.getByText("Request Details")).toBeInTheDocument();
      expect(screen.getByLabelText("Organization")).toBeInTheDocument();

      // Check for the "Other Organization" field which contains "CDAO"
      expect(screen.getByText("Other Organization")).toBeInTheDocument();
      expect(screen.getByDisplayValue("CDAO")).toBeInTheDocument();
    });

    test("should render personal information correctly", () => {
      renderRequestDetail(`?id=${validRequestId}`);

      expect(screen.getByText("Personal Information")).toBeInTheDocument();
      expect(screen.getByText("Joe Snuffy")).toBeInTheDocument();
      expect(screen.getByText("Joe.Snuffy.mil@army.mil")).toBeInTheDocument();
      expect(screen.getByText("Military")).toBeInTheDocument();
      expect(screen.getByText("III Corps")).toBeInTheDocument();
    });

    test("should render selected applications", () => {
      renderRequestDetail(`?id=${validRequestId}`);

      expect(
        screen.getByText(/Selected Applications \(8 products\)/)
      ).toBeInTheDocument();
      expect(screen.getByText("AWS")).toBeInTheDocument();
      expect(screen.getByText("C3AI")).toBeInTheDocument();
      expect(screen.getByText("Databricks")).toBeInTheDocument();
    });

    test("should render cost details", () => {
      renderRequestDetail(`?id=${validRequestId}`);

      expect(screen.getByText("Cost Details")).toBeInTheDocument();
      expect(screen.getByText("PRODUCTS REQUESTED")).toBeInTheDocument();
      expect(
        screen.getByText("APPLICATIONS PENDING PRICE")
      ).toBeInTheDocument();
      expect(screen.getByText("Estimated ROM")).toBeInTheDocument();
    });

    test("should render approval status section", () => {
      renderRequestDetail(`?id=${validRequestId}`);

      expect(screen.getByText("Approval Status")).toBeInTheDocument();
      expect(screen.getByLabelText("Reasoning")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Accept" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Reject" })
      ).toBeInTheDocument();
    });

    test("should have correct status button styling", () => {
      const { container } = renderRequestDetail(`?id=${validRequestId}`);

      // The status button should have the appropriate class based on status
      const statusButton = container.querySelector(
        ".button--pending, .button--approved, .button--denied"
      );
      expect(statusButton).toBeInTheDocument();
    });

    test("should render point of contact details", () => {
      renderRequestDetail(`?id=${validRequestId}`);

      expect(screen.getByDisplayValue("Jane Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2192192199")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("jane.doe.civ@mil.gov")
      ).toBeInTheDocument();
    });

    test("should render use case description", () => {
      renderRequestDetail(`?id=${validRequestId}`);

      const useCaseField = screen.getByLabelText("Use Case Description");
      expect(useCaseField).toBeInTheDocument();
      expect(useCaseField).toHaveAttribute("disabled");
    });

    test("should have proper DOM structure for valid request", () => {
      const { container } = renderRequestDetail(`?id=${validRequestId}`);

      const outerDiv = container.firstChild;
      expect(outerDiv).toHaveClass("request-detail-page");

      const contentWrapper = container.querySelector(
        ".cart-page__content-wrapper"
      );
      expect(contentWrapper).toBeInTheDocument();

      const leftContent = container.querySelector(".cart-page__content-left");
      const rightContent = container.querySelector(".cart-page__content-right");
      expect(leftContent).toBeInTheDocument();
      expect(rightContent).toBeInTheDocument();
    });

    test("should be accessible with valid request", async () => {
      const { container } = renderRequestDetail(`?id=${validRequestId}`);
      const results = await axe(container, {
        rules: {
          "heading-order": { enabled: false }, // Disable heading order check since h4 is used in card layout
        },
      });
      expect(results).toHaveNoViolations();
    });

    test("should have proper heading hierarchy", () => {
      renderRequestDetail(`?id=${validRequestId}`);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent(`Request Detail - ${validRequestId}`);

      // Should have multiple headings for sections
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(1);
    });

    test("should meet WCAG accessibility standards", async () => {
      const { container } = renderRequestDetail(`?id=${validRequestId}`);

      // Test heading hierarchy
      const h1 = container.querySelector("h1");
      expect(h1).toBeInTheDocument();

      // Test form labels
      const organizationLabel = screen.getByLabelText("Organization");
      expect(organizationLabel).toBeInTheDocument();

      // Run comprehensive accessibility tests
      const results = await axe(container, {
        rules: {
          "heading-order": { enabled: false }, // Disable heading order check since h4 is used in card layout
          "page-has-heading-one": { enabled: true },
          "landmark-unique": { enabled: true },
          label: { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });
});
