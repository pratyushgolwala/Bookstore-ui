import { useEffect, useState } from 'react';
import {
  BookOpen, Users, ShoppingCart, IndianRupee,
  AlertTriangle, Download, RefreshCw, FileText, Boxes,
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { formatCurrency } from '../../utils/formatters';
import COLORS from '../../constants/colors';
import Badge from '../../components/ui/Badge';

function AdminPage() {
  const [summary, setSummary] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [ltv, setLtv] = useState(null);
  const [slowMovers, setSlowMovers] = useState([]);
  const [turnover, setTurnover] = useState([]);
  const [reorder, setReorder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportBusy, setReportBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [s, inv, l, slow, turn, re] = await Promise.all([
        analyticsService.getSalesSummary(),
        analyticsService.getInventoryHealth(),
        analyticsService.getCustomerLTV({ limit: 5 }),
        analyticsService.getSlowMovers({ limit: 10 }),
        analyticsService.getInventoryTurnover({ limit: 10 }),
        analyticsService.getReorderForecast({ limit: 10 }),
      ]);
      setSummary(s);
      setInventory(inv);
      setLtv(l);
      setSlowMovers(Array.isArray(slow) ? slow : []);
      setTurnover(Array.isArray(turn) ? turn : []);
      setReorder(Array.isArray(re) ? re : []);
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
          <h1 className="font-display text-3xl font-bold mb-1">Admin Dashboard</h1>
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
              className="relative rounded-sm p-5 pt-6 overflow-hidden"
              style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
            >
              <span className="absolute left-0 top-0 h-0.5 w-12" style={{ backgroundColor: COLORS.brass }} />
              <div className="flex items-start justify-between">
                <p className="font-display text-3xl font-bold">{s.value}</p>
                <Icon size={18} style={{ color: COLORS.text.tertiary }} strokeWidth={1.6} />
              </div>
              <p className="text-xs mt-2 tracking-wide uppercase" style={{ color: COLORS.text.tertiary }}>
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top selling books */}
        <div
          className="rounded-sm p-5"
          style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
        >
          <h2 className="font-display text-2xl font-bold mb-4">Top Selling Books</h2>
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
          className="rounded-sm p-5"
          style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
        >
          <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
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

      {/* ── Inventory analytics ─────────────────────────────── */}
      <h2 className="font-display text-2xl font-bold mt-10 mb-4 flex items-center gap-2">
        <Boxes size={20} style={{ color: COLORS.brass }} />
        Inventory Analytics
      </h2>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Slow movers */}
        <AnalyticsTable
          title="Slow Movers"
          subtitle="In stock, zero sales in the last 90 days"
          loading={loading}
          rows={slowMovers}
          emptyText="No slow-moving titles 🎉"
          columns={[
            { key: 'title', label: 'Title', render: (r) => <span className="truncate block max-w-[220px]">{r.title}</span> },
            { key: 'current_stock', label: 'Stock', align: 'right', render: (r) => r.current_stock },
            { key: 'units_sold', label: 'Sold', align: 'right', render: (r) => (
              <Badge variant="accent">{r.units_sold}</Badge>
            ) },
          ]}
        />

        {/* Turnover */}
        <AnalyticsTable
          title="Inventory Turnover"
          subtitle="Units sold relative to current stock"
          loading={loading}
          rows={turnover}
          emptyText="No turnover data yet."
          columns={[
            { key: 'title', label: 'Title', render: (r) => <span className="truncate block max-w-[200px]">{r.title}</span> },
            { key: 'units_sold', label: 'Sold', align: 'right', render: (r) => r.units_sold },
            { key: 'current_stock', label: 'Stock', align: 'right', render: (r) => r.current_stock },
            { key: 'turnover_ratio', label: 'Ratio', align: 'right', render: (r) => (
              <span style={{ color: COLORS.secondary[500] }}>{r.turnover_ratio.toFixed(3)}</span>
            ) },
          ]}
        />

        {/* Reorder forecast */}
        <AnalyticsTable
          title="Reorder Forecast"
          subtitle="Titles approaching their reorder level"
          loading={loading}
          rows={reorder}
          emptyText="Nothing needs reordering right now."
          className="lg:col-span-2"
          columns={[
            { key: 'title', label: 'Title', render: (r) => <span className="truncate block max-w-[280px]">{r.title}</span> },
            { key: 'current_stock', label: 'Stock', align: 'right', render: (r) => r.current_stock },
            { key: 'reorder_level', label: 'Reorder At', align: 'right', render: (r) => r.reorder_level },
            { key: 'avg_daily_sales', label: 'Avg/Day', align: 'right', render: (r) => r.avg_daily_sales.toFixed(2) },
            { key: 'recommended_reorder_qty', label: 'Suggested Qty', align: 'right', render: (r) => (
              <Badge variant="primary">{r.recommended_reorder_qty}</Badge>
            ) },
          ]}
        />
      </div>
    </div>
  );
}

/* ─── Reusable analytics table ───────────────────────────────── */
function AnalyticsTable({ title, subtitle, columns, rows, loading, emptyText, className = '' }) {
  return (
    <div
      className={`rounded-sm p-5 ${className}`}
      style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
    >
      <h3 className="font-display text-xl font-bold">{title}</h3>
      {subtitle && (
        <p className="text-xs mb-4" style={{ color: COLORS.text.tertiary }}>{subtitle}</p>
      )}

      {rows.length === 0 ? (
        <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
          {loading ? 'Loading…' : emptyText}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: COLORS.text.tertiary }}>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={`pb-2 font-medium text-xs uppercase tracking-wide ${c.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.book_id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`py-2 ${c.align === 'right' ? 'text-right' : 'text-left'}`}
                    >
                      {c.render(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
