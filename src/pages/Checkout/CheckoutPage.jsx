import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, Lock, CheckCircle2, ArrowLeft, Loader2, ShoppingBag,
  Shield, Truck, RotateCcw, Sparkles, Gift, MapPin,
} from 'lucide-react';
import { selectCartItems, selectCartTotal, clearCartThunk } from '../../store/slices/cartSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { ordersService } from '../../services/ordersService';
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
  const currentUser = useSelector(selectCurrentUser);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = +((subtotal) * TAX_RATE).toFixed(2);
  const total = subtotal + shipping + tax;

  const [form, setForm] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
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

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').slice(0, 16);
      value = value.replace(/(.{4})/g, '$1 ').trim();
    }
    if (name === 'expiry') {
      value = value.replace(/\D/g, '').slice(0, 4);
      if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (name === 'cvv') value = value.replace(/\D/g, '').slice(0, 4);
    setForm((f) => ({ ...f, [name]: value }));
  };

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
        items: items.map((i) => ({ book_id: i.book_id, quantity: i.quantity })),
        payment_method: 'card',
        delivery: {
          full_name: delivery.full_name.trim(),
          email: delivery.email.trim(),
          phone: delivery.phone.trim(),
          line1: delivery.line1.trim(),
          line2: delivery.line2.trim(),
          city: delivery.city.trim(),
          state: delivery.state.trim(),
          postal_code: delivery.postal_code.trim(),
          country: (delivery.country || 'IN').trim(),
          notes: delivery.notes.trim(),
        },
      };
      const res = await ordersService.checkout(payload);
      const data = res?.data || res;
      setOrderId(data.order_id);
      setSuccess(true);
      dispatch(clearCartThunk());
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
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
        {/* Animated success ring */}
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
          Order Placed Successfully!
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

        {/* Delivery info */}
        <div
          className="mt-10 grid grid-cols-3 gap-6 max-w-md"
        >
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
  // CHECKOUT FORM
  // ═══════════════════════════════════════════════════════════════
  return (
    <div
      className="px-4 sm:px-6 py-8 max-w-5xl mx-auto"
      style={{ minHeight: '100vh', color: COLORS.text.primary, paddingTop: '100px' }}
    >
      {/* Back button */}
      <button
        onClick={() => step > 1 ? setStep(step - 1) : navigate('/cart')}
        className="flex items-center gap-2 text-sm mb-6 transition-opacity hover:opacity-70"
        style={{ color: COLORS.text.tertiary }}
      >
        <ArrowLeft size={16} />
        {step === 3 ? 'Back to Delivery' : step === 2 ? 'Back to Review' : 'Back to Cart'}
      </button>

      {/* Progress indicator */}
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
              form={form}
              onChange={handleChange}
              isFormValid={isFormValid}
              processing={processing}
              error={error}
              total={total}
              onPay={handlePayNow}
            />
          )}
        </div>

        {/* ─── Right: Order Summary ─── */}
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

            {/* Trust badges */}
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
// STEP 2: PAYMENT
// ═══════════════════════════════════════════════════════════════
function PaymentStep({ form, onChange, isFormValid, processing, error, total, onPay }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: COLORS.gradient.primary }}
          >
            <CreditCard size={20} color="#fff" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Payment Details</h2>
            <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
              Secure checkout
            </p>
          </div>
        </div>
        <span
          className="text-xs px-3 py-1.5 rounded-full font-medium"
          style={{ backgroundColor: `${COLORS.success}18`, color: COLORS.success, border: `1px solid ${COLORS.success}33` }}
        >
          🧪 Demo Mode
        </span>
      </div>

      {/* Card visual */}
      <div
        className="rounded-2xl p-5 mb-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          minHeight: '180px',
        }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', transform: 'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.02)', transform: 'translate(-30%,30%)' }} />

        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-1">
            <div className="w-8 h-6 rounded" style={{ backgroundColor: '#e6a817' }} />
            <div className="w-5 h-6 rounded" style={{ backgroundColor: '#e6a81744' }} />
          </div>
          <span className="text-xs tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>VISA</span>
        </div>

        <p className="font-mono text-lg tracking-[0.2em] mb-4" style={{ color: 'rgba(255,255,255,0.9)' }}>
          {form.cardNumber || '•••• •••• •••• ••••'}
        </p>

        <div className="flex justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>Card Holder</p>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {form.cardName || 'YOUR NAME'}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>Expires</p>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {form.expiry || 'MM/YY'}
            </p>
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        <InputField
          label="Cardholder Name"
          name="cardName"
          value={form.cardName}
          onChange={onChange}
          placeholder="John Doe"
        />
        <InputField
          label="Card Number"
          name="cardNumber"
          value={form.cardNumber}
          onChange={onChange}
          placeholder="4242 4242 4242 4242"
          mono
        />
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Expiry Date"
            name="expiry"
            value={form.expiry}
            onChange={onChange}
            placeholder="MM/YY"
            mono
          />
          <InputField
            label="CVV"
            name="cvv"
            value={form.cvv}
            onChange={onChange}
            placeholder="•••"
            type="password"
            mono
          />
        </div>
      </div>

      {error && (
        <div
          className="mt-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
          style={{ backgroundColor: `${COLORS.error}12`, color: COLORS.error, border: `1px solid ${COLORS.error}33` }}
        >
          <span>⚠️</span> {error}
        </div>
      )}

      <MetalButton
        variant="gold"
        fullWidth
        className="mt-6 gap-2"
        onClick={onPay}
        disabled={!isFormValid || processing}
        style={{ opacity: (!isFormValid || processing) ? 0.6 : 1 }}
      >
        {processing ? (
          <><Loader2 size={18} className="animate-spin" /> Processing Payment…</>
        ) : (
          <><Lock size={16} /> Pay {formatCurrency(total)}</>
        )}
      </MetalButton>

      <p className="text-xs text-center mt-4 flex items-center justify-center gap-1.5" style={{ color: COLORS.text.tertiary }}>
        <Lock size={11} /> Demo mode — no real charge. Use any card number.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════
function InputField({ label, name, value, onChange, placeholder, type = 'text', mono }) {
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
        className={`w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all 
          focus:ring-2 focus:ring-offset-0 ${mono ? 'font-mono tracking-wider' : ''}`}
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
