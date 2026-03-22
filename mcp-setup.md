# MCP Server 说明

密钥统一在 `.env` 文件中管理，配置脚本 `setup-mcp.sh` 会自动读取并注册。

| MCP | 用途 | 密钥变量 |
|-----|------|----------|
| **github** | PR/Issue/仓库 | `GITHUB_PERSONAL_ACCESS_TOKEN` |
| **context7** | 实时文档查询 | 无需 |
| **firecrawl** | 网页抓取 | `FIRECRAWL_API_KEY` |
| **exa** | 神经搜索 | `EXA_API_KEY` |
| **supabase** | 数据库 | `SUPABASE_ACCESS_TOKEN` + `SUPABASE_PROJECT_REF` |
| **railway** | 部署 | `RAILWAY_API_TOKEN` |
| **fal-ai** | AI 媒体生成 | `FAL_KEY` |
| **gemini-imagen** | Google 图片生成 | `GOOGLE_API_KEY` |
| **browser-use** | 云端浏览器 | `BROWSER_USE_API_KEY`（HTTP 类型，需手动添加） |

## 配置流程

```bash
cp .env.example .env     # 复制模板
# 编辑 .env 填入密钥（从老电脑手动传递）
bash setup-mcp.sh        # 一键注册所有 MCP
claude mcp list           # 检查结果
```

## 注意事项

- 同时启用的 MCP 建议不超过 10 个，避免 context window 压力
- Browser Use 是 HTTP 类型，`claude mcp add` 不支持，脚本会输出手动配置指引
- 所有 npx 包不固定版本，每次自动拉最新
