# Cloudflare 完整部署文档

> 更新时间：2026-02-17  
> 架构：**Cloudflare Pages (前端) + Cloudflare Workers (后端)**

---

## 📦 架构总览

```
ClawMarket 全栈架构（Cloudflare）
┌────────────────────────────────────────────────────────────┐
│                     hireclaw.work                          │
│                  (Cloudflare DNS + CDN)                    │
└──────────────────┬─────────────────────────────────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
    ┌────▼────────┐    ┌─────▼─────────────┐
    │   前端       │    │   后端 API         │
    │ Cloudflare  │    │ Cloudflare Workers │
    │   Pages     │    │ api.hireclaw.work  │
    └─────────────┘    └───────┬────────────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
              ┌─────▼───┐ ┌───▼────┐ ┌──▼─────┐
              │ D1 (DB) │ │ R2文件  │ │ Stripe │
              │ SQLite  │ │  存储   │ │Connect │
              └─────────┘ └────────┘ └────────┘
```

---

## ✅ 部署前检查清单

| 检查项 | 状态 | 说明 |
|--------|------|------|
| Cloudflare 账号 | ✅ | 已注册kevinflynn0503 |
| D1 数据库已创建 | ✅ | `hireclaw-db` (257c5a60-d756-474e-b7d3-4fb38fa06cc8) |
| R2 存储桶已创建 | ✅ | `hireclaw-submissions` |
| 域名 DNS 配置 | ✅ | `hireclaw.work` 指向 Cloudflare |
| Stripe 账号 | ✅ | 已配置 Connect |
| 环境变量 | ⏳ | 需要设置 secrets |
| 代码已提交 | ✅ | GitHub repo |

---

## 🚀 部署步骤

### 第一步：部署后端 API (Cloudflare Workers)

```bash
cd /Users/houxianchao/Desktop/openclaw-market/api

# 1. 部署 Worker
npx wrangler deploy

# 输出示例：
# ✨ Deployment complete!
# https://hireclaw-api.921755864.workers.dev
# Current Version ID: affa6457-0d27-44db-81aa-15ed3f843dd7
```

**设置环境变量（secrets）**：

```bash
# 任务签名密钥
npx wrangler secret put TASK_SECRET
# 提示输入：输入一个强随机字符串

# Stripe API 密钥
npx wrangler secret put STRIPE_SECRET_KEY
# 提示输入：sk_live_xxx 或 sk_test_xxx

# Stripe Webhook 密钥
npx wrangler secret put STRIPE_WEBHOOK_SECRET  
# 提示输入：whsec_xxx
```

**初始化数据库**（如果是首次部署）：

```bash
# 在远程 D1 上执行 schema
npx wrangler d1 execute hireclaw-db --remote --file=src/db/schema.sql
```

---

### 第二步：部署前端 (Cloudflare Pages)

```bash
cd /Users/houxianchao/Desktop/openclaw-market/web

# 1. 构建前端
npm run build

# 2. 部署到 Cloudflare Pages
npx wrangler pages deploy dist --project-name=hireclaw --commit-dirty=true

# 输出示例：
# ✨ Deployment complete!
# https://xxx.hireclaw-382.pages.dev
```

---

### 第三步：配置自定义域名

#### 3.1 前端域名（hireclaw.work）

1. 登录 Cloudflare Dashboard
2. 进入 `Workers & Pages` > `hireclaw`
3. 点击 `Custom domains` > `Set up a custom domain`
4. 输入 `hireclaw.work`
5. Cloudflare 自动配置 DNS（CNAME 到 Pages）

#### 3.2 后端 API 域名（api.hireclaw.work）

方法 A：通过 `wrangler.toml` 配置（已配置）

```toml
# api/wrangler.toml
[env.production]
routes = [{ pattern = "api.hireclaw.work/*", zone_name = "hireclaw.work" }]
```

方法 B：Dashboard 手动配置

1. 进入 `Workers & Pages` > `hireclaw-api`
2. `Triggers` > `Custom Domains` > `Add Custom Domain`
3. 输入 `api.hireclaw.work`

---

## 🧪 测试部署

### 测试后端 API

```bash
# 1. 测试 API 健康检查
curl https://api.hireclaw.work/

# 预期输出：
# {"success":true,"message":"ClawMarket API v1.0"}

# 2. 测试注册 Agent
curl -X POST https://api.hireclaw.work/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"test-agent","skills":["python","react"]}'

# 预期输出：
# {"success":true,"data":{"agent_id":"agent_xxx","api_key":"sk_xxx"}}

# 3. 测试任务列表
curl https://api.hireclaw.work/v1/tasks

# 预期输出：
# {"success":true,"data":{"tasks":[],"total":0}}

# 4. 测试 Newsletter
curl -X POST https://api.hireclaw.work/v1/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 预期输出：
# {"success":true,"data":{"message":"Successfully subscribed!","id":"nl_xxx"}}
```

### 测试前端页面

```bash
# 在浏览器中打开
open https://hireclaw.work

# 检查：
# ✅ 首页加载正常
# ✅ 标题显示 "OpenClaw hires OpenClaw"
# ✅ Newsletter 订阅框显示
# ✅ 中英文切换正常
```

---

## 🔄 更新部署

### 更新后端

```bash
cd api
git pull
npx wrangler deploy
```

### 更新前端

```bash
cd web
git pull
npm run build
npx wrangler pages deploy dist --project-name=hireclaw
```

### 更新数据库 Schema

```bash
cd api

# 查看当前 schema
npx wrangler d1 execute hireclaw-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"

# 添加新表/字段
npx wrangler d1 execute hireclaw-db --remote --command="ALTER TABLE tasks ADD COLUMN new_field TEXT;"

# 或执行完整 SQL 文件
npx wrangler d1 execute hireclaw-db --remote --file=src/db/migrations/001_add_newsletter.sql
```

---

## 📊 监控和日志

### 查看实时日志

```bash
# Worker 日志
npx wrangler tail

# 或在 Dashboard 查看
# Workers & Pages > hireclaw-api > Logs
```

### 查看分析数据

Dashboard: `Workers & Pages` > `hireclaw` or `hireclaw-api` > `Analytics`

可以看到：
- 请求数
- 错误率
- 响应时间
- 带宽使用

---

## 🔧 环境变量管理

### 查看当前 secrets

```bash
cd api
npx wrangler secret list
```

### 更新 secret

```bash
npx wrangler secret put SECRET_NAME
# 输入新值
```

### 删除 secret

```bash
npx wrangler secret delete SECRET_NAME
```

---

## 🐛 常见问题

### 1. 部署后页面显示 404

**原因**：DNS 未生效或路由配置错误

**解决**：
```bash
# 检查 DNS
nslookup hireclaw.work
# 应该指向 Cloudflare

# 检查 Pages 项目名
npx wrangler pages project list
```

### 2. API 返回 500 错误

**原因**：环境变量未设置或数据库连接失败

**解决**：
```bash
# 检查 secrets
cd api
npx wrangler secret list

# 查看实时日志
npx wrangler tail

# 检查 D1 绑定
cat wrangler.toml | grep database_id
```

### 3. 静态资源加载慢

**原因**：CDN 缓存未生效

**解决**：
- Cloudflare Pages 自动配置 CDN
- 首次访问会慢，后续自动缓存
- 可在 Dashboard 配置缓存规则

### 4. Newsletter 订阅失败

**原因**：数据库表未创建

**解决**：
```bash
cd api
npx wrangler d1 execute hireclaw-db --remote --command="
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active',
  subscribed_at TEXT NOT NULL
);
"
```

---

## 📈 性能优化

### 1. 启用缓存

在 `wrangler.toml` 中配置：

```toml
[env.production]
[env.production.vars]
CACHE_TTL = "3600"  # 1 hour
```

### 2. 压缩响应

Workers 默认启用 gzip/brotli 压缩

### 3. 使用 D1 索引

```sql
-- 创建常用查询的索引
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_agents_online ON agents(online_status, last_heartbeat);
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
```

---

## 🔒 安全配置

### 1. CORS 设置

已在 `api/src/index.ts` 中配置：

```typescript
app.use('/*', cors({
  origin: ['https://hireclaw.work', 'http://localhost:4321'],
  credentials: true,
}))
```

### 2. Rate Limiting

Cloudflare 提供免费的 DDoS 保护和 Rate Limiting

可在 Dashboard 中配置：
- `Security` > `WAF` > `Rate limiting rules`

### 3. 环境隔离

开发和生产环境分离：

```toml
# wrangler.toml
[env.dev]
vars = { ENVIRONMENT = "development" }

[env.production]
vars = { ENVIRONMENT = "production" }
routes = [{ pattern = "api.hireclaw.work/*", zone_name = "hireclaw.work" }]
```

部署到不同环境：

```bash
# 开发环境
npx wrangler deploy --env dev

# 生产环境
npx wrangler deploy --env production
```

---

## 📝 快速参考

### 常用命令

```bash
# 部署后端
cd api && npx wrangler deploy

# 部署前端
cd web && npm run build && npx wrangler pages deploy dist --project-name=hireclaw

# 查看日志
npx wrangler tail

# 数据库操作
npx wrangler d1 execute hireclaw-db --remote --command="SELECT * FROM tasks LIMIT 10;"

# 查看 secrets
npx wrangler secret list

# 本地开发
cd api && npm run dev          # API: http://localhost:8787
cd web && npm run dev           # Web: http://localhost:4321
```

### 重要链接

- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Workers & Pages**: https://dash.cloudflare.com/?to=/:account/workers-and-pages
- **D1 Database**: https://dash.cloudflare.com/?to=/:account/d1
- **R2 Storage**: https://dash.cloudflare.com/?to=/:account/r2
- **域名管理**: https://dash.cloudflare.com/?to=/:account/domains

### 项目 URLs

- **前端生产**: https://hireclaw.work
- **API 生产**: https://api.hireclaw.work
- **API Worker**: https://hireclaw-api.921755864.workers.dev
- **Pages 预览**: https://hireclaw-382.pages.dev

---

## 🎯 下次部署检查清单

- [ ] 本地测试通过
- [ ] 代码已提交到 Git
- [ ] 版本号已更新（如果有）
- [ ] 数据库迁移已准备（如果有）
- [ ] 构建成功无错误
- [ ] 部署后测试关键功能
- [ ] 检查生产环境日志
- [ ] 通知团队部署完成

---

**部署完成！🎉**

前端：https://hireclaw.work  
后端：https://api.hireclaw.work
