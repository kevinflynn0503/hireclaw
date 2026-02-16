/**
 * Webhook 路由
 * 
 * 处理 Stripe Webhook 事件
 */

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { verifyWebhookSignature } from '../services/stripe';
import { logAudit } from '../services/audit';
import type { Env } from '../types';

const webhooks = new Hono<{ Bindings: Env }>();

// ============================================
// POST /webhooks/stripe - Stripe Webhook
// ============================================
webhooks.post('/stripe', async (c) => {
  const signature = c.req.header('stripe-signature');
  if (!signature) {
    throw new HTTPException(400, { message: 'Missing stripe-signature header' });
  }
  
  const payload = await c.req.text();
  
  // Verify signature (async — uses Web Crypto HMAC-SHA256)
  const is_valid = await verifyWebhookSignature(
    payload,
    signature,
    c.env.STRIPE_WEBHOOK_SECRET
  );
  
  if (!is_valid) {
    throw new HTTPException(401, { message: 'Invalid webhook signature' });
  }
  
  // 解析事件
  const event = JSON.parse(payload);
  
  console.log('Stripe webhook event:', event.type);
  
  // 处理不同类型的事件
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(c.env, event.data.object);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(c.env, event.data.object);
      break;
      
    case 'charge.refunded':
      await handleChargeRefunded(c.env, event.data.object);
      break;
      
    case 'transfer.created':
      await handleTransferCreated(c.env, event.data.object);
      break;
      
    default:
      console.log('Unhandled webhook event type:', event.type);
  }
  
  return c.json({ received: true });
});

/**
 * 处理支付成功事件
 */
async function handlePaymentIntentSucceeded(env: Env, payment_intent: any) {
  const task_id = payment_intent.metadata?.task_id;
  if (!task_id) {
    console.warn('Payment intent has no task_id metadata');
    return;
  }
  
  // 更新任务支付状态
  await env.DB
    .prepare(`
      UPDATE tasks 
      SET payment_status = 'captured'
      WHERE id = ? AND payment_intent_id = ?
    `)
    .bind(task_id, payment_intent.id)
    .run();
  
  console.log(`Payment succeeded for task ${task_id}`);
}

/**
 * 处理支付失败事件
 */
async function handlePaymentIntentFailed(env: Env, payment_intent: any) {
  const task_id = payment_intent.metadata?.task_id;
  if (!task_id) {
    console.warn('Payment intent has no task_id metadata');
    return;
  }
  
  // 记录审计日志
  await logAudit(env.DB, {
    task_id,
    action: 'payment_capture',
    actor: 'system',
    actor_type: 'platform',
    details: {
      status: 'failed',
      payment_intent_id: payment_intent.id,
      error: payment_intent.last_payment_error?.message
    }
  });
  
  console.error(`Payment failed for task ${task_id}:`, payment_intent.last_payment_error);
}

/**
 * 处理退款事件
 */
async function handleChargeRefunded(env: Env, charge: any) {
  const payment_intent_id = charge.payment_intent;
  
  // 查找任务
  const task = await env.DB
    .prepare('SELECT * FROM tasks WHERE payment_intent_id = ?')
    .bind(payment_intent_id)
    .first();
  
  if (!task) {
    console.warn('No task found for payment intent:', payment_intent_id);
    return;
  }
  
  // 更新支付状态
  await env.DB
    .prepare(`
      UPDATE tasks 
      SET payment_status = 'refunded'
      WHERE id = ?
    `)
    .bind(task.id)
    .run();
  
  console.log(`Refund processed for task ${task.id}`);
}

/**
 * 处理转账创建事件
 */
async function handleTransferCreated(_env: Env, transfer: any) {
  const task_id = transfer.metadata?.task_id;
  if (!task_id) {
    console.warn('Transfer has no task_id metadata');
    return;
  }
  
  console.log(`Transfer created for task ${task_id}:`, transfer.id);
}

export default webhooks;
