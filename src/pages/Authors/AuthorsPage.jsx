import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Library,
  Eye,
  ArrowUpDown,
} from 'lucide-react';
import { authorsService } from '../../services/authorsService';
import { normalizeBook } from '../../utils/bookNormalizer';
import { formatCurrency } from '../../utils/formatters';
import SearchBar from '../../components/ui/SearchBar';
import BookDetailCard from '../../components/Bookshelf/BookDetailCard';
import COLORS from '../../constants/colors';

/**
 * Build a deterministic avatar URL for an author name.
 *
 * The authors list uses these generated avatars directly (the URL is served by
 * the ui-avatars CDN, so the browser loads it without hitting our API). This
 * keeps the gallery free of per-card backend calls — important because the
 * global IP throttle counts every /api request. The real Open Library photo is
 * resolved only on the author detail page (a single request).
 */
function avatarFor(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || 'Author'
  )}&size=256&background=random&bold=true`;
}

const SORT_OPTIONS = [
  { value: 'books_desc', label: 'Most books' },
  { value: 'books_asc', label: 'Fewest books' },
  { value: 'name_asc', label: 'Name (A–Z)' },
  { value: 'name_desc', label: 'Name (Z–A)' },
];

/** Skeleton placeholder card shown while authors load. */
function AuthorCardSkeleton() {
  return (
    <div
      className="rounded-2xl border p-5 flex flex-col items-center gap-3 animate-pulse"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
    >
      <div className="w-20 h-20 rounded-full" style={{ backgroundColor: COLORS.surfaceLight }} />
      <div className="h-3.5 w-3/4 rounded" style={{ backgroundColor: COLORS.surfaceLight }} />
      <div className="h-3 w-1/3 rounded" style={{ backgroundColor: COLORS.surfaceLight }} />
    </div>
  );
}

/** Skeleton placeholder for the book grid. */
function BookSkeleton() {
  return (
    <div
      className="rounded-xl border overflow-hidden animate-pulse"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
    >
      <div style={{ aspectRatio: '2/3', backgroundColor: COLORS.surfaceLight }} />
      <div className="p-3 space-y-2">
        <div className="h-3 w-full rounded" style={{ backgroundColor: COLORS.surfaceLight }} />
        <div className="h-3 w-1/2 rounded" style={{ backgroundColor: COLORS.surfaceLight }} />
      </div>
    </div>
  );
}

/**
 * AuthorsPage — browse authors and view their books.
 *
 * Two views:
 *  1. Author list (gallery of authors with photo + book count + search/sort)
 *  2. Author detail (author hero, about/bio, and books by that author)
 */
function AuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('books_desc');

  // Author detail is driven by the ?author= query param so it can be deep-linked
  // (e.g. clicking an author name on any book card lands here).
  const [searchParams, setSearchParams] = useSearchParams();
  const authorParam = searchParams.get('author');

  // Author detail state
  const [selectedAuthor, setSelectedAuthor] = useState(null); // full author object
  const [authorBooks, setAuthorBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null); // book detail modal

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

  // Load the selected author's books + bio whenever the ?author= param changes.
  useEffect(() => {
    if (!authorParam) {
      setSelectedAuthor(null);
      setAuthorBooks([]);
      return undefined;
    }

    let active = true;
    setSelectedAuthor({ name: authorParam });
    setBooksLoading(true);

    (async () => {
      try {
        const res = await authorsService.getBooksByAuthor(authorParam);
        const data = res?.data ?? res;
        const books = (data?.books || []).map(normalizeBook).filter(Boolean);

        // Backend may return author as an object { name, image, bio, book_count }
        // (current) or as a plain string (legacy). Handle both gracefully.
        const meta =
          data?.author && typeof data.author === 'object'
            ? data.author
            : { name: authorParam };

        if (!active) return;
        setSelectedAuthor((prev) => {
          const merged = { ...prev, ...meta };
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
        if (active) setAuthorBooks([]);
      } finally {
        if (active) setBooksLoading(false);
      }
    })();

    return () => { active = false; };
  }, [authorParam]);

  // Navigate to an author's detail view (updates the URL so it's shareable).
  const openAuthor = (author) => {
    setSearchParams({ author: author.name });
    window.scrollTo({ top: 0 });
  };

  const goBack = () => {
    setSearchParams({});
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

  /* ─────────────────────────── Author detail view ─────────────────────────── */
  if (selectedAuthor) {
    const totalBooks = selectedAuthor.book_count ?? authorBooks.length;
    return (
      <div className="min-h-screen" style={{ backgroundColor: COLORS.background, color: COLORS.text.primary }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={goBack}
            className="flex items-center gap-2 mb-6 text-sm font-medium transition-all hover:gap-3"
            style={{ color: COLORS.secondary[500] }}
          >
            <ArrowLeft size={16} />
            Back to Authors
          </button>

          {/* Author hero */}
          <div
            className="relative overflow-hidden rounded-3xl border p-8 mb-10"
            style={{ borderColor: COLORS.border, background: COLORS.gradient.dark }}
          >
            {/* decorative glow */}
            <div
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: COLORS.gradient.glow }}
            />
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-7">
              <div className="shrink-0 rounded-full p-1" style={{ background: COLORS.gradient.accent }}>
                <img
                  src={selectedAuthor.image || avatarFor(selectedAuthor.name)}
                  alt={selectedAuthor.name}
                  className="w-32 h-32 rounded-full object-cover"
                  style={{ border: `3px solid ${COLORS.surface}` }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = avatarFor(selectedAuthor.name);
                  }}
                />
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3"
                  style={{ backgroundColor: `${COLORS.secondary[500]}22`, color: COLORS.secondary[500] }}
                >
                  <Users size={12} /> Author
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3" style={{ color: COLORS.text.primary }}>
                  {selectedAuthor.name}
                </h1>

                {/* stat chips */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: COLORS.surface, color: COLORS.text.secondary, border: `1px solid ${COLORS.border}` }}
                  >
                    <Library size={14} style={{ color: COLORS.primary[500] }} />
                    {totalBooks} book{totalBooks !== 1 ? 's' : ''}
                  </span>
                </div>

                {selectedAuthor.bio && (
                  <p className="text-sm leading-relaxed max-w-2xl" style={{ color: COLORS.text.secondary }}>
                    {selectedAuthor.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Books section */}
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={18} style={{ color: COLORS.secondary[500] }} />
            <h2 className="text-lg font-semibold">Books by {selectedAuthor.name}</h2>
          </div>

          {booksLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, i) => <BookSkeleton key={i} />)}
            </div>
          ) : authorBooks.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center text-center py-16 rounded-2xl border"
              style={{ borderColor: COLORS.border, backgroundColor: COLORS.surface }}
            >
              <BookOpen size={40} style={{ color: COLORS.text.tertiary }} className="mb-3" />
              <p style={{ color: COLORS.text.secondary }}>No books found for this author.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {authorBooks.map((book) => (
                <div
                  key={book.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedBook(book)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedBook(book);
                    }
                  }}
                  className="group rounded-xl border overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
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
                    {/* hover overlay */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent 65%)' }}
                    >
                      <span
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                        style={{ background: COLORS.gradient.primary, color: COLORS.text.inverse }}
                      >
                        <Eye size={13} /> View details
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold line-clamp-2 leading-snug" style={{ color: COLORS.text.primary }}>
                      {book.title}
                    </h3>
                    <p className="text-base font-bold mt-1.5" style={{ color: COLORS.secondary[500] }}>
                      {formatCurrency(book.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Book detail modal */}
        {selectedBook && (
          <BookDetailCard book={selectedBook} onClose={() => setSelectedBook(null)} />
        )}
      </div>
    );
  }

  /* ──────────────────────────── Authors list view ─────────────────────────── */
  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background, color: COLORS.text.primary }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero header */}
        <div
          className="relative overflow-hidden rounded-3xl border p-8 mb-8"
          style={{ borderColor: COLORS.border, background: COLORS.gradient.dark }}
        >
          <div
            className="absolute -top-20 -right-16 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: COLORS.gradient.glow }}
          />
          <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
                style={{ background: COLORS.gradient.accent }}
              >
                <Users size={24} style={{ color: COLORS.text.inverse }} />
              </div>
              <h1 className="text-4xl font-bold leading-none mb-2">Authors</h1>
              <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                Explore {authors.length} author{authors.length !== 1 ? 's' : ''} and discover their books
              </p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="sm:w-72">
                <SearchBar value={search} onSearch={setSearch} placeholder="Search authors..." />
              </div>
              <div
                className="flex items-center gap-2 rounded-xl px-3"
                style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
              >
                <ArrowUpDown size={15} style={{ color: COLORS.text.tertiary }} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort authors"
                  className="text-sm py-2.5 pr-1 outline-none cursor-pointer bg-transparent"
                  style={{ color: COLORS.text.primary }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} style={{ backgroundColor: COLORS.surface }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div
            className="mb-6 px-4 py-3 rounded-xl flex items-center gap-2 text-sm"
            style={{ backgroundColor: `${COLORS.error}1a`, color: COLORS.error, border: `1px solid ${COLORS.error}33` }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => <AuthorCardSkeleton key={i} />)}
          </div>
        ) : sortedAuthors.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border"
            style={{ borderColor: COLORS.border, backgroundColor: COLORS.surface }}
          >
            <Users size={44} style={{ color: COLORS.text.tertiary }} className="mb-3" />
            <p className="font-medium" style={{ color: COLORS.text.primary }}>No authors found</p>
            <p className="text-sm mt-1" style={{ color: COLORS.text.tertiary }}>
              Try a different search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {sortedAuthors.map((author) => (
              <button
                key={author.name}
                onClick={() => openAuthor(author)}
                className="group relative text-center rounded-2xl border p-6 flex flex-col items-center gap-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
              >
                {/* book count badge */}
                <span
                  className="absolute top-3 right-3 text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${COLORS.secondary[500]}22`, color: COLORS.secondary[500] }}
                >
                  {author.book_count}
                </span>

                <div
                  className="rounded-full p-0.5 transition-all duration-300 group-hover:p-1"
                  style={{ background: COLORS.gradient.accent }}
                >
                  <img
                    src={author.image || avatarFor(author.name)}
                    alt={author.name}
                    loading="lazy"
                    className="w-20 h-20 rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
                    style={{ border: `2px solid ${COLORS.surface}` }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = avatarFor(author.name);
                    }}
                  />
                </div>

                <div className="min-w-0 w-full">
                  <h3 className="text-sm font-semibold truncate" style={{ color: COLORS.text.primary }}>
                    {author.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: COLORS.text.tertiary }}>
                    {author.book_count} book{author.book_count !== 1 ? 's' : ''}
                  </p>
                </div>

                <span
                  className="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
                  style={{ color: COLORS.secondary[500] }}
                >
                  View books <ArrowRight size={13} />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthorsPage;
