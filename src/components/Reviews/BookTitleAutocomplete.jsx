import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, Check, BookOpen } from 'lucide-react';
import { booksService } from '../../services/booksService';
import { parseBooksResponse } from '../../utils/bookNormalizer';
import COLORS from '../../constants/colors';

/**
 * BookTitleAutocomplete — typeahead for the review "Book Title" field.
 *
 * Searches the catalog as the user types and shows a dropdown of matching
 * books. Picking one fills in the exact title (so it matches the store), which
 * is what the review API expects. The user can still type a title freely.
 *
 * @param {{
 *   value: string,
 *   onChange: (title: string) => void,
 *   placeholder?: string,
 * }} props
 */
function BookTitleAutocomplete({ value, onChange, placeholder }) {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [picked, setPicked] = useState(false);
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);
  const skipNextSearch = useRef(false);

  // Close on outside click.
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const runSearch = useCallback(async (q) => {
    setLoading(true);
    try {
      const res = await booksService.searchBooks(q, 1, 6);
      const { books } = parseBooksResponse(res);
      setResults(books);
      setOpen(true);
      setHighlight(-1);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search on value change (unless the change came from a pick).
  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return undefined;
    }
    const q = (value || '').trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return undefined;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(q), 250);
    return () => clearTimeout(debounceRef.current);
  }, [value, runSearch]);

  const pick = (book) => {
    skipNextSearch.current = true;
    onChange(book.title);
    setPicked(true);
    setOpen(false);
    setResults([]);
  };

  const handleChange = (e) => {
    setPicked(false);
    onChange(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && highlight >= 0) {
      e.preventDefault();
      pick(results[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder={placeholder || 'e.g. The Midnight Library'}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          autoComplete="off"
          style={{
            backgroundColor: COLORS.surfaceLight,
            color: COLORS.text.primary,
            borderColor: COLORS.border,
            width: '100%',
            boxSizing: 'border-box',
            paddingRight: '2.4rem',
          }}
        />
        <span style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
          {loading
            ? <Loader2 size={16} className="animate-spin" style={{ color: COLORS.text.tertiary }} />
            : picked
              ? <Check size={16} style={{ color: COLORS.success }} />
              : <Search size={16} style={{ color: COLORS.text.tertiary }} />}
        </span>
      </div>

      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
            overflow: 'hidden',
            maxHeight: 280, overflowY: 'auto',
          }}
        >
          {results.length === 0 && !loading ? (
            <div style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: COLORS.text.tertiary, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={15} /> No matches — you can type the title yourself.
            </div>
          ) : (
            results.map((book, i) => (
              <button
                key={book.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); pick(book); }}
                onMouseEnter={() => setHighlight(i)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '0.6rem 0.85rem', cursor: 'pointer', textAlign: 'left',
                  background: i === highlight ? COLORS.surfaceLight : 'transparent',
                  border: 'none', borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <img
                  src={book.coverImageUrl}
                  alt=""
                  style={{ width: 30, height: 44, objectFit: 'cover', borderRadius: 4, flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}
                />
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: COLORS.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {book.title}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: COLORS.text.tertiary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {book.author}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default BookTitleAutocomplete;
