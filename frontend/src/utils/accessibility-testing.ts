import { axe, toHaveNoViolations } from "jest-axe";
import { render } from "@testing-library/react";
import { ReactElement } from "react";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Type for axe configuration options
type AxeOptions = {
  rules?: Record<string, { enabled: boolean }>;
  tags?: string[];
  exclude?: string[];
  include?: string[];
};

/**
 * Test a component for accessibility violations using axe-core
 * @param component - The React component to test
 * @param options - Optional axe configuration
 * @returns Promise that resolves when accessibility testing is complete
 */
export const testAccessibility = async (
  component: ReactElement,
  options?: AxeOptions
): Promise<void> => {
  const { container } = render(component);
  const results = await axe(container, options);
  expect(results).toHaveNoViolations();
};

/**
 * Test a rendered container for accessibility violations
 * @param container - The DOM container to test
 * @param options - Optional axe configuration
 * @returns Promise that resolves when accessibility testing is complete
 */
export const testContainerAccessibility = async (
  container: HTMLElement,
  options?: AxeOptions
): Promise<void> => {
  const results = await axe(container, options);
  expect(results).toHaveNoViolations();
};

/**
 * Common axe-core rules for different types of components
 */
export const axeRules = {
  // For navigation components
  navigation: {
    rules: {
      "landmark-unique": { enabled: true },
      "link-in-text-block": { enabled: true },
      "link-name": { enabled: true },
    },
  },

  // For form components
  forms: {
    rules: {
      label: { enabled: true },
      "form-field-multiple-labels": { enabled: true },
      "input-button-name": { enabled: true },
    },
  },

  // For content components
  content: {
    rules: {
      "heading-order": { enabled: true },
      "page-has-heading-one": { enabled: true },
      "color-contrast": { enabled: true },
    },
  },

  // For interactive components
  interactive: {
    rules: {
      "interactive-supports-focus": { enabled: true },
      "click-events-have-key-events": { enabled: true },
      "mouse-events-have-key-events": { enabled: true },
    },
  },
};
