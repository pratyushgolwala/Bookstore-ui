/**
 * deliveryService — talks to the FastAPI delivery classification microservice.
 *
 * The delivery bot runs as a separate service (its own base URL) and verifies
 * the SAME JWT access token the rest of the app uses, so we attach
 * `Authorization: Bearer <access>` on every call.
 *
 * It classifies an order (quantity / price / availability) into a delivery
 * tier and dispatch ETA, and builds the delivery-status timeline (which it
 * enriches with the tracking bot's live checkpoints).
 */

const DELIVERY_URL =
  import.meta.env.VITE_DELIVERY_URL || 'http://localhost:8004';

let _store = null;

/** Call once in main.jsx: initDeliveryClient(store) */
export function initDeliveryClient(store) {
  _store = store;
}

function getAccessToken() {
  return _store?.getState().auth.access || localStorage.getItem('access');
}

async function request(method, path) {
  const token = getAccessToken();
  const res = await fetch(`${DELIVERY_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 404) {
    const err = new Error('No delivery info found.');
    err.status = 404;
    throw err;
  }
  if (res.status === 401) {
    throw new Error('Your session has expired. Please log in again.');
  }
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.detail || json?.message || `Delivery request failed (${res.status})`);
  }
  return res.json();
}

export const deliveryService = {
  /** Dispatch decision (tier, ETA, in-stock) for an order, fetched by id. */
  getClassification: (orderId) => request('GET', `/delivery/${orderId}/classify`),

  /** Full delivery-status timeline for an order (incl. live tracking stages). */
  getTimeline: (orderId) => request('GET', `/delivery/${orderId}/timeline`),
};
