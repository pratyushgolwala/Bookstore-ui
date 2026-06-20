import { useSelector, useDispatch } from 'react-redux';
import { Heart } from 'lucide-react';
import { toggleWishlist, selectIsWishlisted } from '../../store/slices/wishlistSlice';
import { emitToast } from '../../utils/toastBus';
import useAuthGate from '../../hooks/useAuthGate';
import COLORS from '../../constants/colors';

/**
 * WishlistButton — a heart toggle that adds/removes a book from the wishlist.
 *
 * @param {object}  props.book   the book object
 * @param {number}  props.size   icon size (default 18)
 * @param {string}  props.className optional extra classes for positioning
 */
function WishlistButton({ book, size = 18, className = '' }) {
  const dispatch = useDispatch();
  const requireAuth = useAuthGate();
  const wishlisted = useSelector(selectIsWishlisted(book?.id));

  const handleClick = (e) => {
    e.stopPropagation();
    // Guests get the "Sign in to continue" gate; signed-in users toggle.
    requireAuth(() => {
      dispatch(toggleWishlist(book));
      emitToast(
        wishlisted ? 'info' : 'success',
        wishlisted ? `Removed from wishlist.` : `"${book.title}" added to wishlist.`,
      );
    });
  };

  return (
    <button
      onClick={handleClick}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={wishlisted}
      className={`flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-90 ${className}`}
      style={{
        width: size + 16,
        height: size + 16,
        backgroundColor: 'rgba(15,15,15,0.65)',
        backdropFilter: 'blur(6px)',
        border: `1px solid ${wishlisted ? COLORS.accent[400] : 'rgba(255,255,255,0.15)'}`,
      }}
    >
      <Heart
        size={size}
        color={wishlisted ? COLORS.accent[400] : '#ffffff'}
        fill={wishlisted ? COLORS.accent[400] : 'transparent'}
        strokeWidth={2}
      />
    </button>
  );
}

export default WishlistButton;
