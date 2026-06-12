import { apiClient } from './apiClient';

/**
 * booksService — Books resource API calls.
 * The backend wraps every response in an envelope:
 *   { status: { success, code, message }, data: { results, count, num_pages, ... } }
 */
export const booksService = {
  /**
   * Fetch a page of books.
   * @param {{ page?: number, pageSize?: number, search?: string }} params
   * @returns {Promise<object>} the raw envelope
   */
  getBooks: ({ page = 1, pageSize = 24, search = '' } = {}) => {
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    qs.set('page_size', String(pageSize));
    if (search) qs.set('search', search);
    return apiClient.get(`/api/books/?${qs.toString()}`);
  },

  getBookById: (id) => apiClient.get(`/api/books/${id}/`),

  searchBooks: (query, page = 1, pageSize = 24) => {
    const qs = new URLSearchParams();
    qs.set('search', query);
    qs.set('page', String(page));
    qs.set('page_size', String(pageSize));
    return apiClient.get(`/api/books/?${qs.toString()}`);
  },
};
