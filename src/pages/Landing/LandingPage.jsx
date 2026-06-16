import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, Book, BookOpen, Truck, ShieldCheck, Sparkles, Quote } from 'lucide-react';
import COLORS from '../../constants/colors';
import MetalButton from '../../components/ui/MetalButton';
import { selectIsAuthenticated, selectCurrentUser } from '../../store/slices/authSlice';

/**
 * LandingPage — split hero: marketing copy on the left, an artistic stacked-book
 * visual on the right. Warm vintage library palette. Redirects authed users.
 */
function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);

  // Redirect authenticated users to their role-appropriate landing page
  useEffect(() => {
    if (isAuthenticated) {
      const role = currentUser?.role;
      if (role === 'AUTHOR') navigate('/author', { replace: true });
      else if (role === 'ADMIN') navigate('/admin', { replace: true });
      else navigate('/books', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  return (
    <div className="w-full" style={{ backgroundColor: COLORS.background }}>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Warm radial ambience */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 120% at 15% 20%, ${COLORS.neutral[200]} 0%, ${COLORS.background} 55%)`,
          }}
        />
        {/* Subtle animated glow blobs */}
        <div
          className="absolute -top-20 -left-24 w-[480px] h-[480px] rounded-full blur-3xl opacity-30"
          style={{ background: COLORS.gradient.primary, animation: 'float1 14s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full blur-3xl opacity-25"
          style={{ background: COLORS.gradient.accent, animation: 'float2 18s ease-in-out infinite' }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid lg:grid-cols-2 gap-12 items-center py-24">
          {/* ── LEFT: copy ── */}
          <div className="text-center lg:text-left">
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.secondary[500], border: `1px solid ${COLORS.border}` }}
            >
              <Sparkles size={13} /> A cozy corner for book lovers
            </span>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
              style={{ color: COLORS.text.primary }}
            >
              Discover Your
              <br />
              <span
                style={{
                  background: COLORS.gradient.accent,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Next Great Read
              </span>
            </h1>

            <p
              className="text-lg md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10"
              style={{ color: COLORS.text.secondary }}
            >
              Explore a curated collection of timeless stories, connect with authors,
              and join a community of passionate readers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-14">
              <MetalButton variant="gold" onClick={() => navigate('/books')} className="gap-2">
                Explore Books <ArrowRight size={18} />
              </MetalButton>
              <MetalButton variant="bronze" onClick={() => navigate('/register')} className="gap-2">
                Become an Author <Book size={18} />
              </MetalButton>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              {[
                { number: '10K+', label: 'Books' },
                { number: '50K+', label: 'Readers' },
                { number: '1K+', label: 'Authors' },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-bold" style={{ color: COLORS.secondary[500] }}>
                    {stat.number}
                  </div>
                  <p className="text-sm font-medium mt-1" style={{ color: COLORS.text.tertiary }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: artistic stacked-books visual ── */}
          <div className="relative hidden lg:flex items-center justify-center h-[520px]">
            <BookArt />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-6 sm:px-8 lg:px-12" style={{ backgroundColor: COLORS.background }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: COLORS.text.primary }}>
              Why Read With Us
            </h2>
            <p className="text-lg" style={{ color: COLORS.text.secondary }}>
              A modern bookstore built for true book lovers.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: 'Vast Collection', desc: 'Over 10,000 titles across every genre, browsable as an immersive 3D shelf.' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Free shipping on orders over ₹500, delivered right to your door.' },
              { icon: ShieldCheck, title: 'Secure Checkout', desc: 'Protected payments and a smooth, trustworthy buying experience.' },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="p-7 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-2xl"
                  style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: COLORS.gradient.primary }}>
                    <Icon size={24} color={COLORS.text.primary} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: COLORS.text.secondary }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── QUOTE STRIP ── */}
      <section className="py-16 px-6" style={{ backgroundColor: COLORS.neutral[100] }}>
        <div className="max-w-3xl mx-auto text-center">
          <Quote size={32} style={{ color: COLORS.primary[500] }} className="mx-auto mb-4" />
          <p className="text-2xl md:text-3xl font-semibold leading-snug" style={{ color: COLORS.text.primary }}>
            “A room without books is like a body without a soul.”
          </p>
          <p className="mt-4 text-sm uppercase tracking-widest" style={{ color: COLORS.secondary[500] }}>
            Marcus Tullius Cicero
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        id="cta-section"
        className="py-20 px-6 sm:px-8 lg:px-12 relative overflow-hidden"
        style={{ background: COLORS.gradient.primary }}
      >
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: COLORS.text.primary }}>
            Ready to Begin Your Journey?
          </h2>
          <p className="text-lg mb-10" style={{ color: COLORS.secondary[800] }}>
            Join our community of readers and authors today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <MetalButton variant="gold" onClick={() => navigate('/register')}>
              Get Started
            </MetalButton>
            <MetalButton variant="bronze" onClick={() => navigate('/login')}>
              Sign In
            </MetalButton>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 20px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-25px, -25px); }
        }
        @keyframes bookFloat {
          0%, 100% { transform: translateY(0) rotate(var(--rot)); }
          50% { transform: translateY(-14px) rotate(var(--rot)); }
        }
      `}</style>
    </div>
  );
}

/* ─── Artistic stacked-books visual (pure CSS, themed) ─── */
function BookArt() {
  const books = [
    { w: 300, h: 64, rot: '-4deg', delay: '0s',   from: COLORS.primary[400], to: COLORS.primary[600], label: 'CLASSICS' },
    { w: 270, h: 60, rot: '3deg',  delay: '0.6s', from: COLORS.accent[400],  to: COLORS.accent[600],  label: 'POETRY' },
    { w: 320, h: 66, rot: '-2deg', delay: '1.2s', from: COLORS.primary[500], to: COLORS.primary[300], label: 'FICTION' },
    { w: 250, h: 58, rot: '5deg',  delay: '1.8s', from: COLORS.secondary[400], to: COLORS.secondary[600], label: 'HISTORY', dark: true },
  ];

  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Glow disc behind the stack */}
      <div
        className="absolute inset-0 m-auto w-72 h-72 rounded-full blur-3xl opacity-40"
        style={{ background: COLORS.gradient.glow }}
      />

      {/* An open book on top */}
      <div className="relative mb-2" style={{ animation: 'bookFloat 6s ease-in-out infinite', ['--rot']: '0deg' }}>
        <BookOpen size={92} style={{ color: COLORS.secondary[500] }} strokeWidth={1.2} />
      </div>

      {/* Stacked spines */}
      {books.map((b, i) => (
        <div
          key={i}
          className="relative rounded-md flex items-center justify-end pr-4 shadow-2xl"
          style={{
            width: b.w,
            height: b.h,
            background: `linear-gradient(135deg, ${b.from} 0%, ${b.to} 100%)`,
            transform: `rotate(${b.rot})`,
            ['--rot']: b.rot,
            animation: `bookFloat ${5 + i}s ease-in-out infinite`,
            animationDelay: b.delay,
            border: `1px solid ${COLORS.neutral[300]}`,
            boxShadow: '0 18px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* spine ridges */}
          <div className="absolute left-3 top-0 bottom-0 w-[3px]" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }} />
          <div className="absolute left-5 top-0 bottom-0 w-[2px]" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
          <span
            className="text-xs font-bold tracking-widest"
            style={{ color: b.dark ? COLORS.primary[400] : COLORS.secondary[800] }}
          >
            {b.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default LandingPage;
