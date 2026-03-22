#!/bin/bash
# 一键配置所有 MCP Server
# 前提：已将 .env.example 复制为 .env 并填入实际密钥

set -e

ENV_FILE="$(dirname "$0")/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "错误：未找到 .env 文件"
  echo "请先复制 .env.example 为 .env 并填入密钥"
  exit 1
fi

source "$ENV_FILE"

echo "=== 配置 MCP Servers ==="

# GitHub
if [ -n "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  claude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN="$GITHUB_PERSONAL_ACCESS_TOKEN" -- npx -y @modelcontextprotocol/server-github
  echo "✅ GitHub"
fi

# Context7（无需密钥）
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest
echo "✅ Context7"

# Firecrawl
if [ -n "$FIRECRAWL_API_KEY" ]; then
  claude mcp add firecrawl -e FIRECRAWL_API_KEY="$FIRECRAWL_API_KEY" -- npx -y firecrawl-mcp
  echo "✅ Firecrawl"
fi

# Exa
if [ -n "$EXA_API_KEY" ]; then
  claude mcp add exa -e EXA_API_KEY="$EXA_API_KEY" -- npx -y exa-mcp-server
  echo "✅ Exa"
fi

# Supabase
if [ -n "$SUPABASE_ACCESS_TOKEN" ] && [ -n "$SUPABASE_PROJECT_REF" ]; then
  claude mcp add supabase -e SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" -- npx -y @supabase/mcp-server-supabase@latest --project-ref="$SUPABASE_PROJECT_REF"
  echo "✅ Supabase"
fi

# Railway
if [ -n "$RAILWAY_API_TOKEN" ]; then
  claude mcp add railway -e RAILWAY_API_TOKEN="$RAILWAY_API_TOKEN" -- npx -y @railway/mcp-server
  echo "✅ Railway"
fi

# fal.ai
if [ -n "$FAL_KEY" ]; then
  claude mcp add fal-ai -e FAL_KEY="$FAL_KEY" -- npx -y fal-ai-mcp-server
  echo "✅ fal.ai"
fi

# Gemini Imagen
if [ -n "$GOOGLE_API_KEY" ]; then
  claude mcp add gemini-imagen -e GOOGLE_API_KEY="$GOOGLE_API_KEY" -- npx -y gemini-imagen-mcp
  echo "✅ Gemini Imagen"
fi

# Browser Use（HTTP 类型，claude mcp add 不支持，需手动写入）
if [ -n "$BROWSER_USE_API_KEY" ]; then
  # 检查是否已配置
  if ! grep -q 'browser-use' ~/.claude.json 2>/dev/null; then
    echo "⚠️  Browser Use 是 HTTP 类型 MCP，需手动添加到 ~/.claude.json 的 mcpServers 中："
    echo '  "browser-use": {'
    echo '    "type": "http",'
    echo '    "url": "https://api.browser-use.com/mcp",'
    echo '    "headers": {'
    echo "      \"x-browser-use-api-key\": \"$BROWSER_USE_API_KEY\""
    echo '    }'
    echo '  }'
  else
    echo "✅ Browser Use（已配置）"
  fi
fi

echo ""
echo "=== 完成 ==="
echo "运行 claude mcp list 检查配置"
