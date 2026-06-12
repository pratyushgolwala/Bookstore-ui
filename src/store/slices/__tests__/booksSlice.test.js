import { describe, it, expect } from 'vitest';
import booksReducer, {
  selectBook,
  clearSelection,
  loadMockBooks,
  setBooks,
  setSelectedBook,
  setLoading,
  setError,
} from '../booksSlice';
import { MOCK_BOOKS } from '../../../data/mockBooks';

describe('booksSlice', () => {
  const initialState = {
    items: [],
    selected: null,
    loading: false,
    error: null,
  };

  describe('existing reducers still work', () => {
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

    it('setLoading sets loading', () => {
      const state = booksReducer(initialState, setLoading(true));
      expect(state.loading).toBe(true);
    });

    it('setError sets error', () => {
      const state = booksReducer(initialState, setError('Something went wrong'));
      expect(state.error).toBe('Something went wrong');
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
    it('populates items from MOCK_BOOKS when items array is empty', () => {
      const state = booksReducer(initialState, loadMockBooks());
      expect(state.items).toEqual(MOCK_BOOKS);
      expect(state.items.length).toBeGreaterThanOrEqual(20);
    });

    it('does not overwrite items if already populated', () => {
      const existingBooks = [{ id: 'x1', title: 'Existing Book' }];
      const stateWithBooks = { ...initialState, items: existingBooks };
      const state = booksReducer(stateWithBooks, loadMockBooks());
      expect(state.items).toEqual(existingBooks);
    });
  });
});
