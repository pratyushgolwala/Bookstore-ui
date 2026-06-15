import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import React from 'react';
import booksReducer from '../../store/slices/booksSlice';
import useBookshelf from '../useBookshelf';

// Mock the books service so the mount fetch resolves deterministically.
vi.mock('../../services/booksService', () => ({
  booksService: {
    getBooks: vi.fn(() =>
      Promise.resolve({
        status: { success: true },
        data: {
          results: [
            {
              id: '1',
              title: 'Test Book',
              author: 'Author',
              price: '9.99',
              cover_url: '',
              published_year: 2000,
              language: 'en',
            },
          ],
          count: 1,
          num_pages: 1,
          current_page: 1,
          page_size: 24,
          has_next: false,
          has_previous: false,
        },
      })
    ),
  },
}));

function createWrapper(preloadedItems = []) {
  const store = configureStore({
    reducer: { books: booksReducer },
    preloadedState: {
      books: {
        items: preloadedItems,
        selected: null,
        loading: false,
        error: null,
        search: '',
        usingMockData: false,
        pagination: {
          count: preloadedItems.length,
          numPages: 1,
          currentPage: 1,
          pageSize: 24,
          hasNext: false,
          hasPrevious: false,
        },
      },
    },
  });
  return function Wrapper({ children }) {
    return React.createElement(Provider, { store }, children);
  };
}

describe('useBookshelf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches books from the API on mount', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBookshelf(), { wrapper });

    await waitFor(() => {
      expect(result.current.books.length).toBeGreaterThan(0);
    });
    expect(result.current.books[0].title).toBe('Test Book');
  });

  it('derives booksByCategory and categories from books', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBookshelf(), { wrapper });

    await waitFor(() => expect(result.current.books.length).toBeGreaterThan(0));

    const totalGrouped = Object.values(result.current.booksByCategory).flat().length;
    expect(totalGrouped).toBe(result.current.books.length);
    expect(result.current.categories).toEqual(Object.keys(result.current.booksByCategory));
  });

  it('selectBook and clearSelection update selectedBook', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBookshelf(), { wrapper });

    await waitFor(() => expect(result.current.books.length).toBeGreaterThan(0));

    act(() => result.current.selectBook(result.current.books[0]));
    expect(result.current.selectedBook).not.toBeNull();

    act(() => result.current.clearSelection());
    expect(result.current.selectedBook).toBeNull();
  });

  it('exposes pagination metadata', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBookshelf(), { wrapper });

    await waitFor(() => expect(result.current.pagination.count).toBeGreaterThan(0));
    expect(result.current.pagination).toHaveProperty('hasNext');
    expect(result.current.pagination).toHaveProperty('currentPage');
  });
});
