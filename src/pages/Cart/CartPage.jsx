import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Minus, Plus, Trash2, ShoppingBag, ArrowRight,
  Tag, ChevronRight, Sparkles, Truck, Shield, RotateCcw,
  BookOpen, X, Lock,
} from 'lucide-react';
import {
  selectCartItems,
  selectCartTotal,
  selectCartLoading,
  selectCartCoupon,
  computeCouponDiscount,
  setCoupon,
  clearCoupon,
  fetchCart,
  incrementCartItem,
  decrementCartItem,
  removeCartItem,
  clearCartThunk,
  setCartItemQuantity,
  addToCart,
} from '../../store/slices/cartSlice';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { couponsService } from '../../services/couponsService';
import { formatCurrency } from '../../utils/formatters';
import COLORS from '../../constants/colors';
import Button from '../../components/ui/Button';
import MetalButton from '../../components/ui/MetalButton';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import AuthorLink from '../../components/ui/AuthorLink';

/* ─── Constants ──────────────────────────────────────────── */
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 49;
const TAX_RATE = 0.08;

/* ─── Helpers ────────────────────────────────────────────── */
const coverUrl = (item) =>
  item.coverImageUrl ||
  `https://picsum.photos/seed/${item.id}/120/180`;

/* ─── Main Component ──────────────────────────────────────── */
function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const items    = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const cartLoading = useSelector(selectCartLoading);
  const appliedCoupon = useSelector(selectCartCoupon);

  const [couponCode, setCouponCode]   = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [removingId, setRemovingId]   = useState(null);
  const [mounted, setMounted]         = useState(false);

  const couponApplied = !!appliedCoupon;

  // Always pull the latest cart from the backend when landing on this page
  // (covers direct navigation / refresh, and reflects assistant changes).
  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart());
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    // Slight delay so items animate in on mount
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const shipping     = subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;

  // Derive the discount from the applied coupon against the *live* subtotal so
  // it stays correct if the cart changes after the coupon was applied.
  const discount     = computeCouponDiscount(appliedCoupon, subtotal);
  const tax          = +((subtotal - discount) * TAX_RATE).toFixed(2);
  const total        = subtotal - discount + shipping + tax;
  const freeShipPct  = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountAway   = FREE_SHIPPING_THRESHOLD - subtotal;

  const handleRemove = (id) => {
    setRemovingId(id);
    setTimeout(() => {
      dispatch(removeCartItem(id));
      setRemovingId(null);
    }, 280);
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) { setCouponError('Please enter a coupon code.'); return; }

    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await couponsService.validate(code, subtotal);
      const data = res?.data ?? res;
      dispatch(setCoupon(data));
      setCouponError('');
    } catch (err) {
      dispatch(clearCoupon());
      setCouponError(err.message || 'Invalid coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(clearCoupon());
    setCouponCode('');
    setCouponError('');
  };

  /* ── Not logged in ─────────────────────────────────────── */
  if (!isAuthenticated) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center px-6 pb-16"
        style={{ minHeight: '100vh', backgroundColor: COLORS.background, paddingTop: '100px' }}
      >
        <div
          className="w-24 h-24 rounded-sm flex items-center justify-center mb-8"
          style={{
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <Lock size={42} style={{ color: COLORS.brass }} strokeWidth={1.5} />
        </div>

        <h1 className="font-display text-3xl font-bold mb-3" style={{ color: COLORS.text.primary }}>
          Please log in to view your cart
        </h1>
        <p className="mb-8 max-w-sm leading-relaxed" style={{ color: COLORS.text.secondary }}>
          Your cart is tied to your account. Sign in to see saved items and continue shopping.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <MetalButton variant="gold" onClick={() => navigate('/login')} className="gap-2">
            Sign In
            <ArrowRight size={18} />
          </MetalButton>
          <Button size="lg" variant="outline" onClick={() => navigate('/books')}>
            Browse the Library
          </Button>
        </div>
      </div>
    );
  }

  /* ── Loading (initial fetch, nothing cached yet) ───────── */
  if (cartLoading && items.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: '100vh', backgroundColor: COLORS.background, paddingTop: '100px' }}
      >
        <div
          className="w-12 h-12 rounded-full animate-spin mb-4"
          style={{ border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.brass }}
        />
        <p style={{ color: COLORS.text.secondary }}>Loading your cart…</p>
      </div>
    );
  }

  /* ── Empty state ───────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center px-6 pb-16"
        style={{ minHeight: '100vh', backgroundColor: COLORS.background, paddingTop: '100px' }}
      >
        {/* Icon mark */}
        <div
          className="w-24 h-24 rounded-sm flex items-center justify-center mb-8 relative"
          style={{
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <ShoppingBag size={44} style={{ color: COLORS.brass }} strokeWidth={1.5} />
          <span
            className="absolute -top-2 -right-2 w-7 h-7 rounded-sm flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: COLORS.cloth, color: '#fdf6e6' }}
          >0</span>
        </div>

        <h1 className="font-display text-3xl font-bold mb-3" style={{ color: COLORS.text.primary }}>
          Your cart is empty
        </h1>
        <p className="mb-8 max-w-sm leading-relaxed" style={{ color: COLORS.text.secondary }}>
          Looks like you haven't added any books yet. Explore the library and find your next great read.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <MetalButton variant="gold" onClick={() => navigate('/books')} className="gap-2">
            Browse the Library
            <ArrowRight size={18} />
          </MetalButton>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/')}
          >
            Go Home
          </Button>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-12">
          {[
            { icon: <Truck size={16} />, text: `Free shipping over ${formatCurrency(FREE_SHIPPING_THRESHOLD)}` },
            { icon: <Shield size={16} />, text: 'Secure checkout' },
            { icon: <RotateCcw size={16} />, text: '30-day returns' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm" style={{ color: COLORS.text.tertiary }}>
              <span style={{ color: COLORS.primary[600] }}>{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Cart with items ───────────────────────────────────── */
  return (
    <div
      className="px-4 sm:px-6 py-8 max-w-6xl mx-auto"
      style={{ minHeight: '100vh', color: COLORS.text.primary, paddingTop: '100px' }}
    >
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-sm mt-1" style={{ color: COLORS.text.tertiary }}>
            {items.reduce((s, i) => s + i.quantity, 0)} item{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => dispatch(clearCartThunk())}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
          style={{ color: COLORS.error, border: `1px solid ${COLORS.error}33`, backgroundColor: `${COLORS.error}11` }}
        >
          <Trash2 size={14} /> Clear all
        </button>
      </div>

      {/* Free shipping progress */}
      {subtotal < FREE_SHIPPING_THRESHOLD && (
        <div
          className="rounded-xl p-4 mb-6 flex flex-col gap-2"
          style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.primary[300]}` }}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2" style={{ color: COLORS.text.secondary }}>
              <Truck size={15} style={{ color: COLORS.primary[600] }} />
              Add {formatCurrency(amountAway)} more for <span style={{ color: COLORS.success }} className="font-semibold ml-1">free shipping</span>
            </span>
            <span className="font-semibold" style={{ color: COLORS.primary[700] }}>
              {Math.round(freeShipPct)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.surfaceLight }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${freeShipPct}%`,
                background: COLORS.gradient.primary,
              }}
            />
          </div>
        </div>
      )}

      {subtotal >= FREE_SHIPPING_THRESHOLD && (
        <div
          className="rounded-xl p-3 mb-6 flex items-center gap-2 text-sm font-semibold"
          style={{
            backgroundColor: `${COLORS.success}11`,
            border: `1px solid ${COLORS.success}33`,
            color: COLORS.success,
          }}
        >
          <Sparkles size={15} /> You've unlocked free shipping!
        </div>
      )}

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* ── Items list ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item, idx) => (
            <CartItem
              key={item.id}
              item={item}
              idx={idx}
              mounted={mounted}
              removing={removingId === item.id}
              onRemove={() => handleRemove(item.id)}
              onIncrement={() => dispatch(incrementCartItem(item.id))}
              onDecrement={() => dispatch(decrementCartItem(item.id))}
              onSetQty={(q) => dispatch(setCartItemQuantity({ itemId: item.id, quantity: q }))}
            />
          ))}

          {/* Continue shopping */}
          <button
            onClick={() => navigate('/books')}
            className="flex items-center gap-2 text-sm mt-2 transition-opacity hover:opacity-70"
            style={{ color: COLORS.text.tertiary }}
          >
            <ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} />
            Continue Shopping
          </button>
        </div>

        {/* ── Order summary ───────────────────────────────── */}
        <div className="lg:col-span-1">
          <div
            className="rounded-2xl p-6 sticky top-24"
            style={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              boxShadow: `0 8px 40px rgba(0,0,0,0.35)`,
            }}
          >
            <h2 className="text-lg font-bold mb-5">Order Summary</h2>

            {/* Summary rows */}
            <div className="space-y-3">
              <SummaryRow label={`Subtotal (${items.reduce((s, i) => s + i.quantity, 0)} items)`} value={formatCurrency(subtotal)} />
              <SummaryRow label="Shipping" value={shipping === 0 ? 'Free 🎉' : formatCurrency(shipping)} />
              {couponApplied && appliedCoupon && (
                <SummaryRow label={`Coupon (${appliedCoupon.code})`} value={`−${formatCurrency(discount)}`} accent />
              )}
              <SummaryRow label="Tax (8%)" value={formatCurrency(tax)} />
            </div>

            <div className="my-4 border-t" style={{ borderColor: COLORS.border }} />

            <SummaryRow label="Total" value={formatCurrency(total)} bold />

            {/* Coupon input */}
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: COLORS.text.tertiary }}>
                <Tag size={12} /> Promo Code
              </p>
              {couponApplied && appliedCoupon ? (
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold"
                  style={{ backgroundColor: `${COLORS.success}15`, border: `1px solid ${COLORS.success}33`, color: COLORS.success }}
                >
                  <span>
                    {appliedCoupon.code} applied
                    {appliedCoupon.discount_type === 'percentage'
                      ? ` — ${parseFloat(appliedCoupon.discount_value)}% off`
                      : ` — ${formatCurrency(parseFloat(appliedCoupon.discount_value))} off`}
                  </span>
                  <button onClick={handleRemoveCoupon} className="hover:opacity-70">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && !couponLoading && handleApplyCoupon()}
                    placeholder="Enter code…"
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all"
                    style={{
                      backgroundColor: COLORS.surfaceLight,
                      color: COLORS.text.primary,
                      border: `1px solid ${couponError ? COLORS.error : COLORS.border}`,
                    }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:brightness-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: COLORS.gradient.primary, color: '#fff' }}
                  >
                    {couponLoading ? 'Applying…' : 'Apply'}
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-xs mt-1.5" style={{ color: COLORS.error }}>{couponError}</p>
              )}
              {!couponApplied && !couponError && (
                <p className="text-xs mt-1.5" style={{ color: COLORS.text.tertiary }}>Have a promo code? Enter it above to save.</p>
              )}
            </div>

            {/* Checkout button */}
            <button
              onClick={() => navigate('/checkout')}
              className="mt-5 w-full flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-base tracking-wide transition-all hover:brightness-105 active:scale-[0.98]"
              style={{
                backgroundColor: COLORS.brass,
                color: COLORS.ink,
                boxShadow: '0 8px 20px rgba(185,138,62,0.30)',
              }}
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </button>

            {/* Trust row */}
            <div
              className="flex justify-around mt-5 pt-4 border-t"
              style={{ borderColor: COLORS.border }}
            >
              {[
                { icon: <Shield size={14} />, text: 'Secure' },
                { icon: <RotateCcw size={14} />, text: '30-day returns' },
                { icon: <Truck size={14} />, text: 'Fast delivery' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1 text-center">
                  <span style={{ color: COLORS.primary[600] }}>{icon}</span>
                  <span className="text-xs" style={{ color: COLORS.text.tertiary }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended section — placeholder for API integration */}
      <RecommendedSection />
    </div>
  );
}

/* ─── CartItem Row ────────────────────────────────────────── */
function CartItem({ item, idx, mounted, removing, onRemove, onIncrement, onDecrement, onSetQty }) {
  const [editingQty, setEditingQty] = useState(false);
  const [qtyInput, setQtyInput]     = useState(String(item.quantity));

  // Sync local input when item.quantity changes externally
  useEffect(() => {
    if (!editingQty) setQtyInput(String(item.quantity));
  }, [item.quantity, editingQty]);

  const commitQty = () => {
    const q = parseInt(qtyInput, 10);
    if (!isNaN(q) && q > 0) onSetQty(q);
    else setQtyInput(String(item.quantity));
    setEditingQty(false);
  };

  return (
    <div
      className="flex gap-4 p-4 rounded-2xl transition-all duration-300"
      style={{
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        opacity: removing ? 0 : mounted ? 1 : 0,
        transform: removing
          ? 'translateX(12px) scale(0.97)'
          : mounted
          ? 'translateY(0)'
          : `translateY(${12 + idx * 4}px)`,
        transitionDelay: mounted ? '0ms' : `${idx * 50}ms`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
      }}
    >
      {/* Cover */}
      <div className="relative shrink-0 group">
        <img
          src={coverUrl(item)}
          alt={item.title}
          className="w-16 h-24 object-cover rounded-lg"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
          onError={(e) => { e.target.src = `https://picsum.photos/seed/${item.id}/120/180`; }}
        />
        <div
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        >
          <BookOpen size={20} color="#fff" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-semibold leading-tight line-clamp-2 text-sm sm:text-base"
          style={{ color: COLORS.text.primary }}
        >
          {item.title}
        </h3>
        {item.author && (
          <AuthorLink
            author={item.author}
            className="text-xs mt-0.5 block w-fit max-w-full"
            style={{ color: COLORS.text.tertiary }}
          />
        )}
        <p
          className="mt-2 text-base font-bold"
          style={{ color: COLORS.brass, display: 'inline-block' }}
        >
          {formatCurrency(item.price)}
        </p>
        <p className="text-xs mt-0.5" style={{ color: COLORS.text.tertiary }}>
          {formatCurrency(item.price * item.quantity)} total
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-end justify-between gap-3 shrink-0">
        {/* Remove */}
        <button
          onClick={onRemove}
          aria-label="Remove item"
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:opacity-80 active:scale-90"
          style={{ color: COLORS.error, backgroundColor: `${COLORS.error}18` }}
        >
          <Trash2 size={14} />
        </button>

        {/* Quantity stepper */}
        <div
          className="flex items-center rounded-xl overflow-hidden"
          style={{ border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.surfaceLight }}
        >
          <StepBtn onClick={onDecrement} aria="Decrease quantity">
            <Minus size={13} />
          </StepBtn>

          {editingQty ? (
            <input
              type="number"
              min="1"
              value={qtyInput}
              onChange={(e) => setQtyInput(e.target.value)}
              onBlur={commitQty}
              onKeyDown={(e) => { if (e.key === 'Enter') commitQty(); if (e.key === 'Escape') { setEditingQty(false); setQtyInput(String(item.quantity)); } }}
              autoFocus
              className="w-10 text-center text-sm font-semibold bg-transparent outline-none"
              style={{ color: COLORS.text.primary }}
            />
          ) : (
            <button
              onClick={() => setEditingQty(true)}
              className="w-10 text-center text-sm font-semibold transition-colors hover:opacity-70"
              style={{ color: COLORS.text.primary, lineHeight: '32px' }}
              title="Click to edit quantity"
            >
              {item.quantity}
            </button>
          )}

          <StepBtn onClick={onIncrement} aria="Increase quantity">
            <Plus size={13} />
          </StepBtn>
        </div>
      </div>
    </div>
  );
}

/* ─── Stepper button ──────────────────────────────────────── */
function StepBtn({ children, onClick, aria }) {
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      className="w-8 h-8 flex items-center justify-center transition-all hover:brightness-125 active:scale-90"
      style={{ color: COLORS.text.secondary }}
    >
      {children}
    </button>
  );
}

/* ─── Summary row ─────────────────────────────────────────── */
function SummaryRow({ label, value, bold, accent }) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={bold ? 'font-bold text-base' : 'text-sm'}
        style={{ color: bold ? COLORS.text.primary : COLORS.text.secondary }}
      >
        {label}
      </span>
      <span
        className={bold ? 'font-bold text-lg' : 'text-sm font-medium'}
        style={{
          color: bold
            ? COLORS.secondary[500]
            : accent
            ? COLORS.success
            : COLORS.text.primary,
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── Recommended section (mock — wire to API later) ─────── */
const MOCK_RECS = [
  { id: 'r1', title: 'The Name of the Wind', author: 'Patrick Rothfuss', price: 14.99 },
  { id: 'r2', title: 'Dune',                  author: 'Frank Herbert',    price: 12.99 },
  { id: 'r3', title: 'Foundation',             author: 'Isaac Asimov',    price: 11.99 },
  { id: 'r4', title: 'The Hobbit',             author: 'J.R.R. Tolkien',  price: 10.99 },
];

function RecommendedSection() {
  const navigate  = useNavigate();

  // These are placeholder picks with non-catalog ids, so they can't be added
  // to the real (backend) cart directly. Send the shopper to search for the
  // title instead — they can add the real book from there.
  const handleFind = (book) => {
    navigate(`/books?search=${encodeURIComponent(book.title)}`);
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles size={18} style={{ color: COLORS.secondary[400] }} />
          You might also like
        </h2>
        <button
          onClick={() => navigate('/books')}
          className="text-sm flex items-center gap-1 transition-opacity hover:opacity-70"
          style={{ color: COLORS.text.tertiary }}
        >
          See all <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {MOCK_RECS.map((book) => (
          <div
            key={book.id}
            className="rounded-xl p-4 flex flex-col gap-3 group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
            style={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <img
              src={`https://picsum.photos/seed/${book.id}/120/180`}
              alt={book.title}
              className="w-full h-40 object-cover rounded-lg"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
            />
            <div className="min-w-0">
              <p className="font-semibold text-sm line-clamp-1" style={{ color: COLORS.text.primary }}>{book.title}</p>
              <AuthorLink
                author={book.author}
                className="text-xs mt-0.5 block w-fit max-w-full"
                style={{ color: COLORS.text.tertiary }}
              />
              <p className="font-bold text-sm mt-1" style={{ color: COLORS.secondary[500] }}>{formatCurrency(book.price)}</p>
            </div>
            <button
              onClick={() => handleFind(book)}
              className="w-full py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95"
              style={{ background: COLORS.gradient.primary, color: '#fff' }}
            >
              Find in catalog
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CartPage;
