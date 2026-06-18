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
 * Stream a chat turn via Server-Sent Events.
 *
 * EventSource can't send POST bodies or Authorization headers, so we use the
 * Fetch streaming API and parse the `data: {json}` frames ourselves.
 *
 * @param {{ message: string, history?: Array, session_id?: string|null }} payload
 * @param {{ onStatus?: (text: string) => void,
 *           onToken?: (chunk: string) => void,
 *           onDone?: (fullText: string) => void,
 *           onError?: (message: string) => void,
 *           signal?: AbortSignal }} handlers
 */
async function chatStream(
  { message, history = [], session_id = null },
  { onStatus, onToken, onDone, onError, signal } = {},
) {
  const token = getAccessToken();

  let res;
  try {
    res = await fetch(`${ASSISTANT_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, history, session_id }),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') return;
    onError?.('Could not reach the assistant. Check your connection and try again.');
    return;
  }

  if (res.status === 401) {
    onError?.('Your session has expired. Please log in again to use the assistant.');
    return;
  }
  if (!res.ok || !res.body) {
    const json = await res.json().catch(() => null);
    onError?.(json?.detail || json?.message || `Assistant request failed (${res.status})`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const handleFrame = (frame) => {
    const line = frame.trim();
    if (!line.startsWith('data:')) return;
    let evt;
    try {
      evt = JSON.parse(line.slice(5).trim());
    } catch {
      return;
    }
    if (evt.type === 'status') onStatus?.(evt.data);
    else if (evt.type === 'token') onToken?.(evt.data);
    else if (evt.type === 'done') onDone?.(evt.data);
    else if (evt.type === 'error') onError?.(evt.data);
  };

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line (\n\n).
      let sep;
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        handleFrame(frame);
      }
    }
    if (buffer.trim()) handleFrame(buffer);
  } catch (err) {
    if (err.name !== 'AbortError') {
      onError?.('The connection was interrupted. Please try again.');
    }
  }
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

export const assistantService = { chat, chatStream, recommend };
