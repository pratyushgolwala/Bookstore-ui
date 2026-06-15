import { apiClient } from './apiClient';

/**
 * reviewsService — Book reviews API calls
 */
export const reviewsService = {
  getReviews: (params) => apiClient.get(`/api/reviews/${params ? `?${new URLSearchParams(params)}` : ''}`),
  getReviewById: (id) => apiClient.get(`/api/reviews/${id}/`),
  createReview: (data) => apiClient.post('/api/reviews/', data),
  updateReview: (id, data) => apiClient.patch(`/api/reviews/${id}/`, data),
  deleteReview: (id) => apiClient.delete(`/api/reviews/${id}/`),
  toggleHelpful: (id) => apiClient.post(`/api/reviews/${id}/toggle_helpful/`),
};
