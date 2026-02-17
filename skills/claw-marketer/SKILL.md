# claw-marketer

HireClaw 营销自动化 OpenClaw skill

## 功能

这个 skill 让你的 OpenClaw agent 成为营销助手，自动化社交媒体运营、内容生成和数据分析。

### 1. 社交监控

监控 Twitter/X、小红书、Hacker News 上的相关讨论。

**命令**：
- "帮我监控 #OpenClaw 话题"
- "看看有没有人提到 HireClaw"
- "今天有什么关于 A2A 协议的讨论？"

**功能**：
- 实时监控关键词和标签
- 发现新提及时通知
- 分析情感倾向
- 建议回复策略

### 2. 内容生成

从项目更新自动生成社交媒体内容。

**命令**：
- "帮我生成今天的推文"
- "写一篇小红书笔记介绍新功能"
- "把这个 commit 改成推文"

**功能**：
- 从 git commits 生成更新
- 从文档提取要点
- 多平台内容适配
- SEO 优化建议

### 3. 定时发布

管理内容队列和定时发布。

**命令**：
- "把这条推文加入队列"
- "明天早上 9 点发这条"
- "show 一下本周的发布计划"

**功能**：
- 内容日历管理
- 最佳发布时间建议
- 自动排队和发布
- 跨平台同步

### 4. 数据分析

追踪和分析营销数据。

**命令**：
- "上周数据怎么样？"
- "哪条推文表现最好？"
- "给我一份月报"

**功能**：
- 流量分析（GA、Cloudflare）
- 社交媒体互动统计
- 转化漏斗追踪
- 周报/月报生成

## 配置

在你的 OpenClaw 配置中添加：

```json
{
  "skills": {
    "claw-marketer": {
      "enabled": true,
      "platforms": {
        "twitter": {
          "enabled": true,
          "schedule": "daily",
          "hashtags": ["OpenClaw", "A2A", "C2C"],
          "auto_post": false
        },
        "xiaohongshu": {
          "enabled": true,
          "schedule": "weekly",
          "seo_optimize": true,
          "auto_post": false
        },
        "hackernews": {
          "enabled": true,
          "notify_only": true
        }
      },
      "monitoring": {
        "keywords": [
          "OpenClaw",
          "HireClaw",
          "C2C",
          "agent market",
          "A2A protocol"
        ],
        "auto_reply": false,
        "notify": true,
        "sentiment_analysis": true
      },
      "analytics": {
        "daily_report": true,
        "weekly_report": true,
        "track_conversions": true
      }
    }
  }
}
```

## 安装

```bash
clawhub install claw-marketer
```

## 环境变量

需要设置以下环境变量（根据使用的平台）：

```bash
# Twitter/X
export TWITTER_USERNAME=your_username
export TWITTER_PASSWORD=your_password

# Google Analytics (可选)
export GA_TRACKING_ID=UA-XXXXXXXX-X

# Cloudflare Analytics (可选)
export CF_ANALYTICS_TOKEN=your_token
```

## 使用示例

### 场景 1：监控和自动回复

```
你: 帮我监控一下 OpenClaw 相关讨论

Agent: 好的，已开始监控以下平台：
- Twitter: #OpenClaw, #A2A, #C2C
- Hacker News: "OpenClaw", "agent market"
- Reddit: r/OpenAI, r/MachineLearning

发现新提及时会通知你。需要自动回复吗？

你: 不用自动回复，发现了通知我就行

Agent: 收到。已设置为通知模式。
```

### 场景 2：生成推文

```
你: 看看今天的 git commits，帮我生成一条推文

Agent: 分析了今天的 3 个 commits：
- Added skill marketplace
- Fixed A2A protocol integration
- Updated docs

生成推文：

"Shipped today:
- Skill marketplace (OpenClaw agents can now sell skills)
- A2A protocol fixes (smoother agent communication)
- Better docs

Building the agent economy, one commit at a time.

hireclaw.work"

要发布吗？还是修改一下？
```

### 场景 3：数据分析

```
你: 上周数据怎么样？

Agent: 📊 上周数据总结（2月10日-2月16日）：

网站流量：
- 访问量：2,340 (+15%)
- 独立访客：1,890 (+12%)
- 跳出率：45% (-5%)

社交媒体：
- Twitter 曝光：8,500 (+20%)
- Twitter 互动：340 (+18%)
- 小红书阅读：3,200 (+25%)
- 小红书点赞：180 (+30%)

转化：
- 注册用户：28 (+12%)
- 安装 skill：15 (+7%)

📈 趋势：小红书表现最好，建议增加发布频率。

需要详细报告吗？
```

## 工作流程

### 每日自动化流程

1. **早上 8:00**
   - 检查昨日数据
   - 生成日报
   - 监控新提及

2. **中午 12:00**
   - 生成今日推文
   - 检查队列
   - 建议发布时间

3. **晚上 8:00**
   - 最佳发布时段
   - 自动发布（如启用）
   - 或通知你审核

4. **晚上 11:00**
   - 数据汇总
   - 互动分析
   - 明日规划

### 每周流程

1. **周一**：周报生成，本周规划
2. **周三**：中期检查，策略调整
3. **周五**：内容准备，周末预排
4. **周日**：数据复盘，下周准备

## 技术实现

### 社交监控

使用以下工具：
- **XActions**: Twitter/X 监控（免 API 费）
- **Web Scraping**: 小红书、HN 监控
- **Webhooks**: 实时通知

### 内容生成

基于：
- Git history 分析
- 文档内容提取
- 模板系统
- SEO 优化算法

### 数据分析

集成：
- Google Analytics API
- Cloudflare Analytics API
- 自建数据库（D1）
- 可视化图表

## 最佳实践

### 1. 不要完全自动化

保留人工审核：
- 重要推文需要批准
- 敏感话题人工处理
- 定期检查监控结果

### 2. 保持真诚

- 不要过度营销
- 分享真实思考
- 回应社区反馈
- 贡献价值内容

### 3. 数据驱动

- 追踪关键指标
- A/B 测试内容
- 优化发布时间
- 调整策略方向

### 4. 社区优先

- 参与讨论优先于推广
- 帮助他人
- 分享知识
- 建立信任

## 限制和注意事项

1. **平台政策**
   - 遵守各平台 ToS
   - 不要自动点赞/关注
   - 避免垃圾信息
   - 保持真实互动

2. **API 限制**
   - Twitter rate limits
   - 小红书反爬虫
   - 适当延迟和重试

3. **内容质量**
   - AI 生成的内容需要审核
   - 保持品牌调性
   - 避免低质量输出

4. **安全性**
   - 妥善保管凭证
   - 使用环境变量
   - 不要提交密钥到 git
   - 定期轮换密码

## 支持的平台

- ✅ Twitter/X
- ✅ 小红书（部分功能）
- ✅ Hacker News（只读监控）
- ✅ Reddit（只读监控）
- ⏳ LinkedIn（计划中）
- ⏳ 即刻（计划中）
- ⏳ V2EX（计划中）

## 贡献

欢迎贡献代码和想法！

GitHub: https://github.com/yourusername/claw-marketer

## License

MIT

## 作者

HireClaw Team

---

C2C: Claw to Claw
OpenClaw for OpenClaw
