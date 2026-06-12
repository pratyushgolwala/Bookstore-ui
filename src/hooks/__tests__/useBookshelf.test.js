import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import React from 'react';
import booksReducer from '../../store/slices/booksSlice';
import useBookshelf from '../useBookshelf';
import { MOCK_BOOKS } from '../../data/mockBooks';

/**
 * Creates a test wrapper with a fresh Redux store.
 * @param {object} preloadedState - Optional initial state for the books slice
 */
function createWrapper(preloadedState = {}) {
  const store = configureStore({
    reducer: { books: booksReducer },
    preloadedState: { books: { items: [], selected: null, loading: false, error: null, ...preloadedState } },
  });

  return function Wrapper({ children }) {
    return React.createElement(Provider, { store }, children);
  };
}

describe('useBookshelf', () => {
  it('loads mock books on mount when store is empty', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBookshelf(), { wrapper });

    expect(result.current.books.length).toBeGreaterThan(0);
    expect(result.current.books).toEqual(MOCK_BOOKS);
  });

  it('does not reload if store already has books', () => {
    const existingBooks = [{ id: '1', title: 'Test', author: 'Author', price: 9.99, coverImageUrl: '', category: 'Fiction', pageCount: 100 }];
    const wrapper = createWrapper({ items: existingBooks });
    const { result } = renderHook(() => useBookshelf(), { wrapper });

    expect(result.current.books).toEqual(existingBooks);
    expect(result.current.books.length).toBe(1);
  });

  it('derives booksByCategory from books', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBookshelf(), { wrapper });

    const { booksByCategory } = result.current;
    // booksByCategory should be an object with category keys
    expect(typeof booksByCategory).toBe('object');
    // Total books across all categories should equal the books array length
    const totalGrouped = Object.values(booksByCategory).flat().length;
    expect(totalGrouped).toBe(result.current.books.length);
  });

  it('derives categories from booksByCategory keys', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBookshelf(), { wrapper });

    const { categories, booksByCategory } = result.current;
    expect(categories).toEqual(Object.keys(booksByCategory));
    expect(categories.length).toBeGreaterThan(0);
  });

  it('selectBook updates selectedBook', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBookshelf(), { wrapper });

    const bookToSelect = result.current.books[0];
    act(() => {
      result.current.selectBook(bookToSelect);
    });

    expect(result.current.selectedBook).toEqual(bookToSelect);
  });

  it('clearSelection sets selectedBook to null', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBookshelf(), { wrapper });

    // Select a book first
    act(() => {
      result.current.selectBook(result.current.books[0]);
    });
    expect(result.current.selectedBook).not.toBeNull();

    // Clear selection
    act(() => {
      result.current.clearSelection();
    });
    expect(result.current.selectedBook).toBeNull();
  });

  it('exposes loading state from Redux', () => {
    const wrapper = createWrapper({ loading: true });
    const { result } = renderHook(() => useBookshelf(), { wrapper });

    expect(result.current.loading).toBe(true);
  });
});
