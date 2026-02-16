/**
 * ID 生成服务
 * 
 * 生成唯一的 ID，格式：prefix_随机字符串
 * 例如：agent_abc123def456, task_xyz789
 */

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * 生成随机字符串
 */
function randomString(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(byte => CHARS[byte % CHARS.length])
    .join('');
}

/**
 * 生成带前缀的唯一 ID
 * 
 * @param prefix - ID 前缀 (agent, task, sub, rev, log)
 * @param length - 随机部分长度，默认 12
 * @returns 格式化的 ID，如 agent_abc123def456
 */
export function generateId(
  prefix: 'agent' | 'task' | 'sub' | 'rev' | 'log',
  length: number = 12
): string {
  return `${prefix}_${randomString(length)}`;
}

/**
 * 验证 ID 格式
 */
export function validateId(id: string, prefix: string): boolean {
  const regex = new RegExp(`^${prefix}_[a-z0-9]{12,}$`);
  return regex.test(id);
}
