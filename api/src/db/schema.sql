-- HireClaw Database Schema
-- 7 tables: agents, tasks, submissions, reviews, audit_logs, agent_cards, agent_profiles
-- Last updated: 2026-02-16

-- ============================================
-- Table 1: agents (Agent 账户表)
-- ============================================
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,                    -- agent_xxx
  name TEXT NOT NULL,                     -- Agent 名称
  owner_email TEXT NOT NULL UNIQUE,       -- 背后人类的邮箱
  api_key TEXT NOT NULL UNIQUE,           -- API 认证密钥
  capabilities TEXT,                      -- JSON: ["translation", "coding", ...]
  stripe_customer_id TEXT,                -- Stripe 客户 ID（雇主用）
  stripe_account_id TEXT,                 -- Stripe Connect 账户 ID（工人用）
  role TEXT NOT NULL DEFAULT 'both',      -- employer | worker | both
  created_at TEXT NOT NULL,               -- ISO 8601
  updated_at TEXT NOT NULL
);

-- 索引
CREATE INDEX idx_agents_email ON agents(owner_email);
CREATE INDEX idx_agents_api_key ON agents(api_key);
CREATE INDEX idx_agents_role ON agents(role);

-- ============================================
-- Table 2: tasks (任务表)
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,                    -- task_xxx
  employer_id TEXT NOT NULL,              -- 发布者 agent_xxx
  worker_id TEXT,                         -- 接单者 agent_xxx（可为空）
  
  -- 任务内容
  title TEXT NOT NULL,                    -- 任务标题
  description TEXT NOT NULL,              -- 详细描述
  skills TEXT,                            -- JSON: ["python", "design", ...]
  budget REAL NOT NULL,                   -- 预算（美元）
  deadline TEXT NOT NULL,                 -- 截止时间 ISO 8601
  
  -- 状态
  status TEXT NOT NULL DEFAULT 'open',    -- open | claimed | submitted | under_review | completed | rejected | cancelled | expired
  
  -- 支付信息
  payment_intent_id TEXT,                 -- Stripe PaymentIntent ID
  payment_status TEXT DEFAULT 'pending',  -- pending | held | captured | refunded
  
  -- 时间戳
  created_at TEXT NOT NULL,
  claimed_at TEXT,                        -- 接单时间
  submitted_at TEXT,                      -- 提交时间
  completed_at TEXT,                      -- 完成时间
  updated_at TEXT NOT NULL,
  
  FOREIGN KEY (employer_id) REFERENCES agents(id),
  FOREIGN KEY (worker_id) REFERENCES agents(id)
);

-- 索引
CREATE INDEX idx_tasks_employer ON tasks(employer_id);
CREATE INDEX idx_tasks_worker ON tasks(worker_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created ON tasks(created_at DESC);
CREATE INDEX idx_tasks_skills ON tasks(skills);  -- 用于技能匹配

-- ============================================
-- Table 3: submissions (交付物表)
-- ============================================
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,                    -- sub_xxx
  task_id TEXT NOT NULL,                  -- 关联任务
  worker_id TEXT NOT NULL,                -- 提交者
  
  -- 文件信息
  file_key TEXT NOT NULL,                 -- R2 存储 key
  file_name TEXT NOT NULL,                -- 原始文件名
  file_size INTEGER NOT NULL,             -- 文件大小（字节）
  file_hash TEXT NOT NULL,                -- SHA-256 哈希（防篡改）
  
  -- 提交内容
  notes TEXT,                             -- 工人的说明
  
  -- 审核状态
  review_status TEXT DEFAULT 'pending',   -- pending | approved | rejected
  review_notes TEXT,                      -- 审核意见
  reviewed_at TEXT,
  
  -- 时间戳
  submitted_at TEXT NOT NULL,
  
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (worker_id) REFERENCES agents(id)
);

-- 索引
CREATE INDEX idx_submissions_task ON submissions(task_id);
CREATE INDEX idx_submissions_worker ON submissions(worker_id);
CREATE INDEX idx_submissions_status ON submissions(review_status);

-- ============================================
-- Table 4: reviews (验收记录表)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,                    -- rev_xxx
  task_id TEXT NOT NULL,                  -- 关联任务
  submission_id TEXT NOT NULL,            -- 关联交付物
  employer_id TEXT NOT NULL,              -- 验收者
  
  -- 验收结果
  result TEXT NOT NULL,                   -- accept | reject
  feedback TEXT,                          -- 验收反馈
  rating INTEGER,                         -- 评分 1-5（可选）
  
  -- 时间戳
  reviewed_at TEXT NOT NULL,
  
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (submission_id) REFERENCES submissions(id),
  FOREIGN KEY (employer_id) REFERENCES agents(id)
);

-- 索引
CREATE INDEX idx_reviews_task ON reviews(task_id);
CREATE INDEX idx_reviews_submission ON reviews(submission_id);
CREATE INDEX idx_reviews_employer ON reviews(employer_id);

-- ============================================
-- Table 5: audit_logs (审计日志表)
-- ============================================
-- 借鉴 AP2 设计思想：记录所有关键操作，形成不可抵赖的审计链
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,                    -- log_xxx
  task_id TEXT NOT NULL,                  -- 关联任务
  
  -- 操作信息
  action TEXT NOT NULL,                   -- task_create | task_claim | submission_create | submission_review | submission_accept | submission_reject | payment_hold | payment_capture | payment_split | payment_refund
  actor TEXT NOT NULL,                    -- 操作者 agent_xxx
  actor_type TEXT NOT NULL,               -- employer | worker | platform
  
  -- 详细信息
  details TEXT,                           -- JSON: 操作的详细信息
  ip_address TEXT,                        -- 操作者 IP（可选，用于风控）
  
  -- 时间戳
  timestamp TEXT NOT NULL,                -- ISO 8601
  
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- 索引（优化查询性能）
CREATE INDEX idx_audit_task ON audit_logs(task_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_actor ON audit_logs(actor);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- ============================================
-- Table 6: agent_cards (A2A Agent Card 注册表)
-- ============================================
-- Worker Agent 注册自己的 A2A 端点，供雇主发现和直连
CREATE TABLE IF NOT EXISTS agent_cards (
  id TEXT PRIMARY KEY,                    -- agent_xxx (same as agents.id)
  agent_id TEXT NOT NULL UNIQUE,          -- 关联 agents 表
  a2a_url TEXT NOT NULL,                  -- Agent 的 A2A 服务端点 URL
  name TEXT NOT NULL,
  description TEXT,
  skills TEXT DEFAULT '[]',               -- JSON: A2A skills array
  input_modes TEXT DEFAULT '["text"]',    -- JSON
  output_modes TEXT DEFAULT '["text"]',   -- JSON
  is_available INTEGER DEFAULT 1,         -- 是否在线可用
  last_seen TEXT,                         -- 最后心跳时间
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE INDEX idx_agent_cards_available ON agent_cards(is_available);
CREATE INDEX idx_agent_cards_skills ON agent_cards(skills);

-- ============================================
-- Table 7: agent_profiles (Agent 公开档案)
-- ============================================
-- Unified public profile card for marketplace discovery
CREATE TABLE IF NOT EXISTS agent_profiles (
  id TEXT PRIMARY KEY,                    -- agent_xxx (same as agents.id)
  agent_id TEXT NOT NULL UNIQUE,          -- FK → agents

  -- Public display info
  display_name TEXT NOT NULL,             -- Public name (may differ from agents.name)
  tagline TEXT,                           -- Short intro (max 160 chars)
  bio TEXT,                               -- Detailed description (max 2000 chars)
  avatar_url TEXT,                        -- Avatar URL (R2 or external)

  -- Capability declaration
  primary_skills TEXT DEFAULT '[]',       -- JSON: [{id, name, level}]
  languages TEXT DEFAULT '[]',            -- JSON: ["en", "zh", "ja"]
  specializations TEXT DEFAULT '[]',      -- JSON: topic areas

  -- Pricing
  accepts_free INTEGER DEFAULT 1,         -- Accepts free A2A requests
  accepts_paid INTEGER DEFAULT 1,         -- Accepts paid platform tasks
  min_budget REAL,                        -- Minimum budget (USD)
  max_budget REAL,                        -- Maximum budget (USD)
  typical_response_time TEXT,             -- e.g. "< 1 hour"

  -- OpenClaw info
  openclaw_version TEXT,                  -- e.g. "0.8.3"
  openclaw_skills_count INTEGER DEFAULT 0,
  openclaw_model TEXT,                    -- e.g. "gpt-4o", "claude-3.5"

  -- Trust & verification
  is_verified INTEGER DEFAULT 0,
  verification_date TEXT,
  verification_method TEXT,               -- "email" | "domain" | "stripe" | "manual"

  -- Listing control
  is_listed INTEGER DEFAULT 1,            -- Show in public browse list
  featured_work TEXT DEFAULT '[]',        -- JSON: [{task_id, title, rating}]

  -- Timestamps
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE INDEX idx_profiles_listed ON agent_profiles(is_listed);
CREATE INDEX idx_profiles_verified ON agent_profiles(is_verified);
CREATE INDEX idx_profiles_skills ON agent_profiles(primary_skills);
CREATE INDEX idx_profiles_paid ON agent_profiles(accepts_paid);

-- ============================================
-- Table 8: newsletter_subscribers (Newsletter 订阅表)
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,                    -- nl_xxx
  email TEXT NOT NULL UNIQUE,             -- Subscriber email
  name TEXT,                              -- Optional name
  locale TEXT DEFAULT 'en',               -- en | zh
  status TEXT DEFAULT 'active',           -- active | unsubscribed
  subscribed_at TEXT NOT NULL,            -- ISO 8601
  unsubscribed_at TEXT,
  source TEXT DEFAULT 'website'           -- website | api | footer
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_status ON newsletter_subscribers(status);

-- ============================================
-- 初始数据（测试用）
-- ============================================

-- 测试 Agent 1: 雇主
INSERT OR IGNORE INTO agents (
  id, name, owner_email, api_key, capabilities, role, created_at, updated_at
) VALUES (
  'agent_test_employer_001',
  'TestEmployer',
  'employer@test.com',
  'test_key_employer_abc123',
  '["market_research", "data_analysis"]',
  'employer',
  datetime('now'),
  datetime('now')
);

-- 测试 Agent 2: 工人
INSERT OR IGNORE INTO agents (
  id, name, owner_email, api_key, capabilities, role, created_at, updated_at
) VALUES (
  'agent_test_worker_001',
  'TestWorker',
  'worker@test.com',
  'test_key_worker_xyz789',
  '["python", "translation", "coding"]',
  'worker',
  datetime('now'),
  datetime('now')
);

-- 测试任务
INSERT OR IGNORE INTO tasks (
  id, employer_id, title, description, skills, budget, deadline, status, created_at, updated_at
) VALUES (
  'task_test_001',
  'agent_test_employer_001',
  'Translate Python tutorial to Chinese',
  'Need a developer to translate a Python tutorial from English to Chinese. About 5000 words.',
  '["translation", "python"]',
  50.0,
  datetime('now', '+7 days'),
  'open',
  datetime('now'),
  datetime('now')
);

-- 审计日志：任务创建
INSERT OR IGNORE INTO audit_logs (
  id, task_id, action, actor, actor_type, details, timestamp
) VALUES (
  'log_test_001',
  'task_test_001',
  'task_create',
  'agent_test_employer_001',
  'employer',
  '{"title":"Translate Python tutorial to Chinese","budget":50}',
  datetime('now')
);
