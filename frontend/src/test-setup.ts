import "@testing-library/jest-dom";
import { toHaveNoViolations } from 'jest-axe';
import { vi } from 'vitest';

// Note: Test environment variables are now set in vite.config.ts
// This ensures VITE_BYPASS_AUTH is properly set for all tests

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
