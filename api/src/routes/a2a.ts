/**
 * A2A JSON-RPC Gateway
 *
 * HireClaw 作为 A2A Server，处理 JSON-RPC 2.0 请求
 * 支持: message/send (创建付费任务、查找工人、查询状态)
 */

import { Hono, type Context } from 'hono';
import { generateId } from '../services/id';
import { logAudit } from '../services/audit';
import { generateTaskToken } from '../services/task-token';
import type { Env } from '../types';

type A2AContext = Context<{ Bindings: Env }>;

const a2a = new Hono<{ Bindings: Env }>();

// A2A JSON-RPC error codes
const A2A_ERRORS = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  TASK_NOT_FOUND: -32001,
  UNAUTHORIZED: -32002,
} as const;

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: Record<string, unknown>;
}

// ============================================
// POST /a2a — JSON-RPC 2.0 endpoint
// ============================================
a2a.post('/', async (c) => {
  let body: JsonRpcRequest;
  try {
    body = await c.req.json() as JsonRpcRequest;
  } catch {
    return c.json({
      jsonrpc: '2.0',
      id: null,
      error: { code: A2A_ERRORS.PARSE_ERROR, message: 'Parse error' }
    }, 400);
  }

  if (body.jsonrpc !== '2.0' || !body.method) {
    return c.json({
      jsonrpc: '2.0',
      id: body.id ?? null,
      error: { code: A2A_ERRORS.INVALID_REQUEST, message: 'Invalid JSON-RPC request' }
    }, 400);
  }

  // Authenticate via Bearer token in Authorization header
  const authHeader = c.req.header('Authorization');
  const api_key = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  try {
    switch (body.method) {
      case 'message/send':
        return await handleMessageSend(c, body, api_key);
      default:
        return c.json({
          jsonrpc: '2.0',
          id: body.id,
          error: { code: A2A_ERRORS.METHOD_NOT_FOUND, message: `Method ${body.method} not found` }
        }, 404);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return c.json({
      jsonrpc: '2.0',
      id: body.id,
      error: { code: A2A_ERRORS.INTERNAL_ERROR, message }
    }, 500);
  }
});

// ============================================
// Handle message/send
// ============================================
async function handleMessageSend(
  c: A2AContext,
  body: JsonRpcRequest,
  api_key: string | null
) {
  const params = body.params as { message?: { parts?: Array<{ kind: string; text?: string; data?: Record<string, unknown> }> } } | undefined;
  const parts = params?.message?.parts;

  if (!parts || parts.length === 0) {
    return c.json({
      jsonrpc: '2.0',
      id: body.id,
      error: { code: A2A_ERRORS.INVALID_PARAMS, message: 'Message must contain at least one part' }
    }, 400);
  }

  // Check for DataPart with action (structured requests)
  const dataPart = parts.find(p => p.kind === 'data' && p.data);
  if (dataPart?.data) {
    const action = dataPart.data.action as string;

    switch (action) {
      case 'find-workers':
        return await handleFindWorkers(c, body, dataPart.data);

      case 'post-task':
        return await handlePostTask(c, body, dataPart.data, api_key);

      case 'get-task-status':
        return await handleGetTaskStatus(c, body, dataPart.data);

      default:
        // Fall through to text handling
        break;
    }
  }

  // TextPart — interpret as natural language request
  const textPart = parts.find(p => p.kind === 'text' && p.text);
  if (textPart?.text) {
    return c.json({
      jsonrpc: '2.0',
      id: body.id,
      result: {
        kind: 'message',
        role: 'agent',
        parts: [{
          kind: 'data',
          data: {
            hint: 'Use structured DataPart with action field for precise requests',
            available_actions: ['find-workers', 'post-task', 'get-task-status'],
            example: {
              action: 'find-workers',
              skills: ['translation', 'japanese']
            }
          }
        }]
      }
    });
  }

  return c.json({
    jsonrpc: '2.0',
    id: body.id,
    error: { code: A2A_ERRORS.INVALID_PARAMS, message: 'Unrecognized message format' }
  }, 400);
}

// ============================================
// Action: find-workers
// ============================================
async function handleFindWorkers(
  c: A2AContext,
  body: JsonRpcRequest,
  data: Record<string, unknown>
) {
  const skills = data.skills as string[] | undefined;
  const limit = Math.min((data.limit as number) || 10, 50);

  let query = `
    SELECT ac.*, a.role
    FROM agent_cards ac
    JOIN agents a ON ac.agent_id = a.id
    WHERE ac.is_available = 1
  `;
  const bindings: (string | number)[] = [];

  if (skills && skills.length > 0) {
    const conditions = skills.map(() => 'ac.skills LIKE ?').join(' OR ');
    query += ` AND (${conditions})`;
    skills.forEach(skill => bindings.push(`%"${skill}"%`));
  }

  query += ' ORDER BY ac.last_seen DESC LIMIT ?';
  bindings.push(limit);

  const result = await c.env.DB.prepare(query).bind(...bindings).all();

  const workers = (result.results as Record<string, unknown>[]).map(row => ({
    name: row.name as string,
    description: row.description as string,
    a2a_url: row.a2a_url as string,
    skills: JSON.parse(row.skills as string),
    last_seen: row.last_seen as string
  }));

  return c.json({
    jsonrpc: '2.0',
    id: body.id,
    result: {
      kind: 'message',
      role: 'agent',
      parts: [{
        kind: 'data',
        data: {
          workers,
          total: workers.length,
          hint: workers.length > 0
            ? 'Use a2a_url to connect directly (free) or use action:post-task for paid escrow'
            : 'No workers found. Try broader skills or check back later.'
        }
      }]
    }
  });
}

// ============================================
// Action: post-task (paid, through platform)
// ============================================
async function handlePostTask(
  c: A2AContext,
  body: JsonRpcRequest,
  data: Record<string, unknown>,
  api_key: string | null
) {
  if (!api_key) {
    return c.json({
      jsonrpc: '2.0',
      id: body.id,
      error: { code: A2A_ERRORS.UNAUTHORIZED, message: 'Authorization Bearer token required for paid tasks' }
    }, 401);
  }

  // Verify agent
  const agent = await c.env.DB
    .prepare('SELECT * FROM agents WHERE api_key = ?')
    .bind(api_key)
    .first();

  if (!agent) {
    return c.json({
      jsonrpc: '2.0',
      id: body.id,
      error: { code: A2A_ERRORS.UNAUTHORIZED, message: 'Invalid API key' }
    }, 401);
  }

  const title = data.title as string;
  const description = data.description as string;
  const skills = data.skills as string[] || [];
  const budget = data.budget as number;
  const deadline = data.deadline as string;

  if (!title || !description || !budget || !deadline) {
    return c.json({
      jsonrpc: '2.0',
      id: body.id,
      error: { code: A2A_ERRORS.INVALID_PARAMS, message: 'Required: title, description, budget, deadline' }
    }, 400);
  }

  const task_id = generateId('task');
  const now = new Date().toISOString();

  await c.env.DB
    .prepare(`
      INSERT INTO tasks (id, employer_id, title, description, skills, budget, deadline, status, payment_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'open', 'pending', ?, ?)
    `)
    .bind(task_id, agent.id as string, title, description, JSON.stringify(skills), budget, deadline, now, now)
    .run();

  const task_token = await generateTaskToken(
    { id: task_id, employer_id: agent.id as string, budget, created_at: now },
    c.env.TASK_SECRET
  );

  await logAudit(c.env.DB, {
    task_id,
    action: 'task_create',
    actor: agent.id as string,
    actor_type: 'employer',
    details: { title, budget, via: 'a2a' }
  });

  // Return as A2A Task
  return c.json({
    jsonrpc: '2.0',
    id: body.id,
    result: {
      kind: 'task',
      id: task_id,
      contextId: task_id,
      status: { state: 'submitted', timestamp: now },
      artifacts: [],
      metadata: {
        task_token,
        budget,
        deadline,
        platform_fee: `${c.env.PLATFORM_FEE_PERCENT || '1'}%`,
        mode: 'paid'
      }
    }
  });
}

// ============================================
// Action: get-task-status
// ============================================
async function handleGetTaskStatus(
  c: A2AContext,
  body: JsonRpcRequest,
  data: Record<string, unknown>
) {
  const task_id = data.task_id as string;
  if (!task_id) {
    return c.json({
      jsonrpc: '2.0',
      id: body.id,
      error: { code: A2A_ERRORS.INVALID_PARAMS, message: 'task_id required' }
    }, 400);
  }

  const task = await c.env.DB
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .bind(task_id)
    .first();

  if (!task) {
    return c.json({
      jsonrpc: '2.0',
      id: body.id,
      error: { code: A2A_ERRORS.TASK_NOT_FOUND, message: 'Task not found' }
    }, 404);
  }

  // Map HireClaw status to A2A state
  const stateMap: Record<string, string> = {
    open: 'submitted',
    claimed: 'working',
    submitted: 'working',
    under_review: 'working',
    completed: 'completed',
    rejected: 'input-required',
    cancelled: 'failed',
    expired: 'failed',
  };

  return c.json({
    jsonrpc: '2.0',
    id: body.id,
    result: {
      kind: 'task',
      id: task.id,
      contextId: task.id,
      status: {
        state: stateMap[task.status as string] || 'submitted',
        timestamp: task.updated_at as string
      },
      metadata: {
        hireclaw_status: task.status,
        budget: task.budget,
        worker_id: task.worker_id || null,
        payment_status: task.payment_status
      }
    }
  });
}

export default a2a;
