import COLORS from '../../constants/colors';

/**
 * Skeleton — shimmering placeholder block for loading states.
 */
function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={`animate-pulse rounded-md ${className}`}
      style={{ backgroundColor: COLORS.surfaceLight, ...style }}
    />
  );
}

export default Skeleton;
