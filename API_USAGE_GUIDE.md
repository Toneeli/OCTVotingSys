# 后端API完整使用指南

## 🚀 快速开始

**后端服务地址**: `http://localhost:3001`

### 系统状态检查
```bash
curl http://localhost:3001
```

响应:
```json
{
  "status": "ok",
  "message": "华侨城-智慧社区投票站后端服务运行正常",
  "timestamp": "2025-11-30T09:45:51.251Z",
  "version": "1.0",
  "endpoints": {
    "topics": "GET /api/topics",
    "auth": "POST /api/auth/login",
    "docs": "GET /api/docs"
  }
}
```

---

## 📚 API 文档

### 查看完整API文档
```bash
curl http://localhost:3001/api/docs | python3 -m json.tool
```

---

## 🔐 认证相关 API

### 1. 用户注册
**请求**:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "password123",
    "real_name": "张三",
    "unit_number": "3-201",
    "phone": "13900139000"
  }'
```

**响应**:
```json
{
  "message": "注册成功，等待审核",
  "id": 3
}
```

---

### 2. 用户登录
**请求**:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user",
    "password": "user123"
  }'
```

**响应**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "resident": {
    "id": 2,
    "username": "user",
    "real_name": "李用户"
  }
}
```

**说明**: 保存返回的 `token`，后续需要认证的API请求都需要在请求头中包含它

---

## 📋 投票议题 API

### 3. 获取所有投票议题 (公开)
**请求**:
```bash
curl http://localhost:3001/api/topics
```

**响应**:
```json
[
  {
    "id": 1,
    "title": "小区物业费调整方案",
    "description": "尊敬的各位业主...",
    "status": "active",
    "created_by": 1,
    "created_at": "2025-11-30 09:36:10",
    "options": [
      {
        "id": 1,
        "topic_id": 1,
        "option_text": "同意",
        "votes": 0,
        "created_at": "2025-11-30 09:36:10"
      },
      ...
    ]
  },
  ...
]
```

---

### 4. 获取单个投票议题 (公开)
**请求**:
```bash
curl http://localhost:3001/api/topics/1
```

**响应**: 返回指定ID的投票议题详情

---

### 5. 创建投票议题 (需认证)
**请求**:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3001/api/topics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "新的投票议题",
    "description": "议题描述...",
    "options": ["选项1", "选项2", "选项3"],
    "start_date": "2025-11-30",
    "end_date": "2025-12-07"
  }'
```

**响应**:
```json
{
  "message": "议题创建成功",
  "id": 3
}
```

---

## 🗳️ 投票相关 API

### 6. 提交投票 (需认证)
**请求**:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3001/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "topic_id": 1,
    "option_id": 1
  }'
```

**响应**:
```json
{
  "message": "投票成功"
}
```

**错误响应**:
```json
{
  "error": "您已投过票"
}
```

---

### 7. 获取投票统计 (公开)
**请求**:
```bash
curl http://localhost:3001/api/stats/topic/1
```

**响应**:
```json
{
  "topic": {
    "id": 1,
    "title": "小区物业费调整方案",
    "status": "active",
    ...
  },
  "options": [
    {
      "id": 1,
      "option_text": "同意",
      "votes": 5
    },
    {
      "id": 2,
      "option_text": "不同意",
      "votes": 2
    },
    ...
  ],
  "totalVotes": 7
}
```

---

## 👥 管理员 API

### 8. 获取待审核用户 (需认证)
**请求**:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/residents/pending
```

**响应**:
```json
[
  {
    "id": 3,
    "username": "newuser",
    "real_name": "张三",
    "unit_number": "3-201",
    "phone": "13900139000",
    "created_at": "2025-11-30 10:00:00"
  }
]
```

---

### 9. 审核用户 (需认证)
**请求**:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X PATCH http://localhost:3001/api/admin/residents/3/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "approved"
  }'
```

**响应**:
```json
{
  "message": "业主已批准"
}
```

**status 可选值**:
- `approved` - 批准（账户激活）
- `rejected` - 拒绝（注册失败）
- `disabled` - 禁用（已激活的账户被禁用）

---

## 📊 测试账户

| 角色 | 用户名 | 密码 | 状态 |
|------|--------|------|------|
| 管理员 | admin | admin123 | approved ✅ |
| 普通用户 | user | user123 | approved ✅ |

---

## 🔑 认证说明

### Bearer Token 使用
1. **登录获取 Token**:
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"user","password":"user123"}'
   ```

2. **在请求头中使用 Token**:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     http://localhost:3001/api/admin/residents/pending
   ```

### Token 特性
- **格式**: JWT (JSON Web Token)
- **过期时间**: 24小时
- **密钥**: `your-secret-key-change-in-production`

---

## 📱 cURL 使用示例

### 完整流程示例

**第1步: 登录获取 Token**
```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"user123"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

echo "Token: $TOKEN"
```

**第2步: 获取投票议题列表**
```bash
curl http://localhost:3001/api/topics | python3 -m json.tool
```

**第3步: 查看特定议题详情**
```bash
curl http://localhost:3001/api/topics/1 | python3 -m json.tool
```

**第4步: 投票**
```bash
curl -X POST http://localhost:3001/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"topic_id": 1, "option_id": 1}'
```

**第5步: 查看投票统计**
```bash
curl http://localhost:3001/api/stats/topic/1 | python3 -m json.tool
```

---

## ⚠️ 常见错误处理

### 未认证错误 (401)
```json
{
  "error": "Missing token"
}
```
**解决**: 在请求头中添加有效的 Bearer Token

### 权限不足错误 (403)
```json
{
  "error": "Invalid token"
}
```
**解决**: 检查 Token 是否过期或无效，重新登录获取新 Token

### 用户不存在错误 (401)
```json
{
  "error": "用户不存在"
}
```
**解决**: 检查用户名是否正确，确保用户已注册

### 账户待审核错误 (403)
```json
{
  "error": "账户待审核或已禁用"
}
```
**解决**: 使用管理员账户在后台审核该用户

### 重复投票错误 (400)
```json
{
  "error": "您已投过票"
}
```
**解决**: 一个用户只能对同一议题投票一次，无法修改或撤回

---

## 🧪 快速测试脚本

### Bash 脚本示例
```bash
#!/bin/bash

# 配置
API_URL="http://localhost:3001"
USERNAME="user"
PASSWORD="user123"

# 1. 获取 Token
echo "正在登录..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败"
  exit 1
fi

echo "✅ 登录成功"
echo "Token: $TOKEN"
echo ""

# 2. 获取议题列表
echo "获取投票议题..."
curl -s "$API_URL/api/topics" | python3 -m json.tool | head -50

echo ""
echo "✅ 测试完成！"
```

---

## 📖 更多资源

- **API 文档**: http://localhost:3001/api/docs
- **系统状态**: http://localhost:3001
- **代码位置**: `/Users/zen/Web3/community-voting-system/backend/server.js`

---

**最后更新**: 2025年11月30日  
**API 版本**: 1.0  
**系统状态**: ✅ 运行正常

