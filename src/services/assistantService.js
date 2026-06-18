/**
 * assistantService — talks to the FastAPI AI assistant service.
 *
 * The assistant runs as a separate microservice (not the Django backend), so
 * it has its own base URL. It verifies the SAME JWT access token the rest of
 * the app uses, so we attach `Authorization: Bearer <access>` on every call.
 *
 * Unlike apiClient (which auto-refreshes against the Django auth endpoints),
 * this is a thin wrapper: on 401 we surface a clear "session expired" error so
 * the UI can prompt re-login. Token refresh is handled by the normal app flow.
 */

const ASSISTANT_URL =
  import.meta.env.VITE_ASSISTANT_URL || 'http://localhost:8002';

let _store = null;

/** Call once in main.jsx: initAssistantClient(store) */
export function initAssistantClient(store) {
  _store = store;
}

function getAccessToken() {
  return _store?.getState().auth.access || localStorage.getItem('access');
}

/**
 * Send a chat turn to the assistant.
 *
 * @param {{ message: string, history?: Array<{role: string, content: string}>,
 *           session_id?: string|null }} payload
 * @returns {Promise<{ reply: string, session_id: string|null, created_at: string }>}
 */
async function chat({ message, history = [], session_id = null, timeoutMs = 45000 }) {
  const token = getAccessToken();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(`${ASSISTANT_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, history, session_id }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('That took too long to answer. Please try again.');
    }
    throw new Error('Could not reach the assistant. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 401) {
    throw new Error('Your session has expired. Please log in again to use the assistant.');
  }
  if (res.status === 503) {
    throw new Error('The assistant is warming up or temporarily unavailable. Please try again in a moment.');
  }

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    const message =
      json?.detail ||
      json?.message ||
      `Assistant request failed (${res.status})`;
    throw new Error(message);
  }

  return res.json();
}

/**
 * Fetch AI book recommendations.
 *
 * The assistant runs a full tool-calling loop server-side, so this can take
 * a while. We bound it with an AbortController timeout so the UI never hangs
 * indefinitely (e.g. when the browser suspends a long in-flight request).
 *
 * @param {{ query?: string, limit?: number, timeoutMs?: number }} payload
 * @returns {Promise<{ results: Array<{ book_id: string, title: string,
 *           reason: string|null, score: number }> }>}
 */
async function recommend({ query = null, limit = 6, timeoutMs = 45000 } = {}) {
  const token = getAccessToken();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(`${ASSISTANT_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, limit }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Recommendations took too long to load. Try refreshing.');
    }
    throw new Error('Could not reach the assistant. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 401) {
    throw new Error('Your session has expired. Please log in again.');
  }
  if (res.status === 503) {
    throw new Error('The assistant is warming up. Please try again in a moment.');
  }
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.detail || json?.message || `Recommendation request failed (${res.status})`);
  }

  return res.json();
}

export const assistantService = { chat, recommend };
