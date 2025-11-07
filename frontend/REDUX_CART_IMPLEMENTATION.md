# Redux Cart Implementation with Persistence

This document explains the Redux-based shopping cart implementation that provides automatic persistence across browser sessions.

## Overview

The shopping cart state is now managed using Redux with Redux Persist, ensuring that user's cart data survives page refreshes and browser sessions. The implementation maintains the same API as the previous Context-based solution, making the migration seamless.

## Architecture

### Store Structure
```
src/store/
├── index.ts           # Main export file for store components
├── store.ts           # Redux store configuration with persistence
├── cartSlice.ts       # Cart state slice with actions and selectors
└── hooks.ts           # Typed hooks for Redux
```

### Key Components

1. **Redux Store** (`store.ts`)
   - Configured with Redux Persist
   - Uses localStorage for persistence
   - Includes proper middleware for serialization

2. **Cart Slice** (`cartSlice.ts`)
   - Manages cart state using Redux Toolkit
   - Includes actions: `addToCart`, `updateCartQuantity`, `removeFromCart`, `clearCart`
   - Provides selectors for accessing cart data

3. **Redux Cart Context** (`ReduxCartContext.tsx`)
   - Maintains the same API as the original CartContext
   - Acts as a bridge between Redux and React components
   - Ensures seamless migration without changing component code

## Usage

### Basic Cart Operations

```typescript
import { useCart } from '../contexts/ReduxCartContext';

function ProductCard({ product }) {
  const { 
    cartItems, 
    cartCount, 
    addToCart, 
    updateCartQuantity, 
    removeFromCart,
    getProductCartQuantity,
    isProductInCart 
  } = useCart();

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const currentQuantity = getProductCartQuantity(product.id);
  const inCart = isProductInCart(product.id);

  return (
    // Component JSX
  );
}
```

### Direct Redux Usage (Advanced)

If you need direct access to Redux state and actions:

```typescript
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { 
  selectCartItems, 
  selectCartCount, 
  addToCart, 
  updateCartQuantity 
} from '../store/cartSlice';

function AdvancedCartComponent() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const cartCount = useAppSelector(selectCartCount);

  const handleAddProduct = (product: Product, quantity: number) => {
    dispatch(addToCart({ product, quantity }));
  };

  return (
    // Component JSX
  );
}
```

## Persistence Features

### Automatic Persistence
- Cart data is automatically saved to localStorage
- Data persists across browser sessions
- No manual save/load required

### Loading States
The app shows a loading indicator while cart data is being restored from localStorage:

```typescript
<PersistGate loading={<div>Loading cart...</div>} persistor={persistor}>
  <App />
</PersistGate>
```

### Storage Location
Cart data is stored in localStorage under the key `persist:cart`.

## Migration from Context API

The migration maintains full backward compatibility:

### Before (Context API)
```typescript
import { useCart } from '../contexts/CartContext';

function MyComponent() {
  const { cartItems, addToCart } = useCart();
  // Component logic remains the same
}
```

### After (Redux with Context Wrapper)
```typescript
import { useCart } from '../contexts/ReduxCartContext';

function MyComponent() {
  const { cartItems, addToCart } = useCart();
  // Component logic remains exactly the same!
}
```

## State Structure

### Cart Item Interface
```typescript
interface CartItem {
  product: Product;
  quantity: number;
}
```

### Redux State
```typescript
interface CartState {
  items: CartItem[];
}
```

### Available Selectors
- `selectCartItems` - Get all cart items
- `selectCartCount` - Get number of unique products
- `selectPendingPriceCount` - Get count of items with null price
- `selectProductCartQuantity(state, productId)` - Get quantity for specific product
- `selectIsProductInCart(state, productId)` - Check if product is in cart

## Actions

### Adding to Cart
```typescript
dispatch(addToCart({ product, quantity }));
```

### Updating Quantity
```typescript
dispatch(updateCartQuantity({ product, quantity }));
```

### Removing from Cart
```typescript
dispatch(removeFromCart(productId));
```

### Clearing Cart
```typescript
dispatch(clearCart());
```

## Testing

The Redux implementation includes comprehensive tests and maintains compatibility with existing tests. The test utilities have been updated to use Redux providers:

```typescript
// test-utils.tsx now includes Redux providers
function Wrapper({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ThemeProvider theme={testTheme}>
              <ReduxCartProvider>{children}</ReduxCartProvider>
            </ThemeProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
```

## Performance Considerations

### Benefits
- **Centralized State**: Single source of truth for cart data
- **Persistence**: Automatic data persistence across sessions
- **DevTools**: Redux DevTools support for debugging
- **Immutable Updates**: Prevents accidental state mutations
- **Type Safety**: Full TypeScript support

### Optimizations
- Redux Persist only persists when state changes
- Selectors prevent unnecessary re-renders
- Memoized selectors for computed values

## Debugging

### Redux DevTools
Install the Redux DevTools browser extension to inspect:
- State changes over time
- Action dispatching
- Time-travel debugging

### Persistence Debugging
Check localStorage in browser DevTools:
- Key: `persist:cart`
- Contains serialized cart state

### Console Debugging
The store is available in development for debugging:
```javascript
// In browser console
window.__REDUX_STORE__ // If configured
```

## Configuration

### Persistence Configuration
The persistence can be customized in `store.ts`:

```typescript
const cartPersistConfig: PersistConfig<ReturnType<typeof cartReducer>> = {
  key: 'cart',
  storage,
  // Add whitelist to only persist specific fields
  whitelist: ['items'],
  // Add blacklist to exclude specific fields
  // blacklist: ['temporaryData'],
};
```

### Storage Backends
Redux Persist supports different storage backends:
- `localStorage` (default, web)
- `sessionStorage` (web)
- `AsyncStorage` (React Native)

## Error Handling

The implementation includes error handling for:
- Storage quota exceeded
- JSON parse errors during rehydration
- Network connectivity issues

Errors are logged to console and fallback to empty cart state.

## Future Enhancements

Potential improvements for the cart system:
- Server-side cart synchronization
- Cart sharing between devices
- Cart analytics and metrics
- Undo/redo functionality
- Cart templates and favorites