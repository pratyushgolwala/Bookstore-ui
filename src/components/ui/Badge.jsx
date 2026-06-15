import COLORS from '../../constants/colors';

/**
 * Badge — small pill label. variants: 'primary' | 'secondary' | 'accent' | 'success' | 'neutral'
 */
function Badge({ children, variant = 'primary', className = '', style = {} }) {
  const variants = {
    primary: { bg: `${COLORS.primary[500]}22`, fg: COLORS.primary[800] },
    secondary: { bg: `${COLORS.secondary[400]}22`, fg: COLORS.secondary[700] },
    accent: { bg: `${COLORS.accent[400]}22`, fg: COLORS.accent[600] },
    success: { bg: `${COLORS.success}22`, fg: COLORS.success },
    neutral: { bg: COLORS.surfaceLight, fg: COLORS.text.secondary },
  };
  const v = variants[variant] || variants.primary;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${className}`}
      style={{ backgroundColor: v.bg, color: v.fg, ...style }}
    >
      {children}
    </span>
  );
}

export default Badge;
