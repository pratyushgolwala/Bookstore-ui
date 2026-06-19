import { useState, useEffect, useCallback } from 'react';
import {
  MapPin, Package, Truck, Home, CheckCircle2, Clock,
  Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';
import { trackingService } from '../../services/trackingService';
import COLORS from '../../constants/colors';

/**
 * OrderTracking — live delivery tracking timeline for a single order.
 *
 * Reads the tracking state from the tracking microservice
 * (GET /tracking/{order_id}). If tracking hasn't started yet, offers a
 * "Start tracking" action. Renders the checkpoint timeline (pending →
 * dispatched → in transit → out for delivery → delivered) with the reached
 * stages filled in and the current stage highlighted.
 *
 * @param {{ orderId: string, destinationAddress?: string }} props
 */

// The canonical ordered stages + their display metadata.
const STAGES = [
  { key: 'pending', label: 'Order confirmed', icon: Clock },
  { key: 'dispatched', label: 'Dispatched', icon: Package },
  { key: 'in_transit', label: 'In transit', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for delivery', icon: MapPin },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

const STAGE_INDEX = STAGES.reduce((acc, s, i) => ({ ...acc, [s.key]: i }), {});

function OrderTracking({ orderId, destinationAddress = null }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [notStarted, setNotStarted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await trackingService.getTracking(orderId);
      setState(res?.data ?? res);
      setNotStarted(false);
    } catch (err) {
      if (err.status === 404) {
        setNotStarted(true);
      } else {
        setError(err.message || 'Could not load tracking.');
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  // Poll for live updates while tracking is active (not yet delivered).
  useEffect(() => {
    if (!state || state.status === 'delivered') return undefined;
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [state, load]);

  const handleStart = async () => {
    setStarting(true);
    setError('');
    try {
      const res = await trackingService.startTracking(orderId, destinationAddress);
      setState(res?.data ?? res);
      setNotStarted(false);
    } catch (err) {
      setError(err.message || 'Could not start tracking.');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm" style={{ color: COLORS.text.tertiary }}>
        <Loader2 size={15} className="animate-spin" /> Loading tracking…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-between py-3">
        <span className="flex items-center gap-2 text-sm" style={{ color: COLORS.error }}>
          <AlertCircle size={15} /> {error}
        </span>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-sm"
          style={{ color: COLORS.brass, border: `1px solid ${COLORS.border}` }}
        >
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  if (notStarted) {
    return (
      <div className="flex flex-col items-start gap-2 py-3">
        <p className="text-sm" style={{ color: COLORS.text.secondary }}>
          Tracking hasn't started for this order yet.
        </p>
        <button
          onClick={handleStart}
          disabled={starting}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-sm transition-colors disabled:opacity-60"
          style={{ backgroundColor: COLORS.cloth, color: '#fdf6e6' }}
        >
          {starting ? <Loader2 size={15} className="animate-spin" /> : <Truck size={15} />}
          {starting ? 'Starting…' : 'Start tracking'}
        </button>
      </div>
    );
  }

  const currentIdx = STAGE_INDEX[state?.status] ?? 0;
  const eta = state?.eta ? new Date(state.eta) : null;
  // Map stage key -> the matching checkpoint (for timestamps/notes).
  const cpByStatus = {};
  (state?.checkpoints || []).forEach((c) => { cpByStatus[c.status] = c; });

  return (
    <div className="py-2">
      {/* Header: destination + ETA */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.text.secondary }}>
          <MapPin size={14} style={{ color: COLORS.brass }} />
          {state?.destination || 'Destination'}
          {state?.distance_km ? (
            <span style={{ color: COLORS.text.tertiary }}>· {Math.round(state.distance_km)} km</span>
          ) : null}
        </div>
        {eta && state.status !== 'delivered' && (
          <span className="text-xs px-2.5 py-1 rounded-sm" style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.text.secondary }}>
            ETA {eta.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })},{' '}
            {eta.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Vertical stage timeline */}
      <ol className="relative">
        {STAGES.map((stage, i) => {
          const reached = i <= currentIdx;
          const isCurrent = i === currentIdx && state.status !== 'delivered';
          const isDelivered = stage.key === 'delivered' && currentIdx === STAGE_INDEX.delivered;
          const Icon = stage.icon;
          const cp = cpByStatus[stage.key];
          const last = i === STAGES.length - 1;

          return (
            <li key={stage.key} className="relative flex gap-3 pb-5 last:pb-0">
              {/* Connector line */}
              {!last && (
                <span
                  className="absolute left-[15px] top-8 bottom-0 w-0.5"
                  style={{ backgroundColor: i < currentIdx ? COLORS.cloth : COLORS.border }}
                />
              )}
              {/* Node */}
              <span
                className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: reached ? COLORS.cloth : COLORS.surfaceLight,
                  border: `1px solid ${reached ? COLORS.cloth : COLORS.border}`,
                  boxShadow: isCurrent ? `0 0 0 4px ${COLORS.cloth}33` : 'none',
                }}
              >
                {reached && (stage.key === 'delivered' || i < currentIdx)
                  ? <CheckCircle2 size={16} color="#fdf6e6" />
                  : <Icon size={15} color={reached ? '#fdf6e6' : COLORS.text.tertiary} />}
              </span>
              {/* Label + time */}
              <div className="flex-1 min-w-0 pt-1">
                <p
                  className="text-sm font-semibold leading-tight"
                  style={{ color: reached ? COLORS.text.primary : COLORS.text.tertiary }}
                >
                  {stage.label}
                  {isCurrent && (
                    <span
                      className="ml-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
                      style={{ backgroundColor: `${COLORS.brass}22`, color: COLORS.brass }}
                    >
                      Now
                    </span>
                  )}
                </p>
                {cp?.location && (
                  <p className="text-xs mt-0.5" style={{ color: COLORS.text.tertiary }}>{cp.location}</p>
                )}
                {cp?.description && (
                  <p className="text-xs mt-0.5 italic" style={{ color: COLORS.text.tertiary }}>{cp.description}</p>
                )}
                {cp?.timestamp && reached && (
                  <p className="text-[11px] mt-0.5" style={{ color: COLORS.text.tertiary }}>
                    {new Date(cp.timestamp).toLocaleString('en-IN', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                )}
                {isDelivered && (
                  <p className="text-xs mt-0.5 font-medium" style={{ color: COLORS.success }}>
                    Delivered — enjoy your books!
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default OrderTracking;
