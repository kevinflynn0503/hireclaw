/**
 * 交付物路由
 * 
 * 工人提交交付物、平台审核、雇主验收
 */

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { generateId } from '../services/id';
import { logAudit } from '../services/audit';
import { uploadSubmissionWithHash } from '../services/content-hash';
import { autoReviewSubmission, canAcceptSubmission, canRejectSubmission } from '../services/review-engine';
import { settleTask } from '../services/stripe';
import { authMiddleware, requireRole } from '../middleware/auth';
import { ReviewStatus } from '../types';
import type { Env, Submission } from '../types';

const submissions = new Hono<{ Bindings: Env }>();

// ============================================
// 输入验证 Schema
// ============================================
const reviewSchema = z.object({
  result: z.enum(['accept', 'reject']),
  feedback: z.string().optional(),
  rating: z.number().min(1).max(5).optional()
});

// ============================================
// POST /submissions - 提交交付物（工人）
// ============================================
submissions.post('/', authMiddleware, requireRole('worker', 'both'), async (c) => {
  const agent = c.get('agent');
  const form = await c.req.formData();
  
  const task_id = form.get('task_id') as string;
  const notes = form.get('notes') as string | null;
  const file = form.get('file') as File | null;
  
  if (!task_id) {
    throw new HTTPException(400, { message: 'task_id is required' });
  }
  
  if (!file) {
    throw new HTTPException(400, { message: 'file is required' });
  }
  
  // 获取任务
  const task = await c.env.DB
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .bind(task_id)
    .first();
  
  if (!task) {
    throw new HTTPException(404, { message: 'Task not found' });
  }
  
  // 验证是工人本人
  if (task.worker_id !== agent.id) {
    throw new HTTPException(403, { message: 'You are not the worker of this task' });
  }
  
  // 验证任务状态
  if (task.status !== 'claimed') {
    throw new HTTPException(400, { message: 'Task must be in claimed status to submit' });
  }
  
  // 验证文件大小
  const max_size_mb = parseInt(c.env.MAX_FILE_SIZE_MB || '50');
  const max_size = max_size_mb * 1024 * 1024;
  if (file.size > max_size) {
    throw new HTTPException(400, { message: `File size exceeds ${max_size_mb}MB limit` });
  }
  
  // 生成 submission ID
  const submission_id = generateId('sub');
  
  // 上传文件并计算哈希
  const { key, hash, size } = await uploadSubmissionWithHash(
    file,
    task_id,
    submission_id,
    c.env.R2
  );
  
  // 保存 submission 记录
  const now = new Date().toISOString();
  await c.env.DB
    .prepare(`
      INSERT INTO submissions (
        id, task_id, worker_id, file_key, file_name, file_size, file_hash, 
        notes, review_status, submitted_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `)
    .bind(
      submission_id,
      task_id,
      agent.id,
      key,
      file.name,
      size,
      hash,
      notes || null,
      now
    )
    .run();
  
  // 更新任务状态
  await c.env.DB
    .prepare(`
      UPDATE tasks 
      SET status = 'submitted', submitted_at = ?, updated_at = ?
      WHERE id = ?
    `)
    .bind(now, now, task_id)
    .run();
  
  // 记录审计日志
  await logAudit(c.env.DB, {
    task_id,
    action: 'submission_create',
    actor: agent.id,
    actor_type: 'worker',
    details: {
      submission_id,
      file_name: file.name,
      file_hash: hash,
      file_size: size
    },
    ip_address: c.req.header('cf-connecting-ip')
  });
  
  // 触发自动审核
  const submission: Submission = {
    id: submission_id,
    task_id,
    worker_id: agent.id,
    file_key: key,
    file_name: file.name,
    file_size: size,
    file_hash: hash,
    notes: notes || undefined,
    review_status: ReviewStatus.PENDING,
    submitted_at: now
  };
  
  const review_result = await autoReviewSubmission(
    submission,
    c.env.R2,
    max_size_mb
  );
  
  if (review_result.approved) {
    // 自动审核通过
    await c.env.DB
      .prepare(`
        UPDATE submissions 
        SET review_status = 'approved', reviewed_at = ?
        WHERE id = ?
      `)
      .bind(now, submission_id)
      .run();
    
    // 更新任务状态为待验收
    await c.env.DB
      .prepare(`
        UPDATE tasks 
        SET status = 'under_review', updated_at = ?
        WHERE id = ?
      `)
      .bind(now, task_id)
      .run();
    
    // 记录审计日志
    await logAudit(c.env.DB, {
      task_id,
      action: 'submission_review',
      actor: 'system',
      actor_type: 'platform',
      details: {
        submission_id,
        result: 'approved',
        automated: true
      }
    });
  } else {
    // 自动审核失败
    await c.env.DB
      .prepare(`
        UPDATE submissions 
        SET review_status = 'rejected', review_notes = ?, reviewed_at = ?
        WHERE id = ?
      `)
      .bind(
        review_result.reason + '\n' + (review_result.issues?.join('\n') || ''),
        now,
        submission_id
      )
      .run();
    
    // 记录审计日志
    await logAudit(c.env.DB, {
      task_id,
      action: 'submission_review',
      actor: 'system',
      actor_type: 'platform',
      details: {
        submission_id,
        result: 'rejected',
        reason: review_result.reason,
        issues: review_result.issues,
        automated: true
      }
    });
  }
  
  return c.json({
    success: true,
    data: {
      submission_id,
      file_hash: hash,
      review_status: review_result.approved ? 'approved' : 'rejected',
      review_notes: review_result.approved ? undefined : review_result.reason
    },
    message: review_result.approved 
      ? 'Submission uploaded and approved. Awaiting employer review.'
      : 'Submission uploaded but failed automated review. Please fix the issues and resubmit.'
  }, review_result.approved ? 201 : 400);
});

// ============================================
// GET /submissions/:id - 获取交付物详情
// ============================================
submissions.get('/:id', authMiddleware, async (c) => {
  const submission_id = c.req.param('id');
  const agent = c.get('agent');
  
  const submission = await c.env.DB
    .prepare('SELECT * FROM submissions WHERE id = ?')
    .bind(submission_id)
    .first<Submission>();
  
  if (!submission) {
    throw new HTTPException(404, { message: 'Submission not found' });
  }
  
  // 获取任务信息以验证权限
  const task = await c.env.DB
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .bind(submission.task_id)
    .first();
  
  if (!task) {
    throw new HTTPException(404, { message: 'Task not found' });
  }
  
  // 只有雇主和工人可以查看
  if (task.employer_id !== agent.id && task.worker_id !== agent.id) {
    throw new HTTPException(403, { message: 'You do not have permission to view this submission' });
  }
  
  return c.json({
    success: true,
    data: submission
  });
});

// ============================================
// POST /submissions/:id/accept - 雇主验收通过
// ============================================
submissions.post('/:id/accept', authMiddleware, requireRole('employer', 'both'), async (c) => {
  const submission_id = c.req.param('id');
  const agent = c.get('agent');
  const body = await c.req.json();
  
  const { feedback, rating } = reviewSchema.parse({ ...body, result: 'accept' });
  
  // 获取交付物
  const submission = await c.env.DB
    .prepare('SELECT * FROM submissions WHERE id = ?')
    .bind(submission_id)
    .first<Submission>();
  
  if (!submission) {
    throw new HTTPException(404, { message: 'Submission not found' });
  }
  
  // 获取任务
  const task = await c.env.DB
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .bind(submission.task_id)
    .first();
  
  if (!task) {
    throw new HTTPException(404, { message: 'Task not found' });
  }
  
  // 验证是雇主本人
  if (task.employer_id !== agent.id) {
    throw new HTTPException(403, { message: 'Only the employer can accept submissions' });
  }
  
  // 验证任务状态
  if (task.status !== 'under_review') {
    throw new HTTPException(400, { message: 'Task is not ready for acceptance' });
  }
  
  // 验证交付物状态
  const can_accept = canAcceptSubmission(submission);
  if (!can_accept.allowed) {
    throw new HTTPException(400, { message: can_accept.reason || 'Cannot accept submission' });
  }
  
  // 创建验收记录
  const review_id = generateId('rev');
  const now = new Date().toISOString();
  
  await c.env.DB
    .prepare(`
      INSERT INTO reviews (id, task_id, submission_id, employer_id, result, feedback, rating, reviewed_at)
      VALUES (?, ?, ?, ?, 'accept', ?, ?, ?)
    `)
    .bind(review_id, task.id, submission_id, agent.id, feedback || null, rating || null, now)
    .run();
  
  // 更新任务状态为已完成
  await c.env.DB
    .prepare(`
      UPDATE tasks 
      SET status = 'completed', completed_at = ?, updated_at = ?
      WHERE id = ?
    `)
    .bind(now, now, task.id)
    .run();
  
  // 记录审计日志
  await logAudit(c.env.DB, {
    task_id: task.id as string,
    action: 'submission_accept',
    actor: agent.id,
    actor_type: 'employer',
    details: {
      submission_id,
      review_id,
      rating,
      feedback
    },
    ip_address: c.req.header('cf-connecting-ip')
  });
  
  // Trigger payment settlement (99% to worker, 1% platform fee)
  try {
    await settleTask(c.env, task.id as string);
  } catch (err) {
    // Log but don't fail the acceptance — payment can be retried
    console.error(`Payment settlement failed for task ${task.id}:`, err);
    await logAudit(c.env.DB, {
      task_id: task.id as string,
      action: 'payment_capture',
      actor: 'system',
      actor_type: 'platform',
      details: { error: err instanceof Error ? err.message : 'Unknown error', submission_id }
    });
  }
  
  return c.json({
    success: true,
    message: 'Submission accepted. Task completed successfully.',
    data: {
      review_id,
      task_status: 'completed'
    }
  });
});

// ============================================
// POST /submissions/:id/reject - 雇主拒绝
// ============================================
submissions.post('/:id/reject', authMiddleware, requireRole('employer', 'both'), async (c) => {
  const submission_id = c.req.param('id');
  const agent = c.get('agent');
  const body = await c.req.json();
  
  const { feedback } = reviewSchema.parse({ ...body, result: 'reject' });
  
  if (!feedback) {
    throw new HTTPException(400, { message: 'Feedback is required when rejecting' });
  }
  
  // 获取交付物
  const submission = await c.env.DB
    .prepare('SELECT * FROM submissions WHERE id = ?')
    .bind(submission_id)
    .first<Submission>();
  
  if (!submission) {
    throw new HTTPException(404, { message: 'Submission not found' });
  }
  
  // 获取任务
  const task = await c.env.DB
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .bind(submission.task_id)
    .first();
  
  if (!task) {
    throw new HTTPException(404, { message: 'Task not found' });
  }
  
  // 验证是雇主本人
  if (task.employer_id !== agent.id) {
    throw new HTTPException(403, { message: 'Only the employer can reject submissions' });
  }
  
  // 统计拒绝次数
  const rejection_count = await c.env.DB
    .prepare(`
      SELECT COUNT(*) as count 
      FROM reviews 
      WHERE task_id = ? AND result = 'reject'
    `)
    .bind(task.id)
    .first<{ count: number }>();
  
  const count = rejection_count?.count || 0;
  const max_rejections = parseInt(c.env.MAX_REJECTION_COUNT || '3');
  
  // 验证拒绝次数
  const can_reject = canRejectSubmission(submission, count, max_rejections);
  if (!can_reject.allowed) {
    throw new HTTPException(400, { message: can_reject.reason || 'Cannot reject submission' });
  }
  
  // 创建拒绝记录
  const review_id = generateId('rev');
  const now = new Date().toISOString();
  
  await c.env.DB
    .prepare(`
      INSERT INTO reviews (id, task_id, submission_id, employer_id, result, feedback, reviewed_at)
      VALUES (?, ?, ?, ?, 'reject', ?, ?)
    `)
    .bind(review_id, task.id, submission_id, agent.id, feedback, now)
    .run();
  
  // 更新任务状态为已拒绝
  await c.env.DB
    .prepare(`
      UPDATE tasks 
      SET status = 'rejected', updated_at = ?
      WHERE id = ?
    `)
    .bind(now, task.id)
    .run();
  
  // 记录审计日志
  await logAudit(c.env.DB, {
    task_id: task.id as string,
    action: 'submission_reject',
    actor: agent.id,
    actor_type: 'employer',
    details: {
      submission_id,
      review_id,
      feedback,
      rejection_count: count + 1,
      max_rejections
    },
    ip_address: c.req.header('cf-connecting-ip')
  });
  
  return c.json({
    success: true,
    message: `Submission rejected. Worker can resubmit (${count + 1}/${max_rejections} rejections).`,
    data: {
      review_id,
      task_status: 'rejected',
      remaining_attempts: max_rejections - (count + 1)
    }
  });
});

// ============================================
// GET /submissions/:id/download - 下载交付物
// ============================================
submissions.get('/:id/download', authMiddleware, async (c) => {
  const submission_id = c.req.param('id');
  const agent = c.get('agent');
  
  // 获取交付物
  const submission = await c.env.DB
    .prepare('SELECT * FROM submissions WHERE id = ?')
    .bind(submission_id)
    .first<Submission>();
  
  if (!submission) {
    throw new HTTPException(404, { message: 'Submission not found' });
  }
  
  // 获取任务信息以验证权限
  const task = await c.env.DB
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .bind(submission.task_id)
    .first();
  
  if (!task) {
    throw new HTTPException(404, { message: 'Task not found' });
  }
  
  // 只有雇主和工人可以下载
  if (task.employer_id !== agent.id && task.worker_id !== agent.id) {
    throw new HTTPException(403, { message: 'You do not have permission to download this file' });
  }
  
  // 从 R2 获取文件
  const object = await c.env.R2.get(submission.file_key);
  if (!object) {
    throw new HTTPException(404, { message: 'File not found in storage' });
  }
  
  // 返回文件
  return new Response(object.body, {
    headers: {
      'Content-Type': object.customMetadata?.content_type || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${submission.file_name}"`,
      'Content-Length': submission.file_size.toString()
    }
  });
});

export default submissions;
