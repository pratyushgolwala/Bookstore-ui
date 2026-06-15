import { createSlice } from '@reduxjs/toolkit';

/**
 * cartSlice — shopping cart state with quantity controls and persistence.
 */
const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
};

const persist = (items) => {
  try {
    localStorage.setItem('cart', JSON.stringify(items));
  } catch {
    /* ignore */
  }
};

const initialState = {
  items: loadCart(),
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const { id, title, price, quantity = 1, coverImageUrl = '', author = '' } = action.payload;
      const existing = state.items.find((i) => i.id === id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ id, title, price, quantity, coverImageUrl, author });
      }
      persist(state.items);
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      persist(state.items);
    },
    incrementItem(state, action) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.quantity += 1;
      persist(state.items);
    },
    decrementItem(state, action) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== action.payload);
        }
      }
      persist(state.items);
    },
    setQuantity(state, action) {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) item.quantity = Math.max(1, quantity);
      persist(state.items);
    },
    clearCart(state) {
      state.items = [];
      persist(state.items);
    },
  },
});

export const {
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
