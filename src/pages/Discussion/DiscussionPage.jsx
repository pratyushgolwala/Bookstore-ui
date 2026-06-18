import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  MessageSquare, Plus, Pin, Lock, Clock,
  MessageCircle, Search, ChevronDown, Send, X, User, Trash2
} from 'lucide-react';
import COLORS from '../../constants/colors';
import { emitToast } from '../../utils/toastBus';
import { selectIsAuthenticated, selectCurrentUser } from '../../store/slices/authSlice';
import { discussionsService } from '../../services/discussionsService';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import './DiscussionPage.css';

function CustomDropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="cdrop-wrapper" ref={ref}>
      <button className="cdrop-trigger" onClick={() => setOpen(!open)}
        style={{ backgroundColor: COLORS.surface, borderColor: open ? COLORS.primary[500] : COLORS.border, color: COLORS.text.primary }}>
        <span>{selected?.label}</span>
        <ChevronDown size={16} className={`cdrop-arrow ${open ? 'open' : ''}`} style={{ color: COLORS.text.tertiary }} />
      </button>
      {open && (
        <div className="cdrop-menu" style={{ backgroundColor: COLORS.surfaceLight, borderColor: COLORS.border }}>
          {options.map(opt => (
            <button key={opt.value} className="cdrop-item"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                color: opt.value === value ? COLORS.primary[600] : COLORS.text.primary,
                backgroundColor: opt.value === value ? COLORS.primary[500] + '18' : 'transparent',
              }}>
              {opt.label}
              {opt.value === value && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DiscussionPage() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser     = useSelector(selectCurrentUser);

  const [threads, setThreads]               = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadLoading, setThreadLoading]   = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadBody, setNewThreadBody]   = useState('');
  const [newThreadCategory, setNewThreadCategory] = useState('general');
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading]               = useState(true);
  const [submitting, setSubmitting]         = useState(false);
  // confirm dialog: { type: 'thread'|'post', id } or null
  const [confirmDelete, setConfirmDelete]   = useState(null);

  const categories = [
    { value: 'all',             label: 'All Categories' },
    { value: 'general',         label: '💬 General Discussion' },
    { value: 'recommendations', label: '📚 Book Recommendations' },
    { value: 'authors',         label: '✍️ Author Discussions' },
    { value: 'events',          label: '🎉 Events & Book Clubs' },
    { value: 'help',            label: '🙋 Help & Support' },
  ];

  const catLabel = (val) => categories.find(c => c.value === val)?.label?.replace(/^\S+\s/, '') || val;

  useEffect(() => { fetchThreads(); }, []);

  // Auto-open a thread if ?thread=<id> is in the URL (from a notification click)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const threadId = params.get('thread');
    if (threadId) {
      openThread(threadId);
    }
  }, []);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const res = await discussionsService.getThreads();
      // Response shape: { status: {...}, data: { count, results: [...] } | [...] }
      const payload = res?.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
          ? payload.results
          : [];
      setThreads(list);
    } catch (err) {
      emitToast('error', err.message || 'Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const openThread = async (threadId) => {
    setThreadLoading(true);
    setSelectedThread({ id: threadId, loading: true });
    try {
      const res = await discussionsService.getThreadById(threadId);
      // Response shape: { status: {...}, data: { id, title, posts: [...], ... } }
      const thread = res?.data || res;
      setSelectedThread(thread);
    } catch (err) {
      emitToast('error', err.message || 'Failed to load thread');
      setSelectedThread(null);
    } finally {
      setThreadLoading(false);
    }
  };

  const handleCreateThread = async () => {
    if (!isAuthenticated) { emitToast('error', 'You need to login to create a thread.'); return; }
    if (!newThreadTitle.trim()) { emitToast('warning', 'Please enter a thread title.'); return; }
    try {
      setSubmitting(true);
      await discussionsService.createThread({ title: newThreadTitle, category: newThreadCategory });
      emitToast('success', '🧵 Thread created successfully!');
      setShowNewThreadModal(false);
      setNewThreadTitle('');
      setNewThreadBody('');
      setNewThreadCategory('general');
      fetchThreads();
    } catch (err) {
      emitToast('error', err.message || 'Failed to create thread');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPost = async () => {
    if (!isAuthenticated) { emitToast('error', 'You need to login to reply.'); return; }
    if (!newPostContent.trim()) { emitToast('warning', 'Please write something.'); return; }
    try {
      await discussionsService.addPostToThread(selectedThread.id, { content: newPostContent });
      emitToast('success', 'Reply posted!');
      setNewPostContent('');
      await openThread(selectedThread.id);
      fetchThreads(); // refresh list so reply count updates
    } catch (err) {
      emitToast('error', err.message || 'Failed to post reply');
    }
  };

  const handleDeleteThread = (e, threadId) => {
    e.stopPropagation(); // prevent opening the thread
    setConfirmDelete({ type: 'thread', id: threadId });
  };

  const handleDeletePost = (postId) => {
    setConfirmDelete({ type: 'post', id: postId });
  };

  const performDelete = async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    try {
      if (type === 'thread') {
        await discussionsService.deleteThread(id);
        emitToast('success', 'Thread deleted.');
        setThreads(prev => prev.filter(t => t.id !== id));
        if (selectedThread?.id === id) setSelectedThread(null);
      } else {
        await discussionsService.deletePost(id);
        emitToast('success', 'Reply deleted.');
        if (selectedThread?.id) await openThread(selectedThread.id);
        fetchThreads(); // refresh list so reply count updates
      }
    } catch (err) {
      emitToast('error', err.message || `Failed to delete ${type}`);
    } finally {
      setConfirmDelete(null);
    }
  };

  const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
    return new Date(d).toLocaleDateString();
  };

  const filtered = threads.filter(t => {
    const matchQ = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchC = filterCategory === 'all' || t.category === filterCategory;
    return matchQ && matchC;
  });

  const pinned  = filtered.filter(t => t.is_pinned);
  const regular = filtered.filter(t => !t.is_pinned);
  const sorted  = [...pinned, ...regular];

  return (
    <div className="disc-page" style={{ backgroundColor: COLORS.parchment.bg }}>
      <div className="disc-container">

        {/* ── Header ── */}
        <div className="disc-header">
          <div className="disc-header-top">
            <div className="disc-title-row">
              <div className="disc-icon" style={{ backgroundColor: COLORS.surfaceLight, border: `1px solid ${COLORS.border}` }}>
                <MessageSquare size={24} color={COLORS.brass} />
              </div>
              <div>
                <span className="block text-xs tracking-[0.3em] uppercase mb-1.5" style={{ color: COLORS.brass }}>
                  The Margins
                </span>
                <h1 className="disc-title" style={{ color: COLORS.parchment.text }}>Community Discussions</h1>
                <p className="disc-subtitle" style={{ color: COLORS.parchment.textSoft }}>Share thoughts, ask questions, connect with readers</p>
              </div>
            </div>
            <button className="new-thread-btn"
              onClick={() => isAuthenticated ? setShowNewThreadModal(true) : emitToast('error', 'You need to login to create a thread.')}
              style={{ backgroundColor: COLORS.cloth, color: '#fdf6e6' }}>
              <Plus size={18} /> New Thread
            </button>
          </div>

          <div className="disc-filters">
            <div className="disc-search" style={{ borderColor: COLORS.border, backgroundColor: COLORS.surface }}>
              <Search size={16} color={COLORS.text.tertiary} />
              <input type="text" placeholder="Search threads…"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ color: COLORS.text.primary, backgroundColor: 'transparent' }} />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.text.tertiary }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <CustomDropdown options={categories} value={filterCategory} onChange={setFilterCategory} />
          </div>
        </div>

        {/* ── Thread count ── */}
        {!loading && (
          <p className="thread-count" style={{ color: COLORS.text.tertiary }}>
            {sorted.length} thread{sorted.length !== 1 ? 's' : ''}
            {filterCategory !== 'all' ? ` in ${catLabel(filterCategory)}` : ''}
          </p>
        )}

        {/* ── Thread List ── */}
        <div className="thread-list">
          {loading ? (
            <div className="state-box">
              <div className="spinner" />
              <p style={{ color: COLORS.text.secondary }}>Loading discussions…</p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="state-box">
              <MessageSquare size={56} color={COLORS.text.tertiary} />
              <h3 style={{ color: COLORS.text.primary }}>No threads yet</h3>
              <p style={{ color: COLORS.text.secondary }}>Start the first discussion!</p>
            </div>
          ) : sorted.map(thread => (
            <div key={thread.id} className="thread-row"
              onClick={() => openThread(thread.id)}
              style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>

              <div className="thread-row-left">
                <div className="thread-avatar" style={{ background: COLORS.gradient.primary }}>
                  {(thread.author_name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="thread-info">
                  <div className="thread-badges">
                    {thread.is_pinned && (
                      <span className="badge badge-pin" style={{ backgroundColor: COLORS.primary[500] + '22', color: COLORS.primary[600] }}>
                        <Pin size={11} /> Pinned
                      </span>
                    )}
                    {thread.is_locked && (
                      <span className="badge badge-lock" style={{ backgroundColor: COLORS.neutral[700] + '44', color: COLORS.neutral[500] }}>
                        <Lock size={11} /> Locked
                      </span>
                    )}
                    <span className="badge badge-cat" style={{ backgroundColor: COLORS.primary[500] + '18', color: COLORS.primary[600] }}>
                      {catLabel(thread.category)}
                    </span>
                  </div>
                  <h3 className="thread-row-title" style={{ color: COLORS.text.primary }}>{thread.title}</h3>
                  <div className="thread-meta" style={{ color: COLORS.text.tertiary }}>
                    <span style={{ color: COLORS.text.secondary }}>
                      by <strong style={{ color: COLORS.primary[600] }}>{thread.author_name}</strong>
                    </span>
                    <span className="meta-dot">·</span>
                    <Clock size={13} />
                    <span>{timeAgo(thread.last_post_at || thread.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="thread-row-right">
                {/* Delete button — only for thread author */}
                {isAuthenticated && currentUser?.email === thread.author_email && (
                  <button
                    className="thread-delete-btn"
                    onClick={(e) => handleDeleteThread(e, thread.id)}
                    title="Delete thread"
                    style={{ color: COLORS.error }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <MessageCircle size={16} color={COLORS.text.tertiary} />
                <span style={{ color: COLORS.text.tertiary, fontSize: '0.9rem', fontWeight: 600 }}>
                  {thread.post_count || 0}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Thread Detail Modal ── */}
        {selectedThread && (
          <div className="modal-overlay" onClick={() => setSelectedThread(null)}>
            <div className="thread-modal" onClick={e => e.stopPropagation()}
              style={{ backgroundColor: COLORS.surface }}>

              <div className="modal-head" style={{ borderColor: COLORS.border }}>
                <div className="modal-head-info">
                  {selectedThread.loading ? (
                    <p style={{ color: COLORS.text.secondary }}>Loading…</p>
                  ) : (
                    <>
                      <h2 style={{ color: COLORS.text.primary }}>{selectedThread.title}</h2>
                      <p style={{ color: COLORS.text.secondary, margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                        by <strong style={{ color: COLORS.primary[600] }}>{selectedThread.author_name}</strong>
                        &nbsp;·&nbsp;{timeAgo(selectedThread.created_at)}
                        &nbsp;·&nbsp;<span style={{ color: COLORS.text.tertiary }}>{selectedThread.post_count || 0} replies</span>
                      </p>
                    </>
                  )}
                </div>
                <button className="modal-close-btn" onClick={() => setSelectedThread(null)}
                  style={{ color: COLORS.text.secondary }}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                {threadLoading ? (
                  <div className="state-box"><div className="spinner" /></div>
                ) : (
                  <>
                    {(selectedThread.posts || []).length === 0 ? (
                      <div className="state-box" style={{ padding: '2rem' }}>
                        <MessageSquare size={36} color={COLORS.text.tertiary} />
                        <p style={{ color: COLORS.text.secondary }}>No replies yet. Be the first!</p>
                      </div>
                    ) : (selectedThread.posts || []).map((post) => {
                        const myEmail     = (currentUser?.email || '').trim().toLowerCase();
                        const threadOwner = (selectedThread.author_email || '').trim().toLowerCase();
                        const postAuthor  = (post.author_email || '').trim().toLowerCase();
                        const isOwnerOfThread = !!myEmail && myEmail === threadOwner;
                        const isAuthorOfPost  = !!myEmail && myEmail === postAuthor;
                        const canDelete = isAuthenticated && (isAuthorOfPost || isOwnerOfThread);
                        const isOPpost  = !!threadOwner && postAuthor === threadOwner;
                        return (
                      <div key={post.id} className={`post-bubble ${isOPpost ? 'post-op' : ''}`}
                        style={{
                          backgroundColor: isOPpost ? COLORS.primary[500] + '12' : COLORS.surfaceLight,
                          borderColor: isOPpost ? COLORS.primary[500] + '40' : COLORS.border,
                        }}>
                        <div className="post-meta">
                          <div className="post-avatar" style={{ background: COLORS.gradient.primary }}>
                            {(post.author_name || '?').charAt(0).toUpperCase()}
                          </div>
                          <strong style={{ color: COLORS.primary[600] }}>{post.author_name}</strong>
                          {isOPpost && <span className="op-tag" style={{ backgroundColor: COLORS.primary[500] + '30', color: COLORS.primary[600] }}>OP</span>}
                          {isAuthorOfPost && <span className="you-tag" style={{ backgroundColor: COLORS.secondary[500] + '25', color: COLORS.secondary[500] }}>You</span>}
                          <span style={{ color: COLORS.text.tertiary, fontSize: '0.8rem' }}>{timeAgo(post.created_at)}</span>
                          {post.is_edited && <span style={{ color: COLORS.text.tertiary, fontSize: '0.75rem' }}>(edited)</span>}
                          {/* Delete reply — reply author OR thread owner can delete (like Instagram) */}
                          {canDelete && (
                            <button
                              className="post-delete-btn"
                              onClick={() => handleDeletePost(post.id)}
                              title="Delete reply"
                              style={{ color: COLORS.error }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <p className="post-text" style={{ color: COLORS.text.primary }}>{post.content}</p>
                      </div>
                        );
                      })}

                    {/* Reply box */}
                    <div className="reply-box" style={{ borderColor: COLORS.border }}>
                      {isAuthenticated ? (
                        <>
                          <div className="reply-row">
                            <div className="reply-avatar" style={{ background: COLORS.gradient.primary }}>
                              <User size={14} color="#fff" />
                            </div>
                            <textarea
                              className="reply-textarea"
                              placeholder={selectedThread.is_locked ? 'This thread is locked.' : 'Write a reply…'}
                              value={newPostContent}
                              onChange={e => setNewPostContent(e.target.value)}
                              disabled={selectedThread.is_locked}
                              rows={3}
                              style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.text.primary, borderColor: COLORS.border }}
                              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAddPost(); }}
                            />
                          </div>
                          <div className="reply-actions">
                            <span style={{ color: COLORS.text.tertiary, fontSize: '0.8rem' }}>Ctrl+Enter to send</span>
                            <button className="reply-btn"
                              onClick={handleAddPost}
                              disabled={selectedThread.is_locked || !newPostContent.trim()}
                              style={{ background: selectedThread.is_locked ? COLORS.neutral[600] : COLORS.gradient.primary }}>
                              <Send size={16} /> Post Reply
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="login-cta" style={{ backgroundColor: COLORS.surfaceLight, borderColor: COLORS.border }}>
                          <MessageSquare size={20} color={COLORS.primary[600]} />
                          <p style={{ color: COLORS.text.secondary }}>
                            <button onClick={() => emitToast('info', 'Please login to join the discussion.')}
                              style={{ background: 'none', border: 'none', color: COLORS.primary[600], fontWeight: 600, cursor: 'pointer' }}>
                              Login
                            </button>
                            {' '}to join this discussion
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── New Thread Modal ── */}
        {showNewThreadModal && (
          <div className="modal-overlay" onClick={() => setShowNewThreadModal(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}
              style={{ backgroundColor: COLORS.surface }}>
              <div className="modal-head" style={{ borderColor: COLORS.border }}>
                <h2 style={{ color: COLORS.text.primary }}>Create New Thread</h2>
                <button className="modal-close-btn" onClick={() => setShowNewThreadModal(false)}
                  style={{ color: COLORS.text.secondary }}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="form-field">
                  <label style={{ color: COLORS.text.secondary }}>Thread Title</label>
                  <input type="text" placeholder="What do you want to discuss?"
                    value={newThreadTitle}
                    onChange={e => setNewThreadTitle(e.target.value)}
                    style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.text.primary, borderColor: COLORS.border }}
                    autoFocus
                  />
                </div>
                <div className="form-field">
                  <label style={{ color: COLORS.text.secondary }}>Category</label>
                  <CustomDropdown
                    options={categories.filter(c => c.value !== 'all')}
                    value={newThreadCategory}
                    onChange={setNewThreadCategory}
                  />
                </div>
                <button className="submit-btn" onClick={handleCreateThread} disabled={submitting}
                  style={{ background: COLORS.gradient.primary, opacity: submitting ? 0.7 : 1, boxShadow: '0 4px 14px rgba(153,95,47,0.35)' }}>
                  {submitting ? 'Creating…' : 'Create Thread'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Confirmation ── */}
        <ConfirmDialog
          open={!!confirmDelete}
          title={confirmDelete?.type === 'thread' ? 'Delete this thread?' : 'Delete this reply?'}
          message={
            confirmDelete?.type === 'thread'
              ? 'This will permanently remove the thread and all of its replies. This action cannot be undone.'
              : 'This reply will be permanently removed. This action cannot be undone.'
          }
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={performDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      </div>
    </div>
  );
}

export default DiscussionPage;
