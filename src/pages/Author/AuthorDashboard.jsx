import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  BookOpen, IndianRupee, Star, TrendingUp, Plus, Pencil,
  Trash2, Eye, EyeOff, PenTool, MessageSquare, AlertCircle, BarChart3,
} from 'lucide-react';
import { authorService } from '../../services/authorService';
import { formatCurrency } from '../../utils/formatters';
import { selectCurrentUser } from '../../store/slices/authSlice';
import COLORS from '../../constants/colors';
import Button from '../../components/ui/Button';
import MetalButton from '../../components/ui/MetalButton';
import Badge from '../../components/ui/Badge';
import BookFormModal from './BookFormModal';

/**
 * AuthorDashboard — landing page for users with the AUTHOR role.
 *
 * An author studio backed by the real `/api/author/` endpoints:
 *   - GET  /api/author/stats/    aggregate performance stats
 *   - GET  /api/author/books/    the author's own catalogue (+ metrics)
 *   - GET  /api/author/reviews/  recent reviews on the author's books
 *   - POST/PATCH/DELETE + publish/unpublish for catalogue management
 */
function AuthorDashboard() {
  const user = useSelector(selectCurrentUser);
  const authorName =
    user?.full_name || user?.first_name || user?.email?.split('@')[0] || 'Author';

  const [works, setWorks] = useState([]);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [booksEnv, statsEnv, reviewsEnv] = await Promise.all([
        authorService.getMyBooks(),
        authorService.getStats(),
        authorService.getReviews(),
      ]);
      setWorks(booksEnv?.data?.results ?? []);
      setStats(statsEnv?.data ?? null);
      setReviews(reviewsEnv?.data?.results ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load your studio.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Sales analytics comes from the analytics microservice (via Django) and may
  // be slower or unavailable, so it's loaded separately from the core studio
  // data and degrades gracefully without blocking the rest of the dashboard.
  const loadAnalytics = useCallback(async () => {
    setAnalyticsError(null);
    try {
      const env = await authorService.getAnalytics();
      setAnalytics(env?.data ?? null);
    } catch (err) {
      setAnalyticsError(err.message || 'Sales analytics are unavailable right now.');
    }
  }, []);

  useEffect(() => {
    loadAll();
    loadAnalytics();
  }, [loadAll, loadAnalytics]);

  const handleSave = async (data) => {
    try {
      if (editing) {
        await authorService.updateBook(editing.id, data);
      } else {
        await authorService.createBook(data);
      }
      setShowForm(false);
      setEditing(null);
      await loadAll();
    } catch (err) {
      // Surface the error but keep the modal open so the user can retry.
      setError(err.message || 'Failed to save the book.');
    }
  };

  const togglePublished = async (work) => {
    setBusyId(work.id);
    setError(null);
    try {
      if (work.is_active) {
        await authorService.unpublishBook(work.id);
      } else {
        await authorService.publishBook(work.id);
      }
      await loadAll();
    } catch (err) {
      setError(err.message || 'Failed to update the book.');
    } finally {
      setBusyId(null);
    }
  };

  const removeWork = async (work) => {
    setBusyId(work.id);
    setError(null);
    try {
      await authorService.removeBook(work.id);
      await loadAll();
    } catch (err) {
      setError(err.message || 'Failed to remove the book.');
    } finally {
      setBusyId(null);
    }
  };

  const openEdit = (work) => {
    setEditing(work);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const statCards = [
    {
      label: 'Published Titles',
      value: stats ? stats.published_titles : '—',
      icon: BookOpen,
      color: COLORS.primary[500],
    },
    {
      label: 'Copies Sold',
      value: stats ? (stats.units_sold ?? 0).toLocaleString() : '—',
      icon: TrendingUp,
      color: COLORS.secondary[400],
    },
    {
      label: 'Royalties (70%)',
      value: stats ? formatCurrency(stats.royalties ?? 0) : '—',
      icon: IndianRupee,
      color: COLORS.success,
    },
    {
      label: 'Avg. Rating',
      value: stats && stats.avg_rating != null ? stats.avg_rating : '—',
      icon: Star,
      color: COLORS.accent[400],
    },
  ];

  return (
    <div
      className="px-6 py-8 max-w-6xl mx-auto"
      style={{ minHeight: '100vh', color: COLORS.text.primary, paddingTop: '100px' }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-sm flex items-center justify-center shrink-0"
            style={{ backgroundColor: COLORS.brass }}
          >
            <PenTool size={24} color={COLORS.ink} />
          </div>
          <div>
            <span className="block text-xs tracking-[0.3em] uppercase mb-1" style={{ color: COLORS.brass }}>
              The Author Studio
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Welcome back, {authorName}</h1>
          </div>
        </div>
        <MetalButton variant="gold" onClick={openCreate} className="gap-2">
          <Plus size={18} />
          Publish New Book
        </MetalButton>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="flex items-center gap-2 rounded-lg px-4 py-3 mb-6 text-sm"
          style={{ backgroundColor: `${COLORS.error}22`, color: COLORS.error }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Stat cards — editorial: brass top-rule, serif numerals, line icon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((s) => {
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

      {/* Sales analytics — sourced from the analytics microservice */}
      <SalesAnalytics analytics={analytics} error={analyticsError} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* My published works */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold flex items-center gap-2">
              <BookOpen size={18} style={{ color: COLORS.brass }} />
              My Books
            </h2>
            <span className="text-xs" style={{ color: COLORS.text.tertiary }}>
              {works.length} title{works.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
          >
            {loading ? (
              <div className="p-8 text-center text-sm" style={{ color: COLORS.text.tertiary }}>
                Loading your catalogue…
              </div>
            ) : works.length === 0 ? (
              <div className="p-10 text-center">
                <BookOpen size={32} className="mx-auto mb-3" style={{ color: COLORS.text.tertiary }} />
                <p className="text-sm mb-4" style={{ color: COLORS.text.secondary }}>
                  You haven&apos;t published any books yet.
                </p>
                <Button size="sm" leftIcon={<Plus size={16} />} onClick={openCreate}>
                  Publish your first book
                </Button>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: COLORS.border }}>
                {works.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center gap-4 p-4"
                    style={{ borderColor: COLORS.border, opacity: busyId === w.id ? 0.5 : 1 }}
                  >
                    <img
                      src={w.cover_url || `https://picsum.photos/seed/${encodeURIComponent(w.id)}/120/180`}
                      alt={w.title}
                      className="w-12 h-16 object-cover rounded-md shrink-0"
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/seed/${encodeURIComponent(w.id)}/120/180`;
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold truncate">{w.title}</h3>
                        <Badge variant={w.is_active ? 'success' : 'neutral'}>
                          {w.is_active ? 'Live' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: COLORS.text.tertiary }}>
                        {formatCurrency(Number(w.price) || 0)} · {(w.units_sold || 0).toLocaleString()} sold
                        {w.avg_rating != null && (
                          <>
                            {' · '}
                            <Star size={11} className="inline -mt-0.5" style={{ color: COLORS.secondary[400] }} />{' '}
                            {w.avg_rating}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <IconBtn title="Edit" onClick={() => openEdit(w)} disabled={busyId === w.id}>
                        <Pencil size={15} />
                      </IconBtn>
                      <IconBtn
                        title={w.is_active ? 'Unpublish' : 'Publish'}
                        onClick={() => togglePublished(w)}
                        disabled={busyId === w.id}
                      >
                        {w.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                      </IconBtn>
                      <IconBtn title="Remove" danger onClick={() => removeWork(w)} disabled={busyId === w.id}>
                        <Trash2 size={15} />
                      </IconBtn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent reviews */}
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2 mb-4">
            <MessageSquare size={18} style={{ color: COLORS.brass }} />
            Recent Reviews
          </h2>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm" style={{ color: COLORS.text.tertiary }}>Loading…</p>
            ) : reviews.length === 0 ? (
              <div
                className="rounded-xl p-5 text-sm"
                style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text.tertiary }}
              >
                No reviews yet. They&apos;ll appear here as readers rate your books.
              </div>
            ) : (
              reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold truncate" style={{ color: COLORS.text.secondary }}>
                      {r.book_title}
                    </span>
                    <span className="flex items-center gap-0.5 shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          style={{ color: COLORS.secondary[400] }}
                          fill={i < r.rating ? COLORS.secondary[400] : 'none'}
                        />
                      ))}
                    </span>
                  </div>
                  {r.body && (
                    <p className="text-sm leading-snug" style={{ color: COLORS.text.primary }}>
                      &ldquo;{r.body}&rdquo;
                    </p>
                  )}
                  <p className="text-xs mt-2" style={{ color: COLORS.text.tertiary }}>
                    — {r.reader}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <BookFormModal
          initial={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

/**
 * SalesAnalytics — catalogue-wide sales figures from the analytics microservice.
 *
 * Shows headline totals (revenue, units, orders, this-month revenue) plus a
 * lightweight daily-revenue bar chart. Degrades to an inline notice if the
 * analytics service is unreachable, and a zero-state once published.
 */
function SalesAnalytics({ analytics, error }) {
  const summary = analytics?.summary;
  const daily = analytics?.daily ?? [];
  const maxRevenue = daily.reduce((m, p) => Math.max(m, Number(p.revenue) || 0), 0);

  const cards = [
    { label: 'Total Revenue', value: summary ? formatCurrency(summary.total_revenue ?? 0) : '—' },
    { label: 'This Month', value: summary ? formatCurrency(summary.monthly_revenue ?? 0) : '—' },
    { label: 'Units Sold', value: summary ? (summary.total_items_sold ?? 0).toLocaleString() : '—' },
    { label: 'Orders', value: summary ? (summary.total_orders ?? 0).toLocaleString() : '—' },
  ];

  return (
    <div className="mb-10">
      <h2 className="font-display text-2xl font-bold flex items-center gap-2 mb-4">
        <BarChart3 size={18} style={{ color: COLORS.brass }} />
        Sales Analytics
      </h2>

      {error ? (
        <div
          className="rounded-xl p-5 text-sm flex items-center gap-2"
          style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text.tertiary }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      ) : (
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((c) => (
              <div key={c.label}>
                <p className="font-display text-2xl font-bold">{c.value}</p>
                <p className="text-xs mt-1 tracking-wide uppercase" style={{ color: COLORS.text.tertiary }}>
                  {c.label}
                </p>
              </div>
            ))}
          </div>

          {/* Daily revenue mini-chart */}
          {daily.length > 0 ? (
            <div>
              <p className="text-xs tracking-wide uppercase mb-2" style={{ color: COLORS.text.tertiary }}>
                Daily Revenue
              </p>
              <div className="flex items-end gap-1 h-28">
                {daily.slice(-30).map((p) => {
                  const pct = maxRevenue > 0 ? (Number(p.revenue) / maxRevenue) * 100 : 0;
                  return (
                    <div
                      key={p.period}
                      className="flex-1 rounded-t-sm"
                      title={`${p.period}: ${formatCurrency(Number(p.revenue) || 0)}`}
                      style={{
                        height: `${Math.max(pct, 2)}%`,
                        backgroundColor: COLORS.brass,
                        opacity: 0.85,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
              No sales yet. Revenue will chart here as readers buy your books.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, title, onClick, danger = false, disabled = false }) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed"
      style={{
        backgroundColor: COLORS.surfaceLight,
        color: danger ? COLORS.error : COLORS.text.secondary,
      }}
    >
      {children}
    </button>
  );
}

export default AuthorDashboard;
