import { render, screen, fireEvent } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { GovernmentBanner } from "./government-banner";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("GovernmentBanner", () => {
  test("should render successfully", () => {
    const { container } = render(<GovernmentBanner />);
    const banner = container.querySelector(".gov-banner");
    expect(banner).toBeInTheDocument();
  });

  test("should render with proper semantic structure", () => {
    render(<GovernmentBanner />);

    const banner = screen.getByRole("region", {
      name: "Official government website",
    });
    expect(banner).toBeInTheDocument();

    const headerText = screen.getByText(
      "An official website of the United States government"
    );
    expect(headerText).toBeInTheDocument();

    const toggleButton = screen.getByRole("button", {
      name: /here's how you know/i,
    });
    expect(toggleButton).toBeInTheDocument();
  });

  test("should have correct initial state", () => {
    render(<GovernmentBanner />);

    const toggleButton = screen.getByRole("button", {
      name: /here's how you know/i,
    });
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");

    const guidanceSection = screen.queryByText("Official websites use .gov");
    expect(guidanceSection).not.toBeInTheDocument();
  });

  test("should expand guidance when button is clicked", () => {
    render(<GovernmentBanner />);

    const toggleButton = screen.getByRole("button", {
      name: /here's how you know/i,
    });

    // Click to expand
    fireEvent.click(toggleButton);

    expect(toggleButton).toHaveAttribute("aria-expanded", "true");

    const govGuidance = screen.getByText("Official websites use .gov");
    expect(govGuidance).toBeInTheDocument();

    const httpsGuidance = screen.getByText("Secure .gov websites use HTTPS");
    expect(httpsGuidance).toBeInTheDocument();
  });

  test("should collapse guidance when button is clicked again", () => {
    render(<GovernmentBanner />);

    const toggleButton = screen.getByRole("button", {
      name: /here's how you know/i,
    });

    // Click to expand
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-expanded", "true");

    // Click to collapse
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");

    const guidanceSection = document.getElementById("gov-banner-guidance");
    expect(guidanceSection).not.toBeInTheDocument();
  });

  test("should have proper ARIA attributes", () => {
    render(<GovernmentBanner />);

    const toggleButton = screen.getByRole("button", {
      name: /here's how you know/i,
    });
    expect(toggleButton).toHaveAttribute(
      "aria-controls",
      "gov-banner-guidance"
    );
    expect(toggleButton).toHaveAttribute("type", "button");

    // Expand to test guidance section ARIA
    fireEvent.click(toggleButton);

    const guidanceSection = document.getElementById("gov-banner-guidance");
    expect(guidanceSection).toBeInTheDocument();
    expect(guidanceSection).toHaveAttribute("aria-hidden", "false");
  });

  test("should render all required content elements", () => {
    const { container } = render(<GovernmentBanner />);

    // Check for flag image (decorative, so query by attribute)
    const flagImage = container.querySelector(
      'img[src="/assets/icons/us-flag-small.png"]'
    );
    expect(flagImage).toBeInTheDocument();
    expect(flagImage).toHaveAttribute("alt", "");
    expect(flagImage).toHaveClass("gov-banner__flag-image");

    // Check for chevron image in button
    const chevronImage = container.querySelector(
      'img[src="/assets/icons/chevron.png"]'
    );
    expect(chevronImage).toBeInTheDocument();
    expect(chevronImage).toHaveClass("gov-banner__chevron");
    expect(chevronImage).not.toHaveClass("gov-banner__chevron--expanded");

    // Check for main text
    expect(
      screen.getByText("An official website of the United States government")
    ).toBeInTheDocument();

    // Expand and check guidance content
    const toggleButton = screen.getByRole("button", {
      name: /here's how you know/i,
    });
    fireEvent.click(toggleButton);

    // Check that chevron is now expanded
    expect(chevronImage).toHaveClass("gov-banner__chevron--expanded");

    expect(screen.getByText("Official websites use .gov")).toBeInTheDocument();
    expect(
      screen.getByText("Secure .gov websites use HTTPS")
    ).toBeInTheDocument();
    expect(screen.getByText("🏛️")).toBeInTheDocument();
    expect(screen.getByText("🔒")).toBeInTheDocument();
  });

  test("should have correct CSS classes", () => {
    const { container } = render(<GovernmentBanner />);

    expect(container.querySelector(".gov-banner")).toBeInTheDocument();
    expect(container.querySelector(".gov-banner__header")).toBeInTheDocument();
    expect(
      container.querySelector(".gov-banner__container")
    ).toBeInTheDocument();
    expect(
      container.querySelector(".gov-banner__header-content")
    ).toBeInTheDocument();
    expect(
      container.querySelector(".gov-banner__flag-icon")
    ).toBeInTheDocument();
    expect(
      container.querySelector(".gov-banner__header-text")
    ).toBeInTheDocument();
    expect(container.querySelector(".gov-banner__text")).toBeInTheDocument();
    expect(container.querySelector(".gov-banner__button")).toBeInTheDocument();
    expect(
      container.querySelector(".gov-banner__button-icon")
    ).toBeInTheDocument();
  });

  test("should have guidance content with correct structure when expanded", () => {
    const { container } = render(<GovernmentBanner />);

    const toggleButton = screen.getByRole("button", {
      name: /here's how you know/i,
    });
    fireEvent.click(toggleButton);

    expect(
      container.querySelector(".gov-banner__guidance")
    ).toBeInTheDocument();
    expect(
      container.querySelector(".gov-banner__guidance-content")
    ).toBeInTheDocument();

    const guidanceItems = container.querySelectorAll(
      ".gov-banner__guidance-item"
    );
    expect(guidanceItems).toHaveLength(2);

    const icons = container.querySelectorAll(".gov-banner__icon");
    expect(icons).toHaveLength(2);

    const guidanceTexts = container.querySelectorAll(
      ".gov-banner__guidance-text"
    );
    expect(guidanceTexts).toHaveLength(2);
  });

  test("should have no accessibility violations", async () => {
    const { container } = render(<GovernmentBanner />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("should have no accessibility violations when expanded", async () => {
    const { container } = render(<GovernmentBanner />);

    const toggleButton = screen.getByRole("button", {
      name: /here's how you know/i,
    });
    fireEvent.click(toggleButton);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("should meet WCAG accessibility standards", async () => {
    const { container } = render(<GovernmentBanner />);

    // Test semantic structure - section has implicit region role
    const banner = container.querySelector(
      'section[aria-label="Official government website"]'
    );
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveAttribute("aria-label", "Official government website");

    // Test button accessibility
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-expanded");
    expect(button).toHaveAttribute("aria-controls");

    // Test that decorative icons are hidden from screen readers
    const flagIcon = container.querySelector(".gov-banner__flag-icon");
    expect(flagIcon).toHaveAttribute("aria-hidden", "true");

    // Run comprehensive accessibility tests
    const results = await axe(container, {
      rules: {
        "button-name": { enabled: true },
        "aria-hidden-body": { enabled: true },
        "color-contrast": { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });

  test("should toggle chevron state when expanded/collapsed", () => {
    const { container } = render(<GovernmentBanner />);

    const chevronImage = container.querySelector(
      'img[src="/assets/icons/chevron.png"]'
    );
    const toggleButton = screen.getByRole("button", {
      name: /here's how you know/i,
    });

    // Initially collapsed - no expanded class
    expect(chevronImage).toHaveClass("gov-banner__chevron");
    expect(chevronImage).not.toHaveClass("gov-banner__chevron--expanded");

    // Click to expand
    fireEvent.click(toggleButton);
    expect(chevronImage).toHaveClass("gov-banner__chevron--expanded");

    // Click to collapse
    fireEvent.click(toggleButton);
    expect(chevronImage).not.toHaveClass("gov-banner__chevron--expanded");
  });
});
