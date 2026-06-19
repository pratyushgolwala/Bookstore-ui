/**
 * trackingService — talks to the FastAPI delivery tracking microservice.
 *
 * The tracking bot runs as a separate service (its own base URL) and verifies
 * the SAME JWT access token the rest of the app uses, so we attach
 * `Authorization: Bearer <access>` on every call.
 */

const TRACKING_URL =
  import.meta.env.VITE_TRACKING_URL || 'http://localhost:8003';

let _store = null;

/** Call once in main.jsx: initTrackingClient(store) */
export function initTrackingClient(store) {
  _store = store;
}

function getAccessToken() {
  return _store?.getState().auth.access || localStorage.getItem('access');
}

async function request(method, path, body = null) {
  const token = getAccessToken();
  const res = await fetch(`${TRACKING_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 404) {
    const err = new Error('No tracking found.');
    err.status = 404;
    throw err;
  }
  if (res.status === 401) {
    throw new Error('Your session has expired. Please log in again.');
  }
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.detail || json?.message || `Tracking request failed (${res.status})`);
  }
  return res.json();
}

export const trackingService = {
  /** Current tracking state + checkpoints for an order. Throws {status:404} if none. */
  getTracking: (orderId) => request('GET', `/tracking/${orderId}`),

  /** Begin tracking an order (auto-advances via the service's Celery jobs). */
  startTracking: (orderId, destinationAddress = null) =>
    request('POST', '/tracking/start', {
      order_id: orderId,
      destination_address: destinationAddress,
      auto_advance: true,
    }),

  /** Manually advance tracking one stage (handy for demos). */
  advance: (orderId) => request('POST', `/tracking/${orderId}/advance`),
};
