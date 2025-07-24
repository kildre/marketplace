import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { RequestDetail } from "./request-detail";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("RequestDetail", () => {
  const renderRequestDetailWithRoute = (initialEntries: string[] = ["/"]) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <RequestDetail />
      </MemoryRouter>
    );
  };

  describe("when no request ID is provided", () => {
    test("should render 'Request Not Found' message", () => {
      const { container } = renderRequestDetailWithRoute();
      
      expect(screen.getByText("Request Not Found")).toBeInTheDocument();
      expect(screen.getByText("No Request ID was given as a parameter. Please return to the previous page.")).toBeInTheDocument();
      
      const containerDiv = container.querySelector(".requests-page");
      expect(containerDiv).toBeInTheDocument();
      expect(containerDiv).toHaveClass("requests-page", "marketplace-content");
    });

    test("should have proper semantic structure for error state", () => {
      const { container } = renderRequestDetailWithRoute();

      const section = container.querySelector("section");
      expect(section).toHaveAttribute("aria-labelledby", "request-not-found-heading");
      
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Request Not Found");
      expect(heading).toHaveAttribute("id", "request-not-found-heading");
    });

    test("should be accessible when no ID provided", async () => {
      const { container } = renderRequestDetailWithRoute();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("when invalid request ID is provided", () => {
    test("should render 'Request Not Found' for invalid ID", () => {
      const { container } = renderRequestDetailWithRoute(["/?id=invalid-id"]);
      
      expect(screen.getByText("Request Not Found")).toBeInTheDocument();
      expect(screen.getByText("Request with ID invalid-id was not found.")).toBeInTheDocument();
      
      const containerDiv = container.querySelector(".requests-page");
      expect(containerDiv).toBeInTheDocument();
    });
  });

  describe("when valid request ID is provided", () => {
    const validRequestId = "GnTqm8c-1983cdc2be0"; // Using the first request from mock data

    test("should render request detail page successfully", () => {
      const { container } = renderRequestDetailWithRoute([`/?id=${validRequestId}`]);
      
      const requestDetailContainer = container.querySelector(".request-detail-page");
      expect(requestDetailContainer).toBeInTheDocument();
      expect(requestDetailContainer).toHaveClass("request-detail-page", "cart-page", "marketplace-content");
      
      const pageTitle = screen.getByText(`Request Detail - ${validRequestId}`);
      expect(pageTitle).toBeInTheDocument();
    });

    test("should render request details accordion", () => {
      renderRequestDetailWithRoute([`/?id=${validRequestId}`]);
      
      expect(screen.getByText("Request Details")).toBeInTheDocument();
      expect(screen.getByLabelText("Organization")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Other")).toBeInTheDocument();
      expect(screen.getByDisplayValue("CDAO")).toBeInTheDocument();
    });

    test("should render personal information correctly", () => {
      renderRequestDetailWithRoute([`/?id=${validRequestId}`]);
      
      expect(screen.getByText("Personal Information")).toBeInTheDocument();
      expect(screen.getByText("Joe Snuffy")).toBeInTheDocument();
      expect(screen.getByText("Joe.Snuffy.mil@army.mil")).toBeInTheDocument();
      expect(screen.getByText("Military")).toBeInTheDocument();
      expect(screen.getByText("III Corps")).toBeInTheDocument();
    });

    test("should render selected applications", () => {
      renderRequestDetailWithRoute([`/?id=${validRequestId}`]);
      
      expect(screen.getByText(/Selected Applications \(7 products\)/)).toBeInTheDocument();
      expect(screen.getByText("AWS")).toBeInTheDocument();
      expect(screen.getByText("C3AI")).toBeInTheDocument();
      expect(screen.getByText("Databricks")).toBeInTheDocument();
    });

    test("should render cost details", () => {
      renderRequestDetailWithRoute([`/?id=${validRequestId}`]);
      
      expect(screen.getByText("Cost Details")).toBeInTheDocument();
      expect(screen.getByText("PRODUCTS REQUESTED")).toBeInTheDocument();
      expect(screen.getByText("APPLICATIONS PENDING PRICE")).toBeInTheDocument();
      expect(screen.getByText("Estimated ROM")).toBeInTheDocument();
    });

    test("should render approval status section", () => {
      renderRequestDetailWithRoute([`/?id=${validRequestId}`]);
      
      expect(screen.getByText("Approval Status")).toBeInTheDocument();
      expect(screen.getByLabelText("Reasoning")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
    });

    test("should have correct status button styling", () => {
      const { container } = renderRequestDetailWithRoute([`/?id=${validRequestId}`]);
      
      // The status button should have the appropriate class based on status
      const statusButton = container.querySelector('.button--pending, .button--approved, .button--denied');
      expect(statusButton).toBeInTheDocument();
    });

    test("should render point of contact details", () => {
      renderRequestDetailWithRoute([`/?id=${validRequestId}`]);
      
      expect(screen.getByDisplayValue("Jane Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2192192199")).toBeInTheDocument();
      expect(screen.getByDisplayValue("jane.doe.civ@mil.gov")).toBeInTheDocument();
    });

    test("should render use case description", () => {
      renderRequestDetailWithRoute([`/?id=${validRequestId}`]);
      
      const useCaseField = screen.getByLabelText("Use Case Description");
      expect(useCaseField).toBeInTheDocument();
      expect(useCaseField).toHaveAttribute("disabled");
    });

    test("should have proper DOM structure for valid request", () => {
      const { container } = renderRequestDetailWithRoute([`/?id=${validRequestId}`]);

      const outerDiv = container.firstChild;
      expect(outerDiv).toHaveClass("request-detail-page");

      const contentWrapper = container.querySelector(".cart-page__content-wrapper");
      expect(contentWrapper).toBeInTheDocument();

      const leftContent = container.querySelector(".cart-page__content-left");
      const rightContent = container.querySelector(".cart-page__content-right");
      expect(leftContent).toBeInTheDocument();
      expect(rightContent).toBeInTheDocument();
    });

    test("should be accessible with valid request", async () => {
      const { container } = renderRequestDetailWithRoute([`/?id=${validRequestId}`]);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("should have proper heading hierarchy", () => {
      renderRequestDetailWithRoute([`/?id=${validRequestId}`]);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent(`Request Detail - ${validRequestId}`);

      // Should have multiple headings for sections
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(1);
    });

    test("should meet WCAG accessibility standards", async () => {
      const { container } = renderRequestDetailWithRoute([`/?id=${validRequestId}`]);

      // Test heading hierarchy
      const h1 = container.querySelector("h1");
      expect(h1).toBeInTheDocument();

      // Test form labels
      const organizationLabel = screen.getByLabelText("Organization");
      expect(organizationLabel).toBeInTheDocument();

      // Run comprehensive accessibility tests
      const results = await axe(container, {
        rules: {
          "heading-order": { enabled: true },
          "page-has-heading-one": { enabled: true },
          "landmark-unique": { enabled: true },
          "label": { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });
});
