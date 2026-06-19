import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, ChevronRight, Truck, CheckCircle, Clock,
  AlertCircle, ShoppingBag, Loader2, XCircle, RefreshCw,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { formatCurrency } from '../../utils/formatters';
import COLORS from '../../constants/colors';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import MetalButton from '../../components/ui/MetalButton';
import OrderTracking from '../../components/Tracking/OrderTracking';

const STATUS_MAP = {
  pending:    { label: 'Pending',    variant: 'secondary', icon: Clock },
  confirmed:  { label: 'Confirmed',  variant: 'primary',   icon: CheckCircle },
  processing: { label: 'Processing', variant: 'secondary', icon: Clock },
  shipped:    { label: 'Shipped',    variant: 'primary',   icon: Truck },
  delivered:  { label: 'Delivered',  variant: 'success',   icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  variant: 'accent',    icon: XCircle },
  refunded:   { label: 'Refunded',   variant: 'accent',    icon: XCircle },
};

function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [tracking, setTracking] = useState(null); // order id whose tracking is shown

  async function fetchOrders() {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/api/orders/');
      // The backend wraps in { status, data } envelope. Orders might be in
      // data.results (paginated) or data (direct array) or at the top level.
      const payload = res?.data ?? res;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
        ? payload.results
        : [];
      setOrders(list);
    } catch (err) {
      setError(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  // ── Loading state ────────────────────────────────────
  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{ minHeight: '100vh', backgroundColor: COLORS.parchment.bg, paddingTop: '100px' }}
      >
        <Loader2 size={32} className="animate-spin" style={{ color: COLORS.primary[500] }} />
        <p className="mt-4 text-sm" style={{ color: COLORS.parchment.textSoft }}>Loading your orders…</p>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────
  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: '100vh', backgroundColor: COLORS.parchment.bg, paddingTop: '100px' }}
      >
        <AlertCircle size={48} style={{ color: COLORS.error }} />
        <p className="mt-4 text-base" style={{ color: COLORS.parchment.text }}>{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchOrders}>
          <RefreshCw size={14} className="mr-2" /> Retry
        </Button>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: '100vh', backgroundColor: COLORS.parchment.bg, paddingTop: '100px' }}
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: `${COLORS.primary[200]}`, border: `1px solid ${COLORS.primary[300]}` }}
        >
          <ShoppingBag size={40} style={{ color: COLORS.primary[700] }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: COLORS.parchment.text }}>
          No orders yet
        </h1>
        <p className="mb-6" style={{ color: COLORS.parchment.textSoft }}>
          Once you place an order, it will appear here.
        </p>
        <MetalButton variant="gold" onClick={() => navigate('/books')} className="gap-2">
          Browse the Library
        </MetalButton>
      </div>
    );
  }

  // ── Orders list ──────────────────────────────────────
  return (
    <div
      className="px-6 py-8 max-w-4xl mx-auto"
      style={{ minHeight: '100vh', backgroundColor: COLORS.parchment.bg, color: COLORS.parchment.text, paddingTop: '100px' }}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">My Orders</h1>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
          style={{ color: COLORS.parchment.textSoft, border: `1px solid ${COLORS.parchment.border}` }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
          const Icon = st.icon;
          const open = expanded === order.id;
          const items = order.items || [];
          const date = order.created_at
            ? new Date(order.created_at).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric',
              })
            : '';

          return (
            <div
              key={order.id}
              className="rounded-xl overflow-hidden transition-all"
              style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
            >
              <button
                onClick={() => setExpanded(open ? null : order.id)}
                className="w-full flex items-center gap-4 p-4 text-left"
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: COLORS.surfaceLight }}
                >
                  <Package size={20} style={{ color: COLORS.secondary[500] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: COLORS.text.primary }}>
                      {order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <Badge variant={st.variant}>
                      <Icon size={11} className="inline mr-1" />
                      {st.label}
                    </Badge>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: COLORS.text.tertiary }}>
                    {date} · {items.length} item{items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="font-bold shrink-0" style={{ color: COLORS.secondary[500] }}>
                  {formatCurrency(order.total_amount)}
                </span>
                <ChevronRight
                  size={18}
                  style={{
                    color: COLORS.text.tertiary,
                    transform: open ? 'rotate(90deg)' : 'none',
                    transition: 'transform .2s',
                  }}
                />
              </button>

              {open && (
                <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: COLORS.border }}>
                  {items.map((it) => (
                    <div key={it.id || it.book} className="flex justify-between py-2 text-sm">
                      <span style={{ color: COLORS.text.secondary }}>
                        {it.book_title || `Book ${it.book?.slice(0, 8)}`} × {it.quantity}
                      </span>
                      <span style={{ color: COLORS.text.primary }}>
                        {formatCurrency(it.unit_price * it.quantity)}
                      </span>
                    </div>
                  ))}

                  {/* Track delivery toggle + timeline */}
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: COLORS.border }}>
                    <button
                      onClick={() => setTracking(tracking === order.id ? null : order.id)}
                      className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
                      style={{ color: COLORS.brass }}
                    >
                      <Truck size={15} />
                      {tracking === order.id ? 'Hide tracking' : 'Track delivery'}
                      <ChevronRight
                        size={15}
                        style={{
                          transform: tracking === order.id ? 'rotate(90deg)' : 'none',
                          transition: 'transform .2s',
                        }}
                      />
                    </button>
                    {tracking === order.id && (
                      <div className="mt-2">
                        <OrderTracking orderId={order.id} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => navigate('/books')}>
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}

export default OrdersPage;
