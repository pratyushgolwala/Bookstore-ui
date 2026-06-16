import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Truck, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import COLORS from '../../constants/colors';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

/**
 * OrdersPage — order history with status tracking.
 * Uses sample data until the orders API is wired up.
 */
const SAMPLE_ORDERS = [
  {
    id: 'ORD-10293',
    date: '2024-05-28',
    status: 'delivered',
    total: 1248.5,
    items: [
      { title: 'Dune', qty: 1, price: 499 },
      { title: 'The Hobbit', qty: 2, price: 374.75 },
    ],
  },
  {
    id: 'ORD-10288',
    date: '2024-05-20',
    status: 'shipped',
    total: 899.0,
    items: [{ title: 'Sapiens', qty: 1, price: 899 }],
  },
  {
    id: 'ORD-10271',
    date: '2024-05-11',
    status: 'processing',
    total: 645.25,
    items: [{ title: 'Gone Girl', qty: 1, price: 645.25 }],
  },
];

const STATUS = {
  delivered: { label: 'Delivered', variant: 'success', icon: CheckCircle },
  shipped: { label: 'Shipped', variant: 'primary', icon: Truck },
  processing: { label: 'Processing', variant: 'secondary', icon: Clock },
};

function OrdersPage() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);

  return (
    <div
      className="px-6 py-8 max-w-4xl mx-auto"
      style={{ minHeight: 'calc(100vh - 72px)', backgroundColor: COLORS.parchment.bg, color: COLORS.parchment.text }}
    >
      <h1 className="text-3xl font-bold mb-6" style={{ color: COLORS.parchment.text }}>My Orders</h1>

      <div className="space-y-3">
        {SAMPLE_ORDERS.map((order) => {
          const st = STATUS[order.status];
          const Icon = st.icon;
          const open = expanded === order.id;
          return (
            <div
              key={order.id}
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
            >
              <button
                onClick={() => setExpanded(open ? null : order.id)}
                className="w-full flex items-center gap-4 p-4 text-left"
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: COLORS.surfaceLight }}
                >
                  <Package size={20} style={{ color: COLORS.secondary[500] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{order.id}</span>
                    <Badge variant={st.variant}>
                      <Icon size={11} className="inline mr-1" />
                      {st.label}
                    </Badge>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: COLORS.text.tertiary }}>
                    {formatDate(order.date)} · {order.items.length} item(s)
                  </p>
                </div>
                <span className="font-bold" style={{ color: COLORS.secondary[500] }}>
                  {formatCurrency(order.total)}
                </span>
                <ChevronRight
                  size={18}
                  style={{ color: COLORS.text.tertiary, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}
                />
              </button>

              {open && (
                <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: COLORS.border }}>
                  {order.items.map((it, i) => (
                    <div key={i} className="flex justify-between py-2 text-sm">
                      <span style={{ color: COLORS.text.secondary }}>
                        {it.title} × {it.qty}
                      </span>
                      <span style={{ color: COLORS.text.primary }}>{formatCurrency(it.price)}</span>
                    </div>
                  ))}
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
