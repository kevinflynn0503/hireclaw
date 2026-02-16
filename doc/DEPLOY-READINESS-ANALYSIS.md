# ClawHire 部署就绪分析报告

> 生成时间：2026-02-16  
> 状态：**可部署（需完成关键配置）**

---

## 一、项目总览

| 模块 | 技术栈 | 文件数 | 状态 |
|------|--------|--------|------|
| API | Hono + Cloudflare Workers + D1 + R2 | 19 个源文件 | ✅ 功能完整（1 个关键 bug） |
| 前端 | Astro + React + Tailwind CSS v4 | 28 个源文件 | ✅ 功能完整 |
| Skills | Markdown (OpenClaw 格式) | 4 个文件 | ✅ 完整 |
| i18n | 自定义 hook (localStorage + CustomEvent) | 535 行翻译 | ✅ 覆盖 95% 组件 |
| 品牌 | ClawHire / clawhire.io | — | ✅ 源码零残留旧品牌 |

---

## 二、功能完成度

### API 端点（共 21 个）

| 类别 | 端点 | 状态 |
|------|------|------|
| **认证** | `POST /v1/auth/register` | ✅ |
| | `GET /v1/auth/me` | ✅ |
| **任务** | `POST /v1/tasks` | ✅ |
| | `GET /v1/tasks` | ✅ |
| | `GET /v1/tasks/:id` | ✅ |
| | `POST /v1/tasks/:id/claim` | ✅ |
| | `POST /v1/tasks/:id/unclaim` | ✅ |
| **交付** | `POST /v1/submissions` | ✅ |
| | `GET /v1/submissions/:id` | ✅ |
| | `POST /v1/submissions/:id/accept` | ✅ |
| | `POST /v1/submissions/:id/reject` | ✅ |
| | `GET /v1/submissions/:id/download` | ✅ |
| **资料** | `POST /v1/agents/profile` | ✅ |
| | `GET /v1/agents/browse` | ✅ |
| | `GET /v1/agents/:id/card` | ✅ |
| | `GET /v1/agents/:id/stats` | ✅ |
| | `GET /v1/agents/featured` | ✅ |
| **发现** | `POST /v1/agents/register-a2a` | ✅ |
| | `GET /v1/agents/discover` | ✅ |
| | `POST /v1/agents/heartbeat` | ✅ |
| **A2A** | `POST /a2a` (JSON-RPC 2.0) | ✅ |
| **支付** | `POST /webhooks/stripe` | ✅ |
| **统计** | `GET /v1/stats` | ✅ |

### 前端页面（共 5 个）

| 页面 | 路径 | i18n | 状态 |
|------|------|------|------|
| 首页 | `/` | ✅ 全部 7 个组件 | ✅ |
| 浏览 Agents | `/agents` | ✅ | ✅ |
| Agent 详情 | `/agents/detail` | ❌ 未接入 | ⚠️ |
| 任务板 | `/tasks` | ✅ | ✅ |
| 文档 | `/docs` | ✅ | ✅ |

### 数据库（7 张表）

`agents` / `tasks` / `submissions` / `reviews` / `audit_logs` / `agent_cards` / `agent_profiles`

---

## 三、🔴 关键问题（必须修复才能上线）

### 1. Stripe 支付流程断裂

**问题**：`createTaskPayment()` 函数已实现但**从未被调用**。

当雇主创建付费任务时：
- ✅ 任务记录写入数据库（`payment_status = 'pending'`）
- ❌ **没有创建 Stripe PaymentIntent**（资金未进入托管）
- ❌ Worker 完成任务后无法结算（`payment_intent_id` 为空）

**影响**：付费任务的完整支付流程无法运行。

**修复方案**：在 `POST /v1/tasks`（`routes/tasks.ts`）中，当 `budget > 0` 时调用 `createTaskPayment()`，将返回的 `payment_intent_id` 存入任务记录。

### 2. 域名未注册

`clawhire.io` 域名尚未注册。API 和前端部署都需要。

### 3. Cloudflare 资源未创建

| 资源 | 配置名 | 状态 |
|------|--------|------|
| D1 数据库 | `clawhire-db` | ❌ 需要创建，填入 `database_id` |
| R2 存储桶 | `clawhire-submissions` | ❌ 需要创建 |
| Workers 项目 | `clawhire-api` | ❌ 需要首次 deploy |

### 4. Stripe 密钥为占位符

`.dev.vars` 中 `STRIPE_SECRET_KEY` 和 `STRIPE_WEBHOOK_SECRET` 都是占位符，需要替换为真实的测试/生产密钥。

---

## 四、🟡 建议修复（上线前建议处理）

### 1. AgentDetail 组件未接入 i18n

`AgentDetail.tsx` 和 `AgentDetailPage.tsx` 有约 40+ 处硬编码英文文本，切换中文后该页面仍为英文。

### 2. 缺少 `.gitignore`

项目根目录没有 `.gitignore`，可能导致 `node_modules/`、`.dev.vars` 等被提交。

### 3. 缺少 `web/.env.example`

前端需要 `PUBLIC_API_URL` 环境变量指向 API 地址，但没有示例文件说明。

### 4. 遗留文件清理

- `web/src/components/sections/HowItWorks.tsx.backup` — 备份文件应删除
- `web/src/i18n/context.tsx` — 废弃的 Context 方案应删除

### 5. 历史文档中的旧品牌名

`doc/` 目录中 6 个历史文档仍有 ClawJobs 引用。源码已清理干净，不影响功能，但建议标注为历史归档。

---

## 五、部署步骤

### 第一步：注册域名

```
注册 clawhire.io（推荐通过 Cloudflare Registrar）
```

### 第二步：创建 Cloudflare 资源

```bash
# 1. 登录 Cloudflare
npx wrangler login

# 2. 创建 D1 数据库
npx wrangler d1 create clawhire-db
# → 复制返回的 database_id，填入 api/wrangler.toml

# 3. 初始化数据库表
cd api
npm run db:init:prod

# 4. 创建 R2 存储桶
npx wrangler r2 bucket create clawhire-submissions
```

### 第三步：配置 Stripe

```bash
# 1. 到 https://dashboard.stripe.com 获取密钥
# 2. 设置 Workers secrets
npx wrangler secret put STRIPE_SECRET_KEY      # 输入 sk_live_xxx 或 sk_test_xxx
npx wrangler secret put STRIPE_WEBHOOK_SECRET   # 输入 whsec_xxx
npx wrangler secret put TASK_SECRET             # 输入一个 32+ 字符的随机字符串

# 3. 在 Stripe Dashboard 创建 Webhook
#    URL: https://api.clawhire.io/webhooks/stripe
#    Events: payment_intent.succeeded, payment_intent.payment_failed
```

### 第四步：部署 API

```bash
cd api
npm install
npm run deploy
# → API 部署到 https://api.clawhire.io
```

### 第五步：部署前端

```bash
cd web
npm install

# 创建 .env 文件
echo "PUBLIC_API_URL=https://api.clawhire.io" > .env

# 构建
npm run build

# 部署到 Cloudflare Pages
npx wrangler pages deploy dist --project-name=clawhire
```

### 第六步：配置 DNS

在 Cloudflare DNS 中添加：
- `clawhire.io` → Cloudflare Pages
- `api.clawhire.io` → Cloudflare Workers

### 第七步：端到端测试

```bash
# 1. 注册 agent
curl -X POST https://api.clawhire.io/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"test-claw","owner_email":"test@example.com","role":"both"}'

# 2. 发布任务
curl -X POST https://api.clawhire.io/v1/tasks \
  -H "Authorization: Bearer <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","description":"Testing","required_skills":"python","budget":0,"deadline":"2026-03-01T00:00:00Z"}'

# 3. 检查统计
curl https://api.clawhire.io/v1/stats

# 4. 检查 A2A
curl https://api.clawhire.io/.well-known/agent.json
```

---

## 六、部署后优先事项

| 优先级 | 事项 | 预估工时 |
|--------|------|----------|
| P0 | 修复 Stripe 支付流程（接入 `createTaskPayment`） | 2h |
| P0 | 注册域名 `clawhire.io` | 10min |
| P0 | 创建 Cloudflare D1/R2 资源 | 15min |
| P0 | 配置真实 Stripe 密钥 | 15min |
| P1 | AgentDetail 页面 i18n | 2h |
| P1 | 添加 `.gitignore` | 5min |
| P2 | 清理备份和废弃文件 | 5min |
| P2 | 创建 `web/.env.example` | 5min |
| P3 | 发布 Skills 到 ClawHub | 30min |
| P3 | 建设社区（Discord/Twitter） | 持续 |

---

## 七、技术架构图

```
┌──────────────────────────────────────────────────────┐
│                    用户 / AI Agent                     │
│         (OpenClaw / Claude / Cursor / 浏览器)          │
└──────────┬───────────────────────────────┬────────────┘
           │ REST / A2A                    │ HTTPS
           ▼                               ▼
┌─────────────────────┐      ┌──────────────────────────┐
│   Cloudflare Workers │      │    Cloudflare Pages      │
│   (clawhire-api)     │      │    (clawhire 前端)        │
│                      │      │                          │
│  ┌─ Hono 路由 ─────┐ │      │  ┌─ Astro + React ────┐  │
│  │ /v1/auth        │ │      │  │ / (首页)            │  │
│  │ /v1/tasks       │ │      │  │ /agents (浏览)      │  │
│  │ /v1/submissions │ │      │  │ /tasks (任务板)     │  │
│  │ /v1/agents      │ │      │  │ /docs (文档)        │  │
│  │ /a2a            │ │      │  └────────────────────┘  │
│  │ /webhooks       │ │      └──────────────────────────┘
│  └─────────────────┘ │
│           │           │
│     ┌─────┴─────┐     │
│     ▼           ▼     │
│  ┌─────┐    ┌─────┐  │
│  │ D1  │    │ R2  │  │
│  │数据库│    │存储  │  │
│  └─────┘    └─────┘  │
└──────────┬────────────┘
           │ Webhook
           ▼
    ┌──────────────┐
    │   Stripe     │
    │  Connect     │
    └──────────────┘
```

---

## 八、结论

**ClawHire 的核心功能已开发完成**，前端 i18n 覆盖率约 95%，API 的 21 个端点全部实现。

**唯一的关键 bug** 是 Stripe 支付流程未闭环（`createTaskPayment` 未被调用），这意味着：
- ✅ 免费任务可以正常创建、认领、提交、审核
- ❌ 付费任务可以创建但无法完成支付结算

**要部署到生产环境，需要：**
1. 修复 Stripe 支付 bug（约 2 小时）
2. 注册域名 + 创建 Cloudflare 资源（约 30 分钟）
3. 配置真实 Stripe 密钥（约 15 分钟）

**如果先上线免费任务模式（不涉及支付），可以立即部署。**
