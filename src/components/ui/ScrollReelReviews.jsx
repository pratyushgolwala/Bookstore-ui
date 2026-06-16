import * as React from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import COLORS from '../../constants/colors';

/* ----------------------------------------------------------------
 * ScrollReelReviews
 *
 * A counter-rotating scroll reel of reviewer portraits with a
 * per-character text rise for each review. Adapted to plain JSX and
 * the app's COLORS palette (vintage bookstore theme) from a shadcn/
 * Tailwind-v4 testimonials component.
 *
 * Each review entry produces one "featured" portrait tile in the
 * middle reel; the outer columns counter-rotate. The quote and author
 * animate in character-by-character; the previous block exits as a
 * whole before the new characters rise.
 * ---------------------------------------------------------------- */

/* Geometry — middle column pitch between portrait centers:
 * 3 * (cell 121.33px + gap 8px) = 388px */
const CELL = 121.33;
const STEP = 3 * (CELL + 8);
const EXIT_MS = 240; // old text removed / new text mounted
const SLIDE_MS = 800; // column slide duration + interaction lock
const EASE_INOUT = 'cubic-bezier(0.65,0,0.35,1)';

const FEATURED_SHADOW =
  '0 1.008px 0.705px -0.563px rgba(0,0,0,0.28), 0 2.389px 1.672px -1.125px rgba(0,0,0,0.27), ' +
  '0 4.357px 3.05px -1.688px rgba(0,0,0,0.27), 0 7.244px 5.07px -2.25px rgba(0,0,0,0.26), ' +
  '0 11.698px 8.188px -2.813px rgba(0,0,0,0.25), 0 19.148px 13.404px -3.375px rgba(0,0,0,0.23), ' +
  '0 32.972px 23.08px -3.938px rgba(0,0,0,0.19), 0 60px 42px -4.5px rgba(0,0,0,0.1), ' +
  'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.6)';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/* Blurred placeholder cell — a "spine" tile in the reel backdrop. */
function Cell() {
  return (
    <div
      aria-hidden="true"
      className="shrink-0 rounded-xl blur-[1px]"
      style={{
        width: CELL,
        height: CELL,
        background: `linear-gradient(to bottom, ${COLORS.surfaceLight}, ${COLORS.surface})`,
        border: `1px solid ${COLORS.border}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    />
  );
}

/* Featured portrait tile with desaturation + warm gold sheen overlays. */
function Featured({ src, alt }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl"
      style={{ width: CELL, height: CELL, backgroundColor: COLORS.surfaceLight, boxShadow: FEATURED_SHADOW }}
    >
      <img
        src={src}
        alt={alt ?? ''}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
      />
      {/* desaturate via saturation blend so portraits read as sepia-ish */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] mix-blend-saturation"
        style={{ backgroundColor: COLORS.secondary[200] }}
      />
      {/* diagonal warm gold sheen (vintage, replaces the original purple) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[3] blur-[6px] mix-blend-overlay"
        style={{
          background:
            'linear-gradient(220.99deg, rgba(153,95,47,0) 32%, rgba(153,95,47,0.9) 41%, ' +
            'rgba(176,118,74,0.85) 47%, rgba(228,214,169,0.5) 54%, rgba(228,214,169,0) 65%)',
        }}
      />
    </div>
  );
}

/* Per-character split. Spaces live between word spans as plain text
 * nodes so natural line-wrapping is preserved. Each char rises in with
 * an inline animation-delay; while the block is exiting, the char
 * animation is removed (see .scroll-reel-exit in index.css). */
function Chars({ text, startIndex, staggerMs }) {
  let idx = startIndex;
  const words = text.split(' ');
  return (
    <>
      {words.map((word, wi) => {
        const wordSpan = (
          <span className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, ci) => {
              const delay = idx * staggerMs;
              idx += 1;
              return (
                <span key={ci} className="scroll-reel-char" style={{ animationDelay: `${delay}ms` }}>
                  {ch}
                </span>
              );
            })}
          </span>
        );
        if (wi < words.length - 1) idx += 1;
        return (
          <React.Fragment key={wi}>
            {wordSpan}
            {wi < words.length - 1 ? ' ' : null}
          </React.Fragment>
        );
      })}
    </>
  );
}

/**
 * ScrollReelReviews
 * @param {{
 *   reviews: Array<{ quote: string, author: string, image: string, alt?: string, rating?: number }>,
 *   charStaggerMs?: number,
 *   className?: string,
 * }} props
 */
export function ScrollReelReviews({ reviews, charStaggerMs = 6, className }) {
  /* Navigation state vs display state are kept separate so the exiting
   * block and the entering block never render together. */
  const [index, setIndex] = React.useState(0);
  const [displayIndex, setDisplayIndex] = React.useState(0);
  const [exiting, setExiting] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const animating = React.useRef(false);
  const timeouts = React.useRef([]);
  const count = reviews.length;

  React.useEffect(() => {
    /* Enable column transitions only after first paint so the reel
     * appears at its starting offset without a slide-in. */
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setMounted(true))
    );
    const pending = timeouts.current;
    return () => {
      cancelAnimationFrame(raf);
      pending.forEach(clearTimeout);
    };
  }, []);

  const paginate = React.useCallback(
    (dir) => {
      if (animating.current) return;
      const next = index + dir;
      if (next < 0 || next >= count) return;
      animating.current = true;
      setIndex(next);
      setExiting(true);
      timeouts.current.push(
        setTimeout(() => {
          setDisplayIndex(next);
          setExiting(false);
        }, EXIT_MS)
      );
      timeouts.current.push(
        setTimeout(() => {
          animating.current = false;
        }, SLIDE_MS)
      );
    },
    [index, count]
  );

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      paginate(1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      paginate(-1);
    }
  };

  /* Middle column: 3 leading cells, then featured + 2 cells between
   * each review, then 3 trailing cells. */
  const middleItems = React.useMemo(() => {
    const items = [];
    for (let i = 0; i < 3; i += 1) items.push({ type: 'cell' });
    reviews.forEach((_, i) => {
      items.push({ type: 'featured', i });
      if (i < count - 1) items.push({ type: 'cell' }, { type: 'cell' });
    });
    for (let i = 0; i < 3; i += 1) items.push({ type: 'cell' });
    return items;
  }, [reviews, count]);

  const sideCellCount = 4 + 2 * count;
  const centerIdx = (count - 1) / 2;
  const middleY = (centerIdx - index) * STEP;
  const sideY = -middleY;

  const colStyle = (y) => ({
    transform: `translateY(${y}px)`,
    transition: mounted ? `transform ${SLIDE_MS}ms ${EASE_INOUT}` : 'none',
  });

  const current = reviews[displayIndex];
  if (!current) return null;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Reader reviews"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        'relative flex w-full max-w-[1060px] flex-col items-stretch gap-2.5 overflow-hidden rounded-xl outline-none md:min-h-[320px] md:flex-row',
        className
      )}
      style={{ backgroundColor: COLORS.surfaceLight, border: `1px solid ${COLORS.border}` }}
    >
      {/* Reel section */}
      <div
        aria-hidden="true"
        className="relative h-56 w-full shrink-0 self-stretch overflow-hidden md:h-auto md:w-[380px]"
        style={{
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
          maskImage:
            'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskComposite: 'source-in',
          maskComposite: 'intersect',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          {/* Left column */}
          <div
            className="flex shrink-0 flex-col gap-2 will-change-transform motion-reduce:[transition:none!important]"
            style={colStyle(sideY)}
          >
            {Array.from({ length: sideCellCount }).map((_, i) => (
              <Cell key={i} />
            ))}
          </div>
          {/* Middle column */}
          <div
            className="flex shrink-0 flex-col gap-2 will-change-transform motion-reduce:[transition:none!important]"
            style={colStyle(middleY)}
          >
            {middleItems.map((item, i) =>
              item.type === 'featured' ? (
                <Featured key={i} src={reviews[item.i].image} alt={reviews[item.i].alt} />
              ) : (
                <Cell key={i} />
              )
            )}
          </div>
          {/* Right column */}
          <div
            className="flex shrink-0 flex-col gap-2 will-change-transform motion-reduce:[transition:none!important]"
            style={colStyle(sideY)}
          >
            {Array.from({ length: sideCellCount }).map((_, i) => (
              <Cell key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch px-5 py-7 md:py-10">
        <div className="flex flex-col gap-[9px]">
          <Quote size={44} style={{ color: `${COLORS.secondary[400]}66` }} aria-hidden="true" />

          {/* Text stage */}
          <div className="relative w-full max-w-[390px] overflow-hidden" aria-live="polite">
            {/* Invisible in-flow copy sizes the stage to the current quote
             * at any viewport width, so wrapped text never clips. */}
            <div aria-hidden="true" className="invisible flex min-h-[140px] flex-col gap-[19px]">
              <p className="m-0 text-lg font-medium leading-[1.3] tracking-[-0.02em] sm:text-[22px]">
                {current.quote}
              </p>
              <p className="m-0 text-sm font-medium leading-[1.3]">{current.author}</p>
            </div>

            <div
              key={displayIndex}
              className={cn(
                'absolute inset-x-0 top-0 flex flex-col gap-[19px] will-change-[transform,opacity]',
                exiting && 'scroll-reel-exit'
              )}
            >
              <p
                className="m-0 text-lg font-medium leading-[1.3] tracking-[-0.02em] sm:text-[22px]"
                style={{ color: COLORS.text.primary }}
              >
                <Chars text={current.quote} startIndex={0} staggerMs={charStaggerMs} />
              </p>
              <p
                className="m-0 text-sm font-medium leading-[1.3]"
                style={{ color: COLORS.text.tertiary }}
              >
                <Chars text={current.author} startIndex={current.quote.length + 6} staggerMs={charStaggerMs} />
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center gap-1.5 md:mt-0">
          <span className="mr-2 text-xs font-medium" style={{ color: COLORS.text.tertiary }}>
            {index + 1} / {count}
          </span>
          <NavButton
            onClick={() => paginate(-1)}
            disabled={index === 0}
            label="Previous review"
            icon={<ChevronLeft size={14} />}
          />
          <NavButton
            onClick={() => paginate(1)}
            disabled={index === count - 1}
            label="Next review"
            icon={<ChevronRight size={14} />}
          />
        </div>
      </div>
    </div>
  );
}

function NavButton({ onClick, disabled, label, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-7 w-7 cursor-pointer place-items-center rounded-full p-0 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:enabled:scale-[1.08] active:enabled:scale-[0.94] disabled:cursor-default disabled:opacity-40 focus-visible:outline-none"
      style={{ border: `1px solid ${COLORS.border}`, backgroundColor: 'transparent', color: COLORS.text.secondary }}
    >
      {icon}
    </button>
  );
}

export default ScrollReelReviews;
