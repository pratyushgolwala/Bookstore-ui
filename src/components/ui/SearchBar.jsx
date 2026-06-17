import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import COLORS from '../../constants/colors';

/**
 * SearchBar — debounced search input with premium styling.
 * Dark brown background, generous height, gold focus ring.
 * @param {{ value?: string, onSearch: (q: string) => void, placeholder?: string }} props
 */
function SearchBar({ value = '', onSearch, placeholder = 'Search books or authors…' }) {
  const [query, setQuery] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (query !== value) onSearch(query.trim());
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div
      className="flex items-center gap-3 w-full max-w-md transition-all duration-200"
      style={{
        height: '52px',
        padding: '0 18px',
        borderRadius: '14px',
        backgroundColor: '#4A2F1E',
        border: focused
          ? `2px solid ${COLORS.secondary[500]}`
          : '2px solid transparent',
        boxShadow: focused
          ? '0 0 0 4px rgba(205,163,94,0.2), 0 4px 16px rgba(0,0,0,0.2)'
          : '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <Search size={20} style={{ color: COLORS.secondary[500], flexShrink: 0 }} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm"
        style={{ color: COLORS.text.primary, fontSize: '15px' }}
        onKeyDown={(e) => e.key === 'Enter' && onSearch(query.trim())}
      />
      {query && (
        <button
          onClick={() => {
            setQuery('');
            onSearch('');
          }}
          aria-label="Clear search"
          style={{
            color: COLORS.text.tertiary,
            background: 'none',
            border: 'none',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: '6px',
            flexShrink: 0,
          }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
