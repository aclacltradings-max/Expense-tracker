import { useEffect, useRef } from 'react';

/**
 * Calls `handler` when the user presses Escape. Used to close the modal and the
 * delete confirmation without trapping focus handlers in every component.
 */
export function useEscapeKey(handler: () => void, enabled = true) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handlerRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}

/** Locks body scroll while a modal or drawer is open. */
export function useBodyScrollLock(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [enabled]);
}
