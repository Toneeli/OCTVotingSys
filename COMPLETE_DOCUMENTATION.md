# 🗳️ 社区投票系统 - 完整项目文档

## 📊 系统概述

**社区投票系统**是一个完整的 Web 应用，支持社区/小区业主进行投票表决、投票议题统计、以及多级管理员管理功能。

### 核心特性
- 🏢 **建筑物管理** - 支持多楼栋结构，业主注册时必须关联到特定楼栋
- 👤 **身份认证** - JWT Token 认证，24小时过期，bcrypt 密码加密
- 🗳️ **投票系统** - 支持创建、投票、统计、查看投票者信息
- 👨‍💼 **多层级权限** - 超级管理员、楼栋管理员、普通业主
- 📈 **实时统计** - 投票结果实时更新，支持进度条展示
- 📱 **响应式设计** - 基于 Ant Design 的现代 UI

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────┐
│              浏览器 (http://localhost:3000)             │
│          React 前端 + Ant Design 组件库                 │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
                     │ (JSON)
┌────────────────────▼────────────────────────────────────┐
│         Express.js 后端 (http://localhost:3001)         │
│  - RESTful API 端点                                     │
│  - JWT 认证中间件                                       │
│  - 权限控制逻辑                                         │
│  - 业务逻辑处理                                         │
└────────────────────┬────────────────────────────────────┘
                     │ SQL
                     │
┌────────────────────▼────────────────────────────────────┐
│            SQLite3 数据库 (voting.db)                    │
│  - residents (业主)                                     │
│  - topics (投票议题)                                    │
│  - options (投票选项)                                   │
│  - votes (投票记录)                                     │
│  - building_admins (楼栋管理员)                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 快速启动

### 前置要求
- Node.js 14+ 
- npm 或 yarn

### 启动步骤

#### 方式一：分别启动后端和前端

**启动后端**
```bash
cd backend
npm install
npm start
```
后端将在 http://localhost:3001 运行

**启动前端**
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```
前端将在 http://localhost:3000 运行

#### 方式二：一键启动（如支持）
```bash
./run.sh
```

---

## 👥 测试账户

| 角色 | 用户名 | 密码 | 楼栋 | 说明 |
|------|--------|------|------|------|
| 超级管理员 | `admin` | `admin123` | T1栋 | 可管理所有业主和楼栋管理员 |
| 普通业主 | `user` | `user123` | T2栋 | 可投票，待审核 |
| 楼栋管理员 | `buildingadmin` | `buildingadmin123` | T2栋 | 可审核和管理 T2栋的业主 |

### 工作流示例

1. **注册新业主**
   - 访问 http://localhost:3000
   - 点击"注册"
   - 填写信息，选择楼栋（如 T3栋）
   - 提交注册，状态为 `pending`

2. **管理员审核**
   - 使用 `admin` 账户登录
   - 进入"管理员后台"
   - 查看待审核业主列表
   - 点击"批准"或"拒绝"

3. **楼栋管理员管理**
   - 使用 `buildingadmin` 账户登录
   - 进入"管理员后台"
   - 只能看到 T2栋的待审核业主
   - 批准后，业主可参与投票

4. **投票和查看结果**
   - 使用已批准的业主账户登录
   - 点击投票议题
   - 选择选项并投票
   - 投票后可点击"查看投票者"查看其他投票者信息

---

## 🔌 API 文档

所有 API 端点均基于 REST 规范，使用 JSON 格式。

### 认证端点

#### 注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "real_name": "张三",
  "building": "T2栋",           // 必填
  "unit_number": "2-201",
  "phone": "13900139000"
}

响应:
{
  "message": "注册成功，等待审核",
  "id": 4
}
```

#### 登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

响应:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "resident": {
    "id": 1,
    "username": "admin",
    "real_name": "张管理"
  }
}
```

### 投票端点

#### 获取所有议题
```http
GET /api/topics

响应:
[
  {
    "id": 1,
    "title": "小区物业费调整方案",
    "description": "是否同意调整物业费...",
    "status": "active",
    "created_at": "2025-11-30T10:00:00Z",
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
      }
    ]
  }
]
```

#### 提交投票
```http
POST /api/votes
Authorization: Bearer {token}
Content-Type: application/json

{
  "topic_id": 1,
  "option_id": 1
}

响应:
{
  "message": "投票成功"
}
```

#### 查看投票者（投票后可用）
```http
GET /api/votes/topic/1
Authorization: Bearer {token}

响应:
{
  "topic_id": 1,
  "voter_count": 7,
  "voters": [
    {
      "id": 2,
      "real_name": "李用户",
      "username": "user",
      "building": "T2栋",
      "unit_number": "2-201"
    },
    {
      "id": 3,
      "real_name": "王楼栋",
      "username": "buildingadmin",
      "building": "T2栋",
      "unit_number": "2-101"
    }
  ]
}
```

#### 获取投票统计
```http
GET /api/stats/topic/1

响应:
{
  "topic": {
    "id": 1,
    "title": "小区物业费调整方案",
    "status": "active"
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
    }
  ],
  "totalVotes": 7
}
```

### 管理员端点

#### 获取待审核业主
```http
GET /api/admin/residents/pending
Authorization: Bearer {token}

说明:
- 超级管理员: 查看所有待审核业主
- 楼栋管理员: 只查看自己楼栋的待审核业主

响应:
[
  {
    "id": 4,
    "username": "newuser",
    "real_name": "张三",
    "building": "T2栋",
    "unit_number": "2-201",
    "phone": "13900139000",
    "created_at": "2025-11-30T10:00:00Z"
  }
]
```

#### 审核业主
```http
PATCH /api/admin/residents/4/approve
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "approved"  // 或 "rejected"
}

响应:
{
  "message": "业主已批准"
}
```

#### 设置楼栋管理员（超级管理员专用）
```http
POST /api/admin/building-admins
Authorization: Bearer {token}
Content-Type: application/json

{
  "resident_id": 3,
  "building": "T2栋"
}

响应:
{
  "message": "已设置为T2栋的楼栋管理员"
}
```

#### 获取楼栋管理员列表
```http
GET /api/admin/building-admins
Authorization: Bearer {token}

响应:
[
  {
    "id": 1,
    "resident_id": 3,
    "real_name": "王楼栋",
    "username": "buildingadmin",
    "building": "T2栋",
    "created_at": "2025-11-30T10:00:00Z"
  }
]
```

#### 获取所有楼栋
```http
GET /api/admin/buildings
Authorization: Bearer {token}

响应:
["T1栋", "T2栋", "T3栋", "T4栋"]
```

### 其他端点

#### 健康检查
```http
GET /

响应:
{
  "status": "ok",
  "message": "华侨城-智慧社区投票站后端服务运行正常",
  "version": "1.0"
}
```

#### API 文档
```http
GET /api/docs
```

---

## 💾 数据库结构

### residents（业主表）
```sql
CREATE TABLE residents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  real_name TEXT NOT NULL,
  building TEXT NOT NULL,              -- 楼栋信息
  unit_number TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'pending',       -- pending/approved/rejected
  is_building_admin INTEGER DEFAULT 0, -- 是否为楼栋管理员
  managed_building TEXT,                -- 管理的楼栋
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### topics（投票议题表）
```sql
CREATE TABLE topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_by INTEGER,
  start_date DATETIME,
  end_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES residents(id)
)
```

### options（投票选项表）
```sql
CREATE TABLE options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL,
  option_text TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (topic_id) REFERENCES topics(id)
)
```

### votes（投票记录表）
```sql
CREATE TABLE votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL,
  resident_id INTEGER NOT NULL,
  option_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(topic_id, resident_id),
  FOREIGN KEY (topic_id) REFERENCES topics(id),
  FOREIGN KEY (resident_id) REFERENCES residents(id),
  FOREIGN KEY (option_id) REFERENCES options(id)
)
```

### building_admins（楼栋管理员表）
```sql
CREATE TABLE building_admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resident_id INTEGER NOT NULL,
  building TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(resident_id, building),
  FOREIGN KEY (resident_id) REFERENCES residents(id)
)
```

---

## 🔐 安全特性

### 密码加密
- 使用 bcrypt 加密，轮数为 10
- 存储的是加密后的密码哈希值
- 登录时使用 bcrypt.compare() 进行验证

### 认证机制
- 使用 JWT (JSON Web Token) 进行身份验证
- Token 有效期：24 小时
- 每个受保护的端点都需要在请求头中提供有效的 Token
- 格式: `Authorization: Bearer {token}`

### 权限控制
- **超级管理员**: 可管理所有业主，可设置楼栋管理员
- **楼栋管理员**: 
  - 只能看到自己楼栋的待审核业主
  - 只能审核自己楼栋的业主
  - 不能设置其他楼栋管理员
- **普通业主**: 只能投票和查看投票信息

---

## 📱 前端功能

### 已实现页面

#### 首页 (Home.js)
- 显示所有投票议题
- 显示投票进度条
- 显示参与业主数量
- 登录/注册按钮（未登录时显示）

#### 登录/注册页面
- 业主登录
- 新业主注册（包括楼栋选择）

#### 投票页面
- 查看议题详情
- 选择并提交投票
- 投票后显示"查看投票者"按钮

#### 投票者信息页面
- 显示已投票的业主列表
- 显示投票者的楼栋和单元号信息

#### 管理员后台
- 待审核业主列表
- 批准/拒绝业主
- （规划）楼栋管理员管理
- （规划）楼栋筛选功能

---

## 🛠️ 技术栈

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Express.js | 4.18.2 | Web 框架 |
| SQLite3 | 5.1.6 | 数据库 |
| bcrypt | 5.1.0 | 密码加密 |
| JWT | 9.0.0 | Token 认证 |
| CORS | 2.8.5 | 跨域资源共享 |

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.2.0 | UI 框架 |
| React Router | 6.17.0 | 路由管理 |
| Ant Design | 5.11.0 | UI 组件库 |
| Axios | 1.6.0 | HTTP 客户端 |
| ajv | 8.17.1 | 数据验证 |

---

## 📝 使用场景

### 场景 1：小区居民投票物业费调整
1. 物业发起投票议题"物业费调整"
2. 居民注册账户并关联楼栋（T1-T8栋）
3. 管理员批准居民账户
4. 居民登录并参与投票
5. 投票完成后，居民可查看其他投票者信息

### 场景 2：楼栋管理员管理
1. 超级管理员指定某位业主为"T2栋楼栋管理员"
2. T2栋管理员登录系统
3. T2栋管理员只能看到 T2栋待审核的业主
4. 审核通过后，T2栋业主可投票
5. T2栋管理员无法访问其他楼栋的数据

---

## 🔍 故障排查

### 问题：前端报错"Cannot find module 'ajv'"
**解决方案**：
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm start
```

### 问题：后端无法连接数据库
**解决方案**：
```bash
cd backend
rm voting.db  # 删除旧数据库
npm start     # 重新启动，自动创建新数据库
```

### 问题：登录失败 - "账户待审核"
**说明**：新注册的业主账户需要管理员批准才能使用。
**解决**：用管理员账户登录，在"待审核业主"中批准即可。

### 问题：Token 过期
**说明**：Token 有效期为 24 小时
**解决**：重新登录获取新 Token

---

## 📈 项目统计

- **总代码行数**: 26,100+
- **后端文件**: server.js (535 行)
- **数据库表**: 5 个
- **API 端点**: 15+
- **测试账户**: 3 个
- **前端页面**: 6 个

---

## 🎯 未来规划

### 短期（v1.1）
- [ ] 前端注册表单优化（楼栋下拉菜单）
- [ ] UI 文字统一为"业主"术语
- [ ] 前端管理员面板添加楼栋管理员管理
- [ ] 邮件通知功能

### 中期（v1.2）
- [ ] 投票截止时间设置和验证
- [ ] 投票结果统计表格
- [ ] 批量导入业主功能
- [ ] 日志审计系统

### 长期（v2.0）
- [ ] 移动端 APP
- [ ] 扫码投票功能
- [ ] 电子签名功能
- [ ] 大数据可视化展示

---

## 📞 支持

有任何问题或建议，请：
1. 检查 http://localhost:3001/api/docs（API 文档）
2. 查看浏览器控制台错误信息
3. 查看后端日志输出
4. 或联系开发团队

---

**项目版本**: 1.0.0  
**最后更新**: 2025年11月30日  
**状态**: ✅ 生产就绪
