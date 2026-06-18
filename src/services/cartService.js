import { apiClient } from './apiClient';

/**
 * cartService — the authenticated user's server-side cart.
 *
 * This is the single source of truth for the cart, shared with the AI
 * assistant (which calls the same Django endpoints). The backend wraps every
 * response in the standard envelope: { status, data }.
 *
 * Endpoints (see apps/cart/urls.py):
 *   GET    /api/cart/                  retrieve the cart
 *   POST   /api/cart/add/              add a book (or increment if present)
 *   DELETE /api/cart/clear/            empty the cart
 *   POST   /api/cart/<id>/increment/   increment a line item
 *   POST   /api/cart/<id>/decrement/   decrement a line item (removes at 0)
 *   PATCH  /api/cart/<id>/quantity/    set a line item's absolute quantity
 *   DELETE /api/cart/<id>/remove/      remove a line item entirely
 *
 * Note: <id> is the CART-ITEM id (not the book id).
 */
export const cartService = {
  getCart: () => apiClient.get('/api/cart/'),
  addItem: (bookId, quantity = 1) =>
    apiClient.post('/api/cart/add/', { book_id: bookId, quantity }),
  incrementItem: (itemId) => apiClient.post(`/api/cart/${itemId}/increment/`),
  decrementItem: (itemId) => apiClient.post(`/api/cart/${itemId}/decrement/`),
  setQuantity: (itemId, quantity) =>
    apiClient.patch(`/api/cart/${itemId}/quantity/`, { quantity }),
  removeItem: (itemId) => apiClient.delete(`/api/cart/${itemId}/remove/`),
  clearCart: () => apiClient.delete('/api/cart/clear/'),
};
