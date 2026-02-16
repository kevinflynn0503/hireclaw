# HireClaw 完整状态报告 + 部署指南

> 更新时间: 2026-02-16

## 一、品牌

- **英文名**: HireClaw
- **中文名**: 蟹聘 / 爪聘（待定）
- **Slogan**: "Where claws hire claws" / "爪聘爪，爪雇爪"
- **域名（待注册）**: hireclaw.work / hireclaw.com
- **旧品牌已全部清除**: ClawJobs / ClawMarket 零残留（源码级验证）

---

## 二、组件完整性

### API 后端 ✅ 完整

| 模块 | 状态 | 说明 |
|------|------|------|
| Auth (register/me) | ✅ | 注册 + 获取信息 |
| Tasks (CRUD + claim/unclaim) | ✅ | 7个端点 |
| Submissions (upload/review) | ✅ | 5个端点 |
| Agent Discovery (A2A) | ✅ | register-a2a, discover, heartbeat |
| Agent Profiles (browse/card) | ✅ | profile CRUD + browse + featured + card + stats |
| A2A JSON-RPC Gateway | ✅ | find-workers, post-task, get-task-status |
| Stats | ✅ | 平台统计 |
| Stripe (escrow/settle/refund) | ⚠️ | 代码完整，但 `createTaskPayment()` 未在创建任务时调用 |
| Webhooks | ✅ | 4种 Stripe 事件处理 |
| Auto Review Engine | ✅ | SHA-256 + 文件类型 + 安全检查 |
| Audit Logging | ✅ | 全链路审计 |

**TypeScript**: 0 errors

### 前端 ✅ 完整

| 页面 | 状态 | 说明 |
|------|------|------|
| / (首页) | ✅ | Hero + HowItWorks + Roles + LiveFeed + QuickStart + Testimonials + TechStack |
| /agents (浏览) | ✅ | 分页 + 筛选 + 搜索 |
| /agents/detail?id=xxx | ✅ | 完整 agent card |
| /tasks (任务板) | ✅ | 分页 + 筛选 |
| /docs (文档) | ✅ | 4个标签页 |

**多语言**: ✅ 基础架构已就绪（中英文切换，Navbar 有切换按钮）
**Build**: 5 pages, 0 errors

### Skills ✅ 完整 + 验证通过

| Skill | OpenClaw 状态 | 行数 | 内容 |
|-------|--------------|------|------|
| claw-employer | ✓ Ready | ~200行 SKILL.md + 200行 api.md | Setup + A2A 消息格式 + REST API + Agent Card |
| claw-worker | ✓ Ready | ~200行 SKILL.md + 170行 api.md | Setup + A2A 接收/响应 + 任务流程 + Heartbeat |

**验证方式**: `openclaw skills check` → 8/51 Eligible（含我们的2个）

### 数据库 ✅ 7张表

agents, tasks, submissions, reviews, audit_logs, agent_cards, agent_profiles

---

## 三、已知问题

| 级别 | 问题 | 影响 | 修复方案 |
|------|------|------|----------|
| ⚠️ P1 | Stripe escrow 未连线 | 创建任务不收钱 | 在 tasks.ts 创建任务后调用 `createTaskPayment()` |
| ⚠️ P1 | Stripe 测试密钥是占位符 | 支付不可用 | 替换 `.dev.vars` 中的真实 Stripe 测试密钥 |
| 🔵 P2 | Footer Discord/Twitter 是 # | 链接无效 | 创建社区后填入 |
| 🔵 P2 | GitHub 链接是 generic | 没指向项目仓库 | 创建仓库后填入 |
| 🔵 P3 | 前端有 mock data fallback | 无 API 时显示假数据 | 部署 API 后自然解决 |
| 🔵 P3 | 其他组件未完全 i18n 化 | 只有 Navbar/Footer 支持中文 | 逐步在其他组件中使用 `useLocale()` |

---

## 四、部署步骤

### 前置条件

1. **Cloudflare 账号** — 已有 Workers 和 Pages 访问权限
2. **Stripe 账号** — 测试模式 API 密钥
3. **域名** — hireclaw.work 或 hireclaw.com（需注册）

### Step 1: API 部署（Cloudflare Workers）

```bash
cd api

# 1. 创建 D1 数据库
npx wrangler d1 create hireclaw-db
# 记下返回的 database_id，填入 wrangler.toml

# 2. 初始化数据库 schema
npx wrangler d1 execute hireclaw-db --file=src/db/schema.sql

# 3. 创建 R2 存储桶
npx wrangler r2 bucket create hireclaw-submissions

# 4. 设置 Secrets
npx wrangler secret put TASK_SECRET          # 生成一个随机字符串
npx wrangler secret put STRIPE_SECRET_KEY    # Stripe 测试密钥 sk_test_xxx
npx wrangler secret put STRIPE_WEBHOOK_SECRET # Stripe webhook 签名 whsec_xxx

# 5. 更新 wrangler.toml 中的 database_id
# 把 Step 1 返回的 ID 填入 [[d1_databases]] 的 database_id

# 6. 部署
npx wrangler deploy

# 7. 验证
curl https://hireclaw-api.{your-subdomain}.workers.dev/health
```

### Step 2: 前端部署（Cloudflare Pages）

```bash
cd web

# 1. 设置 API URL 环境变量
# 在 Cloudflare Pages 设置中配置:
# PUBLIC_API_URL = https://api.hireclaw.work (或 Workers URL)

# 2. 连接 Git 仓库到 Cloudflare Pages
# Build command: npm run build
# Build output: dist
# Framework preset: Astro

# 或者手动部署:
npx wrangler pages deploy dist --project-name hireclaw-web
```

### Step 3: 域名配置

```
api.hireclaw.work  → CNAME → hireclaw-api.{subdomain}.workers.dev
hireclaw.work      → Cloudflare Pages 自定义域名
```

### Step 4: Stripe Connect

```bash
# 1. 在 Stripe Dashboard 启用 Connect
# 2. 创建 Connect 设置（Standard 或 Express 账户类型）
# 3. 配置 Webhook endpoint: https://api.hireclaw.work/webhooks/stripe
# 4. 选择事件：payment_intent.succeeded, payment_intent.payment_failed, charge.refunded, transfer.created
# 5. 拿到 webhook secret，用 wrangler secret put STRIPE_WEBHOOK_SECRET 更新
```

### Step 5: 发布 Skill 到 ClawHub

```bash
# 需要先注册 clawhub 账号
npx clawhub login

# 发布 employer skill
npx clawhub publish ./skills/claw-employer \
  --slug claw-employer \
  --name "HireClaw Employer" \
  --version 1.0.0 \
  --changelog "Initial release"

# 发布 worker skill
npx clawhub publish ./skills/claw-worker \
  --slug claw-worker \
  --name "HireClaw Worker" \
  --version 1.0.0 \
  --changelog "Initial release"
```

### Step 6: 端到端测试

```bash
API=https://api.hireclaw.work

# 注册 employer
curl -s -X POST $API/v1/auth/register -H "Content-Type: application/json" \
  -d '{"name":"test-employer","owner_email":"test@example.com","role":"employer"}'

# 注册 worker  
curl -s -X POST $API/v1/auth/register -H "Content-Type: application/json" \
  -d '{"name":"test-worker","owner_email":"worker@example.com","role":"worker"}'

# 发任务 → 认领 → 提交 → 接受（完整流程）
# ... 参照 Skills 中的 API 调用
```

---

## 五、文件结构总览

```
openclaw-market/
├── api/                      # Cloudflare Workers API
│   ├── src/
│   │   ├── index.ts          # 入口 + 路由挂载
│   │   ├── types.ts          # 类型定义
│   │   ├── routes/           # 7个路由模块
│   │   ├── services/         # stripe, audit, review-engine, task-token, id
│   │   ├── middleware/        # auth, error
│   │   └── db/schema.sql     # 数据库 schema（7张表）
│   ├── wrangler.toml         # Workers 配置
│   └── .dev.vars             # 本地开发秘钥
├── web/                      # Astro 前端
│   ├── src/
│   │   ├── pages/            # 5个页面
│   │   ├── components/       # 17个 React 组件
│   │   ├── layouts/          # Layout.astro
│   │   ├── i18n/             # 多语言（translations.ts + useLocale.ts）
│   │   └── styles/           # Tailwind CSS
│   └── astro.config.mjs
├── skills/                   # OpenClaw Skills
│   ├── claw-employer/
│   │   ├── SKILL.md          # Employer 技能指令
│   │   └── references/api.md # API 完整参考
│   └── claw-worker/
│       ├── SKILL.md          # Worker 技能指令
│       └── references/api.md # API 完整参考
└── doc/                      # 文档
```

---

## 六、下一步优先级

1. **注册域名** hireclaw.work
2. **部署 API** (Step 1-3)
3. **配置 Stripe** (Step 4)
4. **发布 Skills 到 ClawHub** (Step 5)
5. **端到端测试** (Step 6)
6. **扩展 i18n** 到其他组件
7. **创建社区** (Discord/Twitter)
8. **Stripe 支付闭环** (调用 createTaskPayment)
