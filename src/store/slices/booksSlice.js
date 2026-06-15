import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { booksService } from '../../services/booksService';
import { parseBooksResponse, normalizeBooks } from '../../utils/bookNormalizer';
import { SHELF_PAGE_SIZE } from '../../utils/bookshelfUtils';
import { MOCK_BOOKS } from '../../data/mockBooks';

/**
 * booksSlice — Manages the paginated book catalog, selection state,
 * search, and graceful fallback to mock data when the API is unreachable.
 */

// Page size matches the 3D shelf capacity so every page fills it exactly.
const DEFAULT_PAGE_SIZE = SHELF_PAGE_SIZE;

const initialPagination = {
  count: 0,
  numPages: 1,
  currentPage: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  hasNext: false,
  hasPrevious: false,
};

const initialState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
  search: '',
  usingMockData: false,
  pagination: initialPagination,
};

/**
 * Fetch a page of books from the API. Falls back to mock data on failure.
 */
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async ({ page = 1, pageSize = DEFAULT_PAGE_SIZE, search = '' } = {}, { rejectWithValue }) => {
    try {
      const envelope = await booksService.getBooks({ page, pageSize, search });
      return parseBooksResponse(envelope);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load books');
    }
  }
);

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
    selectBook(state, action) {
      state.selected = action.payload;
    },
    clearSelection(state) {
      state.selected = null;
    },
    setSearch(state, action) {
      state.search = action.payload;
    },
    /** Load mock books as a fallback / offline mode. */
    loadMockBooks(state) {
      const normalized = normalizeBooks(MOCK_BOOKS);
      state.items = normalized;
      state.usingMockData = true;
      state.pagination = {
        count: normalized.length,
        numPages: 1,
        currentPage: 1,
        pageSize: normalized.length,
        hasNext: false,
        hasPrevious: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.usingMockData = false;
        state.items = action.payload.books;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load books';
        // Graceful fallback to mock data so the shelf is never empty
        if (state.items.length === 0) {
          const normalized = normalizeBooks(MOCK_BOOKS);
          state.items = normalized;
          state.usingMockData = true;
          state.pagination = {
            count: normalized.length,
            numPages: 1,
            currentPage: 1,
            pageSize: normalized.length,
            hasNext: false,
            hasPrevious: false,
          };
        }
      });
  },
});

export const {
  setBooks,
  setSelectedBook,
  selectBook,
  clearSelection,
  setSearch,
  loadMockBooks,
} = booksSlice.actions;

export default booksSlice.reducer;

// Selectors
export const selectBooks = (state) => state.books.items;
export const selectBooksPagination = (state) => state.books.pagination;
export const selectBooksLoading = (state) => state.books.loading;
export const selectSelectedBook = (state) => state.books.selected;
export const selectUsingMockData = (state) => state.books.usingMockData;
