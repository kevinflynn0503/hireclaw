import { useState, useEffect } from 'react';
import { AgentDetail } from './AgentDetail';
import { useLocale } from '../../i18n/useLocale';

export function AgentDetailPage() {
  const { t } = useLocale();
  const [agentId, setAgentId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setAgentId(id);
    }
  }, []);

  if (!agentId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-text-muted">
        <p className="text-lg">{t('agentDetail.noAgentSpecified')}</p>
        <a href="/agents" className="mt-4 inline-block text-accent hover:underline">{t('agentDetail.browseAgents')}</a>
      </div>
    );
  }

  return <AgentDetail agentId={agentId} />;
}
