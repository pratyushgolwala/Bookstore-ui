import { createSlice } from '@reduxjs/toolkit';

/**
 * wishlistSlice — per-user wishlist with localStorage persistence.
 *
 * Stored under `wishlist:<userId>` (guests use `wishlist:guest`).
 * Hydrated on login, reset on logout — same pattern as cartSlice.
 */

const keyFor = (userId) => `wishlist:${userId || 'guest'}`;

const load = (userId) => {
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
  items: load(initialUserId),
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    hydrateWishlist(state, action) {
      const userId = action.payload || null;
      state.userId = userId;
      state.items = load(userId);
    },
    resetWishlist(state) {
      state.userId = null;
      state.items = [];
    },
    /** Add a book if not already present. */
    addToWishlist(state, action) {
      const book = action.payload;
      if (!state.items.find((i) => i.id === book.id)) {
        state.items.push({
          id: book.id,
          title: book.title,
          author: book.author || '',
          price: book.price,
          coverImageUrl: book.coverImageUrl || '',
          category: book.category || '',
        });
        persist(state.userId, state.items);
      }
    },
    removeFromWishlist(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      persist(state.userId, state.items);
    },
    /** Add if absent, remove if present. Returns nothing; check via selector. */
    toggleWishlist(state, action) {
      const book = action.payload;
      const exists = state.items.find((i) => i.id === book.id);
      if (exists) {
        state.items = state.items.filter((i) => i.id !== book.id);
      } else {
        state.items.push({
          id: book.id,
          title: book.title,
          author: book.author || '',
          price: book.price,
          coverImageUrl: book.coverImageUrl || '',
          category: book.category || '',
        });
      }
      persist(state.userId, state.items);
    },
    clearWishlist(state) {
      state.items = [];
      persist(state.userId, state.items);
    },
  },
});

export const {
  hydrateWishlist,
  resetWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;

// Selectors
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const selectIsWishlisted = (id) => (state) =>
  state.wishlist.items.some((i) => i.id === id);
