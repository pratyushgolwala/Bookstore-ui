import { apiClient } from './apiClient';

/**
 * ordersService — Orders resource API calls.
 */
export const ordersService = {
  getOrders: () => apiClient.get('/api/orders/'),

  getOrderById: (id) => apiClient.get(`/api/orders/${id}/`),

  placeOrder: (data) => apiClient.post('/api/orders/', data),

  cancelOrder: (id) => apiClient.post(`/api/orders/${id}/cancel/`),

  /** Checkout the cart into an order (items + optional delivery + payment). */
  checkout: (payload) => apiClient.post('/api/orders/checkout/', payload),

  /** Auto-fill values for the delivery form (name/email/phone + last address). */
  getDeliveryDefaults: () => apiClient.get('/api/orders/delivery-defaults/'),
};
