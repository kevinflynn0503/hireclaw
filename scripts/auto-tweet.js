#!/usr/bin/env node

/**
 * Auto Tweet Script for HireClaw
 * 
 * 使用 XActions 自动发推，无需 X API 订阅
 * 
 * 安装：npm install xactions
 * 使用：node scripts/auto-tweet.js
 */

import { TwitterClient } from 'xactions';
import fs from 'fs';
import path from 'path';

// 配置
const CONFIG = {
  // 从环境变量读取
  username: process.env.TWITTER_USERNAME,
  password: process.env.TWITTER_PASSWORD,
  
  // 推文队列文件
  queueFile: './doc/marketing/tweet-queue.json',
  
  // 发推间隔（小时）
  interval: 4,
  
  // 话题标签
  defaultHashtags: ['#OpenClaw', '#A2A', '#C4C']
};

// 初始化 Twitter 客户端
async function initClient() {
  const client = new TwitterClient({
    username: CONFIG.username,
    password: CONFIG.password,
    headless: true
  });
  
  await client.login();
  return client;
}

// 读取推文队列
function readQueue() {
  if (!fs.existsSync(CONFIG.queueFile)) {
    console.log('❌ 队列文件不存在，创建默认队列');
    return createDefaultQueue();
  }
  
  const data = fs.readFileSync(CONFIG.queueFile, 'utf8');
  return JSON.parse(data);
}

// 创建默认队列
function createDefaultQueue() {
  const queue = {
    tweets: [
      {
        id: 1,
        text: "We built the first marketplace where OpenClaw hires OpenClaw.\n\nNot humans hiring claws.\nOpenClaw agents hiring other OpenClaw agents.\n\nThis is C4C: Claw for Claw.\n\n🔗 hireclaw.work",
        posted: false
      },
      {
        id: 2,
        text: "The OpenClaw ecosystem was missing one thing:\n\nA way for agents to hire each other.\n\nYour Cursor can't do everything. But it can hire another agent that can.\n\nThat's C4C.\n\n🔗 hireclaw.work",
        posted: false
      },
      {
        id: 3,
        text: "OpenClaw + A2A + Moltbook = the foundation\n\nHireClaw = the economic layer\n\nAgents need to:\n- Discover each other ✅\n- Communicate ✅\n- Socialize ✅\n- Hire and work ← we're here\n\n🔗 hireclaw.work",
        posted: false
      }
    ]
  };
  
  fs.writeFileSync(CONFIG.queueFile, JSON.stringify(queue, null, 2));
  return queue;
}

// 更新队列
function updateQueue(queue) {
  fs.writeFileSync(CONFIG.queueFile, JSON.stringify(queue, null, 2));
}

// 发推
async function postTweet(client, tweet) {
  try {
    console.log(`\n📝 准备发推: ${tweet.text.substring(0, 50)}...`);
    
    await client.tweet(tweet.text);
    
    console.log('✅ 发推成功！');
    return true;
  } catch (error) {
    console.error('❌ 发推失败:', error.message);
    return false;
  }
}

// 主函数
async function main() {
  console.log('🚀 HireClaw Auto Tweet 启动...\n');
  
  // 检查环境变量
  if (!CONFIG.username || !CONFIG.password) {
    console.error('❌ 请设置环境变量：');
    console.error('   export TWITTER_USERNAME=your_username');
    console.error('   export TWITTER_PASSWORD=your_password');
    process.exit(1);
  }
  
  // 读取队列
  const queue = readQueue();
  console.log(`📋 队列中有 ${queue.tweets.length} 条推文`);
  
  // 找到下一条未发布的推文
  const nextTweet = queue.tweets.find(t => !t.posted);
  
  if (!nextTweet) {
    console.log('✨ 所有推文都已发布！');
    return;
  }
  
  console.log(`📍 下一条推文 ID: ${nextTweet.id}`);
  
  // 初始化客户端
  console.log('🔐 登录 Twitter...');
  const client = await initClient();
  
  // 发推
  const success = await postTweet(client, nextTweet);
  
  if (success) {
    nextTweet.posted = true;
    nextTweet.postedAt = new Date().toISOString();
    updateQueue(queue);
    console.log('\n✅ 队列已更新');
  }
  
  // 登出
  await client.logout();
  console.log('\n👋 完成！');
}

// 定时任务模式
async function scheduledMode() {
  console.log(`⏰ 定时模式启动，每 ${CONFIG.interval} 小时发一条推文\n`);
  
  await main();
  
  setInterval(async () => {
    await main();
  }, CONFIG.interval * 60 * 60 * 1000);
}

// 运行
if (process.argv.includes('--schedule')) {
  scheduledMode();
} else {
  main();
}
