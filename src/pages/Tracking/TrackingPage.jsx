import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, MapPin, Loader2, AlertCircle, RefreshCw,
  CheckCircle, Clock, Truck, XCircle, User, Mail, Phone,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { formatCurrency } from '../../utils/formatters';
import COLORS from '../../constants/colors';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import OrderTracking from '../../components/Tracking/OrderTracking';
import DeliverySummary from '../../components/Delivery/DeliverySummary';

const STATUS_MAP = {
  pending:    { label: 'Pending',    variant: 'secondary', icon: Clock },
  confirmed:  { label: 'Confirmed',  variant: 'primary',   icon: CheckCircle },
  processing: { label: 'Processing', variant: 'secondary', icon: Clock },
  shipped:    { label: 'Shipped',    variant: 'primary',   icon: Truck },
  delivered:  { label: 'Delivered',  variant: 'success',   icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  variant: 'accent',    icon: XCircle },
  refunded:   { label: 'Refunded',   variant: 'accent',    icon: XCircle },
};

/** Build a single-line destination address from an order's delivery block. */
function buildAddress(delivery) {
  if (!delivery) return null;
  const parts = [
    delivery.line1, delivery.line2, delivery.city,
    delivery.state, delivery.postal_code, delivery.country,
  ];
  const line = parts.filter(Boolean).join(', ');
  return line || null;
}

function TrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get(`/api/orders/${orderId}/`);
      setOrder(res?.data ?? res);
    } catch (err) {
      setError(err.message || 'Could not load this order.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{ minHeight: '100vh', backgroundColor: COLORS.parchment.bg, paddingTop: '100px' }}
      >
        <Loader2 size={32} className="animate-spin" style={{ color: COLORS.primary[500] }} />
        <p className="mt-4 text-sm" style={{ color: COLORS.parchment.textSoft }}>Loading order…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: '100vh', backgroundColor: COLORS.parchment.bg, paddingTop: '100px' }}
      >
        <AlertCircle size={48} style={{ color: COLORS.error }} />
        <p className="mt-4 text-base" style={{ color: COLORS.parchment.text }}>{error}</p>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={fetchOrder}>
            <RefreshCw size={14} className="mr-2" /> Retry
          </Button>
          <Button variant="outline" onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const st = STATUS_MAP[order?.status] || STATUS_MAP.pending;
  const StatusIcon = st.icon;
  const items = order?.items || [];
  const delivery = order?.delivery || null;
  const destinationAddress = buildAddress(delivery);
  const date = order?.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : '';

  return (
    <div
      className="px-6 py-8 max-w-5xl mx-auto"
      style={{ minHeight: '100vh', backgroundColor: COLORS.parchment.bg, color: COLORS.parchment.text, paddingTop: '100px' }}
    >
      {/* Back */}
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-sm mb-6 transition-opacity hover:opacity-70"
        style={{ color: COLORS.parchment.textSoft }}
      >
        <ArrowLeft size={16} /> Back to Orders
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: COLORS.surfaceLight }}
        >
          <Package size={22} style={{ color: COLORS.secondary[500] }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-2xl font-bold">
              Order {orderId.slice(0, 8).toUpperCase()}
            </h1>
            <Badge variant={st.variant}>
              <StatusIcon size={11} className="inline mr-1" />
              {st.label}
            </Badge>
          </div>
          <p className="text-xs mt-0.5" style={{ color: COLORS.text.tertiary }}>
            Placed {date} · {items.length} item{items.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: tracking timeline */}
        <div className="lg:col-span-3">
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
          >
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: COLORS.text.secondary }}>
              Delivery tracking
            </h2>
            <DeliverySummary orderId={orderId} />
            <OrderTracking orderId={orderId} destinationAddress={destinationAddress} />
          </div>
        </div>

        {/* Right: order summary + delivery details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order summary */}
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
          >
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: COLORS.text.secondary }}>
              Order summary
            </h2>
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.id || it.book} className="flex justify-between text-sm">
                  <span style={{ color: COLORS.text.secondary }}>
                    {it.book_title || `Book ${it.book?.slice(0, 8)}`} × {it.quantity}
                  </span>
                  <span style={{ color: COLORS.text.primary }}>
                    {formatCurrency(it.unit_price * it.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t flex justify-between font-bold" style={{ borderColor: COLORS.border }}>
              <span>Total</span>
              <span style={{ color: COLORS.secondary[500] }}>{formatCurrency(order?.total_amount)}</span>
            </div>
          </div>

          {/* Delivery address */}
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
          >
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: COLORS.text.secondary }}>
              Delivery details
            </h2>
            {delivery ? (
              <div className="space-y-2 text-sm" style={{ color: COLORS.text.secondary }}>
                {delivery.full_name && (
                  <p className="flex items-center gap-2"><User size={14} style={{ color: COLORS.brass }} /> {delivery.full_name}</p>
                )}
                {delivery.email && (
                  <p className="flex items-center gap-2"><Mail size={14} style={{ color: COLORS.brass }} /> {delivery.email}</p>
                )}
                {delivery.phone && (
                  <p className="flex items-center gap-2"><Phone size={14} style={{ color: COLORS.brass }} /> {delivery.phone}</p>
                )}
                <p className="flex items-start gap-2 pt-1">
                  <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: COLORS.brass }} />
                  <span>{destinationAddress}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
                No delivery address was saved for this order. Tracking can't be started
                until an address is available — newer orders placed through checkout
                will include one automatically.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackingPage;
