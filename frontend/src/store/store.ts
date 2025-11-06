import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { PersistConfig, persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import cartReducer from './cartSlice';

// Define the root state type
export type RootState = {
  cart: ReturnType<typeof cartReducer>;
};

// Persist configuration for the cart (user-specific key will be set by middleware)
const cartPersistConfig: PersistConfig<ReturnType<typeof cartReducer>> = {
  key: 'cart',
  storage,
};

// Create persisted reducers
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

// Combine reducers
const rootReducer = combineReducers({
  cart: persistedCartReducer,
});

// Configure the store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create the persistor
export const persistor = persistStore(store);

// Define dispatch type
export type AppDispatch = typeof store.dispatch;