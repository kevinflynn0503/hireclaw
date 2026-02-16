/**
 * 内容哈希服务（借鉴 AP2 设计思想）
 * 
 * 计算和验证交付物的 SHA-256 哈希，防止篡改
 */

import type { FileUploadResult, IntegrityCheckResult } from '../types';

/**
 * 计算文件内容的 SHA-256 哈希
 */
export async function computeContentHash(data: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 上传交付物并计算哈希
 * 
 * @param file - 文件对象
 * @param task_id - 任务 ID
 * @param submission_id - 交付物 ID
 * @param r2 - R2 存储桶
 * @returns 上传结果（key, hash, size）
 */
export async function uploadSubmissionWithHash(
  file: File,
  task_id: string,
  submission_id: string,
  r2: R2Bucket
): Promise<FileUploadResult> {
  // 读取文件
  const buffer = await file.arrayBuffer();
  
  // 计算哈希
  const hash = await computeContentHash(buffer);
  
  // 生成 R2 key
  const timestamp = Date.now();
  const key = `submissions/${task_id}/${submission_id}/${timestamp}-${file.name}`;
  
  // 上传到 R2，将哈希和元数据存储
  await r2.put(key, buffer, {
    customMetadata: {
      task_id,
      submission_id,
      original_name: file.name,
      content_hash: hash,
      upload_time: new Date().toISOString(),
      content_type: file.type || 'application/octet-stream',
      size: buffer.byteLength.toString()
    }
  });
  
  return {
    key,
    hash,
    size: buffer.byteLength
  };
}

/**
 * 验证交付物完整性
 * 
 * 重新计算哈希并与存储的哈希对比
 */
export async function verifySubmissionIntegrity(
  key: string,
  r2: R2Bucket
): Promise<IntegrityCheckResult> {
  // 从 R2 获取文件
  const object = await r2.get(key);
  if (!object) {
    return { valid: false, reason: 'File not found in storage' };
  }
  
  // 获取存储的哈希
  const stored_hash = object.customMetadata?.content_hash;
  if (!stored_hash) {
    return { valid: false, reason: 'No hash metadata found' };
  }
  
  // 重新计算哈希
  const buffer = await object.arrayBuffer();
  const computed_hash = await computeContentHash(buffer);
  
  // 比较哈希
  if (stored_hash !== computed_hash) {
    return { 
      valid: false, 
      reason: 'Hash mismatch - file may be corrupted or tampered with' 
    };
  }
  
  return { valid: true };
}

/**
 * 生成 R2 签名 URL（用于下载）
 * 
 * 注意：Cloudflare R2 不直接支持签名 URL，需要通过 Worker 代理
 */
export function generateDownloadKey(
  key: string,
  expiry_minutes: number = 60
): { download_key: string; expires_at: string } {
  const expires_at = new Date(Date.now() + expiry_minutes * 60 * 1000).toISOString();
  
  // Encode with Web API (Workers-compatible, no Node Buffer)
  const download_key = btoa(`${key}:${expires_at}`).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  return {
    download_key,
    expires_at
  };
}

/**
 * 验证下载密钥
 */
export function verifyDownloadKey(download_key: string): {
  valid: boolean;
  key?: string;
  reason?: string;
} {
  try {
    // Decode base64url (Workers-compatible, no Node Buffer)
    const padded = download_key.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(padded);
    const [key, expires_at] = decoded.split(':');
    
    if (!key || !expires_at) {
      return { valid: false, reason: 'Invalid download key format' };
    }
    
    // 检查是否过期
    if (new Date(expires_at) < new Date()) {
      return { valid: false, reason: 'Download key expired' };
    }
    
    return { valid: true, key };
  } catch (error) {
    return { valid: false, reason: 'Invalid download key' };
  }
}
