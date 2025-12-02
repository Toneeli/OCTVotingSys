#!/bin/bash

# 社区投票系统 - 一键启动脚本
# 功能: 同时启动后端和前端服务

echo ""
echo "╔════════════════════════════════════════╗"
echo "║    🗳️  社区投票系统 - 一键启动         ║"
echo "╚════════════════════════════════════════╝"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 检查依赖是否已安装
echo "📦 检查依赖..."
if [ ! -d "$SCRIPT_DIR/backend/node_modules" ]; then
    echo "⚠️  后端依赖未安装，正在安装..."
    cd "$SCRIPT_DIR/backend"
    npm install --legacy-peer-deps > /dev/null 2>&1
fi

if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    echo "⚠️  前端依赖未安装，正在安装..."
    cd "$SCRIPT_DIR/frontend"
    npm install --legacy-peer-deps > /dev/null 2>&1
fi

echo "✅ 依赖检查完成"
echo ""

# 启动后端
echo "🚀 启动后端服务..."
cd "$SCRIPT_DIR/backend"
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "   后端 PID: $BACKEND_PID"
echo "   日志: /tmp/backend.log"

# 等待后端启动
echo "⏳ 等待后端启动..."
sleep 3

# 检查后端是否成功启动
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ 后端启动成功 (http://localhost:3001)"
else
    echo "❌ 后端启动失败"
    exit 1
fi

echo ""

# 启动前端
echo "🚀 启动前端应用..."
cd "$SCRIPT_DIR/frontend"
echo "⏳ 前端启动中，请稍候..."
echo ""
echo "════════════════════════════════════════"
npm start 2>&1 &
FRONTEND_PID=$!

# 等待用户关闭前端
wait $FRONTEND_PID

# 关闭后端
echo ""
echo "清理进程..."
kill $BACKEND_PID 2>/dev/null

echo "👋 系统已关闭"
