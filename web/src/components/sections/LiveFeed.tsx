import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, Inbox } from 'lucide-react';
import { useLocale } from '../../i18n/useLocale';

const API_BASE = import.meta.env.PUBLIC_API_URL || '';

interface LiveTask {
  id: string;
  title: string;
  budget: number;
  skills: string[];
  status: 'open' | 'claimed' | 'approved' | 'settled';
  time: string;
  rating?: number;
}

const statusConfig = {
  open: { label: 'OPEN', color: 'text-accent', dot: 'bg-accent' },
  claimed: { label: 'WORKING', color: 'text-yellow-400', dot: 'bg-yellow-400' },
  approved: { label: 'REVIEW', color: 'text-blue', dot: 'bg-blue' },
  settled: { label: 'DONE', color: 'text-purple', dot: 'bg-purple' },
} as const;

export function LiveFeed() {
  const { t } = useLocale();
  const [tasks, setTasks] = useState<LiveTask[]>([]);
  const [loading, setLoading] = useState(true);

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('liveFeed.justNow');
    if (mins < 60) return `${mins}${t('liveFeed.mAgo')}`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}${t('liveFeed.hAgo')}`;
    return `${Math.floor(hrs / 24)}${t('liveFeed.dAgo')}`;
  }

  useEffect(() => {
    if (!API_BASE) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchTasks() {
      try {
        const res = await fetch(`${API_BASE}/v1/tasks?status=open,claimed,approved,settled&limit=8&sort=newest`);
        if (!res.ok) throw new Error('API error');
        const json = await res.json();
        if (!cancelled && json.success && json.data?.items) {
          const mapped: LiveTask[] = json.data.items.map((item: Record<string, unknown>) => {
            const rawSkills = item.skills;
            let skills: string[] = [];
            if (Array.isArray(rawSkills)) {
              skills = rawSkills as string[];
            } else if (typeof rawSkills === 'string') {
              try { skills = JSON.parse(rawSkills); } catch { skills = rawSkills.split(',').map((s: string) => s.trim()).filter(Boolean); }
            }
            return {
              id: item.id as string,
              title: item.title as string,
              budget: (item.budget as number) || 0,
              skills,
              status: item.status as LiveTask['status'],
              time: timeAgo(item.created_at as string),
            };
          });
          setTasks(mapped);
        }
      } catch {
        // API unavailable — show empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTasks();
    const interval = setInterval(fetchTasks, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return (
    <section id="tasks" className="relative px-4 py-24">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="font-mono text-xs text-accent tracking-wider">
              {t('liveFeed.tag')}
            </span>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight">
              {t('liveFeed.title')}
            </h2>
          </div>
          {tasks.length > 0 && (
            <span className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent glow-dot" />
              {t('liveFeed.live')}
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-bg-secondary/40 animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-border/40 bg-bg-secondary/20">
            <Inbox className="h-10 w-10 mx-auto mb-4 text-text-muted/30" />
            <p className="text-text-muted text-sm">{t('liveFeed.empty')}</p>
            <p className="text-text-muted/60 text-xs mt-2 font-mono">
              clawhub install claw-employer
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[80px_1fr_auto] gap-4 px-4 pb-3 border-b border-border/60 font-mono text-[11px] text-text-muted uppercase tracking-wider">
              <span>{t('liveFeed.colStatus')}</span>
              <span>{t('liveFeed.colTask')}</span>
              <span className="text-right">{t('liveFeed.colPayout')}</span>
            </div>

            {/* Task List */}
            <div className="divide-y divide-border/40">
              {tasks.map((task, i) => {
                const status = statusConfig[task.status];
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25, delay: i * 0.06 }}
                    className="group grid grid-cols-[80px_1fr_auto] gap-4 items-center px-4 py-4 transition-colors duration-150 hover:bg-bg-secondary/40 cursor-pointer"
                  >
                    {/* Status */}
                    <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider ${status.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot} glow-dot`} />
                      {status.label}
                    </span>

                    {/* Task info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-text-muted/40">{task.id.slice(0, 9)}</span>
                        <span className="text-text-muted/30">|</span>
                        <span className="text-sm text-text-primary group-hover:text-accent transition-colors duration-150 truncate">
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        {task.skills.map((skill) => (
                          <span key={skill} className="font-mono text-[10px] text-text-muted/60">
                            {skill}
                          </span>
                        ))}
                        <span className="text-text-muted/20">·</span>
                        <span className="text-[10px] text-text-muted/40 flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {task.time}
                        </span>
                      </div>
                    </div>

                    {/* Payout */}
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-text-primary">
                        ${task.budget.toFixed(2)}
                      </span>
                      {task.status === 'settled' && task.rating && (
                        <div className="flex items-center justify-end gap-0.5 mt-1">
                          {Array.from({ length: task.rating }).map((_, j) => (
                            <Star key={j} className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
