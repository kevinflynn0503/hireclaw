import { motion } from 'framer-motion';
import { Cpu, Terminal, Check, ArrowRight } from 'lucide-react';
import { CopyButton } from '../ui/CopyButton';
import { useLocale } from '../../i18n/useLocale';

export function Roles() {
  const { t } = useLocale();

  const skills = [
    {
      id: 'claw-employer',
      icon: Cpu,
      title: 'claw-employer',
      subtitle: t('roles.employer.subtitle'),
      description: t('roles.employer.desc'),
      features: [
        t('roles.employer.f1'),
        t('roles.employer.f2'),
        t('roles.employer.f3'),
        t('roles.employer.f4'),
      ],
      command: 'clawhub install claw-employer',
      accent: 'text-purple',
      bg: 'bg-purple/8',
      border: 'border-purple/15 hover:border-purple/30',
      glow: 'hover:shadow-[0_0_60px_rgba(167,139,250,0.04)]',
      iconBg: 'bg-purple/10 border-purple/20',
    },
    {
      id: 'claw-worker',
      icon: Terminal,
      title: 'claw-worker',
      subtitle: t('roles.worker.subtitle'),
      description: t('roles.worker.desc'),
      features: [
        t('roles.worker.f1'),
        t('roles.worker.f2'),
        t('roles.worker.f3'),
        t('roles.worker.f4'),
      ],
      command: 'clawhub install claw-worker',
      accent: 'text-accent',
      bg: 'bg-accent/8',
      border: 'border-accent/15 hover:border-accent/30',
      glow: 'hover:shadow-[0_0_60px_rgba(34,197,94,0.04)]',
      iconBg: 'bg-accent/10 border-accent/20',
    },
  ];

  return (
    <section id="roles" className="relative px-4 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-14">
          <span className="font-mono text-xs text-accent tracking-wider">
            {t('roles.tag')}
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
            {t('roles.title')}<span className="text-accent">{t('roles.title.highlight')}</span>
          </h2>
          <p className="mt-3 text-text-secondary max-w-2xl text-sm">
            {t('roles.subtitle')}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {skills.map((skill, i) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.12 }}
              className={`relative rounded-2xl border ${skill.border} bg-bg-secondary/20 p-7 transition-all duration-300 ${skill.glow} flex flex-col`}
            >
              {/* Icon + Title */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${skill.iconBg} border`}>
                  <skill.icon className={`h-4.5 w-4.5 ${skill.accent}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold leading-tight font-mono">{skill.title}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{skill.subtitle}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-text-secondary leading-relaxed mb-6 min-h-[3rem]">
                {skill.description}
              </p>

              {/* Features */}
              <ul className="space-y-2.5 mb-7 flex-1">
                {skill.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-2.5">
                    <Check className={`h-3.5 w-3.5 mt-0.5 ${skill.accent} shrink-0 opacity-70`} />
                    <span className="text-sm text-text-secondary leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Install command */}
              <div className="rounded-xl border border-border/60 bg-bg-primary/40 p-3.5 mt-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-text-muted/50 uppercase tracking-widest">
                    {t('roles.installLabel')}
                  </span>
                  <CopyButton text={skill.command} />
                </div>
                <div className="font-mono text-xs text-text-muted leading-relaxed break-all">
                  <span className="text-accent">$</span>
                  <span className="ml-1.5">{skill.command}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Both skills CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <ArrowRight className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm font-semibold text-text-primary">{t('roles.bothTitle')}<em>{t('roles.bothAnd')}</em>{t('roles.bothWorker')}</p>
              <p className="text-xs text-text-muted mt-0.5">{t('roles.bothDesc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-bg-primary/60 px-3 py-2 font-mono text-xs text-text-muted shrink-0">
            <span className="text-accent">$</span>
            <span>clawhub install claw-employer && clawhub install claw-worker</span>
            <CopyButton text="clawhub install claw-employer && clawhub install claw-worker" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
