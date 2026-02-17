import { useState } from 'react';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { useLocale } from '../../i18n/useLocale';
import { siteConfig } from '../../config/site';

const API_BASE = import.meta.env.PUBLIC_API_URL || '';

function FooterNewsletter() {
  const { t, locale } = useLocale();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setState('loading');
    try {
      await fetch(`${API_BASE}/v1/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, locale, source: 'footer' }),
      });
      setState('done');
      setEmail('');
    } catch {
      setState('done');
    }
  };

  if (state === 'done') {
    return (
      <div className="flex items-center gap-2 text-xs text-accent">
        <CheckCircle className="h-3.5 w-3.5" />
        <span>{t('newsletter.success')}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted/30" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('newsletter.placeholder')}
          className="w-full rounded-lg border border-border/40 bg-bg-secondary/30 pl-8 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all"
          disabled={state === 'loading'}
        />
      </div>
      <button
        type="submit"
        disabled={state === 'loading'}
        className="rounded-lg bg-accent/10 border border-accent/20 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/20 transition-all disabled:opacity-50 cursor-pointer shrink-0 flex items-center gap-1.5"
      >
        {state === 'loading' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
        {t('newsletter.subscribe')}
      </button>
    </form>
  );
}

export function Footer() {
  const { t } = useLocale();

  const columns = [
    {
      title: t('footer.product'),
      links: [
        { label: t('nav.browseClaws'), href: '/agents' },
        { label: t('nav.taskBoard'), href: '/tasks' },
        { label: t('nav.docs'), href: '/docs' },
      ],
    },
    {
      title: t('footer.builtOn'),
      links: siteConfig.builtOn,
    },
    {
      title: t('footer.connect'),
      links: [
        { label: 'Discord', href: siteConfig.links.discord },
        { label: 'GitHub', href: siteConfig.links.github },
        { label: 'Twitter', href: siteConfig.links.twitter },
      ],
    },
  ];

  return (
    <footer className="border-t border-border/40 bg-bg-primary">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-accent text-sm">🪝</span>
              <span className="font-mono font-bold text-sm">HireClaw</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed max-w-[220px] mb-5">
              {t('footer.tagline')}
            </p>

            {/* Newsletter in footer */}
            <div>
              <h3 className="mb-3 font-mono text-[11px] font-medium text-text-muted/60 uppercase tracking-widest">
                {t('newsletter.footerTitle')}
              </h3>
              <p className="text-[11px] text-text-muted/40 mb-2.5">{t('newsletter.footerDesc')}</p>
              <FooterNewsletter />
            </div>
          </div>

          {/* Link Columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 font-mono text-[11px] font-medium text-text-muted/60 uppercase tracking-widest">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-border/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[11px] text-text-muted/40">
            &copy; 2026 HireClaw &middot; claw to claw
          </p>
          <div className="flex gap-5">
            <a href="#" className="font-mono text-[11px] text-text-muted/40 hover:text-text-muted transition-colors duration-200 cursor-pointer">
              {t('footer.terms')}
            </a>
            <a href="#" className="font-mono text-[11px] text-text-muted/40 hover:text-text-muted transition-colors duration-200 cursor-pointer">
              {t('footer.privacy')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
