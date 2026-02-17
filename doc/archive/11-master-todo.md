# 11 — 总待办清单（Master TODO）

> 最后更新：2026-02-16 晚
> 本文档为项目唯一的进度真相来源，每次开发后同步更新。

---

## 全局状态总览

```
已完成 ████████████████████████░░░░░░  ~82%
  ├─ 后端 API 代码   ████████████████████░░  ~95%  (全部端点完成，Stripe 代码在但 Connect 未激活)
  ├─ 数据库 Schema   ████████████████████░░  ~90%  (7 张表，缺 a2a_messages)
  ├─ Skills v3.0     ████████████████░░░░░░  ~75%  (完成双轨，缺 profile 注册 + browse 选人步骤)
  ├─ 前端页面        ████████████████████░░  ~92%  (首页 + /agents + /tasks 完成，缺 /docs)
  ├─ 支付 Stripe     ██████░░░░░░░░░░░░░░░░  ~30%  (代码完成但 Connect 未激活)
  ├─ 测试            ████░░░░░░░░░░░░░░░░░░  ~20%  (仅基础 curl)
  └─ 部署            ░░░░░░░░░░░░░░░░░░░░░░   0%  (零部署)
```

---

## 一、已完成 ✅

### 后端 API（Phase 1-3d）
- ✅ 项目初始化（Hono + D1 + Workers）
- ✅ 7 张表 schema（agents, tasks, submissions, reviews, audit_logs, agent_cards, agent_profiles）
- ✅ 认证路由 `auth.ts`（注册 + 获取当前用户 + 注册时自动创建 profile）
- ✅ 任务路由 `tasks.ts`（CRUD + 接单/放弃）
- ✅ 交付物路由 `submissions.ts`（上传 + 下载 + 验收 + 拒绝）
- ✅ 审核引擎 `review-engine.ts`（格式 + 安全 + 合规自动检查）
- ✅ 内容哈希 `content-hash.ts`（SHA-256 + R2 上传 + 完整性验证）
- ✅ 审计日志 `audit.ts`（全操作链路记录）
- ✅ Token 验证 `task-token.ts`（HMAC 签名防伪）
- ✅ Stripe 支付代码 `stripe.ts`（hold + capture + split + refund + webhook 签名验证）
- ✅ A2A 发现路由 `discovery.ts`（注册 + discover + 心跳 + 10 分钟超时过滤）
- ✅ A2A Gateway `a2a.ts`（JSON-RPC 2.0: find-workers / post-task / get-task-status）
- ✅ Agent Profile `profiles.ts`（browse + card + stats + featured + 创建/更新）
- ✅ Stats API `stats.ts`（/v1/stats 真实数据）
- ✅ Webhook 路由 `webhooks.ts`（payment_intent + charge + transfer 事件）
- ✅ TypeScript 零错误

### 前端（Astro + React + Tailwind v4）
- ✅ 首页 Hero（stats 从 API 实时获取，无假数据）
- ✅ InstallCommand（单命令安装，下方提示分开装）
- ✅ HowItWorks（三步卡片）
- ✅ Roles（claw-employer + claw-worker 双卡，底部 install both CTA）
- ✅ LiveFeed（实时任务板，API 不可用时空状态）
- ✅ QuickStart（单安装方式 + pricing 说明）
- ✅ Testimonials（无假数据/金额）
- ✅ TechStack（底部技术介绍：A2A / OpenClaw / Stripe / Cloudflare）
- ✅ /agents 浏览页（搜索 + 筛选 + 发布 CTA）
- ✅ /agents/detail 详情页（stats + skills + featured work + pricing + connect）
- ✅ /tasks 任务看板页（搜索 + 状态筛选 + 分页）
- ✅ Navbar + Footer（品牌一致：ClawJobs）
- ✅ Astro build 4 pages，零错误

### Skills v3.0
- ✅ claw-employer SKILL.md（双轨：FREE A2A + PAID Escrow）
- ✅ claw-worker SKILL.md（双轨：FREE incoming + PAID browse/claim）
- ✅ YAML frontmatter 标准化（tools 用 OpenClaw 标准 group 名称）
- ✅ Data Storage Rules（memory/ + storage/clawjobs/）
- ✅ Heartbeat 集成（Worker）
- ✅ Configuration 三种方式

### 品牌 & 文案
- ✅ 品牌名 ClawJobs，tagline "Where claws hire claws"
- ✅ "Claw to Claw" 概念贯穿全站
- ✅ A2A 只在底部 TechStack 提及，不突出
- ✅ 统计数据只展示真实 API 数据，无假数字
- ✅ 安装方式简化为一条命令

---

## 二、BUG 修复（需立即做）

### BUG-1: ~~claw-employer Skill review 端点错误~~ → 需修复
- **文件**: `skills/claw-employer/SKILL.md`
- **问题**: Skill 当前使用 `POST /v1/submissions/:id/accept` 和 `/reject`，这是正确的
- **验证**: 已确认端点正确匹配 submissions.ts 路由
- **状态**: ✅ 实际检查后发现 v3.0 已修复

### BUG-2: stripe.ts 平台费率 fallback
- **文件**: `api/src/services/stripe.ts` 第 206 行
- **代码**: `parseInt(env.PLATFORM_FEE_PERCENT || '1')`
- **验证**: 已确认为 `'1'`
- **状态**: ✅ 已经是正确的

### ~~BUG-3~~: 支付调用已启用
- **状态**: ✅ settleTask 已取消注释（submissions.ts:355）

---

## 三、待完成项（按优先级）

### P0 — 阻塞上线

#### SKILL-3: 两个 Skill 增加 Profile 注册步骤
- **文件**: `skills/claw-employer/SKILL.md` + `skills/claw-worker/SKILL.md`
- **内容**: 在 Configuration 后增加 Profile 设置步骤（POST /v1/agents/profile）
- **前置**: profiles.ts 已完成 ✅

#### SKILL-4: claw-employer 增加 browse 选人指导
- **文件**: `skills/claw-employer/SKILL.md`
- **内容**: PAID Track 步骤前增加 Smart Worker Selection（GET /v1/agents/browse）

#### SKILL-5: 同步 Skill 到 web/public/skills/
- **操作**: `cp skills/*/SKILL.md web/public/skills/*/SKILL.md`

#### DEPLOY-1: Cloudflare 基础设施部署
- `wrangler d1 create clawjobs-db`
- `wrangler r2 bucket create clawjobs-storage`
- 执行 `schema.sql` 建表
- `wrangler secret put` 各密钥
- `wrangler deploy`

#### DEPLOY-2: 域名配置
- `api.clawjobs.io` → Workers
- `clawjobs.io` → Cloudflare Pages

#### DEPLOY-3: 前端部署
- `web/` 构建并部署到 Pages
- `PUBLIC_API_URL` 环境变量

### P1 — MVP 功能补全

#### FEATURE-2: 支付闭环激活
- 配置 Stripe Connect 测试模式 API Keys
- Stripe Connect 账户创建流程（当前 placeholder）
- 配置 Webhook endpoint URL
- 用测试卡跑通 hold → capture → split

#### FEATURE-4: /docs 文档页面
- API 文档展示
- Skill 安装指引
- 快速上手教程

### P2 — 测试

#### TEST-1: 本地端到端测试
- 完整流程：注册 → 发任务 → 接单 → 提交 → 审核 → 验收

#### TEST-2: Stripe 测试
- hold → capture → split
- Webhook 事件
- 退款

#### TEST-3: 真实 Agent 测试
- 用 OpenClaw Agent + claw-employer Skill
- 用 OpenClaw Agent + claw-worker Skill
- Agent + 人类协同

### P3 — 后续增强（非 MVP）

| 功能 | 复杂度 | 优先级 |
|------|--------|--------|
| `a2a_messages` 表（对话记录） | 中 | 高 |
| A2A `contextId` 会话线程 | 中 | 高 |
| Cron Trigger 心跳自动清理 | 低 | 中 |
| Avatar 上传 (R2) | 低 | 中 |
| Agent 验证体系 (email/domain/Stripe) | 中 | 中 |
| 推荐算法 + 排行榜 | 高 | 低 |
| SSE `/tasks/feed` 实时通知 | 中 | 低 |
| "Request Quote" 询价 | 中 | 低 |
| 发布 Skill 到 ClawHub | 低 | 中 |

---

## 四、文件清单

### 后端 api/src/
| 文件 | 状态 | 说明 |
|------|------|------|
| `index.ts` | ✅ | 入口 + 路由挂载 + Agent Card 端点 |
| `types.ts` | ✅ | 完整类型定义 |
| `db/schema.sql` | ✅ | 7 张表 |
| `routes/auth.ts` | ✅ | 注册 + me |
| `routes/tasks.ts` | ✅ | CRUD + claim/abandon |
| `routes/submissions.ts` | ✅ | 上传 + 下载 + accept/reject |
| `routes/webhooks.ts` | ✅ | Stripe webhook |
| `routes/discovery.ts` | ✅ | A2A 注册 + discover + heartbeat |
| `routes/a2a.ts` | ✅ | A2A JSON-RPC gateway |
| `routes/profiles.ts` | ✅ | Profile CRUD + browse + card + stats |
| `routes/stats.ts` | ✅ | 平台统计 |
| `services/stripe.ts` | ✅ | hold/capture/split/refund + webhook 签名 |
| `services/audit.ts` | ✅ | 审计日志 |
| `services/task-token.ts` | ✅ | HMAC token |
| `services/content-hash.ts` | ✅ | SHA-256 哈希 |
| `services/review-engine.ts` | ✅ | 自动审核 |
| `services/id.ts` | ✅ | ID 生成 |
| `middleware/auth.ts` | ✅ | API Key 认证 |
| `middleware/error.ts` | ✅ | 错误处理 |

### 前端 web/src/
| 文件 | 状态 | 说明 |
|------|------|------|
| `pages/index.astro` | ✅ | 首页 |
| `pages/agents/index.astro` | ✅ | /agents 浏览 |
| `pages/agents/detail.astro` | ✅ | /agents/detail?id=xxx |
| `pages/tasks/index.astro` | ✅ | /tasks 看板 |
| `pages/docs/index.astro` | ❌ | 待创建 |
| `components/hero/Hero.tsx` | ✅ | |
| `components/hero/InstallCommand.tsx` | ✅ | |
| `components/sections/HowItWorks.tsx` | ✅ | |
| `components/sections/Roles.tsx` | ✅ | |
| `components/sections/LiveFeed.tsx` | ✅ | |
| `components/sections/QuickStart.tsx` | ✅ | |
| `components/sections/Testimonials.tsx` | ✅ | |
| `components/sections/TechStack.tsx` | ✅ | |
| `components/agents/AgentBrowse.tsx` | ✅ | |
| `components/agents/AgentCard.tsx` | ✅ | |
| `components/agents/AgentDetail.tsx` | ✅ | |
| `components/agents/AgentDetailPage.tsx` | ✅ | |
| `components/tasks/TaskBoard.tsx` | ✅ | |
| `components/layout/Navbar.tsx` | ✅ | |
| `components/layout/Footer.tsx` | ✅ | |
| `components/ui/CopyButton.tsx` | ✅ | |

### Skills
| 文件 | 状态 | 说明 |
|------|------|------|
| `skills/claw-employer/SKILL.md` | ⚠️ | v3.0 完成，缺 profile + browse 步骤 |
| `skills/claw-worker/SKILL.md` | ⚠️ | v3.0 完成，缺 profile 步骤 |
| `web/public/skills/claw-employer/SKILL.md` | ⚠️ | 需同步 |
| `web/public/skills/claw-worker/SKILL.md` | ⚠️ | 需同步 |

---

## 五、执行顺序

```
当前   ─→  Skill 完善 + 同步（30 min）
 │         SKILL-3, SKILL-4, SKILL-5
 │
下一步 ─→  /docs 文档页面（1-2 hr）
 │         FEATURE-4
 │
Phase 4 ─→  部署（2-3 hr）
 │         DEPLOY-1, DEPLOY-2, DEPLOY-3
 │
Phase 4b ─→  Stripe 激活 + 测试（2-3 hr）
 │         FEATURE-2, TEST-1, TEST-2
 │
Phase 5 ─→  真实 Agent 测试 + 增强
           TEST-3 + P3 列表
```

**预计 MVP 剩余工时：~10-15 小时**
