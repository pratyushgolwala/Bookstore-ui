import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Star, StarHalf, BookOpen, ThumbsUp, Filter, Search } from 'lucide-react';
import COLORS from '../../constants/colors';
import useToast from '../../hooks/useToast';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { reviewsService } from '../../services/reviewsService';
import './ReviewsPage.css';

/**
 * ReviewsPage — Book reviews platform
 * Read-only for anonymous users, write access for authenticated users
 */
function ReviewsPage() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { toast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    book_title: '',
    rating: 5,
    title: '',
    body: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);

  // Fetch reviews from API
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsService.getReviews();
      const reviewsData = response.data?.results || response.data || [];
      setReviews(reviewsData);
    } catch (error) {
      console.error('Fetch reviews error:', error);
      toast.error(error.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error('You need to login to post a review.');
      return;
    }

    if (!newReview.book_title.trim()) {
      toast.warning('Please enter a book title.');
      return;
    }

    if (!newReview.title.trim() || !newReview.body.trim()) {
      toast.warning('Please fill in all fields.');
      return;
    }

    try {
      const result = await reviewsService.createReview(newReview);
      console.log('Create review result:', result);
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      setNewReview({ book_title: '', rating: 5, title: '', body: '' });
      fetchReviews();
    } catch (error) {
      console.error('Submit review error:', error);
      toast.error(error.message || 'Failed to submit review');
    }
  };

  const handleToggleHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      toast.error('You need to login to mark reviews as helpful.');
      return;
    }

    try {
      const response = await reviewsService.toggleHelpful(reviewId);
      // Update local state
      setReviews(reviews.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            is_helpful: response.data.is_helpful,
            helpful_count: response.data.helpful_count,
          };
        }
        return review;
      }));
      toast.success(response.data.is_helpful ? 'Marked as helpful!' : 'Removed from helpful');
    } catch (error) {
      toast.error(error.message || 'Failed to update helpful status');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={18} fill={COLORS.secondary[500]} color={COLORS.secondary[500]} />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" size={18} fill={COLORS.secondary[500]} color={COLORS.secondary[500]} />);
    }

    const remaining = 5 - Math.ceil(rating);
    for (let i = 0; i < remaining; i++) {
      stars.push(<Star key={`empty-${i}`} size={18} color={COLORS.neutral[600]} />);
    }

    return stars;
  };

  const getTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(dateString).toLocaleDateString();
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.book_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = filterRating === 'all' || Math.floor(review.rating) === parseInt(filterRating);
    return matchesSearch && matchesRating;
  }).sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="reviews-page" style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <div className="reviews-container">
        {/* Header */}
        <div className="reviews-header">
          <div className="header-content">
            <div className="header-title-section">
              <div className="header-icon" style={{ background: COLORS.gradient.accent }}>
                <BookOpen size={28} color="#fff" />
              </div>
              <div>
                <h1 className="page-title" style={{ color: COLORS.text.primary }}>
                  Book Reviews
                </h1>
                <p className="page-subtitle" style={{ color: COLORS.text.secondary }}>
                  Read honest reviews from our community
                </p>
              </div>
            </div>

            <button
              className="write-review-btn"
              onClick={() => isAuthenticated ? setShowReviewForm(true) : toast.error('You need to login to write a review.')}
              style={{ background: COLORS.gradient.accent }}
            >
              <Star size={18} />
              Write a Review
            </button>
          </div>

          {/* Filters */}
          <div className="reviews-filters">
            <div className="search-box" style={{ borderColor: COLORS.border }}>
              <Search size={18} color={COLORS.text.tertiary} />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ color: COLORS.text.primary, backgroundColor: 'transparent' }}
              />
            </div>

            <div className="filter-dropdown" style={{ borderColor: COLORS.border }}>
              <Filter size={18} color={COLORS.text.tertiary} />
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                style={{ color: COLORS.text.primary, backgroundColor: COLORS.surface }}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div className="sort-dropdown" style={{ borderColor: COLORS.border }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ color: COLORS.text.primary, backgroundColor: COLORS.surface }}
              >
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="reviews-grid">
          {loading ? (
            <div className="loading-state" style={{ color: COLORS.text.secondary }}>
              <BookOpen size={48} className="loading-icon" />
              <p>Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="empty-state" style={{ color: COLORS.text.secondary }}>
              <BookOpen size={64} opacity={0.3} />
              <h3 style={{ color: COLORS.text.primary }}>No reviews found</h3>
              <p>Be the first to share your thoughts on a book!</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review.id}
                className="review-card"
                style={{
                  backgroundColor: COLORS.surface,
                  borderColor: COLORS.border,
                }}
              >
                <div className="review-header">
                  <div>
                    <h3 className="review-title" style={{ color: COLORS.text.primary }}>
                      {review.title}
                    </h3>
                    <p className="book-title" style={{ color: COLORS.secondary[500] }}>
                      {review.book_title}
                    </p>
                  </div>
                  <div className="review-rating">{renderStars(review.rating)}</div>
                </div>

                <p className="review-body" style={{ color: COLORS.text.secondary }}>
                  {review.body}
                </p>

                <div className="review-footer">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar" style={{ background: COLORS.gradient.primary }}>
                      {review.user_name.charAt(0)}
                    </div>
                    <div>
                      <p className="reviewer-name" style={{ color: COLORS.text.primary }}>
                        {review.user_name}
                      </p>
                      <p className="review-time" style={{ color: COLORS.text.tertiary }}>
                        {getTimeAgo(review.created_at)}
                      </p>
                    </div>
                  </div>

                  <button
                    className="helpful-btn"
                    onClick={() => handleToggleHelpful(review.id)}
                    style={{ 
                      color: review.is_helpful ? COLORS.secondary[500] : COLORS.text.tertiary,
                      borderColor: review.is_helpful ? COLORS.secondary[500] : COLORS.border,
                      backgroundColor: review.is_helpful ? COLORS.secondary[500] + '20' : 'transparent'
                    }}
                  >
                    <ThumbsUp size={16} fill={review.is_helpful ? COLORS.secondary[500] : 'none'} />
                    {review.helpful_count > 0 ? review.helpful_count : 'Helpful'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="modal-overlay" onClick={() => setShowReviewForm(false)}>
            <div className="review-form-modal" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: COLORS.surface }}>
              <div className="modal-header" style={{ borderColor: COLORS.border }}>
                <h2 style={{ color: COLORS.text.primary }}>Write a Review</h2>
                <button className="modal-close" onClick={() => setShowReviewForm(false)} style={{ color: COLORS.text.secondary }}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label style={{ color: COLORS.text.secondary }}>Book Title</label>
                  <input
                    type="text"
                    value={newReview.book_title}
                    onChange={(e) => setNewReview({ ...newReview, book_title: e.target.value })}
                    placeholder="Enter the exact book title..."
                    style={{
                      backgroundColor: COLORS.surfaceLight,
                      color: COLORS.text.primary,
                      borderColor: COLORS.border,
                    }}
                  />
                  <p style={{ color: COLORS.text.tertiary, fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Please enter the exact book title as it appears in our store
                  </p>
                </div>

                <div className="form-group">
                  <label style={{ color: COLORS.text.secondary }}>Rating</label>
                  <div className="rating-selector">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating })}
                        className="rating-star-btn"
                      >
                        <Star
                          size={32}
                          fill={rating <= newReview.rating ? COLORS.secondary[500] : 'transparent'}
                          color={rating <= newReview.rating ? COLORS.secondary[500] : COLORS.neutral[600]}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ color: COLORS.text.secondary }}>Review Title</label>
                  <input
                    type="text"
                    value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    placeholder="Sum up your review in one line"
                    style={{
                      backgroundColor: COLORS.surfaceLight,
                      color: COLORS.text.primary,
                      borderColor: COLORS.border,
                    }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ color: COLORS.text.secondary }}>Your Review</label>
                  <textarea
                    value={newReview.body}
                    onChange={(e) => setNewReview({ ...newReview, body: e.target.value })}
                    placeholder="Share your thoughts about this book..."
                    rows={6}
                    style={{
                      backgroundColor: COLORS.surfaceLight,
                      color: COLORS.text.primary,
                      borderColor: COLORS.border,
                    }}
                  />
                </div>

                <button
                  className="submit-review-btn"
                  onClick={handleSubmitReview}
                  style={{ background: COLORS.gradient.accent }}
                >
                  <Star size={18} />
                  Submit Review
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
