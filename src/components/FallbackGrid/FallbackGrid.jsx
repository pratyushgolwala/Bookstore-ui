import { groupBooksByCategory } from '../../utils/bookshelfUtils.js';

/**
 * FallbackGrid - A 2D responsive grid layout for browsing books.
 * Displayed on small screens (< 768px) or when WebGL is unavailable.
 * Groups books by category with visible headings and renders
 * clickable cards showing cover, title, author, and price.
 *
 * @param {{ books: Array, onBookSelect: (book: object) => void }} props
 */
function FallbackGrid({ books, onBookSelect }) {
  const booksByCategory = groupBooksByCategory(books || []);
  const categories = Object.keys(booksByCategory);

  if (categories.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No books available.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8" role="region" aria-label="Book catalog">
      {categories.map((category) => (
        <section key={category} aria-labelledby={`category-${category}`}>
          <h2
            id={`category-${category}`}
            className="text-xl font-semibold text-gray-800 mb-4"
          >
            {category}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {booksByCategory[category].map((book) => (
              <button
                key={book.id}
                type="button"
                className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 text-left cursor-pointer"
                onClick={() => onBookSelect(book)}
                aria-label={`View details for ${book.title} by ${book.author}`}
              >
                <img
                  src={book.coverImageUrl}
                  alt={`Cover of ${book.title}`}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">{book.author}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-auto pt-2">
                    ${typeof book.price === 'number' ? book.price.toFixed(2) : book.price}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default FallbackGrid;
