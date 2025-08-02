import "@testing-library/jest-dom";
import { toHaveNoViolations } from 'jest-axe';
import { vi } from 'vitest';

// Set test environment variables to ensure mock authentication is used
Object.defineProperty(import.meta, 'env', {
  value: {
    ...import.meta.env,
    VITE_BYPASS_AUTH: "true",
    VITE_MOCK_USER_ID: "testuser",
    VITE_MOCK_USERNAME: "testuser",
    VITE_MOCK_USER_EMAIL: "test@advana.mil",
    VITE_MOCK_USER_FIRST_NAME: "Test",
    VITE_MOCK_USER_LAST_NAME: "User",
    VITE_MOCK_USER_ROLES: "marketplace-requestor",
    DEV: true
  },
  writable: true
});

// Extend Jest matchers for accessibility testing
expect.extend(toHaveNoViolations);

// Mock HTMLCanvasElement.getContext to prevent axe-core canvas errors
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => {
    return {
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4)
      })),
      canvas: {
        width: 1,
        height: 1
      }
    };
  }),
  writable: true
});
