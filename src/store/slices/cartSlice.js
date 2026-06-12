import { createSlice } from '@reduxjs/toolkit';

/**
 * cartSlice — Manages shopping cart state.
 * Supports adding items (with duplicate detection), removing items, and clearing the cart.
 */
const initialState = {
  items:   [],
  loading: false,
  error:   null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const { id, title, price, quantity = 1 } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ id, title, price, quantity });
      }
    },
    removeItem(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
