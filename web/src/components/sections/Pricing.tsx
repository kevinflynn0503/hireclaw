import { motion } from 'framer-motion';
import { Check, Zap, DollarSign, ArrowRight } from 'lucide-react';
import { useLocale } from '../../i18n/useLocale';

export function Pricing() {
  const { t } = useLocale();

  const plans = [
    {
      id: 'free',
      icon: Zap,
      title: t('pricing.free.title'),
      price: t('pricing.free.price'),
      period: t('pricing.free.period'),
      description: t('pricing.free.desc'),
      features: [
        t('pricing.free.f1'),
        t('pricing.free.f2'),
        t('pricing.free.f3'),
        t('pricing.free.f4'),
        t('pricing.free.f5'),
      ],
      cta: t('pricing.free.cta'),
      ctaHref: '/docs',
      accent: 'text-cyan',
      bg: 'bg-cyan/5',
      border: 'border-cyan/15 hover:border-cyan/30',
      iconBg: 'bg-cyan/10 border-cyan/20',
      ctaBg: 'bg-cyan/10 hover:bg-cyan/20 text-cyan',
      badge: null,
    },
    {
      id: 'paid',
      icon: DollarSign,
      title: t('pricing.paid.title'),
      price: t('pricing.paid.price'),
      period: t('pricing.paid.period'),
      description: t('pricing.paid.desc'),
      features: [
        t('pricing.paid.f1'),
        t('pricing.paid.f2'),
        t('pricing.paid.f3'),
        t('pricing.paid.f4'),
        t('pricing.paid.f5'),
      ],
      cta: t('pricing.paid.cta'),
      ctaHref: '/docs#pricing',
      accent: 'text-accent',
      bg: 'bg-accent/5',
      border: 'border-accent/20 hover:border-accent/40',
      iconBg: 'bg-accent/10 border-accent/20',
      ctaBg: 'bg-accent hover:bg-accent/90 text-bg-primary font-semibold',
      badge: t('pricing.paid.badge'),
    },
  ];

  return (
    <section id="pricing" className="relative px-4 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-14">
          <span className="font-mono text-xs text-accent tracking-wider">
            {t('pricing.tag')}
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
            {t('pricing.title')}
            <span className="text-accent">{t('pricing.title.highlight')}</span>
          </h2>
          <p className="mt-3 text-text-secondary max-w-2xl text-sm">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className={`relative rounded-2xl border ${plan.border} ${plan.bg} p-8 transition-all duration-300 hover:shadow-[0_0_60px_rgba(34,197,94,0.04)]`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-accent text-bg-primary text-xs font-bold tracking-wide">
                  {plan.badge}
                </div>
              )}

              {/* Icon + Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${plan.iconBg} border`}>
                  <plan.icon className={`h-5 w-5 ${plan.accent}`} />
                </div>
                <h3 className="text-lg font-bold">{plan.title}</h3>
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="text-4xl font-bold text-text-primary">{plan.price}</span>
                <span className="text-sm text-text-muted ml-2">{plan.period}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-text-secondary leading-relaxed mb-6">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-2.5">
                    <Check className={`h-4 w-4 mt-0.5 ${plan.accent} shrink-0`} />
                    <span className="text-sm text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={plan.ctaHref}
                className={`flex items-center justify-center gap-2 w-full rounded-xl px-6 py-3 text-sm transition-colors ${plan.ctaBg}`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-sm text-text-muted"
        >
          {t('pricing.footer')}
        </motion.p>
      </div>
    </section>
  );
}
