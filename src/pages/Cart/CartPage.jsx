import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import {
  selectCartItems,
  selectCartTotal,
  incrementItem,
  decrementItem,
  removeItem,
  clearCart,
} from '../../store/slices/cartSlice';
import { formatCurrency } from '../../utils/formatters';
import COLORS from '../../constants/colors';
import Button from '../../components/ui/Button';

function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const shipping = subtotal > 0 && subtotal < 500 ? 49 : 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: 'calc(100vh - 72px)', backgroundColor: COLORS.background }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: COLORS.surfaceLight }}
        >
          <ShoppingBag size={36} style={{ color: COLORS.text.tertiary }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
          Your cart is empty
        </h1>
        <p className="mb-6" style={{ color: COLORS.text.secondary }}>
          Browse the library and add a few books to get started.
        </p>
        <Button onClick={() => navigate('/books')} rightIcon={<ArrowRight size={18} />}>
          Explore Books
        </Button>
      </div>
    );
  }

  return (
    <div
      className="px-6 py-8 max-w-6xl mx-auto"
      style={{ minHeight: 'calc(100vh - 72px)', color: COLORS.text.primary }}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <button
          onClick={() => dispatch(clearCart())}
          className="text-sm flex items-center gap-1.5 transition-colors hover:opacity-80"
          style={{ color: COLORS.error }}
        >
          <Trash2 size={16} /> Clear cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 rounded-xl"
              style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
            >
              <img
                src={item.coverImageUrl || `https://picsum.photos/seed/${item.id}/120/180`}
                alt={item.title}
                className="w-16 h-24 object-cover rounded-md"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                {item.author && (
                  <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
                    {item.author}
                  </p>
                )}
                <p className="mt-1 font-bold" style={{ color: COLORS.secondary[500] }}>
                  {formatCurrency(item.price)}
                </p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => dispatch(removeItem(item.id))}
                  aria-label="Remove item"
                  style={{ color: COLORS.text.tertiary }}
                  className="hover:opacity-70"
                >
                  <Trash2 size={18} />
                </button>
                <div
                  className="flex items-center gap-1 rounded-lg p-1"
                  style={{ backgroundColor: COLORS.surfaceLight }}
                >
                  <IconBtn onClick={() => dispatch(decrementItem(item.id))} aria="Decrease">
                    <Minus size={14} />
                  </IconBtn>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <IconBtn onClick={() => dispatch(incrementItem(item.id))} aria="Increase">
                    <Plus size={14} />
                  </IconBtn>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div
            className="rounded-xl p-6 sticky top-24"
            style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
          >
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <Row label="Subtotal" value={formatCurrency(subtotal)} />
            <Row label="Shipping" value={shipping === 0 ? 'Free' : formatCurrency(shipping)} />
            <div className="my-3 border-t" style={{ borderColor: COLORS.border }} />
            <Row label="Total" value={formatCurrency(total)} bold />
            <Button fullWidth className="mt-5" rightIcon={<ArrowRight size={18} />}>
              Checkout
            </Button>
            <p className="text-xs text-center mt-3" style={{ color: COLORS.text.tertiary }}>
              Free shipping on orders over {formatCurrency(500)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, aria }) {
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:opacity-80"
      style={{ backgroundColor: COLORS.surface, color: COLORS.text.primary }}
    >
      {children}
    </button>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span style={{ color: bold ? COLORS.text.primary : COLORS.text.secondary }} className={bold ? 'font-bold text-lg' : 'text-sm'}>
        {label}
      </span>
      <span
        className={bold ? 'font-bold text-lg' : 'text-sm font-medium'}
        style={{ color: bold ? COLORS.secondary[500] : COLORS.text.primary }}
      >
        {value}
      </span>
    </div>
  );
}

export default CartPage;
