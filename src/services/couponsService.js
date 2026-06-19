import { apiClient } from './apiClient';

/**
 * couponsService — Coupons resource API calls.
 * The backend wraps every response in an envelope:
 *   { status: { success, message }, data: { ... } }
 */
export const couponsService = {
  /**
   * Validate a coupon code against an order total.
   * POST /api/coupons/validate/
   * @param {string} code        The coupon code to validate.
   * @param {number} orderTotal  The current order subtotal.
   * @returns the response envelope; `data` holds discount details:
   *   { code, discount_type, discount_value, discount_amount, min_order, message }
   */
  validate: (code, orderTotal) =>
    apiClient.post('/api/coupons/validate/', {
      code,
      order_total: orderTotal,
    }),
};
