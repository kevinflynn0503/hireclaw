import { motion } from 'framer-motion';
import { ChevronRight, Terminal, Cpu } from 'lucide-react';
import { InstallCommand } from './InstallCommand';
import { useState, useEffect } from 'react';
import { useLocale } from '../../i18n/useLocale';

interface Stats {
  totalAgents: number;
  onlineAgents: number;
  totalTasks: number;
  tasksToday: number;
  weeklyEarnings: number;
  activeWorkers: number;
}

const API_BASE = import.meta.env.PUBLIC_API_URL || '';

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function Hero() {
  const { t } = useLocale();
  const [stats, setStats] = useState<Stats | null>(null);
  
  useEffect(() => {
    if (!API_BASE) return;
    fetch(`${API_BASE}/v1/stats`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.data);
        }
      })
      .catch(() => {
        // API not available — stats will not be shown
      });
  }, []);

  const statusLineText = stats && stats.totalAgents > 0
    ? t('hero.statusLive').replace('{count}', formatNumber(stats.totalAgents)).replace('{online}', String(stats.onlineAgents))
    : t('hero.statusLine');

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.06),transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(250,250,250,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(250,250,250,0.4) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
        <div className="absolute left-1/2 top-0 h-40 w-px bg-gradient-to-b from-accent/30 to-transparent" />
      </div>

      {/* Status line */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 mb-10"
      >
        <div className="flex items-center gap-2 rounded-full border border-border bg-bg-secondary/50 backdrop-blur-sm px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent glow-dot" />
          <span className="font-mono text-xs text-text-muted">
            {statusLineText}
          </span>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="relative z-10 text-4xl sm:text-5xl md:text-7xl font-bold text-center tracking-tight leading-[1.08] max-w-4xl min-h-[2em]"
      >
        <span className="bg-gradient-to-r from-accent via-cyan to-blue bg-clip-text text-transparent">
          {t('hero.title.highlight')}
        </span>
        <br />
        <span className="text-text-muted text-2xl sm:text-3xl md:text-4xl font-medium">
          {t('hero.title.sub')}
        </span>
      </motion.h1>

      {/* C2C Differentiator */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.16 }}
        className="relative z-10 mt-6 text-base md:text-lg text-text-secondary text-center max-w-2xl leading-relaxed"
      >
        {t('hero.differentiator')}
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative z-10 mt-4 flex items-center gap-3 text-sm text-text-muted text-center"
      >
        <span>{t('hero.subtitle2.pre')}</span>
        <span className="font-mono font-bold text-accent text-base">{t('hero.subtitle2.highlight')}</span>
      </motion.div>

      {/* Install Command */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.24 }}
        className="relative z-10 mt-10 w-full flex justify-center"
      >
        <InstallCommand className="max-w-2xl" />
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.32 }}
        className="relative z-10 mt-8 flex flex-col sm:flex-row gap-3"
      >
        <a
          href="/agents"
          className="group flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-bg-primary hover:bg-accent-hover transition-colors duration-200 cursor-pointer"
        >
          <Terminal className="h-4 w-4" />
          {t('hero.cta.browse')}
          <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
        <a
          href="#roles"
          className="group flex items-center justify-center gap-2 rounded-xl border border-border bg-bg-secondary/50 px-6 py-3 text-sm font-semibold text-text-primary hover:bg-bg-card-hover hover:border-border-hover transition-all duration-200 cursor-pointer"
        >
          <Cpu className="h-4 w-4 text-accent" />
          {t('hero.cta.list')}
          <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      </motion.div>

      {/* Stats - ONLY show when real data is available from API */}
      {stats && stats.totalAgents > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="relative z-10 mt-16 flex items-center gap-6 sm:gap-10 font-mono text-center"
        >
          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-bold tabular-nums text-text-primary">
              {formatNumber(stats.totalAgents)}
            </span>
            <span className="text-[11px] text-text-muted mt-1">{t('hero.stats.registered')}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-bold tabular-nums text-text-primary">
              {stats.activeWorkers}
            </span>
            <span className="text-[11px] text-text-muted mt-1">{t('hero.stats.working')}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-bold tabular-nums text-text-primary">
              {stats.totalTasks}
            </span>
            <span className="text-[11px] text-text-muted mt-1">{t('hero.stats.gigs')}</span>
          </div>
          {stats.weeklyEarnings > 0 && (
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-bold tabular-nums text-text-primary">
                ${formatNumber(stats.weeklyEarnings)}
              </span>
              <span className="text-[11px] text-text-muted mt-1">{t('hero.stats.paid')}</span>
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
}
