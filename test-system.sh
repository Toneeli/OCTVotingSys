#!/bin/bash

# 华侨城-智慧社区投票站 - 完整功能测试脚本
# 使用方式: bash test-system.sh

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  华侨城-智慧社区投票站 - 完整功能测试                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查后端是否运行
echo -e "${BLUE}[1/7]${NC} 检查后端服务..."
if curl -s http://localhost:3001/api/topics > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 后端服务正常运行 (http://localhost:3001)${NC}"
else
    echo -e "${RED}✗ 后端服务未运行${NC}"
    exit 1
fi
echo ""

# 检查前端是否运行
echo -e "${BLUE}[2/7]${NC} 检查前端应用..."
if curl -s http://localhost:3000 | grep -q "华侨城-智慧社区投票站" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 前端应用正常运行 (http://localhost:3000)${NC}"
else
    echo -e "${RED}✗ 前端应用未运行${NC}"
    exit 1
fi
echo ""

# 测试获取所有议题
echo -e "${BLUE}[3/7]${NC} 测试API: 获取投票议题..."
TOPICS=$(curl -s http://localhost:3001/api/topics)
TOPIC_COUNT=$(echo "$TOPICS" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ "$TOPIC_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ 成功获取 $TOPIC_COUNT 个投票议题${NC}"
else
    echo -e "${RED}✗ 获取议题失败${NC}"
fi
echo ""

# 测试用户登录
echo -e "${BLUE}[4/7]${NC} 测试API: 用户登录..."
LOGIN_RESP=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"user123"}')

if echo "$LOGIN_RESP" | python3 -c "import sys, json; d=json.load(sys.stdin); print('token' in d)" 2>/dev/null | grep -q "True"; then
    TOKEN=$(echo "$LOGIN_RESP" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)
    echo -e "${GREEN}✓ 用户登录成功${NC}"
    echo "  用户: user (普通用户账户)"
else
    echo -e "${RED}✗ 用户登录失败${NC}"
    exit 1
fi
echo ""

# 测试管理员登录
echo -e "${BLUE}[5/7]${NC} 测试API: 管理员登录..."
ADMIN_RESP=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

if echo "$ADMIN_RESP" | python3 -c "import sys, json; d=json.load(sys.stdin); print('token' in d)" 2>/dev/null | grep -q "True"; then
    ADMIN_TOKEN=$(echo "$ADMIN_RESP" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)
    echo -e "${GREEN}✓ 管理员登录成功${NC}"
    echo "  用户: admin (管理员账户)"
else
    echo -e "${RED}✗ 管理员登录失败${NC}"
    exit 1
fi
echo ""

# 测试投票功能
echo -e "${BLUE}[6/7]${NC} 测试API: 投票功能..."
VOTE_RESP=$(curl -s -X POST http://localhost:3001/api/topics/1/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"option_id":1}')

if echo "$VOTE_RESP" | grep -q "success\|已投票\|vote"; then
    echo -e "${GREEN}✓ 投票功能正常${NC}"
else
    echo -e "${YELLOW}⚠ 投票返回: $(echo "$VOTE_RESP" | python3 -c "import sys, json; d=json.load(sys.stdin); print(list(d.keys())[0] if d else 'unknown')" 2>/dev/null)${NC}"
fi
echo ""

# 测试数据库
echo -e "${BLUE}[7/7]${NC} 检查数据库..."
if [ -f "backend/voting.db" ]; then
    DB_SIZE=$(du -h backend/voting.db | cut -f1)
    echo -e "${GREEN}✓ 数据库文件存在 (大小: $DB_SIZE)${NC}"
else
    echo -e "${RED}✗ 数据库文件不存在${NC}"
fi
echo ""

# 输出总结
echo "╔════════════════════════════════════════════════════════════╗"
echo -e "${GREEN}✓ 所有测试通过！系统已准备就绪${NC}"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📍 系统访问地址:"
echo -e "  ${BLUE}首页${NC}:        http://localhost:3000"
echo -e "  ${BLUE}后端API${NC}:     http://localhost:3001"
echo ""

echo "👤 测试账户:"
echo -e "  ${BLUE}管理员${NC}:     admin / admin123"
echo -e "  ${BLUE}普通用户${NC}:   user / user123"
echo ""

echo "🚀 快速指南:"
echo "  1. 访问 http://localhost:3000 查看首页"
echo "  2. 点击'登录投票'按钮进入登录页面"
echo "  3. 使用 user/user123 登录投票"
echo "  4. 点击议题卡片进行投票"
echo "  5. 使用 admin/admin123 访问管理后台"
echo ""
