#!/bin/bash

echo "🔍 社区投票系统完整性检查"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 计数器
total=0
passed=0

# 检查函数
check_file() {
    total=$((total + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        passed=$((passed + 1))
    else
        echo -e "${RED}❌${NC} $1 (缺失)"
    fi
}

check_dir() {
    total=$((total + 1))
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $1/"
        passed=$((passed + 1))
    else
        echo -e "${RED}❌${NC} $1/ (缺失)"
    fi
}

echo "📁 检查后端文件..."
check_file "backend/server.js"
check_file "backend/package.json"
check_file "backend/init-test-data.js"
check_file "backend/.env.example"
check_dir "backend/node_modules"
echo ""

echo "📁 检查前端文件..."
check_file "frontend/public/index.html"
check_file "frontend/package.json"
check_file "frontend/src/index.js"
check_file "frontend/src/App.js"
check_file "frontend/src/api/client.js"
check_file "frontend/src/api/auth.js"
check_file "frontend/src/api/voting.js"
check_file "frontend/src/api/admin.js"
check_file "frontend/src/context/AuthContext.js"
check_file "frontend/src/components/Layout.js"
check_file "frontend/src/pages/Login.js"
check_file "frontend/src/pages/Register.js"
check_file "frontend/src/pages/TopicList.js"
check_file "frontend/src/pages/TopicDetail.js"
check_file "frontend/src/pages/AdminDashboard.js"
check_file "frontend/.env.example"
check_dir "frontend/node_modules"
echo ""

echo "📁 检查文档文件..."
check_file "README.md"
check_file "QUICKSTART.md"
check_file "PROJECT_SUMMARY.md"
echo ""

echo "📊 检查结果: ${GREEN}${passed}${NC}/${total} 文件检查通过"
echo ""

if [ $passed -eq $total ]; then
    echo -e "${GREEN}🎉 项目完整性检查通过！${NC}"
    echo ""
    echo "接下来可以："
    echo "1. 初始化测试数据: cd backend && npm run init-test"
    echo "2. 启动后端服务: cd backend && npm run dev"
    echo "3. 启动前端应用: cd frontend && npm start"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  某些文件缺失，请检查！${NC}"
    exit 1
fi
