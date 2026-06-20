import { apiClient } from './apiClient';

/**
 * userService — the authenticated user's own profile.
 *
 * Backed by GET/PATCH /user/me/. Email and role are identity fields and are
 * read-only server-side; only first_name, last_name, and phone can be updated.
 */
export const userService = {
  /** Fetch the current user's profile. */
  getProfile: () => apiClient.get('/user/me/'),

  /** Update the current user's profile (first_name, last_name, phone). */
  updateProfile: (data) => apiClient.patch('/user/me/', data),
};
