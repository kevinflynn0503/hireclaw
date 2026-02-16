#!/bin/bash
# ClawHire API 测试脚本
# 测试完整的任务流程：注册 → 创建任务 → 接单

set -e

API_URL="http://localhost:8787"

echo "🧪 ClawHire API 测试"
echo "===================="
echo ""

# 1. 注册雇主
echo "📝 1. 注册雇主 Agent..."
EMPLOYER_RESPONSE=$(curl -s -X POST $API_URL/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestEmployer",
    "owner_email": "test-employer-'$(date +%s)'@example.com",
    "role": "employer",
    "capabilities": ["coding", "design"]
  }')

EMPLOYER_API_KEY=$(echo $EMPLOYER_RESPONSE | jq -r '.data.api_key')
echo "✅ 雇主 API Key: $EMPLOYER_API_KEY"
echo ""

# 2. 创建任务
echo "📝 2. 创建任务..."
TASK_RESPONSE=$(curl -s -X POST $API_URL/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMPLOYER_API_KEY" \
  -d '{
    "title": "Build a todo app",
    "description": "Need a React todo app with local storage",
    "skills": ["react", "typescript"],
    "budget": 50,
    "deadline": "2026-03-01T00:00:00Z"
  }')

TASK_ID=$(echo $TASK_RESPONSE | jq -r '.data.task_id')
TASK_TOKEN=$(echo $TASK_RESPONSE | jq -r '.data.task_token')
echo "✅ 任务 ID: $TASK_ID"
echo "✅ 任务 Token: $TASK_TOKEN"
echo ""

# 3. 查看任务详情
echo "📝 3. 查看任务详情..."
curl -s $API_URL/v1/tasks/$TASK_ID | jq '.data | {title, budget, status}'
echo ""

# 4. 注册工人
echo "📝 4. 注册工人 Agent..."
WORKER_RESPONSE=$(curl -s -X POST $API_URL/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestWorker",
    "owner_email": "test-worker-'$(date +%s)'@example.com",
    "role": "worker",
    "capabilities": ["react", "typescript", "python"]
  }')

WORKER_API_KEY=$(echo $WORKER_RESPONSE | jq -r '.data.api_key')
echo "✅ 工人 API Key: $WORKER_API_KEY"
echo ""

# 5. 工人接单
echo "📝 5. 工人接单..."
CLAIM_RESPONSE=$(curl -s -X POST $API_URL/v1/tasks/$TASK_ID/claim \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $WORKER_API_KEY" \
  -d "{\"task_token\": \"$TASK_TOKEN\"}")

echo $CLAIM_RESPONSE | jq .
echo ""

# 6. 验证任务状态
echo "📝 6. 验证任务状态..."
curl -s $API_URL/v1/tasks/$TASK_ID | jq '.data | {title, status, worker_id, claimed_at}'
echo ""

# 7. 查看已接单任务列表
echo "📝 7. 查看已接单任务列表..."
curl -s "$API_URL/v1/tasks?status=claimed" | jq '.data.items | length' | \
  xargs echo "已接单任务数量:"
echo ""

echo "✅ 所有测试通过！"
echo ""
echo "🔑 保存以下 API Keys 用于后续测试："
echo "   雇主: $EMPLOYER_API_KEY"
echo "   工人: $WORKER_API_KEY"
echo "   任务: $TASK_ID"
