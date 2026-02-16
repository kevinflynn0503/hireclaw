/**
 * 平台审核引擎
 * 
 * 自动审核交付物的基本格式和安全性
 */

import type { Submission } from '../types';
import { verifySubmissionIntegrity } from './content-hash';

/**
 * 审核结果
 */
export interface ReviewResult {
  approved: boolean;
  reason?: string;
  issues?: string[];
}

/**
 * 自动审核交付物
 * 
 * 检查项：
 * 1. 文件完整性（哈希验证）
 * 2. 文件大小（不能为空，不能超过限制）
 * 3. 文件类型（白名单）
 */
export async function autoReviewSubmission(
  submission: Submission,
  r2: R2Bucket,
  max_file_size_mb: number = 50
): Promise<ReviewResult> {
  const issues: string[] = [];
  
  // 1. 验证文件完整性
  const integrity = await verifySubmissionIntegrity(submission.file_key, r2);
  if (!integrity.valid) {
    return {
      approved: false,
      reason: 'File integrity check failed',
      issues: [integrity.reason || 'Unknown integrity issue']
    };
  }
  
  // 2. 验证文件大小
  const max_size = max_file_size_mb * 1024 * 1024;
  if (submission.file_size === 0) {
    issues.push('File is empty');
  }
  if (submission.file_size > max_size) {
    issues.push(`File size exceeds ${max_file_size_mb}MB limit`);
  }
  
  // 3. 验证文件类型（通过扩展名）
  const allowed_extensions = [
    '.pdf', '.zip', '.tar.gz', '.rar',
    '.png', '.jpg', '.jpeg', '.gif', '.webp',
    '.txt', '.md', '.doc', '.docx',
    '.py', '.js', '.ts', '.html', '.css',
    '.json', '.xml', '.csv'
  ];
  
  const file_name = submission.file_name.toLowerCase();
  const has_allowed_extension = allowed_extensions.some(ext => 
    file_name.endsWith(ext)
  );
  
  if (!has_allowed_extension) {
    issues.push('File type not allowed. Please use common document, image, or code files.');
  }
  
  // 4. 基本安全检查（文件名）
  const dangerous_patterns = [
    '../', '..\\',  // 路径穿越
    '<script', // XSS
    'javascript:', // JS 注入
  ];
  
  for (const pattern of dangerous_patterns) {
    if (file_name.includes(pattern.toLowerCase())) {
      issues.push('File name contains potentially dangerous content');
      break;
    }
  }
  
  // 返回审核结果
  if (issues.length > 0) {
    return {
      approved: false,
      reason: 'Submission failed automated review',
      issues
    };
  }
  
  return {
    approved: true
  };
}

/**
 * 检查任务是否可以接受验收
 */
export function canAcceptSubmission(submission: Submission): {
  allowed: boolean;
  reason?: string;
} {
  // 必须通过平台审核
  if (submission.review_status !== 'approved') {
    return {
      allowed: false,
      reason: 'Submission has not been approved by platform review'
    };
  }
  
  return { allowed: true };
}

/**
 * 检查任务是否可以拒绝
 */
export function canRejectSubmission(
  _submission: Submission,
  rejection_count: number,
  max_rejections: number = 3
): {
  allowed: boolean;
  reason?: string;
} {
  // 检查拒绝次数
  if (rejection_count >= max_rejections) {
    return {
      allowed: false,
      reason: `Maximum rejection limit (${max_rejections}) reached`
    };
  }
  
  return { allowed: true };
}
