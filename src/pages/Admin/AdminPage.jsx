import { useEffect, useState } from 'react';
import {
  BookOpen, Users, ShoppingCart, IndianRupee, TrendingUp,
  AlertTriangle, Download, RefreshCw, FileText,
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { formatCurrency } from '../../utils/formatters';
import COLORS from '../../constants/colors';
import Badge from '../../components/ui/Badge';

function AdminPage() {
  const [summary, setSummary] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [ltv, setLtv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportBusy, setReportBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [s, inv, l] = await Promise.all([
        analyticsService.getSalesSummary(),
        analyticsService.getInventoryHealth(),
        analyticsService.getCustomerLTV({ limit: 5 }),
      ]);
      setSummary(s);
      setInventory(inv);
      setLtv(l);
    } catch (e) {
      setError(e.message || 'Could not reach the analytics service.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleGeneratePdf() {
    setReportBusy(true);
    try {
      const job = await analyticsService.generateReport({
        report_type: 'sales',
        file_format: 'pdf',
      });
      if (job?.id) {
        window.open(analyticsService.reportDownloadUrl(job.id), '_blank');
      }
    } catch (e) {
      setError(e.message || 'Report generation failed.');
    } finally {
      setReportBusy(false);
    }
  }

  const stats = [
    {
      label: 'Total Revenue',
      value: summary ? formatCurrency(summary.total_revenue) : '—',
      icon: IndianRupee,
      color: COLORS.success,
    },
    {
      label: 'Total Orders',
      value: summary ? summary.total_orders.toLocaleString() : '—',
      icon: ShoppingCart,
      color: COLORS.accent[400],
    },
    {
      label: 'Customers',
      value: ltv ? ltv.total_customers.toLocaleString() : '—',
      icon: Users,
      color: COLORS.secondary[400],
    },
    {
      label: 'Inventory Value',
      value: inventory ? formatCurrency(inventory.inventory_value) : '—',
      icon: BookOpen,
      color: COLORS.primary[500],
    },
  ];

  const topBooks = summary?.top_selling_books ?? [];
  const lowStock = inventory?.low_stock_books ?? [];

  return (
    <div
      className="px-6 py-8 max-w-6xl mx-auto"
      style={{ minHeight: '100vh', color: COLORS.text.primary, paddingTop: '100px' }}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
            Live analytics from the FastAPI service
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <a
            href={analyticsService.salesCsvUrl()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
          >
            <Download size={16} /> CSV
          </a>
          <a
            href={analyticsService.salesXlsxUrl()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
          >
            <Download size={16} /> Excel
          </a>
          <button
            onClick={handleGeneratePdf}
            disabled={reportBusy}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{ backgroundColor: COLORS.primary[500], color: '#fff', opacity: reportBusy ? 0.6 : 1 }}
          >
            <FileText size={16} /> {reportBusy ? 'Generating…' : 'PDF Report'}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="rounded-lg px-4 py-3 mb-6 text-sm flex items-center gap-2"
          style={{ backgroundColor: `${COLORS.warning}22`, border: `1px solid ${COLORS.warning}`, color: COLORS.text.primary }}
        >
          <AlertTriangle size={16} style={{ color: COLORS.warning }} />
          {error}
        </div>
      )}

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
        {/* Top selling books */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
        >
          <h2 className="font-bold mb-4">Top Selling Books</h2>
          <div className="space-y-2">
            {topBooks.length === 0 && (
              <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
                {loading ? 'Loading…' : 'No sales data yet.'}
              </p>
            )}
            {topBooks.map((b) => (
              <div
                key={b.book_id}
                className="flex items-center justify-between py-2 px-3 rounded-lg"
                style={{ backgroundColor: COLORS.surfaceLight }}
              >
                <div className="min-w-0 pr-3">
                  <p className="text-sm font-medium truncate">{b.title}</p>
                  <p className="text-xs truncate" style={{ color: COLORS.text.tertiary }}>
                    {b.author || 'Unknown'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold" style={{ color: COLORS.secondary[500] }}>
                    {formatCurrency(b.revenue)}
                  </p>
                  <Badge variant="primary">{b.units_sold} sold</Badge>
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
            {inventory && (
              <span className="text-xs font-normal" style={{ color: COLORS.text.tertiary }}>
                ({inventory.out_of_stock} out of stock)
              </span>
            )}
          </h2>
          <div className="space-y-2">
            {lowStock.length === 0 && (
              <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
                {loading ? 'Loading…' : 'Stock levels look healthy.'}
              </p>
            )}
            {lowStock.slice(0, 8).map((b) => (
              <div
                key={b.book_id}
                className="flex items-center justify-between py-2 px-3 rounded-lg"
                style={{ backgroundColor: COLORS.surfaceLight }}
              >
                <span className="text-sm truncate pr-3">{b.title}</span>
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
