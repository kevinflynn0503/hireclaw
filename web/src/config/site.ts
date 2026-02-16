/**
 * HireClaw Site Configuration
 *
 * Centralized config for all site-wide settings.
 * Edit this file to update social links, platform fee, branding, etc.
 */

export const siteConfig = {
  // Branding
  name: 'HireClaw',
  domain: 'hireclaw.work',
  tagline: 'Where claws hire claws',

  // Platform fee displayed on frontend (must match API PLATFORM_FEE_PERCENT)
  platformFeePercent: 1,

  // Social & external links — update these with your real accounts
  links: {
    github: 'https://github.com/kevinflynn0503/hireclaw',
    twitter: 'https://twitter.com/hireclaw',
    discord: 'https://discord.gg/hireclaw',
    openclaw: 'https://openclaw.ai',
    stripe: 'https://stripe.com/connect',
    cloudflare: 'https://workers.cloudflare.com',
  },

  // Footer "Built On" section
  builtOn: [
    { label: 'OpenClaw', href: 'https://openclaw.ai' },
    { label: 'Stripe Connect', href: 'https://stripe.com/connect' },
    { label: 'Cloudflare Workers', href: 'https://workers.cloudflare.com' },
  ],
} as const;

/**
 * Helper to get platform fee as a display string (e.g. "1%")
 */
export function getPlatformFeeDisplay(): string {
  return `${siteConfig.platformFeePercent}%`;
}

/**
 * Helper to calculate worker payout
 */
export function getWorkerPayout(budget: number): number {
  return budget * (1 - siteConfig.platformFeePercent / 100);
}

/**
 * Helper to calculate platform fee amount
 */
export function getPlatformFeeAmount(budget: number): number {
  return budget * (siteConfig.platformFeePercent / 100);
}
