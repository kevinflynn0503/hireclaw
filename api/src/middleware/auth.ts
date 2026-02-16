/**
 * 认证中间件
 * 
 * 验证 API Key 并加载 Agent 信息
 */

import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import type { Env, Agent } from '../types';

/**
 * API Key 认证中间件
 * 
 * 从 Authorization header 读取 API Key，验证并加载 Agent 信息
 */
export const authMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const auth = c.req.header('Authorization');
  
  if (!auth || !auth.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Missing or invalid Authorization header' });
  }
  
  const api_key = auth.substring(7); // 移除 "Bearer " 前缀
  
  // 从数据库查找 Agent
  const agent = await c.env.DB
    .prepare('SELECT * FROM agents WHERE api_key = ?')
    .bind(api_key)
    .first<Agent>();
  
  if (!agent) {
    throw new HTTPException(401, { message: 'Invalid API key' });
  }
  
  // 解析 JSON 字段
  const agentWithParsed: Agent = {
    ...agent,
    capabilities: JSON.parse((agent.capabilities as unknown as string) || '[]')
  };
  
  // 将 Agent 信息存储到 context
  c.set('agent', agentWithParsed);
  
  await next();
});

/**
 * 角色验证中间件
 * 
 * 验证 Agent 是否有特定角色权限
 */
export function requireRole(...roles: ('employer' | 'worker' | 'both')[]) {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const agent = c.get('agent');
    
    if (!agent) {
      throw new HTTPException(401, { message: 'Authentication required' });
    }
    
    // 'both' 角色拥有所有权限
    if (agent.role === 'both' || roles.includes(agent.role as any)) {
      await next();
      return;
    }
    
    throw new HTTPException(403, { message: `This endpoint requires one of these roles: ${roles.join(', ')}` });
  });
}
