import { useState, useEffect } from 'react';
import { Users, BookOpen, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { authorsService } from '../../services/authorsService';
import { normalizeBook } from '../../utils/bookNormalizer';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchBar from '../../components/ui/SearchBar';
import COLORS from '../../constants/colors';

/**
 * AuthorsPage — browse authors and view their books.
 *
 * Two views:
 *  1. Author list (grid of authors with photo + book count)
 *  2. Author detail (author photo, about/bio, and books by that author)
 */
function AuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Author detail state
  const [selectedAuthor, setSelectedAuthor] = useState(null); // full author object
  const [authorBooks, setAuthorBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);

  // Fetch authors list
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await authorsService.getAuthors(search);
        const data = res?.data ?? res;
        if (active) {
          setAuthors(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) setError(err.message || 'Failed to load authors');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [search]);

  // Fetch books + bio when an author is selected
  const openAuthor = async (author) => {
    setSelectedAuthor(author);
    setBooksLoading(true);
    try {
      const res = await authorsService.getBooksByAuthor(author.name);
      const data = res?.data ?? res;
      // Backend returns { author: { name, image, bio, book_count }, books: [...] }
      if (data?.author) {
        setSelectedAuthor((prev) => ({ ...prev, ...data.author }));
      }
      const books = (data?.books || []).map(normalizeBook).filter(Boolean);
      setAuthorBooks(books);
    } catch {
      setAuthorBooks([]);
    } finally {
      setBooksLoading(false);
    }
  };

  const goBack = () => {
    setSelectedAuthor(null);
    setAuthorBooks([]);
  };

  // Author detail view
  if (selectedAuthor) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: COLORS.background, color: COLORS.text.primary }}>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <button
            onClick={goBack}
            className="flex items-center gap-2 mb-6 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: COLORS.secondary[500] }}
          >
            <ArrowLeft size={16} />
            Back to Authors
          </button>

          {/* Author header: photo + name + about */}
          <div
            className="flex flex-col sm:flex-row gap-6 rounded-2xl border p-6 mb-10"
            style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
          >
            <img
              src={selectedAuthor.image}
              alt={selectedAuthor.name}
              className="w-28 h-28 rounded-full object-cover shrink-0 border-2"
              style={{ borderColor: COLORS.border }}
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  selectedAuthor.name
                )}&size=256&background=random&bold=true`;
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Users style={{ color: COLORS.secondary[500] }} size={26} />
                <h1 className="text-3xl font-bold">{selectedAuthor.name}</h1>
              </div>
              <p className="text-sm mb-3" style={{ color: COLORS.text.tertiary }}>
                {authorBooks.length} book{authorBooks.length !== 1 ? 's' : ''} in catalog
              </p>
              {selectedAuthor.bio && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: COLORS.text.tertiary }}>
                    About the author
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: COLORS.text.secondary }}>
                    {selectedAuthor.bio}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} style={{ color: COLORS.secondary[500] }} />
            <h2 className="text-lg font-semibold">Books</h2>
          </div>

          {booksLoading ? (
            <LoadingSpinner />
          ) : authorBooks.length === 0 ? (
            <p style={{ color: COLORS.text.secondary }}>No books found for this author.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {authorBooks.map((book) => (
                <div
                  key={book.id}
                  className="group rounded-xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/seed/${encodeURIComponent(book.id)}/240/360`;
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold line-clamp-2" style={{ color: COLORS.text.primary }}>
                      {book.title}
                    </h3>
                    <p className="text-base font-bold mt-1" style={{ color: COLORS.secondary[500] }}>
                      {formatCurrency(book.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Authors list view
  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background, color: COLORS.text.primary }}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Users style={{ color: COLORS.secondary[500] }} size={28} />
            <div>
              <h1 className="text-3xl font-bold leading-none">Authors</h1>
              <p className="text-sm mt-1" style={{ color: COLORS.text.tertiary }}>
                {authors.length} authors in catalog
              </p>
            </div>
          </div>
          <div style={{ width: '280px' }}>
            <SearchBar value={search} onSearch={setSearch} placeholder="Search authors..." />
          </div>
        </div>

        {error && (
          <div
            className="mb-6 px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
            style={{ backgroundColor: `${COLORS.error}1a`, color: COLORS.error }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : authors.length === 0 ? (
          <p style={{ color: COLORS.text.secondary }}>No authors found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {authors.map((author) => (
              <button
                key={author.name}
                onClick={() => openAuthor(author)}
                className="group text-left rounded-xl border p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
              >
                {author.image ? (
                  <img
                    src={author.image}
                    alt={author.name}
                    loading="lazy"
                    className="w-12 h-12 rounded-full object-cover shrink-0 transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        author.name
                      )}&size=128&background=random&bold=true`;
                    }}
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${COLORS.primary[500]}22`, color: COLORS.primary[500] }}
                  >
                    <Users size={20} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate" style={{ color: COLORS.text.primary }}>
                    {author.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: COLORS.text.tertiary }}>
                    {author.book_count} book{author.book_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <ArrowRight
                  size={16}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
                  style={{ color: COLORS.secondary[500] }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthorsPage;
