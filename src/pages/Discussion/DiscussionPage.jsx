import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, Plus, Pin, Lock, Clock, MessageCircle, Search, Filter, Send } from 'lucide-react';
import COLORS from '../../constants/colors';
import useToast from '../../hooks/useToast';
import { selectIsAuthenticated, selectCurrentUser } from '../../store/slices/authSlice';
import { discussionsService } from '../../services/discussionsService';
import './DiscussionPage.css';

/**
 * DiscussionPage — Reddit/Threads-style discussion forum
 * Read-only for anonymous users, full access for authenticated users
 */
function DiscussionPage() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const { toast } = useToast();

  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadCategory, setNewThreadCategory] = useState('general');
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General Discussion' },
    { value: 'recommendations', label: 'Book Recommendations' },
    { value: 'authors', label: 'Author Discussions' },
    { value: 'events', label: 'Events & Book Clubs' },
    { value: 'help', label: 'Help & Support' },
  ];

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const response = await discussionsService.getThreads();
      const threadsData = response.data?.results || response.data || [];
      setThreads(threadsData);
    } catch (error) {
      toast.error(error.message || 'Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const fetchThreadDetails = async (threadId) => {
    try {
      const response = await discussionsService.getThreadById(threadId);
      setSelectedThread(response.data);
    } catch (error) {
      toast.error(error.message || 'Failed to load thread details');
    }
  };

  const handleCreateThread = async () => {
    if (!isAuthenticated) {
      toast.error('You need to login to create a thread.');
      return;
    }
    if (!newThreadTitle.trim()) {
      toast.warning('Please enter a thread title.');
      return;
    }

    try {
      const result = await discussionsService.createThread({
        title: newThreadTitle,
        category: newThreadCategory,
      });
      console.log('Create thread result:', result);
      toast.success('Thread created successfully!');
      setShowNewThreadModal(false);
      setNewThreadTitle('');
      setNewThreadCategory('general');
      fetchThreads();
    } catch (error) {
      console.error('Create thread error:', error);
      toast.error(error.message || 'Failed to create thread');
    }
  };

  const handleAddPost = async () => {
    if (!isAuthenticated) {
      toast.error('You need to login to post in discussions.');
      return;
    }
    if (!newPostContent.trim()) {
      toast.warning('Please enter your message.');
      return;
    }

    try {
      const result = await discussionsService.addPostToThread(selectedThread.id, {
        content: newPostContent,
      });
      console.log('Add post result:', result);
      toast.success('Post added successfully!');
      setNewPostContent('');
      fetchThreadDetails(selectedThread.id);
    } catch (error) {
      console.error('Add post error:', error);
      toast.error(error.message || 'Failed to add post');
    }
  };

  const getTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(dateString).toLocaleDateString();
  };

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || thread.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="discussion-page" style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <div className="discussion-container">
        {/* Header */}
        <div className="discussion-header">
          <div className="header-content">
            <div className="header-title-section">
              <div className="header-icon" style={{ background: COLORS.gradient.primary }}>
                <MessageSquare size={28} color="#fff" />
              </div>
              <div>
                <h1 className="page-title" style={{ color: COLORS.text.primary }}>
                  Community Discussions
                </h1>
                <p className="page-subtitle" style={{ color: COLORS.text.secondary }}>
                  Share your thoughts and connect with fellow readers
                </p>
              </div>
            </div>

            <button
              className="create-thread-btn"
              onClick={() => isAuthenticated ? setShowNewThreadModal(true) : toast.error('You need to login to create a thread.')}
              style={{ background: COLORS.gradient.primary }}
            >
              <Plus size={18} />
              New Thread
            </button>
          </div>

          {/* Search and Filters */}
          <div className="discussion-filters">
            <div className="search-box" style={{ borderColor: COLORS.border, backgroundColor: COLORS.surface }}>
              <Search size={18} color={COLORS.text.tertiary} />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ color: COLORS.text.primary, backgroundColor: 'transparent' }}
              />
            </div>

            <div className="custom-dropdown" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
              <Filter size={18} color={COLORS.text.tertiary} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ color: COLORS.text.primary, backgroundColor: 'transparent' }}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value} style={{ backgroundColor: COLORS.surface, color: COLORS.text.primary }}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Threads List */}
        <div className="threads-grid">
          {loading ? (
            <div className="loading-state" style={{ color: COLORS.text.secondary }}>
              <MessageSquare size={48} className="loading-icon" />
              <p>Loading discussions...</p>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="empty-state" style={{ color: COLORS.text.secondary }}>
              <MessageSquare size={64} opacity={0.3} />
              <h3 style={{ color: COLORS.text.primary }}>No threads found</h3>
              <p>Be the first to start a discussion!</p>
            </div>
          ) : (
            filteredThreads.map((thread) => (
              <div
                key={thread.id}
                className="thread-card"
                onClick={() => fetchThreadDetails(thread.id)}
                style={{
                  backgroundColor: COLORS.surface,
                  borderColor: COLORS.border,
                }}
              >
                <div className="thread-header-row">
                  <div className="thread-badges">
                    {thread.is_pinned && (
                      <span className="thread-badge pinned" style={{ backgroundColor: COLORS.primary[900] + '40', color: COLORS.primary[600] }}>
                        <Pin size={12} />
                        Pinned
                      </span>
                    )}
                    {thread.is_locked && (
                      <span className="thread-badge locked" style={{ backgroundColor: COLORS.neutral[700] + '40', color: COLORS.neutral[500] }}>
                        <Lock size={12} />
                        Locked
                      </span>
                    )}
                    <span className="thread-category" style={{ backgroundColor: COLORS.primary[500] + '20', color: COLORS.primary[600] }}>
                      {categories.find(c => c.value === thread.category)?.label || thread.category}
                    </span>
                  </div>
                </div>

                <h3 className="thread-title" style={{ color: COLORS.text.primary }}>
                  {thread.title}
                </h3>

                <div className="thread-meta">
                  <span style={{ color: COLORS.text.secondary }}>
                    by <strong style={{ color: COLORS.primary[600] }}>{thread.author_name}</strong>
                  </span>
                  <span className="thread-stats" style={{ color: COLORS.text.tertiary }}>
                    <MessageCircle size={14} />
                    {thread.post_count} replies
                  </span>
                  <span className="thread-time" style={{ color: COLORS.text.tertiary }}>
                    <Clock size={14} />
                    {getTimeAgo(thread.last_post_at || thread.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Thread Detail Modal */}
        {selectedThread && (
          <div className="modal-overlay" onClick={() => setSelectedThread(null)}>
            <div className="thread-modal" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: COLORS.surface }}>
              <div className="modal-header" style={{ borderColor: COLORS.border }}>
                <div>
                  <h2 style={{ color: COLORS.text.primary }}>{selectedThread.title}</h2>
                  <p style={{ color: COLORS.text.secondary }}>
                    Started by <strong>{selectedThread.author_name}</strong> • {getTimeAgo(selectedThread.created_at)}
                  </p>
                </div>
                <button className="modal-close" onClick={() => setSelectedThread(null)} style={{ color: COLORS.text.secondary }}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                {selectedThread.posts?.map((post, index) => (
                  <div key={post.id} className="post-card" style={{ backgroundColor: index === 0 ? COLORS.primary[500] + '10' : COLORS.surfaceLight, borderColor: COLORS.border }}>
                    <div className="post-header">
                      <div>
                        <strong style={{ color: COLORS.primary[600] }}>{post.author_name}</strong>
                        <span style={{ color: COLORS.text.tertiary }}> • {getTimeAgo(post.created_at)}</span>
                        {post.is_edited && <span style={{ color: COLORS.text.tertiary, fontSize: '0.8rem' }}> (edited)</span>}
                        {index === 0 && <span style={{ color: COLORS.primary[600], fontSize: '0.75rem', marginLeft: '0.5rem', fontWeight: 600 }}>OP</span>}
                      </div>
                    </div>
                    <p className="post-content" style={{ color: COLORS.text.primary }}>{post.content}</p>
                  </div>
                ))}

                {/* Add Post Form */}
                <div className="add-post-section" style={{ backgroundColor: COLORS.surfaceLight, borderColor: COLORS.border }}>
                  <textarea
                    className="post-textarea"
                    placeholder={isAuthenticated ? "Share your thoughts..." : "Login to join the discussion..."}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    disabled={!isAuthenticated || selectedThread.is_locked}
                    style={{
                      backgroundColor: COLORS.surface,
                      color: COLORS.text.primary,
                      borderColor: COLORS.border,
                    }}
                  />
                  <button
                    className="post-submit-btn"
                    onClick={handleAddPost}
                    disabled={!isAuthenticated || selectedThread.is_locked}
                    style={{
                      background: isAuthenticated && !selectedThread.is_locked ? COLORS.gradient.primary : COLORS.neutral[600],
                      cursor: isAuthenticated && !selectedThread.is_locked ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <Send size={18} />
                    Post Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Thread Modal */}
        {showNewThreadModal && (
          <div className="modal-overlay" onClick={() => setShowNewThreadModal(false)}>
            <div className="new-thread-modal" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: COLORS.surface }}>
              <div className="modal-header" style={{ borderColor: COLORS.border }}>
                <h2 style={{ color: COLORS.text.primary }}>Create New Thread</h2>
                <button className="modal-close" onClick={() => setShowNewThreadModal(false)} style={{ color: COLORS.text.secondary }}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label style={{ color: COLORS.text.secondary }}>Thread Title</label>
                  <input
                    type="text"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    placeholder="Enter a descriptive title..."
                    style={{
                      backgroundColor: COLORS.surfaceLight,
                      color: COLORS.text.primary,
                      borderColor: COLORS.border,
                    }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ color: COLORS.text.secondary }}>Category</label>
                  <div className="custom-dropdown" style={{ backgroundColor: COLORS.surfaceLight, borderColor: COLORS.border }}>
                    <select
                      value={newThreadCategory}
                      onChange={(e) => setNewThreadCategory(e.target.value)}
                      style={{
                        backgroundColor: 'transparent',
                        color: COLORS.text.primary,
                      }}
                    >
                      {categories.slice(1).map(cat => (
                        <option key={cat.value} value={cat.value} style={{ backgroundColor: COLORS.surface, color: COLORS.text.primary }}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  className="submit-thread-btn"
                  onClick={handleCreateThread}
                  style={{ background: COLORS.gradient.primary }}
                >
                  <Plus size={18} />
                  Create Thread
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiscussionPage;
