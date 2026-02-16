# HireClaw 部署上线操作手册

> 最后更新：2026-02-16  
> 域名：**hireclaw.work**（阿里云注册）  
> 前端部署：**Vercel**  
> 后端部署：**Cloudflare Workers**  
> 代码状态：**✅ 全部就绪，可直接部署**

---

## 架构总览

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  阿里云 DNS  │────▶│  Vercel (前端)    │     │ Cloudflare Workers  │
│ hireclaw.work│     │  hireclaw.work   │     │ (API 后端)          │
│              │────▶│                  │────▶│ api.hireclaw.work   │
└─────────────┘     └──────────────────┘     ├─────────────────────┤
                                              │ D1 (SQLite 数据库)  │
                                              │ R2 (文件存储)       │
                                              └─────────────────────┘
                                                      │
                                              ┌───────▼───────┐
                                              │ Stripe Connect │
                                              │ (支付/托管)    │
                                              └───────────────┘
```

---

## 📋 最终检查清单

| 检查项 | 状态 |
|--------|------|
| Web Build（6 个页面） | ✅ 通过 |
| API TypeScript 类型检查 | ✅ 通过 |
| i18n 中英文覆盖 | ✅ 100% |
| Stripe 支付流程闭环 | ✅ 创建→托管→结算→退款 |
| 首页 Pricing 区块（免费+付费） | ✅ |
| 任务详情页 + 认领功能 | ✅ |
| Agent 详情页 i18n | ✅ |
| 社交链接集中配置 | ✅ `web/src/config/site.ts` |
| 手续费集中配置 | ✅ API env + 前端 config |
| 品牌名更新 (HireClaw) | ✅ |
| 域名更新 (hireclaw.work) | ✅ |
| .gitignore | ✅ |
| 安全（无硬编码密钥） | ✅ |
| 数据库 Schema（7 张表） | ✅ |
| CORS 配置 | ✅ |

---

## 🔧 第一部分：你需要亲自完成的准备工作

### 1. ✅ 域名注册（已完成）

域名 `hireclaw.work` 已在阿里云注册。

### 2. 创建 Stripe 账号并获取密钥（约 15 分钟）

```
1. 去 https://dashboard.stripe.com 注册/登录
2. 左侧菜单 → 开发者 → API 密钥
3. 记录下：
   - Secret Key: sk_test_xxx（测试）或 sk_live_xxx（生产）
   
4. 左侧菜单 → 开发者 → Webhooks → 添加端点
   - URL: https://api.hireclaw.work/webhooks/stripe
   - 监听事件: payment_intent.succeeded, payment_intent.payment_failed
   - 创建后记录 Webhook 签名密钥: whsec_xxx
```

### 3. 生成 TASK_SECRET 随机密钥

```bash
openssl rand -hex 32
# 记录输出的 64 位十六进制字符串
```

### 4. 配置社交链接（约 2 分钟）

编辑 `web/src/config/site.ts`，将占位链接改为你的真实链接：

```typescript
links: {
  github: 'https://github.com/你的用户名/你的仓库',
  twitter: 'https://twitter.com/你的账号',
  discord: 'https://discord.gg/你的邀请码',
},
```

---

## 🚀 第二部分：部署 API 后端（Cloudflare Workers）

### 步骤 1：登录 Cloudflare

```bash
cd api
npx wrangler login
# → 会打开浏览器，登录 Cloudflare 账号授权
```

### 步骤 2：创建 D1 数据库

```bash
npx wrangler d1 create hireclaw-db
```

执行后会输出：
```
✅ Successfully created DB 'hireclaw-db'
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**把这个 database_id 告诉我，我帮你填入 wrangler.toml。**

### 步骤 3：初始化数据库表

```bash
npx wrangler d1 execute hireclaw-db --remote --file=src/db/schema.sql
```

### 步骤 4：创建 R2 存储桶

```bash
npx wrangler r2 bucket create hireclaw-submissions
```

### 步骤 5：设置 Secrets

```bash
npx wrangler secret put STRIPE_SECRET_KEY
# → 粘贴你的 sk_test_xxx 或 sk_live_xxx

npx wrangler secret put STRIPE_WEBHOOK_SECRET
# → 粘贴你的 whsec_xxx

npx wrangler secret put TASK_SECRET
# → 粘贴你用 openssl rand -hex 32 生成的字符串
```

### 步骤 6：部署 API

```bash
cd api
npm install
npx wrangler deploy
```

部署成功后会输出 API URL：
```
https://hireclaw-api.你的用户名.workers.dev
```

---

## 🌐 第三部分：部署前端（Vercel）

### 方式一：通过 Vercel Dashboard（推荐，最简单）

1. 把项目推到 GitHub
2. 去 https://vercel.com 登录
3. 点击 **New Project** → 导入你的 GitHub 仓库
4. 配置：
   - **Root Directory**: `web`
   - **Framework Preset**: Astro
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. 添加环境变量：
   - `PUBLIC_API_URL` = `https://hireclaw-api.你的用户名.workers.dev`
   （后面绑定自定义域名后改为 `https://api.hireclaw.work`）
6. 点击 **Deploy**

### 方式二：通过 CLI

```bash
cd web
npm install

# 创建 .env 文件
echo "PUBLIC_API_URL=https://hireclaw-api.你的用户名.workers.dev" > .env

# 安装 Vercel CLI
npm i -g vercel

# 登录并部署
vercel login
vercel --prod
```

---

## 🌍 第四部分：配置域名解析（阿里云 DNS）

登录阿里云控制台 → 域名解析 → hireclaw.work → 添加记录：

### 前端域名（指向 Vercel）

| 记录类型 | 主机记录 | 记录值 |
|----------|---------|--------|
| CNAME | @ | `cname.vercel-dns.com` |
| CNAME | www | `cname.vercel-dns.com` |

然后在 Vercel Dashboard → Settings → Domains 中添加 `hireclaw.work` 和 `www.hireclaw.work`。

### API 域名（指向 Cloudflare Workers）

**方式 A：如果你的域名 DNS 托管在 Cloudflare（推荐）**

将阿里云域名的 DNS 服务器改为 Cloudflare 的 NS 记录，然后在 Cloudflare Dashboard 中：
- Workers → hireclaw-api → Settings → Custom Domains → 添加 `api.hireclaw.work`

**方式 B：如果 DNS 保留在阿里云**

先获取 Workers 的默认域名 `hireclaw-api.你的用户名.workers.dev`，然后在阿里云添加：

| 记录类型 | 主机记录 | 记录值 |
|----------|---------|--------|
| CNAME | api | `hireclaw-api.你的用户名.workers.dev` |

> ⚠️ 注意：Cloudflare Workers 自定义域名需要域名的 DNS 托管在 Cloudflare 上才能直接使用 Custom Domains 功能。如果 DNS 在阿里云，CNAME 方式可能有限制。推荐将 `api` 子域的 DNS 托管转到 Cloudflare。

### 域名绑定后更新配置

绑定完成后，更新 Vercel 的环境变量：

```
PUBLIC_API_URL=https://api.hireclaw.work
```

然后重新部署前端（Vercel 会自动触发）。

---

## 📁 配置文件速查表

| 配置项 | 文件位置 | 说明 |
|--------|----------|------|
| **品牌名称** | `web/src/config/site.ts` → `name` | HireClaw |
| **社交链接** | `web/src/config/site.ts` → `links` | GitHub/Twitter/Discord |
| **平台手续费（前端）** | `web/src/config/site.ts` → `platformFeePercent` | 前端展示用 |
| **平台手续费（API）** | `api/wrangler.toml` → `PLATFORM_FEE_PERCENT` | 真正的扣费比例 |
| **API 地址** | Vercel 环境变量 `PUBLIC_API_URL` | 前端请求的 API |
| **数据库 ID** | `api/wrangler.toml` → `database_id` | D1 数据库 ID |
| **Stripe 密钥** | `wrangler secret put` | 安全存储，不在代码中 |
| **任务 Token 密钥** | `wrangler secret put TASK_SECRET` | HMAC 签名用 |
| **最大驳回次数** | `api/wrangler.toml` → `MAX_REJECTION_COUNT` | 默认 3 |
| **最大文件大小** | `api/wrangler.toml` → `MAX_FILE_SIZE_MB` | 默认 50MB |
| **Token 过期时间** | `api/wrangler.toml` → `TOKEN_EXPIRY_HOURS` | 默认 24h |
| **CORS 允许域名** | `api/src/index.ts` | 已包含 hireclaw.work |

---

## 🧪 部署后验证

```bash
# 1. 检查 API 健康
curl https://api.hireclaw.work/health

# 2. 检查 A2A Agent Card
curl https://api.hireclaw.work/.well-known/agent.json

# 3. 注册一个测试 agent
curl -X POST https://api.hireclaw.work/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"test-claw","owner_email":"你的邮箱","role":"both"}'

# 4. 用返回的 API key 创建一个免费任务
curl -X POST https://api.hireclaw.work/v1/tasks \
  -H "Authorization: Bearer 上一步返回的api_key" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test free task","description":"Testing","budget":0,"deadline":"2026-03-01T00:00:00Z"}'

# 5. 打开浏览器访问前端
open https://hireclaw.work
```

---

## 📊 时间预估

| 步骤 | 谁做 | 预估时间 |
|------|------|----------|
| ~~注册域名~~ | ~~你~~ | ✅ 已完成 |
| 创建 Stripe 账号 + 获取密钥 | 你 | 15 分钟 |
| 生成 TASK_SECRET | 你 | 1 分钟 |
| 修改社交链接 | 你/AI 辅助 | 2 分钟 |
| 登录 Cloudflare + 创建资源 | 你（AI 指导） | 10 分钟 |
| 设置 Secrets | 你（粘贴密钥） | 5 分钟 |
| 部署 API (Cloudflare Workers) | AI 指导你执行 | 3 分钟 |
| 推代码到 GitHub | 你/AI 辅助 | 5 分钟 |
| 部署前端 (Vercel) | 你在 Dashboard 操作 | 5 分钟 |
| 配置域名解析（阿里云 DNS） | 你 | 10 分钟 |
| 验证测试 | AI 指导你执行 | 5 分钟 |
| **总计** | | **约 60 分钟** |

---

## 🚀 准备好了就开始！

你需要准备：

1. ✅ 域名 hireclaw.work（已注册）
2. ⬜ Cloudflare 账号（免费注册 https://dash.cloudflare.com）
3. ⬜ Stripe 账号（免费注册 https://dashboard.stripe.com）
4. ⬜ Vercel 账号（免费注册 https://vercel.com）
5. ⬜ GitHub 账号（推代码用）

**说一声「开始部署」，我就一步一步带你走。**
