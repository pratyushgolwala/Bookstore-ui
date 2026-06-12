import { createSlice } from '@reduxjs/toolkit';
import { MOCK_BOOKS } from '../../data/mockBooks';

/**
 * booksSlice — Manages the book catalog, selection state, and mock data loading.
 * TODO: Add async thunks for fetchBooks, fetchBookById, searchBooks.
 */
const initialState = {
  items:    [],
  selected: null,
  loading:  false,
  error:    null,
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setBooks(state, action) {
      state.items = action.payload;
    },
    setSelectedBook(state, action) {
      state.selected = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    /**
     * Select a book for the detail card.
     * @param {object} action.payload - The book object to select
     */
    selectBook(state, action) {
      state.selected = action.payload;
    },
    /**
     * Clear the current book selection.
     */
    clearSelection(state) {
      state.selected = null;
    },
    /**
     * Load mock books into the store if items array is empty.
     * Used to populate the bookshelf until backend integration.
     */
    loadMockBooks(state) {
      if (state.items.length === 0) {
        state.items = MOCK_BOOKS;
      }
    },
  },
});

export const {
  setBooks,
  setSelectedBook,
  setLoading,
  setError,
  selectBook,
  clearSelection,
  loadMockBooks,
} = booksSlice.actions;
export default booksSlice.reducer;
