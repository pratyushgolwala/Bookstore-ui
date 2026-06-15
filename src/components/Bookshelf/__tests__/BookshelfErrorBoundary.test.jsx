import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import React from 'react';
import BookshelfErrorBoundary from '../BookshelfErrorBoundary';
import cartReducer from '../../../store/slices/cartSlice';
import authReducer from '../../../store/slices/authSlice';

// A child component that throws an error on render
function ThrowingChild() {
  throw new Error('3D rendering failed');
}

// A child component that renders normally
function HappyChild() {
  return <div data-testid="happy-child">All good</div>;
}

const mockBooks = [
  {
    id: 'b1',
    title: 'Test Book',
    author: 'Test Author',
    price: 9.99,
    coverImageUrl: 'https://picsum.photos/seed/test/200/300',
    category: 'Fiction',
    pageCount: 200,
  },
];

/** Render helper that wraps children in a Redux Provider (BookCard needs it). */
function renderWithStore(ui) {
  const store = configureStore({
    reducer: {
      cart: cartReducer,
      auth: authReducer,
    },
  });
  return render(<Provider store={store}>{ui}</Provider>);
}

describe('BookshelfErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error output during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when there is no error', () => {
    renderWithStore(
      <BookshelfErrorBoundary books={mockBooks} onBookSelect={() => {}}>
        <HappyChild />
      </BookshelfErrorBoundary>
    );

    expect(screen.getByTestId('happy-child')).toBeInTheDocument();
  });

  it('renders FallbackGrid when a child throws an error', () => {
    renderWithStore(
      <BookshelfErrorBoundary books={mockBooks} onBookSelect={() => {}}>
        <ThrowingChild />
      </BookshelfErrorBoundary>
    );

    // FallbackGrid renders a region labeled "Book catalog"
    expect(screen.getByRole('region', { name: 'Book catalog' })).toBeInTheDocument();
    // Should show the book from mockBooks
    expect(screen.getByText('Test Book')).toBeInTheDocument();
  });

  it('logs the error to console.error', () => {
    renderWithStore(
      <BookshelfErrorBoundary books={mockBooks} onBookSelect={() => {}}>
        <ThrowingChild />
      </BookshelfErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'BookshelfErrorBoundary caught an error:',
      expect.any(Error),
      expect.anything()
    );
  });

  it('passes onBookSelect to FallbackGrid on error', () => {
    const onBookSelect = vi.fn();

    renderWithStore(
      <BookshelfErrorBoundary books={mockBooks} onBookSelect={onBookSelect}>
        <ThrowingChild />
      </BookshelfErrorBoundary>
    );

    // Click the book card (title text) in the fallback grid
    screen.getByText('Test Book').click();

    expect(onBookSelect).toHaveBeenCalledWith(mockBooks[0]);
  });
});

