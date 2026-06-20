import { Suspense } from 'react';
import { AppRoutes } from './routes';
import COLORS from './constants/colors';

function LoadingFallback() {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: COLORS.background }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 rounded-full animate-spin"
          style={{
            border: `4px solid ${COLORS.border}`,
            borderTopColor: COLORS.brass,
          }}
        />
        <p className="text-sm" style={{ color: COLORS.text.tertiary }}>Loading…</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AppRoutes />
    </Suspense>
  );
}

export default App;
