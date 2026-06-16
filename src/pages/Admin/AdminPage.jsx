import { useEffect, useState } from 'react';
import { BookOpen, Users, ShoppingCart, IndianRupee, TrendingUp, AlertTriangle } from 'lucide-react';
import { booksService } from '../../services/booksService';
import { formatCurrency } from '../../utils/formatters';
import COLORS from '../../constants/colors';
import Badge from '../../components/ui/Badge';

function AdminPage() {
  const [bookCount, setBookCount] = useState(null);

  useEffect(() => {
    booksService
      .getBooks({ page: 1, pageSize: 1 })
      .then((env) => setBookCount(env?.data?.count ?? null))
      .catch(() => setBookCount(null));
  }, []);

  const stats = [
    { label: 'Total Books', value: bookCount != null ? bookCount.toLocaleString() : '—', icon: BookOpen, color: COLORS.primary[500] },
    { label: 'Customers', value: '2,840', icon: Users, color: COLORS.secondary[400] },
    { label: 'Orders', value: '1,293', icon: ShoppingCart, color: COLORS.accent[400] },
    { label: 'Revenue', value: formatCurrency(284500), icon: IndianRupee, color: COLORS.success },
  ];

  const recentOrders = [
    { id: 'ORD-10293', customer: 'A. Reader', total: 1248.5, status: 'delivered' },
    { id: 'ORD-10288', customer: 'B. Smith', total: 899.0, status: 'shipped' },
    { id: 'ORD-10271', customer: 'C. Jones', total: 645.25, status: 'processing' },
  ];

  const lowStock = [
    { title: 'Dune', stock: 3 },
    { title: 'The Way of Kings', stock: 5 },
    { title: 'Sapiens', stock: 2 },
  ];

  return (
    <div
      className="px-6 py-8 max-w-6xl mx-auto"
      style={{ minHeight: '100vh', color: COLORS.text.primary, paddingTop: '100px' }}
    >
      <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
      <p className="text-sm mb-6" style={{ color: COLORS.text.tertiary }}>
        Overview of store performance
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-xl p-5"
              style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${s.color}22` }}
                >
                  <Icon size={20} style={{ color: s.color }} />
                </div>
                <TrendingUp size={16} style={{ color: COLORS.success }} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
        >
          <h2 className="font-bold mb-4">Recent Orders</h2>
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg"
                style={{ backgroundColor: COLORS.surfaceLight }}
              >
                <div>
                  <p className="text-sm font-medium">{o.id}</p>
                  <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                    {o.customer}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: COLORS.secondary[500] }}>
                    {formatCurrency(o.total)}
                  </p>
                  <Badge variant={o.status === 'delivered' ? 'success' : o.status === 'shipped' ? 'primary' : 'secondary'}>
                    {o.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock alerts */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
        >
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <AlertTriangle size={18} style={{ color: COLORS.warning }} />
            Low Stock Alerts
          </h2>
          <div className="space-y-2">
            {lowStock.map((b) => (
              <div
                key={b.title}
                className="flex items-center justify-between py-2 px-3 rounded-lg"
                style={{ backgroundColor: COLORS.surfaceLight }}
              >
                <span className="text-sm">{b.title}</span>
                <Badge variant="accent">{b.stock} left</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
