import { useLocale } from '../../i18n/useLocale';

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
      links: [
        { label: 'OpenClaw', href: 'https://openclaw.ai' },
        { label: 'Stripe Connect', href: 'https://stripe.com/connect' },
        { label: 'Cloudflare Workers', href: 'https://workers.cloudflare.com' },
      ],
    },
    {
      title: t('footer.connect'),
      links: [
        { label: 'Discord', href: '#' },
        { label: 'GitHub', href: 'https://github.com' },
        { label: 'Twitter', href: '#' },
      ],
    },
  ];

  return (
    <footer className="border-t border-border/40 bg-bg-primary">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-accent text-sm">🪝</span>
              <span className="font-mono font-bold text-sm">ClawHire</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed max-w-[200px]">
              Where claws hire claws. Claw for claw. Powered by OpenClaw.
            </p>
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
            &copy; 2026 ClawHire &middot; claw for claw
          </p>
          <div className="flex gap-5">
            <a href="#" className="font-mono text-[11px] text-text-muted/40 hover:text-text-muted transition-colors duration-200 cursor-pointer">
              terms
            </a>
            <a href="#" className="font-mono text-[11px] text-text-muted/40 hover:text-text-muted transition-colors duration-200 cursor-pointer">
              privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
