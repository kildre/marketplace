# How to Add Test Coverage to Uncovered Files

This guide explains how to add test coverage to files currently showing 0% coverage in SonarQube.

---

## Overview

Files with 0% coverage fall into these categories:
1. **Utility Functions** (api-config.ts, types)
2. **Service Classes** (apiService.ts, authService.ts)
3. **React Contexts** (CartContext.tsx, EnhancedMockKeycloakProvider.tsx)
4. **Pages/Components** (auth-status.tsx)

---

## 1. Testing Utility Functions

### Example: `api-config.ts`

**Current Coverage:** 0% (9 uncovered lines)

**Create:** `frontend/src/utils/api-config.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { API_BASE_URL, getApiUrl } from './api-config';

describe('api-config', () => {
  const originalEnv = import.meta.env;

  beforeEach(() => {
    // Reset environment before each test
    vi.stubGlobal('import.meta', {
      env: { ...originalEnv }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getApiUrl', () => {
    it('should return path with leading slash', () => {
      vi.stubGlobal('import.meta', {
        env: { DEV: true, VITE_API_BASE_URL: '' }
      });

      const result = getApiUrl('api/requests');
      expect(result).toBe('/api/requests');
    });

    it('should handle path that already has leading slash', () => {
      vi.stubGlobal('import.meta', {
        env: { DEV: true, VITE_API_BASE_URL: '' }
      });

      const result = getApiUrl('/api/requests');
      expect(result).toBe('/api/requests');
    });

    it('should use API_BASE_URL when provided', () => {
      vi.stubGlobal('import.meta', {
        env: { DEV: false, VITE_API_BASE_URL: 'https://api.example.com' }
      });

      const result = getApiUrl('/api/requests');
      expect(result).toBe('https://api.example.com/api/requests');
    });

    it('should use localhost:3000 in production when API_BASE_URL is empty', () => {
      vi.stubGlobal('import.meta', {
        env: { DEV: false, VITE_API_BASE_URL: '' }
      });

      const result = getApiUrl('/api/requests');
      expect(result).toContain('localhost:3000');
    });
  });
});
```

**Run Tests:**
```bash
cd frontend
npm run test api-config.test
```

---

## 2. Testing Service Classes

### Example: `apiService.ts`

**Current Coverage:** 0% (44 uncovered lines)

**Create:** `frontend/src/services/apiService.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiService } from './apiService';
import { AuthService } from './authService';

// Mock dependencies
vi.mock('./authService');
vi.mock('../utils/api-config', () => ({
  getApiUrl: vi.fn((path: string) => `http://localhost:3000${path}`)
}));

describe('ApiService', () => {
  let apiService: ApiService;
  let mockAuthService: any;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Create mock AuthService instance
    mockAuthService = {
      getToken: vi.fn().mockResolvedValue('mock-token'),
      refreshToken: vi.fn().mockResolvedValue(true),
    };
    
    (AuthService as any).mockImplementation(() => mockAuthService);
    
    apiService = new ApiService();
    
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  describe('submitRequest', () => {
    it('should successfully submit a request', async () => {
      const mockResponse = { requestNumber: 'REQ-123' };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const requestData = {
        requestNumber: '',
        requestorEmail: 'test@example.com',
        designation: 'Engineer',
        agency: 'Test Agency',
        organization: 'Test Org',
        otherOrganization: '',
        pointOfContact: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '123-456-7890',
        estimatedRom: '10000',
        requestedToolName: 'Tool A',
        description: 'Test description',
        cartItems: [{ name: 'Item 1', quantity: 1 }],
      };

      const result = await apiService.submitRequest(requestData);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/submit-request'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          }),
        })
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const requestData = {
        requestNumber: '',
        requestorEmail: 'test@example.com',
        designation: 'Engineer',
        // ... other fields
      };

      await expect(apiService.submitRequest(requestData)).rejects.toThrow('Network error');
    });

    it('should handle 401 unauthorized and retry with refreshed token', async () => {
      // First call returns 401
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        })
        // Second call succeeds
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ requestNumber: 'REQ-123' }),
        });

      const requestData = { /* ... */ };

      const result = await apiService.submitRequest(requestData);

      expect(mockAuthService.refreshToken).toHaveBeenCalled();
      expect(result.requestNumber).toBe('REQ-123');
    });
  });

  describe('getRequests', () => {
    it('should fetch requests successfully', async () => {
      const mockRequests = [
        { id: 1, requestNumber: 'REQ-001' },
        { id: 2, requestNumber: 'REQ-002' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockRequests,
      });

      const result = await apiService.getRequests();

      expect(result).toEqual(mockRequests);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/requests'),
        expect.any(Object)
      );
    });
  });
});
```

---

## 3. Testing React Contexts

### Example: `CartContext.tsx`

**Current Coverage:** 0% (40 uncovered lines)

**Create:** `frontend/src/contexts/CartContext.test.tsx`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import { Product } from '../interfaces';

describe('CartContext', () => {
  const mockProduct1: Product = {
    id: 1,
    name: 'Test Product 1',
    description: 'Description 1',
    price: 100,
    image: 'image1.jpg',
    category: 'Category A',
  };

  const mockProduct2: Product = {
    id: 2,
    name: 'Test Product 2',
    description: 'Description 2',
    price: 200,
    image: 'image2.jpg',
    category: 'Category B',
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  );

  describe('addToCart', () => {
    it('should add product to cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].product).toEqual(mockProduct1);
      expect(result.current.cartItems[0].quantity).toBe(2);
      expect(result.current.cartCount).toBe(1);
    });

    it('should update quantity if product already in cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
        result.current.addToCart(mockProduct1, 3);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].quantity).toBe(5);
    });

    it('should handle multiple different products', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
        result.current.addToCart(mockProduct2, 2);
      });

      expect(result.current.cartItems).toHaveLength(2);
      expect(result.current.cartCount).toBe(2);
    });
  });

  describe('removeFromCart', () => {
    it('should remove product from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
        result.current.removeFromCart(mockProduct1.id);
      });

      expect(result.current.cartItems).toHaveLength(0);
      expect(result.current.cartCount).toBe(0);
    });
  });

  describe('updateCartQuantity', () => {
    it('should update product quantity', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
        result.current.updateCartQuantity(mockProduct1, 5);
      });

      expect(result.current.cartItems[0].quantity).toBe(5);
    });

    it('should remove product if quantity is 0', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
        result.current.updateCartQuantity(mockProduct1, 0);
      });

      expect(result.current.cartItems).toHaveLength(0);
    });
  });

  describe('isProductInCart', () => {
    it('should return true if product is in cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
      });

      expect(result.current.isProductInCart(mockProduct1.id)).toBe(true);
    });

    it('should return false if product is not in cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.isProductInCart(mockProduct1.id)).toBe(false);
    });
  });

  describe('getProductCartQuantity', () => {
    it('should return correct quantity', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 3);
      });

      expect(result.current.getProductCartQuantity(mockProduct1.id)).toBe(3);
    });

    it('should return 0 if product not in cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.getProductCartQuantity(mockProduct1.id)).toBe(0);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
        result.current.addToCart(mockProduct2, 2);
        result.current.clearCart();
      });

      expect(result.current.cartItems).toHaveLength(0);
      expect(result.current.cartCount).toBe(0);
    });
  });

  describe('pendingPriceCount', () => {
    it('should count items with null price', () => {
      const productWithoutPrice: Product = {
        ...mockProduct1,
        price: null,
      };

      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart(productWithoutPrice, 1);
        result.current.addToCart(mockProduct2, 1);
      });

      expect(result.current.pendingPriceCount).toBe(1);
    });
  });
});
```

---

## 4. Testing React Components/Pages

### Example: `auth-status.tsx`

**Current Coverage:** 0% (8 uncovered lines)

**Create:** `frontend/src/pages/auth-status/auth-status.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthStatus from './auth-status';

// Mock useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock useKeycloak hook
vi.mock('../../hooks/useKeycloak', () => ({
  useKeycloak: vi.fn(),
}));

import { useAuth } from '../../hooks/useAuth';
import { useKeycloak } from '../../hooks/useKeycloak';

describe('AuthStatus', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AuthStatus />
      </BrowserRouter>
    );
  };

  it('should display authenticated user information', () => {
    (useAuth as any).mockReturnValue({
      user: { email: 'test@example.com', name: 'Test User' },
      roles: ['REQUESTOR', 'APPROVER'],
      isAuthenticated: true,
    });

    (useKeycloak as any).mockReturnValue({
      keycloak: { token: 'mock-token-123' },
      initialized: true,
    });

    renderComponent();

    expect(screen.getByText(/Authentication Status/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    expect(screen.getByText(/REQUESTOR/i)).toBeInTheDocument();
  });

  it('should display not authenticated message', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      roles: [],
      isAuthenticated: false,
    });

    (useKeycloak as any).mockReturnValue({
      keycloak: null,
      initialized: true,
    });

    renderComponent();

    expect(screen.getByText(/Not Authenticated/i)).toBeInTheDocument();
  });

  it('should display loading state', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      roles: [],
      isAuthenticated: false,
    });

    (useKeycloak as any).mockReturnValue({
      keycloak: null,
      initialized: false,
    });

    renderComponent();

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
});
```

---

## 5. Testing TypeScript Type Files

### Example: `auth.ts` (Type definitions)

**Current Coverage:** 0% (1 uncovered line)

Type-only files don't need tests if they only export types/interfaces. However, if they contain utility functions:

**Create:** `frontend/src/types/auth.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import type { UserRole, AuthUser } from './auth';

describe('auth types', () => {
  it('should validate UserRole type', () => {
    const role: UserRole = 'REQUESTOR';
    expect(role).toBe('REQUESTOR');
  });

  it('should validate AuthUser interface', () => {
    const user: AuthUser = {
      email: 'test@example.com',
      name: 'Test User',
      roles: ['REQUESTOR'],
    };

    expect(user.email).toBe('test@example.com');
    expect(user.roles).toContain('REQUESTOR');
  });
});
```

**Note:** If this file only contains type definitions with no runtime code, SonarQube may be incorrectly reporting it. You can exclude pure type files from coverage.

---

## Quick Start Guide

### 1. Run Tests for a Specific File

```bash
cd frontend
npm run test api-config.test
```

### 2. Run Tests with Coverage

```bash
cd frontend
npm run test:coverage api-config.test
```

### 3. View Coverage Report

```bash
open frontend/coverage/index.html
```

### 4. Run All Tests

```bash
cd frontend
npm run test
```

---

## Coverage Testing Strategy

### Priority Order

1. **High Priority** (Services & Utilities)
   - `apiService.ts` - Core API functionality
   - `authService.ts` - Authentication logic
   - `api-config.ts` - Configuration utilities

2. **Medium Priority** (Contexts)
   - `CartContext.tsx` - State management
   - `EnhancedMockKeycloakProvider.tsx` - Testing utilities

3. **Lower Priority** (Pages/Types)
   - `auth-status.tsx` - Debug/development page
   - `auth.ts` - Type definitions only

### Test Coverage Goals

| File Type | Target Coverage |
|-----------|----------------|
| Services | 90%+ |
| Contexts | 85%+ |
| Utilities | 90%+ |
| Components | 80%+ |
| Types | Can exclude if type-only |

---

## Common Testing Patterns

### Mocking Fetch API

```typescript
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: async () => ({ data: 'mock data' }),
});
```

### Mocking Environment Variables

```typescript
vi.stubGlobal('import.meta', {
  env: { 
    VITE_API_BASE_URL: 'https://api.test.com',
    DEV: false 
  }
});
```

### Testing Async Functions

```typescript
it('should handle async operation', async () => {
  const result = await apiService.getData();
  expect(result).toBeDefined();
});
```

### Testing Error Handling

```typescript
it('should handle errors gracefully', async () => {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
  
  await expect(apiService.getData()).rejects.toThrow('Network error');
});
```

---

## Excluding Files from Coverage

If a file genuinely doesn't need tests (e.g., pure type definitions), update `sonar-project.properties`:

```properties
# Add to exclusions
sonar.exclusions=**/node_modules/**,**/coverage/**,**/dist/**,**/build/**,**/*.test.tsx,**/*.test.ts,**/*.spec.tsx,**/*.spec.ts,**/types/**/*.ts
```

---

## Running Coverage Analysis

### Local Analysis

```bash
# 1. Run tests with coverage
cd frontend
npm run test:coverage

# 2. Check coverage report
open coverage/index.html

# 3. Run SonarQube analysis
cd ..
npm run sonar
```

### Check Specific File Coverage

```bash
# Run coverage for specific file
npm run test:coverage -- api-config

# View results in terminal or browser
open coverage/index.html
```

---

## Tips for Writing Good Tests

### 1. Follow AAA Pattern
- **Arrange:** Set up test data and mocks
- **Act:** Execute the function/component
- **Assert:** Verify expected behavior

### 2. Test Edge Cases
- Empty inputs
- Null/undefined values
- Error conditions
- Boundary values

### 3. Use Descriptive Test Names
```typescript
// ✅ Good
it('should return 401 when token is invalid')

// ❌ Bad
it('test auth')
```

### 4. Keep Tests Independent
- Each test should run in isolation
- Use `beforeEach` to reset state
- Don't rely on test execution order

### 5. Mock External Dependencies
- API calls
- Authentication
- Environment variables
- Third-party libraries

---

## Troubleshooting

### Test Coverage Not Updating

```bash
# Clear cache and re-run
rm -rf frontend/coverage
cd frontend
npm run test:coverage
```

### Mock Not Working

```bash
# Ensure mock is before imports
vi.mock('./authService');  // Must be at top
import { AuthService } from './authService';
```

### Coverage Report Not Generated

```bash
# Check vitest.config.ts has coverage enabled
coverage: {
  enabled: true,
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
}
```

---

## Next Steps

1. **Start with Services**
   - Create `apiService.test.ts`
   - Create `authService.test.ts`

2. **Add Context Tests**
   - Create `CartContext.test.tsx`

3. **Add Utility Tests**
   - Create `api-config.test.ts`

4. **Run Coverage**
   ```bash
   cd frontend
   npm run test:coverage
   ```

5. **Verify in SonarQube**
   ```bash
   cd ..
   npm run sonar
   ```

---

## Resources

- **Vitest Docs:** https://vitest.dev/
- **Testing Library:** https://testing-library.com/
- **React Testing:** https://testing-library.com/docs/react-testing-library/intro/
- **Mocking Guide:** https://vitest.dev/guide/mocking.html

---

**Last Updated:** October 10, 2025
