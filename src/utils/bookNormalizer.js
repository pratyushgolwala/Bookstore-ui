/**
 * bookNormalizer — maps the backend Book shape into the shape the UI
 * (bookshelf, cards, detail view) expects.
 *
 * Backend fields: id, title, author, isbn, description, cover_url,
 *                 published_year, language, price, stock, is_active, created_at
 *
 * The backend has no page_count or category, so we derive stable, deterministic
 * values from the book id/isbn so the 3D shelf has visual variety that doesn't
 * change between renders.
 */

const DERIVED_CATEGORIES = [
  'Fiction',
  'Science',
  'History',
  'Fantasy',
  'Mystery',
  'Philosophy',
  'Poetry',
  'Adventure',
];

/**
 * Simple deterministic string hash (FNV-1a style).
 * @param {string} str
 * @returns {number} unsigned 32-bit int
 */
function hashString(str = '') {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Normalize a single backend book object.
 * @param {object} raw
 * @returns {object} normalized book
 */
export function normalizeBook(raw) {
  if (!raw) return null;
  const seed = hashString(raw.id || raw.isbn || raw.title || '');

  // Derive a page count between 120 and 920 for spine thickness variety
  const pageCount = 120 + (seed % 800);

  // Derive a stable display category
  const category = DERIVED_CATEGORIES[seed % DERIVED_CATEGORIES.length];

  const price =
    typeof raw.price === 'string' ? parseFloat(raw.price) : raw.price ?? 0;

  return {
    id: raw.id,
    title: raw.title || 'Untitled',
    author: raw.author || 'Unknown Author',
    isbn: raw.isbn || '',
    description: raw.description || '',
    coverImageUrl:
      raw.cover_url ||
      `https://picsum.photos/seed/${encodeURIComponent(raw.title || raw.id)}/240/360`,
    price,
    stock: raw.stock ?? 0,
    publishedYear: raw.published_year || null,
    language: raw.language || '',
    category,
    pageCount,
  };
}

/**
 * Normalize a list of backend books.
 * @param {object[]} rawList
 * @returns {object[]}
 */
export function normalizeBooks(rawList = []) {
  return rawList.map(normalizeBook).filter(Boolean);
}

/**
 * Extract pagination metadata + normalized results from the API envelope.
 * Handles both the wrapped envelope and a bare array (fallback).
 * @param {object} envelope
 * @returns {{ books: object[], pagination: object }}
 */
export function parseBooksResponse(envelope) {
  const data = envelope?.data ?? envelope;

  // Paginated payload
  if (data && Array.isArray(data.results)) {
    return {
      books: normalizeBooks(data.results),
      pagination: {
        count: data.count ?? data.results.length,
        numPages: data.num_pages ?? 1,
        currentPage: data.current_page ?? 1,
        pageSize: data.page_size ?? data.results.length,
        hasNext: data.has_next ?? false,
        hasPrevious: data.has_previous ?? false,
      },
    };
  }

  // Bare array fallback
  const arr = Array.isArray(data) ? data : [];
  return {
    books: normalizeBooks(arr),
    pagination: {
      count: arr.length,
      numPages: 1,
      currentPage: 1,
      pageSize: arr.length,
      hasNext: false,
      hasPrevious: false,
    },
  };
}
