#!/bin/bash

# 检查node和npm
echo "🔧 环境检查..."
echo ""

if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    echo "请访问: https://nodejs.org/ 下载安装"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)

echo "✅ Node.js 版本: $NODE_VERSION"
echo "✅ npm 版本: $NPM_VERSION"
echo ""

echo "🎯 环境检查完成！"
echo ""
echo "现在可以运行项目启动脚本:"
echo "  bash ./start.sh"
echo ""
