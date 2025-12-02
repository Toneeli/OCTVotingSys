#!/bin/bash

# 启动后端和前端

echo "🚀 启动社区投票系统..."
echo ""

# 后端
echo "▶️  启动后端 (3001)..."
cd /Users/zen/Web3/community-voting-system/backend
npm start &
BACKEND_PID=$!

sleep 2

# 前端
echo "▶️  启动前端 (3000)..."
cd /Users/zen/Web3/community-voting-system/frontend
npm start &
FRONTEND_PID=$!

sleep 5

echo ""
echo "✅ 系统启动完成!"
echo "   后端: http://localhost:3001"
echo "   前端: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止"

# 保持运行
wait
