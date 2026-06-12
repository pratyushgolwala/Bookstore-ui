import React, { Suspense } from 'react';
import useViewport from '../../hooks/useViewport';
import useBookshelf from '../../hooks/useBookshelf';
import BookshelfErrorBoundary from '../../components/Bookshelf/BookshelfErrorBoundary';
import BookDetailCard from '../../components/Bookshelf/BookDetailCard';
import FallbackGrid from '../../components/FallbackGrid/FallbackGrid';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS } from '../../constants/colors';

const BookshelfScene = React.lazy(() => import('../../components/Bookshelf/BookshelfScene'));

/**
 * BooksPage — The primary interactive bookshelf page.
 * Uses useViewport to decide between 3D scene and fallback 2D grid.
 * Lazy-loads BookshelfScene with Suspense and wraps it in an error boundary.
 * Renders BookDetailCard when a book is selected.
 *
 * Requirements: 2.1, 2.2, 2.3, 6.1, 6.5, 8.1, 8.2
 */
function BooksPage() {
  const { isMobile, hasWebGL } = useViewport();
  const { books, selectedBook, selectBook, clearSelection } = useBookshelf();

  const useFallback = isMobile || !hasWebGL;

  return (
    <div
      className="relative flex flex-col"
      style={{ backgroundColor: COLORS.background, color: COLORS.text.primary, height: 'calc(100vh - 72px)' }}
    >
      <h1 className="text-3xl font-bold px-8 pt-6 pb-2">Books</h1>

      <div className="flex-1 relative min-h-0">
        {useFallback ? (
          <FallbackGrid books={books} onBookSelect={selectBook} />
        ) : (
          <Suspense fallback={<LoadingSpinner />}>
            <BookshelfErrorBoundary books={books} onBookSelect={selectBook}>
              <BookshelfScene
                books={books}
                interactive={true}
                onBookSelect={selectBook}
              />
            </BookshelfErrorBoundary>
          </Suspense>
        )}

        {selectedBook && (
          <BookDetailCard book={selectedBook} onClose={clearSelection} />
        )}
      </div>
    </div>
  );
}

export default BooksPage;
