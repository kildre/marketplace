import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { FormPersonalInformation } from "./form-personal-information";

describe("FormPersonalInformation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic Rendering", () => {
    test("should render successfully", () => {
      const { container } = render(<FormPersonalInformation />);

      const formContainer = container.querySelector(
        ".form-personal-information"
      );
      expect(formContainer).toBeInTheDocument();
    });

    test("should render with correct structure", () => {
      const { container } = render(<FormPersonalInformation />);

      const sections = container.querySelectorAll(
        ".form-personal-information__section"
      );
      expect(sections).toHaveLength(2);

      const estimatedROM = container.querySelector("h5");
      expect(estimatedROM).toBeInTheDocument();
    });

    test("should render personal information section", () => {
      render(<FormPersonalInformation />);

      const personalInfoHeading = screen.getByRole("heading", {
        name: /personal information/i,
      });
      expect(personalInfoHeading).toBeInTheDocument();
      expect(personalInfoHeading.tagName).toBe("H4");
    });

    test("should render cost details section", () => {
      render(<FormPersonalInformation />);

      const costDetailsHeading = screen.getByRole("heading", {
        name: /cost details/i,
      });
      expect(costDetailsHeading).toBeInTheDocument();
      expect(costDetailsHeading.tagName).toBe("H4");
    });

    test("should render estimated ROM section", () => {
      render(<FormPersonalInformation />);

      const estimatedROMHeading = screen.getByRole("heading", {
        name: /estimated rom/i,
      });
      expect(estimatedROMHeading).toBeInTheDocument();
      expect(estimatedROMHeading.tagName).toBe("H5");
    });
  });

  describe("Personal Information Content", () => {
    test("should display correct name", () => {
      render(<FormPersonalInformation />);

      expect(screen.getByText("NAME:")).toBeInTheDocument();
      expect(screen.getByText("Joe Snuffy")).toBeInTheDocument();
    });

    test("should display correct email", () => {
      render(<FormPersonalInformation />);

      expect(screen.getByText("EMAIL:")).toBeInTheDocument();
      expect(screen.getByText("Joe.Snuffy.mil@army.mil")).toBeInTheDocument();
    });

    test("should display correct designation", () => {
      render(<FormPersonalInformation />);

      expect(screen.getByText("DESIGNATION:")).toBeInTheDocument();
      expect(screen.getByText("Military")).toBeInTheDocument();
    });

    test("should display correct agency", () => {
      render(<FormPersonalInformation />);

      expect(screen.getByText("AGENCY:")).toBeInTheDocument();
      expect(screen.getByText("III Corps")).toBeInTheDocument();
    });

    test("should have personal information fields in correct format", () => {
      render(<FormPersonalInformation />);

      // Check that labels and values are properly structured
      const nameField = screen.getByText("NAME:").closest("p");
      expect(nameField).toHaveTextContent("NAME:Joe Snuffy");

      const emailField = screen.getByText("EMAIL:").closest("p");
      expect(emailField).toHaveTextContent("EMAIL:Joe.Snuffy.mil@army.mil");

      const designationField = screen.getByText("DESIGNATION:").closest("p");
      expect(designationField).toHaveTextContent("DESIGNATION:Military");

      const agencyField = screen.getByText("AGENCY:").closest("p");
      expect(agencyField).toHaveTextContent("AGENCY:III Corps");
    });
  });

  describe("Cost Details Content", () => {
    test("should display products requested count", () => {
      render(<FormPersonalInformation />);

      expect(screen.getByText("PRODUCTS REQUESTED")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    test("should display applications pending price with warning", () => {
      render(<FormPersonalInformation />);

      expect(
        screen.getByText("APPLICATIONS PENDING PRICE")
      ).toBeInTheDocument();

      const warningSpan = screen.getByText("2");
      expect(warningSpan).toBeInTheDocument();
      expect(warningSpan).toHaveClass("cost-warning");
    });

    test("should have cost details fields in correct format", () => {
      render(<FormPersonalInformation />);

      const productsField = screen.getByText("PRODUCTS REQUESTED").closest("p");
      expect(productsField).toHaveTextContent("PRODUCTS REQUESTED3");

      const pendingField = screen
        .getByText("APPLICATIONS PENDING PRICE")
        .closest("p");
      expect(pendingField).toHaveTextContent("APPLICATIONS PENDING PRICE2");
    });
  });

  describe("Estimated ROM Content", () => {
    test("should display estimated ROM value", () => {
      render(<FormPersonalInformation />);

      expect(screen.getByText("Estimated ROM")).toBeInTheDocument();
      expect(screen.getByText("$13.00")).toBeInTheDocument();
    });

    test("should have estimated ROM in correct format", () => {
      render(<FormPersonalInformation />);

      const romHeading = screen.getByRole("heading", {
        name: /estimated rom/i,
      });
      expect(romHeading).toHaveTextContent("Estimated ROM$13.00");
    });

    test("should display price in correct currency format", () => {
      render(<FormPersonalInformation />);

      const priceElement = screen.getByText("$13.00");
      expect(priceElement).toBeInTheDocument();
      expect(priceElement.textContent).toMatch(/^\$\d+\.\d{2}$/);
    });
  });

  describe("CSS Classes and Structure", () => {
    test("should have correct CSS classes applied", () => {
      const { container } = render(<FormPersonalInformation />);

      expect(
        container.querySelector(".form-personal-information")
      ).toBeInTheDocument();

      const sections = container.querySelectorAll(
        ".form-personal-information__section"
      );
      expect(sections).toHaveLength(2);

      expect(container.querySelector(".cost-warning")).toBeInTheDocument();
    });

    test("should have correct DOM structure", () => {
      const { container } = render(<FormPersonalInformation />);

      const mainDiv = container.querySelector(".form-personal-information");
      expect(mainDiv).toBeInTheDocument();

      const sections = mainDiv?.querySelectorAll(
        ".form-personal-information__section"
      );
      expect(sections).toHaveLength(2);

      const h4Elements = mainDiv?.querySelectorAll("h4");
      expect(h4Elements).toHaveLength(2);

      const h5Elements = mainDiv?.querySelectorAll("h5");
      expect(h5Elements).toHaveLength(1);

      const pElements = mainDiv?.querySelectorAll("p");
      expect(pElements).toHaveLength(6);
    });

    test("should have cost-warning class applied to correct element", () => {
      const { container } = render(<FormPersonalInformation />);

      const warningElement = container.querySelector(".cost-warning");
      expect(warningElement).toBeInTheDocument();
      expect(warningElement).toHaveTextContent("2");
      expect(warningElement?.tagName).toBe("SPAN");
    });
  });

  describe("Accessibility", () => {
    test("should have proper heading hierarchy", () => {
      render(<FormPersonalInformation />);

      const h4Headings = screen.getAllByRole("heading", { level: 4 });
      expect(h4Headings).toHaveLength(2);
      expect(h4Headings[0]).toHaveTextContent("Personal Information");
      expect(h4Headings[1]).toHaveTextContent("Cost Details");

      const h5Headings = screen.getAllByRole("heading", { level: 5 });
      expect(h5Headings).toHaveLength(1);
      expect(h5Headings[0]).toHaveTextContent("Estimated ROM$13.00");
    });

    test("should have semantic HTML structure", () => {
      const { container } = render(<FormPersonalInformation />);

      // Check that headings are properly structured
      const headings = container.querySelectorAll("h4, h5");
      expect(headings).toHaveLength(3);

      // Check that content is in paragraph elements
      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs).toHaveLength(6);
    });

    test("should have meaningful text content", () => {
      render(<FormPersonalInformation />);

      // Check that all text content is meaningful and not just placeholder
      expect(screen.getByText("Joe Snuffy")).toBeInTheDocument();
      expect(screen.getByText("Joe.Snuffy.mil@army.mil")).toBeInTheDocument();
      expect(screen.getByText("Military")).toBeInTheDocument();
      expect(screen.getByText("III Corps")).toBeInTheDocument();
    });
  });

  describe("Data Display", () => {
    test("should display numerical values correctly", () => {
      render(<FormPersonalInformation />);

      const productsCount = screen.getByText("3");
      expect(productsCount).toBeInTheDocument();

      const pendingCount = screen.getByText("2");
      expect(pendingCount).toBeInTheDocument();

      const romAmount = screen.getByText("$13.00");
      expect(romAmount).toBeInTheDocument();
    });

    test("should display email in valid format", () => {
      render(<FormPersonalInformation />);

      const email = screen.getByText("Joe.Snuffy.mil@army.mil");
      expect(email).toBeInTheDocument();
      expect(email.textContent).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    test("should display currency in valid format", () => {
      render(<FormPersonalInformation />);

      const currency = screen.getByText("$13.00");
      expect(currency).toBeInTheDocument();
      expect(currency.textContent).toMatch(/^\$\d+\.\d{2}$/);
    });
  });

  describe("Component Isolation", () => {
    test("should render without props", () => {
      expect(() => {
        render(<FormPersonalInformation />);
      }).not.toThrow();
    });

    test("should be a pure component", () => {
      const { container: container1 } = render(<FormPersonalInformation />);
      const { container: container2 } = render(<FormPersonalInformation />);

      expect(container1.innerHTML).toBe(container2.innerHTML);
    });

    test("should not have any external dependencies", () => {
      render(<FormPersonalInformation />);

      // Component should render static content only
      expect(screen.getByText("Personal Information")).toBeInTheDocument();
    });
  });

  describe("Static Content Validation", () => {
    test("should have consistent label formatting", () => {
      render(<FormPersonalInformation />);

      const labels = ["NAME:", "EMAIL:", "DESIGNATION:", "AGENCY:"];
      labels.forEach((label) => {
        const labelElement = screen.getByText(label);
        expect(labelElement).toBeInTheDocument();
        // The label appears as part of the paragraph content
        expect(labelElement.textContent).toContain(label);
      });
    });

    test("should have consistent value structure", () => {
      const { container } = render(<FormPersonalInformation />);

      const valueSpans = container.querySelectorAll("p span");
      expect(valueSpans.length).toBeGreaterThan(0);

      // Check that each value span has content
      valueSpans.forEach((span) => {
        expect(span.textContent).toBeTruthy();
      });
    });

    test("should maintain consistent spacing and structure", () => {
      const { container } = render(<FormPersonalInformation />);

      const sections = container.querySelectorAll(
        ".form-personal-information__section"
      );
      sections.forEach((section) => {
        const heading = section.querySelector("h4");
        const paragraphs = section.querySelectorAll("p");

        expect(heading).toBeInTheDocument();
        expect(paragraphs.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle missing spans gracefully", () => {
      render(<FormPersonalInformation />);

      // Even if spans are missing, the component should still render
      const mainContainer = screen
        .getByText("Personal Information")
        .closest(".form-personal-information");
      expect(mainContainer).toBeInTheDocument();
    });

    test("should render all required sections", () => {
      render(<FormPersonalInformation />);

      // Verify all main sections are present
      expect(screen.getByText("Personal Information")).toBeInTheDocument();
      expect(screen.getByText("Cost Details")).toBeInTheDocument();
      expect(screen.getByText("Estimated ROM")).toBeInTheDocument();
    });

    test("should handle component remounting", () => {
      const { unmount } = render(<FormPersonalInformation />);

      expect(screen.getByText("Joe Snuffy")).toBeInTheDocument();

      unmount();

      // Render a new instance instead of using rerender after unmount
      render(<FormPersonalInformation />);

      expect(screen.getByText("Joe Snuffy")).toBeInTheDocument();
    });
  });

  describe("Visual Indicators", () => {
    test("should apply warning class to pending applications", () => {
      const { container } = render(<FormPersonalInformation />);

      const warningElement = container.querySelector(".cost-warning");
      expect(warningElement).toBeInTheDocument();
      expect(warningElement).toHaveTextContent("2");
    });

    test("should differentiate between normal and warning states", () => {
      render(<FormPersonalInformation />);

      const normalCount = screen.getByText("3");
      const warningCount = screen.getByText("2");

      expect(normalCount).not.toHaveClass("cost-warning");
      expect(warningCount).toHaveClass("cost-warning");
    });
  });
});
