#!/bin/bash

echo "🚀 启动社区投票系统后端..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 删除旧的数据库文件
if [ -f voting.db ]; then
  echo "🗑️  删除旧的数据库文件..."
  rm voting.db
fi

# 初始化测试数据
echo "📊 初始化测试数据..."
node init-test-data.js

# 启动服务器
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 启动后端服务器..."
node server.js
