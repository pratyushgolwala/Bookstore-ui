import { describe, it, expect } from 'vitest';
import cartReducer, { addItem, removeItem, clearCart } from '../cartSlice';

describe('cartSlice', () => {
  const initialState = { items: [], loading: false, error: null };

  describe('addItem', () => {
    it('adds a new item with id, title, price, and quantity', () => {
      const payload = { id: 'b1', title: 'Dune', price: 12.99, quantity: 1 };
      const state = cartReducer(initialState, addItem(payload));

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toMatchObject({ id: 'b1', title: 'Dune', price: 12.99, quantity: 1 });
    });

    it('defaults quantity to 1 when not provided', () => {
      const payload = { id: 'b2', title: 'Neuromancer', price: 9.99 };
      const state = cartReducer(initialState, addItem(payload));

      expect(state.items[0].quantity).toBe(1);
    });

    it('increments quantity for duplicate items (same id)', () => {
      const firstAdd = cartReducer(initialState, addItem({ id: 'b1', title: 'Dune', price: 12.99, quantity: 1 }));
      const secondAdd = cartReducer(firstAdd, addItem({ id: 'b1', title: 'Dune', price: 12.99, quantity: 2 }));

      expect(secondAdd.items).toHaveLength(1);
      expect(secondAdd.items[0].quantity).toBe(3);
    });

    it('adds multiple distinct items separately', () => {
      let state = cartReducer(initialState, addItem({ id: 'b1', title: 'Dune', price: 12.99, quantity: 1 }));
      state = cartReducer(state, addItem({ id: 'b2', title: 'Neuromancer', price: 9.99, quantity: 1 }));

      expect(state.items).toHaveLength(2);
      expect(state.items[0].id).toBe('b1');
      expect(state.items[1].id).toBe('b2');
    });
  });

  describe('removeItem', () => {
    it('removes an item by id', () => {
      const stateWithItem = { ...initialState, items: [{ id: 'b1', title: 'Dune', price: 12.99, quantity: 1 }] };
      const state = cartReducer(stateWithItem, removeItem('b1'));

      expect(state.items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('removes all items', () => {
      const stateWithItems = {
        ...initialState,
        items: [
          { id: 'b1', title: 'Dune', price: 12.99, quantity: 1 },
          { id: 'b2', title: 'Neuromancer', price: 9.99, quantity: 2 },
        ],
      };
      const state = cartReducer(stateWithItems, clearCart());

      expect(state.items).toHaveLength(0);
    });
  });
});
