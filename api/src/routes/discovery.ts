/**
 * A2A Discovery & Agent Registry Routes
 * 
 * - GET /.well-known/agent.json — HireClaw's own Agent Card
 * - POST /v1/agents/register-a2a — Worker registers their A2A endpoint
 * - GET /v1/agents/discover — Find worker agents by skills
 * - POST /v1/agents/heartbeat — Worker signals availability
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth';
import type { Env } from '../types';

const discovery = new Hono<{ Bindings: Env }>();

// ============================================
// POST /agents/register-a2a — Register A2A endpoint
// ============================================
const registerA2ASchema = z.object({
  a2a_url: z.string().url(),
  description: z.string().max(500).optional(),
  skills: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional()
  })),
  input_modes: z.array(z.string()).optional().default(['text']),
  output_modes: z.array(z.string()).optional().default(['text'])
});

discovery.post('/register-a2a', authMiddleware, requireRole('worker', 'both'), async (c) => {
  const agent = c.get('agent');
  const body = await c.req.json();
  const input = registerA2ASchema.parse(body);

  const now = new Date().toISOString();

  // Upsert: insert or update
  await c.env.DB
    .prepare(`
      INSERT INTO agent_cards (id, agent_id, a2a_url, name, description, skills, input_modes, output_modes, is_available, last_seen, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
      ON CONFLICT(agent_id) DO UPDATE SET
        a2a_url = excluded.a2a_url,
        description = excluded.description,
        skills = excluded.skills,
        input_modes = excluded.input_modes,
        output_modes = excluded.output_modes,
        is_available = 1,
        last_seen = excluded.last_seen,
        updated_at = excluded.updated_at
    `)
    .bind(
      agent.id,
      agent.id,
      input.a2a_url,
      agent.name,
      input.description || '',
      JSON.stringify(input.skills),
      JSON.stringify(input.input_modes),
      JSON.stringify(input.output_modes),
      now,
      now,
      now
    )
    .run();

  return c.json({
    success: true,
    data: {
      agent_id: agent.id,
      a2a_url: input.a2a_url,
      skills: input.skills
    },
    message: 'A2A endpoint registered. Other agents can now discover you.'
  });
});

// ============================================
// GET /agents/discover — Find agents by skills
// ============================================
discovery.get('/discover', async (c) => {
  const skills = c.req.query('skills');       // comma-separated
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 50);

  let query = `
    SELECT ac.*, a.capabilities, a.role
    FROM agent_cards ac
    JOIN agents a ON ac.agent_id = a.id
    WHERE ac.is_available = 1
      AND ac.last_seen > datetime('now', '-10 minutes')
  `;
  const bindings: (string | number)[] = [];

  // Filter by skills if provided
  if (skills) {
    const skillList = skills.split(',').map(s => s.trim());
    const conditions = skillList.map(() => 'ac.skills LIKE ?').join(' OR ');
    query += ` AND (${conditions})`;
    skillList.forEach(skill => bindings.push(`%"${skill}"%`));
  }

  query += ' ORDER BY ac.last_seen DESC LIMIT ?';
  bindings.push(limit);

  const result = await c.env.DB
    .prepare(query)
    .bind(...bindings)
    .all();

  // Format as A2A-compatible agent cards
  const agents = (result.results as Record<string, unknown>[]).map(row => ({
    name: row.name as string,
    description: row.description as string,
    url: row.a2a_url as string,
    agent_id: row.agent_id as string,
    skills: JSON.parse(row.skills as string),
    input_modes: JSON.parse(row.input_modes as string),
    output_modes: JSON.parse(row.output_modes as string),
    last_seen: row.last_seen as string
  }));

  return c.json({
    success: true,
    data: {
      agents,
      total: agents.length
    }
  });
});

// ============================================
// POST /agents/heartbeat — Update availability
// ============================================
discovery.post('/heartbeat', authMiddleware, async (c) => {
  const agent = c.get('agent');
  const now = new Date().toISOString();

  await c.env.DB
    .prepare('UPDATE agent_cards SET last_seen = ?, is_available = 1, updated_at = ? WHERE agent_id = ?')
    .bind(now, now, agent.id)
    .run();

  return c.json({ success: true, timestamp: now });
});

export default discovery;
