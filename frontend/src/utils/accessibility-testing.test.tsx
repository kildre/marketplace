import { axe } from "jest-axe";
import { vi } from "vitest";
import {
  testAccessibility,
  testContainerAccessibility,
  axeRules,
} from "./accessibility-testing";

// Mock jest-axe
vi.mock("jest-axe", () => ({
  axe: vi.fn(),
  toHaveNoViolations: vi.fn(),
}));

const mockAxe = axe as any;

describe("accessibility-testing utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("testAccessibility", () => {
    test("should render component and test accessibility", async () => {
      const mockResults = { violations: [] };
      mockAxe.mockResolvedValue(mockResults);

      const TestComponent = () => <div>Test Component</div>;

      await testAccessibility(<TestComponent />);

      expect(mockAxe).toHaveBeenCalledTimes(1);
      expect(mockAxe).toHaveBeenCalledWith(expect.any(HTMLElement), undefined);
    });

    test("should pass options to axe", async () => {
      const mockResults = { violations: [] };
      mockAxe.mockResolvedValue(mockResults);

      const TestComponent = () => <div>Test Component</div>;
      const options = {
        rules: {
          "color-contrast": { enabled: true },
        },
      };

      await testAccessibility(<TestComponent />, options);

      expect(mockAxe).toHaveBeenCalledWith(expect.any(HTMLElement), options);
    });

    test("should work with components that have props", async () => {
      const mockResults = { violations: [] };
      mockAxe.mockResolvedValue(mockResults);

      const PropsComponent = ({
        title,
        content,
      }: {
        title: string;
        content: string;
      }) => (
        <div>
          <h1>{title}</h1>
          <p>{content}</p>
        </div>
      );

      await testAccessibility(
        <PropsComponent title="Test Title" content="Test Content" />
      );

      expect(mockAxe).toHaveBeenCalledTimes(1);
    });

    test("should work with predefined axe rules", async () => {
      const mockResults = { violations: [] };
      mockAxe.mockResolvedValue(mockResults);

      const RealComponent = () => (
        <div>
          <h1>Accessible Title</h1>
          <nav aria-label="Main navigation">
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/about">About</a>
              </li>
            </ul>
          </nav>
          <main>
            <section>
              <h2>Section Title</h2>
              <p>Some content here</p>
            </section>
          </main>
        </div>
      );

      await testAccessibility(<RealComponent />, axeRules.navigation);

      expect(mockAxe).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        axeRules.navigation
      );
    });

    test("should work with form-related accessibility rules", async () => {
      const mockResults = { violations: [] };
      mockAxe.mockResolvedValue(mockResults);

      const FormComponent = () => (
        <form>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" />
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" />
          <button type="submit">Submit</button>
        </form>
      );

      await testAccessibility(<FormComponent />, axeRules.forms);

      expect(mockAxe).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        axeRules.forms
      );
    });
  });

  describe("testContainerAccessibility", () => {
    test("should test accessibility of a container element", async () => {
      const mockResults = { violations: [] };
      mockAxe.mockResolvedValue(mockResults);

      const container = document.createElement("div");
      container.innerHTML = `
        <h1>Page Title</h1>
        <nav>
          <a href="/home">Home</a>
        </nav>
        <main>
          <form>
            <label for="search">Search:</label>
            <input type="text" id="search" />
            <button type="submit">Search</button>
          </form>
        </main>
      `;

      await testContainerAccessibility(container);

      expect(mockAxe).toHaveBeenCalledWith(container, undefined);
    });

    test("should pass custom options to axe when testing container", async () => {
      const mockResults = { violations: [] };
      mockAxe.mockResolvedValue(mockResults);

      const container = document.createElement("div");
      container.innerHTML = `<button>Click me</button>`;

      const customRules = {
        rules: {
          "button-name": { enabled: true },
          "color-contrast": { enabled: false },
        },
      };

      await testContainerAccessibility(container, customRules);

      expect(mockAxe).toHaveBeenCalledWith(container, customRules);
    });

    test("should work with complex container structures", async () => {
      const mockResults = { violations: [] };
      mockAxe.mockResolvedValue(mockResults);

      const container = document.createElement("div");
      container.innerHTML = `
        <header>
          <h1>Site Title</h1>
          <nav aria-label="Main navigation">
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </nav>
        </header>
        <main>
          <section>
            <h2>Welcome</h2>
            <p>This is the main content area.</p>
            <form>
              <fieldset>
                <legend>Contact Information</legend>
                <label for="fullname">Full Name:</label>
                <input type="text" id="fullname" required />
                <label for="email">Email:</label>
                <input type="email" id="email" required />
              </fieldset>
              <button type="submit">Submit</button>
            </form>
          </section>
        </main>
        <footer>
          <p>&copy; 2024 Test Site</p>
        </footer>
      `;

      await testContainerAccessibility(container);

      expect(mockAxe).toHaveBeenCalledWith(container, undefined);
    });
  });

  describe("axeRules", () => {
    test("should have navigation rules defined", () => {
      expect(axeRules.navigation).toBeDefined();
      expect(axeRules.navigation.rules).toBeDefined();
      expect(axeRules.navigation.rules["landmark-unique"]).toEqual({
        enabled: true,
      });
      expect(axeRules.navigation.rules["link-name"]).toEqual({
        enabled: true,
      });
    });

    test("should have forms rules defined", () => {
      expect(axeRules.forms).toBeDefined();
      expect(axeRules.forms.rules).toBeDefined();
      expect(axeRules.forms.rules["label"]).toEqual({ enabled: true });
      expect(axeRules.forms.rules["form-field-multiple-labels"]).toEqual({
        enabled: true,
      });
    });

    test("should have content rules defined", () => {
      expect(axeRules.content).toBeDefined();
      expect(axeRules.content.rules).toBeDefined();
      expect(axeRules.content.rules["heading-order"]).toEqual({
        enabled: true,
      });
      expect(axeRules.content.rules["page-has-heading-one"]).toEqual({
        enabled: true,
      });
      expect(axeRules.content.rules["color-contrast"]).toEqual({
        enabled: true,
      });
    });

    test("should have interactive rules defined", () => {
      expect(axeRules.interactive).toBeDefined();
      expect(axeRules.interactive.rules).toBeDefined();
      expect(axeRules.interactive.rules["interactive-supports-focus"]).toEqual({
        enabled: true,
      });
      expect(
        axeRules.interactive.rules["click-events-have-key-events"]
      ).toEqual({
        enabled: true,
      });
    });

    test("should allow combining multiple rule sets", () => {
      const combinedRules = {
        ...axeRules.navigation,
        rules: {
          ...axeRules.navigation.rules,
          ...axeRules.forms.rules,
        },
      };

      expect(combinedRules.rules["landmark-unique"]).toEqual({
        enabled: true,
      });
      expect(combinedRules.rules["label"]).toEqual({ enabled: true });
    });
  });

  describe("Integration tests", () => {
    test("should work end-to-end with a complete component", async () => {
      const mockResults = { violations: [] };
      mockAxe.mockResolvedValue(mockResults);

      const CompleteApp = () => (
        <div>
          <header>
            <h1>My Application</h1>
            <nav aria-label="Main navigation">
              <ul>
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/products">Products</a>
                </li>
                <li>
                  <a href="/contact">Contact</a>
                </li>
              </ul>
            </nav>
          </header>
          <main>
            <section>
              <h2>Welcome</h2>
              <p>Welcome to our application!</p>
              <form>
                <fieldset>
                  <legend>Subscribe to newsletter</legend>
                  <label htmlFor="newsletter-email">Email address:</label>
                  <input
                    type="email"
                    id="newsletter-email"
                    required
                    aria-describedby="email-help"
                  />
                  <p id="email-help">
                    We'll never share your email with anyone else.
                  </p>
                </fieldset>
                <button type="submit">Subscribe</button>
              </form>
            </section>
          </main>
          <footer>
            <p>&copy; 2024 My Application. All rights reserved.</p>
          </footer>
        </div>
      );

      const combinedRules = {
        rules: {
          ...axeRules.navigation.rules,
          ...axeRules.forms.rules,
        },
      };

      await testAccessibility(<CompleteApp />, combinedRules);

      expect(mockAxe).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        combinedRules
      );
    });

    test("should handle components with accessibility violations gracefully", async () => {
      const mockResults = {
        violations: [
          {
            id: "color-contrast",
            description:
              "Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds",
            impact: "serious",
            nodes: [],
          },
        ],
      };
      mockAxe.mockResolvedValue(mockResults);

      const BadComponent = () => (
        <div style={{ color: "#ccc", backgroundColor: "#ddd" }}>
          <p>This text has poor contrast</p>
        </div>
      );

      // The function should still complete without throwing
      await testAccessibility(<BadComponent />, axeRules.content);

      expect(mockAxe).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        axeRules.content
      );
    });
  });
});
