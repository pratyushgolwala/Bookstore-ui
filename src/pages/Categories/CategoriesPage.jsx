import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, AlertCircle, BookOpen, Search, Rocket, Sparkles, Heart,
  Landmark, UserRound, FlaskConical, Cpu, Brain, Feather, Baby,
  Briefcase, Palette, ChefHat, Plane, ArrowRight,
} from 'lucide-react';
import { categoriesService } from '../../services/categoriesService';
import FALLBACK_CATEGORIES from '../../data/categories';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import COLORS from '../../constants/colors';

/** Map icon name strings to lucide-react components. */
const ICONS = {
  BookOpen, Search, Rocket, Sparkles, Heart, Landmark, UserRound,
  FlaskConical, Cpu, Brain, Feather, Baby, Briefcase, Palette, ChefHat, Plane,
};

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

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: COLORS.background, color: COLORS.text.primary }}
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <LayoutGrid style={{ color: COLORS.secondary[500] }} size={28} />
          <h1 className="text-3xl font-bold leading-none">Browse Categories</h1>
        </div>
        <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
          Explore the catalog by topic — pick a category to see related books.
        </p>

        {usingFallback && (
          <div
            className="mt-4 px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
            style={{ backgroundColor: `${COLORS.warning}1a`, color: COLORS.warning }}
          >
            <AlertCircle size={16} />
            Showing a curated category list — the categories API is unreachable.
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {categories.map((category) => {
              const Icon = ICONS[category.icon] || BookOpen;
              const accent = category.accent || COLORS.primary[500];
              return (
                <button
                  key={category.id}
                  onClick={() => openCategory(category)}
                  className="group relative text-left rounded-xl border p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                  style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${accent}22`, color: accent }}
                  >
                    <Icon size={24} />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-base font-semibold" style={{ color: COLORS.text.primary }}>
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: COLORS.text.tertiary }}>
                        {category.description}
                      </p>
                    )}
                  </div>

                  <div
                    className="flex items-center gap-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ color: COLORS.secondary[500] }}
                  >
                    Browse books
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
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
