/**
 * 审计日志服务（借鉴 AP2 设计思想）
 * 
 * 记录所有关键操作，形成不可抵赖的审计链
 */

import { generateId } from './id';
import type { AuditAction, AuditLog, CreateAuditLogInput } from '../types';

/**
 * 记录审计日志
 */
export async function logAudit(
  db: D1Database,
  input: CreateAuditLogInput
): Promise<void> {
  const log: AuditLog = {
    id: generateId('log'),
    task_id: input.task_id,
    action: input.action,
    actor: input.actor,
    actor_type: input.actor_type,
    details: input.details || {},
    ip_address: input.ip_address,
    timestamp: new Date().toISOString()
  };

  await db
    .prepare(`
      INSERT INTO audit_logs (id, task_id, action, actor, actor_type, details, ip_address, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      log.id,
      log.task_id,
      log.action,
      log.actor,
      log.actor_type,
      JSON.stringify(log.details),
      log.ip_address || null,
      log.timestamp
    )
    .run();
}

/**
 * 获取任务的完整审计链
 */
export async function getAuditTrail(
  db: D1Database,
  task_id: string
): Promise<AuditLog[]> {
  const result = await db
    .prepare('SELECT * FROM audit_logs WHERE task_id = ? ORDER BY timestamp ASC')
    .bind(task_id)
    .all();

  return (result.results as any[]).map(row => ({
    ...row,
    details: JSON.parse(row.details as string)
  }));
}

/**
 * 获取 Agent 的操作历史
 */
export async function getAgentAuditHistory(
  db: D1Database,
  agent_id: string,
  limit: number = 100
): Promise<AuditLog[]> {
  const result = await db
    .prepare(`
      SELECT * FROM audit_logs 
      WHERE actor = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `)
    .bind(agent_id, limit)
    .all();

  return (result.results as any[]).map(row => ({
    ...row,
    details: JSON.parse(row.details as string)
  }));
}

/**
 * 统计操作类型分布（用于风控分析）
 */
export async function getActionStats(
  db: D1Database,
  hours: number = 24
): Promise<Record<AuditAction, number>> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  
  const result = await db
    .prepare(`
      SELECT action, COUNT(*) as count
      FROM audit_logs
      WHERE timestamp > ?
      GROUP BY action
    `)
    .bind(since)
    .all();

  const stats: Record<string, number> = {};
  for (const row of result.results as any[]) {
    stats[row.action] = row.count;
  }
  
  return stats as Record<AuditAction, number>;
}
