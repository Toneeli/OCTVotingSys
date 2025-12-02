# 华侨城-智慧社区投票站 公网部署指南

## 📋 部署前的准备

### 1. 获取公网 IP 和域名
- 获取服务器的公网 IP 地址（例如：`123.45.67.89`）
- 或购买域名并配置 DNS 解析到服务器 IP

### 2. 防火墙和端口配置
```bash
# 允许访问后端 API (3001 端口)
# 允许访问前端服务 (3000 端口)

# Linux 防火墙示例：
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp

# 如果使用其他防火墙，确保允许这两个端口入站
```

## 🚀 部署步骤

### 步骤 1: 后端配置

```bash
cd backend

# 编辑 .env 文件（已创建）
nano .env

# 配置内容：
PORT=3001                              # 后端端口
HOST=0.0.0.0                           # 监听所有网卡（重要！）
NODE_ENV=production                    # 生产环境

# 安装依赖
npm install

# 启动后端服务
npm start
```

**验证后端是否运行：**
```bash
# 在本地测试
curl http://localhost:3001

# 在公网测试（用你的IP替换）
curl http://123.45.67.89:3001
```

### 步骤 2: 前端配置

```bash
cd frontend

# 编辑 .env 文件（已创建）
nano .env

# 配置内容：
REACT_APP_API_PORT=3001                # 后端 API 端口
REACT_APP_API_URL=http://123.45.67.89:3001/api  # 或使用域名

# 构建生产版本
npm run build

# 启动前端服务（开发模式）
npm start

# 或者使用 serve 部署生产版本
npm install -g serve
serve -s build -l 3000
```

## 🔧 关键配置说明

### 后端 (server.js) 修改
```javascript
// 现在支持公网访问
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';  // ← 关键：监听所有网卡

app.listen(PORT, HOST, () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});
```

### 前端 (client.js) 修改
```javascript
// 自动识别当前主机名和 IP
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = process.env.REACT_APP_API_PORT || 3001;
    
    // 本地开发：localhost:3001
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001/api';
    }
    
    // 公网访问：自动使用当前 IP/域名
    return `${protocol}//${hostname}:${port}/api`;
  }
  return 'http://localhost:3001/api';
};
```

## 🌐 完整访问 URL

### 本地开发
- 前端: `http://localhost:3000`
- 后端: `http://localhost:3001`
- API 文档: `http://localhost:3001/api/docs`

### 公网访问（替换 `123.45.67.89` 为实际 IP）
- 前端: `http://123.45.67.89:3000`
- 后端: `http://123.45.67.89:3001`
- API 文档: `http://123.45.67.89:3001/api/docs`

### 使用域名（如已配置 DNS）
- 前端: `http://yourdomain.com:3000`
- 后端: `http://yourdomain.com:3001`
- API 文档: `http://yourdomain.com:3001/api/docs`

## 📦 数据库配置

SQLite 数据库文件位置：
```
/backend/voting.db
```

**重要**：确保服务器有足够的磁盘空间和权限创建/修改数据库文件

## 🔒 安全建议

### 1. 修改 JWT 密钥
```bash
# 在 backend/.env 中修改
JWT_SECRET=your-very-secure-random-key-here
```

### 2. 修改默认管理员密码
登录后立即修改默认管理员账号的密码：
- 默认用户名: `admin`
- 默认密码: `895600`

### 3. 使用 HTTPS（可选但推荐）
如果需要 HTTPS，使用 Nginx 或 Let's Encrypt：
```bash
# 使用 Certbot 获取免费 SSL 证书
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com
```

### 4. 使用 Reverse Proxy (推荐)
使用 Nginx 作为反向代理：
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

## 🔍 故障排查

### 问题 1: 公网无法连接到后端
```bash
# 检查后端是否正常运行
curl http://localhost:3001

# 检查防火墙是否允许该端口
sudo netstat -tuln | grep 3001

# 检查是否监听所有网卡（应该显示 0.0.0.0:3001）
sudo lsof -i :3001
```

### 问题 2: 前端无法调用后端 API
1. 检查浏览器控制台错误信息
2. 确保 `.env` 文件中的 `REACT_APP_API_URL` 配置正确
3. 检查后端 CORS 配置（已启用）

### 问题 3: 数据库连接错误
```bash
# 检查数据库文件是否存在
ls -la backend/voting.db

# 检查权限
chmod 666 backend/voting.db

# 检查磁盘空间
df -h
```

## 📊 生产环境检查清单

- [ ] 后端已修改 JWT_SECRET
- [ ] 管理员密码已修改
- [ ] 防火墙已配置（允许 3000、3001 端口）
- [ ] 数据库备份策略已制定
- [ ] 日志收集已配置
- [ ] HTTPS/SSL 已配置（推荐）
- [ ] 反向代理已配置（推荐）
- [ ] 系统监控已部署
- [ ] 已测试公网访问
- [ ] 已测试数据库连接

## 📞 常用命令

```bash
# 启动后端
cd backend && npm start

# 启动前端（开发模式）
cd frontend && npm start

# 构建前端生产版本
cd frontend && npm run build

# 后台运行（使用 PM2）
npm install -g pm2
pm2 start backend/server.js --name "voting-backend"
pm2 start "npm start" --cwd frontend --name "voting-frontend"
```

---

**需要帮助？** 查看 API 文档: `http://your-ip:3001/api/docs`
