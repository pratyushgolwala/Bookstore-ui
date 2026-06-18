import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquareText, X, Send, Sparkles, RotateCcw } from 'lucide-react';
import COLORS from '../../constants/colors';
import { assistantService } from '../../services/assistantService';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
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

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to the newest message whenever the thread grows.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 280);
  }, [open]);

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

      try {
        const res = await assistantService.chat({
          message,
          history,
          session_id: sessionId,
        });
        if (res.session_id) setSessionId(res.session_id);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.reply || "I'm not sure how to answer that." },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: err.message, isError: true },
        ]);
      } finally {
        setSending(false);
      }
    },
    [input, sending, messages, sessionId],
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const resetThread = () => {
    setMessages([GREETING]);
    setSessionId(null);
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

          {sending && (
            <div className="cw-row cw-row-assistant">
              <div
                className="cw-bubble cw-typing"
                style={{ backgroundColor: COLORS.surfaceLight, border: `1px solid ${COLORS.border}` }}
              >
                <span style={{ backgroundColor: COLORS.text.tertiary }} />
                <span style={{ backgroundColor: COLORS.text.tertiary }} />
                <span style={{ backgroundColor: COLORS.text.tertiary }} />
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
          <button
            className="cw-send"
            onClick={() => send()}
            disabled={sending || !input.trim()}
            aria-label="Send message"
            style={{ backgroundColor: COLORS.cloth }}
          >
            <Send size={16} color="#fdf6e6" />
          </button>
        </div>
      </div>
    </>
  );
}

export default ChatWidget;
