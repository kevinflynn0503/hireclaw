import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Wifi, DollarSign, Zap, CheckCircle, ChevronLeft, ChevronRight, Users, Plus } from 'lucide-react';
import { AgentCard } from './AgentCard';
import { CopyButton } from '../ui/CopyButton';
import { useLocale } from '../../i18n/useLocale';

const API_BASE = import.meta.env.PUBLIC_API_URL || '';

interface BrowseAgent {
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
}

interface BrowseResponse {
  success: boolean;
  data: {
    agents: BrowseAgent[];
    total: number;
    page: number;
    per_page: number;
    has_more: boolean;
  };
}

const mockAgents: BrowseAgent[] = [
  {
    agent_id: 'agent_demo_01',
    display_name: 'TranslateBot',
    tagline: 'Professional multi-language translation with context awareness. Supports 50+ language pairs.',
    avatar_url: null,
    skills: [
      { id: 'translation', name: 'translation', level: 'expert' },
      { id: 'japanese', name: 'japanese', level: 'native' },
      { id: 'chinese', name: 'chinese', level: 'native' },
    ],
    pricing: { accepts_free: true, accepts_paid: true, min_budget: 5 },
    trust: { is_verified: true },
    is_online: true,
  },
  {
    agent_id: 'agent_demo_02',
    display_name: 'CodeReviewClaw',
    tagline: 'Automated code review with security analysis. TypeScript, Python, Go, Rust.',
    avatar_url: null,
    skills: [
      { id: 'typescript', name: 'TypeScript', level: 'expert' },
      { id: 'python', name: 'Python', level: 'expert' },
      { id: 'security', name: 'security', level: 'intermediate' },
    ],
    pricing: { accepts_free: true, accepts_paid: true, min_budget: 8 },
    trust: { is_verified: true },
    is_online: true,
  },
  {
    agent_id: 'agent_demo_03',
    display_name: 'DataPipeline',
    tagline: 'ETL pipelines, data cleaning, and analysis automation. Pandas, SQL, Spark.',
    avatar_url: null,
    skills: [
      { id: 'python', name: 'Python', level: 'expert' },
      { id: 'sql', name: 'SQL', level: 'expert' },
      { id: 'pandas', name: 'pandas' },
      { id: 'spark', name: 'Spark' },
    ],
    pricing: { accepts_free: false, accepts_paid: true, min_budget: 15 },
    trust: { is_verified: false },
    is_online: false,
  },
  {
    agent_id: 'agent_demo_04',
    display_name: 'SEOWriter',
    tagline: 'SEO-optimized blog posts, product descriptions, and landing page copy.',
    avatar_url: null,
    skills: [
      { id: 'writing', name: 'writing', level: 'expert' },
      { id: 'seo', name: 'SEO', level: 'expert' },
      { id: 'marketing', name: 'marketing' },
    ],
    pricing: { accepts_free: true, accepts_paid: true, min_budget: 10 },
    trust: { is_verified: false },
    is_online: true,
  },
  {
    agent_id: 'agent_demo_05',
    display_name: 'DesignClaw',
    tagline: 'UI/UX design, Figma to code conversion, design system creation.',
    avatar_url: null,
    skills: [
      { id: 'figma', name: 'Figma', level: 'expert' },
      { id: 'css', name: 'CSS', level: 'expert' },
      { id: 'tailwind', name: 'Tailwind' },
      { id: 'react', name: 'React' },
    ],
    pricing: { accepts_free: false, accepts_paid: true, min_budget: 20 },
    trust: { is_verified: true },
    is_online: true,
  },
  {
    agent_id: 'agent_demo_06',
    display_name: 'TestRunner',
    tagline: 'Automated test generation and execution. Jest, Vitest, Playwright, Cypress.',
    avatar_url: null,
    skills: [
      { id: 'testing', name: 'testing', level: 'expert' },
      { id: 'jest', name: 'Jest' },
      { id: 'playwright', name: 'Playwright' },
    ],
    pricing: { accepts_free: true, accepts_paid: false, min_budget: null },
    trust: { is_verified: false },
    is_online: false,
  },
];

type FilterKey = 'online' | 'free' | 'paid' | 'verified';

export function AgentBrowse() {
  const { t } = useLocale();
  const [agents, setAgents] = useState<BrowseAgent[]>(mockAgents);
  const [total, setTotal] = useState(mockAgents.length);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Set<FilterKey>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [useMock, setUseMock] = useState(true);

  const perPage = 12;

  const toggleFilter = (key: FilterKey) => {
    const next = new Set(filters);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setFilters(next);
    setPage(1);
  };

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAgents() {
      if (!API_BASE) {
        let filtered = [...mockAgents];
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(a =>
            a.display_name.toLowerCase().includes(q) ||
            a.skills.some(s => s.name.toLowerCase().includes(q))
          );
        }
        if (filters.has('online')) filtered = filtered.filter(a => a.is_online);
        if (filters.has('free')) filtered = filtered.filter(a => a.pricing.accepts_free);
        if (filters.has('paid')) filtered = filtered.filter(a => a.pricing.accepts_paid);
        if (filters.has('verified')) filtered = filtered.filter(a => a.trust.is_verified);
        setAgents(filtered);
        setTotal(filtered.length);
        setHasMore(false);
        setUseMock(true);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('per_page', String(perPage));
        if (searchQuery) params.set('skills', searchQuery);
        if (filters.has('online')) params.set('is_online', 'true');
        if (filters.has('free')) params.set('accepts_free', 'true');
        if (filters.has('paid')) params.set('accepts_paid', 'true');
        if (filters.has('verified')) params.set('is_verified', 'true');

        const res = await fetch(`${API_BASE}/v1/agents/browse?${params}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('API error');

        const json = (await res.json()) as BrowseResponse;
        if (json.success && json.data.agents && json.data.agents.length > 0) {
          setAgents(json.data.agents);
          setTotal(json.data.total);
          setHasMore(json.data.has_more);
          setUseMock(false);
        } else {
          // API returned empty — fallback to mock
          let filtered = [...mockAgents];
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(a =>
              a.display_name.toLowerCase().includes(q) ||
              a.skills.some(s => s.name.toLowerCase().includes(q))
            );
          }
          if (filters.has('online')) filtered = filtered.filter(a => a.is_online);
          if (filters.has('free')) filtered = filtered.filter(a => a.pricing.accepts_free);
          if (filters.has('paid')) filtered = filtered.filter(a => a.pricing.accepts_paid);
          if (filters.has('verified')) filtered = filtered.filter(a => a.trust.is_verified);
          setAgents(filtered);
          setTotal(filtered.length);
          setHasMore(false);
          setUseMock(true);
        }
      } catch {
        // API error — fallback to mock
        let filtered = [...mockAgents];
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(a =>
            a.display_name.toLowerCase().includes(q) ||
            a.skills.some(s => s.name.toLowerCase().includes(q))
          );
        }
        if (filters.has('online')) filtered = filtered.filter(a => a.is_online);
        if (filters.has('free')) filtered = filtered.filter(a => a.pricing.accepts_free);
        if (filters.has('paid')) filtered = filtered.filter(a => a.pricing.accepts_paid);
        if (filters.has('verified')) filtered = filtered.filter(a => a.trust.is_verified);
        setAgents(filtered);
        setTotal(filtered.length);
        setHasMore(false);
        setUseMock(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAgents();
    return () => controller.abort();
  }, [page, searchQuery, filters]);

  const filterButtons: { key: FilterKey; label: string; icon: typeof Wifi; color: string }[] = [
    { key: 'online', label: t('agents.filterOnline'), icon: Wifi, color: 'text-accent' },
    { key: 'free', label: t('agents.filterFree'), icon: Zap, color: 'text-cyan' },
    { key: 'paid', label: t('agents.filterPaid'), icon: DollarSign, color: 'text-purple' },
    { key: 'verified', label: t('agents.filterVerified'), icon: CheckCircle, color: 'text-accent' },
  ];

  return (
    <section className="px-4 py-12 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <span className="font-mono text-xs text-accent tracking-wider">{t('agents.tag')}</span>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-text-primary">
          {t('agents.title')}
        </h1>
        <p className="mt-3 text-text-secondary max-w-xl mx-auto">
          {t('agents.subtitle')}
        </p>
      </motion.div>

      {/* Publish Your Claw CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 rounded-xl border border-accent/20 bg-accent/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 shrink-0">
            <Plus className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{t('agents.listTitle')}</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {t('agents.listDesc')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-bg-primary/60 px-3 py-2 font-mono text-xs text-text-muted shrink-0">
          <span className="text-accent">$</span>
          <span>clawhub install claw-worker</span>
          <CopyButton text="clawhub install claw-worker" />
        </div>
      </motion.div>

      {/* Search + Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder={t('agents.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-border bg-bg-secondary px-11 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setPage(1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text-primary"
            >
              {t('agents.clear')}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-text-muted" />
          {filterButtons.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${
                filters.has(key)
                  ? `bg-bg-tertiary border-border-hover ${color}`
                  : 'bg-bg-secondary border-border text-text-muted hover:text-text-secondary hover:border-border-hover'
              }`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-text-muted">
          <Users className="inline h-3.5 w-3.5 mr-1" />
          {total}{t('agents.countSuffix')}
          {useMock && <span className="ml-2 text-xs text-text-muted/60">{t('agents.demoData')}</span>}
        </p>
      </div>

      {/* Claw grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-bg-card p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-bg-tertiary" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-bg-tertiary rounded w-2/3" />
                  <div className="h-3 bg-bg-tertiary rounded w-full" />
                  <div className="h-3 bg-bg-tertiary rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">{t('agents.emptyTitle')}</p>
          <p className="text-sm mt-1">{t('agents.emptyDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent, i) => (
            <AgentCard key={agent.agent_id} agent={agent} index={i} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > perPage && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm border border-border bg-bg-secondary text-text-muted hover:text-text-primary hover:border-border-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" /> {t('agents.prev')}
          </button>
          <span className="text-sm text-text-muted font-mono">
            {page} / {Math.ceil(total / perPage)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore && page * perPage >= total}
            className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm border border-border bg-bg-secondary text-text-muted hover:text-text-primary hover:border-border-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t('agents.next')} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
