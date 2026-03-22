# Claude Code 预配置集合

可跨设备复用的 Claude Code 工具链和自动化脚本。

## 新电脑配置流程

### 1. 安装 Claude Code
```bash
npm install -g @anthropic-ai/claude-code
```

### 2. 安装 Everything Claude Code 插件
参考 https://github.com/affaan-m/everything-claude-code

```bash
claude
# 进入后输入：
/install-plugin everything-claude-code
```

### 3. 配置密钥
将 `.env.example` 复制为 `.env`，填入实际密钥（从老电脑手动传递），然后执行：
```bash
bash setup-mcp.sh
```

### 4. 安装 Fish Audio 自动化
```bash
cd fish-audio-cli
nvm use 22 && npm install && npx playwright install chromium
node login.mjs
cp ../skills/fish-audio.md ~/.claude/commands/fish-audio.md
```

## 目录结构
```
claudecode-preconfig/
├── .env.example       # 密钥模板（填实际值后复制为 .env）
├── setup-mcp.sh       # 一键配置所有 MCP
├── mcp-setup.md       # MCP 服务说明
├── fish-audio-cli/    # Fish Audio 自动化
└── skills/            # Claude Code skill
```
