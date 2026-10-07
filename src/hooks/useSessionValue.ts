'use client';

import { useSyncExternalStore } from 'react';

function subscribe(notify: () => void) {
  window.addEventListener('storage', notify);
  return () => window.removeEventListener('storage', notify);
}

export function useSessionValue(key: string) {
  const value = useSyncExternalStore(subscribe, () => {
    try { return sessionStorage.getItem(key); } catch { return null; }
  }, () => null);
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return { value, hydrated };
}
