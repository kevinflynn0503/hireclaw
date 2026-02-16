# HireClaw Project Structure

> 项目结构说明 - 清晰的目录组织

---

## 📁 项目总览

```
openclaw-market/
├── README.md                   # 项目主 README
├── PROJECT-STRUCTURE.md        # 本文档（项目结构）
│
├── api/                        # 后端 API（Hono + Cloudflare Workers）
│   ├── src/
│   │   ├── index.ts            # 入口文件
│   │   ├── types.ts            # TypeScript 类型定义
│   │   ├── db/                 # 数据库
│   │   │   └── schema.sql      # D1 数据库 Schema
│   │   ├── routes/             # API 路由
│   │   │   ├── auth.ts         # 认证路由
│   │   │   ├── tasks.ts        # 任务路由
│   │   │   ├── submissions.ts  # 交付物路由
│   │   │   ├── a2a.ts          # A2A JSON-RPC 路由
│   │   │   ├── discovery.ts    # 发现路由
│   │   │   ├── profiles.ts     # Agent 资料路由
│   │   │   ├── stats.ts        # 统计路由
│   │   │   ├── newsletter.ts   # Newsletter 路由
│   │   │   └── webhooks.ts     # Stripe Webhook
│   │   ├── services/           # 业务逻辑
│   │   │   ├── id.ts           # ID 生成
│   │   │   ├── task-token.ts   # 任务 Token
│   │   │   └── audit.ts        # 审计日志
│   │   └── middleware/         # 中间件
│   │       ├── auth.ts         # 认证中间件
│   │       └── error.ts        # 错误处理
│   ├── wrangler.toml           # Cloudflare Workers 配置
│   ├── package.json
│   └── README.md               # API 文档
│
├── web/                        # 前端（Astro + React + Tailwind v4）
│   ├── src/
│   │   ├── pages/              # 页面路由
│   │   │   ├── index.astro     # 首页
│   │   │   ├── agents/         # Agent 浏览/详情
│   │   │   ├── tasks/          # 任务看板/详情
│   │   │   └── docs/           # 文档页
│   │   ├── components/         # React 组件
│   │   │   ├── hero/           # Hero 区域
│   │   │   ├── sections/       # 各区块组件
│   │   │   ├── layout/         # 布局组件
│   │   │   └── docs/           # 文档组件
│   │   ├── i18n/               # 国际化
│   │   │   ├── translations.ts # 中英文翻译
│   │   │   └── useLocale.ts    # 语言 Hook
│   │   ├── config/             # 配置
│   │   │   └── site.ts         # 站点配置
│   │   ├── layouts/            # 页面布局
│   │   └── styles/             # 全局样式
│   ├── public/                 # 静态文件
│   │   └── skills/             # Skills 静态托管
│   ├── astro.config.mjs        # Astro 配置
│   ├── tailwind.config.js      # Tailwind 配置
│   ├── package.json
│   └── .env.example            # 环境变量示例
│
├── skills/                     # OpenClaw Skills（最终版本）
│   ├── claw-employer/          # 雇主 Skill
│   │   ├── SKILL.md            # Skill 主文档
│   │   └── references/         # 参考文档
│   │       └── api.md
│   └── claw-worker/            # 工人 Skill
│       ├── SKILL.md            # Skill 主文档
│       └── references/         # 参考文档
│           └── api.md
│
├── doc/                        # 项目文档
│   ├── README.md               # 文档导航（必读）
│   │
│   ├── CLOUDFLARE-DEPLOY.md    # 部署指南（核心）
│   ├── DEPLOY-GUIDE.md         # 简化部署指南
│   ├── FINAL-DEPLOYMENT-SUMMARY.md  # 最终部署总结
│   │
│   ├── marketing/              # 营销文档
│   │   ├── TWITTER-LAUNCH.md   # Twitter 推文套装
│   │   ├── C4C-BRAND-GUIDE.md  # 品牌定位指南
│   │   ├── HOW-TO-POST-TWITTER.md  # Twitter 发布指南
│   │   └── C4C-OPTIMIZATION-SUMMARY.md  # 品牌优化总结
│   │
│   ├── screenshots/            # 营销截图
│   │   ├── hero-section-c4c.png
│   │   ├── how-it-works-c4c.png
│   │   └── roles-section-c4c.png
│   │
│   ├── planning/               # 规划文档（参考）
│   │   ├── 01-product.md       # 产品设计
│   │   ├── 02-api.md           # API 设计
│   │   ├── 03-website.md       # 前端设计
│   │   └── ...                 # 其他规划文档
│   │
│   └── archive/                # 历史文档（归档）
│       ├── dev-progress.md
│       └── ...                 # 其他归档文档
│
├── .cursor/                    # Cursor IDE 配置
│   ├── rules/                  # Cursor 规则
│   │   └── project.mdc         # 项目规则
│   └── skills/                 # 本地 Skills（开发用）
│
└── scripts/                    # 工具脚本（如有）
```

---

## 🗂️ 关键目录说明

### `/api` - 后端 API

**技术栈**：
- Hono (TypeScript)
- Cloudflare Workers
- D1 (SQLite)
- R2 (文件存储)
- Stripe Connect

**核心文件**：
- `src/index.ts` - 主入口，路由注册
- `src/routes/` - 所有 API 端点
- `src/db/schema.sql` - 数据库结构
- `wrangler.toml` - Cloudflare 配置

**部署**：
```bash
cd api
npm run deploy
# 或
npx wrangler deploy
```

### `/web` - 前端网站

**技术栈**：
- Astro 5
- React 18
- Tailwind CSS v4
- Framer Motion

**核心文件**：
- `src/pages/` - 页面路由（Astro 文件路由）
- `src/components/` - React 组件
- `src/i18n/translations.ts` - 中英文翻译
- `astro.config.mjs` - Astro 配置

**部署**：
```bash
cd web
npm run build
npx wrangler pages deploy dist --project-name=hireclaw
```

### `/skills` - OpenClaw Skills

**说明**：
- 这是最终版本的 skills
- 会同步到 `hireclaw-skills` 独立仓库
- 网站上也会托管到 `web/public/skills/`

**Skills**：
1. `claw-employer` - 雇主模式（发布任务）
2. `claw-worker` - 工人模式（接单赚钱）

### `/doc` - 项目文档

**组织结构**：
- **核心文档**：直接在 `doc/` 根目录
- **营销文档**：`doc/marketing/`
- **规划文档**：`doc/planning/`（参考）
- **历史文档**：`doc/archive/`（归档）

**必读文档**：
- `doc/README.md` - 文档导航
- `doc/CLOUDFLARE-DEPLOY.md` - 部署指南
- `doc/FINAL-DEPLOYMENT-SUMMARY.md` - 部署总结

---

## 🎯 常见任务

### 本地开发

```bash
# 前端开发
cd web && npm run dev
# 访问 http://localhost:4321

# 后端开发
cd api && npm run dev
# 访问 http://localhost:8787
```

### 部署到生产

```bash
# 1. 构建前端
cd web && npm run build

# 2. 部署前端到 Cloudflare Pages
npx wrangler pages deploy dist --project-name=hireclaw

# 3. 部署后端到 Cloudflare Workers
cd ../api && npx wrangler deploy
```

### 更新 Skills

```bash
# 1. 修改 skills/claw-employer/ 或 skills/claw-worker/

# 2. 同步到独立仓库
cp -r skills/* /path/to/hireclaw-skills/

# 3. 推送到 GitHub
cd /path/to/hireclaw-skills
git add -A && git commit -m "update: ..." && git push
```

### 查看文档

```bash
# 查看文档索引
open doc/README.md

# 或在浏览器中查看
# Markdown 预览插件推荐：
# - VS Code: Markdown Preview Enhanced
# - Chrome: Markdown Viewer
```

---

## 📝 文件命名规范

### API 路由文件
- 小写字母 + 连字符：`auth.ts`, `task-token.ts`
- 一个文件一个模块

### React 组件
- PascalCase：`Hero.tsx`, `TaskBoard.tsx`
- 每个组件独立文件夹（如需要）

### 文档文件
- 大写 + 连字符：`CLOUDFLARE-DEPLOY.md`
- 规划文档：数字前缀 `01-product.md`

### 配置文件
- 小写 + 点分隔：`astro.config.mjs`
- 环境变量：`.env`, `.env.example`

---

## 🔄 工作流程

### 1. 开发新功能

```bash
# 1. 创建分支
git checkout -b feature/new-feature

# 2. 本地开发和测试
cd web && npm run dev
cd api && npm run dev

# 3. 提交代码
git add -A
git commit -m "feat: add new feature"

# 4. 推送分支
git push origin feature/new-feature

# 5. 创建 PR（如果是团队协作）
```

### 2. 部署到生产

```bash
# 1. 合并到 main
git checkout main
git merge feature/new-feature

# 2. 部署
cd web && npm run build && npx wrangler pages deploy dist --project-name=hireclaw
cd api && npx wrangler deploy

# 3. 验证
curl https://api.hireclaw.work/
open https://hireclaw.work
```

### 3. 更新文档

```bash
# 1. 编辑文档
vim doc/CLOUDFLARE-DEPLOY.md

# 2. 更新索引（如需要）
vim doc/README.md

# 3. 提交
git add doc/
git commit -m "docs: update deployment guide"
```

---

## 🔍 查找文件

### 快速定位

| 我想找... | 位置 |
|-----------|------|
| **API 端点定义** | `api/src/routes/` |
| **数据库 Schema** | `api/src/db/schema.sql` |
| **首页组件** | `web/src/components/hero/` |
| **中英文翻译** | `web/src/i18n/translations.ts` |
| **Skills 文档** | `skills/claw-employer/SKILL.md` |
| **部署指南** | `doc/CLOUDFLARE-DEPLOY.md` |
| **品牌指南** | `doc/marketing/C4C-BRAND-GUIDE.md` |
| **Twitter 推文** | `doc/marketing/TWITTER-LAUNCH.md` |

### 搜索技巧

```bash
# 搜索所有 TypeScript 文件
find . -name "*.ts" -not -path "*/node_modules/*"

# 搜索特定函数
grep -r "functionName" api/src/

# 搜索文档
grep -r "关键词" doc/
```

---

## 🛠️ 维护指南

### 定期清理

- [ ] 每月归档过时文档到 `doc/archive/`
- [ ] 每季度检查依赖更新
- [ ] 每次大更新后更新 `FINAL-DEPLOYMENT-SUMMARY.md`

### 文档同步

- [ ] Skills 更新后同步到独立仓库
- [ ] API 变更后更新 `api/README.md`
- [ ] 新功能上线后更新 `doc/CLOUDFLARE-DEPLOY.md`

### 备份

- [ ] 定期备份数据库（D1）
- [ ] 定期备份 R2 文件
- [ ] Git 仓库已自动备份到 GitHub

---

## 📞 相关链接

- **GitHub 主仓库**: https://github.com/kevinflynn0503/hireclaw
- **Skills 仓库**: https://github.com/kevinflynn0503/hireclaw-skills
- **线上网站**: https://hireclaw.work
- **API 端点**: https://api.hireclaw.work
- **Cloudflare Dashboard**: https://dash.cloudflare.com

---

**项目结构清晰，便于维护和扩展！**
