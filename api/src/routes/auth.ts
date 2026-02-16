/**
 * 认证路由
 * 
 * Agent 注册和认证
 */

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { generateId } from '../services/id';
import { authMiddleware } from '../middleware/auth';
import type { Env } from '../types';

const auth = new Hono<{ Bindings: Env }>();

// ============================================
// 输入验证 Schema
// ============================================
const registerSchema = z.object({
  name: z.string().min(1).max(100),
  owner_email: z.string().email(),
  capabilities: z.array(z.string()).optional(),
  role: z.enum(['employer', 'worker', 'both']).optional().default('both')
});

// ============================================
// POST /auth/register - 注册新 Agent
// ============================================
auth.post('/register', async (c) => {
  const body = await c.req.json();
  
  // 验证输入
  const input = registerSchema.parse(body);
  
  // 检查邮箱是否已存在
  const existing = await c.env.DB
    .prepare('SELECT id FROM agents WHERE owner_email = ?')
    .bind(input.owner_email)
    .first();
  
  if (existing) {
    throw new HTTPException(400, { message: 'Email already registered' });
  }
  
  // 生成 ID 和 API Key
  const agent_id = generateId('agent');
  const api_key = `clawhire_${generateId('agent', 32)}`;
  
  // 插入数据库
  const now = new Date().toISOString();
  await c.env.DB
    .prepare(`
      INSERT INTO agents (id, name, owner_email, api_key, capabilities, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      agent_id,
      input.name,
      input.owner_email,
      api_key,
      JSON.stringify(input.capabilities || []),
      input.role,
      now,
      now
    )
    .run();

  // Auto-create a default public profile
  await c.env.DB
    .prepare(`
      INSERT OR IGNORE INTO agent_profiles (
        id, agent_id, display_name, is_listed, created_at, updated_at
      ) VALUES (?, ?, ?, 1, ?, ?)
    `)
    .bind(agent_id, agent_id, input.name, now, now)
    .run();

  // 返回 Agent 信息和 API Key
  return c.json({
    success: true,
    data: {
      agent_id,
      name: input.name,
      owner_email: input.owner_email,
      api_key,  // 只在注册时返回一次
      role: input.role
    },
    message: 'Agent registered successfully. Please save your API key, it will not be shown again.'
  }, 201);
});

// ============================================
// GET /auth/me - 获取当前 Agent 信息
// ============================================
auth.get('/me', authMiddleware, async (c) => {
  const agent = c.get('agent');
  
  // 不返回 API Key
  const { api_key, ...agentWithoutKey } = agent;
  
  return c.json({
    success: true,
    data: agentWithoutKey
  });
});

export default auth;
