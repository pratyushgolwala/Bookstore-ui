import { useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchBooks,
  selectBook,
  clearSelection,
  setSearch,
} from '../store/slices/booksSlice.js';
import { groupBooksByCategory } from '../utils/bookshelfUtils.js';

/**
 * useBookshelf — provides paginated bookshelf data and actions.
 *
 * Fetches a page of books from the API on mount and whenever page/search
 * changes. Exposes pagination controls so the 3D shelf can flip through
 * all books in the database.
 */
export default function useBookshelf() {
  const dispatch = useDispatch();

  const books = useSelector((s) => s.books.items);
  const selectedBook = useSelector((s) => s.books.selected);
  const loading = useSelector((s) => s.books.loading);
  const error = useSelector((s) => s.books.error);
  const search = useSelector((s) => s.books.search);
  const usingMockData = useSelector((s) => s.books.usingMockData);
  const pagination = useSelector((s) => s.books.pagination);

  // Fetch the first page on mount
  useEffect(() => {
    dispatch(fetchBooks({ page: 1, search }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const goToPage = useCallback(
    (page) => {
      dispatch(fetchBooks({ page, search }));
    },
    [dispatch, search]
  );

  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      dispatch(fetchBooks({ page: pagination.currentPage + 1, search }));
    }
  }, [dispatch, pagination, search]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrevious) {
      dispatch(fetchBooks({ page: pagination.currentPage - 1, search }));
    }
  }, [dispatch, pagination, search]);

  const runSearch = useCallback(
    (query) => {
      dispatch(setSearch(query));
      dispatch(fetchBooks({ page: 1, search: query }));
    },
    [dispatch]
  );

  const booksByCategory = useMemo(() => groupBooksByCategory(books), [books]);
  const categories = useMemo(() => Object.keys(booksByCategory), [booksByCategory]);

  const handleSelectBook = useCallback((book) => dispatch(selectBook(book)), [dispatch]);
  const handleClearSelection = useCallback(() => dispatch(clearSelection()), [dispatch]);

  return {
    books,
    booksByCategory,
    categories,
    selectedBook,
    selectBook: handleSelectBook,
    clearSelection: handleClearSelection,
    loading,
    error,
    usingMockData,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    runSearch,
    search,
  };
}
