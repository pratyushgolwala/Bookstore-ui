import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, Lock, CheckCircle2, ArrowLeft, Loader2, ShoppingBag,
} from 'lucide-react';
import { selectCartItems, selectCartTotal, clearCart } from '../../store/slices/cartSlice';
import { apiClient } from '../../services/apiClient';
import { formatCurrency } from '../../utils/formatters';
import COLORS from '../../constants/colors';
import MetalButton from '../../components/ui/MetalButton';

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 49;

function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = +((subtotal) * TAX_RATE).toFixed(2);
  const total = subtotal + shipping + tax;

  const [form, setForm] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState('');

  if (items.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    let { name, value } = e.target;
    // Format card number with spaces
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').slice(0, 16);
      value = value.replace(/(.{4})/g, '$1 ').trim();
    }
    // Format expiry as MM/YY
    if (name === 'expiry') {
      value = value.replace(/\D/g, '').slice(0, 4);
      if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    }
    // Limit CVV
    if (name === 'cvv') value = value.replace(/\D/g, '').slice(0, 4);
    setForm((f) => ({ ...f, [name]: value }));
  };

  const isFormValid =
    form.cardName.trim().length > 2 &&
    form.cardNumber.replace(/\s/g, '').length === 16 &&
    form.expiry.length === 5 &&
    form.cvv.length >= 3;

  const handlePayNow = async () => {
    if (!isFormValid) return;
    setProcessing(true);
    setError('');

    try {
      const payload = {
        items: items.map((i) => ({ book_id: i.id, quantity: i.quantity })),
        payment_method: 'card',
      };
      const res = await apiClient.post('/api/orders/checkout/', payload);
      const data = res?.data || res;
      setOrderId(data.order_id);
      setSuccess(true);
      dispatch(clearCart());
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ── Success screen ──────────────────────────────────
  if (success) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: '100vh', backgroundColor: COLORS.background, paddingTop: '100px' }}
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-bounce"
          style={{ backgroundColor: `${COLORS.success}22`, border: `2px solid ${COLORS.success}` }}
        >
          <CheckCircle2 size={48} style={{ color: COLORS.success }} />
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
          Payment Successful!
        </h1>
        <p className="text-base mb-1" style={{ color: COLORS.text.secondary }}>
          Your order has been confirmed.
        </p>
        <p className="text-sm mb-8" style={{ color: COLORS.text.tertiary }}>
          Order ID: <span style={{ color: COLORS.secondary[500] }}>{orderId}</span>
        </p>
        <div className="flex gap-3">
          <MetalButton variant="gold" onClick={() => navigate('/orders')} className="gap-2">
            <ShoppingBag size={16} /> View Orders
          </MetalButton>
          <MetalButton variant="silver" onClick={() => navigate('/books')} className="gap-2">
            Continue Shopping
          </MetalButton>
        </div>
      </div>
    );
  }

  // ── Checkout form ───────────────────────────────────
  return (
    <div
      className="px-4 sm:px-6 py-8 max-w-5xl mx-auto"
      style={{ minHeight: '100vh', color: COLORS.text.primary, paddingTop: '100px' }}
    >
      <button
        onClick={() => navigate('/cart')}
        className="flex items-center gap-2 text-sm mb-6 transition-opacity hover:opacity-70"
        style={{ color: COLORS.text.tertiary }}
      >
        <ArrowLeft size={16} /> Back to Cart
      </button>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Payment form */}
        <div className="lg:col-span-3">
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
          >
            <div className="flex items-center gap-3 mb-6">
              <CreditCard size={22} style={{ color: COLORS.secondary[500] }} />
              <h2 className="text-lg font-bold">Payment Details</h2>
              <span
                className="ml-auto text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: `${COLORS.success}22`, color: COLORS.success }}
              >
                Demo Mode — No real charge
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wide mb-1.5 block" style={{ color: COLORS.text.tertiary }}>
                  Cardholder Name
                </label>
                <input
                  name="cardName"
                  value={form.cardName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
                  style={{
                    backgroundColor: COLORS.surfaceLight,
                    color: COLORS.text.primary,
                    border: `1px solid ${COLORS.border}`,
                  }}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wide mb-1.5 block" style={{ color: COLORS.text.tertiary }}>
                  Card Number
                </label>
                <input
                  name="cardNumber"
                  value={form.cardNumber}
                  onChange={handleChange}
                  placeholder="4242 4242 4242 4242"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 font-mono tracking-widest"
                  style={{
                    backgroundColor: COLORS.surfaceLight,
                    color: COLORS.text.primary,
                    border: `1px solid ${COLORS.border}`,
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wide mb-1.5 block" style={{ color: COLORS.text.tertiary }}>
                    Expiry
                  </label>
                  <input
                    name="expiry"
                    value={form.expiry}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 font-mono"
                    style={{
                      backgroundColor: COLORS.surfaceLight,
                      color: COLORS.text.primary,
                      border: `1px solid ${COLORS.border}`,
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide mb-1.5 block" style={{ color: COLORS.text.tertiary }}>
                    CVV
                  </label>
                  <input
                    name="cvv"
                    type="password"
                    value={form.cvv}
                    onChange={handleChange}
                    placeholder="•••"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 font-mono"
                    style={{
                      backgroundColor: COLORS.surfaceLight,
                      color: COLORS.text.primary,
                      border: `1px solid ${COLORS.border}`,
                    }}
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm mt-4 px-3 py-2 rounded-lg" style={{ backgroundColor: `${COLORS.error}15`, color: COLORS.error }}>
                {error}
              </p>
            )}

            <MetalButton
              variant="gold"
              fullWidth
              className="mt-6 gap-2"
              onClick={handlePayNow}
              disabled={!isFormValid || processing}
              style={{ opacity: (!isFormValid || processing) ? 0.6 : 1 }}
            >
              {processing ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Processing…
                </>
              ) : (
                <>
                  <Lock size={16} /> Pay {formatCurrency(total)}
                </>
              )}
            </MetalButton>

            <p className="text-xs text-center mt-3" style={{ color: COLORS.text.tertiary }}>
              🔒 This is a demo — no real payment is processed. Use any card number.
            </p>
          </div>
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-2">
          <div
            className="rounded-2xl p-5 sticky top-24"
            style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
          >
            <h3 className="font-bold mb-4">Order Summary</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.coverImageUrl || `https://picsum.photos/seed/${item.id}/48/72`}
                    alt={item.title}
                    className="w-10 h-14 object-cover rounded-md"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                    <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                      Qty: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold shrink-0" style={{ color: COLORS.secondary[500] }}>
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: COLORS.border }}>
              <Row label="Subtotal" value={formatCurrency(subtotal)} />
              <Row label="Shipping" value={shipping === 0 ? 'Free' : formatCurrency(shipping)} />
              <Row label="Tax (8%)" value={formatCurrency(tax)} />
              <div className="pt-2 border-t" style={{ borderColor: COLORS.border }}>
                <Row label="Total" value={formatCurrency(total)} bold />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between">
      <span className={bold ? 'font-bold' : 'text-sm'} style={{ color: bold ? COLORS.text.primary : COLORS.text.secondary }}>
        {label}
      </span>
      <span className={bold ? 'font-bold' : 'text-sm font-medium'} style={{ color: bold ? COLORS.secondary[500] : COLORS.text.primary }}>
        {value}
      </span>
    </div>
  );
}

export default CheckoutPage;
