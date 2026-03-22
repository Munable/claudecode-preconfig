# MCP Server 配置指南

本文档列出当前使用的所有 MCP Server，包含官方配置方法和 API Key 申请地址。

**重要：** 不要固化版本号，始终使用 `npx -y <package>` 自动获取最新版。

---

## 配置方式

所有 MCP Server 配置在 `~/.claude.json` 的 `mcpServers` 字段中：

```bash
# 在 Claude Code 中配置（推荐）
claude mcp add <name> -- npx -y <package>

# 或手动编辑 ~/.claude.json
```

---

## 核心 MCP（必装）

### GitHub
操作 PR、Issue、仓库。

- **官方文档:** https://github.com/modelcontextprotocol/servers/tree/main/src/github
- **API Key 申请:** https://github.com/settings/tokens → 生成 Personal Access Token (classic)
  - 权限：repo, read:org, read:user

```bash
claude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN=<your_token> -- npx -y @modelcontextprotocol/server-github
```

### Context7
实时查询库/框架的最新文档，替代过时的训练数据。

- **官方文档:** https://github.com/upstash/context7
- **无需 API Key**

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest
```

### Firecrawl
网页抓取、爬虫、结构化数据提取。

- **官方文档:** https://docs.firecrawl.dev/mcp
- **API Key 申请:** https://firecrawl.dev → 注册获取 API Key

```bash
claude mcp add firecrawl -e FIRECRAWL_API_KEY=<your_key> -- npx -y firecrawl-mcp
```

### Exa
神经网络搜索引擎，用于 web 搜索、代码搜索、公司搜索。

- **官方文档:** https://docs.exa.ai/reference/mcp
- **API Key 申请:** https://dashboard.exa.ai → 注册获取 API Key

```bash
claude mcp add exa -e EXA_API_KEY=<your_key> -- npx -y exa-mcp-server
```

---

## 数据库 & 后端

### Supabase
PostgreSQL 数据库操作、Edge Functions、迁移。

- **官方文档:** https://supabase.com/docs/guides/getting-started/mcp
- **API Key 申请:** https://supabase.com/dashboard → 项目设置 → API → Access Token
- **Project Ref:** 在 Supabase Dashboard URL 中（如 `qyxezfxquzldvzqhjvgo`）

```bash
claude mcp add supabase -e SUPABASE_ACCESS_TOKEN=<your_token> -- npx -y @supabase/mcp-server-supabase@latest --project-ref=<your_project_ref>
```

### Railway
应用部署和管理。

- **官方文档:** https://docs.railway.com/reference/mcp
- **API Key 申请:** https://railway.com/account/tokens

```bash
claude mcp add railway -e RAILWAY_API_TOKEN=<your_token> -- npx -y @railway/mcp-server
```

---

## AI 媒体生成

### fal.ai
图片/视频/音频 AI 生成（Flux、Seedance、Kling 等）。

- **官方文档:** https://fal.ai/docs/mcp
- **API Key 申请:** https://fal.ai/dashboard → API Keys

```bash
claude mcp add fal-ai -e FAL_KEY=<your_key> -- npx -y fal-ai-mcp-server
```

### Gemini Imagen
Google Gemini 图片生成。

- **官方文档:** https://github.com/anthropics/claude-code/blob/main/docs/mcp.md
- **API Key 申请:** https://aistudio.google.com/apikey

```bash
claude mcp add gemini-imagen -e GOOGLE_API_KEY=<your_key> -- npx -y gemini-imagen-mcp
```

---

## 浏览器自动化

### Browser Use
云端 AI 浏览器代理（截图识图操作）。

- **官方文档:** https://docs.browser-use.com/cloud/mcp
- **API Key 申请:** https://browser-use.com → Dashboard → API Keys

在 `~/.claude.json` 中手动添加（HTTP 类型）：
```json
"browser-use": {
  "type": "http",
  "url": "https://api.browser-use.com/mcp",
  "headers": {
    "x-browser-use-api-key": "<your_key>"
  }
}
```

---

## 配置检查

配置完成后验证：
```bash
# 在 Claude Code 中
claude mcp list
```

建议同时启用的 MCP 不超过 10 个，避免消耗过多 context window。

---

## 当前启用的 MCP 清单

| MCP | 用途 | 需要 API Key |
|-----|------|--------------|
| **github** | PR/Issue/仓库操作 | GitHub PAT |
| **context7** | 实时文档查询 | 无 |
| **firecrawl** | 网页抓取 | Firecrawl Key |
| **exa** | 神经搜索 | Exa Key |
| **supabase** | 数据库 | Supabase Token + Project Ref |
| **railway** | 部署 | Railway Token |
| **fal-ai** | AI 媒体生成 | fal.ai Key |
| **gemini-imagen** | Google 图片生成 | Google API Key |
| **browser-use** | 云端浏览器 | Browser Use Key |
