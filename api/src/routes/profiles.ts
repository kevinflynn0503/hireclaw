/**
 * Agent Profile & Card Routes
 *
 * Public browsing and profile management for the ClawHire "claw marketplace".
 *
 * Authenticated:
 *   POST /agents/profile   — create / update own profile
 *   GET  /agents/profile    — get own profile
 *
 * Public:
 *   GET  /agents/:id/card   — full public card (identity + stats + pricing)
 *   GET  /agents/browse     — paginated listing with filters
 *   GET  /agents/featured   — featured / top-rated agents
 *   GET  /agents/:id/stats  — stats only
 */

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import type { Env, AgentStats } from '../types';

const profiles = new Hono<{ Bindings: Env }>();

// ============================================
// Zod schemas
// ============================================
const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  tagline: z.string().max(160).optional(),
  bio: z.string().max(2000).optional(),
  avatar_url: z.string().url().optional(),
  primary_skills: z.array(z.object({
    id: z.string(),
    name: z.string(),
    level: z.enum(['beginner', 'intermediate', 'expert', 'native']).optional()
  })).optional(),
  languages: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  accepts_free: z.boolean().optional(),
  accepts_paid: z.boolean().optional(),
  min_budget: z.number().min(0).optional(),
  max_budget: z.number().min(0).optional(),
  typical_response_time: z.string().max(50).optional(),
  openclaw_version: z.string().max(20).optional(),
  openclaw_skills_count: z.number().int().min(0).optional(),
  openclaw_model: z.string().max(50).optional(),
  is_listed: z.boolean().optional()
});

// ============================================
// Helper: compute agent stats from D1
// ============================================
async function computeAgentStats(db: D1Database, agent_id: string): Promise<AgentStats> {
  const row = await db.prepare(`
    SELECT
      COUNT(DISTINCT CASE WHEN t.worker_id = ? THEN t.id END) AS tasks_completed,
      COUNT(DISTINCT CASE WHEN t.worker_id = ? AND t.status = 'completed' THEN t.id END) AS tasks_succeeded,
      ROUND(AVG(CASE WHEN r.result = 'accept' THEN r.rating END), 1) AS avg_rating,
      COUNT(CASE WHEN r.result = 'accept' AND r.rating IS NOT NULL THEN 1 END) AS review_count,
      ROUND(AVG(
        CASE WHEN t.worker_id = ? AND t.completed_at IS NOT NULL AND t.claimed_at IS NOT NULL
        THEN (julianday(t.completed_at) - julianday(t.claimed_at)) * 24
        END
      ), 1) AS avg_delivery_hours,
      COALESCE(SUM(CASE WHEN t.worker_id = ? AND t.status = 'completed' THEN t.budget * 0.99 ELSE 0 END), 0) AS total_earned_usd
    FROM tasks t
    LEFT JOIN reviews r ON r.task_id = t.id
    WHERE t.worker_id = ?
  `).bind(agent_id, agent_id, agent_id, agent_id, agent_id).first<Record<string, unknown>>();

  const tasks_completed = (row?.tasks_completed as number) || 0;
  const tasks_succeeded = (row?.tasks_succeeded as number) || 0;

  return {
    tasks_completed,
    tasks_succeeded,
    success_rate: tasks_completed > 0
      ? Math.round(1000 * tasks_succeeded / tasks_completed) / 10
      : null,
    avg_rating: (row?.avg_rating as number) || null,
    review_count: (row?.review_count as number) || 0,
    avg_delivery_hours: (row?.avg_delivery_hours as number) || null,
    total_earned_usd: (row?.total_earned_usd as number) || 0
  };
}

// ============================================
// POST /agents/profile — create / update own profile
// ============================================
profiles.post('/profile', authMiddleware, async (c) => {
  const agent = c.get('agent');
  const body = await c.req.json();
  const input = updateProfileSchema.parse(body);
  const now = new Date().toISOString();

  // Check if profile already exists
  const existing = await c.env.DB
    .prepare('SELECT id FROM agent_profiles WHERE agent_id = ?')
    .bind(agent.id).first();

  if (existing) {
    // Update
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    const map: Record<string, unknown> = {
      display_name: input.display_name,
      tagline: input.tagline,
      bio: input.bio,
      avatar_url: input.avatar_url,
      primary_skills: input.primary_skills ? JSON.stringify(input.primary_skills) : undefined,
      languages: input.languages ? JSON.stringify(input.languages) : undefined,
      specializations: input.specializations ? JSON.stringify(input.specializations) : undefined,
      accepts_free: input.accepts_free !== undefined ? (input.accepts_free ? 1 : 0) : undefined,
      accepts_paid: input.accepts_paid !== undefined ? (input.accepts_paid ? 1 : 0) : undefined,
      min_budget: input.min_budget,
      max_budget: input.max_budget,
      typical_response_time: input.typical_response_time,
      openclaw_version: input.openclaw_version,
      openclaw_skills_count: input.openclaw_skills_count,
      openclaw_model: input.openclaw_model,
      is_listed: input.is_listed !== undefined ? (input.is_listed ? 1 : 0) : undefined
    };

    for (const [key, val] of Object.entries(map)) {
      if (val !== undefined) {
        fields.push(`${key} = ?`);
        values.push(val as string | number | null);
      }
    }

    if (fields.length === 0) {
      throw new HTTPException(400, { message: 'No fields to update' });
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(agent.id); // WHERE

    await c.env.DB
      .prepare(`UPDATE agent_profiles SET ${fields.join(', ')} WHERE agent_id = ?`)
      .bind(...values).run();
  } else {
    // Insert new profile
    await c.env.DB
      .prepare(`
        INSERT INTO agent_profiles (
          id, agent_id, display_name, tagline, bio, avatar_url,
          primary_skills, languages, specializations,
          accepts_free, accepts_paid, min_budget, max_budget, typical_response_time,
          openclaw_version, openclaw_skills_count, openclaw_model,
          is_listed, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        agent.id,
        agent.id,
        input.display_name || agent.name,
        input.tagline || null,
        input.bio || null,
        input.avatar_url || null,
        JSON.stringify(input.primary_skills || []),
        JSON.stringify(input.languages || []),
        JSON.stringify(input.specializations || []),
        input.accepts_free !== undefined ? (input.accepts_free ? 1 : 0) : 1,
        input.accepts_paid !== undefined ? (input.accepts_paid ? 1 : 0) : 1,
        input.min_budget ?? null,
        input.max_budget ?? null,
        input.typical_response_time || null,
        input.openclaw_version || null,
        input.openclaw_skills_count ?? 0,
        input.openclaw_model || null,
        input.is_listed !== undefined ? (input.is_listed ? 1 : 0) : 1,
        now,
        now
      ).run();
  }

  return c.json({
    success: true,
    message: existing ? 'Profile updated' : 'Profile created'
  });
});

// ============================================
// GET /agents/profile — own profile
// ============================================
profiles.get('/profile', authMiddleware, async (c) => {
  const agent = c.get('agent');

  const profile = await c.env.DB
    .prepare('SELECT * FROM agent_profiles WHERE agent_id = ?')
    .bind(agent.id).first();

  if (!profile) {
    throw new HTTPException(404, { message: 'Profile not found. Create one via POST /v1/agents/profile' });
  }

  return c.json({ success: true, data: formatProfile(profile) });
});

// ============================================
// GET /agents/browse — public paginated listing
// ============================================
profiles.get('/browse', async (c) => {
  const skills = c.req.query('skills');
  const acceptsPaid = c.req.query('accepts_paid');
  const acceptsFree = c.req.query('accepts_free');
  const isVerified = c.req.query('is_verified');
  const isOnline = c.req.query('is_online');
  const sort = c.req.query('sort') || 'newest';
  const page = Math.max(1, parseInt(c.req.query('page') || '1'));
  const perPage = Math.min(50, Math.max(1, parseInt(c.req.query('per_page') || '20')));

  let query = `
    SELECT p.*, a.created_at AS member_since, a.stripe_account_id,
           ac.a2a_url, ac.is_available, ac.last_seen
    FROM agent_profiles p
    JOIN agents a ON p.agent_id = a.id
    LEFT JOIN agent_cards ac ON p.agent_id = ac.agent_id
    WHERE p.is_listed = 1
  `;
  const bindings: (string | number)[] = [];

  if (skills) {
    const skillList = skills.split(',').map(s => s.trim());
    const conditions = skillList.map(() => 'p.primary_skills LIKE ?').join(' OR ');
    query += ` AND (${conditions})`;
    skillList.forEach(skill => bindings.push(`%"${skill}"%`));
  }

  if (acceptsPaid === 'true') {
    query += ' AND p.accepts_paid = 1';
  }
  if (acceptsFree === 'true') {
    query += ' AND p.accepts_free = 1';
  }
  if (isVerified === 'true') {
    query += ' AND p.is_verified = 1';
  }
  if (isOnline === 'true') {
    query += ` AND ac.is_available = 1 AND ac.last_seen > datetime('now', '-10 minutes')`;
  }

  // Sort
  const sortMap: Record<string, string> = {
    newest: 'a.created_at DESC',
    rating: 'p.is_verified DESC, a.created_at DESC', // TODO: when stats cached, sort by rating
    tasks: 'a.created_at DESC'
  };
  query += ` ORDER BY ${sortMap[sort] || sortMap.newest}`;

  // Pagination
  query += ' LIMIT ? OFFSET ?';
  bindings.push(perPage, (page - 1) * perPage);

  const result = await c.env.DB.prepare(query).bind(...bindings).all();

  // Count total (without pagination)
  let countQuery = `
    SELECT COUNT(*) AS total
    FROM agent_profiles p
    JOIN agents a ON p.agent_id = a.id
    LEFT JOIN agent_cards ac ON p.agent_id = ac.agent_id
    WHERE p.is_listed = 1
  `;
  // Re-apply the same filters for count (except sort/limit)
  const countBindings: (string | number)[] = [];
  if (skills) {
    const skillList = skills.split(',').map(s => s.trim());
    const conditions = skillList.map(() => 'p.primary_skills LIKE ?').join(' OR ');
    countQuery += ` AND (${conditions})`;
    skillList.forEach(skill => countBindings.push(`%"${skill}"%`));
  }
  if (acceptsPaid === 'true') countQuery += ' AND p.accepts_paid = 1';
  if (acceptsFree === 'true') countQuery += ' AND p.accepts_free = 1';
  if (isVerified === 'true') countQuery += ' AND p.is_verified = 1';
  if (isOnline === 'true') countQuery += ` AND ac.is_available = 1 AND ac.last_seen > datetime('now', '-10 minutes')`;

  const countRow = await c.env.DB.prepare(countQuery).bind(...countBindings).first<{ total: number }>();
  const total = countRow?.total || 0;

  const agents = (result.results as Record<string, unknown>[]).map(row => ({
    agent_id: row.agent_id as string,
    display_name: row.display_name as string,
    tagline: row.tagline as string | null,
    avatar_url: row.avatar_url as string | null,
    skills: safeJsonParse(row.primary_skills as string, []),
    pricing: {
      accepts_free: row.accepts_free === 1,
      accepts_paid: row.accepts_paid === 1,
      min_budget: row.min_budget as number | null
    },
    trust: { is_verified: row.is_verified === 1 },
    is_online: row.is_available === 1 && isRecentlySeen(row.last_seen as string | null)
  }));

  return c.json({
    success: true,
    data: {
      agents,
      total,
      page,
      per_page: perPage,
      has_more: page * perPage < total
    }
  });
});

// ============================================
// GET /agents/featured — top agents
// ============================================
profiles.get('/featured', async (c) => {
  const limit = Math.min(10, parseInt(c.req.query('limit') || '6'));

  const result = await c.env.DB.prepare(`
    SELECT p.*, a.created_at AS member_since, a.stripe_account_id,
           ac.a2a_url, ac.is_available, ac.last_seen
    FROM agent_profiles p
    JOIN agents a ON p.agent_id = a.id
    LEFT JOIN agent_cards ac ON p.agent_id = ac.agent_id
    WHERE p.is_listed = 1
    ORDER BY p.is_verified DESC, p.updated_at DESC
    LIMIT ?
  `).bind(limit).all();

  const agents = (result.results as Record<string, unknown>[]).map(row => ({
    agent_id: row.agent_id as string,
    display_name: row.display_name as string,
    tagline: row.tagline as string | null,
    avatar_url: row.avatar_url as string | null,
    skills: safeJsonParse(row.primary_skills as string, []),
    is_verified: row.is_verified === 1,
    is_online: row.is_available === 1 && isRecentlySeen(row.last_seen as string | null)
  }));

  return c.json({ success: true, data: agents });
});

// ============================================
// GET /agents/:id/card — full public card
// ============================================
profiles.get('/:id/card', async (c) => {
  const agent_id = c.req.param('id');

  // Fetch profile + agent + agent_card in one go
  const row = await c.env.DB.prepare(`
    SELECT p.*, a.created_at AS member_since, a.stripe_account_id,
           ac.a2a_url, ac.is_available, ac.last_seen
    FROM agent_profiles p
    JOIN agents a ON p.agent_id = a.id
    LEFT JOIN agent_cards ac ON p.agent_id = ac.agent_id
    WHERE p.agent_id = ?
  `).bind(agent_id).first<Record<string, unknown>>();

  if (!row) {
    throw new HTTPException(404, { message: 'Agent profile not found' });
  }

  // Compute live stats
  const stats = await computeAgentStats(c.env.DB, agent_id);

  const memberSince = row.member_since as string;
  const memberDays = Math.floor((Date.now() - new Date(memberSince).getTime()) / 86400000);

  const baseUrl = new URL(c.req.url).origin;

  const card = {
    agent_id: row.agent_id as string,
    display_name: row.display_name as string,
    tagline: row.tagline as string | null,
    bio: row.bio as string | null,
    avatar_url: row.avatar_url as string | null,
    member_since: memberSince,

    skills: safeJsonParse(row.primary_skills as string, []),
    languages: safeJsonParse(row.languages as string, []),
    specializations: safeJsonParse(row.specializations as string, []),

    pricing: {
      accepts_free: row.accepts_free === 1,
      accepts_paid: row.accepts_paid === 1,
      min_budget: row.min_budget as number | null,
      max_budget: row.max_budget as number | null,
      typical_response_time: row.typical_response_time as string | null,
      platform_fee: '1%'
    },

    stats,

    trust: {
      is_verified: row.is_verified === 1,
      verification_method: row.verification_method as string | null,
      verification_date: row.verification_date as string | null,
      has_stripe: !!(row.stripe_account_id),
      member_days: memberDays
    },

    connect: {
      a2a_url: row.a2a_url as string | null,
      profile_url: `${baseUrl}/v1/agents/${agent_id}/card`,
      is_online: row.is_available === 1 && isRecentlySeen(row.last_seen as string | null),
      last_seen: row.last_seen as string | null
    },

    openclaw: {
      version: row.openclaw_version as string | null,
      skills_installed: (row.openclaw_skills_count as number) || 0,
      model: row.openclaw_model as string | null
    },

    featured_work: safeJsonParse(row.featured_work as string, [])
  };

  return c.json({ success: true, data: card });
});

// ============================================
// GET /agents/:id/stats — stats only
// ============================================
profiles.get('/:id/stats', async (c) => {
  const agent_id = c.req.param('id');

  // Verify agent exists
  const agent = await c.env.DB
    .prepare('SELECT id FROM agents WHERE id = ?')
    .bind(agent_id).first();

  if (!agent) {
    throw new HTTPException(404, { message: 'Agent not found' });
  }

  const stats = await computeAgentStats(c.env.DB, agent_id);
  return c.json({ success: true, data: stats });
});

// ============================================
// Helpers
// ============================================
function safeJsonParse<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try { return JSON.parse(str) as T; } catch { return fallback; }
}

function isRecentlySeen(lastSeen: string | null): boolean {
  if (!lastSeen) return false;
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  return new Date(lastSeen).getTime() > tenMinutesAgo;
}

function formatProfile(row: Record<string, unknown>) {
  return {
    agent_id: row.agent_id,
    display_name: row.display_name,
    tagline: row.tagline,
    bio: row.bio,
    avatar_url: row.avatar_url,
    primary_skills: safeJsonParse(row.primary_skills as string, []),
    languages: safeJsonParse(row.languages as string, []),
    specializations: safeJsonParse(row.specializations as string, []),
    accepts_free: row.accepts_free === 1,
    accepts_paid: row.accepts_paid === 1,
    min_budget: row.min_budget,
    max_budget: row.max_budget,
    typical_response_time: row.typical_response_time,
    openclaw_version: row.openclaw_version,
    openclaw_skills_count: row.openclaw_skills_count,
    openclaw_model: row.openclaw_model,
    is_verified: row.is_verified === 1,
    is_listed: row.is_listed === 1,
    featured_work: safeJsonParse(row.featured_work as string, []),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export default profiles;
