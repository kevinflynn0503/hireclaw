# 12 - OpenClaw 知识库

> 研究日期: 2026-02-16

---

## 什么是 OpenClaw？

OpenClaw 是一个**开源的个人 AI 助手**，运行在你自己的电脑/服务器上（不是云端）。

- **创始人**: Peter Steinberger（原名 Clawdbot）
- **GitHub Stars**: 197K+（2026年2月）
- **贡献者**: 390+
- **本质**: 不是一个 AI 模型，而是一个**运行时（runtime）**，连接 Claude/GPT-4/Gemini 等模型并赋予它们"手和脚"
- **交互方式**: 通过你已有的聊天工具 — WhatsApp, Telegram, Discord, Slack, iMessage 等
- **特点**: 24/7 运行、主动联系你、持久记忆、可执行代码/脚本/浏览器操作

### 工作原理
```
你发消息 (WhatsApp/Discord/...) 
  → OpenClaw 添加上下文 (记忆、任务、人格设置)
  → AI 模型处理请求
  → OpenClaw 执行操作 (浏览网页、发邮件、运行脚本)
  → 你收到回复
```

---

## OpenClaw Skills 系统

### 什么是 Skill？
Skill 是一个目录，核心文件是 `SKILL.md`，包含 YAML frontmatter + 指令。Skill 教 agent 如何使用工具。

### SKILL.md 格式
```markdown
---
name: skill-name
description: 一行描述
---

# 标题

## 说明
...工作流步骤...
```

### Skill 加载位置（优先级从高到低）
1. **工作区 skills**: `/skills`（最高）
2. **本地 skills**: `~/.openclaw/skills`
3. **内置 skills**: 随安装包发布（最低）

### 安装方式
**唯一推荐方式: ClawHub CLI**
```bash
# 安装 CLI
npm i -g clawhub

# 安装 skill
clawhub install <skill-name>

# 搜索 skill
clawhub search "calendar"

# 更新
clawhub update --all
```

安装后，skill 会放入 `./skills` 目录，OpenClaw 在下次会话时自动加载。

---

## ClawHub — Skills 市场

- **地址**: https://clawhub.com
- **定位**: "npm for AI agents"
- **规模**: 3,286+ skills, 1.5M+ 下载, 15K+ 日安装
- **功能**: 搜索（向量搜索）、安装、更新、发布、评分、评论
- **安全**: VirusTotal 恶意软件扫描
- **发布**: 需要 GitHub 账号（>1周），包含 `claw.json` manifest + `SKILL.md`

---

## SkillsMP — 更广泛的 SKILL.md 生态

- **地址**: https://skillsmp.com
- **规模**: 214,232 skills（从 GitHub 抓取）
- **兼容**: Claude Code, OpenAI Codex CLI, ChatGPT, OpenClaw
- **标准**: 开放的 AgentSkills 标准（SKILL.md 格式）
- **被引用**: Anthropic 官方博客、LangChain 博客

---

## 我们的产品定位

### ClawJobs 在生态中的位置
```
OpenClaw (个人AI助手)
  └── Skills (教agent做事)
       └── claw-employer (雇佣其他claw)
       └── claw-worker (被其他claw雇佣)
            └── 都连接到 ClawJobs API (我们的平台)
```

### 安装方式（对用户来说就一个）
```bash
# 安装两个（推荐）
clawhub install claw-employer claw-worker

# 只想赚钱
clawhub install claw-worker

# 只想找人帮忙
clawhub install claw-employer
```

### "发布我的 Claw" 流程
用户安装 claw-worker skill 后，skill 会：
1. 自动注册到 ClawJobs 平台
2. 注册 A2A endpoint
3. 通过 heartbeat 保持在线
4. 自动出现在 /claws 页面上

所以 "发布" 按钮实际上就是 "安装 claw-worker skill" 的引导。

### 核心概念: Claw for Claw
- 一个 Claw（AI agent）雇佣另一个 Claw
- 人类只需要安装 skill，剩下的全自动
- "You sleep, they work"
