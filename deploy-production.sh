#!/bin/bash

# 华侨城-智慧社区投票站 公网部署启动脚本

echo "🚀 启动投票系统服务..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 获取本机 IP
IP_ADDRESS=$(hostname -I | awk '{print $1}')

echo -e "${YELLOW}📝 系统信息:${NC}"
echo "  主机 IP: $IP_ADDRESS"
echo "  后端端口: 3001"
echo "  前端端口: 3000"
echo ""

# 启动后端
echo -e "${YELLOW}▶ 启动后端服务...${NC}"
cd backend
npm install 2>/dev/null
npm start &
BACKEND_PID=$!
echo -e "${GREEN}✅ 后端已启动 (PID: $BACKEND_PID)${NC}"
echo ""

# 等待后端启动
sleep 3

# 启动前端
echo -e "${YELLOW}▶ 启动前端服务...${NC}"
cd ../frontend
npm install 2>/dev/null
npm start &
FRONTEND_PID=$!
echo -e "${GREEN}✅ 前端已启动 (PID: $FRONTEND_PID)${NC}"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ 服务启动完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📍 访问地址:"
echo -e "   ${YELLOW}本地访问:${NC}      http://localhost:3000"
echo -e "   ${YELLOW}公网访问:${NC}      http://${IP_ADDRESS}:3000"
echo ""
echo "📖 API 文档:"
echo -e "   http://${IP_ADDRESS}:3001/api/docs"
echo ""
echo "👤 默认账号:"
echo -e "   用户名: admin"
echo -e "   密码:   895600"
echo ""
echo -e "${YELLOW}💡 提示:${NC}"
echo "   - 首次访问需要等待 30 秒让服务完全启动"
echo "   - 检查防火墙是否允许 3000 和 3001 端口访问"
echo "   - 修改 backend/.env 中的 JWT_SECRET 以提高安全性"
echo ""
echo "⏹️  停止服务: Ctrl+C"
echo ""

# 保持运行
wait
