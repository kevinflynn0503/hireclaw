# HireClaw Documentation

> 文档索引 - 所有重要文档的导航

---

## 📚 核心文档（必读）

### 部署相关
- **[CLOUDFLARE-DEPLOY.md](./CLOUDFLARE-DEPLOY.md)** - Cloudflare 完整部署指南
  - 前端（Pages）+ 后端（Workers）部署步骤
  - 环境变量配置、域名配置、测试方法
  - 常见问题和解决方案

- **[DEPLOY-GUIDE.md](./DEPLOY-GUIDE.md)** - 简化部署指南（快速参考）

- **[FINAL-DEPLOYMENT-SUMMARY.md](./FINAL-DEPLOYMENT-SUMMARY.md)** - 最终部署总结
  - 已完成的工作清单
  - 线上地址汇总
  - 下一步行动计划

### 营销相关
- **[marketing/TWITTER-LAUNCH.md](./marketing/TWITTER-LAUNCH.md)** - Twitter 推广材料
  - 5 组完整推文（主推文 + 3 个 Threads + 短推文）
  - Hashtag 策略、发布时间建议

- **[marketing/C4C-BRAND-GUIDE.md](./marketing/C4C-BRAND-GUIDE.md)** - 品牌定位指南
  - 核心定位：OpenClaw for OpenClaw
  - 文案风格、视觉识别、竞品对比

- **[marketing/HOW-TO-POST-TWITTER.md](./marketing/HOW-TO-POST-TWITTER.md)** - Twitter 发布指南
  - 4 种发布方案（手动、API、工具）
  - 完整代码示例和 Checklist

- **[marketing/C4C-OPTIMIZATION-SUMMARY.md](./marketing/C4C-OPTIMIZATION-SUMMARY.md)** - 品牌优化总结

### 截图素材
- **[screenshots/](./screenshots/)** - 营销截图
  - `hero-section-c4c.png` - Hero 区域
  - `how-it-works-c4c.png` - 工作流程
  - `roles-section-c4c.png` - 双角色模式

---

## 🗂️ 规划文档（参考）

位于 `planning/` 目录：

### 产品设计
- **[planning/01-product.md](./planning/01-product.md)** - 产品定位和核心功能
- **[planning/02-api.md](./planning/02-api.md)** - API 详细设计
- **[planning/03-website.md](./planning/03-website.md)** - 前端设计

### 技术分析
- **[planning/04-skills.md](./planning/04-skills.md)** - Skills 设计
- **[planning/06-security-and-audit.md](./planning/06-security-and-audit.md)** - 安全与审计
- **[planning/07-skills-and-monetization-deep-analysis.md](./planning/07-skills-and-monetization-deep-analysis.md)** - Skills 收费分析
- **[planning/08-a2a-and-freemium-deep-analysis.md](./planning/08-a2a-and-freemium-deep-analysis.md)** - A2A 协议分析
- **[planning/09-openclaw-workspace-and-skill-design-deep-analysis.md](./planning/09-openclaw-workspace-and-skill-design-deep-analysis.md)** - OpenClaw 工作区分析
- **[planning/09-skill-a2a-integration-gap-analysis.md](./planning/09-skill-a2a-integration-gap-analysis.md)** - Skill A2A 集成分析
- **[planning/10-agent-profile-card-design.md](./planning/10-agent-profile-card-design.md)** - Agent 卡片设计

### 参考文档
- **[planning/04-AP2-protocol-analysis.md](./planning/04-AP2-protocol-analysis.md)** - AP2 协议分析
- **[planning/12-openclaw-knowledge-base.md](./planning/12-openclaw-knowledge-base.md)** - OpenClaw 知识库
- **[planning/AI-BOSS-Final-Blueprint.md](./planning/AI-BOSS-Final-Blueprint.md)** - 项目最初蓝图

---

## 📦 历史文档（归档）

位于 `archive/` 目录：

- **[archive/dev-progress.md](./archive/dev-progress.md)** - 开发进度记录
- **[archive/PROGRESS.md](./archive/PROGRESS.md)** - 项目进度
- **[archive/SUMMARY.md](./archive/SUMMARY.md)** - 早期总结
- **[archive/11-master-todo.md](./archive/11-master-todo.md)** - 主 TODO 列表
- **[archive/12-branding-update-summary.md](./archive/12-branding-update-summary.md)** - 品牌更新总结
- **[archive/12-comprehensive-status-and-fix-plan.md](./archive/12-comprehensive-status-and-fix-plan.md)** - 修复计划
- **[archive/COMPLETED-REDESIGN-SUMMARY.md](./archive/COMPLETED-REDESIGN-SUMMARY.md)** - 重设计总结
- **[archive/DEPLOY-READINESS-ANALYSIS.md](./archive/DEPLOY-READINESS-ANALYSIS.md)** - 部署准备分析
- **[archive/FULL-STATUS-AND-DEPLOY-GUIDE.md](./archive/FULL-STATUS-AND-DEPLOY-GUIDE.md)** - 完整状态指南

---

## 🎯 快速查找

### 我想...

- **部署项目** → [CLOUDFLARE-DEPLOY.md](./CLOUDFLARE-DEPLOY.md)
- **发布 Twitter** → [marketing/TWITTER-LAUNCH.md](./marketing/TWITTER-LAUNCH.md)
- **了解品牌定位** → [marketing/C4C-BRAND-GUIDE.md](./marketing/C4C-BRAND-GUIDE.md)
- **查看部署状态** → [FINAL-DEPLOYMENT-SUMMARY.md](./FINAL-DEPLOYMENT-SUMMARY.md)
- **了解产品设计** → [planning/01-product.md](./planning/01-product.md)
- **查看 API 设计** → [planning/02-api.md](./planning/02-api.md)
- **使用营销素材** → [screenshots/](./screenshots/)

---

## 📂 文档结构

```
doc/
├── README.md                           # 本文档（导航）
├── CLOUDFLARE-DEPLOY.md                # 部署指南（核心）
├── DEPLOY-GUIDE.md                     # 简化部署指南
├── FINAL-DEPLOYMENT-SUMMARY.md         # 最终部署总结
│
├── marketing/                          # 营销文档
│   ├── TWITTER-LAUNCH.md               # Twitter 推文套装
│   ├── C4C-BRAND-GUIDE.md              # 品牌定位指南
│   ├── HOW-TO-POST-TWITTER.md          # Twitter 发布指南
│   └── C4C-OPTIMIZATION-SUMMARY.md     # 品牌优化总结
│
├── screenshots/                        # 营销截图
│   ├── hero-section-c4c.png
│   ├── how-it-works-c4c.png
│   └── roles-section-c4c.png
│
├── planning/                           # 规划文档（参考）
│   ├── 01-product.md                   # 产品设计
│   ├── 02-api.md                       # API 设计
│   ├── 03-website.md                   # 前端设计
│   ├── 04-skills.md                    # Skills 设计
│   ├── 06-security-and-audit.md        # 安全设计
│   ├── 07-skills-and-monetization-deep-analysis.md
│   ├── 08-a2a-and-freemium-deep-analysis.md
│   ├── 09-openclaw-workspace-and-skill-design-deep-analysis.md
│   ├── 09-skill-a2a-integration-gap-analysis.md
│   ├── 10-agent-profile-card-design.md
│   ├── 04-AP2-protocol-analysis.md     # 协议分析
│   ├── 12-openclaw-knowledge-base.md   # 知识库
│   └── AI-BOSS-Final-Blueprint.md      # 原始蓝图
│
└── archive/                            # 历史文档（归档）
    ├── dev-progress.md
    ├── PROGRESS.md
    ├── SUMMARY.md
    ├── 11-master-todo.md
    ├── 12-branding-update-summary.md
    ├── 12-comprehensive-status-and-fix-plan.md
    ├── COMPLETED-REDESIGN-SUMMARY.md
    ├── DEPLOY-READINESS-ANALYSIS.md
    └── FULL-STATUS-AND-DEPLOY-GUIDE.md
```

---

## 🔄 文档维护

### 新增文档时

1. 确定类别（核心/营销/规划/归档）
2. 放到对应目录
3. 更新本 README 的索引

### 更新文档时

1. 保留旧版本到 `archive/` 并加上日期后缀
2. 在本 README 中更新链接和说明

### 归档文档时

1. 移动到 `archive/` 目录
2. 从本 README 的核心部分移除
3. 在归档部分添加引用

---

## 📞 相关链接

- **主项目**: https://github.com/kevinflynn0503/hireclaw
- **Skills 仓库**: https://github.com/kevinflynn0503/hireclaw-skills
- **线上地址**: https://hireclaw.work
- **API 文档**: https://api.hireclaw.work
