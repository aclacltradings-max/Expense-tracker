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
  /** Install is possible but needs manual steps (iOS Safari, Firefox). */
  needsManualInstall: boolean;
  /** Already running as an installed app. */
  isInstalled: boolean;
  applyUpdate: () => void;
  /** Resolves to 'accepted' | 'dismissed', or 'unavailable' if no prompt exists. */
  install: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const iosStandalone = (window.navigator as { standalone?: boolean }).standalone === true;
  return window.matchMedia('(display-mode: standalone)').matches || iosStandalone;
}

/**
 * Safari and Firefox never fire `beforeinstallprompt`, so the only route is the
 * browser's own share/menu sheet. Detect them to offer instructions instead of
 * a button that can never appear.
 */
function needsManualInstall(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
  const isSafari = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(ua);
  const isFirefox = /firefox|fxios/i.test(ua);
  return isIos || isSafari || isFirefox;
}

export function usePwa(): PwaState {
  const [update, setUpdate] = useState<ServiceWorkerUpdate | null>(null);
  const [offlineReady, setOfflineReady] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(detectStandalone);
  const [manualInstall, setManualInstall] = useState(false);

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

  // Only offer manual guidance when no native prompt is available to us.
  useEffect(() => {
    setManualInstall(needsManualInstall());
  }, []);

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!installEvent) return 'unavailable';
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    // A dismissed prompt cannot be re-shown from the same event.
    setInstallEvent(null);
    return outcome;
  }, [installEvent]);

  const applyUpdate = useCallback(() => {
    update?.apply();
  }, [update]);

  return {
    offlineReady,
    updateReady: update !== null,
    canInstall: installEvent !== null && !isInstalled,
    needsManualInstall: manualInstall && !installEvent && !isInstalled,
    isInstalled,
    applyUpdate,
    install,
  };
}
