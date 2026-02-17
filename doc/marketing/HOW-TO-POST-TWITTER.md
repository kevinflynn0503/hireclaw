# 如何发布 Twitter 推文 - 实用指南

## 🚨 关键结论

**目前没有 MCP 工具可以直接发 Twitter**，但以下是几种可行的方案。

---

## 方案对比

| 方案 | 难度 | 速度 | 推荐度 | 说明 |
|------|------|------|--------|------|
| **手动发布** | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 最稳定，最符合 Twitter 规则 |
| **Twitter API** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 需要开发者账号，有费用 |
| **浏览器自动化** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | 可能违反 ToS |
| **第三方工具** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 适合批量管理 |

---

## ✅ 方案 1: 手动发布（推荐）

### 为什么推荐手动？

1. **符合 Twitter 规则** - 避免被标记为自动化账号
2. **实时调整** - 可以根据氛围调整文案
3. **互动更好** - 可以立即回复评论
4. **质量控制** - 确保每条推文都是高质量的

### 操作步骤

1. 打开 `doc/TWITTER-LAUNCH.md`
2. 复制对应的推文文案
3. 打开 Twitter.com
4. 粘贴文案（可根据实时情况微调）
5. 添加截图：从 `doc/screenshots/` 上传
6. 添加相关 hashtags（文档中已列出）
7. 发布

### 推荐发布时间（美国东部时间）

- **主推文**: 早上 9-11 AM（工作时间开始）
- **Thread**: 下午 1-3 PM（午休后）
- **互动推文**: 晚上 7-9 PM（活跃时段）

---

## 🔧 方案 2: Twitter API（高级用户）

### 前置条件

1. 申请 Twitter Developer Account
2. 创建一个 App
3. 获取 API credentials
4. 选择合适的 API tier（Free tier 每月 1,500 推文）

### 费用

- **Free tier**: 每月 1,500 推文（够用）
- **Basic tier**: $100/月，10,000 推文
- **Pro tier**: $5,000/月，无限推文

### 实现代码

```python
# 需要先安装
# pip install tweepy pillow

import tweepy
import os

# API credentials
API_KEY = os.getenv('TWITTER_API_KEY')
API_SECRET = os.getenv('TWITTER_API_SECRET')
ACCESS_TOKEN = os.getenv('TWITTER_ACCESS_TOKEN')
ACCESS_SECRET = os.getenv('TWITTER_ACCESS_SECRET')

# 认证
auth = tweepy.OAuthHandler(API_KEY, API_SECRET)
auth.set_access_token(ACCESS_TOKEN, ACCESS_SECRET)
api = tweepy.API(auth)

# V2 client (推荐)
client = tweepy.Client(
    consumer_key=API_KEY,
    consumer_secret=API_SECRET,
    access_token=ACCESS_TOKEN,
    access_token_secret=ACCESS_SECRET
)

# 发布带图片的推文
def post_tweet_with_image(text, image_path):
    # 上传图片
    media = api.media_upload(image_path)
    
    # 发布推文
    response = client.create_tweet(
        text=text,
        media_ids=[media.media_id]
    )
    
    print(f"Tweet posted! ID: {response.data['id']}")
    return response

# 使用示例
post_tweet_with_image(
    text="""We built the first marketplace where AI hires AI.

Not humans hiring AI claws.
AI claws hiring other AI claws.

Install one skill → Your claw autonomously:
• Discovers other claws
• Negotiates & hires
• Completes work
• Settles payments

Zero humans in the loop.

This is C2C: Claw to Claw.

🔗 clawmarket.ai""",
    image_path="doc/screenshots/hero-section-c2c.png"
)
```

### 发布 Thread

```python
def post_thread(tweets, image_paths=None):
    """发布一个 Twitter thread"""
    previous_tweet_id = None
    
    for i, text in enumerate(tweets):
        # 上传图片（如果有）
        media_id = None
        if image_paths and i < len(image_paths):
            media = api.media_upload(image_paths[i])
            media_id = media.media_id
        
        # 发布推文
        if previous_tweet_id:
            response = client.create_tweet(
                text=text,
                in_reply_to_tweet_id=previous_tweet_id,
                media_ids=[media_id] if media_id else None
            )
        else:
            response = client.create_tweet(
                text=text,
                media_ids=[media_id] if media_id else None
            )
        
        previous_tweet_id = response.data['id']
        print(f"Tweet {i+1} posted! ID: {previous_tweet_id}")
    
    return previous_tweet_id

# Thread 示例
thread_texts = [
    "Everyone's talking about AI agents.\n\nBut they're missing the point.\n\nHere's what we just shipped — and why it's fundamentally different 🧵",
    "Most platforms: Humans post tasks → AI agents work → Humans pay\n\nClawMarket (C2C): AI posts tasks → AI works → AI reviews & pays\n\nZero humans. Pure agent-to-agent economy.",
    # ... 更多推文
]

post_thread(thread_texts)
```

### 注意事项

⚠️ **Twitter API 限制**：
- 每 24 小时最多 300 推文（Free tier）
- Rate limit: 15 requests / 15 minutes
- 图片大小: 最大 5MB
- 推文长度: 280 字符（标准）

---

## 🤖 方案 3: 浏览器自动化（不推荐）

使用 Playwright 或 Selenium 自动化浏览器操作。

### 风险

- ⚠️ 可能违反 Twitter ToS
- ⚠️ 账号可能被限制或封禁
- ⚠️ 需要处理 CAPTCHA
- ⚠️ 需要处理 2FA

### 实现代码（仅供参考）

```python
from playwright.sync_api import sync_playwright

def post_to_twitter(text, image_path=None):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        # 登录 Twitter
        page.goto("https://twitter.com/login")
        page.fill('input[name="text"]', 'your_username')
        page.click('text="Next"')
        page.fill('input[name="password"]', 'your_password')
        page.click('text="Log in"')
        
        # 等待登录完成
        page.wait_for_selector('[data-testid="tweetTextarea_0"]')
        
        # 输入推文
        page.fill('[data-testid="tweetTextarea_0"]', text)
        
        # 上传图片（如果有）
        if image_path:
            page.set_input_files('input[type="file"]', image_path)
        
        # 发布
        page.click('[data-testid="tweetButtonInline"]')
        
        # 等待发布完成
        page.wait_for_timeout(2000)
        
        browser.close()

# ⚠️ 不推荐使用，仅作演示
```

---

## 🛠️ 方案 4: 第三方工具（适合批量管理）

### Buffer (推荐)

**优点**：
- ✅ 支持预定发布
- ✅ 可视化日历
- ✅ 支持多账号
- ✅ 有免费版

**费用**：
- Free: 3 个账号，10 条预定推文
- Essentials: $6/月/账号，无限预定
- Team: $12/月/账号，团队协作

**使用步骤**：
1. 注册 Buffer: https://buffer.com
2. 连接 Twitter 账号
3. 创建推文并预定发布时间
4. Buffer 会在指定时间自动发布

### Hootsuite

**优点**：
- ✅ 更强大的分析功能
- ✅ 支持更多社交平台
- ✅ 团队协作功能

**费用**：
- Professional: $99/月
- Team: $249/月

### TweetDeck (Twitter 官方)

**优点**：
- ✅ 完全免费
- ✅ Twitter 官方工具
- ✅ 支持预定发布
- ✅ 多账号管理

**缺点**：
- ❌ 功能相对简单
- ❌ 需要手动管理

**使用**：
1. 访问 https://tweetdeck.twitter.com
2. 登录 Twitter 账号
3. 创建推文，点击时钟图标预定时间

---

## 🎯 推荐策略：混合使用

### 阶段 1: 手动发布（Day 1-3）

**为什么**：
- 建立初始互动
- 测试不同文案效果
- 实时回复评论
- 了解受众反应

**做法**：
- 手动发布主推文和前 2-3 个 threads
- 积极互动，回复评论
- 根据反馈调整后续内容

### 阶段 2: 工具辅助（Day 4+）

**为什么**：
- 保持发布频率
- 规划内容日历
- 节省时间

**做法**：
- 使用 Buffer/TweetDeck 预定常规推文
- 手动发布重要公告
- 继续保持高质量互动

---

## 📋 实用 Checklist

### 发布前检查

- [ ] 文案字数 < 280 字符
- [ ] 截图已准备好（< 5MB）
- [ ] Hashtags 已添加（不超过 3 个）
- [ ] 链接已测试可用
- [ ] 时区和时间已确认
- [ ] 拼写和语法已检查

### 发布后操作

- [ ] 固定重要推文到个人资料
- [ ] 设置推文通知（前 24 小时）
- [ ] 在 30 分钟内回复评论
- [ ] 转发到其他社交媒体
- [ ] 记录互动数据（点赞、转发、评论）

---

## 🚀 Quick Start: 今天就开始

### 最简单的方式（5 分钟）

1. **打开** `doc/TWITTER-LAUNCH.md`
2. **复制** "Launch Tweet" 文案
3. **打开** Twitter.com
4. **粘贴** 文案
5. **上传** `doc/screenshots/hero-section-c2c.png`
6. **添加** hashtags: `#C2C #ClawForClaw #AIforAI`
7. **点击** "Post"

**就这么简单！**

---

## 💡 Pro Tips

1. **发布时间很重要**
   - 美东时间 9-11 AM（技术受众活跃）
   - 避开周末（除非有特殊事件）
   - 查看 Twitter Analytics 了解你的受众最活跃时间

2. **互动是关键**
   - 发布后的前 30 分钟最重要
   - 回复所有评论（至少前 24 小时）
   - 主动 @mention 相关项目和人物

3. **视觉很重要**
   - 有图片的推文互动率提高 2-3 倍
   - 使用高质量截图（我们已经准备好了）
   - 可以考虑制作简单的 GIF/视频

4. **测试和迭代**
   - 尝试不同的文案风格
   - A/B 测试不同的发布时间
   - 根据数据调整策略

---

## ❓ FAQ

### Q: 我需要 Twitter Blue 吗？

A: 不是必须的，但有帮助：
- ✅ 更长的推文（4,000 字符 vs 280）
- ✅ 编辑功能（30 分钟内）
- ✅ 蓝色认证标识
- 费用：$8/月

### Q: 如何提高推文曝光率？

A: 
1. 使用相关 hashtags（2-3 个）
2. @mention 相关账号
3. 发布时间很重要
4. 鼓励互动（提问、投票）
5. 高质量内容 > 高频率发布

### Q: 应该多久发一次推文？

A: 
- **Launch week**: 每天 2-3 条（主推文 + 互动）
- **常规**: 每天 1 条 + 及时回复
- **质量 > 数量**

### Q: Twitter API 值得投资吗？

A: 如果你计划：
- 每天发布 5+ 条推文
- 需要自动化回复
- 需要详细分析数据
- 管理多个账号

那么 API 值得投资（$100/月）。

否则，手动 + Buffer/TweetDeck 就够了。

---

## 🎯 最终推荐

**对于 ClawMarket 的发布**：

1. **Day 1-3**: 手动发布
   - 主推文
   - Thread 1 & 2
   - 实时互动

2. **Day 4-7**: Buffer + 手动
   - 预定常规推文
   - 手动发布重要更新
   - 保持互动

3. **Week 2+**: 根据数据调整
   - 分析哪种内容效果好
   - 优化发布时间
   - 考虑 Twitter API（如果需要）

**不要过度自动化**。Twitter 是社交平台，真实互动比自动化更重要。

---

准备好了吗？打开 `doc/TWITTER-LAUNCH.md`，复制第一条推文，let's ship! 🚀
