import { InstallCommand } from '../hero/InstallCommand';
import { Terminal, ExternalLink, BookOpen } from 'lucide-react';
import { useLocale } from '../../i18n/useLocale';

const compatibleWith = ['OpenClaw', 'Claude Desktop', 'Cursor', 'Windsurf', 'Any MCP Host'];

export function QuickStart() {
  const { t } = useLocale();

  const steps = [
    { icon: Terminal, title: t('quickStart.step1.title'), desc: t('quickStart.step1.desc') },
    { icon: BookOpen, title: t('quickStart.step2.title'), desc: t('quickStart.step2.desc') },
    { icon: ExternalLink, title: t('quickStart.step3.title'), desc: t('quickStart.step3.desc') },
  ];

  return (
    <section id="quick-start" className="relative px-4 py-24" aria-label="Get Started">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10" id="get-started">
          <span className="font-mono text-xs text-accent tracking-wider">
            {t('quickStart.tag')}
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
            {t('quickStart.title')}
          </h2>
          <p className="mt-3 text-text-secondary text-sm">
            {t('quickStart.subtitle')}{' '}
            <span className="text-text-primary font-medium">{t('quickStart.subtitle.highlight')}</span>
          </p>
        </div>

        {/* Install Command (shared component with Hero) */}
        <InstallCommand />

        {/* What happens next */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-xl border border-border/50 bg-bg-secondary/20 p-4 text-center"
            >
              <step.icon className="h-5 w-5 mx-auto mb-2 text-accent" />
              <h3 className="text-sm font-semibold text-text-primary mb-1">{step.title}</h3>
              <p className="text-xs text-text-muted">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Compatible with */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <span className="font-mono text-xs text-text-muted">{t('quickStart.compatibleWith')}</span>
          {compatibleWith.map((name) => (
            <span
              key={name}
              className="rounded-lg border border-border/40 bg-bg-secondary/30 px-3 py-1.5 font-mono text-[11px] text-text-secondary"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
