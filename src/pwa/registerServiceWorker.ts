/**
 * Registers the service worker and surfaces a pending update to the UI.
 *
 * The worker never calls `skipWaiting()` on its own, so a running session is
 * never swapped out from under the user. When a new version is waiting we hand
 * the UI a handle; the UI shows a prompt and, on confirmation, calls `apply()`,
 * which activates the new worker and reloads the page exactly once.
 */

export interface ServiceWorkerUpdate {
  /** Activate the waiting worker and reload the page. */
  apply: () => void;
}

export interface RegisterOptions {
  onUpdateReady: (update: ServiceWorkerUpdate) => void;
  onRegistered?: () => void;
  onError?: (error: unknown) => void;
}

const SW_URL = '/sw.js';

export function registerServiceWorker({
  onUpdateReady,
  onRegistered,
  onError,
}: RegisterOptions): () => void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return () => {};

  // The dev server serves unbundled modules; a shell cache would fight HMR.
  // Test the PWA against a real build with `npm run preview`.
  if (!import.meta.env.PROD) return () => {};

  let updateRequested = false;
  let reloading = false;

  const handleControllerChange = () => {
    if (!updateRequested || reloading) return;
    reloading = true;
    window.location.reload();
  };

  navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

  const announce = (worker: ServiceWorker) => {
    onUpdateReady({
      apply: () => {
        updateRequested = true;
        worker.postMessage({ type: 'SKIP_WAITING' });
      },
    });
  };

  const watchForUpdates = (registration: ServiceWorkerRegistration) => {
    // A worker already waiting means an update installed during a previous visit.
    if (registration.waiting && navigator.serviceWorker.controller) {
      announce(registration.waiting);
      return;
    }

    registration.addEventListener('updatefound', () => {
      const installing = registration.installing;
      if (!installing) return;

      installing.addEventListener('statechange', () => {
        // On the very first install `controller` is null: nothing to refresh.
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          announce(installing);
        }
      });
    });
  };

  navigator.serviceWorker
    .register(SW_URL, { scope: '/' })
    .then((registration) => {
      onRegistered?.();
      watchForUpdates(registration);

      // Long-lived tabs would otherwise never notice a new deployment.
      const checkForUpdate = () => {
        if (document.visibilityState === 'visible') registration.update().catch(() => {});
      };
      document.addEventListener('visibilitychange', checkForUpdate);
    })
    .catch((error) => {
      onError?.(error);
    });

  return () => {
    navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
  };
}
