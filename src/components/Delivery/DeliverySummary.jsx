import { useState, useEffect, useCallback } from 'react';
import {
  Zap, Package, Boxes, Clock, Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import COLORS from '../../constants/colors';

/**
 * DeliverySummary — shows the delivery bot's classification for an order:
 * the delivery tier (express / standard / bulk / backorder) and the projected
 * dispatch time. Sits above the live tracking timeline on the orders page.
 *
 * Reads from the delivery microservice (GET /delivery/{order_id}/classify).
 *
 * @param {{ orderId: string }} props
 */

const TIER_META = {
  express:   { label: 'Express',   icon: Zap,     color: COLORS.brass },
  standard:  { label: 'Standard',  icon: Package, color: COLORS.cloth },
  bulk:      { label: 'Bulk',      icon: Boxes,   color: COLORS.cloth },
  backorder: { label: 'Backorder', icon: Clock,   color: COLORS.error },
};

function DeliverySummary({ orderId }) {
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await deliveryService.getClassification(orderId);
      setDecision(res?.data ?? res);
    } catch (err) {
      setError(err.message || 'Could not load delivery info.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm" style={{ color: COLORS.text.tertiary }}>
        <Loader2 size={14} className="animate-spin" /> Loading delivery info…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-between py-2">
        <span className="flex items-center gap-2 text-xs" style={{ color: COLORS.text.tertiary }}>
          <AlertCircle size={13} /> {error}
        </span>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-sm"
          style={{ color: COLORS.brass, border: `1px solid ${COLORS.border}` }}
        >
          <RefreshCw size={11} /> Retry
        </button>
      </div>
    );
  }

  if (!decision) return null;

  const meta = TIER_META[decision.tier] || TIER_META.standard;
  const Icon = meta.icon;
  const eta = decision.dispatch_eta ? new Date(decision.dispatch_eta) : null;

  return (
    <div
      className="flex flex-wrap items-center gap-3 py-2.5 px-3 rounded-sm mb-3"
      style={{ backgroundColor: COLORS.surfaceLight, border: `1px solid ${COLORS.border}` }}
    >
      <span
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-sm"
        style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
      >
        <Icon size={13} /> {meta.label}
      </span>

      {decision.tier === 'backorder' ? (
        <span className="text-xs" style={{ color: COLORS.error }}>
          Awaiting restock before dispatch
        </span>
      ) : eta ? (
        <span className="flex items-center gap-1.5 text-xs" style={{ color: COLORS.text.secondary }}>
          <Clock size={13} style={{ color: COLORS.brass }} />
          Dispatch by{' '}
          {eta.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })},{' '}
          {eta.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      ) : null}

      {!decision.in_stock && decision.tier !== 'backorder' && (
        <span className="text-xs" style={{ color: COLORS.text.tertiary }}>· limited stock</span>
      )}
    </div>
  );
}

export default DeliverySummary;
