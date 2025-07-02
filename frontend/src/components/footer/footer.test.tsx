import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { Footer } from "./footer-component";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("Footer", () => {
  const footerComponent = (
    <BrowserRouter>
      <Footer />
    </BrowserRouter>
  );

  test("should render successfully", () => {
    const { baseElement } = render(footerComponent);
    const footer = baseElement.querySelector(".footer");
    const footerMain = baseElement.querySelector(".footer-main");
    const footerBottom = baseElement.querySelector(".footer-bottom");

    expect(baseElement).toBeTruthy();
    expect(footer).toBeTruthy();
    expect(footerMain).toBeTruthy();
    expect(footerBottom).toBeTruthy();
  });

  test("should render footer logo", () => {
    render(footerComponent);
    const logo = screen.getByAltText("Advana and CDAO Logos");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute(
      "src",
      "/assets/logos/footer-logo-placeholder.png"
    );
  });

  test("should render navigation links", () => {
    render(footerComponent);

    // Check main navigation links
    expect(screen.getByText("Advana Home")).toBeInTheDocument();
    expect(screen.getByText("Builder Portal")).toBeInTheDocument();
    expect(screen.getByText("API Portal")).toBeInTheDocument();
    expect(screen.getByText("Learning")).toBeInTheDocument();
    expect(screen.getByText("Advana News")).toBeInTheDocument();
    expect(screen.getByText("Office Hours")).toBeInTheDocument();

    // Check that Contact Us appears in both main nav and footer bottom
    const contactUsLinks = screen.getAllByText("Contact Us");
    expect(contactUsLinks).toHaveLength(2);
    expect(contactUsLinks[0]).toHaveClass("footer-link");
    expect(contactUsLinks[1]).toHaveClass("footer-bottom-link");

    expect(screen.getByText("Advana Public Site")).toBeInTheDocument();
  });

  test("should render government information", () => {
    render(footerComponent);

    expect(screen.getByText("domain.gov")).toBeInTheDocument();
    expect(
      screen.getByText(
        "An official website of the Chief Digital and Artificial Intelligence Office"
      )
    ).toBeInTheDocument();
  });

  test("should render footer bottom links", () => {
    render(footerComponent);

    expect(screen.getByText("FOIA requests")).toBeInTheDocument();
    expect(
      screen.getByText("Office of the Inspector General")
    ).toBeInTheDocument();
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText("Accessibility")).toBeInTheDocument();
    expect(screen.getByText("No FEAR Act data")).toBeInTheDocument();
    expect(screen.getByText("Performance reports")).toBeInTheDocument();
  });

  test("should render external link to ai.mil", () => {
    render(footerComponent);

    expect(
      screen.getByText("Looking for U.S. government information and services?")
    ).toBeInTheDocument();

    const externalLink = screen.getByText("Visit https://www.ai.mil/");
    expect(externalLink).toBeInTheDocument();
    expect(externalLink.closest("a")).toHaveAttribute(
      "href",
      "https://www.ai.mil/"
    );
    expect(externalLink.closest("a")).toHaveAttribute("target", "_blank");
    expect(externalLink.closest("a")).toHaveAttribute(
      "rel",
      "noopener noreferrer"
    );
  });

  test("should have no accessibility violations", async () => {
    const { container } = render(footerComponent);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("should have proper ARIA attributes and semantic structure", async () => {
    const { container } = render(footerComponent);

    // Test that footer has proper semantic structure
    const footer = container.querySelector("footer");
    expect(footer).toBeInTheDocument();

    // Test navigation has proper structure
    const navLinks = container.querySelectorAll("a");
    navLinks.forEach((link) => {
      expect(link).toHaveAttribute("href");
    });

    // Run axe-core accessibility tests
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
