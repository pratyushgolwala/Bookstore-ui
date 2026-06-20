import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MessageSquareText, X, Send, Sparkles, RotateCcw, Square } from 'lucide-react';
import COLORS from '../../constants/colors';
import { assistantService } from '../../services/assistantService';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { fetchCart } from '../../store/slices/cartSlice';
import { emitToast } from '../../utils/toastBus';
import MarkdownMessage from './MarkdownMessage';
import './ChatWidget.css';

/**
 * ChatWidget — Folio's reading-room assistant.
 *
 * A small book-cloth button sits in the bottom-right corner; clicking it opens
 * an editorial chat panel with a smooth scale/fade transition. The panel keeps
 * a running conversation and streams each turn through the FastAPI assistant
 * service (which grounds answers in the live catalog via tool calls).
 *
 * Auth: the assistant requires a valid JWT. We only show the launcher to
 * logged-in users; assistantService attaches the access token automatically.
 */

const GREETING = {
  role: 'assistant',
  content:
    "Hello — I'm the Folio assistant. Ask me to find a book, suggest something to read, or look up an author.",
};

const SUGGESTIONS = [
  'Recommend a cozy mystery',
  'Books by Frank Herbert',
  'Something under ₹500',
];

function ChatWidget() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');
  const [sessionId, setSessionId] = useState(null);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  // Tracks whether the current turn touched the cart/order, so we only refetch
  // (and celebrate) when something actually changed.
  const cartTouchedRef = useRef(false);

  // Auto-scroll to the newest message whenever the thread grows.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending, status]);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 280);
  }, [open]);

  // Abort any in-flight stream if the widget unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(
    async (text) => {
      const message = (text ?? input).trim();
      if (!message || sending) return;

      // History sent to the model = everything so far except the greeting.
      const history = messages
        .filter((m) => m !== GREETING)
        .map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [...prev, { role: 'user', content: message }]);
      setInput('');
      setSending(true);
      setStatus('Thinking…');
      cartTouchedRef.current = false;

      // Index of the assistant message we'll stream into (appended lazily on
      // the first token so the typing indicator shows until then).
      let assistantIndex = -1;
      const appendToAssistant = (chunk) => {
        setMessages((prev) => {
          const next = [...prev];
          if (assistantIndex === -1) {
            assistantIndex = next.length;
            next.push({ role: 'assistant', content: chunk });
          } else {
            next[assistantIndex] = {
              ...next[assistantIndex],
              content: next[assistantIndex].content + chunk,
            };
          }
          return next;
        });
      };

      const controller = new AbortController();
      abortRef.current = controller;

      await assistantService.chatStream(
        { message, history, session_id: sessionId },
        {
          signal: controller.signal,
          onStatus: (s) => {
            setStatus(s);
            // The backend announces cart/order actions via status events.
            // Flag the turn so we refresh the cart when it finishes.
            if (/cart|order/i.test(s)) cartTouchedRef.current = true;
          },
          onToken: (chunk) => {
            setStatus('');
            appendToAssistant(chunk);
          },
          onAction: (action) => {
            // The assistant asked the app to navigate (e.g. open tracking).
            if (action?.target === 'order_tracking' && action.order_id) {
              navigate(`/orders/${action.order_id}/track`);
              setOpen(false);
            }
          },
          onDone: () => {
            setStatus('');
            setSending(false);
            // Live-sync the storefront cart with what the assistant just did.
            if (cartTouchedRef.current) {
              dispatch(fetchCart());
              emitToast('success', '🛒 Your cart was updated by the assistant.');
              cartTouchedRef.current = false;
            }
          },
          onError: (msg) => {
            setStatus('');
            setSending(false);
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: msg, isError: true },
            ]);
          },
        },
      );

      // Safety net: if the stream ended without an explicit done/error.
      setSending(false);
      setStatus('');
    },
    [input, sending, messages, sessionId, dispatch, navigate],
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Stop the in-flight response. Aborting the fetch ends the stream; the
  // onDone/safety-net path resets the sending state.
  const stop = useCallback(() => {
    abortRef.current?.abort();
    setSending(false);
    setStatus('');
  }, []);

  const resetThread = () => {
    abortRef.current?.abort();
    setMessages([GREETING]);
    setSessionId(null);
    setSending(false);
    setStatus('');
    emitToast('info', 'Started a new conversation.');
  };

  // Only logged-in users can talk to the assistant (it requires a JWT).
  if (!isAuthenticated) return null;

  return (
    <>
      {/* ── Launcher button ── */}
      <button
        className={`cw-launcher ${open ? 'cw-launcher-hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Open the Folio assistant"
        style={{ backgroundColor: COLORS.cloth }}
      >
        <MessageSquareText size={22} color="#fdf6e6" />
      </button>

      {/* ── Chat panel ── */}
      <div
        className={`cw-panel ${open ? 'cw-panel-open' : ''}`}
        role="dialog"
        aria-label="Folio assistant"
        aria-hidden={!open}
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
      >
        {/* Header */}
        <div className="cw-header" style={{ borderColor: COLORS.border }}>
          <div className="cw-header-title">
            <span className="cw-badge" style={{ backgroundColor: COLORS.cloth }}>
              <Sparkles size={14} color="#fdf6e6" />
            </span>
            <div>
              <p className="cw-title font-display" style={{ color: COLORS.text.primary }}>
                Reading Room Assistant
              </p>
              <p className="cw-subtitle" style={{ color: COLORS.text.tertiary }}>
                Grounded in the Folio catalog
              </p>
            </div>
          </div>
          <div className="cw-header-actions">
            <button
              className="cw-icon-btn"
              onClick={resetThread}
              aria-label="Start a new conversation"
              title="New conversation"
              style={{ color: COLORS.text.tertiary }}
            >
              <RotateCcw size={16} />
            </button>
            <button
              className="cw-icon-btn"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              style={{ color: COLORS.text.tertiary }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="cw-messages" ref={scrollRef}>
          {messages.map((m, i) => (
            <div
              key={i}
              className={`cw-row ${m.role === 'user' ? 'cw-row-user' : 'cw-row-assistant'}`}
            >
              <div
                className="cw-bubble"
                style={
                  m.role === 'user'
                    ? { backgroundColor: COLORS.cloth, color: '#fdf6e6' }
                    : {
                        backgroundColor: COLORS.surfaceLight,
                        color: m.isError ? COLORS.error : COLORS.text.primary,
                        border: `1px solid ${COLORS.border}`,
                      }
                }
              >
                {m.role === 'assistant' && !m.isError ? (
                  <MarkdownMessage text={m.content} />
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}

          {/* Thinking indicator — shown the whole time the assistant is
              working, even after partial text has streamed, so it's clear the
              response isn't finished yet. */}
          {sending && (
            <div className="cw-row cw-row-assistant">
              <div
                className="cw-bubble cw-typing"
                style={{ backgroundColor: COLORS.surfaceLight, border: `1px solid ${COLORS.border}` }}
              >
                <span className="cw-typing-dots">
                  <span style={{ backgroundColor: COLORS.brass }} />
                  <span style={{ backgroundColor: COLORS.brass }} />
                  <span style={{ backgroundColor: COLORS.brass }} />
                </span>
                <span className="cw-status-text" style={{ color: COLORS.text.tertiary }}>
                  {status || 'Thinking…'}
                </span>
              </div>
            </div>
          )}

          {/* Starter suggestions — only on a fresh thread */}
          {messages.length === 1 && !sending && (
            <div className="cw-suggestions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="cw-suggestion"
                  onClick={() => send(s)}
                  style={{ borderColor: COLORS.border, color: COLORS.text.secondary }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="cw-composer" style={{ borderColor: COLORS.border }}>
          <textarea
            ref={inputRef}
            className="cw-input"
            placeholder="Ask about a book, author, or genre…"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            style={{ color: COLORS.text.primary }}
          />
          {sending ? (
            <button
              className="cw-send cw-stop"
              onClick={stop}
              aria-label="Stop generating"
              title="Stop"
              style={{ backgroundColor: COLORS.surfaceLighter }}
            >
              <Square size={14} color={COLORS.brass} fill={COLORS.brass} />
            </button>
          ) : (
            <button
              className="cw-send"
              onClick={() => send()}
              disabled={!input.trim()}
              aria-label="Send message"
              style={{ backgroundColor: COLORS.cloth }}
            >
              <Send size={16} color="#fdf6e6" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatWidget;
