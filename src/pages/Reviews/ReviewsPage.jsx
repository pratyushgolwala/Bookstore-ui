import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Star, BookOpen, ThumbsUp, Search, ChevronDown, X, Trash2 } from 'lucide-react';
import COLORS from '../../constants/colors';
import { emitToast } from '../../utils/toastBus';
import { selectIsAuthenticated, selectCurrentUser } from '../../store/slices/authSlice';
import { reviewsService } from '../../services/reviewsService';
import './ReviewsPage.css';

function CustomDropdown({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="cdrop-wrapper" ref={ref}>
      <button className="cdrop-trigger" onClick={() => setOpen(!open)}
        style={{ backgroundColor: COLORS.surface, borderColor: open ? COLORS.primary[500] : COLORS.border, color: COLORS.text.primary }}>
        <span>{selected?.label || placeholder}</span>
        <ChevronDown size={16} className={`cdrop-arrow ${open ? 'open' : ''}`} style={{ color: COLORS.text.tertiary }} />
      </button>
      {open && (
        <div className="cdrop-menu" style={{ backgroundColor: COLORS.surfaceLight, borderColor: COLORS.border }}>
          {options.map(opt => (
            <button key={opt.value} className={`cdrop-item ${opt.value === value ? 'active' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                color: opt.value === value ? COLORS.primary[600] : COLORS.text.primary,
                backgroundColor: opt.value === value ? COLORS.primary[500] + '18' : 'transparent',
              }}>
              {opt.label}
              {opt.value === value && <span className="cdrop-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewsPage() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser     = useSelector(selectCurrentUser);

  const [reviews, setReviews]           = useState([]);
  const [showForm, setShowForm]         = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [newReview, setNewReview]       = useState({ book_title: '', rating: 5, title: '', body: '' });
  const [searchQuery, setSearchQuery]   = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy]             = useState('recent');
  const [loading, setLoading]           = useState(true);

  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '5',   label: '⭐⭐⭐⭐⭐  5 Stars' },
    { value: '4',   label: '⭐⭐⭐⭐  4 Stars' },
    { value: '3',   label: '⭐⭐⭐  3 Stars' },
    { value: '2',   label: '⭐⭐  2 Stars' },
    { value: '1',   label: '⭐  1 Star' },
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'helpful', label: 'Most Helpful' },
  ];

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewsService.getReviews();
      // Response shape: { status: {...}, data: { count, results: [...] } | [...] }
      const payload = res?.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
          ? payload.results
          : [];
      setReviews(list);
    } catch (err) {
      emitToast('error', err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) { emitToast('error', 'You need to login to post a review.'); return; }
    if (!newReview.book_title.trim()) { emitToast('warning', 'Please enter a book title.'); return; }
    if (!newReview.body.trim())       { emitToast('warning', 'Please write your review.'); return; }

    try {
      setSubmitting(true);
      await reviewsService.createReview(newReview);
      emitToast('success', 'Review submitted successfully!');
      setShowForm(false);
      setNewReview({ book_title: '', rating: 5, title: '', body: '' });
      fetchReviews();
    } catch (err) {
      emitToast('error', err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleHelpful = async (reviewId) => {
    if (!isAuthenticated) { emitToast('error', 'You need to login to mark reviews as helpful.'); return; }
    try {
      const res = await reviewsService.toggleHelpful(reviewId);
      // Response: { status: {...}, data: { is_helpful, helpful_count } }
      const d = res?.data || {};
      setReviews(prev => prev.map(r =>
        r.id === reviewId ? { ...r, is_helpful: d.is_helpful, helpful_count: d.helpful_count } : r
      ));
      emitToast('success', d.is_helpful ? '👍 Marked as helpful!' : 'Removed from helpful');
    } catch (err) {
      emitToast('error', err.message || 'Failed to update');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewsService.deleteReview(reviewId);
      emitToast('success', 'Review deleted.');
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      emitToast('error', err.message || 'Failed to delete review');
    }
  };

  const renderStars = (rating, size = 16) =>
    [1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={size}
        fill={i <= rating ? COLORS.secondary[500] : 'transparent'}
        color={i <= rating ? COLORS.secondary[500] : COLORS.neutral[600]} />
    ));

  const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
    return new Date(d).toLocaleDateString();
  };

  const filtered = reviews
    .filter(r => {
      const q = searchQuery.toLowerCase();
      const matchQ = (r.book_title || '').toLowerCase().includes(q)
        || (r.title || '').toLowerCase().includes(q)
        || (r.user_name || '').toLowerCase().includes(q);
      const matchR = filterRating === 'all' || Math.floor(r.rating) === parseInt(filterRating);
      return matchQ && matchR;
    })
    .sort((a, b) => {
      if (sortBy === 'recent')  return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'rating')  return b.rating - a.rating;
      if (sortBy === 'helpful') return (b.helpful_count || 0) - (a.helpful_count || 0);
      return 0;
    });

  return (
    <div className="reviews-page" style={{ backgroundColor: COLORS.parchment.bg }}>
      <div className="reviews-container">

        {/* ── Header ── */}
        <div className="reviews-header">
          <div className="header-top">
            <div className="header-title-section">
              <div className="header-icon" style={{ background: COLORS.gradient.accent }}>
                <BookOpen size={28} color="#fff" />
              </div>
              <div>
                <h1 className="page-title" style={{ color: COLORS.parchment.text }}>Book Reviews</h1>
                <p className="page-subtitle" style={{ color: COLORS.parchment.textSoft }}>
                  Read honest reviews from our community
                </p>
              </div>
            </div>
            <button className="write-review-btn"
              onClick={() => isAuthenticated ? setShowForm(true) : emitToast('error', 'You need to login to write a review.')}
              style={{ background: COLORS.gradient.accent }}>
              <Star size={18} />
              Write a Review
            </button>
          </div>

          {/* ── Filters ── */}
          <div className="reviews-filters">
            <div className="search-box" style={{ borderColor: COLORS.border, backgroundColor: COLORS.surface }}>
              <Search size={16} color={COLORS.text.tertiary} />
              <input type="text" placeholder="Search reviews, books, authors…"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ color: COLORS.text.primary, backgroundColor: 'transparent' }} />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.text.tertiary }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <CustomDropdown options={ratingOptions} value={filterRating} onChange={setFilterRating} placeholder="All Ratings" />
            <CustomDropdown options={sortOptions}   value={sortBy}       onChange={setSortBy}       placeholder="Sort By" />
          </div>
        </div>

        {/* ── Reviews Grid ── */}
        <div className="reviews-grid">
          {loading ? (
            <div className="state-box">
              <div className="spinner" />
              <p style={{ color: COLORS.text.secondary }}>Loading reviews…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="state-box">
              <BookOpen size={56} color={COLORS.text.tertiary} />
              <h3 style={{ color: COLORS.text.primary }}>No reviews yet</h3>
              <p style={{ color: COLORS.text.secondary }}>Be the first to share your thoughts!</p>
            </div>
          ) : filtered.map(review => (
            <div key={review.id} className="review-card"
              style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>

              <div className="review-top">
                <div className="review-top-left">
                  <h3 className="review-title" style={{ color: COLORS.text.primary }}>{review.title || 'Untitled Review'}</h3>
                  <p className="review-book" style={{ color: COLORS.secondary[500] }}>📚 {review.book_title}</p>
                </div>
                <div className="review-stars">{renderStars(review.rating)}</div>
              </div>

              <p className="review-body" style={{ color: COLORS.text.secondary }}>{review.body}</p>

              <div className="review-footer">
                <div className="reviewer-row">
                  <div className="reviewer-avatar" style={{ background: COLORS.gradient.primary }}>
                    {(review.user_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="reviewer-name" style={{ color: COLORS.text.primary }}>{review.user_name || 'Anonymous'}</p>
                    <p className="reviewer-time" style={{ color: COLORS.text.tertiary }}>{timeAgo(review.created_at)}</p>
                  </div>
                </div>
                <div className="review-actions">
                  {/* Delete — only for review author */}
                  {isAuthenticated && currentUser?.email === review.user_email && (
                    <button
                      className="review-delete-btn"
                      onClick={() => handleDeleteReview(review.id)}
                      title="Delete review"
                      style={{ color: COLORS.error }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                  <button className={`helpful-btn ${review.is_helpful ? 'helpful-active' : ''}`}
                    onClick={() => handleToggleHelpful(review.id)}
                    style={{
                      borderColor: review.is_helpful ? COLORS.secondary[500] : COLORS.border,
                      color: review.is_helpful ? COLORS.secondary[500] : COLORS.text.tertiary,
                      backgroundColor: review.is_helpful ? COLORS.secondary[500] + '18' : 'transparent',
                    }}>
                    <ThumbsUp size={15} fill={review.is_helpful ? COLORS.secondary[500] : 'none'} />
                    <span>{review.helpful_count > 0 ? review.helpful_count : ''} Helpful</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Write Review Modal ── */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}
              style={{ backgroundColor: COLORS.surface }}>
              <div className="modal-head" style={{ borderColor: COLORS.border }}>
                <h2 style={{ color: COLORS.text.primary }}>Write a Review</h2>
                <button className="modal-close-btn" onClick={() => setShowForm(false)}
                  style={{ color: COLORS.text.secondary }}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-field">
                  <label style={{ color: COLORS.text.secondary }}>Book Title</label>
                  <input type="text" placeholder="e.g. The Midnight Library"
                    value={newReview.book_title}
                    onChange={e => setNewReview({ ...newReview, book_title: e.target.value })}
                    style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.text.primary, borderColor: COLORS.border }} />
                  <span className="field-hint" style={{ color: COLORS.text.tertiary }}>Enter the book title as it appears in our store</span>
                </div>

                <div className="form-field">
                  <label style={{ color: COLORS.text.secondary }}>Your Rating</label>
                  <div className="star-picker">
                    {[1,2,3,4,5].map(r => (
                      <button key={r} type="button" className="star-pick-btn"
                        onClick={() => setNewReview({ ...newReview, rating: r })}>
                        <Star size={34}
                          fill={r <= newReview.rating ? COLORS.secondary[500] : 'transparent'}
                          color={r <= newReview.rating ? COLORS.secondary[500] : COLORS.neutral[500]} />
                      </button>
                    ))}
                    <span className="rating-label" style={{ color: COLORS.text.secondary }}>
                      {['','Terrible','Poor','Okay','Good','Excellent'][newReview.rating]}
                    </span>
                  </div>
                </div>

                <div className="form-field">
                  <label style={{ color: COLORS.text.secondary }}>Review Title <span style={{ color: COLORS.text.tertiary }}>(optional)</span></label>
                  <input type="text" placeholder="Sum up your experience…"
                    value={newReview.title}
                    onChange={e => setNewReview({ ...newReview, title: e.target.value })}
                    style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.text.primary, borderColor: COLORS.border }} />
                </div>

                <div className="form-field">
                  <label style={{ color: COLORS.text.secondary }}>Your Review</label>
                  <textarea placeholder="Share what you loved or didn't love about this book…"
                    rows={5} value={newReview.body}
                    onChange={e => setNewReview({ ...newReview, body: e.target.value })}
                    style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.text.primary, borderColor: COLORS.border }} />
                </div>

                <button className="submit-btn" onClick={handleSubmit} disabled={submitting}
                  style={{ background: COLORS.gradient.accent, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Submitting…' : '⭐ Submit Review'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewsPage;
