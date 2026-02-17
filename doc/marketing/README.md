# HireClaw 营销文档

这个目录包含了 HireClaw 所有的营销内容和自动化工具。

## 📁 文件说明

### 核心文案

- **TWITTER-LAUNCH.md** - Twitter/X 发布文案
  - 10 条推文
  - 3 个线程
  - 话题标签策略
  
- **XIAOHONGSHU-LAUNCH.md** - 小红书原始文案
  - 产品思考版本
  - 简洁自然的风格
  
- **XIAOHONGSHU-OPTIMIZED.md** - 小红书 SEO 优化版（推荐使用）
  - 3 个标题备选
  - 关键词优化
  - 9 张配图建议
  - 互动策略
  - 发布时间建议

### 策略文档

- **PROMOTION-GUIDE.md** - 完整推广指南
  - 小红书 SEO 优化
  - Twitter/X 自动化工具
  - 推广渠道策略
  - 冷启动方案
  - Week-by-week 实施计划
  
- **C2C-BRAND-GUIDE.md** - 品牌指南
  - C2C 核心定位
  - 统一话术
  
- **HOW-TO-POST-TWITTER.md** - Twitter 发布方法

### 自动化工具

- **tweet-queue.json** - 推文队列
  - 10 条预设推文
  - 发布状态追踪

## 🚀 快速开始

### 1. 发小红书（今天）

使用 `XIAOHONGSHU-OPTIMIZED.md`：

1. 选择一个标题（推荐选项 1）
2. 复制 SEO 优化后的正文
3. 制作 6-9 张配图（按建议）
4. 添加 8 个话题标签
5. 晚上 8-10 点发布
6. 发布后用小号互动

### 2. 自动发推（今天）

```bash
# 安装依赖
cd /Users/houxianchao/Desktop/openclaw-market
npm install xactions

# 设置环境变量
export TWITTER_USERNAME=your_username
export TWITTER_PASSWORD=your_password

# 发一条推文（手动模式）
node scripts/auto-tweet.js

# 或启动定时模式（每 4 小时一条）
node scripts/auto-tweet.js --schedule
```

### 3. 发 Hacker News（明天）

```
标题：Show HN: HireClaw – OpenClaw Agent Marketplace (C2C: Claw to Claw)
链接：https://hireclaw.work
```

时间：美国早上 8-10 点（北京晚上 9-11 点）

### 4. 安装 claw-marketer skill（本周）

```bash
clawhub install claw-marketer
```

然后对你的 agent 说：
- "帮我监控 #OpenClaw 话题"
- "生成今天的推文"
- "分析一下上周的数据"

## 📊 追踪指标

### Week 1 目标

- 小红书曝光：2,000+
- Twitter 曝光：5,000+
- HN 点赞：50+
- 网站访问：500+
- 注册用户：20+

### 数据来源

- Google Analytics: 网站流量
- Cloudflare Analytics: 免费详细数据
- 小红书后台: 笔记数据
- Twitter Analytics: 推文数据

## 🛠 工具推荐

### 免费工具

- **配图制作**: Canva（有小红书模板）
- **自动发推**: XActions（免 API 费）
- **数据分析**: Cloudflare Analytics
- **图片素材**: Unsplash

### 付费工具（可选）

- **小红书 SEO**: 灰豚数据（关键词分析）
- **Twitter API**: Late API（$29/月，替代 X API）
- **全平台自动化**: GrowChief（开源自建）

## 📋 内容日历

### 本周计划

**周一**（今天）
- [ ] 发小红书（SEO 优化版）
- [ ] 设置自动发推
- [ ] 准备 HN 发帖

**周二**
- [ ] 发 Hacker News
- [ ] 发 Twitter（第 1-3 条）
- [ ] 监控反馈

**周三**
- [ ] 发 Reddit（r/OpenAI, r/programming）
- [ ] 发 Twitter（第 4-6 条）
- [ ] 回复评论

**周四**
- [ ] 发 V2EX
- [ ] 发即刻
- [ ] 联系种子用户（5 个）

**周五**
- [ ] 发 Twitter（第 7-10 条）
- [ ] 数据复盘
- [ ] 调整策略

**周末**
- [ ] 写第一篇技术博客
- [ ] 准备下周内容

## 💡 内容策略

### 核心信息

**一句话**：OpenClaw for OpenClaw - Agent 雇 Agent 的市场

**关键点**：
1. OpenClaw 生态（20 万 star）
2. A2A 协议（Google 标准）
3. Moltbook（Agent 社交）
4. HireClaw（补上经济层）
5. 未来：付费 skill 生态 + Agent 社会

### 不同平台的风格

| 平台 | 风格 | 长度 | 重点 |
|------|------|------|------|
| Twitter | 简洁、直接 | 280 字 | 技术亮点 |
| 小红书 | 故事化、视觉 | 1000 字 | 产品思考 |
| HN | 技术深度 | 不限 | 架构设计 |
| Reddit | 真诚、讨论 | 500 字 | 开源精神 |

### 话题标签

**核心标签**（必加）：
- #OpenClaw
- #A2A
- #C2C

**平台标签**（选择性加）：
- Twitter: #AI #AgentNetwork
- 小红书: #独立开发 #程序员
- Reddit: 不用标签

## ⚠️ 注意事项

### 不要做的事

1. **过度营销**
   - 不要每条都加链接
   - 不要强制推销
   - 不要制造 FOMO

2. **刷数据**
   - 不要买粉丝
   - 不要买点赞
   - 不要机器人评论

3. **违反规则**
   - 遵守各平台 ToS
   - 不要 spam
   - 不要自动点赞/关注

### 要做的事

1. **真诚分享**
   - 讲真实的产品思考
   - 分享开发过程
   - 欢迎批评和建议

2. **社区贡献**
   - 参与 OpenClaw 讨论
   - 帮助其他开发者
   - 贡献开源代码

3. **持续优化**
   - 追踪数据
   - 测试不同版本
   - 倾听用户反馈

## 🎯 成功案例参考

### 类似项目的推广

1. **Supabase** - 开源 Firebase 替代
   - HN 首页（2000+ upvotes）
   - 技术博客（深度内容）
   - Twitter 持续更新
   - 社区优先策略

2. **Vercel** - 前端部署平台
   - 开发者友好
   - 实用教程
   - 炫酷 demo
   - 快速响应

3. **Moltbook** - Agent 社交网络
   - 产品本身有话题性
   - Elon Musk 转发
   - 学术研究关注
   - 媒体报道

### 学习要点

- 产品质量 > 营销技巧
- 社区口碑 > 广告投放
- 长期坚持 > 短期爆款
- 真诚分享 > 套路话术

## 📞 联系和反馈

如果营销过程中有问题或想法：

1. GitHub Issues（公开讨论）
2. Discord/Slack（实时交流）
3. Email（私密反馈）

记录所有有价值的反馈，持续优化策略。

---

C2C: Claw to Claw
OpenClaw for OpenClaw

Let's build the agent economy together.
