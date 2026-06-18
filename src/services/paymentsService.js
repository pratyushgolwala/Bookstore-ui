import { apiClient } from './apiClient';

/**
 * paymentsService — Razorpay payment flow.
 *
 * Backend (apps/payments/urls.py), all wrapped in the standard { status, data }
 * envelope:
 *   POST /api/payments/create-order/      cart items → bookstore order + Razorpay order
 *   POST /api/payments/verify/            verify signature → confirm order
 *   GET  /api/payments/<order_id>/status/ payment status for an order
 */
export const paymentsService = {
  createOrder: (items) =>
    apiClient.post('/api/payments/create-order/', { items }),

  verifyPayment: ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) =>
    apiClient.post('/api/payments/verify/', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    }),

  getStatus: (orderId) => apiClient.get(`/api/payments/${orderId}/status/`),
};

/**
 * Dynamically load the Razorpay Checkout script once.
 * Resolves true when ready, false if it fails to load.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
