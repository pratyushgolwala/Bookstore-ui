import * as React from 'react';

/* ----------------------------------------------------------------
 * LiquidButton — a glassy "liquid glass" button that distorts what's
 * behind it using an SVG displacement filter as a backdrop-filter.
 *
 * Adapted to plain JSX from a shadcn/TS component (dropped cva and
 * @radix-ui/react-slot). The text color follows the app theme via the
 * inherited `color`, so it picks up the vintage palette automatically.
 *
 * Browser note: `backdrop-filter: url(#filter)` renders in Chromium and
 * Firefox; Safari ignores the SVG filter and shows a plain translucent
 * button (still fully usable). Honour prefers-reduced-motion by keeping
 * the effect static (no animation is used, only a hover scale).
 *
 * Props:
 *   size: 'sm' | 'default' | 'lg' | 'xl' | 'xxl'
 *   ...all native <button> props
 * ---------------------------------------------------------------- */

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SIZE_CLASSES = {
  sm: 'h-8 text-xs gap-1.5 px-4',
  default: 'h-9 px-4 py-2',
  lg: 'h-10 rounded-md px-6',
  xl: 'h-12 rounded-md px-8',
  xxl: 'h-14 rounded-md px-10',
  icon: 'size-9',
};

function GlassFilter() {
  return (
    <svg className="hidden" aria-hidden="true">
      <defs>
        <filter
          id="liquid-glass-container"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

function LiquidButton({ className = '', size = 'xxl', children, ...props }) {
  return (
    <button
      data-slot="liquid-button"
      className={cn(
        'relative inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition duration-300 hover:scale-105 outline-none disabled:pointer-events-none disabled:opacity-50',
        SIZE_CLASSES[size] || SIZE_CLASSES.xxl,
        className
      )}
      {...props}
    >
      {/* Glass rim / inner shadows */}
      <div className="absolute top-0 left-0 z-0 h-full w-full rounded-md shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(255,255,255,0.4),inset_-3px_-3px_0.5px_-3px_rgba(255,255,255,0.35),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)] transition-all" />
      {/* Backdrop distortion layer */}
      <div
        className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-md"
        style={{ backdropFilter: 'url("#liquid-glass-container")' }}
      />
      <div className="pointer-events-none z-10">{children}</div>
      <GlassFilter />
    </button>
  );
}

export default LiquidButton;
export { LiquidButton };
