import * as React from 'react';

/* ----------------------------------------------------------------
 * MetalButton — a tactile, metallic gradient button.
 *
 * Adapted to plain JSX from a shadcn/TS component (dropped cva and
 * @radix-ui/react-slot — not needed here). Press/hover state is driven
 * by local state with GPU-friendly transforms. The "gold" and "bronze"
 * variants suit the vintage bookstore theme.
 *
 * Props:
 *   variant: 'default' | 'primary' | 'success' | 'error' | 'gold' | 'bronze'
 *   ...all native <button> props (onClick, disabled, type, etc.)
 * ---------------------------------------------------------------- */

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const colorVariants = {
  default: {
    outer: 'bg-gradient-to-b from-[#000] to-[#A0A0A0]',
    inner: 'bg-gradient-to-b from-[#FAFAFA] via-[#3E3E3E] to-[#E5E5E5]',
    button: 'bg-gradient-to-b from-[#B9B9B9] to-[#969696]',
    textColor: 'text-white',
    textShadow: '[text-shadow:_0_-1px_0_rgb(80_80_80_/_100%)]',
  },
  primary: {
    outer: 'bg-gradient-to-b from-[#000] to-[#A0A0A0]',
    inner: 'bg-gradient-to-b from-[#2e8b57] via-[#1f7a54] to-[#0f3d2e]',
    button: 'bg-gradient-to-b from-[#3da06a] to-[#1f7a54]',
    textColor: 'text-white',
    textShadow: '[text-shadow:_0_-1px_0_rgb(15_61_46_/_100%)]',
  },
  success: {
    outer: 'bg-gradient-to-b from-[#005A43] to-[#7CCB9B]',
    inner: 'bg-gradient-to-b from-[#E5F8F0] via-[#00352F] to-[#D1F0E6]',
    button: 'bg-gradient-to-b from-[#9ADBC8] to-[#3E8F7C]',
    textColor: 'text-[#FFF7F0]',
    textShadow: '[text-shadow:_0_-1px_0_rgb(6_78_59_/_100%)]',
  },
  error: {
    outer: 'bg-gradient-to-b from-[#5A0000] to-[#FFAEB0]',
    inner: 'bg-gradient-to-b from-[#FFDEDE] via-[#680002] to-[#FFE9E9]',
    button: 'bg-gradient-to-b from-[#F08D8F] to-[#A45253]',
    textColor: 'text-[#FFF7F0]',
    textShadow: '[text-shadow:_0_-1px_0_rgb(146_64_14_/_100%)]',
  },
  gold: {
    outer: 'bg-gradient-to-b from-[#917100] to-[#EAD98F]',
    inner: 'bg-gradient-to-b from-[#FFFDDD] via-[#856807] to-[#FFF1B3]',
    button: 'bg-gradient-to-b from-[#FFEBA1] to-[#9B873F]',
    textColor: 'text-[#3a2c05]',
    textShadow: '[text-shadow:_0_1px_0_rgb(255_253_221_/_60%)]',
  },
  bronze: {
    outer: 'bg-gradient-to-b from-[#864813] to-[#E9B486]',
    inner: 'bg-gradient-to-b from-[#EDC5A1] via-[#5F2D01] to-[#FFDEC1]',
    button: 'bg-gradient-to-b from-[#FFE3C9] to-[#A36F3D]',
    textColor: 'text-[#3a1d05]',
    textShadow: '[text-shadow:_0_1px_0_rgb(255_227_201_/_55%)]',
  },
};

const TRANSITION = 'all 250ms cubic-bezier(0.1, 0.4, 0.2, 1)';

function metalButtonVariants(variant, isPressed, isHovered, isTouchDevice) {
  const colors = colorVariants[variant] || colorVariants.default;
  return {
    wrapper: cn(
      'relative inline-flex transform-gpu rounded-md p-[1.25px] will-change-transform',
      colors.outer
    ),
    wrapperStyle: {
      transform: isPressed ? 'translateY(2.5px) scale(0.99)' : 'translateY(0) scale(1)',
      boxShadow: isPressed
        ? '0 1px 2px rgba(0, 0, 0, 0.15)'
        : isHovered && !isTouchDevice
          ? '0 4px 12px rgba(0, 0, 0, 0.12)'
          : '0 3px 8px rgba(0, 0, 0, 0.08)',
      transition: TRANSITION,
      transformOrigin: 'center center',
    },
    inner: cn(
      'absolute inset-[1px] transform-gpu rounded-lg will-change-transform',
      colors.inner
    ),
    innerStyle: {
      transition: TRANSITION,
      transformOrigin: 'center center',
      filter: isHovered && !isPressed && !isTouchDevice ? 'brightness(1.05)' : 'none',
    },
    button: cn(
      'relative z-10 m-[1px] inline-flex h-11 transform-gpu cursor-pointer items-center justify-center overflow-hidden rounded-md px-6 py-2 text-sm leading-none font-semibold will-change-transform outline-none',
      colors.button,
      colors.textColor,
      colors.textShadow
    ),
    buttonStyle: {
      transform: isPressed ? 'scale(0.97)' : 'scale(1)',
      transition: TRANSITION,
      transformOrigin: 'center center',
      filter: isHovered && !isPressed && !isTouchDevice ? 'brightness(1.02)' : 'none',
    },
  };
}

function ShineEffect({ isPressed }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-20 overflow-hidden transition-opacity duration-300',
        isPressed ? 'opacity-20' : 'opacity-0'
      )}
    >
      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-neutral-100 to-transparent" />
    </div>
  );
}

const MetalButton = React.forwardRef(function MetalButton(
  { children, className = '', variant = 'default', fullWidth = false, ...props },
  ref
) {
  const [isPressed, setIsPressed] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  React.useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const variants = metalButtonVariants(variant, isPressed, isHovered, isTouchDevice);

  return (
    <div className={cn(variants.wrapper, fullWidth && 'flex w-full')} style={variants.wrapperStyle}>
      <div className={variants.inner} style={variants.innerStyle} />
      <button
        ref={ref}
        className={cn(variants.button, fullWidth && 'w-full', className)}
        style={variants.buttonStyle}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => {
          setIsPressed(false);
          setIsHovered(false);
        }}
        onMouseEnter={() => {
          if (!isTouchDevice) setIsHovered(true);
        }}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        onTouchCancel={() => setIsPressed(false)}
        {...props}
      >
        <ShineEffect isPressed={isPressed} />
        {children || 'Button'}
        {isHovered && !isPressed && !isTouchDevice && (
          <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-t from-transparent to-white/5" />
        )}
      </button>
    </div>
  );
});

export default MetalButton;
export { MetalButton };
