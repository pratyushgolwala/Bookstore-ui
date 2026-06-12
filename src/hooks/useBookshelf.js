import { useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadMockBooks, selectBook, clearSelection } from '../store/slices/booksSlice.js';
import { groupBooksByCategory } from '../utils/bookshelfUtils.js';

/**
 * useBookshelf — Custom hook that provides bookshelf data and actions.
 * Loads mock books into Redux on mount if store is empty.
 * Derives category groupings via useMemo for efficient rendering.
 *
 * @returns {{
 *   books: Array,
 *   booksByCategory: Record<string, Array>,
 *   categories: string[],
 *   selectedBook: object|null,
 *   selectBook: (book: object) => void,
 *   clearSelection: () => void,
 *   loading: boolean
 * }}
 */
export default function useBookshelf() {
  const dispatch = useDispatch();

  const books = useSelector((state) => state.books.items);
  const selectedBook = useSelector((state) => state.books.selected);
  const loading = useSelector((state) => state.books.loading);

  // On mount, load mock data into Redux if the store is empty
  useEffect(() => {
    if (books.length === 0) {
      dispatch(loadMockBooks());
    }
  }, [dispatch, books.length]);

  // Derive books grouped by category
  const booksByCategory = useMemo(() => groupBooksByCategory(books), [books]);

  // Derive category list from the grouped object
  const categories = useMemo(() => Object.keys(booksByCategory), [booksByCategory]);

  // Bind actions to dispatch
  const handleSelectBook = useCallback(
    (book) => dispatch(selectBook(book)),
    [dispatch]
  );

  const handleClearSelection = useCallback(
    () => dispatch(clearSelection()),
    [dispatch]
  );

  return {
    books,
    booksByCategory,
    categories,
    selectedBook,
    selectBook: handleSelectBook,
    clearSelection: handleClearSelection,
    loading,
  };
}
