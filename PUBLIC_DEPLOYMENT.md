# 🌐 公网部署快速指南

## 🎯 一键快速开始

### 第1步: 环境检查
```bash
./check-deployment.sh
```

### 第2步: 配置文件
编辑以下文件并根据注释进行配置：
```bash
# 后端配置（重要！修改 JWT_SECRET）
nano backend/.env

# 前端配置（可选）
nano frontend/.env
```

### 第3步: 启动服务
```bash
./deploy-production.sh
```

---

## 📋 核心配置清单

### ✅ 必须修改项

#### 1️⃣ 后端 JWT_SECRET (backend/.env)
```env
JWT_SECRET=你的超级安全密钥-请修改！
```
⚠️ **重要**: 不要使用默认值！使用强随机字符串

#### 2️⃣ 管理员密码
登录后立即修改:
- 用户名: `admin`  
- 默认密码: `895600` (必须改!)

#### 3️⃣ 防火墙配置
允许这两个端口的入站流量:
- 端口 3000 (前端)
- 端口 3001 (后端 API)

### 🔧 可选配置

#### 前端 API 地址 (frontend/.env)
```env
# 自动识别（推荐，无需修改）
REACT_APP_API_PORT=3001

# 或者指定完整地址
REACT_APP_API_URL=http://你的IP:3001/api
REACT_APP_API_URL=http://你的域名:3001/api
```

---

## 🚀 公网访问

### 访问 URL
```
前端:   http://你的IP:3000
后端:   http://你的IP:3001
API:    http://你的IP:3001/api/docs
```

### 示例 (替换为实际 IP)
```
前端:   http://123.45.67.89:3000
后端:   http://123.45.67.89:3001  
API:    http://123.45.67.89:3001/api/docs
```

---

## 🧪 部署后测试

### 1️⃣ 测试后端连接
```bash
curl http://your-ip:3001
# 应该返回: {"status":"ok","message":"..."}
```

### 2️⃣ 测试 API 文档
在浏览器打开: `http://your-ip:3001/api/docs`

### 3️⃣ 测试前端访问
在浏览器打开: `http://your-ip:3000`

### 4️⃣ 测试登录
- 用户名: `admin`
- 密码: 你的新密码 (之前修改的)

---

## 🔍 常见问题

### Q: 公网无法连接?
**A:** 检查以下几点:
1. 防火墙是否允许 3000/3001 端口?
2. 后端是否运行? (检查日志)
3. 是否使用了正确的 IP 地址?
4. 网络是否正常连接?

### Q: API 返回 CORS 错误?
**A:** 后端已启用 CORS，可能是:
1. API 地址配置错误
2. 后端服务未运行
3. 检查浏览器控制台具体错误

### Q: 数据库连接失败?
**A:** 
1. 检查 `backend/voting.db` 文件是否存在
2. 检查文件权限: `chmod 666 backend/voting.db`
3. 检查磁盘空间是否充足

### Q: 如何修改端口?
**A:** 编辑 `.env` 文件:
```env
PORT=8080        # 改为 8080
REACT_APP_API_PORT=8080
```

---

## 🔒 安全建议

### 1. 生成强密钥
```bash
# 生成随机的 JWT 密钥
openssl rand -base64 32

# 复制结果到 backend/.env 的 JWT_SECRET
```

### 2. 定期备份数据库
```bash
cp backend/voting.db backend/voting.db.backup
```

### 3. 启用 HTTPS (推荐)
```bash
# 使用 Certbot 获取免费 SSL 证书
certbot certonly --standalone -d yourdomain.com
```

### 4. 使用反向代理
配置 Nginx 作为反向代理，详见 `DEPLOYMENT_GUIDE.md`

---

## 📊 监控和维护

### 查看运行日志
```bash
# 后端日志
tail -f logs/backend-out.log

# 前端日志  
tail -f logs/frontend-out.log
```

### 停止服务
```bash
# 方法1: Ctrl+C (如果用 deploy-production.sh 启动)

# 方法2: 杀死进程
pkill -f "node server.js"
pkill -f "npm start"

# 方法3: 使用 PM2 (如果已安装)
pm2 stop all
```

### 重启服务
```bash
./deploy-production.sh
```

---

## 📞 技术支持

- **后端 API 文档**: `http://your-ip:3001/api/docs`
- **系统日志**: `./logs/` 目录
- **完整部署指南**: `DEPLOYMENT_GUIDE.md`

---

## ✨ 一切就绪!

现在可以进行公网部署了！

```bash
# 最后一次确认检查
./check-deployment.sh

# 启动系统
./deploy-production.sh
```

祝你部署顺利! 🎉
