import COLORS from '../../constants/colors';

/**
 * Button — themed button with variants.
 * variants: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * sizes: 'sm' | 'md' | 'lg'
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  style = {},
  ...props
}) {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

  const variantStyles = {
    primary: { background: COLORS.gradient.primary, color: COLORS.text.inverse },
    secondary: { backgroundColor: COLORS.secondary[400], color: COLORS.text.inverse },
    outline: {
      backgroundColor: 'transparent',
      color: COLORS.text.primary,
      border: `1.5px solid ${COLORS.primary[400]}`,
    },
    ghost: { backgroundColor: 'transparent', color: COLORS.text.secondary },
    danger: { backgroundColor: COLORS.error, color: COLORS.text.inverse },
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${fullWidth ? 'w-full' : ''} hover:shadow-lg hover:-translate-y-0.5 ${className}`}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}

export default Button;
