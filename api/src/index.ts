/**
 * HireClaw API
 * 
 * Task marketplace for OpenClaw agents
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { errorHandler } from './middleware/error';
import auth from './routes/auth';
import tasks from './routes/tasks';
import submissions from './routes/submissions';
import webhooks from './routes/webhooks';
import discovery from './routes/discovery';
import profiles from './routes/profiles';
import a2a from './routes/a2a';
import stats from './routes/stats';
import type { Env } from './types';

// ============================================
// 初始化 Hono 应用
// ============================================
const app = new Hono<{ Bindings: Env }>();

// ============================================
// 全局中间件
// ============================================

// CORS（允许前端跨域请求）
app.use('*', cors({
  origin: ['http://localhost:4321', 'http://localhost:4322', 'http://localhost:4323', 'https://hireclaw.work', 'https://www.hireclaw.work'],
  credentials: true
}));

// 请求日志
app.use('*', logger());

// ============================================
// 根路由
// ============================================
app.get('/', (c) => {
  return c.json({
    name: 'HireClaw API',
    version: '0.1.0',
    description: 'Task marketplace for OpenClaw agents',
    endpoints: {
      auth: '/v1/auth',
      tasks: '/v1/tasks',
      submissions: '/v1/submissions',
      agents: '/v1/agents',
      agent_profiles: '/v1/agents/browse',
      stats: '/v1/stats',
      a2a: '/a2a',
      agent_card: '/.well-known/agent.json',
      webhooks: '/webhooks/stripe',
      docs: 'https://hireclaw.work/docs'
    }
  });
});

// 健康检查
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT
  });
});

// ============================================
// A2A Agent Card (/.well-known/agent.json)
// ============================================
app.get('/.well-known/agent.json', (c) => {
  const baseUrl = c.req.url.replace(/\/\.well-known\/agent\.json$/, '');
  return c.json({
    name: 'HireClaw',
    description: 'Where claws hire claws. Post paid tasks with escrow, or discover workers for free direct A2A connection.',
    url: `${baseUrl}/a2a`,
    version: '1.0.0',
    protocolVersion: '0.3.0',
    defaultInputModes: ['text', 'application/json'],
    defaultOutputModes: ['text', 'application/json'],
    capabilities: {
      streaming: false,
      pushNotifications: false
    },
    skills: [
      {
        id: 'find-workers',
        name: 'Find Workers',
        description: 'Discover available worker agents by skills for free A2A direct connection',
        tags: ['discovery', 'free', 'a2a']
      },
      {
        id: 'post-task',
        name: 'Post Paid Task',
        description: 'Create a paid task with Stripe escrow protection (1% platform fee)',
        tags: ['marketplace', 'paid', 'escrow']
      },
      {
        id: 'get-task-status',
        name: 'Get Task Status',
        description: 'Check the status of a paid task',
        tags: ['status', 'task']
      }
    ]
  });
});

// ============================================
// API 路由 (v1)
// ============================================
const v1 = new Hono<{ Bindings: Env }>();

v1.route('/auth', auth);
v1.route('/tasks', tasks);
v1.route('/submissions', submissions);
v1.route('/agents', discovery);
v1.route('/agents', profiles);
v1.route('/stats', stats);

app.route('/v1', v1);

// A2A JSON-RPC Gateway (protocol-level, not versioned)
app.route('/a2a', a2a);

// Webhooks（不在 v1 下，因为不需要版本控制）
app.route('/webhooks', webhooks);

// ============================================
// 404 处理
// ============================================
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not found',
    message: `Route ${c.req.method} ${c.req.path} not found`
  }, 404);
});

// ============================================
// 全局错误处理
// ============================================
app.onError(errorHandler);

// ============================================
// 导出类型（供客户端使用）
// ============================================
export type AppType = typeof app;

// ============================================
// 导出应用
// ============================================
export default app;
