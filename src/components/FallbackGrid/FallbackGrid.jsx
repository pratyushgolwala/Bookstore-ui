import BookCard from '../ui/BookCard';
import COLORS from '../../constants/colors';

/**
 * FallbackGrid — an intentionally *asymmetric* book wall.
 *
 * Instead of a uniform N-column grid (the dead giveaway of a generated UI),
 * books flow into a CSS columns / masonry layout where every so often a title
 * is promoted to a wider "feature" card. The rhythm is irregular on purpose —
 * it reads like a hand-arranged shop display rather than a spreadsheet.
 *
 * @param {{ books: Array, onBookSelect: (book: object) => void }} props
 */
function FallbackGrid({ books, onBookSelect }) {
  if (!books || books.length === 0) {
    return (
      <div className="p-10 text-center" style={{ color: COLORS.text.tertiary }}>
        No books to display.
      </div>
    );
  }

  // Promote a few books to "feature" size on a non-uniform cadence so the
  // wall never falls into a neat repeating pattern.
  const featureAt = new Set();
  for (let i = 2; i < books.length; i += 7) featureAt.add(i);
  // nudge every other feature by +2 so the spacing is uneven
  const adjusted = new Set();
  let toggle = false;
  featureAt.forEach((i) => {
    adjusted.add(toggle ? i + 2 : i);
    toggle = !toggle;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-10 py-10">
      {/* CSS multi-column masonry — items keep natural height, flow into cols */}
      <div
        className="[column-fill:_balance] columns-2 md:columns-3 gap-6 sm:gap-7"
        role="region"
        aria-label="Book catalog"
      >
        {books.map((book, i) => {
          const feature = adjusted.has(i);
          return (
            <div
              key={book.id}
              className="mb-6 sm:mb-7 break-inside-avoid"
              style={{
                // slight, deterministic horizontal drift so columns don't align
                // into a rigid edge — small human imperfection
                transform: i % 3 === 1 ? 'translateY(10px)' : 'none',
              }}
            >
              <BookCard book={book} onSelect={onBookSelect} feature={feature} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FallbackGrid;
