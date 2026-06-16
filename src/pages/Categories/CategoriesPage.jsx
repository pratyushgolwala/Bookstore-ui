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

/** Skeleton placeholder card shown while categories load. */
function CategorySkeleton() {
  return (
    <div
      className="rounded-2xl border p-6 flex flex-col gap-4 animate-pulse"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
    >
      <div className="w-14 h-14 rounded-2xl" style={{ backgroundColor: COLORS.surfaceLight }} />
      <div className="h-4 w-2/3 rounded" style={{ backgroundColor: COLORS.surfaceLight }} />
      <div className="h-3 w-full rounded" style={{ backgroundColor: COLORS.surfaceLight }} />
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

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <CategorySkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border"
            style={{ borderColor: COLORS.border, backgroundColor: COLORS.surface }}
          >
            <LayoutGrid size={44} style={{ color: COLORS.text.tertiary }} className="mb-3" />
            <p className="font-medium" style={{ color: COLORS.text.primary }}>No categories found</p>
            <p className="text-sm mt-1" style={{ color: COLORS.text.tertiary }}>Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((category) => {
              const Icon = ICONS[category.icon] || BookOpen;
              const accent = category.accent || COLORS.primary[500];
              return (
                <button
                  key={category.id}
                  onClick={() => openCategory(category)}
                  className="group relative overflow-hidden text-left rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                  style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
                >
                  {/* subtle accent glow on hover */}
                  <div
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-300 pointer-events-none"
                    style={{ backgroundColor: accent }}
                  />

                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${accent}22`, color: accent }}
                  >
                    <Icon size={26} />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold" style={{ color: COLORS.text.primary }}>
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm mt-1 line-clamp-2" style={{ color: COLORS.text.tertiary }}>
                        {category.description}
                      </p>
                    )}
                  </div>

                  <div
                    className="flex items-center gap-1.5 text-sm font-medium transition-all duration-300"
                    style={{ color: COLORS.secondary[500] }}
                  >
                    Browse books
                    <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
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
