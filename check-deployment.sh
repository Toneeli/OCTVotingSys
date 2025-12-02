#!/bin/bash

# 公网部署前的环境检查脚本

echo "🔍 华侨城-智慧社区投票站 环境检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查 Node.js
echo "📌 检查 Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js 已安装: $NODE_VERSION"
else
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

echo ""

# 检查 npm
echo "📌 检查 npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm 已安装: $NPM_VERSION"
else
    echo "❌ npm 未安装"
    exit 1
fi

echo ""

# 检查 Git
echo "📌 检查 Git..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git -v)
    echo "✅ Git 已安装: $GIT_VERSION"
else
    echo "⚠️  Git 未安装（可选）"
fi

echo ""

# 检查项目结构
echo "📌 检查项目结构..."
if [ -d "backend" ] && [ -d "frontend" ]; then
    echo "✅ 项目结构完整"
else
    echo "❌ 项目结构缺失"
    exit 1
fi

echo ""

# 检查后端文件
echo "📌 检查后端文件..."
if [ -f "backend/server.js" ] && [ -f "backend/package.json" ]; then
    echo "✅ 后端文件完整"
else
    echo "❌ 后端文件缺失"
    exit 1
fi

echo ""

# 检查前端文件
echo "📌 检查前端文件..."
if [ -f "frontend/src/App.js" ] && [ -f "frontend/package.json" ]; then
    echo "✅ 前端文件完整"
else
    echo "❌ 前端文件缺失"
    exit 1
fi

echo ""

# 检查端口占用
echo "📌 检查端口占用..."
BACKEND_PORT_AVAILABLE=true
FRONTEND_PORT_AVAILABLE=true

if command -v lsof &> /dev/null; then
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null; then
        echo "⚠️  端口 3001 已被占用"
        BACKEND_PORT_AVAILABLE=false
    else
        echo "✅ 端口 3001 可用"
    fi
    
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
        echo "⚠️  端口 3000 已被占用"
        FRONTEND_PORT_AVAILABLE=false
    else
        echo "✅ 端口 3000 可用"
    fi
else
    echo "⚠️  无法检查端口（请手动检查）"
fi

echo ""

# 检查磁盘空间
echo "📌 检查磁盘空间..."
DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    echo "✅ 磁盘空间充足 (使用率: ${DISK_USAGE}%)"
else
    echo "⚠️  磁盘空间即将满 (使用率: ${DISK_USAGE}%)"
fi

echo ""

# 检查网络连接
echo "📌 检查网络连接..."
if ping -c 1 8.8.8.8 &> /dev/null; then
    echo "✅ 网络连接正常"
else
    echo "⚠️  网络连接异常"
fi

echo ""

# 获取系统信息
echo "📌 系统信息..."
HOSTNAME=$(hostname)
IP_ADDRESS=$(hostname -I | awk '{print $1}')
OS_TYPE=$(uname -s)
echo "   主机名: $HOSTNAME"
echo "   IP 地址: $IP_ADDRESS"
echo "   系统: $OS_TYPE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$BACKEND_PORT_AVAILABLE" = false ] || [ "$FRONTEND_PORT_AVAILABLE" = false ]; then
    echo "⚠️  存在端口占用，请释放后重试"
    echo ""
    exit 1
fi

echo "✅ 环境检查完成，可以进行部署！"
echo ""
echo "📝 后续步骤:"
echo "  1. 编辑 backend/.env (修改 JWT_SECRET)"
echo "  2. 编辑 frontend/.env (配置 API 地址)"
echo "  3. 运行: ./deploy-production.sh"
echo ""
