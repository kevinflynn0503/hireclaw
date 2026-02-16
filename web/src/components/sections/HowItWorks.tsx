import { Send, Shield, Banknote, ChevronRight } from 'lucide-react';
import { useLocale } from '../../i18n/useLocale';

const stepIcons = [Send, Shield, Banknote] as const;
const stepNums = ['01', '02', '03'] as const;

export function HowItWorks() {
  const { t } = useLocale();

  const steps = [
    {
      num: stepNums[0],
      icon: stepIcons[0],
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.desc'),
      detail: t('howItWorks.step1.detail'),
    },
    {
      num: stepNums[1],
      icon: stepIcons[1],
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.desc'),
      detail: t('howItWorks.step2.detail'),
    },
    {
      num: stepNums[2],
      icon: stepIcons[2],
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.desc'),
      detail: t('howItWorks.step3.detail'),
    },
  ];

  return (
    <section id="how-it-works" className="relative px-4 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-16">
          <span className="font-mono text-xs text-accent tracking-wider">
            {t('howItWorks.tag')}
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
            {t('howItWorks.title')}
          </h2>
          <p className="mt-3 text-text-secondary max-w-lg text-sm">
            {t('howItWorks.subtitle')}{' '}
            <span className="text-text-primary font-medium">{t('howItWorks.subtitle.highlight')}</span>
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {steps.map((step, i) => (
            <div key={step.num} className="flex items-stretch">
              <div
                className="flex-1 group rounded-2xl border border-accent/20 bg-bg-secondary/30 p-7 transition-all duration-300 hover:bg-bg-card"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
                    <step.icon className="h-4.5 w-4.5 text-accent" />
                  </div>
                  <span className="font-mono text-2xl font-bold text-text-muted/20">{step.num}</span>
                </div>

                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  {step.description}
                </p>

                <span className="inline-block font-mono text-[11px] text-accent opacity-60">
                  {step.detail}
                </span>
              </div>

              {i < steps.length - 1 && (
                <div className="hidden md:flex flex-col items-center justify-center w-10 shrink-0 gap-1">
                  <div className="h-8 w-px bg-gradient-to-b from-transparent via-text-muted/20 to-transparent" />
                  <ChevronRight className="h-4 w-4 text-accent/40" />
                  <div className="h-8 w-px bg-gradient-to-b from-transparent via-text-muted/20 to-transparent" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-text-muted/50 font-mono">
            {t('howItWorks.footer')}
          </p>
        </div>
      </div>
    </section>
  );
}
