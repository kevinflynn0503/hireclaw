/**
 * 任务路由
 * 
 * 任务的创建、查询、接单等操作
 */

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { generateId } from '../services/id';
import { logAudit } from '../services/audit';
import { generateTaskToken, verifyTaskTokenWithExpiry } from '../services/task-token';
import { createTaskPayment } from '../services/stripe';
import { authMiddleware, requireRole } from '../middleware/auth';
import type { Env, Task } from '../types';

const tasks = new Hono<{ Bindings: Env }>();

// ============================================
// 输入验证 Schema
// ============================================
const createTaskSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  skills: z.array(z.string()).optional(),
  budget: z.number().min(0).max(10000),
  deadline: z.string().datetime()
});

const claimTaskSchema = z.object({
  task_token: z.string()
});

// ============================================
// POST /tasks - 创建任务（雇主）
// ============================================
tasks.post('/', authMiddleware, requireRole('employer', 'both'), async (c) => {
  const agent = c.get('agent');
  const body = await c.req.json();
  
  // 验证输入
  const input = createTaskSchema.parse(body);
  
  // 验证截止时间不能是过去
  const deadline = new Date(input.deadline);
  if (deadline < new Date()) {
    throw new HTTPException(400, { message: 'Deadline must be in the future' });
  }
  
  // 生成任务 ID
  const task_id = generateId('task');
  const now = new Date().toISOString();
  
  // 插入任务
  await c.env.DB
    .prepare(`
      INSERT INTO tasks (
        id, employer_id, title, description, skills, budget, deadline,
        status, payment_status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'open', 'pending', ?, ?)
    `)
    .bind(
      task_id,
      agent.id,
      input.title,
      input.description,
      JSON.stringify(input.skills || []),
      input.budget,
      input.deadline,
      now,
      now
    )
    .run();
  
  // Initialize Stripe escrow for paid tasks (budget > 0)
  let payment_intent_id: string | undefined;
  if (input.budget > 0) {
    try {
      payment_intent_id = await createTaskPayment(
        c.env,
        task_id,
        agent.id,
        input.budget,
        agent.stripe_customer_id ?? undefined
      );
    } catch (err) {
      // Payment setup failed — delete the task and return error
      await c.env.DB
        .prepare('DELETE FROM tasks WHERE id = ?')
        .bind(task_id)
        .run();
      throw new HTTPException(402, {
        message: `Payment setup failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      });
    }
  }
  
  // 生成任务 Token
  const task_token = await generateTaskToken(
    {
      id: task_id,
      employer_id: agent.id,
      budget: input.budget,
      created_at: now
    },
    c.env.TASK_SECRET
  );
  
  // 记录审计日志
  await logAudit(c.env.DB, {
    task_id,
    action: 'task_create',
    actor: agent.id,
    actor_type: 'employer',
    details: {
      title: input.title,
      budget: input.budget,
      payment_intent_id: payment_intent_id || 'free_task'
    },
    ip_address: c.req.header('cf-connecting-ip')
  });
  
  return c.json({
    success: true,
    data: {
      task_id,
      task_token,
      title: input.title,
      budget: input.budget,
      deadline: input.deadline,
      status: 'open',
      payment_status: input.budget > 0 ? 'held' : 'pending'
    },
    message: 'Task created successfully'
  }, 201);
});

// ============================================
// GET /tasks - 获取任务列表
// ============================================
tasks.get('/', async (c) => {
  const status = c.req.query('status') || 'open';
  const skills = c.req.query('skills'); // 逗号分隔
  const page = parseInt(c.req.query('page') || '1');
  const per_page = Math.min(parseInt(c.req.query('per_page') || '20'), 100);
  const offset = (page - 1) * per_page;
  
  // 构建查询
  let query = 'SELECT * FROM tasks WHERE status = ?';
  const bindings: any[] = [status];
  
  // 技能筛选（简单实现：包含任意一个技能）
  if (skills) {
    const skillList = skills.split(',');
    const skillConditions = skillList.map(() => 'skills LIKE ?').join(' OR ');
    query += ` AND (${skillConditions})`;
    skillList.forEach(skill => bindings.push(`%"${skill}"%`));
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  bindings.push(per_page, offset);
  
  const result = await c.env.DB
    .prepare(query)
    .bind(...bindings)
    .all();
  
  // 解析 JSON 字段
  const taskList: Task[] = (result.results as any[]).map(row => ({
    ...row,
    skills: JSON.parse(row.skills as string)
  }));
  
  // 获取总数
  const countResult = await c.env.DB
    .prepare('SELECT COUNT(*) as total FROM tasks WHERE status = ?')
    .bind(status)
    .first<{ total: number }>();
  
  const total = countResult?.total || 0;
  
  return c.json({
    success: true,
    data: {
      items: taskList,
      total,
      page,
      per_page,
      has_more: total > page * per_page
    }
  });
});

// ============================================
// GET /tasks/:id - 获取任务详情
// ============================================
tasks.get('/:id', async (c) => {
  const task_id = c.req.param('id');
  
  const task = await c.env.DB
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .bind(task_id)
    .first<Task>();
  
  if (!task) {
    throw new HTTPException(404, { message: 'Task not found' });
  }
  
  // 解析 JSON 字段
  const taskWithParsed: Task = {
    ...task,
    skills: JSON.parse((task.skills as unknown as string) || '[]')
  };
  
  return c.json({
    success: true,
    data: taskWithParsed
  });
});

// ============================================
// POST /tasks/:id/claim - 接单（工人）
// ============================================
tasks.post('/:id/claim', authMiddleware, requireRole('worker', 'both'), async (c) => {
  const agent = c.get('agent');
  const task_id = c.req.param('id');
  const body = await c.req.json();
  
  // 验证输入
  const { task_token } = claimTaskSchema.parse(body);
  
  // 获取任务
  const task = await c.env.DB
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .bind(task_id)
    .first<Task>();
  
  if (!task) {
    throw new HTTPException(404, { message: 'Task not found' });
  }
  
  // 验证任务状态
  if (task.status !== 'open') {
    throw new HTTPException(400, { message: 'Task is not available for claiming' });
  }
  
  // 验证不能接自己的任务
  if (task.employer_id === agent.id) {
    throw new HTTPException(400, { message: 'Cannot claim your own task' });
  }
  
  // 验证任务 Token
  const tokenValidation = await verifyTaskTokenWithExpiry(
    {
      id: task.id,
      employer_id: task.employer_id,
      budget: task.budget,
      created_at: task.created_at
    },
    task_token,
    c.env.TASK_SECRET,
    parseInt(c.env.TOKEN_EXPIRY_HOURS)
  );
  
  if (!tokenValidation.valid) {
    throw new HTTPException(401, { message: tokenValidation.reason || 'Invalid task token' });
  }
  
  // 验证任务未过期
  if (new Date(task.deadline) < new Date()) {
    throw new HTTPException(400, { message: 'Task has expired' });
  }
  
  // 更新任务状态
  const now = new Date().toISOString();
  await c.env.DB
    .prepare(`
      UPDATE tasks 
      SET worker_id = ?, status = 'claimed', claimed_at = ?, updated_at = ?
      WHERE id = ?
    `)
    .bind(agent.id, now, now, task_id)
    .run();
  
  // 记录审计日志
  await logAudit(c.env.DB, {
    task_id,
    action: 'task_claim',
    actor: agent.id,
    actor_type: 'worker',
    details: {
      agent_name: agent.name,
      claimed_at: now
    },
    ip_address: c.req.header('cf-connecting-ip')
  });
  
  return c.json({
    success: true,
    message: 'Task claimed successfully'
  });
});

// ============================================
// POST /tasks/:id/unclaim - 放弃任务（工人）
// ============================================
tasks.post('/:id/unclaim', authMiddleware, requireRole('worker', 'both'), async (c) => {
  const agent = c.get('agent');
  const task_id = c.req.param('id');
  
  // 获取任务
  const task = await c.env.DB
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .bind(task_id)
    .first<Task>();
  
  if (!task) {
    throw new HTTPException(404, { message: 'Task not found' });
  }
  
  // 验证是接单者本人
  if (task.worker_id !== agent.id) {
    throw new HTTPException(403, { message: 'You are not the worker of this task' });
  }
  
  // 验证任务状态
  if (task.status !== 'claimed') {
    throw new HTTPException(400, { message: 'Task cannot be unclaimed at this stage' });
  }
  
  // 更新任务状态
  const now = new Date().toISOString();
  await c.env.DB
    .prepare(`
      UPDATE tasks 
      SET worker_id = NULL, status = 'open', claimed_at = NULL, updated_at = ?
      WHERE id = ?
    `)
    .bind(now, task_id)
    .run();
  
  // 记录审计日志
  await logAudit(c.env.DB, {
    task_id,
    action: 'task_unclaim',
    actor: agent.id,
    actor_type: 'worker',
    details: {},
    ip_address: c.req.header('cf-connecting-ip')
  });
  
  return c.json({
    success: true,
    message: 'Task unclaimed successfully'
  });
});

export default tasks;
