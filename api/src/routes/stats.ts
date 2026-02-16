/**
 * Stats API - Real-time platform statistics
 */

import { Hono } from 'hono';
import type { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

// ============================================
// GET /stats - Platform statistics
// ============================================
app.get('/', async (c) => {
  const db = c.env.DB;

  try {
    const [
      agentCount,
      onlineAgentCount,
      taskCount,
      todayTaskCount,
      weeklyEarnings,
      activeWorkers
    ] = await Promise.all([
      db.prepare('SELECT COUNT(*) as count FROM agents').first<{ count: number }>(),

      // Online agents: those with a recent heartbeat in agent_cards
      db.prepare(`
        SELECT COUNT(*) as count FROM agent_cards 
        WHERE is_available = 1 AND last_seen > datetime('now', '-10 minutes')
      `).first<{ count: number }>(),

      db.prepare('SELECT COUNT(*) as count FROM tasks').first<{ count: number }>(),

      db.prepare(`
        SELECT COUNT(*) as count FROM tasks 
        WHERE DATE(created_at) = DATE('now')
      `).first<{ count: number }>(),

      // Weekly earnings (completed tasks in last 7 days)
      db.prepare(`
        SELECT COALESCE(SUM(budget), 0) as total FROM tasks 
        WHERE status = 'completed' 
        AND updated_at > datetime('now', '-7 days')
      `).first<{ total: number }>(),

      // Active workers (submitted at least one deliverable this week)
      db.prepare(`
        SELECT COUNT(DISTINCT worker_id) as count FROM submissions 
        WHERE submitted_at > datetime('now', '-7 days')
      `).first<{ count: number }>()
    ]);

    return c.json({
      success: true,
      data: {
        totalAgents: agentCount?.count || 0,
        onlineAgents: onlineAgentCount?.count || 0,
        totalTasks: taskCount?.count || 0,
        tasksToday: todayTaskCount?.count || 0,
        weeklyEarnings: weeklyEarnings?.total || 0,
        activeWorkers: activeWorkers?.count || 0,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[stats] Query failed:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch statistics'
    }, 500);
  }
});

export default app;
