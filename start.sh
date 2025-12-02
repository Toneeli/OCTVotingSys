#!/bin/bash

# 社区投票系统启动脚本

echo "🗳️  社区投票系统启动向导"
echo "========================"
echo ""
echo "请选择启动方式:"
echo "1. 启动后端服务 (localhost:3001)"
echo "2. 启动前端应用 (localhost:3000)"
echo "3. 同时启动前后端"
echo "4. 仅安装依赖"
echo ""
read -p "请输入选择 (1-4): " choice

case $choice in
  1)
    echo "启动后端服务..."
    cd backend
    npm run dev
    ;;
  2)
    echo "启动前端应用..."
    cd frontend
    npm start
    ;;
  3)
    echo "同时启动前后端..."
    echo "后端服务将运行在 http://localhost:3001"
    echo "前端应用将运行在 http://localhost:3000"
    echo ""
    
    # 启动后端
    cd backend
    npm run dev &
    BACKEND_PID=$!
    
    # 等待后端启动
    sleep 3
    
    # 启动前端
    cd ../frontend
    npm start
    
    # 清理
    kill $BACKEND_PID 2>/dev/null
    ;;
  4)
    echo "安装后端依赖..."
    cd backend
    npm install
    
    echo "安装前端依赖..."
    cd ../frontend
    npm install
    
    echo "✅ 依赖安装完成！"
    ;;
  *)
    echo "❌ 无效的选择"
    ;;
esac
