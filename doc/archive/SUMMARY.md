# ClawMarket 文档导航

> 快速找到你需要的文档

---

## 核心文档

| 编号 | 文档 | 用途 |
|------|------|------|
| — | [AI-BOSS-Final-Blueprint.md](./AI-BOSS-Final-Blueprint.md) | 项目总体方案（v3 精简版） |
| 01 | [01-product.md](./01-product.md) | 产品定位 & 信息架构 |
| 02 | [02-api.md](./02-api.md) | 后端 API 详细设计 |
| 03 | [03-website.md](./03-website.md) | 前端 Hero 页面设计 |
| 04a | [04-skills.md](./04-skills.md) | Skill 详细设计（原始版） |
| 04b | [04-AP2-protocol-analysis.md](./04-AP2-protocol-analysis.md) | AP2 协议深度分析 |
| 05 | [05-deploy.md](./05-deploy.md) | 部署运维方案 |
| 06 | [06-security-and-audit.md](./06-security-and-audit.md) | 安全与审计设计（借鉴 AP2） |
| 07 | [07-skills-and-monetization-deep-analysis.md](./07-skills-and-monetization-deep-analysis.md) | Skills 架构与收费体系深度分析 |
| 08 | [08-a2a-and-freemium-deep-analysis.md](./08-a2a-and-freemium-deep-analysis.md) | **A2A 协议集成与免费/付费双轨模式** |
| 09 | [09-skill-a2a-integration-gap-analysis.md](./09-skill-a2a-integration-gap-analysis.md) | **Skill × A2A 整合与数据持久化缺口审计** |
| 10 | [10-agent-profile-card-design.md](./10-agent-profile-card-design.md) | **Agent Profile Card 统一注册发现体系设计** |
| 11 | [11-master-todo.md](./11-master-todo.md) | **总待办清单（BUG + 重构 + 功能 + 部署）** |
| 12 | [12-comprehensive-status-and-fix-plan.md](./12-comprehensive-status-and-fix-plan.md) | **全面状态评估 + 数据持久化分析 + 修复计划** |
| 13 | [09-openclaw-workspace-and-skill-design-deep-analysis.md](./09-openclaw-workspace-and-skill-design-deep-analysis.md) | **OpenClaw Workspace 架构 + Skill 数据存储 + Skills v3.0** |
| — | [dev-progress.md](./dev-progress.md) | 开发进度追踪 |

---

## 阅读指南

**了解项目全貌** → Blueprint → 01-product → dev-progress

**开发后端** → 02-api → 06-security → dev-progress

**开发前端** → 01-product → 03-website → 02-api

**理解 Skills** → 07-skills-analysis → skills/

**理解 A2A 双轨模式** → 08-a2a-and-freemium → api/src/routes/discovery.ts + a2a.ts

**审查数据持久化缺口** → 09-skill-a2a-integration-gap-analysis → skills/

**Agent 注册发现设计** → 10-agent-profile-card-design → api/src/routes/discovery.ts

**全面状态评估** → 12-comprehensive-status-and-fix-plan（数据持久化 + 缺口分析 + 修复计划）

**部署上线** → 05-deploy

---

## 关键决策

| 决策 | 详见 |
|------|------|
| 不采用 AP2 协议，借鉴设计思想 | 04-AP2-protocol-analysis.md |
| 平台提成 1%（非 10%） | 07-skills-and-monetization-deep-analysis.md |
| Skills 标准化为 OpenClaw 格式 | 07-skills-and-monetization-deep-analysis.md |
| 品牌改为 ClawMarket | dev-progress.md |
| **集成 A2A 协议，免费/付费双轨** | **08-a2a-and-freemium-deep-analysis.md** |
| **A2A 双轨代码已实现** | api/src/routes/discovery.ts + a2a.ts |
| **Skill 数据持久化缺口** | 09-skill-a2a-integration-gap-analysis.md |
| **统一 Agent Profile Card** | 10-agent-profile-card-design.md |
| **总待办清单** | **11-master-todo.md** |
| **Agent 本地无持久化（最大缺口）** | **12-comprehensive-status-and-fix-plan.md** |
| **Skills v3.0: 标准 tools + 存储指令 + 心跳** | **09-openclaw-workspace-and-skill-design-deep-analysis.md** |
| **对话记录由 OpenClaw 自动保存** | **09-openclaw-workspace-and-skill-design-deep-analysis.md** |

---

**最后更新**：2026-02-16（Phase 3e: OpenClaw 深度分析 + Skills v3.0 + Bug 修复）
