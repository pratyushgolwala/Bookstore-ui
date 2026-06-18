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
      className="col-span-2 lg:col-span-3 rounded-sm border p-6 flex flex-col gap-4 animate-pulse"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
    >
      <div className="w-12 h-12 rounded-sm" style={{ backgroundColor: COLORS.surfaceLight }} />
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

        {/* Grid — asymmetric: cards take varied spans on a 6-col bed */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-5 auto-rows-[180px]">
            {Array.from({ length: 8 }).map((_, i) => <CategorySkeleton key={i} />)}
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
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-5 auto-rows-[176px]">
            {filtered.map((category, idx) => {
              const Icon = ICONS[category.icon] || BookOpen;
              const accent = category.accent || COLORS.brass;
              // Irregular sizing rhythm: a wide hero every 7th, taller every 5th.
              const wide = idx % 7 === 0;
              const tall = idx % 5 === 2;
              const span = [
                'col-span-2',
                wide ? 'lg:col-span-4' : 'lg:col-span-3',
                tall ? 'row-span-2' : 'row-span-1',
              ].join(' ');
              return (
                <button
                  key={category.id}
                  onClick={() => openCategory(category)}
                  className={`group relative overflow-hidden text-left rounded-sm border p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 ${span}`}
                  style={{
                    backgroundColor: idx % 3 === 0 ? COLORS.surfaceLight : COLORS.surface,
                    borderColor: COLORS.border,
                  }}
                >
                  {/* a thick brass edge on the left — like a tabbed file divider */}
                  <span
                    className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:w-1.5"
                    style={{ backgroundColor: accent }}
                  />

                  <div
                    className="w-12 h-12 rounded-sm flex items-center justify-center mb-4 transition-transform duration-300 group-hover:-rotate-6"
                    style={{ backgroundColor: `${accent}22`, color: accent }}
                  >
                    <Icon size={24} />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-display text-xl font-bold leading-tight" style={{ color: COLORS.text.primary }}>
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className={`text-sm mt-1.5 ${tall ? 'line-clamp-4' : 'line-clamp-2'}`} style={{ color: COLORS.text.tertiary }}>
                        {category.description}
                      </p>
                    )}
                  </div>

                  <div
                    className="flex items-center gap-1.5 text-sm font-medium mt-4"
                    style={{ color: COLORS.brass }}
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
