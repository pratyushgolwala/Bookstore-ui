import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, BookOpen, Truck, ShieldCheck } from 'lucide-react';
import COLORS from '../../constants/colors';
import MetalButton from '../../components/ui/MetalButton';
import { selectIsAuthenticated, selectCurrentUser } from '../../store/slices/authSlice';

/**
 * LandingPage — Folio's storefront window.
 *
 * Deliberately asymmetric and editorial: a tall serif headline pinned left,
 * a leaning stack of book spines off to the right, flat book-cloth colors,
 * and hand-set numbering. No gradients, no glow blobs.
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
    <div className="w-full" style={{ backgroundColor: COLORS.background, paddingTop: '68px' }}>
      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* thin top hairline rule, like a printed page edge */}
        <div className="h-px w-full" style={{ backgroundColor: COLORS.border }} />

        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 pb-24">
          {/* Top line: shop label + tiny index, set wide apart */}
          <div className="flex items-baseline justify-between mb-14">
            <span
              className="text-xs tracking-[0.35em] uppercase"
              style={{ color: COLORS.brass }}
            >
              Folio — Reading Room
            </span>
            <span
              className="hidden sm:block text-xs tracking-[0.25em] uppercase"
              style={{ color: COLORS.text.tertiary }}
            >
              No. 01 / Welcome
            </span>
          </div>

          {/* The asymmetric split: headline left (7), spines right (5) */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-6 items-end">
            {/* LEFT — the big serif statement */}
            <div className="lg:col-span-7">
              <h1
                className="font-display font-black leading-[0.92] tracking-[-0.02em]"
                style={{ color: COLORS.text.primary, fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}
              >
                Books worth
                <br />
                <span style={{ color: COLORS.brass, fontStyle: 'italic', fontWeight: 500 }}>
                  staying up
                </span>{' '}
                for.
              </h1>

              <p
                className="mt-8 text-lg leading-relaxed max-w-md"
                style={{ color: COLORS.text.secondary }}
              >
                A small, opinionated shelf of fiction, poetry, history and the
                odd forgotten classic — picked by people, not an algorithm.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <MetalButton variant="bronze" onClick={() => navigate('/books')} className="gap-2">
                  Browse the shelves <ArrowRight size={17} />
                </MetalButton>
                <button
                  onClick={() => navigate('/register')}
                  className="text-sm font-semibold tracking-wide self-center transition-colors"
                  style={{ color: COLORS.text.secondary }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.brass)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.text.secondary)}
                >
                  or shelve your own work →
                </button>
              </div>
            </div>

            {/* RIGHT — leaning spine stack, hangs lower than the text baseline */}
            <div className="lg:col-span-5 lg:pl-8">
              <SpineStack />
            </div>
          </div>
        </div>
      </section>

      {/* ── A QUIET STAT STRIP — inline, not boxed cards ───────────── */}
      <section
        className="border-y"
        style={{ borderColor: COLORS.border, backgroundColor: COLORS.surface }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
          <div className="flex flex-wrap items-baseline gap-x-12 gap-y-6">
            {[
              { n: '10,400', l: 'titles in the room' },
              { n: '52,000', l: 'readers at the table' },
              { n: '1,100', l: 'authors on the shelf' },
              { n: 'since dawn', l: 'open hours' },
            ].map((s) => (
              <div key={s.l} className="flex items-baseline gap-3">
                <span
                  className="font-display text-3xl font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  {s.n}
                </span>
                <span className="text-sm" style={{ color: COLORS.text.tertiary }}>
                  {s.l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOUSE NOTES (the "why us", but as a numbered editorial list) ─ */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-24">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <h2
              className="font-display text-4xl font-bold leading-tight editorial-rule"
              style={{ color: COLORS.text.primary }}
            >
              How the
              <br /> house runs
            </h2>
          </div>

          <div className="lg:col-span-8">
            {[
              {
                icon: BookOpen,
                title: 'A shelf you can walk',
                desc: 'Ten thousand titles, browsable as an actual 3D shelf you can pan, tilt and pull from — or a plain grid when you are in a hurry.',
              },
              {
                icon: Truck,
                title: 'It arrives, properly wrapped',
                desc: 'Free shipping over ₹500, packed so the corners survive the journey to your door.',
              },
              {
                icon: ShieldCheck,
                title: 'Checkout you can trust',
                desc: 'Protected payments and a quiet, honest buying flow. No dark patterns, no surprises at the till.',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="flex gap-6 py-7 border-t"
                  style={{ borderColor: COLORS.border }}
                >
                  <span
                    className="font-display text-2xl font-bold pt-0.5 w-10 shrink-0"
                    style={{ color: COLORS.brass }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="shrink-0 pt-1">
                    <Icon size={22} style={{ color: COLORS.text.secondary }} strokeWidth={1.6} />
                  </div>
                  <div>
                    <h3
                      className="font-display text-xl font-semibold mb-1.5"
                      style={{ color: COLORS.text.primary }}
                    >
                      {f.title}
                    </h3>
                    <p className="text-sm leading-relaxed max-w-xl" style={{ color: COLORS.text.secondary }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PULL QUOTE — off-center, big serif, flat ───────────────── */}
      <section
        className="border-t"
        style={{ borderColor: COLORS.border, backgroundColor: COLORS.neutral[100] }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-24">
          <div className="lg:max-w-3xl">
            <p
              className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-[1.15]"
              style={{ color: COLORS.text.primary }}
            >
              <span style={{ color: COLORS.brass }}>“</span>
              A room without books is like a body without a soul.
              <span style={{ color: COLORS.brass }}>”</span>
            </p>
            <p
              className="mt-6 text-sm uppercase tracking-[0.3em]"
              style={{ color: COLORS.text.tertiary }}
            >
              — Marcus Tullius Cicero
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA — solid book-cloth panel, no gradient ─────────────── */}
      <section
        id="cta-section"
        className="relative overflow-hidden"
        style={{ backgroundColor: COLORS.cloth }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <h2
                className="font-display text-4xl md:text-5xl font-bold leading-tight"
                style={{ color: '#fdf6e6' }}
              >
                Pull up a chair.
              </h2>
              <p className="mt-4 text-lg max-w-lg" style={{ color: '#f0dcc4' }}>
                Make an account, build a shelf, leave a note in the margins.
                The reading room keeps your seat warm.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 lg:items-end">
              <MetalButton variant="gold" onClick={() => navigate('/register')}>
                Get a library card
              </MetalButton>
              <MetalButton variant="bronze" onClick={() => navigate('/login')}>
                Sign in
              </MetalButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Leaning stack of book spines — flat fills, hand-set angles ───
   No gradients, no glow. Each spine is a solid book-cloth color with a
   foil-stamped title, tilted slightly differently so it reads as a real,
   slightly untidy pile rather than a generated grid. */
function SpineStack() {
  const spines = [
    { color: '#3f5d54', title: 'The Quiet Coast', author: 'A. Maro', rot: '-2.5deg', w: '94%' },
    { color: '#7a3b2e', title: 'Letters at Dusk', author: 'I. Soren', rot: '1.5deg', w: '100%' },
    { color: '#2f4858', title: 'On Borrowed Maps', author: 'R. Vale', rot: '-1deg', w: '88%' },
    { color: '#6b4a2f', title: 'A History of Almost', author: 'D. Okafor', rot: '2.8deg', w: '97%' },
    { color: '#52414f', title: 'Marginalia', author: 'P. Reyes', rot: '-3.2deg', w: '82%' },
  ];

  return (
    <div className="relative mx-auto" style={{ maxWidth: 380 }}>
      <div className="flex flex-col gap-2.5">
        {spines.map((s, i) => (
          <div
            key={s.title}
            className="relative flex items-center justify-between px-5"
            style={{
              width: s.w,
              marginLeft: i % 2 ? 'auto' : 0,
              height: 62,
              backgroundColor: s.color,
              transform: `rotate(${s.rot})`,
              borderRadius: 3,
              borderLeft: '5px solid rgba(0,0,0,0.28)',
              boxShadow: '0 10px 22px rgba(0,0,0,0.45)',
            }}
          >
            {/* top & bottom foil lines on the spine */}
            <span
              className="absolute left-0 right-0 top-2 h-px"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
            />
            <span
              className="absolute left-0 right-0 bottom-2 h-px"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
            />
            <span
              className="font-display text-sm font-semibold truncate pr-3"
              style={{ color: '#f2e7cf' }}
            >
              {s.title}
            </span>
            <span
              className="text-[10px] tracking-widest uppercase shrink-0"
              style={{ color: 'rgba(242,231,207,0.6)' }}
            >
              {s.author}
            </span>
          </div>
        ))}
      </div>

      {/* a single book lying flat on top of the pile, slightly askew */}
      <div
        className="absolute -right-2 -top-7 px-4 py-3"
        style={{
          backgroundColor: COLORS.brass,
          transform: 'rotate(6deg)',
          borderRadius: 3,
          boxShadow: '0 12px 26px rgba(0,0,0,0.5)',
        }}
      >
        <span className="font-display text-xs font-bold" style={{ color: COLORS.ink }}>
          STAFF PICK
        </span>
      </div>
    </div>
  );
}

export default LandingPage;
