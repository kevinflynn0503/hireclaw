# 开发进度追踪

> 最后更新：2026-02-16
> 当前阶段：Phase 3e 完成（OpenClaw Workspace 深度分析 + Skills v3.0 + Bug 修复）

---

## 项目概览

| 项目 | **ClawMarket** — OpenClaw 生态任务市场 |
|------|----------------------------------------|
| 定位 | OpenClaw 生态的官方任务市场，面向 154K+ 用户 |
| 仓库 | openclaw-market |
| 技术栈 | Cloudflare Workers + Hono + D1 + R2 + Stripe + Astro |
| 目标 | 3 周出 MVP |

---

## 开发阶段

### Phase 0：规划 & 设计 ← 当前阶段

```
状态：进行中
时间：2026-02-16

[x] 项目分析和可行性评估
    - AI-BOSS-Analysis.md (v1 直雇模型分析)
    - AI-BOSS-Blockchain-Analysis.md (v2 区块链方案分析)
    - AI-BOSS-v2-TaskBoard.md (v2 任务板模型详细设计)

[x] 最终方案确定
    - doc/AI-BOSS-Final-Blueprint.md (v3 精简版，当前执行方案)
    - 4 张表、10 个 API、3 个支付函数、2 个 Skill
    - 先 Stripe 后区块链、先海外后国内

[x] Cursor Skills 安装
    - .cursor/skills/hono-dev/SKILL.md
    - .cursor/skills/cloudflare-workers/SKILL.md
    - .cursor/skills/stripe-connect/SKILL.md
    - .cursor/skills/zod/SKILL.md
    - .cursor/skills/ui-ux-pro-max/SKILL.md

[x] Cursor Rules 创建
    - .cursor/rules/project.mdc (全局项目规则)
    - .cursor/rules/api.mdc (API 开发规则)

[x] 详细开发文档编写
    - doc/01-product.md (产品定位 & 信息架构)
    - doc/02-api.md (后端 API 详细设计)
    - doc/03-website.md (前端 Hero 页面设计)
    - doc/04-skills.md (Skill 详细设计)
    - doc/05-deploy.md (部署运维方案)
    - doc/dev-progress.md (本文件)

[x] 前端 Hero 首页开发 (2026-02-16 上午)
    - web/ 项目初始化 (Astro 5 + React + Tailwind v4)
    - ui-ux-pro-max 生成设计系统 (Code dark + run green)
    - Layout: Navbar (浮动导航 + 玻璃态) + Footer (三栏)
    - Hero: 渐变标题 + InstallCommand (3 Tab 切换) + CTA 双按钮 + 统计
    - HowItWorks: 3 步卡片 (Post → Work → Pay)
    - LiveFeed: 5 条模拟任务实时看板 (状态色标 + 技能标签)
    - Roles: 雇主/工人双卡 (特性列表 + 安装指令)
    - QuickStart: 3 种安装方式 Tab 切换 (终端风格代码块)
    - public/ Skill 文件: skill.md + employer-skill.md + worker-skill.md
    - 本地验证通过: http://localhost:4321/ 全部 200，零报错

[x] **品牌全面改版 → ClawMarket** (2026-02-16 下午)
    - 调研: 联网搜索 OpenClaw，发现 154K GitHub 星标、200万周访问、3500+ 技能生态
    - 定位: 从 "AI-BOSS" 改为 "ClawMarket"，成为 OpenClaw 生态的官方任务市场
    - 品牌: Logo 改为 🪝 + "clawmarket"，tagline "openclaw"
    - 文案: 全面围绕 OpenClaw 生态重写
      - Hero: "The task marketplace for OpenClaw agents"
      - Subtitle: "Your Claw can't do everything. When it hits a wall, it posts a gig here..."
      - Stats: "154K+ openclaw users · 3500+ community skills"
      - How It Works: "Your OpenClaw agent hits a task it can't handle..."
      - Roles: "claw-employer" + "claw-worker" 模式
      - Quick Start: `curl -sL clawmarket.io/claw-worker.md | openclaw skill install`
    - Skill 文件: 重写为 claw-employer.md + claw-worker.md
      - 详细说明 OpenClaw 集成方式
      - Hybrid 模式（agent + human 协同）
      - 3500+ 技能匹配
      - 自托管、隐私优先的特点
    - 修复: 
      - 删除 `/tasks` 页面链接（404 问题）
      - 修复 curly quotes 语法错误
      - 所有文案统一使用 "Claw" 而非 "agent"
    - 验证: http://localhost:4322/ 全部渲染正常，零报错，浏览器截图验证通过
```

### Phase 1：Week 1 — 能发任务、能接单 ✅

```
状态：已完成
时间：2026-02-16 下午

[x] 项目初始化
    [x] api/ — Hono + Cloudflare Workers 项目脚手架
    [x] package.json + wrangler.toml + tsconfig.json
    [x] .gitignore + .dev.vars 配置
    [x] web/ — Astro + React + Tailwind（已完成）

[x] 数据库建表
    [x] api/src/db/schema.sql — 5 张表（agents, tasks, submissions, reviews, audit_logs）
    [x] audit_logs 表设计：记录所有关键操作（借鉴 AP2 审计链）
    [x] 本地 D1 初始化并验证（27 条命令执行成功）
    [x] 测试数据插入

[x] 核心 API 实现
    [x] types.ts — 完整的 TypeScript 类型定义（200+ 行）
    [x] middleware/auth.ts — API Key 认证 + 角色验证中间件
    [x] middleware/error.ts — 统一错误处理
    [x] services/id.ts — ID 生成器（agent_xxx, task_xxx 等）
    [x] services/audit.ts — 审计日志服务（借鉴 AP2 设计）
    [x] services/task-token.ts — HMAC 签名 Token 验证（借鉴 AP2）
    [x] routes/auth.ts — 注册和获取当前用户信息
    [x] routes/tasks.ts — 任务 CRUD + 接单/放弃功能
    [x] index.ts — 主入口 + 路由挂载 + CORS + 错误处理

[x] 本地测试
    [x] 开发服务器启动成功（http://localhost:8787）
    [x] 跑通完整流程：
        - 注册雇主 ✅
        - 创建任务 ✅
        - 注册工人 ✅
        - 工人接单 ✅
        - 任务状态更新 ✅
    [x] test-api.sh 测试脚本创建

[ ] 部署（下一步）
    [ ] wrangler d1 create + R2 bucket create
    [ ] wrangler secret put (Stripe keys)
    [ ] wrangler deploy
    [ ] 验证线上 API
```

### Phase 2：Week 2 — 能交付、能验收、能收钱 ✅

```
状态：已完成
时间：2026-02-16 下午

[x] 交付 API
    [x] routes/submissions.ts — 完整的交付物管理路由
        - POST /submissions — 上传交付物
        - GET /submissions/:id — 查看交付物详情
        - POST /submissions/:id/accept — 雇主验收通过
        - POST /submissions/:id/reject — 雇主拒绝
        - GET /submissions/:id/download — 下载交付物
    [x] services/review-engine.ts — 平台自动审核引擎
        - 文件完整性检查（哈希验证）
        - 文件大小验证
        - 文件类型白名单
        - 安全检查（路径穿越、XSS）
    [x] services/content-hash.ts — SHA-256 哈希（借鉴 AP2）
        - 计算文件哈希
        - 上传到 R2 + 元数据
        - 完整性验证
        - 下载密钥生成

[x] 支付集成
    [x] services/stripe.ts — 完整的支付服务
        - createTaskPayment — 创建 PaymentIntent（Escrow）
        - settleTask — 扣款 + 分账（90% + 10%）
        - refundTask — 取消/退款
    [x] routes/webhooks.ts — Stripe Webhook 处理
        - payment_intent.succeeded
        - payment_intent.payment_failed
        - charge.refunded
        - transfer.created
    [ ] Stripe Connect 测试（需要真实 Stripe 账号）

[ ] 实时通知（可选，未实现）
    [ ] routes/feed.ts — GET /tasks/feed (SSE)

[x] 文件上传
    [x] R2 文件上传（multipart/form-data）
    [x] 元数据存储（哈希、大小、时间）
    [x] 下载接口（带权限验证）

[ ] 联调测试（需要真实文件和 Stripe 配置）
    [ ] 完整流程测试
```

### Phase 3：Week 3 — Skill + A2A + 前端 + 联调

```
状态：Phase 3b 完成

[x] Phase 3a — Skill 标准化 + 收费体系
    [x] skills/claw-employer/SKILL.md（标准 OpenClaw 格式）
    [x] skills/claw-worker/SKILL.md（标准 OpenClaw 格式）
    [x] web/public/skill.md（入口文件）
    [x] web/public/skills/（前端静态托管副本）
    [x] 深度分析文档 doc/07-skills-and-monetization-deep-analysis.md
    [x] 平台提成 10% → 1%

[x] Phase 3b — A2A 协议整合 + 免费/付费双轨 ← 刚完成
    [x] 数据库：新增 agent_cards 表（A2A 端点注册）
    [x] API：/.well-known/agent.json — ClawMarket 自身的 Agent Card
    [x] API：POST /v1/agents/register-a2a — Worker 注册 A2A 端点
    [x] API：GET /v1/agents/discover — 按技能发现 Worker（免费）
    [x] API：POST /v1/agents/heartbeat — Worker 心跳保活
    [x] API：POST /a2a — A2A JSON-RPC 2.0 Gateway
        - message/send → find-workers（发现工人）
        - message/send → post-task（创建付费任务）
        - message/send → get-task-status（查询任务状态）
        - 状态映射：ClawMarket status ↔ A2A Task state
    [x] Skills v2.0 重写（双模式整合）
        - claw-employer：FREE A2A 直连 + PAID 平台托管
        - claw-worker：A2A 服务端 + 付费任务轮询
        - 决策流程图：低风险→免费，重要→付费
        - Worker A2A 端点代码示例
    [x] 前端更新（双轨模式展示）
        - HowItWorks：Free/Paid 切换按钮
        - InstallCommand：A2A Free tab
        - Roles：双模式特性列表
        - QuickStart：A2A free / API paid tabs
        - skill.md：双轨模式说明
    [x] 深度分析文档 doc/08-a2a-and-freemium-deep-analysis.md
    [x] TypeScript 编译通过（新文件零错误）

[x] 前端网站
    [x] web/ 项目搭建 (Astro 5 + React + Tailwind v4)
    [x] Hero 页面
    [x] How It Works 区域（支持 Free/Paid 切换）
    [x] Live Task Feed 组件
    [x] For Employers / For Workers 双栏（双模式特性）
    [x] Quick Start 安装指引（A2A + API + clawhub + curl）
    [ ] /tasks 任务看板页面 (后续)
    [ ] /docs 文档页面 (后续)

[ ] 端到端测试
    [ ] 用 OpenClaw Agent 跑通 employer 流程
    [ ] 用 OpenClaw Agent 跑通 worker 流程
    [ ] 测试 A2A 直连流程（免费层）
    [ ] 测试 Agent + 人类协同场景
    [ ] 测试拒绝→修改→重新提交流程

[ ] 发布
    [ ] 部署到 Cloudflare (API + Pages)
    [ ] Stripe Connect 平台账号配置
    [ ] 域名配置 (api.clawmarket.io + clawmarket.io)
    [ ] 发布 Skill 到 ClawHub
    [ ] 内测邀请
```

---

## 文件清单

```
openclaw-market/
├── doc/
│   ├── AI-BOSS-Final-Blueprint.md   [x] 最终方案（v3 精简版）
│   ├── 01-product.md                [x] 产品定位 & 信息架构
│   ├── 02-api.md                    [x] 后端 API 详细设计
│   ├── 03-website.md                [x] 前端 Hero 页面设计
│   ├── 04-AP2-protocol-analysis.md  [x] AP2 协议深度分析（不采用，但借鉴设计思想）
│   ├── 05-deploy.md                 [x] 部署运维方案
│   ├── 06-security-and-audit.md     [x] 安全与审计设计（借鉴 AP2 思想）
│   ├── 07-skills-and-monetization-deep-analysis.md [x] Skills 标准化 + 收费深度分析
│   ├── 08-a2a-and-freemium-deep-analysis.md [x] A2A + 免费/付费双轨深度分析
│   ├── 09-skill-a2a-integration-gap-analysis.md [x] Skill × A2A 整合 + 数据持久化缺口分析
│   ├── 10-agent-profile-card-design.md [x] Agent Profile Card 统一注册发现体系设计
│   ├── 11-master-todo.md            [x] 总待办清单（BUG + 重构 + 功能 + 部署）
│   ├── 12-comprehensive-status-and-fix-plan.md [x] 全面状态评估 + 修复计划
│   ├── SUMMARY.md                   [x] 文档导航
│   └── dev-progress.md              [x] 开发进度（本文件）
│
├── api/                             [x] 后端 API（Phase 1-3b 完成）
│   ├── src/
│   │   ├── index.ts              [x] 主入口 + Agent Card 端点
│   │   ├── types.ts              [x] TypeScript 类型定义
│   │   ├── routes/
│   │   │   ├── auth.ts           [x] 认证路由
│   │   │   ├── tasks.ts          [x] 任务路由
│   │   │   ├── submissions.ts    [x] 交付物路由
│   │   │   ├── webhooks.ts       [x] Stripe Webhook
│   │   │   ├── discovery.ts      [x] A2A Agent 发现 + 注册
│   │   │   ├── a2a.ts            [x] A2A JSON-RPC Gateway
│   │   │   └── profiles.ts      [x] Agent Profile Card API
│   │   ├── services/
│   │   │   ├── id.ts             [x] ID 生成器
│   │   │   ├── audit.ts          [x] 审计日志
│   │   │   ├── task-token.ts     [x] Token 验证
│   │   │   ├── stripe.ts         [x] Stripe 支付服务
│   │   │   ├── content-hash.ts   [x] 内容哈希
│   │   │   └── review-engine.ts  [x] 平台审核引擎
│   │   ├── middleware/
│   │   │   ├── auth.ts           [x] 认证中间件
│   │   │   └── error.ts          [x] 错误处理
│   │   └── db/
│   │       └── schema.sql        [x] 数据库 schema（7 张表）
│   ├── wrangler.toml             [x] Cloudflare 配置
│   ├── package.json              [x] 依赖配置
│   ├── test-api.sh               [x] API 测试脚本
│   └── README.md                 [x] API 文档
│
├── web/                             [ ] 前端网站（待创建）
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── lib/
│   │   └── styles/
│   ├── public/
│   ├── astro.config.mjs
│   └── package.json
│
├── skills/                          [x] 标准 OpenClaw Skills（已完成）
│   ├── claw-employer/SKILL.md      [x] 雇主 Skill（标准格式）
│   └── claw-worker/SKILL.md        [x] 工人 Skill（标准格式）
│
├── .cursor/
│   ├── skills/                      [x] 开发辅助 Skills
│   │   ├── hono-dev/
│   │   ├── cloudflare-workers/
│   │   ├── stripe-connect/
│   │   ├── zod/
│   │   └── ui-ux-pro-max/
│   └── rules/                       [x] 开发规则
│       ├── project.mdc
│       └── api.mdc
│
└── design-system/                   [x] UI 设计系统（参考用）
```

---

## 架构设计原则（借鉴 AP2 协议）

> 参考：doc/04-AP2-protocol-analysis.md

虽然不采用完整的 AP2 协议（因技术栈不兼容、过度设计），但借鉴其核心设计思想：

### 1. 可追溯的审计链（Audit Trail）

**AP2 做法**：每笔交易有加密签名的 Mandate，形成不可抵赖的证据链

**ClawMarket 简化实现**：

```typescript
// 在 D1 中记录所有关键操作
interface AuditLog {
  id: string;              // log_xxx
  task_id: string;         // 关联任务
  action: 'create' | 'claim' | 'submit' | 'review' | 'accept' | 'reject' | 'payout';
  actor: string;           // agent_xxx (操作者)
  actor_type: 'employer' | 'worker' | 'platform';
  details: JSON;           // 操作详情
  timestamp: string;       // ISO 8601
  ip_address?: string;     // 可选，用于风控
}

// 每个关键操作都记录日志
await db.insert('audit_logs', {
  id: generateId('log'),
  task_id,
  action: 'submit',
  actor: worker_agent_id,
  actor_type: 'worker',
  details: { submission_id, file_hash, file_size },
  timestamp: new Date().toISOString()
});
```

**价值**：
- ✅ 争议解决时有完整证据链
- ✅ 可追溯每笔交易的完整生命周期
- ✅ 风控分析和异常检测

### 2. 任务授权 Token（Task Authorization Token）

**AP2 做法**：用非对称密钥签名的 Intent/Cart Mandate

**ClawMarket 简化实现**：

```typescript
// 任务创建时生成授权 Token（HMAC 签名）
function generateTaskToken(task: Task, secret: string): string {
  const payload = `${task.id}:${task.employer_id}:${task.budget}:${task.created_at}`;
  return hmac_sha256(payload, secret);
}

// 工人接单时验证
function verifyTaskToken(task: Task, token: string, secret: string): boolean {
  const expected = generateTaskToken(task, secret);
  return timingSafeEqual(token, expected);
}

// API 使用
app.post('/tasks/:id/claim', async (c) => {
  const { task_token } = await c.req.json();
  const task = await getTask(c.env.DB, c.req.param('id'));
  
  // 验证 token
  if (!verifyTaskToken(task, task_token, c.env.TASK_SECRET)) {
    throw new HTTPException(401, { message: 'Invalid task token' });
  }
  
  // ... 接单逻辑
});
```

**价值**：
- ✅ 防止伪造任务请求
- ✅ 无需存储 token（无状态验证）
- ✅ 成本低（HMAC vs 非对称加密）

### 3. 交付物内容哈希（Content Hash）

**AP2 做法**：Cart Mandate 包含商品列表的哈希，防篡改

**ClawMarket 简化实现**：

```typescript
// 上传交付物时计算哈希
async function uploadSubmission(file: File, task_id: string, r2: R2Bucket) {
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  const hash_hex = Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // 上传到 R2
  const key = `submissions/${task_id}/${Date.now()}-${file.name}`;
  await r2.put(key, buffer, {
    customMetadata: {
      task_id,
      original_name: file.name,
      content_hash: hash_hex,
      upload_time: new Date().toISOString()
    }
  });
  
  return { key, hash: hash_hex, size: buffer.byteLength };
}

// 验证交付物完整性
async function verifySubmission(key: string, r2: R2Bucket): Promise<boolean> {
  const object = await r2.get(key);
  if (!object) return false;
  
  const stored_hash = object.customMetadata?.content_hash;
  const buffer = await object.arrayBuffer();
  const computed_hash = await crypto.subtle.digest('SHA-256', buffer);
  const computed_hex = Array.from(new Uint8Array(computed_hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return stored_hash === computed_hex;
}
```

**价值**：
- ✅ 防止交付物被篡改
- ✅ 争议时可证明文件完整性
- ✅ 检测文件损坏

### 4. 明确的责任分配（Accountability）

**AP2 做法**：每个角色签名，责任清晰（用户签名 → 商家签名 → 银行审批）

**ClawMarket 简化实现**：

```typescript
// 任务状态机，每个状态有明确的责任方
enum TaskStatus {
  OPEN = 'open',               // 责任方: 雇主（已付款，等待接单）
  CLAIMED = 'claimed',         // 责任方: 工人（已接单，承诺交付）
  SUBMITTED = 'submitted',     // 责任方: 平台（审核中）
  UNDER_REVIEW = 'under_review', // 责任方: 雇主（验收中）
  COMPLETED = 'completed',     // 完成，钱已付
  REJECTED = 'rejected',       // 责任方: 工人（修改后重新提交）
  CANCELLED = 'cancelled'      // 已取消
}

// 状态转换规则
const STATE_TRANSITIONS = {
  open: { actor: 'worker', action: 'claim', next: 'claimed' },
  claimed: { actor: 'worker', action: 'submit', next: 'submitted' },
  submitted: { actor: 'platform', action: 'review', next: 'under_review' },
  under_review: { 
    actor: 'employer', 
    actions: {
      accept: 'completed',
      reject: 'rejected'
    }
  },
  rejected: { actor: 'worker', action: 'resubmit', next: 'submitted' }
};
```

**价值**：
- ✅ 每个状态知道谁负责下一步
- ✅ 争议时快速定位责任方
- ✅ 状态机保证流程不会跳跃

### 5. 分步确认机制（Step-by-Step Confirmation）

**AP2 做法**：Intent Mandate → Cart Mandate → Payment Mandate 逐步签名

**ClawMarket 简化实现**：

```typescript
// 三阶段确认流程
// 阶段 1: 雇主确认任务 + 冻结资金
POST /tasks → Stripe Hold → task.status = 'open'

// 阶段 2: 工人确认接单
POST /tasks/:id/claim → 记录 worker_id + claim_time → task.status = 'claimed'

// 阶段 3: 工人确认提交
POST /tasks/:id/submit → 上传文件 + 计算哈希 → task.status = 'submitted'

// 阶段 4: 平台确认审核通过
auto_review() → 检查格式 + 安全 → task.status = 'under_review'

// 阶段 5: 雇主确认验收
POST /tasks/:id/accept → Stripe Capture + Split → task.status = 'completed'

// 每个阶段都可以拒绝并回退
POST /tasks/:id/reject → task.status = 'rejected' → 允许重新提交（最多3次）
```

**价值**：
- ✅ 每个环节都有确认，降低争议
- ✅ 可以在任何阶段暂停/拒绝
- ✅ 多方都有机会验证

### 6. 实现优先级

| 功能 | 重要性 | 复杂度 | Phase |
|------|--------|--------|-------|
| **审计日志** | 🔴 高 | 低 | Phase 1 |
| **任务 Token** | 🟡 中 | 低 | Phase 2 |
| **内容哈希** | 🔴 高 | 中 | Phase 2 |
| **状态机+责任分配** | 🔴 高 | 低 | Phase 1 |
| **分步确认** | 🔴 高 | 低 | Phase 1（已有设计） |
| **风控规则引擎** | 🟢 低 | 高 | 未来（1000+ Agent 后） |

---

## 决策记录

| 日期 | 决策 | 原因 |
|------|------|------|
| 2026-02-16 | MVP 不做区块链 | 先验证业务模型，Stripe 够用 |
| 2026-02-16 | MVP 不做竞标，只做抢单 | 简化流程，先跑通 |
| 2026-02-16 | MVP 不做前端 Dashboard | API 跑通再做 UI → 已改为同步做 Hero 页 |
| 2026-02-16 | 先对接 OpenClaw 生态 | 最大的 Agent 平台，Skill 兼容 |
| 2026-02-16 | 用 Astro + React 做前端 | 静态优先，性能好，Cloudflare Pages 免费 |
| 2026-02-16 | 参考 Moltbook 做 Skill 分发 | "一句话安装" 是最低摩擦的入口 |
| 2026-02-16 | **品牌改为 ClawMarket** | 蹭 OpenClaw 热度（154K 星标），明确定位为生态市场 |
| 2026-02-16 | 强调"Claw"而非"Agent" | OpenClaw 用户习惯称呼，更有社区归属感 |
| 2026-02-16 | 突出自托管+隐私优先 | OpenClaw 核心价值观，与云端 Agent 差异化 |
| 2026-02-16 | **借鉴 AP2 设计思想，不采用完整协议** | AP2 技术栈不兼容（Google Cloud）、过度设计、缺少 Escrow，但其审计链、Token 验证、责任分配思想值得学习 |
| 2026-02-16 | **平台提成从 10% 降至 1%** | 竞争优势 + 增长优先 + Agent 友好 |
| 2026-02-16 | **Skills 标准化为 OpenClaw 格式** | 符合行业规范，便于 ClawHub 发布 |
| 2026-02-16 | **引入 A2A 协议，免费/付费双轨** | A2A 开源免费、有 Hono+Workers SDK、降低门槛建立网络效应 |
| 2026-02-16 | **Skill 需要数据持久化指导** | Agent 缺少本地状态管理，对话记录无持久化，跨会话丢失上下文 |
| 2026-02-16 | **需要统一 Agent Profile Card** | agents 表（认证）与 agent_cards 表（A2A）割裂，需求方无法"逛商场"看业绩/定价/信任 |
| 2026-02-16 | **Skill 设计需先实际测试 OpenClaw** | 闭门设计 Skill 不如先把后端做完，实际跑 OpenClaw 后再迭代 |
| 2026-02-16 | **Webhook 签名使用 Web Crypto API** | Cloudflare Workers 环境原生支持，不需要 Node crypto 模块 |

---

## 下一步行动

```
✅ 前端首页已完成（ClawMarket 品牌版）
✅ 本地运行正常：http://localhost:4322/
✅ 所有文案围绕 OpenClaw 生态
✅ 404 问题已修复，语法错误已清理

✅ AP2 协议分析完成 → 决定不采用完整协议，借鉴设计思想
✅ 安全与审计设计完成 → 已有详细实现方案

✅ Phase 1 已完成 → API 能发任务、能接单
✅ Phase 2 已完成 → API 能交付、能验收、能收钱

✅ Phase 3a 完成 — Skills 标准化 + 收费体系重构 (2026-02-16 下午)

变更清单：
1. 深度分析文档
   - doc/07-skills-and-monetization-deep-analysis.md (新增)
   - 联网调研 OpenClaw Skill 标准规范
   - 行业对比（Skill vs MCP Tool）
   - 收费体系设计和决策

2. 平台提成比例：10% → 1%
   - api/wrangler.toml: PLATFORM_FEE_PERCENT = "1"
   - api/src/services/stripe.ts: 注释更新
   - 前端所有组件文案同步更新

3. Skills 标准化重构
   - skills/claw-employer/SKILL.md (新建，标准 OpenClaw 格式)
   - skills/claw-worker/SKILL.md (新建，标准 OpenClaw 格式)
   - 完整 YAML frontmatter (name/description/version/trigger/tools/config)
   - 所有 API 端点与实际代码一致
   - HTTP 调用示例替代 Python 伪代码
   - 删除虚假统计和区块链声明
   - web/public/skills/ 目录供前端静态访问

4. 前端更新
   - InstallCommand: 三种安装方式 (ClawHub/Employer/Prompt)
   - QuickStart: clawhub/curl/api 三个 Tab
   - Roles: 安装命令改为 clawhub install
   - HowItWorks: 99% 文案
   - 所有 90% → 99%，所有 10% → 1%

5. 根目录清理
   - 删除 FINAL-CHECKLIST.md (11KB)
   - 删除 PHASE1-COMPLETE.md (9KB)
   - 删除 PHASE2-COMPLETE.md (10KB)
   - 删除 PROJECT-COMPLETE.md (17KB)
   - 删除 STATUS.md (9KB)
   - 删除 web/public/claw-employer.md (旧版)
   - 删除 web/public/claw-worker.md (旧版)
   - README.md 精简重写

6. 文档更新
   - doc/SUMMARY.md 重写
   - doc/dev-progress.md 更新（本文件）

✅ A2A 协议 + 免费/付费双轨架构分析完成 (2026-02-16 晚)
✅ Phase 3b — A2A 双轨模式完整实现 (2026-02-16 晚)

Phase 3b 变更清单：

1. 后端 A2A 代码（全部新增）
   - api/src/db/schema.sql: 新增 agent_cards 表（第 6 张表）
   - api/src/routes/discovery.ts: Worker A2A 注册 + 技能发现 + 心跳
   - api/src/routes/a2a.ts: A2A JSON-RPC 2.0 Gateway
     · message/send → find-workers（发现工人，免费）
     · message/send → post-task（创建付费任务，需认证）
     · message/send → get-task-status（查询任务状态）
     · ClawMarket status ↔ A2A Task state 映射
   - api/src/index.ts: 挂载新路由 + /.well-known/agent.json

2. Skills v2.0 重写（双模式）
   - skills/claw-employer/SKILL.md: v1.0→v2.0
     · FREE Track: 发现工人 → A2A 直连 → 获取结果
     · PAID Track: 发任务 → Escrow → 验收 → 支付
     · 决策流程图（低风险→免费，重要→付费）
   - skills/claw-worker/SKILL.md: v1.0→v2.0
     · A2A 服务端设置（Agent Card + /a2a 端点示例代码）
     · 付费任务轮询循环
     · 心跳保活机制
   - web/public/skills/: 同步更新
   - web/public/skill.md: 双轨模式说明

3. 前端双轨模式更新
   - HowItWorks.tsx: Free/Paid 切换按钮 + 两套步骤卡片
   - InstallCommand.tsx: 新增 "A2A Free" tab
   - Roles.tsx: 双模式特性（FREE/PAID 标签）
   - QuickStart.tsx: 新增 "A2A free" + "API paid" tabs

4. 质量验证
   - TypeScript 编译：新增文件零错误
   - 前端 lint：零新增错误

✅ Phase 3c 自检 — Skill 数据持久化缺口分析 (2026-02-16 深夜)

Phase 3c 变更清单：

1. 深度审计分析
   - doc/09-skill-a2a-integration-gap-analysis.md (新增)
   - Skill × A2A 整合方式完整梳理
   - 数据持久化现状审计（6 张表全景）
   - 关键缺口识别：对话记录、本地状态、心跳超时等
   - 修复优先级路线图

2. 已发现的 6 个关键缺口
   ① claw-employer Skill review 端点错误（/review vs /accept + /reject）
   ② 两个 Skill 无本地数据持久化指导
   ③ claw-employer 缺少 filesystem 工具声明
   ④ A2A 对话记录无服务端/客户端存储
   ⑤ 心跳超时无自动清理（stale agents 仍显示可用）
   ⑥ 支付调用被注释为 TODO（submissions.ts:356）

3. 完整性评估
   - 后端 API: 18 个端点全部代码完成，TypeScript 零错误
   - 数据库: 6 张表 schema 完成，本地已创建
   - Skills: v2.0 双轨模式完成，但缺少数据持久化
   - 前端: Hero 页面完成，看板/文档页面未做
   - 支付: 代码完成但未激活（settleTask 被注释）

→ 下一步（按优先级）：

Phase 3c — 立即修复（影响 Skill 质量）：
   1. 修复 employer Skill review 端点（/review → /accept + /reject）
   2. 两个 Skill 增加 Data Persistence 章节
   3. employer Skill 增加 filesystem 工具
   4. discover 查询增加心跳超时过滤
   5. 同步 web/public/skills/ 副本

Phase 3d — BUG 修复 + Agent Profile Card 后端 ← 代码已完成：

   BUG 修复（已完成）：
   ✅ stripe.ts: 平台费用 fallback 10% → 1%
   ✅ submissions.ts: 取消 settleTask 注释，启用支付分账（含错误恢复）
   ✅ discovery.ts: discover 查询增加 10 分钟心跳超时过滤
   ✅ stripe.ts: webhook 签名验证完整实现（HMAC-SHA256 + 时间窗口 + 恒时比较）
   ✅ stripe.ts: Connect 账户缺失时不崩溃，改为日志 + 审计跳过
   ✅ submissions.ts: ReviewStatus 类型错误修复
   ✅ schema.sql: 表数量注释从 5 → 7

   Agent Profile Card 后端（已完成）：
   ✅ schema.sql: 新增 agent_profiles 表（第 7 张表）
   ✅ types.ts: AgentProfile + AgentCard + AgentStats + UpdateProfileInput 类型
   ✅ routes/profiles.ts: 6 个新端点
      · POST /v1/agents/profile — 创建/更新公开档案
      · GET  /v1/agents/profile — 获取自己的档案
      · GET  /v1/agents/browse — 分页浏览 + 多维筛选（技能/定价/在线/认证）
      · GET  /v1/agents/featured — 推荐/精选列表
      · GET  /v1/agents/:id/card — 完整公开 Card（含实时统计 + 信任信号）
      · GET  /v1/agents/:id/stats — 独立统计端点
   ✅ auth.ts: 注册时自动创建默认 profile
   ✅ index.ts: 路由挂载
   ✅ TypeScript 编译零新增错误

   待实际测试 OpenClaw 后再做：
   [ ] 更新 Skills: worker 增加 profile 步骤, employer 增加 browse 选人
   [ ] 前端: /agents 浏览商场 + /agents/:id 详情页

Phase 4 — 部署前准备（影响支付闭环）：
   ✅ 取消 submissions.ts 支付调用注释（已在 Phase 3d 完成）
   [ ] 配置 Stripe Connect 测试模式
   [ ] 部署到 Cloudflare（D1 + R2 + Workers）
   [ ] 域名配置（api.clawmarket.io + clawmarket.io）
   [ ] 端到端测试（完整付费 + A2A 免费流程）

Phase 5 — 功能增强：
   1. a2a_messages 表（服务端对话记录）
   2. A2A contextId 会话线程
   3. Cron Trigger 心跳清理
   4. Avatar 上传 + 验证体系（email/domain/Stripe）
   5. Agent 推荐算法 + 排行榜
   6. /tasks 看板 + /docs 文档页面
   7. 发布 Skill 到 ClawHub

✅ 全面状态评估与修复计划 (2026-02-16 深夜)

变更清单：
1. doc/12-comprehensive-status-and-fix-plan.md (新增)
   - 回答核心问题：请求结果如何保存？保存在 workspace 哪里？
   - 平台侧 vs Agent 侧数据持久化完整对比
   - 对话记录 3 种场景分析（免费A2A/付费A2A/付费REST）
   - 交付结果保存链路分析
   - OpenClaw workspace 标准目录设计：.clawmarket/
   - Skill + A2A 整合方式深度解析
   - 18 个 API 端点完成度逐一评估
   - 12 个缺口按 P0/P1/P2/P3 分级排序
   - Phase 3c 修复执行清单（5 项具体修改方案）
   - 总体完成度评分：~65%（代码完成，需修复+部署+测试）

2. 关键发现
   - Agent 本地完全没有持久化 — 最大设计缺口
   - claw-employer Skill 缺 filesystem 工具 — Agent 无法写文件
   - 对话记录 3 种场景都无保存
   - 仅付费层 REST API 有完整持久化
   - 支付调用仍被注释（submissions.ts:356）

✅ Phase 3e — OpenClaw Workspace 深度分析 + Skills v3.0 重写 (2026-02-16 深夜)

变更清单：

1. 深度调研 OpenClaw 架构（联网搜索 6 次）
   - 完整 Workspace 目录结构（~/.openclaw/ vs workspace/）
   - 工具体系（group:web, group:fs, group:memory 等标准分组）
   - 多 Agent 通信机制（sessions_send, sessions_spawn）
   - 记忆系统（MEMORY.md, memory/YYYY-MM-DD.md, 自动 flush）
   - 会话存储（sessions/*.jsonl 自动保存）
   - HEARTBEAT.md 定时执行机制

2. doc/09-openclaw-workspace-and-skill-design-deep-analysis.md (新增)
   - OpenClaw 两个关键目录完整对比
   - 4 类数据（对话/任务/交付物/凭证）的存储方案
   - 当前 Skill 的 6 个问题及修正方案
   - Skill v3.0 YAML frontmatter 标准设计
   - Employer + Worker 完整数据流图
   - 项目完成度审查（每模块百分比评估）
   - 已知 Bug 清单和修复状态

3. Skills v3.0 重写（两个 Skill 全部重写）
   - YAML tools 字段：http/memory/chat → group:web/group:memory/group:messaging/group:fs/group:sessions
   - 新增「Configuration」段：3 种 API key 配置方式
   - 新增「Data Storage Rules」段：
     · 任务记录 → memory/YYYY-MM-DD.md
     · 交付物 → storage/clawmarket/{mode}/{id}/
     · 对话 → 自动（不要手动保存）
     · 凭证 → 永不写入 workspace
   - 新增「Heartbeat Integration」段（Worker 专属）
   - 免费层使用 sessions_send + web_fetch 双模式
   - 付费层完整 REST API 流程
   - 同步到 web/public/skills/

4. Bug 修复验证
   - content-hash.ts: Buffer → btoa/atob（Workers 兼容）
   - stripe.ts: D1 查询加 .first<T>() 类型注解
   - TypeScript 编译：零实质性错误（仅剩 unused imports）

关键决策：
- 对话记录由 OpenClaw 自动保存到 sessions/*.jsonl，Skill 不需要处理
- 任务元数据双层持久化（memory/ 本地 + API 服务端）
- 交付物分两路径：Free → storage/ 直存，Paid → R2 + 本地副本
- tools 字段使用 OpenClaw 标准工具组名称
- Worker 心跳通过 HEARTBEAT.md 自动化

→ 下一步（按优先级）：
   1. 部署 API 到 Cloudflare（D1 + R2 + Workers）
   2. 配置 Stripe Connect 测试模式
   3. 域名配置（api.clawjobs.io + clawjobs.io）
   4. 端到端测试（A2A 免费 + 付费完整流程）
   5. 发布 Skill 到 ClawHub

✅ Phase 3f — 品牌重构 + 前端全面升级 + Skill 完善 + 文档页 (2026-02-16 晚)

变更清单：

1. 品牌 & 文案重构
   - 品牌名 ClawJobs，tagline "Where claws hire claws"
   - "Claw for Claw" 概念贯穿全站
   - A2A 只在底部 TechStack section 提及，不再在 Hero/HowItWorks/Roles 中突出
   - 统计数据只展示真实 API 数据（无 fallback 假数字）
   - 安装方式从 3 tab 简化为 1 条命令
   - QuickStart 从 2 种方式（clawhub/curl）简化为 1 种
   - Testimonials 去掉假金额

2. 前端新页面
   - /agents 浏览页（搜索 + 筛选 + 发布 CTA + 分页）
   - /agents/detail?id=xxx 详情页（stats + skills + pricing + connect）
   - /tasks 任务看板页（搜索 + 状态筛选 + 分页）
   - /docs 文档页面（Quick Start + API Reference + Skills + Pricing 四个 section）
   - TechStack section（A2A / OpenClaw / Stripe / Cloudflare）
   - 构建成功：5 pages, 1.48s

3. 前端组件更新
   - Hero: 真实 stats from API, fallback 文案 "powered by openclaw · claw for claw"
   - InstallCommand: 单命令，下方提示分开装
   - HowItWorks: 去掉 A2A 引用
   - Roles: 双 skill 卡片 + install both CTA
   - Testimonials: 去掉 A2A 和假金额引用
   - Navbar: 加 Docs 链接
   - Footer: 去掉 A2A 突出位置

4. Skill 完善
   - claw-employer: 增加 Profile Setup 段 + Browse Workers Step 0
   - claw-worker: 增加 Profile Setup 段
   - 同步到 web/public/skills/

5. BUG 验证
   - BUG-1: claw-employer Skill review 端点 — v3.0 已正确（/accept + /reject）
   - BUG-2: stripe.ts fallback — 已确认为 '1'
   - BUG-3: settleTask — 已确认取消注释
   - REFACTOR-3: stripe.ts — Connect 缺失时已健壮处理

6. 文档更新
   - doc/11-master-todo.md 全面重写为最新状态
   - doc/dev-progress.md 更新（本文件）

7. 质量验证
   - API TypeScript: 0 errors
   - Web TypeScript: 0 errors
   - Astro build: 5 pages, 0 errors

→ 下一步（按优先级）：
   1. 部署 API 到 Cloudflare（D1 + R2 + Workers）
   2. 配置 Stripe Connect 测试模式
   3. 域名配置（api.clawjobs.io + clawjobs.io）
   4. 端到端测试
   5. 发布 Skill 到 ClawHub
```

## Phase 3g: Skill 重构 — 基于 OpenClaw 源码真实验证 (2026-02-16)

**问题发现：** 原先 Skill 设计仅凭想象，未阅读 OpenClaw 源码验证。

### 1. OpenClaw 源码分析

**安装确认：** OpenClaw 2026.2.15 已安装（`/opt/homebrew/bin/openclaw`）

**Skill 加载机制（from 源码）：**
- Workspace skills (`<workspace>/skills/`) 优先级最高
- 个人 skills (`~/.agents/skills/`)
- 托管 skills (`~/.openclaw/skills/`)
- Bundled skills（随 OpenClaw 安装）
- `clawhub install` = 把 skill 下载到 `./skills/` 目录

**Skill 标准格式（from skill-creator SKILL.md + 源码）：**
- frontmatter 只需 `name` + `description`（必填）
- `metadata` 字段是单行 JSON5，声明依赖和安装方式
- `version`/`author`/`homepage`/`tools` 不是标准字段
- description 必须包含所有触发条件（是 Skill 触发的唯一依据）

**Agent 工具名（from 源码）：**
- `web_fetch`, `web_search`, `exec`, `bash`
- `read`, `write`, `edit`, `apply_patch`
- `memory_search`, `memory_get`
- `sessions_list`, `sessions_send`, `sessions_spawn`
- `message`

### 2. Skill 重写

**claw-employer SKILL.md 修改：**
- 删除无效 frontmatter 字段（version, author, homepage, tools）
- 添加 `metadata: { "openclaw": { "emoji": "📋", "requires": { "bins": ["curl"] } } }`
- description 改为包含触发关键词的完整描述
- profile 创建改用正确的 `primary_skills` 字段（对象数组 `[{id, name, level}]`，非字符串数组）
- 整体精简至 ~130 行（原 295 行），遵循 "concise is key"
- 改用 curl 示例（更通用，Agent 可直接执行）

**claw-worker SKILL.md 修改：**
- 同样修正 frontmatter 格式
- 添加 metadata 依赖声明
- 修正 `primary_skills` 字段格式
- 精简至 ~140 行（原 282 行）

### 3. OpenClaw 验证

**Skill 识别测试：**
```
$ openclaw skills check
Total: 51 (原 49 → +2)
✓ Eligible: 8 (原 6 → +2)
  📋 claw-employer ✓ Ready
  🔧 claw-worker ✓ Ready
```

**Skill 详情确认：**
```
$ openclaw skills info claw-employer
📋 claw-employer ✓ Ready
Source: openclaw-workspace
Requirements: ✓ curl
```

### 4. API 端到端测试（本地）

所有 Skill 中引用的 API 端点全部验证通过：
- ✅ POST /v1/auth/register (employer + worker)
- ✅ POST /v1/agents/profile (创建/更新 profile)
- ✅ POST /v1/agents/register-a2a
- ✅ POST /v1/agents/heartbeat
- ✅ GET /v1/agents/discover?skills=python
- ✅ GET /v1/agents/browse
- ✅ GET /v1/agents/:id/card
- ✅ POST /v1/tasks (创建任务)
- ✅ GET /v1/tasks?status=open&skills=translation
- ✅ GET /v1/tasks/:id
- ✅ POST /v1/tasks/:id/claim (认领)
- ✅ POST /v1/submissions (提交 multipart/form-data)
- ✅ GET /v1/submissions/:id/download (下载文件)
- ✅ POST /v1/submissions/:id/accept (接受 → 触发付款)
- ✅ POST /v1/submissions/:id/reject (拒绝 → 剩余尝试次数)
- ✅ GET /v1/stats

**完整业务流程验证：**
注册 → Profile → 发任务 → 认领 → 提交 → 下载 → 接受 ✅
注册 → Profile → 发任务 → 认领 → 提交 → 拒绝(1/3) ✅

→ 下一步：部署到 Cloudflare + 发布 Skill 到 ClawHub
