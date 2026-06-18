import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useDiscussionWebSocket — React hook for real-time discussion thread updates.
 *
 * Connects to the Django Channels WebSocket for a given thread and provides:
 * - Live incoming posts/edits/deletes
 * - Send post, edit, delete, and typing events
 * - Connection state and reconnection logic
 *
 * Usage:
 *   const { messages, sendPost, editPost, deletePost, sendTyping, isConnected, typingUsers }
 *     = useDiscussionWebSocket(threadId, token);
 */

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useDiscussionWebSocket(threadId, token) {
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);

  // Clear typing indicator after 3 seconds of no activity
  const typingTimers = useRef({});

  const connect = useCallback(() => {
    if (!threadId || !token) return;

    const url = `${WS_BASE_URL}/ws/discussions/${threadId}/?token=${token}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'new_post':
          setMessages((prev) => [...prev, data.post]);
          break;

        case 'post_edited':
          setMessages((prev) =>
            prev.map((msg) => (msg.id === data.post.id ? data.post : msg))
          );
          break;

        case 'post_deleted':
          setMessages((prev) => prev.filter((msg) => msg.id !== data.post_id));
          break;

        case 'user_typing': {
          const { user_email, user_name } = data;
          setTypingUsers((prev) => {
            if (prev.find((u) => u.email === user_email)) return prev;
            return [...prev, { email: user_email, name: user_name }];
          });
          // Clear after 3s
          if (typingTimers.current[user_email]) {
            clearTimeout(typingTimers.current[user_email]);
          }
          typingTimers.current[user_email] = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u.email !== user_email));
          }, 3000);
          break;
        }

        case 'thread_locked':
          // The parent component can react to this via messages state or a callback
          setMessages((prev) => [
            ...prev,
            { id: 'system-locked', type: 'system', content: 'This thread has been locked.' },
          ]);
          break;

        case 'connection_established':
          // Connection confirmed — set initial active users
          if (data.active_users) {
            setActiveUsers(data.active_users);
          }
          break;

        case 'presence_update':
          // Update active users list
          setActiveUsers(data.active_users || []);
          break;

        case 'error':
          console.warn('[WS] Server error:', data.message);
          break;

        default:
          break;
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      wsRef.current = null;

      // Don't reconnect on intentional close or auth failure
      if (event.code === 4001 || event.code === 4004) return;

      // Auto-reconnect with backoff
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts.current += 1;
        const delay = RECONNECT_DELAY_MS * reconnectAttempts.current;
        reconnectTimeout.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      // onclose will fire after this, handling reconnection
    };
  }, [threadId, token]);

  // Connect on mount / threadId change
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (wsRef.current) {
        wsRef.current.close(1000);
        wsRef.current = null;
      }
      // Clear typing timers
      Object.values(typingTimers.current).forEach(clearTimeout);
    };
  }, [connect]);

  // ─── Send helpers ────────────────────────────────────────────────────

  const sendJson = useCallback((payload) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  const sendPost = useCallback(
    (content) => sendJson({ action: 'new_post', content }),
    [sendJson]
  );

  const editPost = useCallback(
    (postId, content) => sendJson({ action: 'edit_post', post_id: postId, content }),
    [sendJson]
  );

  const deletePost = useCallback(
    (postId) => sendJson({ action: 'delete_post', post_id: postId }),
    [sendJson]
  );

  const sendTyping = useCallback(
    () => sendJson({ action: 'typing' }),
    [sendJson]
  );

  return {
    isConnected,
    messages,
    setMessages,
    typingUsers,
    activeUsers,
    sendPost,
    editPost,
    deletePost,
    sendTyping,
  };
}
