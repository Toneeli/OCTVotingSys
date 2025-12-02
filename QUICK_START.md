# 🚀 立即启动指南

## 快速启动（3步）

### 第1步：启动后端
打开终端，运行：
```bash
cd /Users/zen/Web3/community-voting-system/backend
npm start
```

等待看到：
```
Backend running on http://localhost:3001
```

### 第2步：启动前端
打开新的终端，运行：
```bash
cd /Users/zen/Web3/community-voting-system/frontend
npm start
```

等待看到：
```
Compiled successfully!
```

### 第3步：打开浏览器
访问：**http://localhost:3000**

---

## 即刻可测试的功能

### 1️⃣ 使用管理员账户
- **用户名**: `admin`
- **密码**: `admin123`
- **可以做**:
  - ✅ 查看所有投票议题
  - ✅ 进入管理后台
  - ✅ 查看待审核业主列表
  - ✅ 批准或拒绝业主

### 2️⃣ 使用普通业主账户
- **用户名**: `user`
- **密码**: `user123`
- **可以做**:
  - ✅ 查看首页统计
  - ✅ 查看投票议题
  - ✅ 投票表决
  - ✅ 投票后查看其他投票者信息

### 3️⃣ 使用楼栋管理员账户
- **用户名**: `buildingadmin`
- **密码**: `buildingadmin123`
- **可以做**:
  - ✅ 进入管理后台
  - ✅ 只查看 T2栋的待审核业主
  - ✅ 只批准 T2栋的业主
  - ✅ 无法看到其他楼栋的业主

---

## 核心功能演示流程

### 演示 A：普通业主投票流程
```
1. 访问 http://localhost:3000
2. 点击"登录"
3. 输入 user / user123
4. 点击投票议题（如"小区物业费调整方案"）
5. 选择一个选项（同意/不同意/弃权）
6. 点击"投票"
7. 投票成功后，点击"查看投票业主信息"查看其他投票者
```

### 演示 B：管理员审核业主流程
```
1. 访问 http://localhost:3000
2. 点击"登录"
3. 输入 admin / admin123
4. 点击"管理后台"
5. 查看"待审核业主"列表
6. 点击"批准"或"拒绝"
7. 业主状态改变后，该业主可登录并投票
```

### 演示 C：楼栋管理员权限演示
```
1. 访问 http://localhost:3000
2. 点击"登录"
3. 输入 buildingadmin / buildingadmin123
4. 点击"管理后台"
5. 查看"待审核业主"列表
   ➜ 注意：只显示 T2栋的业主！
   ➜ 看不到 T1栋、T3栋等其他楼栋的业主
```

---

## API 端点快速参考

### 获取所有投票议题
```bash
curl http://localhost:3001/api/topics
```

### 用户登录
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### 获取待审核业主（需要 Token）
```bash
curl -X GET http://localhost:3001/api/admin/residents/pending \
  -H "Authorization: Bearer {your_token_here}"
```

### 提交投票（需要 Token）
```bash
curl -X POST http://localhost:3001/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your_token_here}" \
  -d '{
    "topic_id": 1,
    "option_id": 1
  }'
```

查看完整 API 文档：**http://localhost:3001/api/docs**

---

## 项目文件导航

| 文件/目录 | 说明 |
|----------|------|
| `/backend/server.js` | 后端主文件（所有 API 端点） |
| `/backend/init-test-data.js` | 测试数据初始化脚本 |
| `/frontend/src/pages/` | 前端页面组件 |
| `/COMPLETE_DOCUMENTATION.md` | 📖 完整项目文档（必读） |
| `/PROJECT_STATUS.md` | 项目状态总结 |
| `/COMPLETION_CHECKLIST.md` | 功能完成度检查表 |
| `/Postman_Collection.json` | Postman API 集合 |

---

## 如果遇到问题

### 问题1：前端报错 "Cannot find module 'ajv'"
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm start
```

### 问题2：后端无法启动
```bash
cd backend
rm voting.db
npm start
```

### 问题3：忘记 Token
重新登录获取新 Token，或使用公开端点（无需认证）：
- `GET /api/topics`
- `GET /api/stats/topic/:id`
- `GET /`
- `GET /api/docs`

### 问题4：业主无法登录
- 检查业主状态是否为 "approved"
- 请求管理员先批准该业主

---

## 系统架构一览

```
用户浏览器
    ↓
React 前端 (http://localhost:3000)
    ↓
Express 后端 (http://localhost:3001)
    ↓
SQLite 数据库 (voting.db)
```

---

## 重要文件清单

### ✅ 后端
- `backend/server.js` - 所有 API 端点、认证、权限控制
- `backend/voting.db` - SQLite 数据库（自动创建）
- `backend/init-test-data.js` - 测试数据初始化
- `backend/package.json` - 依赖定义

### ✅ 前端
- `frontend/src/App.js` - 路由和主应用
- `frontend/src/pages/Home.js` - 首页（投票列表和统计）
- `frontend/src/pages/Login.js` - 登录页
- `frontend/src/pages/Register.js` - 注册页
- `frontend/src/pages/Vote.js` - 投票页
- `frontend/src/pages/Admin.js` - 管理后台

### ✅ 文档
- `COMPLETE_DOCUMENTATION.md` - 📖 必读的完整文档
- `PROJECT_STATUS.md` - 项目状态
- `COMPLETION_CHECKLIST.md` - 功能检查表
- `README_RUN.md` - 快速启动
- `API_USAGE_GUIDE.md` - API 使用指南
- `Postman_Collection.json` - Postman 导入

---

## 预期看到的界面

### 首页
- 📊 投票议题列表卡片
- 📈 投票进度条
- 👥 参与人数统计
- 🔐 登录/注册按钮（未登录时）

### 登录后
- 完整导航菜单
- 投票界面
- 管理后台（如果是管理员）
- 查看投票者信息（投票后）

### 管理后台
- 待审核业主列表（超级管理员看全部，楼栋管理员看自己楼栋）
- 批准/拒绝按钮
- 业主楼栋和联系方式显示

---

## ✅ 快速验证清单

启动后，逐个确认：

- [ ] 后端运行在 http://localhost:3001
- [ ] 前端运行在 http://localhost:3000
- [ ] 能使用 admin/admin123 登录
- [ ] 能使用 user/user123 登录
- [ ] 能看到投票议题列表
- [ ] 能点击议题进行投票
- [ ] 投票后能查看投票者信息
- [ ] 管理员能看到待审核业主
- [ ] 楼栋管理员只能看到自己楼栋的业主
- [ ] API 文档在 http://localhost:3001/api/docs 可访问

---

🎉 **系统已就绪！** 现在可以开始使用和测试了！

如有任何问题，请查看 `COMPLETE_DOCUMENTATION.md`

**祝您使用愉快！** 🚀
