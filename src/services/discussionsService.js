import { apiClient } from './apiClient';

/**
 * discussionsService — Discussion threads and posts API calls
 */
export const discussionsService = {
  // Threads
  getThreads: (params) => apiClient.get(`/api/threads/${params ? `?${new URLSearchParams(params)}` : ''}`),
  getThreadById: (id) => apiClient.get(`/api/threads/${id}/`),
  createThread: (data) => apiClient.post('/api/threads/', data),
  updateThread: (id, data) => apiClient.patch(`/api/threads/${id}/`, data),
  deleteThread: (id) => apiClient.delete(`/api/threads/${id}/`),
  addPostToThread: (id, data) => apiClient.post(`/api/threads/${id}/add_post/`, data),
  
  // Posts
  getPosts: (params) => apiClient.get(`/api/posts/${params ? `?${new URLSearchParams(params)}` : ''}`),
  getPostById: (id) => apiClient.get(`/api/posts/${id}/`),
  createPost: (data) => apiClient.post('/api/posts/', data),
  updatePost: (id, data) => apiClient.patch(`/api/posts/${id}/`, data),
  deletePost: (id) => apiClient.delete(`/api/posts/${id}/`),
};
