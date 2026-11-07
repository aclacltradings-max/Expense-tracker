import { useEffect, useState } from 'react';
import type { PwaState } from '../hooks/usePwa';

interface PwaToastsProps {
  pwa: PwaState;
}

/**
 * Bottom-anchored notices for service-worker state:
 *   - a transient "ready to work offline" confirmation, and
 *   - a persistent "new version available" prompt with a reload action.
 */
export function PwaToasts({ pwa }: PwaToastsProps) {
  const [showOfflineReady, setShowOfflineReady] = useState(false);

  useEffect(() => {
    if (!pwa.offlineReady) return;
    setShowOfflineReady(true);
    const timer = window.setTimeout(() => setShowOfflineReady(false), 5000);
    return () => window.clearTimeout(timer);
  }, [pwa.offlineReady]);

  if (!pwa.updateReady && !showOfflineReady) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
      role="status"
      aria-live="polite"
    >
      {pwa.updateReady && (
        <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
          <span className="flex-1">A new version of Expense Tracker is available.</span>
          <button
            type="button"
            onClick={pwa.applyUpdate}
            className="shrink-0 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Reload
          </button>
        </div>
      )}

      {showOfflineReady && !pwa.updateReady && (
        <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
          Ready to work offline. Add it to your home screen from the browser menu.
        </div>
      )}
    </div>
  );
}
