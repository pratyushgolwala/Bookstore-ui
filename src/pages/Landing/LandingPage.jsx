import React, { Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Book, ArrowRight, ChevronDown } from 'lucide-react';
import COLORS from '../../constants/colors';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useBookshelf from '../../hooks/useBookshelf';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

const BookshelfScene = React.lazy(() => import('../../components/Bookshelf/BookshelfScene'));

/**
 * LandingPage — Professional landing page with animated background
 * and a decorative 3D bookshelf in the hero section.
 * Redirects authenticated users to the books page.
 */
function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { books } = useBookshelf();

  // Redirect authenticated users to the interactive bookshelf page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/books', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="w-full" style={{ backgroundColor: COLORS.background }}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(-45deg, ${COLORS.primary[50]}, ${COLORS.secondary[50]}, ${COLORS.accent[50]}, ${COLORS.primary[100]})`,
            backgroundSize: '400% 400%',
            animation: 'gradient 20s ease infinite',
          }}
        ></div>

        {/* 3D Bookshelf — decorative, non-interactive, positioned behind hero content */}
        <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
          <Suspense fallback={<LoadingSpinner />}>
            <BookshelfScene books={books} interactive={false} onBookSelect={() => {}} />
          </Suspense>
        </div>

        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/75 to-black/70 z-[1]"></div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          {/* Hero Content */}
          <div className="mb-12">
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6"
              style={{ color: COLORS.text.primary }}
            >
              Discover Your
              <br />
              <span
                style={{
                  background: COLORS.gradient.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Next Great Read
              </span>
            </h1>

            <p
              className="text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10"
              style={{ color: COLORS.text.secondary }}
            >
              Explore a curated collection of books, connect with authors, and join a community of passionate readers.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navigate('/books')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-white transition-all hover:shadow-lg hover:scale-105 active:scale-95"
              style={{
                background: COLORS.gradient.primary,
              }}
            >
              Explore Books
              <ArrowRight size={20} />
            </button>

            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
              style={{
                color: COLORS.text.primary,
                borderWidth: '2px',
                borderColor: COLORS.primary[400],
                backgroundColor: COLORS.surface,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = COLORS.surfaceLight;
                e.target.style.borderColor = COLORS.primary[500];
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = COLORS.surface;
                e.target.style.borderColor = COLORS.primary[400];
              }}
            >
              Become an Author
              <Book size={20} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
            {[
              { number: '10K+', label: 'Books' },
              { number: '50K+', label: 'Readers' },
              { number: '1K+', label: 'Authors' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95 cursor-pointer group"
                style={{
                  backgroundColor: COLORS.surfaceLight,
                  borderWidth: '1px',
                  borderColor: COLORS.primary[400],
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 24px ${COLORS.primary[500]}40`;
                  e.currentTarget.style.borderColor = COLORS.primary[500];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = COLORS.primary[400];
                }}
              >
                <div
                  className="text-2xl md:text-3xl font-bold mb-1 group-hover:scale-110 transition-transform"
                  style={{ color: COLORS.primary[500] }}
                >
                  {stat.number}
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ color: COLORS.text.secondary }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer hover:scale-125 transition-transform z-10"
          onClick={() => {
            document.querySelector('#cta-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <ChevronDown size={28} style={{ color: COLORS.primary[500] }} />
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="cta-section"
        className="py-20 px-6 sm:px-8 lg:px-12 relative overflow-hidden"
        style={{
          background: COLORS.gradient.primary,
        }}
      >
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ color: COLORS.text.inverse }}
          >
            Ready to Begin Your Journey?
          </h2>

          <p
            className="text-lg mb-10"
            style={{ color: 'rgba(10, 10, 10, 0.9)' }}
          >
            Join our community of readers and authors today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 rounded-lg font-semibold transition-all hover:shadow-lg transform hover:scale-105 active:scale-95"
              style={{
                backgroundColor: COLORS.text.inverse,
                color: COLORS.primary[600],
              }}
            >
              Get Started
            </button>

            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
              style={{
                borderWidth: '2px',
                borderColor: COLORS.text.inverse,
                color: COLORS.text.inverse,
                backgroundColor: 'rgba(10, 10, 10, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(10, 10, 10, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(10, 10, 10, 0.2)';
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
