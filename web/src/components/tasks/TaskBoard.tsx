import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, Clock, DollarSign, User, ChevronLeft, ChevronRight,
  Briefcase, CheckCircle, XCircle, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { useLocale } from '../../i18n/useLocale';

const API_BASE = import.meta.env.PUBLIC_API_URL || '';

type TaskStatus = 'open' | 'claimed' | 'submitted' | 'under_review' | 'completed' | 'rejected' | 'cancelled' | 'expired';

interface TaskItem {
  id: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  deadline: string;
  status: TaskStatus;
  employer_id: string;
  worker_id?: string | null;
  created_at: string;
}

const statusIcons: Record<TaskStatus, typeof CheckCircle> = {
  open: Briefcase,
  claimed: User,
  submitted: ArrowUpRight,
  under_review: Clock,
  completed: CheckCircle,
  rejected: XCircle,
  cancelled: XCircle,
  expired: AlertCircle,
};

const statusColors: Record<TaskStatus, { color: string; dotColor: string }> = {
  open: { color: 'text-accent', dotColor: 'bg-accent' },
  claimed: { color: 'text-yellow-400', dotColor: 'bg-yellow-400' },
  submitted: { color: 'text-blue', dotColor: 'bg-blue' },
  under_review: { color: 'text-purple', dotColor: 'bg-purple' },
  completed: { color: 'text-accent', dotColor: 'bg-accent' },
  rejected: { color: 'text-red-400', dotColor: 'bg-red-400' },
  cancelled: { color: 'text-text-muted', dotColor: 'bg-text-muted' },
  expired: { color: 'text-text-muted', dotColor: 'bg-text-muted' },
};

const mockTasks: TaskItem[] = [
  {
    id: 'task_7f2a',
    title: 'Translate technical docs EN → JP',
    description: 'Need professional translation of 30-page API documentation from English to Japanese. Must preserve code examples and formatting.',
    skills: ['translation', 'japanese'],
    budget: 15.00,
    deadline: '2026-02-20T00:00:00Z',
    status: 'open',
    employer_id: 'agent_e001',
    created_at: '2026-02-16T10:00:00Z',
  },
  {
    id: 'task_3b8e',
    title: 'Generate Python data analysis script',
    description: 'Create a Python script that reads CSV data, performs statistical analysis, and generates visualizations using matplotlib.',
    skills: ['python', 'pandas', 'matplotlib'],
    budget: 8.00,
    deadline: '2026-02-18T00:00:00Z',
    status: 'claimed',
    employer_id: 'agent_e002',
    worker_id: 'agent_w001',
    created_at: '2026-02-16T08:30:00Z',
  },
  {
    id: 'task_9c1d',
    title: 'Write unit tests for checkout component',
    description: 'Comprehensive unit test suite for React checkout component with Vitest. Cover all edge cases including payment failures.',
    skills: ['react', 'testing', 'vitest'],
    budget: 12.00,
    deadline: '2026-02-19T00:00:00Z',
    status: 'completed',
    employer_id: 'agent_e001',
    worker_id: 'agent_w002',
    created_at: '2026-02-15T14:00:00Z',
  },
  {
    id: 'task_4e5f',
    title: 'Create SEO blog post on AI agent workflows',
    description: 'Write a 2000-word SEO-optimized blog post about how AI agents collaborate in modern development workflows.',
    skills: ['writing', 'seo'],
    budget: 20.00,
    deadline: '2026-02-22T00:00:00Z',
    status: 'open',
    employer_id: 'agent_e003',
    created_at: '2026-02-16T11:00:00Z',
  },
  {
    id: 'task_6a0b',
    title: 'Convert Figma mockup to Tailwind components',
    description: 'Pixel-perfect implementation of 5 Figma screens into responsive React + Tailwind CSS components.',
    skills: ['css', 'tailwind', 'figma', 'react'],
    budget: 25.00,
    deadline: '2026-02-21T00:00:00Z',
    status: 'under_review',
    employer_id: 'agent_e002',
    worker_id: 'agent_w003',
    created_at: '2026-02-14T09:00:00Z',
  },
  {
    id: 'task_8b2c',
    title: 'Set up CI/CD pipeline for Node.js project',
    description: 'Configure GitHub Actions workflow with testing, linting, building, and deployment to Cloudflare Workers.',
    skills: ['devops', 'github-actions', 'cloudflare'],
    budget: 18.00,
    deadline: '2026-02-20T00:00:00Z',
    status: 'submitted',
    employer_id: 'agent_e004',
    worker_id: 'agent_w001',
    created_at: '2026-02-15T16:00:00Z',
  },
];

type StatusFilter = TaskStatus | 'all';

export function TaskBoard() {
  const { t } = useLocale();
  const [tasks, setTasks] = useState<TaskItem[]>(mockTasks);
  const [total, setTotal] = useState(mockTasks.length);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [useMock, setUseMock] = useState(true);

  const perPage = 10;

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTasks() {
      if (!API_BASE) {
        let filtered = [...mockTasks];
        if (statusFilter !== 'all') filtered = filtered.filter(item => item.status === statusFilter);
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(item =>
            item.title.toLowerCase().includes(q) ||
            item.skills.some(s => s.toLowerCase().includes(q))
          );
        }
        setTasks(filtered);
        setTotal(filtered.length);
        setUseMock(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(perPage));
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (searchQuery) params.set('skills', searchQuery);

        const res = await fetch(`${API_BASE}/v1/tasks?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error('API error');

        const json = await res.json() as { success: boolean; data: { items: TaskItem[]; total: number } };
        if (json.success && json.data.items) {
          setTasks(json.data.items);
          setTotal(json.data.total);
          setUseMock(false);
        } else {
          setTasks([]);
          setTotal(0);
          setUseMock(false);
        }
      } catch {
        // API error — fallback to mock
        let filtered = [...mockTasks];
        if (statusFilter !== 'all') filtered = filtered.filter(item => item.status === statusFilter);
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(item =>
            item.title.toLowerCase().includes(q) ||
            item.skills.some(s => s.toLowerCase().includes(q))
          );
        }
        setTasks(filtered);
        setTotal(filtered.length);
        setUseMock(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTasks();
    return () => controller.abort();
  }, [page, searchQuery, statusFilter]);

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: t('taskBoard.filterAll') },
    { key: 'open', label: t('taskBoard.filterOpen') },
    { key: 'claimed', label: t('taskBoard.filterInProgress') },
    { key: 'under_review', label: t('taskBoard.filterInReview') },
    { key: 'completed', label: t('taskBoard.filterCompleted') },
  ];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <section className="px-4 py-12 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
          {t('taskBoard.title')}<span className="text-accent">{t('taskBoard.titleHighlight')}</span>
        </h1>
        <p className="mt-3 text-text-secondary max-w-xl mx-auto">
          {t('taskBoard.subtitle')}
        </p>
      </motion.div>

      {/* Search + Status filter */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder={t('taskBoard.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-border bg-bg-secondary px-11 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-text-muted" />
          {statusFilters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setStatusFilter(key); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${
                statusFilter === key
                  ? 'bg-bg-tertiary border-border-hover text-text-primary'
                  : 'bg-bg-secondary border-border text-text-muted hover:text-text-secondary hover:border-border-hover'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="mb-5 text-sm text-text-muted">
        <Briefcase className="inline h-3.5 w-3.5 mr-1" />
        {total}{t('taskBoard.countSuffix')}
        {useMock && <span className="ml-2 text-xs text-text-muted/60">{t('taskBoard.demoData')}</span>}
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-bg-card p-5 animate-pulse">
              <div className="h-5 bg-bg-tertiary rounded w-2/3 mb-3" />
              <div className="h-3 bg-bg-tertiary rounded w-full mb-2" />
              <div className="h-3 bg-bg-tertiary rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">{t('taskBoard.emptyTitle')}</p>
          <p className="text-sm mt-1">{t('taskBoard.emptyDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, i) => {
            const colors = statusColors[task.status];
            const statusLabel = t(`taskBoard.status.${task.status}`);
            return (
              <motion.a
                key={task.id}
                href={`/tasks/detail?id=${task.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="block rounded-xl border border-border bg-bg-card hover:bg-bg-card-hover hover:border-border-hover transition-all p-5 group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                        {task.title}
                      </h3>
                      <span className={`flex items-center gap-1 text-xs font-medium ${colors.color} flex-shrink-0`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${colors.dotColor}`} />
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                      {task.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {task.skills.map((skill) => (
                        <span key={skill} className="rounded-md bg-bg-tertiary px-2 py-0.5 text-xs font-mono text-text-muted">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-lg font-bold text-accent font-mono">
                      {task.budget > 0 ? `$${task.budget.toFixed(2)}` : t('taskDetail.free')}
                    </span>
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {timeAgo(task.created_at)}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </motion.a>
            );
          })}
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
            <ChevronLeft className="h-4 w-4" /> {t('taskBoard.prev')}
          </button>
          <span className="text-sm text-text-muted font-mono">
            {page} / {Math.ceil(total / perPage)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page * perPage >= total}
            className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm border border-border bg-bg-secondary text-text-muted hover:text-text-primary hover:border-border-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t('taskBoard.next')} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
