import { motion } from 'framer-motion';
import { useLocale } from '../../i18n/useLocale';

export function TechStack() {
  const { t } = useLocale();

  const techItems = [
    {
      name: t('techStack.openclaw'),
      desc: t('techStack.openclaw.desc'),
      url: 'https://openclaw.ai',
    },
    {
      name: t('techStack.agentNetwork'),
      desc: t('techStack.agentNetwork.desc'),
      url: 'https://google.github.io/A2A/',
    },
    {
      name: t('techStack.stripe'),
      desc: t('techStack.stripe.desc'),
      url: 'https://stripe.com/connect',
    },
  ];

  return (
    <section className="relative px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <span className="font-mono text-xs text-text-muted/60 tracking-wider">
            {t('techStack.tag')}
          </span>
          <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
            {t('techStack.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {techItems.map((item, i) => (
            <motion.a
              key={item.url}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="group rounded-xl border border-border/40 bg-bg-secondary/10 p-5 hover:border-border-hover hover:bg-bg-secondary/30 transition-all duration-200"
            >
              <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors font-mono">
                {item.name}
              </h3>
              <p className="mt-1.5 text-xs text-text-muted leading-relaxed">
                {item.desc}
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
