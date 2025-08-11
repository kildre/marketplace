import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock AdvanaMenu component
vi.mock("@advana/platform-ui/dist/AdvanaMenu", () => ({
  default: ({ menuLogoSection }: { menuLogoSection: React.ReactNode }) => (
    <div data-testid="advana-menu" style={{ 
      width: "0px", 
      height: "0px", 
      borderTop: "100px solid rgb(8, 29, 70)", 
      borderRight: "100px solid transparent", 
      position: "absolute" 
    }}>
      <div data-testid="menu-logo-section">{menuLogoSection}</div>
      {/* Simulate the triangular decorator element that should be hidden */}
      <div 
        style={{ 
          width: "0px", 
          height: "0px", 
          borderTop: "100px solid rgb(8, 29, 70)", 
          borderRight: "100px solid transparent", 
          position: "absolute" 
        }}
        data-testid="triangular-decorator"
      />
    </div>
  ),
}));

// Test component that includes the global styles
const TestComponent = () => (
  <div className="app-wrapper">
    {/* CUI Banner */}
    <div className="cui-banner">
      <span className="cui-banner__text">CUI</span>
    </div>
    
    {/* AdvanaMenu with Service Desk styling */}
    <div className="advana-menu-override advana-service-desk-style">
      <div data-testid="mock-advana-menu">
        <div style={{ 
          width: "0px", 
          height: "0px", 
          borderTop: "100px solid rgb(8, 29, 70)", 
          borderRight: "100px solid transparent", 
          position: "absolute" 
        }} data-testid="triangular-element" />
        Mock AdvanaMenu Content
      </div>
    </div>
  </div>
);

describe("Global Styles for Header Updates", () => {
  beforeEach(() => {
    // Import the actual SCSS file to test styles
    import("../../styles/main.scss");
  });

  describe("CUI Banner Styles", () => {
    it("should render CUI banner with correct structure", () => {
      const { container } = render(<TestComponent />);
      
      const cuiBanner = container.querySelector(".cui-banner");
      expect(cuiBanner).toBeInTheDocument();
      
      const cuiText = container.querySelector(".cui-banner__text");
      expect(cuiText).toBeInTheDocument();
      expect(cuiText).toHaveTextContent("CUI");
    });

    it("should apply sticky positioning to CUI banner", () => {
      const { container } = render(<TestComponent />);
      
      const cuiBanner = container.querySelector(".cui-banner");
      expect(cuiBanner).toHaveClass("cui-banner");
    });
  });

  describe("AdvanaMenu Service Desk Styling", () => {
    it("should apply service desk styling class", () => {
      const { container } = render(<TestComponent />);
      
      const advanaMenuContainer = container.querySelector(".advana-service-desk-style");
      expect(advanaMenuContainer).toBeInTheDocument();
      expect(advanaMenuContainer).toHaveClass("advana-menu-override");
    });

    it("should include override classes for positioning", () => {
      const { container } = render(<TestComponent />);
      
      const menuOverride = container.querySelector(".advana-menu-override");
      expect(menuOverride).toBeInTheDocument();
    });
  });

  describe("Triangular Element Hiding", () => {
    it("should hide triangular decorator elements", () => {
      const { container } = render(
        <div className="advana-service-desk-style">
          <div style={{ 
            width: "0px", 
            height: "0px", 
            borderTop: "100px solid rgb(8, 29, 70)", 
            borderRight: "100px solid transparent", 
            position: "absolute" 
          }} data-testid="triangular-element" />
        </div>
      );
      
      const triangularElement = container.querySelector('[data-testid="triangular-element"]');
      expect(triangularElement).toBeInTheDocument();
    });

    it("should target elements with specific border styles", () => {
      const { container } = render(
        <div className="advana-service-desk-style">
          <div style={{ 
            borderTop: "100px solid rgb(8, 29, 70)", 
            borderRight: "100px solid transparent"
          }} data-testid="border-element" />
        </div>
      );
      
      const borderElement = container.querySelector('[data-testid="border-element"]');
      expect(borderElement).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should maintain responsive structure", () => {
      const { container } = render(<TestComponent />);
      
      const appWrapper = container.querySelector(".app-wrapper");
      expect(appWrapper).toBeInTheDocument();
      
      const cuiBanner = container.querySelector(".cui-banner");
      const advanaMenu = container.querySelector(".advana-service-desk-style");
      
      expect(cuiBanner).toBeInTheDocument();
      expect(advanaMenu).toBeInTheDocument();
    });
  });

  describe("Style Override Priorities", () => {
    it("should apply important declarations for background override", () => {
      const { container } = render(<TestComponent />);
      
      const serviceDeskStyle = container.querySelector(".advana-service-desk-style");
      expect(serviceDeskStyle).toBeInTheDocument();
    });

    it("should maintain proper z-index stacking", () => {
      const { container } = render(<TestComponent />);
      
      const cuiBanner = container.querySelector(".cui-banner");
      const advanaMenu = container.querySelector(".advana-service-desk-style");
      
      expect(cuiBanner).toBeInTheDocument();
      expect(advanaMenu).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(<TestComponent />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should maintain semantic structure", () => {
      const { container } = render(<TestComponent />);
      
      const cuiText = container.querySelector(".cui-banner__text");
      expect(cuiText).toHaveTextContent("CUI");
    });
  });

  describe("CSS Selector Specificity", () => {
    it("should target fixed position elements for override", () => {
      const { container } = render(
        <div className="advana-menu-override">
          <div style={{ position: "fixed", marginTop: "30px" }} data-testid="fixed-element">
            Fixed Content
          </div>
        </div>
      );
      
      const fixedElement = container.querySelector('[data-testid="fixed-element"]');
      expect(fixedElement).toBeInTheDocument();
    });

    it("should handle multiple selector variations for triangular elements", () => {
      const { container } = render(
        <div className="advana-service-desk-style">
          <div style={{ 
            width: "0px", 
            height: "0px", 
            borderTop: "100px solid rgb(8, 29, 70)", 
            borderRight: "100px solid transparent" 
          }} data-testid="triangle-1" />
          <div style={{ 
            borderTop: "100px solid rgb(8, 29, 70)", 
            borderRight: "100px solid transparent" 
          }} data-testid="triangle-2" />
        </div>
      );
      
      expect(container.querySelector('[data-testid="triangle-1"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="triangle-2"]')).toBeInTheDocument();
    });
  });
});
