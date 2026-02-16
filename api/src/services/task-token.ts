/**
 * 任务授权 Token 服务（借鉴 AP2 设计思想）
 * 
 * 使用 HMAC 签名防止任务请求伪造
 * 比 AP2 的非对称密钥更简单，适合小额交易
 */

import type { Task, TaskTokenValidation } from '../types';

/**
 * 生成任务授权 Token
 * 
 * Token = HMAC-SHA256(task_id:employer_id:budget:created_at, secret)
 */
export async function generateTaskToken(
  task: Pick<Task, 'id' | 'employer_id' | 'budget' | 'created_at'>,
  secret: string
): Promise<string> {
  const payload = `${task.id}:${task.employer_id}:${task.budget}:${task.created_at}`;
  
  // 使用 Web Crypto API 计算 HMAC
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  
  // 转换为 hex 字符串
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 验证任务授权 Token
 * 
 * 使用时间安全比较，防止时序攻击
 */
export async function verifyTaskToken(
  task: Pick<Task, 'id' | 'employer_id' | 'budget' | 'created_at'>,
  token: string,
  secret: string
): Promise<boolean> {
  const expected = await generateTaskToken(task, secret);
  return timingSafeEqual(token, expected);
}

/**
 * 验证 Token 并检查过期
 */
export async function verifyTaskTokenWithExpiry(
  task: Pick<Task, 'id' | 'employer_id' | 'budget' | 'created_at'>,
  token: string,
  secret: string,
  max_age_hours: number = 24
): Promise<TaskTokenValidation> {
  // 检查过期
  if (isTokenExpired(task.created_at, max_age_hours)) {
    return { valid: false, reason: 'Token expired' };
  }
  
  // 检查签名
  const valid = await verifyTaskToken(task, token, secret);
  if (!valid) {
    return { valid: false, reason: 'Invalid signature' };
  }
  
  return { valid: true };
}

/**
 * 检查 Token 是否过期
 */
export function isTokenExpired(
  created_at: string,
  max_age_hours: number = 24
): boolean {
  const created = new Date(created_at).getTime();
  const now = Date.now();
  const age_ms = now - created;
  const max_age_ms = max_age_hours * 60 * 60 * 1000;
  return age_ms > max_age_ms;
}

/**
 * 时间安全字符串比较
 * 防止时序攻击（timing attack）
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
