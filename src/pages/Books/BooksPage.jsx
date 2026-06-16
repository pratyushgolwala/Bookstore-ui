import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, Box, BookMarked, AlertCircle, Search, SlidersHorizontal, X, Shuffle } from 'lucide-react';
import useViewport from '../../hooks/useViewport';
import useBookshelf from '../../hooks/useBookshelf';
import BookshelfErrorBoundary from '../../components/Bookshelf/BookshelfErrorBoundary';
import BookDetailCard from '../../components/Bookshelf/BookDetailCard';
import FallbackGrid from '../../components/FallbackGrid/FallbackGrid';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import LiquidButton from '../../components/ui/LiquidButton';
import COLORS from '../../constants/colors';

const BookshelfScene = React.lazy(() => import('../../components/Bookshelf/BookshelfScene'));

/**
 * BooksPage — browse the catalog as a 3D shelf or grid.
 * The header (title + search + view toggle) shows only at the top of the page;
 * scrolling down hides it and reveals a floating control tab on the right.
 */
function BooksPage() {
  const { isMobile, hasWebGL } = useViewport();
  const {
    books,
    selectedBook,
    selectBook,
    clearSelection,
    loading,
    usingMockData,
    pagination,
    goToPage,
    runSearch,
    search,
  } = useBookshelf();

  // Pick up search term from URL query param (e.g. from category navigation).
  // When navigating to /books without ?search= (e.g. clicking "Books" in the
  // nav), clear any previous search so all books are shown.
  const [searchParams] = useSearchParams();
  const appliedSearchRef = useRef(null);
  useEffect(() => {
    const q = searchParams.get('search') || '';
    if (q !== appliedSearchRef.current) {
      appliedSearchRef.current = q;
      runSearch(q);
    }
  }, [searchParams, runSearch]);

  const [viewMode, setViewMode] = useState(isMobile || !hasWebGL ? 'grid' : 'shelf');
  const effectiveView = isMobile || !hasWebGL ? 'grid' : viewMode;

  const [atTop, setAtTop] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);

  // Track scroll position to toggle header vs floating tab
  useEffect(() => {
    const handleScroll = () => {
      const top = window.scrollY < 40;
      setAtTop(top);
      if (top) setPanelOpen(false);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToggle = !isMobile && hasWebGL;

  return (
    <div
      className="relative flex flex-col"
      style={{ backgroundColor: COLORS.background, color: COLORS.text.primary, minHeight: 'calc(100vh - 90px)' }}
    >
      {/* ── Top Header — visible only at top of page ── */}
      <div
        className="px-6 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between transition-all duration-300"
        style={{
          opacity: atTop ? 1 : 0,
          transform: atTop ? 'translateY(0)' : 'translateY(-16px)',
          pointerEvents: atTop ? 'auto' : 'none',
          maxHeight: atTop ? '200px' : '0',
        }}
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

        {/* Search + toggle side by side */}
        <div className="flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onSearch={runSearch} />
          {showToggle && (
            <ViewToggle viewMode={effectiveView} setViewMode={setViewMode} />
          )}
        </div>
      </div>

      {/* ── Floating control tab — visible when scrolled down ── */}
      {!atTop && (
        <div
          className="fixed z-50 flex items-stretch transition-transform duration-300"
          style={{
            top: '80px',
            right: 0,
            transform: panelOpen ? 'translateX(0)' : 'translateX(calc(100% - 36px))',
          }}
        >
          {/* Toggle handle — sits on the LEFT of the panel */}
          <button
            onClick={() => setPanelOpen((o) => !o)}
            className="flex items-center justify-center transition-colors duration-200 hover:brightness-110"
            style={{
              width: '36px',
              flexShrink: 0,
              borderRadius: '10px 0 0 10px',
              background: COLORS.gradient.primary,
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '-2px 4px 16px rgba(0,0,0,0.4)',
            }}
            aria-label={panelOpen ? 'Close controls' : 'Open controls'}
          >
            {panelOpen ? <X size={16} /> : <SlidersHorizontal size={16} />}
          </button>

          {/* Panel body — search + view toggle */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderLeft: 'none',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ width: '230px' }}>
              <SearchBar value={search} onSearch={runSearch} placeholder="Search…" />
            </div>
            {showToggle && <ViewToggle viewMode={effectiveView} setViewMode={setViewMode} />}
          </div>
        </div>
      )}

      {/* Offline banner */}
      {usingMockData && (
        <div
          className="px-6 py-2 flex items-center gap-2 text-sm"
          style={{ backgroundColor: `${COLORS.warning}1a`, color: COLORS.warning }}
        >
          <AlertCircle size={16} />
          Showing offline sample data — the catalog API is unreachable.
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 relative min-h-0">
        {effectiveView === 'shelf' ? (
          <div className="relative" style={{ height: 'calc(100vh - 200px)' }}>
            <Suspense fallback={<LoadingSpinner />}>
              <BookshelfErrorBoundary books={books} onBookSelect={selectBook}>
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <BookshelfScene
                    books={books}
                    interactive
                    onBookSelect={selectBook}
                    selectedBookId={selectedBook?.id || null}
                  />
                )}
              </BookshelfErrorBoundary>
            </Suspense>
            <div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1.5 rounded-full pointer-events-none"
              style={{ backgroundColor: `${COLORS.surface}cc`, color: COLORS.text.tertiary }}
            >
              Drag to pan · Scroll to zoom · Click a book for details
            </div>

            {/* Floating "Surprise Me" — glass button distorts the shelf behind it */}
            {books.length > 0 && (
              <div className="absolute top-4 right-4 z-10">
                <LiquidButton
                  size="lg"
                  onClick={() => selectBook(books[Math.floor(Math.random() * books.length)])}
                  style={{ color: COLORS.text.primary }}
                >
                  <Shuffle size={16} />
                  Surprise Me
                </LiquidButton>
              </div>
            )}
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
      </div>

      {/* Pagination */}
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

      {/* Detail popup — rendered at page level (fixed full-screen) */}
      {selectedBook && <BookDetailCard book={selectedBook} onClose={clearSelection} />}
    </div>
  );
}

function ViewToggle({ viewMode, setViewMode }) {
  return (
    <div
      className="flex items-center rounded-lg p-1"
      style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
    >
      <ToggleBtn active={viewMode === 'shelf'} onClick={() => setViewMode('shelf')} icon={<Box size={16} />} label="3D" />
      <ToggleBtn active={viewMode === 'grid'} onClick={() => setViewMode('grid')} icon={<LayoutGrid size={16} />} label="Grid" />
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
