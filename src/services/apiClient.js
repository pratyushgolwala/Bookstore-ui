/**
 * apiClient — centralised fetch wrapper with JWT auth and auto-refresh.
 *
 * - Attaches Authorization: Bearer <access> header on every request.
 * - On 401, attempts one token refresh then retries the original request.
 * - On second 401 (refresh also expired), dispatches logout.
 *
 * Import `initApiClient(store)` once in main.jsx to wire up the store.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let _store = null;

/** Call once in main.jsx: initApiClient(store) */
export function initApiClient(store) {
  _store = store;
}

function getAccessToken() {
  return _store?.getState().auth.access || localStorage.getItem('access');
}

async function request(method, endpoint, body = null, retry = true) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);

  // Auto-refresh on 401
  if (res.status === 401 && retry && _store) {
    const { refreshTokenThunk, logout } = await import('../store/slices/authSlice');
    const result = await _store.dispatch(refreshTokenThunk());

    if (refreshTokenThunk.fulfilled.match(result)) {
      // Retry once with new access token
      return request(method, endpoint, body, false);
    } else {
      _store.dispatch(logout());
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    const message =
      json?.status?.message ||          // our envelope: { status: { message } }
      json?.detail ||                   // DRF default
      json?.message ||
      (typeof json === 'object' && json !== null
        ? Object.values(json).flat().join(' ')
        : null) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  // 204 No Content — return null
  if (res.status === 204) return null;

  return res.json();
}

export const apiClient = {
  get:    (endpoint)        => request('GET',    endpoint),
  post:   (endpoint, body)  => request('POST',   endpoint, body),
  put:    (endpoint, body)  => request('PUT',    endpoint, body),
  patch:  (endpoint, body)  => request('PATCH',  endpoint, body),
  delete: (endpoint)        => request('DELETE', endpoint),
};
