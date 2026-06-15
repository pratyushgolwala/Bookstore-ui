import { describe, it, expect } from 'vitest';
import booksReducer, {
  selectBook,
  clearSelection,
  loadMockBooks,
  setBooks,
  setSelectedBook,
} from '../booksSlice';

describe('booksSlice', () => {
  const initialState = {
    items: [],
    selected: null,
    loading: false,
    error: null,
    search: '',
    usingMockData: false,
    pagination: {
      count: 0,
      numPages: 1,
      currentPage: 1,
      pageSize: 24,
      hasNext: false,
      hasPrevious: false,
    },
  };

  describe('basic reducers', () => {
    it('setBooks sets items', () => {
      const books = [{ id: '1', title: 'Test' }];
      const state = booksReducer(initialState, setBooks(books));
      expect(state.items).toEqual(books);
    });

    it('setSelectedBook sets selected', () => {
      const book = { id: '1', title: 'Test' };
      const state = booksReducer(initialState, setSelectedBook(book));
      expect(state.selected).toEqual(book);
    });
  });

  describe('selectBook', () => {
    it('sets selected to the provided book object', () => {
      const book = { id: 'b1', title: 'Dune', author: 'Frank Herbert' };
      const state = booksReducer(initialState, selectBook(book));
      expect(state.selected).toEqual(book);
    });

    it('replaces previously selected book', () => {
      const book1 = { id: 'b1', title: 'Dune' };
      const book2 = { id: 'b2', title: 'Neuromancer' };
      let state = booksReducer(initialState, selectBook(book1));
      state = booksReducer(state, selectBook(book2));
      expect(state.selected).toEqual(book2);
    });
  });

  describe('clearSelection', () => {
    it('sets selected to null', () => {
      const stateWithSelection = {
        ...initialState,
        selected: { id: 'b1', title: 'Dune' },
      };
      const state = booksReducer(stateWithSelection, clearSelection());
      expect(state.selected).toBeNull();
    });

    it('is a no-op when selected is already null', () => {
      const state = booksReducer(initialState, clearSelection());
      expect(state.selected).toBeNull();
    });
  });

  describe('loadMockBooks', () => {
    it('populates normalized mock books and flags usingMockData', () => {
      const state = booksReducer(initialState, loadMockBooks());
      expect(state.items.length).toBeGreaterThanOrEqual(20);
      expect(state.usingMockData).toBe(true);
      // Normalized books expose a coverImageUrl and numeric price
      expect(state.items[0]).toHaveProperty('coverImageUrl');
      expect(typeof state.items[0].price).toBe('number');
    });

    it('sets pagination metadata for the mock set', () => {
      const state = booksReducer(initialState, loadMockBooks());
      expect(state.pagination.count).toBe(state.items.length);
      expect(state.pagination.hasNext).toBe(false);
    });
  });
});
