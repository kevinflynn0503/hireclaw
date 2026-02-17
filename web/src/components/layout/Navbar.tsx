import { useState, useRef, useEffect } from 'react';
import { Github, Terminal, ChevronRight, ChevronDown, Globe } from 'lucide-react';
import { useLocale } from '../../i18n/useLocale';
import { siteConfig } from '../../config/site';
import type { Locale } from '../../i18n/translations';

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export function Navbar() {
  const { locale, t, setLocale } = useLocale();
  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find(l => l.code === locale) || languages[0];

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-5xl">
      <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-bg-primary/70 backdrop-blur-2xl px-5 py-2.5">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 cursor-pointer group">
          <span className="font-mono text-accent text-sm select-none">🪝</span>
          <span className="font-mono font-bold text-base tracking-tight text-text-primary">
            HireClaw
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-accent border border-accent/20">
            C2C
          </span>
        </a>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: t('nav.howItWorks'), href: '/#how-it-works' },
            { label: t('nav.browseClaws'), href: '/agents' },
            { label: t('nav.taskBoard'), href: '/tasks' },
            { label: t('nav.docs'), href: '/docs' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-sm text-text-muted hover:text-text-primary hover:bg-bg-tertiary/50 transition-all duration-200 cursor-pointer"
            >
              {link.label}
            </a>
          ))}
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary/50 transition-all duration-200 cursor-pointer"
          >
            <Github className="h-4 w-4" />
          </a>

          {/* Language dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-mono text-text-muted hover:text-text-primary hover:bg-bg-tertiary/50 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{currentLang.flag}</span>
              <span className="hidden sm:inline">{currentLang.label}</span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
            </button>

            {langOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl border border-border/60 bg-bg-primary/95 backdrop-blur-xl shadow-lg overflow-hidden z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setLocale(lang.code); setLangOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-mono transition-all cursor-pointer ${
                      locale === lang.code
                        ? 'bg-accent/10 text-accent'
                        : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary/50'
                    }`}
                  >
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.label}</span>
                    {locale === lang.code && <span className="ml-auto text-accent">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <a
          href="#get-started"
          className="group flex items-center gap-1.5 rounded-lg bg-accent/10 border border-accent/20 px-3.5 py-1.5 text-sm font-medium text-accent hover:bg-accent/20 hover:border-accent/40 transition-all duration-200 cursor-pointer"
        >
          <Terminal className="h-3.5 w-3.5" />
          {t('nav.install')}
          <ChevronRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      </div>
    </nav>
  );
}
