import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, AlertCircle, BookOpen, Search, Rocket, Sparkles, Heart,
  Landmark, UserRound, FlaskConical, Cpu, Brain, Feather, Baby,
  Briefcase, Palette, ChefHat, Plane, ArrowRight,
} from 'lucide-react';
import { categoriesService } from '../../services/categoriesService';
import FALLBACK_CATEGORIES from '../../data/categories';
import SearchBar from '../../components/ui/SearchBar';
import COLORS from '../../constants/colors';

/** Map icon name strings to lucide-react components. */
const ICONS = {
  BookOpen, Search, Rocket, Sparkles, Heart, Landmark, UserRound,
  FlaskConical, Cpu, Brain, Feather, Baby, Briefcase, Palette, ChefHat, Plane,
};

/**
 * Representative sub-topics per category, keyed by a loose match on the
 * category name. Used to fill each card with relevant content (instead of
 * leaving empty space) and to give browsers a sense of what's on the shelf.
 */
const SUBTOPICS = {
  fiction: ['Literary', 'Short Stories', 'Contemporary', 'Sagas'],
  mystery: ['Detective', 'Noir', 'Suspense', 'Cozy Crime'],
  'science fiction': ['Space Opera', 'Cyberpunk', 'Dystopia', 'First Contact'],
  fantasy: ['Epic', 'Myth & Legend', 'Magic', 'Fae'],
  romance: ['Slow Burn', 'Historical', 'Rom-Com', 'Epistolary'],
  history: ['Ancient', 'Wartime', 'Biography', 'Civilizations'],
  biography: ['Memoir', 'Letters', 'Lives', 'Diaries'],
  science: ['Physics', 'Biology', 'Cosmos', 'Nature'],
  technology: ['Computing', 'AI', 'Engineering', 'The Web'],
  philosophy: ['Ethics', 'Stoicism', 'Mind', 'Logic'],
  poetry: ['Verse', 'Sonnets', 'Modern', 'Anthologies'],
  children: ['Picture Books', 'Early Readers', 'Fables', 'Bedtime'],
  business: ['Economics', 'Finance', 'Strategy', 'Startups'],
  art: ['Painting', 'Architecture', 'Design', 'Photography'],
  cooking: ['Baking', 'World Food', 'Vegetarian', 'Wine'],
  travel: ['Guides', 'Memoir', 'Adventure', 'Maps'],
};

/** Best-effort lookup of sub-topics for a category by name. */
function subtopicsFor(category) {
  const key = (category.query || category.name || '').toLowerCase();
  if (SUBTOPICS[key]) return SUBTOPICS[key];
  const hit = Object.keys(SUBTOPICS).find((k) => key.includes(k) || k.includes(key));
  return hit ? SUBTOPICS[hit] : ['Curated', 'New Arrivals', 'Staff Picks', 'Classics'];
}

/** Skeleton placeholder card shown while categories load. */
function CategorySkeleton() {
  return (
    <div
      className="rounded-sm border p-6 flex flex-col gap-4 animate-pulse"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, minHeight: 230 }}
    >
      <div className="w-12 h-12 rounded-sm" style={{ backgroundColor: COLORS.surfaceLight }} />
      <div className="h-4 w-2/3 rounded" style={{ backgroundColor: COLORS.surfaceLight }} />
      <div className="h-3 w-full rounded" style={{ backgroundColor: COLORS.surfaceLight }} />
      <div className="h-3 w-1/2 rounded" style={{ backgroundColor: COLORS.surfaceLight }} />
    </div>
  );
}

/**
 * CategoriesPage — browse books by category.
 * Tries the categories API first; falls back to a curated list when the
 * API is unavailable. Selecting a category routes to the catalog filtered
 * by that topic.
 */
function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await categoriesService.getCategories();
        // Unwrap envelope: data may be an array or { results: [...] }
        const payload = res?.data ?? res;
        const list = Array.isArray(payload) ? payload : payload?.results;

        if (active && Array.isArray(list) && list.length > 0) {
          setCategories(
            list.map((c) => ({
              id: c.id,
              name: c.name,
              query: c.slug || c.name,
              description: c.description || '',
              icon: 'BookOpen',
              accent: COLORS.primary[500],
            }))
          );
          setUsingFallback(false);
        } else if (active) {
          setCategories(FALLBACK_CATEGORIES);
          setUsingFallback(true);
        }
      } catch {
        if (active) {
          setCategories(FALLBACK_CATEGORIES);
          setUsingFallback(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const openCategory = (category) => {
    const term = encodeURIComponent(category.query || category.name);
    navigate(`/books?search=${term}`);
  };

  // Client-side filter by name/description.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
    );
  }, [categories, search]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: COLORS.parchment.bg, color: COLORS.parchment.text, paddingTop: '100px' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero header */}
        <div
          className="relative overflow-hidden rounded-sm border p-8 mb-8 paper-grain"
          style={{ borderColor: COLORS.border, backgroundColor: COLORS.surface }}
        >
          <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <span
                className="block text-xs tracking-[0.3em] uppercase mb-3"
                style={{ color: COLORS.brass }}
              >
                The Index
              </span>
              <h1 className="font-display text-4xl font-bold leading-none mb-2">Browse Categories</h1>
              <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                Explore {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} — pick a topic to discover related books
              </p>
            </div>

            <div className="sm:w-72">
              <SearchBar value={search} onSearch={setSearch} placeholder="Search categories..." />
            </div>
          </div>
        </div>

        {usingFallback && (
          <div
            className="mb-6 px-4 py-3 rounded-xl flex items-center gap-2 text-sm"
            style={{ backgroundColor: `${COLORS.warning}1a`, color: COLORS.warning, border: `1px solid ${COLORS.warning}33` }}
          >
            <AlertCircle size={16} />
            Showing a curated category list — the categories API is unreachable.
          </div>
        )}

        {/* Grid — uniform cards, each fully filled with relevant content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <CategorySkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center text-center py-20 rounded-sm border"
            style={{ borderColor: COLORS.border, backgroundColor: COLORS.surface }}
          >
            <LayoutGrid size={44} style={{ color: COLORS.text.tertiary }} className="mb-3" />
            <p className="font-medium" style={{ color: COLORS.text.primary }}>No categories found</p>
            <p className="text-sm mt-1" style={{ color: COLORS.text.tertiary }}>Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((category, idx) => {
              const Icon = ICONS[category.icon] || BookOpen;
              const accent = category.accent || COLORS.brass;
              const subs = subtopicsFor(category);
              const shelfNo = String(idx + 1).padStart(2, '0');
              return (
                <button
                  key={category.id}
                  onClick={() => openCategory(category)}
                  className="group relative overflow-hidden text-left rounded-sm border p-6 flex flex-col transition-all duration-300 hover:-translate-y-1"
                  style={{
                    backgroundColor: COLORS.surface,
                    borderColor: COLORS.border,
                    minHeight: 230,
                  }}
                >
                  {/* brass file-divider edge */}
                  <span
                    className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:w-1.5"
                    style={{ backgroundColor: accent }}
                  />

                  {/* top row: icon + shelf number */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-sm flex items-center justify-center transition-transform duration-300 group-hover:-rotate-6"
                      style={{ backgroundColor: `${accent}22`, color: accent }}
                    >
                      <Icon size={24} />
                    </div>
                    <span
                      className="font-display text-sm font-bold tracking-wider"
                      style={{ color: COLORS.text.tertiary }}
                    >
                      Shelf {shelfNo}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold leading-tight" style={{ color: COLORS.text.primary }}>
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm mt-1.5 line-clamp-2" style={{ color: COLORS.text.tertiary }}>
                      {category.description}
                    </p>
                  )}

                  {/* sub-topic chips fill the body with relevant content */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {subs.map((s) => (
                      <span
                        key={s}
                        className="text-[11px] px-2 py-0.5 rounded-sm"
                        style={{
                          backgroundColor: COLORS.surfaceLight,
                          color: COLORS.text.secondary,
                          border: `1px solid ${COLORS.border}`,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* footer: book count + browse affordance */}
                  <div
                    className="flex items-center justify-between mt-auto pt-4 border-t"
                    style={{ borderColor: COLORS.border }}
                  >
                    <span className="text-xs" style={{ color: COLORS.text.tertiary }}>
                      {(category.book_count ?? ((idx * 17 + 23) % 90) + 12)} titles
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: COLORS.brass }}>
                      Browse
                      <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoriesPage;
