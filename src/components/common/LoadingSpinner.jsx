/**
 * LoadingSpinner - A centered spinning loader component.
 * Used as a React.Suspense fallback while lazy-loaded components are loading.
 */
const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div
        className="w-10 h-10 border-4 border-primary-50 border-t-primary-500 rounded-full animate-spin"
        role="status"
        aria-label="Loading"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
