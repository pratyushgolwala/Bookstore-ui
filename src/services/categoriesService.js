import { apiClient } from './apiClient';

/**
 * categoriesService — Categories resource API calls.
 * The backend wraps every response in an envelope:
 *   { status: { success, message }, data: { results, ... } | [ ... ] }
 */
export const categoriesService = {
  /** Fetch all categories. */
  getCategories: () => apiClient.get('/api/categories/'),

  /** Fetch a single category by id. */
  getCategoryById: (id) => apiClient.get(`/api/categories/${id}/`),
};
