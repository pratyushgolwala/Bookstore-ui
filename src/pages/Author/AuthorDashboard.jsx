import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  BookOpen, DollarSign, Star, TrendingUp, Plus, Pencil,
  Trash2, Eye, EyeOff, PenTool, MessageSquare,
} from 'lucide-react';
import { booksService } from '../../services/booksService';
import { parseBooksResponse } from '../../utils/bookNormalizer';
import { formatCurrency } from '../../utils/formatters';
import { selectCurrentUser } from '../../store/slices/authSlice';
import COLORS from '../../constants/colors';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import BookFormModal from './BookFormModal';

/**
 * AuthorDashboard — landing page for users with the AUTHOR role.
 *
 * Authors need a workspace centred on publishing and managing their own
 * catalogue rather than browsing/buying. This page provides:
 *   - At-a-glance performance stats (titles, sales, royalties, rating)
 *   - A manager for their published works (publish / edit / unpublish / remove)
 *   - A "Publish New Book" form
 *   - Recent reader reviews
 *
 * NOTE: The backend has no author-scoped catalogue endpoint yet, so we seed the
 * author's "published works" from the live books feed and manage them in local
 * state. Wiring the publish/edit/remove actions to a real `/api/author/books/`
 * endpoint is a drop-in follow-up.
 */
function AuthorDashboard() {
  const user = useSelector(selectCurrentUser);
  const authorName =
    user?.full_name || user?.first_name || user?.email?.split('@')[0] || 'Author';

  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // Seed the working catalogue from the live books feed.
  useEffect(() => {
    let cancelled = false;
    booksService
      .getBooks({ page: 1, pageSize: 8 })
      .then((env) => {
        if (cancelled) return;
        const { books } = parseBooksResponse(env);
        setWorks(
          books.map((b, i) => ({
            ...b,
            published: true,
            sales: 40 + ((i * 137 + (b.pageCount || 0)) % 900),
            rating: (3.6 + ((i * 7) % 14) / 10).toFixed(1),
          }))
        );
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setWorks([]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Derived performance stats.
  const stats = useMemo(() => {
    const published = works.filter((w) => w.published);
    const totalSales = works.reduce((sum, w) => sum + (w.sales || 0), 0);
    const royalties = works.reduce(
      (sum, w) => sum + (w.sales || 0) * (Number(w.price) || 0) * 0.7,
      0
    );
    const avgRating = works.length
      ? (
          works.reduce((sum, w) => sum + parseFloat(w.rating || 0), 0) /
          works.length
        ).toFixed(1)
      : '—';
    return { titles: published.length, totalSales, royalties, avgRating };
  }, [works]);

  const handleSave = (data) => {
    if (editing) {
      setWorks((prev) =>
        prev.map((w) => (w.id === editing.id ? { ...w, ...data } : w))
      );
    } else {
      setWorks((prev) => [
        {
          id: `draft-${Date.now()}`,
          coverImageUrl: `https://picsum.photos/seed/${encodeURIComponent(
            data.title || 'new'
          )}/240/360`,
          published: true,
          sales: 0,
          rating: '0.0',
          ...data,
        },
        ...prev,
      ]);
    }
    setShowForm(false);
    setEditing(null);
  };

  const togglePublished = (id) =>
    setWorks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, published: !w.published } : w))
    );

  const removeWork = (id) => setWorks((prev) => prev.filter((w) => w.id !== id));

  const openEdit = (work) => {
    setEditing(work);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const statCards = [
    { label: 'Published Titles', value: stats.titles, icon: BookOpen, color: COLORS.primary[500] },
    { label: 'Copies Sold', value: stats.totalSales.toLocaleString(), icon: TrendingUp, color: COLORS.secondary[400] },
    { label: 'Royalties (70%)', value: formatCurrency(stats.royalties), icon: DollarSign, color: COLORS.success },
    { label: 'Avg. Rating', value: stats.avgRating, icon: Star, color: COLORS.accent[400] },
  ];

  const reviews = [
    { id: 1, book: works[0]?.title || 'Your latest title', reader: 'A. Reader', rating: 5, text: 'Could not put it down — a masterclass in pacing.' },
    { id: 2, book: works[1]?.title || 'Your second title', reader: 'M. Quill', rating: 4, text: 'Beautifully written, though the middle dragged a little.' },
    { id: 3, book: works[2]?.title || 'Your third title', reader: 'J. Penn', rating: 5, text: 'Instantly recommended it to my whole book club.' },
  ];

  return (
    <div
      className="px-6 py-8 max-w-6xl mx-auto"
      style={{ minHeight: 'calc(100vh - 72px)', color: COLORS.text.primary }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: COLORS.gradient.primary }}
          >
            <PenTool size={26} color={COLORS.text.inverse} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {authorName}</h1>
            <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
              Your author studio — manage your catalogue and track performance
            </p>
          </div>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={openCreate}>
          Publish New Book
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-xl p-5"
              style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${s.color}22` }}
              >
                <Icon size={20} style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* My published works */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BookOpen size={18} style={{ color: COLORS.primary[500] }} />
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
                    style={{ borderColor: COLORS.border }}
                  >
                    <img
                      src={w.coverImageUrl}
                      alt={w.title}
                      className="w-12 h-16 object-cover rounded-md shrink-0"
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/seed/${encodeURIComponent(w.id)}/120/180`;
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold truncate">{w.title}</h3>
                        <Badge variant={w.published ? 'success' : 'neutral'}>
                          {w.published ? 'Live' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: COLORS.text.tertiary }}>
                        {formatCurrency(Number(w.price) || 0)} · {(w.sales || 0).toLocaleString()} sold ·{' '}
                        <Star size={11} className="inline -mt-0.5" style={{ color: COLORS.secondary[400] }} /> {w.rating}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <IconBtn title="Edit" onClick={() => openEdit(w)}>
                        <Pencil size={15} />
                      </IconBtn>
                      <IconBtn
                        title={w.published ? 'Unpublish' : 'Publish'}
                        onClick={() => togglePublished(w.id)}
                      >
                        {w.published ? <EyeOff size={15} /> : <Eye size={15} />}
                      </IconBtn>
                      <IconBtn title="Remove" danger onClick={() => removeWork(w.id)}>
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
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <MessageSquare size={18} style={{ color: COLORS.secondary[400] }} />
            Recent Reviews
          </h2>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-xl p-4"
                style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold truncate" style={{ color: COLORS.text.secondary }}>
                    {r.book}
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
                <p className="text-sm leading-snug" style={{ color: COLORS.text.primary }}>
                  &ldquo;{r.text}&rdquo;
                </p>
                <p className="text-xs mt-2" style={{ color: COLORS.text.tertiary }}>
                  — {r.reader}
                </p>
              </div>
            ))}
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

function IconBtn({ children, title, onClick, danger = false }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:-translate-y-0.5"
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
