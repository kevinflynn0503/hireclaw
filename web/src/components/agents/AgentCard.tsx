import { motion } from 'framer-motion';
import { CheckCircle, Wifi, WifiOff, DollarSign, Zap, ExternalLink } from 'lucide-react';
import { useLocale } from '../../i18n/useLocale';

interface AgentCardProps {
  agent: {
    agent_id: string;
    display_name: string;
    tagline?: string | null;
    avatar_url?: string | null;
    skills: { id: string; name: string; level?: string }[];
    pricing: {
      accepts_free: boolean;
      accepts_paid: boolean;
      min_budget?: number | null;
    };
    trust: { is_verified: boolean };
    is_online: boolean;
  };
  index: number;
}

export function AgentCard({ agent, index }: AgentCardProps) {
  const { t } = useLocale();

  return (
    <motion.a
      href={`/agents/detail?id=${agent.agent_id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group block rounded-xl border border-border bg-bg-card hover:bg-bg-card-hover hover:border-border-hover transition-all duration-200 p-5 cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="h-12 w-12 rounded-xl bg-bg-tertiary flex items-center justify-center text-lg font-bold text-accent overflow-hidden">
            {agent.avatar_url ? (
              <img src={agent.avatar_url} alt={agent.display_name} className="h-full w-full object-cover" />
            ) : (
              agent.display_name.charAt(0).toUpperCase()
            )}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-bg-card ${
              agent.is_online ? 'bg-accent glow-dot' : 'bg-text-muted'
            }`}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
              {agent.display_name}
            </h3>
            {agent.trust.is_verified && (
              <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
            )}
          </div>

          {agent.tagline && (
            <p className="mt-1 text-sm text-text-secondary line-clamp-2">
              {agent.tagline}
            </p>
          )}

          {agent.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {agent.skills.slice(0, 4).map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-md bg-bg-tertiary px-2 py-0.5 text-xs font-mono text-text-muted"
                >
                  {skill.name}
                </span>
              ))}
              {agent.skills.length > 4 && (
                <span className="rounded-md bg-bg-tertiary px-2 py-0.5 text-xs font-mono text-text-muted">
                  +{agent.skills.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        <ExternalLink className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
      </div>

      {/* Footer badges */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-3 text-xs text-text-muted">
        {agent.is_online ? (
          <span className="flex items-center gap-1 text-accent">
            <Wifi className="h-3 w-3" /> {t('agentCard.online')}
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <WifiOff className="h-3 w-3" /> {t('agentCard.offline')}
          </span>
        )}

        {agent.pricing.accepts_free && (
          <span className="flex items-center gap-1 text-cyan">
            <Zap className="h-3 w-3" /> {t('agentCard.free')}
          </span>
        )}

        {agent.pricing.accepts_paid && (
          <span className="flex items-center gap-1 text-purple">
            <DollarSign className="h-3 w-3" /> {t('agentCard.paid')}
            {agent.pricing.min_budget != null && `${t('agentCard.from')}${agent.pricing.min_budget}`}
          </span>
        )}
      </div>
    </motion.a>
  );
}
