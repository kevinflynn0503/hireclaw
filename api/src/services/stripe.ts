/**
 * Stripe 支付服务
 * 
 * 处理资金托管（Escrow）和分账
 */

import type { Env } from '../types';
import { logAudit } from './audit';

// Stripe API 基础 URL
const STRIPE_API_URL = 'https://api.stripe.com/v1';

/**
 * Stripe API 请求辅助函数
 */
async function stripeRequest(
  endpoint: string,
  method: string,
  api_key: string,
  body?: Record<string, string>
): Promise<any> {
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${api_key}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  
  if (body && method !== 'GET') {
    options.body = new URLSearchParams(body).toString();
  }
  
  const response = await fetch(`${STRIPE_API_URL}${endpoint}`, options);
  
  if (!response.ok) {
    const errorBody = await response.json() as { error?: { message?: string } };
    throw new Error(`Stripe API error: ${errorBody.error?.message || 'Unknown error'}`);
  }
  
  return response.json();
}

/**
 * 创建任务支付（冻结资金）
 * 
 * 使用 PaymentIntent 的 capture_method: manual 来实现 Escrow
 */
export async function createTaskPayment(
  env: Env,
  task_id: string,
  employer_id: string,
  amount: number,  // 美元
  stripe_customer_id?: string
): Promise<string> {
  // 确保客户存在
  let customer_id = stripe_customer_id;
  if (!customer_id) {
    // 创建新客户
    const customer = await stripeRequest(
      '/customers',
      'POST',
      env.STRIPE_SECRET_KEY,
      {
        metadata: JSON.stringify({ agent_id: employer_id })
      }
    );
    customer_id = customer.id;
    
    // 更新 agent 记录
    await env.DB
      .prepare('UPDATE agents SET stripe_customer_id = ? WHERE id = ?')
      .bind(customer_id, employer_id)
      .run();
  }
  
  // 创建 PaymentIntent（暂不扣款）
  const payment_intent = await stripeRequest(
    '/payment_intents',
    'POST',
    env.STRIPE_SECRET_KEY,
    {
      amount: Math.round(amount * 100).toString(), // 转为分
      currency: 'usd',
      customer: customer_id as string,
      capture_method: 'manual', // 手动扣款（Escrow）
      'metadata[task_id]': task_id,
      'metadata[employer_id]': employer_id
    }
  );
  
  // 更新任务的 payment_intent_id
  await env.DB
    .prepare(`
      UPDATE tasks 
      SET payment_intent_id = ?, payment_status = 'held'
      WHERE id = ?
    `)
    .bind(payment_intent.id, task_id)
    .run();
  
  // 记录审计日志
  await logAudit(env.DB, {
    task_id,
    action: 'payment_hold',
    actor: 'system',
    actor_type: 'platform',
    details: {
      payment_intent_id: payment_intent.id,
      amount,
      currency: 'usd'
    }
  });
  
  return payment_intent.id;
}

/**
 * 结算任务（扣款 + 分账）
 * 
 * 1. Capture PaymentIntent（从雇主扣款）
 * 2. 转账给工人（99%）
 * 3. 平台留存（1%）
 */
export async function settleTask(
  env: Env,
  task_id: string
): Promise<void> {
  // 获取任务信息
  interface TaskRow { id: string; employer_id: string; worker_id: string; budget: number; payment_intent_id: string; payment_status: string; status: string }
  const task = await env.DB
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .bind(task_id)
    .first<TaskRow>();
  
  if (!task) {
    throw new Error('Task not found');
  }
  
  if (!task.payment_intent_id) {
    throw new Error('No payment intent found for this task');
  }
  
  if (!task.worker_id) {
    throw new Error('No worker assigned to this task');
  }
  
  // 1. Capture PaymentIntent（扣款）
  await stripeRequest(
    `/payment_intents/${task.payment_intent_id}/capture`,
    'POST',
    env.STRIPE_SECRET_KEY,
    {}
  );
  
  // 更新支付状态
  await env.DB
    .prepare(`
      UPDATE tasks 
      SET payment_status = 'captured'
      WHERE id = ?
    `)
    .bind(task_id)
    .run();
  
  // 记录审计日志
  await logAudit(env.DB, {
    task_id,
    action: 'payment_capture',
    actor: 'system',
    actor_type: 'platform',
    details: {
      payment_intent_id: task.payment_intent_id,
      amount: task.budget
    }
  });
  
  // 2. 获取工人的 Stripe Connect 账户
  const worker = await env.DB
    .prepare('SELECT * FROM agents WHERE id = ?')
    .bind(task.worker_id)
    .first<{ id: string; stripe_account_id: string | null }>();
  
  if (!worker) {
    throw new Error('Worker not found');
  }
  
  // If worker doesn't have a Stripe Connect account, skip transfer but still capture
  let worker_account_id = worker.stripe_account_id;
  if (!worker_account_id) {
    console.warn(`Worker ${worker.id} does not have Stripe Connect account — payment captured but transfer deferred`);
    await logAudit(env.DB, {
      task_id,
      action: 'payment_split',
      actor: 'system',
      actor_type: 'platform',
      details: {
        warning: 'Worker has no Stripe Connect account. Transfer deferred.',
        worker_id: worker.id,
        amount: task.budget
      }
    });
  }
  
  // 3. 分账
  const platform_fee_percent = parseInt(env.PLATFORM_FEE_PERCENT || '1');
  const worker_amount = task.budget * (1 - platform_fee_percent / 100);
  const platform_fee = task.budget * (platform_fee_percent / 100);
  
  if (worker_account_id) {
    // 转账给工人
    const transfer = await stripeRequest(
      '/transfers',
      'POST',
      env.STRIPE_SECRET_KEY,
      {
        amount: Math.round(worker_amount * 100).toString(),
        currency: 'usd',
        destination: worker_account_id,
        'metadata[task_id]': task_id,
        'metadata[worker_id]': task.worker_id as string
      }
    );
    
    console.log('Transfer to worker:', transfer.id);
  }
  
  // 记录审计日志
  await logAudit(env.DB, {
    task_id,
    action: 'payment_split',
    actor: 'system',
    actor_type: 'platform',
    details: {
      total_amount: task.budget,
      worker_amount,
      platform_fee,
      platform_fee_percent,
      worker_account_id: worker_account_id || 'not_configured'
    }
  });
}

/**
 * 取消任务支付（退款）
 */
export async function refundTask(
  env: Env,
  task_id: string,
  reason: string = 'Task cancelled'
): Promise<void> {
  // 获取任务信息
  const task = await env.DB
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .bind(task_id)
    .first<{ id: string; payment_intent_id: string; payment_status: string; budget: number }>();
  
  if (!task) {
    throw new Error('Task not found');
  }
  
  if (!task.payment_intent_id) {
    throw new Error('No payment intent found for this task');
  }
  
  // 如果还未扣款（held 状态），直接取消
  if (task.payment_status === 'held') {
    await stripeRequest(
      `/payment_intents/${task.payment_intent_id}/cancel`,
      'POST',
      env.STRIPE_SECRET_KEY,
      {}
    );
  } else if (task.payment_status === 'captured') {
    // 如果已扣款，创建退款
    await stripeRequest(
      '/refunds',
      'POST',
      env.STRIPE_SECRET_KEY,
      {
        payment_intent: task.payment_intent_id,
        reason: 'requested_by_customer'
      }
    );
  }
  
  // 更新支付状态
  await env.DB
    .prepare(`
      UPDATE tasks 
      SET payment_status = 'refunded'
      WHERE id = ?
    `)
    .bind(task_id)
    .run();
  
  // 记录审计日志
  await logAudit(env.DB, {
    task_id,
    action: 'payment_refund',
    actor: 'system',
    actor_type: 'platform',
    details: {
      payment_intent_id: task.payment_intent_id,
      amount: task.budget,
      reason
    }
  });
}

/**
 * Verify Stripe Webhook signature using v1 scheme (HMAC-SHA256).
 * Compatible with Cloudflare Workers (Web Crypto API).
 *
 * Stripe sends header: Stripe-Signature: t=<timestamp>,v1=<signature>
 * Signed payload = "<timestamp>.<body>"
 *
 * Tolerance: reject events older than 5 minutes to prevent replay attacks.
 */
export async function verifyWebhookSignature(
  payload: string,
  signatureHeader: string,
  webhook_secret: string
): Promise<boolean> {
  const TOLERANCE_SECONDS = 300; // 5 minutes

  // Parse the Stripe-Signature header
  const parts = signatureHeader.split(',');
  const timestampStr = parts.find(p => p.startsWith('t='))?.slice(2);
  const signatureHex = parts.find(p => p.startsWith('v1='))?.slice(3);

  if (!timestampStr || !signatureHex) {
    return false;
  }

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return false;
  }

  // Check timestamp tolerance (prevent replay attacks)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > TOLERANCE_SECONDS) {
    return false;
  }

  // Compute expected signature: HMAC-SHA256(webhook_secret, "<timestamp>.<payload>")
  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhook_secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signedPayload)
  );

  const expectedHex = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Timing-safe comparison
  if (expectedHex.length !== signatureHex.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < expectedHex.length; i++) {
    mismatch |= expectedHex.charCodeAt(i) ^ signatureHex.charCodeAt(i);
  }
  return mismatch === 0;
}
