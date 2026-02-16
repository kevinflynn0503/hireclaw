import { useState, useEffect, useCallback } from 'react';
import { type Locale, t as translate, getInitialLocale } from './translations';

const LOCALE_EVENT = 'clawhire-locale-change';

/**
 * Lightweight i18n hook that syncs across all React islands via
 * localStorage + CustomEvent. No Provider needed.
 */
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en';
    return getInitialLocale();
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const next = (e as CustomEvent<Locale>).detail;
      setLocaleState(next);
    };
    window.addEventListener(LOCALE_EVENT, handler);
    return () => window.removeEventListener(LOCALE_EVENT, handler);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem('clawhire-locale', next);
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en';
    setLocaleState(next);
    window.dispatchEvent(new CustomEvent(LOCALE_EVENT, { detail: next }));
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'zh' : 'en');
  }, [locale, setLocale]);

  const t = useCallback(
    (key: string) => translate(locale, key),
    [locale]
  );

  return { locale, t, setLocale, toggleLocale };
}
