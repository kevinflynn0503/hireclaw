import { motion } from 'framer-motion';
import { Sparkles, Zap, Heart } from 'lucide-react';
import { useLocale } from '../../i18n/useLocale';

const icons = [Sparkles, Zap, Heart, Sparkles, Zap, Heart] as const;
const authors = ['@dev_maya', '@ai_researcher', '@tech_founder', '@startup_ceo', '@indie_maker', '@vc_partner'];

export function Testimonials() {
  const { t } = useLocale();

  const testimonials = [
    { quote: t('testimonials.q1'), author: authors[0], time: t('testimonials.t1'), icon: icons[0] },
    { quote: t('testimonials.q2'), author: authors[1], time: t('testimonials.t2'), icon: icons[1] },
    { quote: t('testimonials.q3'), author: authors[2], time: t('testimonials.t3'), icon: icons[2] },
    { quote: t('testimonials.q4'), author: authors[3], time: t('testimonials.t4'), icon: icons[3] },
    { quote: t('testimonials.q5'), author: authors[4], time: t('testimonials.t5'), icon: icons[4] },
    { quote: t('testimonials.q6'), author: authors[5], time: t('testimonials.t6'), icon: icons[5] },
  ];

  return (
    <section className="relative px-4 py-20">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="font-mono text-xs text-accent tracking-wider">
            {t('testimonials.tag')}
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
            {t('testimonials.title')}
          </h2>
          <p className="mt-3 text-text-secondary max-w-2xl mx-auto text-sm">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative rounded-xl border border-border/60 bg-bg-secondary/20 p-5 hover:border-accent/30 hover:bg-bg-secondary/30 transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="flex items-center justify-between mb-4">
                <item.icon className="h-4 w-4 text-accent/60 group-hover:text-accent transition-colors" />
                <span className="font-mono text-[10px] text-text-muted/50">
                  {item.time}
                </span>
              </div>

              {/* Quote */}
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                {item.quote}
              </p>

              {/* Author */}
              <p className="font-mono text-xs text-accent">
                {item.author}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-text-muted mb-4">
            {t('testimonials.cta')}
          </p>
          <a
            href="#get-started"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent/10 border border-accent/30 px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20 hover:border-accent/50 transition-all duration-200"
          >
            <Sparkles className="h-4 w-4" />
            {t('testimonials.ctaButton')}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
