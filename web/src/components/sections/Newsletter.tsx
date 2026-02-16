import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, Loader2, Bell } from 'lucide-react';
import { useLocale } from '../../i18n/useLocale';

const API_BASE = import.meta.env.PUBLIC_API_URL || '';

type State = 'idle' | 'loading' | 'success' | 'error' | 'already';

export function Newsletter() {
  const { t, locale } = useLocale();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setState('error');
      setErrorMsg(t('newsletter.errorInvalid'));
      return;
    }

    setState('loading');

    try {
      const res = await fetch(`${API_BASE}/v1/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          locale,
          source: 'website',
        }),
      });

      const json = await res.json() as { success: boolean; data?: { message: string }; error?: string };

      if (!res.ok || !json.success) {
        setState('error');
        setErrorMsg(json.error || t('newsletter.errorGeneric'));
        return;
      }

      if (json.data?.message === 'Already subscribed') {
        setState('already');
      } else {
        setState('success');
        setEmail('');
      }
    } catch {
      setState('error');
      setErrorMsg(t('newsletter.errorGeneric'));
    }
  };

  const handleReset = () => {
    setState('idle');
    setErrorMsg('');
    inputRef.current?.focus();
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(34,197,94,0.04),transparent_70%)]" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
              <Bell className="h-6 w-6 text-accent" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
            {t('newsletter.title')}
          </h2>
          <p className="text-sm text-text-muted max-w-md mx-auto mb-8 leading-relaxed">
            {t('newsletter.subtitle')}
          </p>

          {/* Form */}
          {state === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-4"
            >
              <CheckCircle className="h-10 w-10 text-accent" />
              <p className="text-sm font-medium text-accent">{t('newsletter.success')}</p>
              <p className="text-xs text-text-muted">{t('newsletter.successHint')}</p>
            </motion.div>
          ) : state === 'already' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-4"
            >
              <Mail className="h-10 w-10 text-blue" />
              <p className="text-sm font-medium text-blue">{t('newsletter.already')}</p>
              <button
                onClick={handleReset}
                className="text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                {t('newsletter.tryAnother')}
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted/40" />
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (state === 'error') setState('idle');
                  }}
                  placeholder={t('newsletter.placeholder')}
                  className="w-full rounded-xl border border-border/60 bg-bg-secondary/40 pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all"
                  disabled={state === 'loading'}
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={state === 'loading'}
                className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-bg-primary hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 flex items-center justify-center gap-2"
              >
                {state === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('newsletter.subscribing')}
                  </>
                ) : (
                  t('newsletter.subscribe')
                )}
              </button>
            </form>
          )}

          {/* Error message */}
          {state === 'error' && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-center gap-1.5 text-xs text-red-400"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              {errorMsg}
            </motion.p>
          )}

          {/* Privacy note */}
          {(state === 'idle' || state === 'error' || state === 'loading') && (
            <p className="mt-4 text-[11px] text-text-muted/40">
              {t('newsletter.privacy')}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
