import { useState, useEffect, useMemo, useRef } from 'react';
import { Users, BookOpen, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { authorsService } from '../../services/authorsService';
import { normalizeBook } from '../../utils/bookNormalizer';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchBar from '../../components/ui/SearchBar';
import COLORS from '../../constants/colors';

/**
 * Build a deterministic avatar URL for an author name.
 * Used as a fallback when no real Open Library photo is available.
 */
function avatarFor(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || 'Author'
  )}&size=256&background=random&bold=true`;
}

/**
 * AuthorAvatar — shows a generated avatar immediately, then lazily upgrades to
 * the real Open Library photo once the card scrolls into view. Falls back to
 * the avatar if no photo exists (the backend returns a 404-on-miss image URL).
 */
function AuthorAvatar({ name, className }) {
  const ref = useRef(null);
  const [src, setSrc] = useState(() => avatarFor(name));
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (requested) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          setRequested(true);
          authorsService
            .getAuthorImage(name)
            .then((res) => {
              const img = (res?.data ?? res)?.image;
              if (img) setSrc(img);
            })
            .catch(() => {});
        }
      },
      { rootMargin: '150px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [name, requested]);

  return (
    <img
      ref={ref}
      src={src}
      alt={name}
      loading="lazy"
      className={className}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = avatarFor(name);
      }}
    />
  );
}

const SORT_OPTIONS = [
  { value: 'books_desc', label: 'Most books' },
  { value: 'books_asc', label: 'Fewest books' },
  { value: 'name_asc', label: 'Name (A–Z)' },
  { value: 'name_desc', label: 'Name (Z–A)' },
];

/**
 * AuthorsPage — browse authors and view their books.
 *
 * Two views:
 *  1. Author list (grid of authors with photo + book count + sort)
 *  2. Author detail (author photo, about/bio, and books by that author)
 */
function AuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('books_desc');

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
      const books = (data?.books || []).map(normalizeBook).filter(Boolean);

      // Backend may return author as an object { name, image, bio, book_count }
      // (current) or as a plain string (legacy). Handle both gracefully.
      const meta =
        data?.author && typeof data.author === 'object'
          ? data.author
          : { name: author.name };

      setSelectedAuthor((prev) => {
        const merged = { ...prev, ...meta };
        // Guarantee an image and an "about" blurb even on the legacy backend.
        if (!merged.image) merged.image = avatarFor(merged.name);
        if (!merged.bio) {
          merged.bio = `${merged.name} has ${books.length} book${
            books.length !== 1 ? 's' : ''
          } in our catalogue.`;
        }
        return merged;
      });

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

  // Apply the chosen sort/filter to the loaded authors (client-side).
  const sortedAuthors = useMemo(() => {
    const list = [...authors];
    switch (sortBy) {
      case 'books_asc':
        return list.sort((a, b) => (a.book_count || 0) - (b.book_count || 0));
      case 'name_asc':
        return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'name_desc':
        return list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      case 'books_desc':
      default:
        return list.sort((a, b) => (b.book_count || 0) - (a.book_count || 0));
    }
  }, [authors, sortBy]);

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
              src={selectedAuthor.image || avatarFor(selectedAuthor.name)}
              alt={selectedAuthor.name}
              className="w-28 h-28 rounded-full object-cover shrink-0 border-2"
              style={{ borderColor: COLORS.border }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = avatarFor(selectedAuthor.name);
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
          <div className="flex items-center gap-3">
            <div style={{ width: '280px' }}>
              <SearchBar value={search} onSearch={setSearch} placeholder="Search authors..." />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort authors"
              className="text-sm rounded-xl px-3 py-2.5 outline-none cursor-pointer"
              style={{
                backgroundColor: COLORS.surface,
                color: COLORS.text.primary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
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
        ) : sortedAuthors.length === 0 ? (
          <p style={{ color: COLORS.text.secondary }}>No authors found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedAuthors.map((author) => (
              <button
                key={author.name}
                onClick={() => openAuthor(author)}
                className="group text-left rounded-xl border p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
              >
                <AuthorAvatar
                  name={author.name}
                  className="w-12 h-12 rounded-full object-cover shrink-0 transition-transform duration-300 group-hover:scale-110"
                />
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
