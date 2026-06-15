import { createSlice } from '@reduxjs/toolkit';

/**
 * cartSlice — per-user shopping cart with quantity controls and persistence.
 *
 * Each user's cart is stored under its own localStorage key: `cart:<userId>`.
 * A guest (logged-out) cart lives under `cart:guest`. On login we hydrate the
 * user's cart; on logout we clear the in-memory cart (the persisted copy stays
 * so it's there next time they log in).
 */

const keyFor = (userId) => `cart:${userId || 'guest'}`;

const loadCart = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(keyFor(userId)) || '[]');
  } catch {
    return [];
  }
};

const persist = (userId, items) => {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(items));
  } catch {
    /* ignore */
  }
};

// Determine the current user id from persisted auth (set by authSlice)
const currentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user?.id || null;
  } catch {
    return null;
  }
};

const initialUserId = currentUserId();

const initialState = {
  userId: initialUserId,
  items: loadCart(initialUserId),
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /** Load a specific user's cart into memory (call on login). */
    hydrateCart(state, action) {
      const userId = action.payload || null;
      state.userId = userId;
      state.items = loadCart(userId);
    },
    /** Clear the in-memory cart (call on logout). Persisted copy is untouched. */
    resetCart(state) {
      state.userId = null;
      state.items = [];
    },
    addItem(state, action) {
      const { id, title, price, quantity = 1, coverImageUrl = '', author = '' } = action.payload;
      const existing = state.items.find((i) => i.id === id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ id, title, price, quantity, coverImageUrl, author });
      }
      persist(state.userId, state.items);
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      persist(state.userId, state.items);
    },
    incrementItem(state, action) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.quantity += 1;
      persist(state.userId, state.items);
    },
    decrementItem(state, action) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== action.payload);
        }
      }
      persist(state.userId, state.items);
    },
    setQuantity(state, action) {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) item.quantity = Math.max(1, quantity);
      persist(state.userId, state.items);
    },
    clearCart(state) {
      state.items = [];
      persist(state.userId, state.items);
    },
  },
});

export const {
  hydrateCart,
  resetCart,
  addItem,
  removeItem,
  incrementItem,
  decrementItem,
  setQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
