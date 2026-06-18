import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../services/cartService';

/**
 * cartSlice — the authenticated user's cart, backed by the Django cart API.
 *
 * This is the single source of truth shared with the AI assistant, which
 * writes to the same /api/cart/ endpoints. (Previously the cart lived only in
 * localStorage, so the assistant's changes never showed up in the UI.)
 *
 * Item shape (normalized from the backend serializer):
 *   { id, book_id, title, author, coverImageUrl, price, quantity, subtotal }
 *   - `id`      is the CART-ITEM id (used for increment/decrement/remove)
 *   - `book_id` is the Book's id (used for add)
 */

// ── Helpers ──────────────────────────────────────────────────────────────

/** Unwrap the backend envelope ({ status, data }) to the cart payload. */
const unwrapCart = (res) => res?.data ?? res ?? {};

/** Normalize a backend cart item to the shape the UI components expect. */
const normalizeItem = (it) => ({
  id: it.id,                 // cart-item id
  book_id: it.book_id,
  title: it.title,
  author: it.author || '',
  coverImageUrl: it.cover_url || '',
  price: typeof it.price === 'string' ? parseFloat(it.price) : (it.price ?? 0),
  quantity: it.quantity ?? 1,
  subtotal:
    typeof it.subtotal === 'string' ? parseFloat(it.subtotal) : (it.subtotal ?? 0),
});

const itemsFromResponse = (res) => {
  const cart = unwrapCart(res);
  return Array.isArray(cart.items) ? cart.items.map(normalizeItem) : [];
};

// ── Thunks ───────────────────────────────────────────────────────────────

export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return itemsFromResponse(await cartService.getCart());
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const addToCart = createAsyncThunk(
  'cart/add',
  async ({ bookId, quantity = 1 }, { rejectWithValue }) => {
    try {
      return itemsFromResponse(await cartService.addItem(bookId, quantity));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const incrementCartItem = createAsyncThunk(
  'cart/increment',
  async (itemId, { rejectWithValue }) => {
    try {
      return itemsFromResponse(await cartService.incrementItem(itemId));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const decrementCartItem = createAsyncThunk(
  'cart/decrement',
  async (itemId, { rejectWithValue }) => {
    try {
      return itemsFromResponse(await cartService.decrementItem(itemId));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const setCartItemQuantity = createAsyncThunk(
  'cart/setQuantity',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      return itemsFromResponse(await cartService.setQuantity(itemId, quantity));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const removeCartItem = createAsyncThunk(
  'cart/remove',
  async (itemId, { rejectWithValue }) => {
    try {
      return itemsFromResponse(await cartService.removeItem(itemId));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const clearCartThunk = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      return itemsFromResponse(await cartService.clearCart());
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// ── Slice ────────────────────────────────────────────────────────────────

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /** Clear the in-memory cart (call on logout). */
    resetCart(state) {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const fulfilled = (state, action) => {
      state.loading = false;
      state.items = action.payload;
    };
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Cart request failed.';
    };

    [
      fetchCart,
      addToCart,
      incrementCartItem,
      decrementCartItem,
      setCartItemQuantity,
      removeCartItem,
      clearCartThunk,
    ].forEach((thunk) => {
      builder
        .addCase(thunk.pending, pending)
        .addCase(thunk.fulfilled, fulfilled)
        .addCase(thunk.rejected, rejected);
    });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectCartItems = (state) => state.cart.items;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
