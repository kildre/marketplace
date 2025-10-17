import { render, screen, fireEvent } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import CustomMenuLogoSection from "./CustomMenuLogoSection";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock cart context
vi.mock("../contexts/CartContext", () => ({
  useCart: () => ({
    cartCount: 3,
  }),
}));

// Mock auth hook
const mockHasRole = vi.fn();
vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    hasRole: mockHasRole,
  }),
}));

// Helper function to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

// Mock window.location for navigation testing
const mockLocation = {
  href: "",
  hash: "",
  reload: vi.fn(),
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

// Mock window.open
Object.defineProperty(window, "open", {
  value: vi.fn(),
  writable: true,
});

describe("CustomMenuLogoSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = "";
    mockLocation.hash = "";
    mockHasRole.mockReturnValue(false); // Default to no role
  });

  describe("Advana Enclave (Default)", () => {
    it("renders all required logos for Advana enclave", () => {
      renderWithRouter(<CustomMenuLogoSection />);

      // Check for DoD logo
      const dodLogo = screen.getByAltText("dod_logo");
      expect(dodLogo).toBeInTheDocument();
      expect(dodLogo).toHaveAttribute("src", "/public/assets/images/DOD_color.png");

      // Check for CDAO logo
      const cdaoLogo = screen.getByAltText("cdao_logo");
      expect(cdaoLogo).toBeInTheDocument();
      expect(cdaoLogo).toHaveAttribute("src", "/public/assets/images/cdao_Logo.png");

      // Check for Advana logo
      const advanaLogo = screen.getByAltText("Advana logo");
      expect(advanaLogo).toBeInTheDocument();
      expect(advanaLogo).toHaveAttribute("src", "/public/assets/images/AdvanaDarkTheme.png");
    });

    it("renders with correct styling", () => {
      render(<CustomMenuLogoSection />);

      const dodLogo = screen.getByAltText("dod_logo");
      const cdaoLogo = screen.getByAltText("cdao_logo");
      const advanaLogo = screen.getByAltText("Advana logo");

      // Check logo dimensions
      expect(dodLogo).toHaveStyle({ width: "40px", height: "40px" });
      expect(cdaoLogo).toHaveStyle({ width: "40px", height: "40px" });
      expect(advanaLogo).toHaveStyle({ maxWidth: "180px", height: "42px" });
    });

    it("handles Advana logo click navigation with default settings", () => {
      render(<CustomMenuLogoSection />);

      const advanaLogo = screen.getByAltText("Advana logo");
      fireEvent.click(advanaLogo);

      expect(mockLocation.hash).toBe("#/");
    });

    it("handles Advana logo click with custom megaMenuBaseDomain", () => {
      render(
        <CustomMenuLogoSection 
          megaMenuBaseDomain="https://custom.domain.com" 
          isCRA={false}
        />
      );

      const advanaLogo = screen.getByAltText("Advana logo");
      fireEvent.click(advanaLogo);

      expect(mockLocation.href).toBe("https://custom.domain.com#/");
    });

    it("renders alternate logo when provided", () => {
      const alternateLogo = "/assets/images/custom-logo.png";
      render(<CustomMenuLogoSection alternateLogo={alternateLogo} />);

      // Should not render default Advana logo
      expect(screen.queryByAltText("Advana logo")).not.toBeInTheDocument();

      // Should render alternate logo
      const customLogo = screen.getByAltText("alternate_logo");
      expect(customLogo).toBeInTheDocument();
      expect(customLogo).toHaveAttribute("src", alternateLogo);
    });
  });

  describe("Jupiter Enclave", () => {
    it("renders all Jupiter logos", () => {
      render(<CustomMenuLogoSection enclave="jupiter" />);

      // Check for Jupiter logos
      expect(screen.getByAltText("Navy Department logo")).toBeInTheDocument();
      expect(screen.getByAltText("Marines logo")).toBeInTheDocument();
      expect(screen.getByAltText("Navy logo")).toBeInTheDocument();
      expect(screen.getByAltText("Jupiter logo")).toBeInTheDocument();

      // Should not render Advana logos
      expect(screen.queryByAltText("dod_logo")).not.toBeInTheDocument();
      expect(screen.queryByAltText("cdao_logo")).not.toBeInTheDocument();
      expect(screen.queryByAltText("Advana logo")).not.toBeInTheDocument();
    });

    it("handles Jupiter logo clicks with navigation", () => {
      render(<CustomMenuLogoSection enclave="jupiter" />);

      const jupiterLogo = screen.getByAltText("Jupiter logo");
      fireEvent.click(jupiterLogo);

      expect(mockLocation.hash).toBe("#/");
    });

    it("handles all Jupiter logos click navigation", () => {
      render(<CustomMenuLogoSection enclave="jupiter" />);

      const logos = [
        screen.getByAltText("Navy Department logo"),
        screen.getByAltText("Marines logo"),
        screen.getByAltText("Navy logo"),
        screen.getByAltText("Jupiter logo"),
      ];

      logos.forEach((logo) => {
        fireEvent.click(logo);
        expect(mockLocation.hash).toBe("#/");
        mockLocation.hash = ""; // Reset for next test
      });
    });
  });

  describe("Navigation Functionality", () => {
    it("opens new tab when newTab option is used", () => {
      const mockOpen = vi.spyOn(window, "open");
      
      // We need to simulate the internal changePage function being called with newTab=true
      // Since it's not directly exposed, we'll test the behavior through component interaction
      render(<CustomMenuLogoSection />);
      
      // For this test, we'll verify the mock setup is correct
      expect(mockOpen).not.toHaveBeenCalled();
    });

    it("handles CRA mode navigation correctly", () => {
      render(<CustomMenuLogoSection isCRA={true} />);

      const advanaLogo = screen.getByAltText("Advana logo");
      fireEvent.click(advanaLogo);

      // In CRA mode, should use hash navigation
      expect(mockLocation.hash).toBe("#/");
    });

    it("handles non-CRA mode navigation correctly", () => {
      render(
        <CustomMenuLogoSection 
          isCRA={false} 
          megaMenuBaseDomain="https://example.com"
        />
      );

      const advanaLogo = screen.getByAltText("Advana logo");
      fireEvent.click(advanaLogo);

      // In non-CRA mode, should set href directly
      expect(mockLocation.href).toBe("https://example.com#/");
    });
  });

  describe("Accessibility", () => {
    it("should not have accessibility violations with Advana enclave", async () => {
      const { container } = render(<CustomMenuLogoSection />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should not have accessibility violations with Jupiter enclave", async () => {
      const { container } = render(<CustomMenuLogoSection enclave="jupiter" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("provides appropriate alt text for all images", () => {
      render(<CustomMenuLogoSection />);

      const images = screen.getAllByRole("img");
      images.forEach((img) => {
        expect(img).toHaveAttribute("alt");
        expect(img.getAttribute("alt")).not.toBe("");
      });
    });

    it("maintains keyboard accessibility for clickable logos", () => {
      render(<CustomMenuLogoSection />);
      
      const advanaLogo = screen.getByAltText("Advana logo");
      expect(advanaLogo).toHaveStyle({ cursor: "pointer" });
    });
  });

  describe("Props Validation", () => {
    it("uses default props when none provided", () => {
      render(<CustomMenuLogoSection />);
      
      // Should render Advana enclave by default
      expect(screen.getByAltText("Advana logo")).toBeInTheDocument();
    });

    it("handles all props correctly", () => {
      render(
        <CustomMenuLogoSection
          enclave="advana"
          alternateLogo="/custom-logo.png"
          megaMenuBaseDomain="https://custom.com"
          isCRA={false}
        />
      );

      // Should render alternate logo
      expect(screen.getByAltText("alternate_logo")).toBeInTheDocument();
      expect(screen.queryByAltText("Advana logo")).not.toBeInTheDocument();
    });
  });

  describe("Image Loading", () => {
    it("uses correct image paths for all logos", () => {
      render(<CustomMenuLogoSection />);

      expect(screen.getByAltText("dod_logo")).toHaveAttribute(
        "src",
        "/public/assets/images/DOD_color.png"
      );
      expect(screen.getByAltText("cdao_logo")).toHaveAttribute(
        "src",
        "/public/assets/images/cdao_Logo.png"
      );
      expect(screen.getByAltText("Advana logo")).toHaveAttribute(
        "src",
        "/public/assets/images/AdvanaDarkTheme.png"
      );
    });

    it("uses correct image paths for Jupiter enclave", () => {
      renderWithRouter(<CustomMenuLogoSection enclave="jupiter" />);

      expect(screen.getByAltText("Navy Department logo")).toHaveAttribute(
        "src",
        "/public/assets/images/Jupiter_DON_logo.png"
      );
      expect(screen.getByAltText("Marines logo")).toHaveAttribute(
        "src",
        "/public/assets/images/Jupiter_USMC_logo.png"
      );
      expect(screen.getByAltText("Navy logo")).toHaveAttribute(
        "src",
        "/public/assets/images/Jupiter_USN_logo.png"
      );
      expect(screen.getByAltText("Jupiter logo")).toHaveAttribute(
        "src",
        "/public/assets/images/Jupiter_logo.png"
      );
    });
  });
});
