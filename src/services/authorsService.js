import { apiClient } from './apiClient';

/**
 * authorsService — Authors resource API calls.
 */
export const authorsService = {
  /** Fetch all authors (with optional search). */
  getAuthors: (search = '') => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient.get(`/api/authors/${qs}`);
  },

  /** Fetch books by a specific author. */
  getBooksByAuthor: (authorName) =>
    apiClient.get(`/api/authors/${encodeURIComponent(authorName)}/books/`),

  /** Resolve a single author's photo (Open Library, with avatar fallback). */
  getAuthorImage: (authorName) =>
    apiClient.get(`/api/authors/image/?name=${encodeURIComponent(authorName)}`),
};
