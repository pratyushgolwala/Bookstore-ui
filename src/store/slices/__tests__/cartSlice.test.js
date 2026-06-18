import { describe, it, expect } from 'vitest';
import cartReducer, {
  resetCart,
  fetchCart,
  addToCart,
  removeCartItem,
  clearCartThunk,
  selectCartCount,
  selectCartTotal,
} from '../cartSlice';

/**
 * The cart is now backed by the Django cart API: thunks call the backend and
 * store the returned (normalized) items. These tests exercise the reducer's
 * handling of thunk lifecycle actions and the selectors, without hitting the
 * network.
 */
describe('cartSlice (backend-backed)', () => {
  const initialState = { items: [], loading: false, error: null };

  // The backend returns line items; the slice normalizes cover_url -> coverImageUrl.
  const backendItems = [
    { id: 'item1', book_id: 'b1', title: 'Dune', author: 'Frank Herbert', coverImageUrl: '', price: 12.99, quantity: 2, subtotal: 25.98 },
  ];

  it('sets loading on a pending fetch', () => {
    const state = cartReducer(initialState, { type: fetchCart.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('stores items returned by a fulfilled fetch', () => {
    const state = cartReducer(initialState, {
      type: fetchCart.fulfilled.type,
      payload: backendItems,
    });
    expect(state.loading).toBe(false);
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({ id: 'item1', book_id: 'b1', quantity: 2 });
  });

  it('replaces items with the cart returned after add', () => {
    const state = cartReducer(initialState, {
      type: addToCart.fulfilled.type,
      payload: backendItems,
    });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].title).toBe('Dune');
  });

  it('reflects the emptied cart after remove/clear', () => {
    const withItems = { ...initialState, items: backendItems };
    const afterRemove = cartReducer(withItems, {
      type: removeCartItem.fulfilled.type,
      payload: [],
    });
    expect(afterRemove.items).toHaveLength(0);

    const afterClear = cartReducer(withItems, {
      type: clearCartThunk.fulfilled.type,
      payload: [],
    });
    expect(afterClear.items).toHaveLength(0);
  });

  it('records an error on a rejected thunk', () => {
    const state = cartReducer(initialState, {
      type: addToCart.rejected.type,
      payload: 'Out of stock',
    });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Out of stock');
  });

  it('resetCart empties the in-memory cart', () => {
    const withItems = { ...initialState, items: backendItems };
    const state = cartReducer(withItems, resetCart());
    expect(state.items).toHaveLength(0);
  });

  describe('selectors', () => {
    const state = { cart: { items: backendItems, loading: false, error: null } };
    it('selectCartCount sums quantities', () => {
      expect(selectCartCount(state)).toBe(2);
    });
    it('selectCartTotal sums price * quantity', () => {
      expect(selectCartTotal(state)).toBeCloseTo(25.98);
    });
  });
});
