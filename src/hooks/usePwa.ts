import { useCallback, useEffect, useState } from 'react';
import { registerServiceWorker, type ServiceWorkerUpdate } from '../pwa/registerServiceWorker';

/** Chrome/Edge only; not part of the DOM lib types. */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PwaState {
  /** True once the app shell is cached and usable offline. */
  offlineReady: boolean;
  /** A newer version is waiting to activate. */
  updateReady: boolean;
  /** The browser offered an install prompt (Android Chrome / desktop Chromium). */
  canInstall: boolean;
  /** Already running as an installed app. */
  isInstalled: boolean;
  applyUpdate: () => void;
  install: () => Promise<void>;
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const iosStandalone = (window.navigator as { standalone?: boolean }).standalone === true;
  return window.matchMedia('(display-mode: standalone)').matches || iosStandalone;
}

export function usePwa(): PwaState {
  const [update, setUpdate] = useState<ServiceWorkerUpdate | null>(null);
  const [offlineReady, setOfflineReady] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(detectStandalone);

  useEffect(
    () =>
      registerServiceWorker({
        onRegistered: () => setOfflineReady(true),
        onUpdateReady: (next) => setUpdate(next),
        onError: (error) => console.warn('[pwa] service worker registration failed', error),
      }),
    [],
  );

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      // Keep the event so the install button can trigger it on demand.
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstallEvent(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome !== 'accepted') setInstallEvent(null);
  }, [installEvent]);

  const applyUpdate = useCallback(() => {
    update?.apply();
  }, [update]);

  return {
    offlineReady,
    updateReady: update !== null,
    canInstall: installEvent !== null && !isInstalled,
    isInstalled,
    applyUpdate,
    install,
  };
}
