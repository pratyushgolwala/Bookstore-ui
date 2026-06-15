import { Link } from 'react-router-dom';
import COLORS from '../../constants/colors';

/**
 * AuthorLink — renders an author name as a link to that author's page.
 *
 * Navigates to the Authors page deep-linked to the given author via a query
 * param (`/authors?author=<name>`), which the AuthorsPage opens directly.
 *
 * Stops click propagation so it works correctly inside clickable book cards
 * without also triggering the card's own onClick.
 *
 * @param {{ author?: string, className?: string, style?: object, prefix?: string, onNavigate?: () => void }} props
 */
export default function AuthorLink({ author, className = '', style = {}, prefix = '', onNavigate }) {
  if (!author) return null;

  return (
    <Link
      to={`/authors?author=${encodeURIComponent(author)}`}
      onClick={(e) => {
        e.stopPropagation();
        onNavigate?.();
      }}
      className={`hover:underline transition-colors ${className}`}
      style={{ color: COLORS.secondary[500], ...style }}
      title={`View ${author}'s page`}
    >
      {prefix}
      {author}
    </Link>
  );
}
