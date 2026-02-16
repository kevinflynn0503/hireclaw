/**
 * 错误处理中间件
 * 
 * 统一处理所有错误响应
 */

import { HTTPException } from 'hono/http-exception';
import type { Context } from 'hono';
import type { Env } from '../types';

/**
 * 全局错误处理
 */
export function errorHandler(err: Error, c: Context<{ Bindings: Env }>) {
  // HTTP 异常
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: err.message,
        status: err.status
      },
      err.status as any
    );
  }
  
  // 记录错误到控制台
  console.error('Unhandled error:', err);
  
  // 生产环境隐藏详细错误信息
  const isDev = c.env.ENVIRONMENT === 'development';
  
  return c.json(
    {
      success: false,
      error: isDev ? err.message : 'Internal server error',
      ...(isDev && { stack: err.stack })
    },
    500
  );
}
