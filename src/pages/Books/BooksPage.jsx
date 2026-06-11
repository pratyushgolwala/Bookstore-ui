import { COLORS } from '../../constants/colors';

/**
 * BooksPage — Phase 0 placeholder.
 * TODO: Implement book grid with filters, search bar, and pagination.
 */
function BooksPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, color: COLORS.text.primary }} className="p-8 min-h-screen">
      <h1 style={{ color: COLORS.text.primary }} className="text-3xl font-bold mb-4">Books</h1>
      <p style={{ color: COLORS.text.secondary }}>[ Books listing — coming soon ]</p>
      {/* TODO: <FilterSidebar /> <SearchBar /> <BookGrid /> <Pagination /> */}
    </div>
  );
}

export default BooksPage;
