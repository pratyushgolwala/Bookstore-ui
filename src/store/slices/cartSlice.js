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
  coupon: null, // { code, discount_type, discount_value, discount_amount, min_order, message }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /** Clear the in-memory cart (call on logout). */
    resetCart(state) {
      state.items = [];
      state.error = null;
      state.coupon = null;
    },
    /** Store the validated coupon so it persists across cart → checkout. */
    setCoupon(state, action) {
      state.coupon = action.payload;
    },
    /** Remove any applied coupon. */
    clearCoupon(state) {
      state.coupon = null;
    },
  },
  extraReducers: (builder) => {
    const fulfilled = (state, action) => {
      state.loading = false;
      state.items = action.payload;
      // Drop any applied coupon once the cart is emptied.
      if (action.type === clearCartThunk.fulfilled.type) {
        state.coupon = null;
      }
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

export const { resetCart, setCoupon, clearCoupon } = cartSlice.actions;
export default cartSlice.reducer;

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectCartItems = (state) => state.cart.items;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
export const selectCartCoupon = (state) => state.cart.coupon;

/**
 * Compute the discount amount for an applied coupon against a given subtotal.
 * Re-derives from the coupon's type/value so it stays correct as the cart changes.
 */
export const computeCouponDiscount = (coupon, subtotal) => {
  if (!coupon) return 0;
  const value = parseFloat(coupon.discount_value);
  if (Number.isNaN(value)) return 0;
  if (coupon.discount_type === 'percentage') {
    return +((subtotal * value) / 100).toFixed(2);
  }
  return +Math.min(value, subtotal).toFixed(2);
};
