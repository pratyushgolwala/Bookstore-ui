import COLORS from '../../constants/colors';

/**
 * Card — a themed surface container with optional hover lift and glow.
 */
function Card({ children, hover = false, glow = false, className = '', style = {}, ...props }) {
  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${
        hover ? 'hover:-translate-y-1 hover:shadow-2xl cursor-pointer' : ''
      } ${className}`}
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        boxShadow: glow ? `0 8px 32px ${COLORS.primary[500]}22` : 'none',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
