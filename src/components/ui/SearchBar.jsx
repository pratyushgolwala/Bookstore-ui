import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import COLORS from '../../constants/colors';

/**
 * SearchBar — debounced search input.
 * @param {{ value?: string, onSearch: (q: string) => void, placeholder?: string }} props
 */
function SearchBar({ value = '', onSearch, placeholder = 'Search books or authors…' }) {
  const [query, setQuery] = useState(value);

  // Debounce search calls
  useEffect(() => {
    const t = setTimeout(() => {
      if (query !== value) onSearch(query.trim());
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl w-full max-w-md transition-all focus-within:ring-2"
      style={{
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <Search size={18} style={{ color: COLORS.text.tertiary }} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm"
        style={{ color: COLORS.text.primary }}
        onKeyDown={(e) => e.key === 'Enter' && onSearch(query.trim())}
      />
      {query && (
        <button
          onClick={() => {
            setQuery('');
            onSearch('');
          }}
          aria-label="Clear search"
          style={{ color: COLORS.text.tertiary }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
