import { Component } from 'react';
import FallbackGrid from '../FallbackGrid/FallbackGrid';

/**
 * BookshelfErrorBoundary - A React error boundary that catches errors
 * from BookshelfScene (or any child 3D component) and renders the
 * FallbackGrid as a recovery path.
 *
 * @prop {React.ReactNode} children - The wrapped content (typically BookshelfScene)
 * @prop {Array} books - Book array passed to FallbackGrid on error
 * @prop {(book: object) => void} onBookSelect - Callback passed to FallbackGrid on error
 *
 * Requirements: 8.5
 */
class BookshelfErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('BookshelfErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <FallbackGrid
          books={this.props.books}
          onBookSelect={this.props.onBookSelect}
        />
      );
    }

    return this.props.children;
  }
}

export default BookshelfErrorBoundary;
