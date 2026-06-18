import { apiClient } from './apiClient';

/**
 * authorService — author studio API calls (author-scoped catalogue + metrics).
 *
 * All endpoints require an authenticated AUTHOR (or staff) user. The backend
 * wraps every response in the standard envelope:
 *   { status: { success, message }, data: { ... } }
 */
export const authorService = {
  /** Aggregate performance stats for the signed-in author. */
  getStats: () => apiClient.get('/api/author/stats/'),

  /** The author's own books with sales/revenue/rating metrics (paginated). */
  getMyBooks: ({ page = 1, pageSize = 50 } = {}) => {
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    qs.set('page_size', String(pageSize));
    return apiClient.get(`/api/author/books/?${qs.toString()}`);
  },

  /** Recent reviews across the author's books. */
  getReviews: () => apiClient.get('/api/author/reviews/'),

  /**
   * Sales analytics for the author's whole catalogue, sourced from the
   * analytics microservice (proxied through Django). Returns
   * { summary, daily }. Optional { startDate, endDate } narrow the window.
   */
  getAnalytics: ({ startDate, endDate } = {}) => {
    const qs = new URLSearchParams();
    if (startDate) qs.set('start_date', startDate);
    if (endDate) qs.set('end_date', endDate);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiClient.get(`/api/author/analytics/${suffix}`);
  },

  /** Sales analytics for a single owned book (totals + daily series). */
  getBookAnalytics: (id, { startDate, endDate } = {}) => {
    const qs = new URLSearchParams();
    if (startDate) qs.set('start_date', startDate);
    if (endDate) qs.set('end_date', endDate);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiClient.get(`/api/author/analytics/book/${id}/${suffix}`);
  },

  /** Publish a new book. */
  createBook: (payload) => apiClient.post('/api/author/books/', payload),

  /** Update one of the author's books. */
  updateBook: (id, payload) => apiClient.patch(`/api/author/books/${id}/`, payload),

  /** Soft-delete (remove) one of the author's books. */
  removeBook: (id) => apiClient.delete(`/api/author/books/${id}/`),

  /** Make a book live. */
  publishBook: (id) => apiClient.post(`/api/author/books/${id}/publish/`),

  /** Move a book to draft. */
  unpublishBook: (id) => apiClient.post(`/api/author/books/${id}/unpublish/`),
};
