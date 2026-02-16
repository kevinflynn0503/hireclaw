/**
 * Newsletter subscription routes
 *
 * POST /v1/newsletter/subscribe  — Subscribe with email
 * POST /v1/newsletter/unsubscribe — Unsubscribe
 * GET  /v1/newsletter/stats       — Get subscriber count (public)
 */

import { Hono } from 'hono';
import { generateId } from '../services/id';
import type { Env } from '../types';

const newsletter = new Hono<{ Bindings: Env }>();

// Email validation regex
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// ============================================
// POST /subscribe — Subscribe to newsletter
// ============================================
newsletter.post('/subscribe', async (c) => {
  const body = await c.req.json<{
    email?: string;
    name?: string;
    locale?: string;
    source?: string;
  }>();

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return c.json({ success: false, error: 'Valid email is required' }, 400);
  }

  const name = body.name?.trim() || null;
  const locale = body.locale === 'zh' ? 'zh' : 'en';
  const source = body.source || 'website';

  // Check if already subscribed
  const existing = await c.env.DB
    .prepare('SELECT id, status FROM newsletter_subscribers WHERE email = ?')
    .bind(email)
    .first<{ id: string; status: string }>();

  if (existing) {
    if (existing.status === 'active') {
      return c.json({ success: true, data: { message: 'Already subscribed', id: existing.id } });
    }
    // Re-subscribe
    await c.env.DB
      .prepare('UPDATE newsletter_subscribers SET status = ?, unsubscribed_at = NULL, locale = ?, name = ? WHERE id = ?')
      .bind('active', locale, name, existing.id)
      .run();

    return c.json({ success: true, data: { message: 'Welcome back!', id: existing.id } });
  }

  // New subscriber
  const id = generateId('nl');
  const now = new Date().toISOString();

  await c.env.DB
    .prepare(`
      INSERT INTO newsletter_subscribers (id, email, name, locale, status, subscribed_at, source)
      VALUES (?, ?, ?, ?, 'active', ?, ?)
    `)
    .bind(id, email, name, locale, now, source)
    .run();

  return c.json({
    success: true,
    data: {
      message: 'Successfully subscribed!',
      id,
    }
  }, 201);
});

// ============================================
// POST /unsubscribe — Unsubscribe from newsletter
// ============================================
newsletter.post('/unsubscribe', async (c) => {
  const body = await c.req.json<{ email?: string }>();
  const email = body.email?.trim().toLowerCase();

  if (!email || !EMAIL_RE.test(email)) {
    return c.json({ success: false, error: 'Valid email is required' }, 400);
  }

  const result = await c.env.DB
    .prepare('UPDATE newsletter_subscribers SET status = ?, unsubscribed_at = ? WHERE email = ? AND status = ?')
    .bind('unsubscribed', new Date().toISOString(), email, 'active')
    .run();

  if (!result.meta.changes || result.meta.changes === 0) {
    return c.json({ success: false, error: 'Email not found or already unsubscribed' }, 404);
  }

  return c.json({ success: true, data: { message: 'Successfully unsubscribed' } });
});

// ============================================
// GET /stats — Public subscriber count
// ============================================
newsletter.get('/stats', async (c) => {
  const result = await c.env.DB
    .prepare('SELECT COUNT(*) as count FROM newsletter_subscribers WHERE status = ?')
    .bind('active')
    .first<{ count: number }>();

  return c.json({
    success: true,
    data: { subscribers: result?.count || 0 }
  });
});

export default newsletter;
