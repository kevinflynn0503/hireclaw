import { useState, useEffect, useCallback, useRef } from 'react';
import { type Locale, t as translate, getInitialLocale } from './translations';

const LOCALE_EVENT = 'hireclaw-locale-change';

/**
 * Read locale from the blocking script's data-locale attribute,
 * falling back to getInitialLocale() for safety.
 */
function getSyncedLocale(): Locale {
  if (typeof document === 'undefined') return 'en';
  const attr = document.documentElement.getAttribute('data-locale');
  if (attr === 'zh' || attr === 'en') return attr;
  return getInitialLocale();
}

/**
 * Mark body as ready (remove locale-pending, add locale-ready).
 * Called once after the first React island hydrates.
 */
let bodyRevealed = false;
function revealBody() {
  if (bodyRevealed) return;
  bodyRevealed = true;
  if (typeof document === 'undefined') return;
  const body = document.body;
  body.classList.remove('locale-pending');
  body.classList.add('locale-ready');
}

/**
 * Lightweight i18n hook that syncs across all React islands via
 * localStorage + CustomEvent. No Provider needed.
 *
 * Uses the blocking <script> data-locale attribute for initial value
 * to prevent English flash on page load / refresh.
 */
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(getSyncedLocale);
  const didReveal = useRef(false);

  // Reveal body after first render (hydration complete)
  useEffect(() => {
    if (!didReveal.current) {
      didReveal.current = true;
      revealBody();
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const next = (e as CustomEvent<Locale>).detail;
      setLocaleState(next);
    };
    window.addEventListener(LOCALE_EVENT, handler);
    return () => window.removeEventListener(LOCALE_EVENT, handler);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem('hireclaw-locale', next);
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en';
    document.documentElement.setAttribute('data-locale', next);
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
