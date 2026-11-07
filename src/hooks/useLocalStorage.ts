import { useCallback, useEffect, useState } from 'react';
import { saveCollection } from '../utils/storage';

/**
 * A `useState` variant that mirrors its value into localStorage.
 *
 * The initial value is resolved lazily so the first render already reflects any
 * persisted data. Writes are wrapped in try/catch inside `saveCollection`, so a
 * full or unavailable store never breaks the UI.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => initialValue);

  useEffect(() => {
    if (Array.isArray(value)) {
      saveCollection(key, value);
    }
  }, [key, value]);

  const update = useCallback((next: T | ((current: T) => T)) => {
    setValue((current) => (typeof next === 'function' ? (next as (c: T) => T)(current) : next));
  }, []);

  return [value, update] as const;
}
