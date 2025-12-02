# 🗳️ 社区投票系统

[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](README.md)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)](README.md)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

一个完整的社区/小区业主投票表决系统，支持多楼栋管理、权限控制、实时统计等功能。

## ✨ 主要特性

- 🏢 **多楼栋管理** - 支持多个楼栋，业主注册时关联特定楼栋
- 👤 **完整认证系统** - JWT Token + bcrypt 密码加密
- 🗳️ **投票系统** - 创建议题、投票、查看结果和投票者信息
- 👨‍💼 **多层级权限** - 超级管理员、楼栋管理员、普通业主
- 📊 **实时统计** - 投票进度、参与人数、结果统计
- 📱 **现代化 UI** - 基于 Ant Design 的响应式设计
- 📖 **完整文档** - 3000+ 行详细文档和 API 指南

## 🚀 快速开始

### 前置要求
- Node.js 14+
- npm 或 yarn

### 3 步启动

#### 1. 启动后端
```bash
cd backend
npm install
npm start
```
✅ 后端运行在 `http://localhost:3001`

#### 2. 启动前端
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```
✅ 前端运行在 `http://localhost:3000`

#### 3. 打开浏览器
访问 **[http://localhost:3000](http://localhost:3000)**

👉 **详细启动指南**: 查看 [QUICK_START.md](./QUICK_START.md)

## 👥 测试账户

| 角色 | 用户名 | 密码 | 楼栋 |
|------|--------|------|------|
| 超级管理员 | `admin` | `admin123` | T1栋 |
| 普通业主 | `user` | `user123` | T2栋 |
| 楼栋管理员 | `buildingadmin` | `buildingadmin123` | T2栋 |

## 📚 完整文档

| 文档 | 说明 |
|------|------|
| [QUICK_START.md](./QUICK_START.md) | 🚀 快速启动指南（推荐首先阅读） |
| [COMPLETE_DOCUMENTATION.md](./COMPLETE_DOCUMENTATION.md) | 📖 完整项目文档（2000+ 行） |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | 📊 项目状态总结 |
| [API_USAGE_GUIDE.md](./API_USAGE_GUIDE.md) | 🔌 API 使用指南 |
| [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) | ✅ 功能完成度检查表 |
| [DELIVERY_SUMMARY.md](./DELIVERY_SUMMARY.md) | 📋 项目交付总结 |

## 🔌 主要 API 端点

### 认证
- `POST /api/auth/register` - 注册新业主（需楼栋信息）
- `POST /api/auth/login` - 业主登录

### 投票
- `GET /api/topics` - 获取所有议题
- `POST /api/votes` - 提交投票
- `GET /api/votes/topic/:id` - 查看投票者（投票后可用）
- `GET /api/stats/topic/:id` - 获取投票统计

### 管理
- `GET /api/admin/residents/pending` - 待审核业主（支持权限过滤）
- `PATCH /api/admin/residents/:id/approve` - 审核业主批准/拒绝
- `POST /api/admin/building-admins` - 设置楼栋管理员（超级管理员专用）
- `GET /api/admin/building-admins` - 获取楼栋管理员列表
- `GET /api/admin/buildings` - 获取所有楼栋列表

👉 **完整 API 文档**: 访问 `http://localhost:3001/api/docs`

## 🏗️ 项目结构

```
community-voting-system/
├── backend/                    # Express.js 后端
│   ├── server.js              # 主应用（535 行，所有 API 端点）
│   ├── init-test-data.js      # 测试数据初始化
│   ├── voting.db              # SQLite 数据库
│   └── package.json
│
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── pages/             # 页面组件
│   │   ├── components/        # 可复用组件
│   │   ├── App.js             # 主应用
│   │   └── index.js           # 入口文件
│   ├── public/
│   └── package.json
│
├── QUICK_START.md              # 快速启动指南
├── COMPLETE_DOCUMENTATION.md   # 完整文档
├── PROJECT_STATUS.md           # 项目状态
├── API_USAGE_GUIDE.md          # API 使用指南
├── COMPLETION_CHECKLIST.md     # 功能清单
└── Postman_Collection.json     # Postman API 集合
```

## 💾 数据库结构

SQLite3 数据库包含 5 个表：

| 表名 | 说明 |
|------|------|
| `residents` | 业主信息（含楼栋和管理员角色） |
| `topics` | 投票议题 |
| `options` | 投票选项 |
| `votes` | 投票记录 |
| `building_admins` | 楼栋管理员指派 |

## 🔐 核心功能

### 1. 业主管理
- ✅ 注册时必须选择楼栋
- ✅ 登录认证（JWT Token）
- ✅ 状态流程：待审核 → 已批准 → 可投票

### 2. 投票系统
- ✅ 创建投票议题
- ✅ 提交投票
- ✅ 一人一票（防重复）
- ✅ 投票后查看投票者信息

### 3. 权限控制
- ✅ **超级管理员**: 管理所有业主和楼栋管理员
- ✅ **楼栋管理员**: 只管理自己楼栋的业主
- ✅ **普通业主**: 只能投票

### 4. 数据统计
- ✅ 投票进度条
- ✅ 实时投票数统计
- ✅ 参与人数统计
- ✅ 选项得票统计

## 🛠️ 技术栈

### 后端
- Express.js 4.18.2
- SQLite3 5.1.6
- JWT 9.0.0
- bcrypt 5.1.0

### 前端
- React 18.2.0
- React Router 6.17.0
- Ant Design 5.11.0
- Axios 1.6.0

## 🎯 核心特性

### 业主端
- ✅ 用户注册和登录（含楼栋选择）
- ✅ 浏览投票议题
- ✅ 查看投票选项
- ✅ 提交投票
- ✅ 查看投票统计结果

### 管理员端
- ✅ 审核待批准的业主
- ✅ 创建新的投票议题
- ✅ 管理投票选项
- ✅ 查看投票统计

## 技术栈

### 后端
- **Node.js + Express** - Web框架
- **SQLite3 + sqlite** - 数据库
- **JWT** - 身份验证
- **bcrypt** - 密码加密
- **CORS** - 跨域支持

### 前端
- **React 18** - UI框架
- **React Router 6** - 路由管理
- **Ant Design** - UI组件库
- **Axios** - HTTP客户端

## 快速开始

### 前提要求
- Node.js 14+ 和 npm
- macOS 或其他支持的操作系统

### 安装依赖

#### 后端
```bash
cd backend
npm install
```

#### 前端
```bash
cd frontend
npm install
```

### 启动应用

#### 方式一：分别启动（推荐开发时使用）

**终端1 - 启动后端服务：**
```bash
cd backend
npm run dev
```
后端服务将运行在 `http://localhost:3001`

**终端2 - 启动前端应用：**
```bash
cd frontend
npm start
```
前端应用将打开 `http://localhost:3000`

#### 方式二：仅启动后端（生产环境）
```bash
cd backend
npm start
```

## API 文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 投票相关
- `GET /api/topics` - 获取所有投票议题
- `GET /api/topics/:id` - 获取单个议题详情
- `POST /api/topics` - 创建新议题（需要认证）
- `POST /api/votes` - 提交投票（需要认证）
- `GET /api/stats/topic/:id` - 获取投票统计

### 管理相关
- `GET /api/admin/residents/pending` - 获取待审核业主
- `PATCH /api/admin/residents/:id/approve` - 审核业主

## 使用流程

### 1. 注册和登录
- 访问 `/register` 页面注册账号
- 需要提供用户名、密码、真实姓名、单元号和电话
- 账户需要管理员审核才能使用

### 2. 投票
- 登录后进入投票列表页面
- 选择感兴趣的议题
- 点击"投票详情"查看详细信息和投票选项
- 选择一个选项并点击"确认投票"
- 每个议题只能投票一次

### 3. 查看统计
- 在议题详情页可以实时查看投票统计
- 显示各选项的票数和百分比

### 4. 管理员操作（需要管理员账号）
- 访问 `/admin` 后台
- 在"待审核业主"标签页审核用户
- 在"投票议题管理"标签页创建新议题

## 数据库架构

### residents（业主表）
- `id` - 主键
- `username` - 用户名（唯一）
- `password` - 密码（加密存储）
- `real_name` - 真实姓名
- `unit_number` - 单元号
- `phone` - 电话
- `status` - 审核状态（pending/approved/rejected）
- `created_at` - 创建时间

### topics（投票议题表）
- `id` - 主键
- `title` - 标题
- `description` - 描述
- `status` - 状态（active/closed/pending）
- `created_by` - 创建者ID
- `start_date` - 开始时间
- `end_date` - 结束时间
- `created_at` - 创建时间

### options（投票选项表）
- `id` - 主键
- `topic_id` - 议题ID
- `option_text` - 选项文本
- `votes` - 投票数
- `created_at` - 创建时间

### votes（投票记录表）
- `id` - 主键
- `topic_id` - 议题ID
- `resident_id` - 业主ID
- `option_id` - 选项ID
- `created_at` - 投票时间
- 唯一约束：每个业主在每个议题中只能投票一次

## 特殊说明

### 初始管理员账号
当前系统中，任何ID为1的用户将被视为管理员。第一个注册的用户需要手动在数据库中更新其状态为 `approved`。

### 密钥配置
生产环境需要修改 `server.js` 中的 JWT 密钥：
```javascript
const JWT_SECRET = 'your-secret-key-change-in-production';
```

## 常见问题

### Q: 后端连接被拒绝？
A: 确保后端服务正在运行，并且在 `3001` 端口上监听。检查是否有其他应用占用了该端口。

### Q: 用户无法登录？
A: 确保用户账户状态已被管理员审核并批准。检查用户名和密码是否正确。

### Q: 数据库文件丢失？
A: 删除或重命名 `backend/voting.db`，重新启动后端服务会自动创建新的数据库。

## 许可证

本项目仅供学习和演示使用。

## 联系方式

如有问题或建议，请提出反馈。
