import "@testing-library/jest-dom";
import { toHaveNoViolations } from 'jest-axe';

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
