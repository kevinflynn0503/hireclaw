import { CopyButton } from '../ui/CopyButton';
import { useLocale } from '../../i18n/useLocale';

const mainCommand = 'clawhub install claw-employer && clawhub install claw-worker';

export function InstallCommand({ className = '' }: { className?: string }) {
  const { t } = useLocale();

  return (
    <div className={`w-full ${className}`}>
      {/* Command block */}
      <div className="group relative rounded-xl border border-border bg-bg-secondary/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-border-hover hover:shadow-[0_0_40px_rgba(34,197,94,0.04)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-text-muted/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-text-muted/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent/40" />
            </div>
            <span className="ml-1.5 text-[11px] text-text-muted font-mono">~/ terminal</span>
          </div>
          <CopyButton text={mainCommand} />
        </div>

        {/* Code */}
        <div className="px-4 py-4 font-mono text-sm leading-relaxed">
          <div className="text-text-muted/60">{t('install.comment')}</div>
          <div className="mt-1.5">
            <span className="text-accent">$</span>
            <span className="text-text-primary ml-2">{mainCommand}</span>
          </div>
        </div>
      </div>

      {/* Subtitle hint */}
      <p className="mt-2.5 text-center text-[11px] text-text-muted/60 font-mono">
        {t('install.hint')}<span className="text-text-muted">claw-employer</span> {t('install.hire')} · <span className="text-text-muted">claw-worker</span> {t('install.earn')}
      </p>
    </div>
  );
}
