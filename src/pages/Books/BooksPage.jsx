import React, { Suspense, useState } from 'react';
import { LayoutGrid, Box, BookMarked, AlertCircle } from 'lucide-react';
import useViewport from '../../hooks/useViewport';
import useBookshelf from '../../hooks/useBookshelf';
import BookshelfErrorBoundary from '../../components/Bookshelf/BookshelfErrorBoundary';
import BookDetailCard from '../../components/Bookshelf/BookDetailCard';
import FallbackGrid from '../../components/FallbackGrid/FallbackGrid';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import Badge from '../../components/ui/Badge';
import COLORS from '../../constants/colors';

const BookshelfScene = React.lazy(() => import('../../components/Bookshelf/BookshelfScene'));

/**
 * BooksPage — browse the full catalog as an interactive 3D bookshelf or a
 * responsive grid. Paginated through all books in the database, with search.
 */
function BooksPage() {
  const { isMobile, hasWebGL } = useViewport();
  const {
    books,
    selectedBook,
    selectBook,
    clearSelection,
    loading,
    error,
    usingMockData,
    pagination,
    goToPage,
    runSearch,
    search,
  } = useBookshelf();

  // Default to grid on mobile / no WebGL, otherwise 3D shelf
  const [viewMode, setViewMode] = useState(isMobile || !hasWebGL ? 'grid' : 'shelf');
  const effectiveView = isMobile || !hasWebGL ? 'grid' : viewMode;

  return (
    <div
      className="relative flex flex-col"
      style={{ backgroundColor: COLORS.background, color: COLORS.text.primary, minHeight: 'calc(100vh - 72px)' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b backdrop-blur"
        style={{ backgroundColor: `${COLORS.background}e6`, borderColor: COLORS.border }}
      >
        <div className="flex items-center gap-3">
          <BookMarked style={{ color: COLORS.secondary[500] }} size={26} />
          <div>
            <h1 className="text-2xl font-bold leading-none">The Library</h1>
            <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
              {pagination.count.toLocaleString()} books
              {usingMockData && ' (offline sample)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onSearch={runSearch} />

          {!isMobile && hasWebGL && (
            <div
              className="flex items-center rounded-lg p-1"
              style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
            >
              <ToggleBtn
                active={effectiveView === 'shelf'}
                onClick={() => setViewMode('shelf')}
                icon={<Box size={16} />}
                label="3D"
              />
              <ToggleBtn
                active={effectiveView === 'grid'}
                onClick={() => setViewMode('grid')}
                icon={<LayoutGrid size={16} />}
                label="Grid"
              />
            </div>
          )}
        </div>
      </div>

      {/* Offline / error banner */}
      {usingMockData && (
        <div
          className="px-6 py-2 flex items-center gap-2 text-sm"
          style={{ backgroundColor: `${COLORS.warning}1a`, color: COLORS.warning }}
        >
          <AlertCircle size={16} />
          Showing offline sample data — the catalog API is unreachable.
        </div>
      )}

      {/* Content */}
      <div className="flex-1 relative min-h-0">
        {effectiveView === 'shelf' ? (
          <div className="relative" style={{ height: 'calc(100vh - 200px)' }}>
            <Suspense fallback={<LoadingSpinner />}>
              <BookshelfErrorBoundary books={books} onBookSelect={selectBook}>
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <BookshelfScene books={books} interactive onBookSelect={selectBook} />
                )}
              </BookshelfErrorBoundary>
            </Suspense>
            <div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1.5 rounded-full pointer-events-none"
              style={{ backgroundColor: `${COLORS.surface}cc`, color: COLORS.text.tertiary }}
            >
              Drag to pan · Scroll to zoom · Click a book for details
            </div>
          </div>
        ) : (
          <div className="pb-4">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <FallbackGrid books={books} onBookSelect={selectBook} />
            )}
          </div>
        )}

        {selectedBook && <BookDetailCard book={selectedBook} onClose={clearSelection} />}
      </div>

      {/* Pagination footer */}
      {!usingMockData && (
        <div
          className="px-6 py-4 border-t flex items-center justify-center"
          style={{ borderColor: COLORS.border }}
        >
          <Pagination
            currentPage={pagination.currentPage}
            numPages={pagination.numPages}
            hasNext={pagination.hasNext}
            hasPrevious={pagination.hasPrevious}
            onPageChange={goToPage}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}

function ToggleBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
      style={
        active
          ? { background: COLORS.gradient.primary, color: COLORS.text.inverse }
          : { backgroundColor: 'transparent', color: COLORS.text.secondary }
      }
    >
      {icon}
      {label}
    </button>
  );
}

export default BooksPage;
