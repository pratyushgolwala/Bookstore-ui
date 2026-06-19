import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, Lock, CheckCircle2, ArrowLeft, Loader2, ShoppingBag,
  Shield, Truck, RotateCcw, Sparkles, Gift, MapPin, Smartphone, XCircle,
} from 'lucide-react';
import { selectCartItems, selectCartTotal, selectCartCoupon, computeCouponDiscount, clearCartThunk } from '../../store/slices/cartSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { ordersService } from '../../services/ordersService';
import { paymentsService, loadRazorpayScript } from '../../services/paymentsService';
import { formatCurrency } from '../../utils/formatters';
import COLORS from '../../constants/colors';
import MetalButton from '../../components/ui/MetalButton';

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 49;

const EMPTY_DELIVERY = {
  full_name: '', email: '', phone: '',
  line1: '', line2: '', city: '', state: '', postal_code: '', country: 'IN',
  notes: '',
};

function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const coupon = useSelector(selectCartCoupon);
  const currentUser = useSelector(selectCurrentUser);

  const discount = computeCouponDiscount(coupon, subtotal);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = +((subtotal - discount) * TAX_RATE).toFixed(2);
  const total = subtotal - discount + shipping + tax;

  const [delivery, setDelivery] = useState(EMPTY_DELIVERY);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1=review, 2=delivery, 3=payment

  // Pre-fill the delivery form from the backend (user contact + last address),
  // falling back to the logged-in user's name/email from the store.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await ordersService.getDeliveryDefaults();
        const d = res?.data || res || {};
        if (active) {
          setDelivery((prev) => ({ ...EMPTY_DELIVERY, ...prev, ...d }));
        }
      } catch {
        // Fall back to store values if the endpoint isn't reachable yet.
        if (active && currentUser) {
          setDelivery((prev) => ({
            ...prev,
            full_name: prev.full_name
              || `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim(),
            email: prev.email || currentUser.email || '',
            phone: prev.phone || currentUser.phone || '',
          }));
        }
      }
    })();
    return () => { active = false; };
  }, [currentUser]);

  if (items.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDelivery((d) => ({ ...d, [name]: value }));
  };

  const isDeliveryValid =
    delivery.full_name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(delivery.email) &&
    delivery.line1.trim().length > 2 &&
    delivery.city.trim().length > 1 &&
    delivery.state.trim().length > 1 &&
    delivery.postal_code.trim().length >= 4;

  // ── Razorpay payment flow ──────────────────────────────────
  const handlePayNow = async () => {
    setProcessing(true);
    setError('');

    try {
      // 1. Ensure the Razorpay checkout script is available.
      const ready = await loadRazorpayScript();
      if (!ready) {
        throw new Error('Could not load the payment gateway. Check your connection.');
      }

      // 2. Create the bookstore order + Razorpay order server-side.
      const payload = items.map((i) => ({ book_id: i.book_id, quantity: i.quantity }));
      const res = await paymentsService.createOrder(payload, coupon?.code || null);
      const data = res?.data || res;

      const {
        order_id,
        razorpay_order_id,
        razorpay_key_id,
        amount,
        currency,
      } = data;

      // 3. Open Razorpay Checkout (UPI + other test methods).
      const rzp = new window.Razorpay({
        key: razorpay_key_id,
        amount,
        currency,
        order_id: razorpay_order_id,
        name: 'Folio Bookstore',
        description: `Order ${String(order_id).slice(0, 8).toUpperCase()}`,
        prefill: {
          name: currentUser?.first_name || currentUser?.email?.split('@')[0] || '',
          email: currentUser?.email || '',
        },
        theme: { color: COLORS.primary[500] },
        method: { upi: true },
        // 4. On success — verify the signature server-side.
        handler: async (response) => {
          try {
            await paymentsService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setOrderId(order_id);
            setSuccess(true);
            dispatch(clearCartThunk());
          } catch (verifyErr) {
            // Verification failed — mark the order failed (no pending limbo).
            paymentsService.markFailed(razorpay_order_id, 'Signature verification failed').catch(() => {});
            setError(verifyErr.message || 'Payment verification failed. If you were charged, contact support.');
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            // User closed the modal — mark the order failed so it doesn't sit pending.
            paymentsService.markFailed(razorpay_order_id, 'Payment cancelled by user').catch(() => {});
            setError('Payment cancelled. You can try again whenever you are ready.');
          },
        },
      });

      rzp.on('payment.failed', (resp) => {
        setProcessing(false);
        // Payment failed at the gateway — mark the order failed.
        paymentsService.markFailed(razorpay_order_id, resp?.error?.description || 'Payment failed').catch(() => {});
        setError(resp?.error?.description || 'Payment failed. Please try again.');
      });

      rzp.open();
    } catch (err) {
      setProcessing(false);
      setError(err.message || 'Could not start payment. Please try again.');
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SUCCESS SCREEN
  // ═══════════════════════════════════════════════════════════════
  if (success) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: '100vh', backgroundColor: COLORS.background, paddingTop: '100px' }}
      >
        <div className="relative mb-8">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${COLORS.success}22 0%, transparent 70%)`,
              border: `3px solid ${COLORS.success}`,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            <CheckCircle2 size={56} style={{ color: COLORS.success }} />
          </div>
          <div
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: COLORS.gradient.primary }}
          >
            <Sparkles size={16} color="#fff" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
          Payment Successful!
        </h1>
        <p className="text-base mb-2" style={{ color: COLORS.text.secondary }}>
          Thank you for your purchase. Your books are on their way!
        </p>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8"
          style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.text.tertiary }}
        >
          Order ID: <span className="font-mono font-semibold" style={{ color: COLORS.secondary[500] }}>
            {orderId?.slice(0, 8).toUpperCase()}
          </span>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          <MetalButton variant="gold" onClick={() => navigate('/orders')} className="gap-2">
            <ShoppingBag size={16} /> View My Orders
          </MetalButton>
          <MetalButton variant="silver" onClick={() => navigate('/books')} className="gap-2">
            Continue Shopping
          </MetalButton>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
          {[
            { icon: <Truck size={20} />, text: 'Ships within 2-3 days' },
            { icon: <Shield size={20} />, text: 'Payment secured' },
            { icon: <Gift size={20} />, text: 'Reward points earned' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex flex-col items-center gap-2 text-center">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.primary[600] }}
              >
                {icon}
              </div>
              <span className="text-xs" style={{ color: COLORS.text.tertiary }}>{text}</span>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(122, 158, 91, 0.4); }
            50% { box-shadow: 0 0 0 16px rgba(122, 158, 91, 0); }
          }
        `}</style>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // CHECKOUT
  // ═══════════════════════════════════════════════════════════════
  return (
    <div
      className="px-4 sm:px-6 py-8 max-w-5xl mx-auto"
      style={{ minHeight: '100vh', color: COLORS.text.primary, paddingTop: '100px' }}
    >
      <button
        onClick={() => step > 1 ? setStep(step - 1) : navigate('/cart')}
        className="flex items-center gap-2 text-sm mb-6 transition-opacity hover:opacity-70"
        style={{ color: COLORS.text.tertiary }}
      >
        <ArrowLeft size={16} />
        {step === 3 ? 'Back to Delivery' : step === 2 ? 'Back to Review' : 'Back to Cart'}
      </button>

      <div className="flex items-center gap-3 mb-8">
        <StepIndicator num={1} label="Review" active={step >= 1} current={step === 1} />
        <div className="flex-1 h-0.5 rounded" style={{ backgroundColor: step >= 2 ? COLORS.secondary[500] : COLORS.surfaceLight }} />
        <StepIndicator num={2} label="Delivery" active={step >= 2} current={step === 2} />
        <div className="flex-1 h-0.5 rounded" style={{ backgroundColor: step >= 3 ? COLORS.secondary[500] : COLORS.surfaceLight }} />
        <StepIndicator num={3} label="Payment" active={step >= 3} current={step === 3} />
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* ─── Left: Content (Review / Delivery / Payment) ─── */}
        <div className="lg:col-span-3">
          {step === 1 && (
            <ReviewStep items={items} onContinue={() => setStep(2)} />
          )}
          {step === 2 && (
            <DeliveryStep
              delivery={delivery}
              onChange={handleDeliveryChange}
              isValid={isDeliveryValid}
              onContinue={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <PaymentStep
              processing={processing}
              error={error}
              total={total}
              onPay={handlePayNow}
            />
          )}
        </div>

        <div className="lg:col-span-2">
          <div
            className="rounded-2xl p-5 sticky top-24"
            style={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
            }}
          >
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ShoppingBag size={16} style={{ color: COLORS.secondary[500] }} />
              Order Summary
            </h3>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.coverImageUrl || `https://picsum.photos/seed/${item.id}/48/72`}
                    alt={item.title}
                    className="w-10 h-14 object-cover rounded-md shrink-0"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                    <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold shrink-0" style={{ color: COLORS.secondary[500] }}>
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: COLORS.border }}>
              <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
              {coupon && discount > 0 && (
                <SummaryRow label={`Coupon (${coupon.code})`} value={`−${formatCurrency(discount)}`} accent />
              )}
              <SummaryRow
                label="Shipping"
                value={shipping === 0 ? 'Free ✨' : formatCurrency(shipping)}
                accent={shipping === 0}
              />
              <SummaryRow label="Tax (8%)" value={formatCurrency(tax)} />
              <div className="pt-3 mt-2 border-t" style={{ borderColor: COLORS.border }}>
                <SummaryRow label="Total" value={formatCurrency(total)} bold />
              </div>
            </div>

            <div className="flex justify-around mt-5 pt-4 border-t" style={{ borderColor: COLORS.border }}>
              {[
                { icon: <Shield size={14} />, text: 'Secure' },
                { icon: <RotateCcw size={14} />, text: '30-day returns' },
                { icon: <Truck size={14} />, text: 'Fast delivery' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1">
                  <span style={{ color: COLORS.primary[600] }}>{icon}</span>
                  <span className="text-xs" style={{ color: COLORS.text.tertiary }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 1: REVIEW
// ═══════════════════════════════════════════════════════════════
function ReviewStep({ items, onContinue }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
    >
      <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
        <ShoppingBag size={20} style={{ color: COLORS.secondary[500] }} />
        Review Your Items
      </h2>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-3 rounded-xl"
            style={{ backgroundColor: COLORS.surfaceLight }}
          >
            <img
              src={item.coverImageUrl || `https://picsum.photos/seed/${item.id}/60/90`}
              alt={item.title}
              className="w-12 h-[72px] object-cover rounded-lg shrink-0"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm line-clamp-1" style={{ color: COLORS.text.primary }}>
                {item.title}
              </p>
              {item.author && (
                <p className="text-xs mt-0.5" style={{ color: COLORS.text.tertiary }}>{item.author}</p>
              )}
              <p className="text-xs mt-1" style={{ color: COLORS.text.secondary }}>
                Qty: {item.quantity}
              </p>
            </div>
            <p className="font-bold text-sm shrink-0" style={{ color: COLORS.secondary[500] }}>
              {formatCurrency(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <MetalButton variant="gold" fullWidth className="mt-6 gap-2" onClick={onContinue}>
        Continue to Delivery <MapPin size={16} />
      </MetalButton>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 2: DELIVERY
// ═══════════════════════════════════════════════════════════════
function DeliveryStep({ delivery, onChange, isValid, onContinue }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: COLORS.gradient.primary }}
        >
          <MapPin size={20} color="#fff" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Delivery Details</h2>
          <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
            Where should we send your books?
          </p>
        </div>
      </div>

      <p className="text-xs mb-5 mt-2" style={{ color: COLORS.text.tertiary }}>
        We've pre-filled what we know — review and complete the address.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Full Name" name="full_name" value={delivery.full_name} onChange={onChange} placeholder="John Doe" />
          <InputField label="Email" name="email" value={delivery.email} onChange={onChange} placeholder="you@example.com" type="email" />
        </div>
        <InputField label="Phone" name="phone" value={delivery.phone} onChange={onChange} placeholder="+91 98765 43210" />
        <InputField label="Address Line 1" name="line1" value={delivery.line1} onChange={onChange} placeholder="House / flat, street" />
        <InputField label="Address Line 2 (optional)" name="line2" value={delivery.line2} onChange={onChange} placeholder="Area, landmark" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField label="City" name="city" value={delivery.city} onChange={onChange} placeholder="Mumbai" />
          <InputField label="State" name="state" value={delivery.state} onChange={onChange} placeholder="Maharashtra" />
          <InputField label="Postal Code" name="postal_code" value={delivery.postal_code} onChange={onChange} placeholder="400001" />
        </div>
        <InputField label="Delivery Notes (optional)" name="notes" value={delivery.notes} onChange={onChange} placeholder="Leave at the door, call on arrival…" />
      </div>

      <MetalButton
        variant="gold"
        fullWidth
        className="mt-6 gap-2"
        onClick={onContinue}
        disabled={!isValid}
        style={{ opacity: isValid ? 1 : 0.6 }}
      >
        Continue to Payment <CreditCard size={16} />
      </MetalButton>
      {!isValid && (
        <p className="text-xs text-center mt-3" style={{ color: COLORS.text.tertiary }}>
          Please fill name, email, address, city, state and postal code.
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 2: PAYMENT (Razorpay UPI)
// ═══════════════════════════════════════════════════════════════
function PaymentStep({ processing, error, total, onPay }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: COLORS.gradient.primary }}
          >
            <Smartphone size={20} color="#fff" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Pay with UPI</h2>
            <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
              Powered by Razorpay
            </p>
          </div>
        </div>
        <span
          className="text-xs px-3 py-1.5 rounded-full font-medium"
          style={{ backgroundColor: `${COLORS.success}18`, color: COLORS.success, border: `1px solid ${COLORS.success}33` }}
        >
          🧪 Test Mode
        </span>
      </div>

      {/* UPI info panel */}
      <div
        className="rounded-2xl p-6 mb-6 flex flex-col items-center text-center gap-3"
        style={{ backgroundColor: COLORS.surfaceLight, border: `1px dashed ${COLORS.border}` }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: COLORS.gradient.primary }}
        >
          <Smartphone size={26} color="#fff" />
        </div>
        <p className="text-sm font-medium" style={{ color: COLORS.text.primary }}>
          Pay securely via any UPI app
        </p>
        <p className="text-xs leading-relaxed max-w-xs" style={{ color: COLORS.text.tertiary }}>
          You'll be redirected to Razorpay's secure checkout to complete your payment
          using GPay, PhonePe, Paytm or any UPI ID. No card details required.
        </p>
      </div>

      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
          style={{ backgroundColor: `${COLORS.error}12`, color: COLORS.error, border: `1px solid ${COLORS.error}33` }}
        >
          <XCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      <MetalButton
        variant="gold"
        fullWidth
        className="gap-2"
        onClick={onPay}
        disabled={processing}
        style={{ opacity: processing ? 0.6 : 1 }}
      >
        {processing ? (
          <><Loader2 size={18} className="animate-spin" /> Opening secure checkout…</>
        ) : (
          <><Lock size={16} /> Pay {formatCurrency(total)}</>
        )}
      </MetalButton>

      <p className="text-xs text-center mt-4 flex items-center justify-center gap-1.5" style={{ color: COLORS.text.tertiary }}>
        <Lock size={11} /> Test mode — use Razorpay's test UPI ID <span className="font-mono" style={{ color: COLORS.secondary[500] }}>success@razorpay</span>
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════
function InputField({ label, name, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider mb-1.5 block font-medium" style={{ color: COLORS.text.tertiary }}>
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-offset-0"
        style={{
          backgroundColor: COLORS.surfaceLight,
          color: COLORS.text.primary,
          border: `1px solid ${COLORS.border}`,
          '--tw-ring-color': COLORS.secondary[500] + '44',
        }}
      />
    </div>
  );
}

function StepIndicator({ num, label, active, current }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
        style={{
          backgroundColor: active ? COLORS.secondary[500] : COLORS.surfaceLight,
          color: active ? COLORS.text.inverse : COLORS.text.tertiary,
          border: current ? `2px solid ${COLORS.secondary[500]}` : 'none',
          boxShadow: current ? `0 0 0 3px ${COLORS.secondary[500]}33` : 'none',
        }}
      >
        {num}
      </div>
      <span
        className="text-sm font-medium hidden sm:inline"
        style={{ color: active ? COLORS.text.primary : COLORS.text.tertiary }}
      >
        {label}
      </span>
    </div>
  );
}

function SummaryRow({ label, value, bold, accent }) {
  return (
    <div className="flex justify-between items-center">
      <span
        className={bold ? 'font-bold text-base' : 'text-sm'}
        style={{ color: bold ? COLORS.text.primary : COLORS.text.secondary }}
      >
        {label}
      </span>
      <span
        className={bold ? 'font-bold text-lg' : 'text-sm font-medium'}
        style={{
          color: bold ? COLORS.secondary[500] : accent ? COLORS.success : COLORS.text.primary,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default CheckoutPage;
