/**
 * previewApi — LOCAL DEVELOPMENT ONLY mock backend.
 *
 * When preview mode is on (VITE_PREVIEW_AUTH=true, via `npm run dev:preview`),
 * apiClient routes every request through this module instead of hitting the
 * network. It returns canned data shaped like the real Django responses so
 * that login-gated, data-driven pages (Orders, Cart, Reviews, Discussions,
 * the Author dashboard, etc.) can be designed without a running backend.
 *
 * ⚠️  Never enabled in production — gated behind PREVIEW_AUTH_ENABLED.
 */

import { MOCK_BOOKS } from '../data/mockBooks';
import { PREVIEW_AUTH_ENABLED } from '../utils/previewAuth';

export { PREVIEW_AUTH_ENABLED };

const now = Date.now();
const daysAgo = (d) => new Date(now - d * 86400000).toISOString();

/* ── seed data ─────────────────────────────────────────────────────────── */

const REVIEWERS = ['Ada P.', 'Marcus L.', 'Sofia R.', 'Daniel O.', 'Priya N.', 'Theo K.'];

const mockReviews = MOCK_BOOKS.slice(0, 8).map((b, i) => ({
  id: `rev-${i + 1}`,
  book: b.id,
  book_title: b.title,
  title: [
    'A quiet triumph',
    'Couldn’t put it down',
    'Flawed but unforgettable',
    'Exactly what I needed',
    'A slow burn worth the wait',
    'Dense, demanding, rewarding',
    'Beautiful prose',
    'Stayed with me for weeks',
  ][i],
  body: 'Read this over a long weekend and it lingered well past the last page. The pacing is deliberate, the characters earn their endings, and the final chapter reframes everything that came before.',
  rating: [5, 4, 3, 5, 4, 4, 5, 5][i],
  user_name: REVIEWERS[i % REVIEWERS.length],
  created_at: daysAgo(i * 3 + 1),
  is_helpful: i % 3 === 0,
  helpful_count: (i * 7) % 23,
}));

const mockThreads = [
  {
    id: 'th-1', title: 'What are you reading this week?',
    author_name: 'Sofia R.', created_at: daysAgo(1),
    post_count: 12, is_locked: false,
    body: 'Share your current read and one line on why it’s worth it.',
  },
  {
    id: 'th-2', title: 'Underrated science fiction of the last decade',
    author_name: 'Theo K.', created_at: daysAgo(4),
    post_count: 7, is_locked: false,
    body: 'Looking past the obvious bestsellers — what deserves more attention?',
  },
  {
    id: 'th-3', title: 'Comfort re-reads for a rainy day',
    author_name: 'Ada P.', created_at: daysAgo(9),
    post_count: 21, is_locked: false,
    body: 'The books you return to when you want an old friend.',
  },
];

const mockPosts = [
  { id: 'p-1', thread: 'th-1', author_name: 'Marcus L.', created_at: daysAgo(1), content: 'Halfway through Foundation again — holds up better than I remembered.' },
  { id: 'p-2', thread: 'th-1', author_name: 'Priya N.', created_at: daysAgo(0), content: 'Just started The Left Hand of Darkness. Slow but hypnotic.' },
];

const mockNotifications = [
  { id: 'n-1', title: 'Your order shipped', message: 'Order #A1B2C3D4 is on its way.', is_read: false, created_at: daysAgo(0) },
  { id: 'n-2', title: 'New reply', message: 'Marcus L. replied to your thread.', is_read: false, created_at: daysAgo(1) },
  { id: 'n-3', title: 'Price drop', message: 'A book on your wishlist is now ₹399.', is_read: true, created_at: daysAgo(3) },
];

const mockOrders = [
  {
    id: 'a1b2c3d4e5', status: 'delivered', total_amount: 1297, created_at: daysAgo(6),
    items: [
      { id: 'oi-1', book: MOCK_BOOKS[0].id, book_title: MOCK_BOOKS[0].title, quantity: 1, price: MOCK_BOOKS[0].price },
      { id: 'oi-2', book: MOCK_BOOKS[2].id, book_title: MOCK_BOOKS[2].title, quantity: 2, price: MOCK_BOOKS[2].price },
    ],
  },
  {
    id: 'f6g7h8i9j0', status: 'shipped', total_amount: 549, created_at: daysAgo(2),
    items: [
      { id: 'oi-3', book: MOCK_BOOKS[4].id, book_title: MOCK_BOOKS[4].title, quantity: 1, price: MOCK_BOOKS[4].price },
    ],
  },
  {
    id: 'k1l2m3n4o5', status: 'pending', total_amount: 899, created_at: daysAgo(0),
    items: [
      { id: 'oi-4', book: MOCK_BOOKS[6].id, book_title: MOCK_BOOKS[6].title, quantity: 1, price: MOCK_BOOKS[6].price },
      { id: 'oi-5', book: MOCK_BOOKS[7].id, book_title: MOCK_BOOKS[7].title, quantity: 1, price: MOCK_BOOKS[7].price },
    ],
  },
];

const CATEGORY_NAMES = [...new Set(MOCK_BOOKS.map((b) => b.category))];
const mockCategories = CATEGORY_NAMES.map((name, i) => ({
  id: `cat-${i + 1}`,
  name,
  description: 'A hand-picked shelf of titles in this corner of the shop.',
  book_count: MOCK_BOOKS.filter((b) => b.category === name).length,
}));

const AUTHOR_NAMES = [...new Set(MOCK_BOOKS.map((b) => b.author))];
const mockAuthors = AUTHOR_NAMES.map((name, i) => ({
  id: `auth-${i + 1}`,
  name,
  bio: 'An author in the Folio catalogue. Biographies are mocked in preview mode.',
  book_count: MOCK_BOOKS.filter((b) => b.author === name).length,
}));

/* Author-dashboard datasets */
const mockAuthorBooks = MOCK_BOOKS.slice(0, 6).map((b, i) => ({
  ...b,
  status: i % 3 === 0 ? 'draft' : 'published',
  sales: (i * 37 + 11) % 240,
  revenue: ((i * 37 + 11) % 240) * b.price,
  rating: 3.5 + ((i * 7) % 15) / 10,
  stock: (i * 13 + 4) % 60,
}));

/* ── helpers ───────────────────────────────────────────────────────────── */

// Django envelope used across the app: { status: { code, message }, data }
const ok = (data) => ({ status: { code: 200, message: 'OK' }, data });
const paginated = (results) => ok({ count: results.length, next: null, previous: null, results });

function bookEnvelope(qs) {
  // mimic /api/books/ pagination + search
  const params = new URLSearchParams(qs || '');
  const search = (params.get('search') || '').toLowerCase();
  let list = MOCK_BOOKS.map((b) => ({
    ...b,
    coverImageUrl: b.coverImageUrl,
    cover_image_url: b.coverImageUrl,
    stock: 12,
    description: 'A mocked description for preview mode — enough copy to fill the detail panel and exercise the layout.',
    publishedYear: 1990 + ((b.title.length * 3) % 30),
    language: 'en',
    pageCount: b.pageCount,
  }));
  if (search) {
    list = list.filter(
      (b) => b.title.toLowerCase().includes(search) || b.author.toLowerCase().includes(search)
    );
  }
  return ok({ count: list.length, next: null, previous: null, results: list });
}

/* ── router ────────────────────────────────────────────────────────────── */

/**
 * Resolve a mocked response for (method, endpoint). Returns the parsed body
 * (envelope) exactly as apiClient would return from res.json(). Throws for
 * genuinely unknown routes so the caller can decide how to handle it.
 */
export function previewRequest(method, endpoint) {
  const [path, qs] = endpoint.split('?');

  // strip trailing slash for matching
  const p = path.replace(/\/$/, '');

  // ── books ──
  if (p === '/api/books') return bookEnvelope(qs);
  if (/^\/api\/books\/[^/]+$/.test(p)) {
    const id = p.split('/').pop();
    const book = MOCK_BOOKS.find((b) => b.id === id) || MOCK_BOOKS[0];
    return ok(book);
  }

  // ── categories ──
  if (p === '/api/categories') return paginated(mockCategories);
  if (/^\/api\/categories\/[^/]+$/.test(p)) {
    const id = p.split('/').pop();
    return ok(mockCategories.find((c) => c.id === id) || mockCategories[0]);
  }

  // ── authors ──
  if (p === '/api/authors') return paginated(mockAuthors);
  if (p.startsWith('/api/authors/image')) return ok({ image_url: '' });
  if (/^\/api\/authors\/[^/]+\/books$/.test(p)) {
    return paginated(MOCK_BOOKS.slice(0, 5));
  }

  // ── reviews ──
  if (p === '/api/reviews') return paginated(mockReviews);
  if (/^\/api\/reviews\/[^/]+\/toggle_helpful$/.test(p)) return ok({ toggled: true });
  if (/^\/api\/reviews\/[^/]+$/.test(p)) {
    if (method === 'POST' || method === 'PATCH') return ok(mockReviews[0]);
    if (method === 'DELETE') return null;
    return ok(mockReviews[0]);
  }
  if (p === '/api/reviews' && method === 'POST') return ok(mockReviews[0]);

  // ── discussions: threads + posts ──
  if (p === '/api/threads') {
    if (method === 'POST') return ok(mockThreads[0]);
    return paginated(mockThreads);
  }
  if (/^\/api\/threads\/[^/]+\/add_post$/.test(p)) return ok(mockPosts[0]);
  if (/^\/api\/threads\/[^/]+$/.test(p)) {
    const id = p.split('/').pop();
    const thread = mockThreads.find((t) => t.id === id) || mockThreads[0];
    return ok({ ...thread, posts: mockPosts });
  }
  if (p === '/api/posts') return paginated(mockPosts);
  if (/^\/api\/posts\/[^/]+$/.test(p)) return ok(mockPosts[0]);

  // ── notifications ──
  if (p === '/api/notifications') return paginated(mockNotifications);
  if (p === '/api/notifications/read-all') return ok({ updated: mockNotifications.length });
  if (/^\/api\/notifications\/[^/]+\/read$/.test(p)) return ok({ read: true });

  // ── cart ──
  if (p === '/api/cart') return ok({ items: [], subtotal: 0 });
  if (p === '/api/cart/items') return ok({ added: true });
  if (p === '/api/cart/clear') return null;

  // ── orders ──
  if (p === '/api/orders') {
    if (method === 'POST') return ok({ id: 'new-order', status: 'pending' });
    return paginated(mockOrders);
  }
  if (/^\/api\/orders\/[^/]+\/cancel$/.test(p)) return ok({ ...mockOrders[0], status: 'cancelled' });
  if (/^\/api\/orders\/[^/]+$/.test(p)) {
    const id = p.split('/').pop();
    return ok(mockOrders.find((o) => o.id === id) || mockOrders[0]);
  }

  // ── author dashboard ──
  if (p === '/api/author/stats') {
    return ok({
      total_books: mockAuthorBooks.length,
      total_sales: mockAuthorBooks.reduce((s, b) => s + b.sales, 0),
      total_revenue: Math.round(mockAuthorBooks.reduce((s, b) => s + b.revenue, 0)),
      avg_rating: 4.3,
    });
  }
  if (p === '/api/author/books') {
    if (method === 'POST') return ok(mockAuthorBooks[0]);
    return ok({ count: mockAuthorBooks.length, next: null, previous: null, results: mockAuthorBooks });
  }
  if (/^\/api\/author\/books\/[^/]+\/(publish|unpublish)$/.test(p)) return ok(mockAuthorBooks[0]);
  if (/^\/api\/author\/books\/[^/]+$/.test(p)) {
    if (method === 'DELETE') return null;
    return ok(mockAuthorBooks[0]);
  }
  if (p === '/api/author/reviews') return ok({ results: mockReviews.slice(0, 4) });

  // Unknown route — let the caller fall back.
  const err = new Error(`[previewApi] No mock for ${method} ${endpoint}`);
  err.isPreviewMiss = true;
  throw err;
}
