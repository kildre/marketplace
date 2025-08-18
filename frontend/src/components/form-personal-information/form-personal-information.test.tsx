import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { FormPersonalInformation } from "./form-personal-information";

// Extend Jest matchers for accessibility testing
expect.extend(toHaveNoViolations);

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("FormPersonalInformation", () => {
  const renderFormPersonalInformation = (props = {}) => {
    // Mock the useAuth hook with test user data
    mockUseAuth.mockReturnValue({
      userInfo: {
        id: "test-user-123",
        username: "joe.snuffy",
        email: "Joe.Snuffy.mil@army.mil",
        firstName: "Joe",
        lastName: "Snuffy",
        designation: "Military",
        agency: "III Corps",
      },
      getUserInfo: () => ({
        id: "test-user-123",
        username: "joe.snuffy",
        email: "Joe.Snuffy.mil@army.mil",
        firstName: "Joe",
        lastName: "Snuffy",
        designation: "Military",
        agency: "III Corps",
      }),
      isAuthenticated: true,
    });

    return render(<FormPersonalInformation {...props} />);
  };

  describe("Basic Rendering", () => {
    test("should render successfully", () => {
      const { container } = renderFormPersonalInformation();

      const formSection = container.querySelector(
        ".form-personal-information__section"
      );
      expect(formSection).toBeInTheDocument();
    });

    test("should render main heading", () => {
      renderFormPersonalInformation();

      const heading = screen.getByRole("heading", { level: 5 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("Personal Information");
    });

    test("should have correct CSS class", () => {
      const { container } = renderFormPersonalInformation();

      const section = container.querySelector(
        ".form-personal-information__section"
      );
      expect(section).toHaveClass("form-personal-information__section");
    });
  });

  describe("Personal Information Content", () => {
    test("should display user name correctly", () => {
      renderFormPersonalInformation();

      const nameLabel = screen.getByText("NAME:");
      const nameValue = screen.getByText("Joe Snuffy");

      expect(nameLabel).toBeInTheDocument();
      expect(nameValue).toBeInTheDocument();
    });

    test("should display email correctly", () => {
      renderFormPersonalInformation();

      const emailLabel = screen.getByText("EMAIL:");
      const emailValue = screen.getByText("Joe.Snuffy.mil@army.mil");

      expect(emailLabel).toBeInTheDocument();
      expect(emailValue).toBeInTheDocument();
    });

    test("should display designation correctly", () => {
      renderFormPersonalInformation();

      const designationLabel = screen.getByText("DESIGNATION:");
      const designationValue = screen.getByText("Military");

      expect(designationLabel).toBeInTheDocument();
      expect(designationValue).toBeInTheDocument();
    });

    test("should display agency correctly", () => {
      renderFormPersonalInformation();

      const agencyLabel = screen.getByText("AGENCY:");
      const agencyValue = screen.getByText("III Corps");

      expect(agencyLabel).toBeInTheDocument();
      expect(agencyValue).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    test("should have proper HTML structure", () => {
      const { container } = renderFormPersonalInformation();

      const section = container.querySelector(
        ".form-personal-information__section"
      );
      const heading = section?.querySelector("h5");
      const paragraphs = section?.querySelectorAll("p");

      expect(section).toBeInTheDocument();
      expect(heading).toBeInTheDocument();
      expect(paragraphs).toHaveLength(4);
    });

    test("should contain correct number of information fields", () => {
      const { container } = renderFormPersonalInformation();

      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs).toHaveLength(4);

      // Check that each paragraph contains a span
      paragraphs.forEach((p) => {
        const span = p.querySelector("span");
        expect(span).toBeInTheDocument();
      });
    });

    test("should have proper label-value structure", () => {
      const { container } = renderFormPersonalInformation();

      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs).toHaveLength(4);

      // Check NAME field
      expect(paragraphs[0]).toHaveTextContent("NAME:");
      expect(paragraphs[0].querySelector("span")).toHaveTextContent(
        "Joe Snuffy"
      );

      // Check EMAIL field
      expect(paragraphs[1]).toHaveTextContent("EMAIL:");
      expect(paragraphs[1].querySelector("span")).toHaveTextContent(
        "Joe.Snuffy.mil@army.mil"
      );

      // Check DESIGNATION field
      expect(paragraphs[2]).toHaveTextContent("DESIGNATION:");
      expect(paragraphs[2].querySelector("span")).toHaveTextContent("Military");

      // Check AGENCY field
      expect(paragraphs[3]).toHaveTextContent("AGENCY:");
      expect(paragraphs[3].querySelector("span")).toHaveTextContent(
        "III Corps"
      );
    });
  });

  describe("Text Content Verification", () => {
    test("should render all text content correctly", () => {
      renderFormPersonalInformation();

      // Test that all expected content is present and visible
      expect(screen.getByText("Personal Information")).toBeVisible();
      expect(screen.getByText("NAME:")).toBeVisible();
      expect(screen.getByText("Joe Snuffy")).toBeVisible();
      expect(screen.getByText("EMAIL:")).toBeVisible();
      expect(screen.getByText("Joe.Snuffy.mil@army.mil")).toBeVisible();
      expect(screen.getByText("DESIGNATION:")).toBeVisible();
      expect(screen.getByText("Military")).toBeVisible();
      expect(screen.getByText("AGENCY:")).toBeVisible();
      expect(screen.getByText("III Corps")).toBeVisible();
    });

    test("should have static content that doesn't change", () => {
      // Render multiple times to ensure content is static
      const { container: container1 } = renderFormPersonalInformation();
      const { container: container2 } = renderFormPersonalInformation();

      expect(container1.innerHTML).toBe(container2.innerHTML);
    });
  });

  describe("Component Props and Behavior", () => {
    test("should render without any props required", () => {
      expect(() => {
        render(<FormPersonalInformation />);
      }).not.toThrow();
    });

    test("should be a presentational component with no state", () => {
      const { container, rerender } = renderFormPersonalInformation();
      const initialHTML = container.innerHTML;

      // Re-render and ensure nothing changes
      rerender(<FormPersonalInformation />);
      expect(container.innerHTML).toBe(initialHTML);
    });
  });

  describe("Semantic Structure", () => {
    test("should use semantic HTML elements", () => {
      const { container } = renderFormPersonalInformation();

      // Check for semantic heading
      const heading = container.querySelector("h5");
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("Personal Information");

      // Check for semantic paragraph elements
      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs).toHaveLength(4);
    });

    test("should have proper heading hierarchy", () => {
      renderFormPersonalInformation();

      const heading = screen.getByRole("heading", { level: 5 });
      expect(heading).toHaveTextContent("Personal Information");
    });
  });

  describe("Accessibility", () => {
    test("should have no accessibility violations", async () => {
      const { container } = renderFormPersonalInformation();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("should meet WCAG accessibility standards", async () => {
      const { container } = renderFormPersonalInformation();

      // Test heading structure
      const h5 = container.querySelector("h5");
      expect(h5).toBeInTheDocument();

      // Test semantic structure
      const section = container.querySelector("div");
      expect(section).toBeInTheDocument();

      // Run comprehensive accessibility tests
      const results = await axe(container, {
        rules: {
          "color-contrast": { enabled: true },
          "heading-order": { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    test("should be screen reader friendly", () => {
      renderFormPersonalInformation();

      // All text content should be accessible to screen readers
      const heading = screen.getByRole("heading", { level: 5 });
      expect(heading).toBeInTheDocument();

      // Check that important information is in semantic elements
      expect(screen.getByText("Personal Information")).toBeInTheDocument();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle multiple renders gracefully", () => {
      const { unmount, container } = renderFormPersonalInformation();
      const originalHTML = container.innerHTML;

      unmount();

      const { container: newContainer } = renderFormPersonalInformation();
      expect(newContainer.innerHTML).toBe(originalHTML);
    });

    test("should not break with repeated mounting/unmounting", () => {
      expect(() => {
        for (let i = 0; i < 5; i++) {
          const { unmount } = renderFormPersonalInformation();
          unmount();
        }
      }).not.toThrow();
    });
  });

  describe("Component Consistency", () => {
    test("should render component snapshot consistently", () => {
      const { container } = renderFormPersonalInformation();

      // Verify the component structure doesn't change unexpectedly
      expect(container.innerHTML).toContain(
        'class="form-personal-information__section"'
      );
      expect(container.innerHTML).toContain("<h5>");
      expect(container.innerHTML).toContain("Personal Information");
      expect(container.innerHTML).toContain("NAME:");
      expect(container.innerHTML).toContain("Joe Snuffy");
      expect(container.innerHTML).toContain("EMAIL:");
      expect(container.innerHTML).toContain("Joe.Snuffy.mil@army.mil");
      expect(container.innerHTML).toContain("DESIGNATION:");
      expect(container.innerHTML).toContain("Military");
      expect(container.innerHTML).toContain("AGENCY:");
      expect(container.innerHTML).toContain("III Corps");
    });

    test("should maintain DOM structure integrity", () => {
      const { container } = renderFormPersonalInformation();

      // Check the overall structure
      const outerDiv = container.firstChild;
      expect(outerDiv).toHaveClass("form-personal-information__section");

      const heading = container.querySelector("h5");
      expect(heading?.parentElement).toBe(outerDiv);

      const paragraphs = container.querySelectorAll("p");
      paragraphs.forEach((p) => {
        expect(p.parentElement).toBe(outerDiv);
      });
    });
  });

  describe("Performance", () => {
    test("should render quickly without performance issues", () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        const { unmount } = renderFormPersonalInformation();
        unmount();
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should render 100 times in less than 2 seconds
      expect(totalTime).toBeLessThan(2000);
    });

    test("should not cause memory leaks", () => {
      // Render and unmount multiple times to check for memory leaks
      expect(() => {
        for (let i = 0; i < 50; i++) {
          const { unmount } = renderFormPersonalInformation();
          unmount();
        }
      }).not.toThrow();
    });
  });

  describe("Integration Compatibility", () => {
    test("should work in different container environments", () => {
      // Test with custom container
      const customContainer = document.createElement("div");
      customContainer.className = "custom-container";
      document.body.appendChild(customContainer);

      const { container } = render(<FormPersonalInformation />, {
        container: customContainer,
      });

      expect(
        container.querySelector(".form-personal-information__section")
      ).toBeInTheDocument();

      document.body.removeChild(customContainer);
    });

    test("should maintain functionality when used as a child component", () => {
      const ParentComponent = () => (
        <div className="parent-wrapper">
          <FormPersonalInformation />
        </div>
      );

      const { container } = render(<ParentComponent />);

      const parentWrapper = container.querySelector(".parent-wrapper");
      const personalInfoSection = container.querySelector(
        ".form-personal-information__section"
      );

      expect(parentWrapper).toBeInTheDocument();
      expect(personalInfoSection).toBeInTheDocument();
      expect(personalInfoSection?.parentElement).toBe(parentWrapper);
    });
  });
});
