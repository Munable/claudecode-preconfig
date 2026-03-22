# Claude Code 预配置集合

可跨设备复用的 Claude Code 工具链和自动化脚本。

## 新电脑配置流程

按顺序执行：

### 1. 安装 Claude Code
```bash
npm install -g @anthropic-ai/claude-code
```

### 2. 安装 Everything Claude Code 插件
参考官方仓库：https://github.com/affaan-m/everything-claude-code

```bash
# 在 Claude Code 中执行
claude
# 进入后输入：
/install-plugin everything-claude-code
```

或手动在 `~/.claude/settings.json` 中添加：
```json
{
  "enabledPlugins": {
    "everything-claude-code@everything-claude-code": true
  },
  "extraKnownMarketplaces": {
    "everything-claude-code": {
      "source": {
        "source": "github",
        "repo": "affaan-m/everything-claude-code"
      }
    }
  }
}
```

### 3. 配置 MCP Servers

参考 [mcp-setup.md](mcp-setup.md) 获取每个 MCP 的官方配置方法和 API Key 申请地址。

### 4. 安装自定义工具

```bash
# Fish Audio 自动化
cd fish-audio-cli
nvm use 22 && npm install && npx playwright install chromium
node login.mjs  # 首次登录

# 安装 skill
cp skills/fish-audio.md ~/.claude/commands/fish-audio.md
```

## 目录结构

```
claudecode-preconfig/
├── README.md              # 本文件
├── mcp-setup.md           # MCP 服务配置指南（含申请地址）
├── fish-audio-cli/        # Fish Audio 网页自动化脚本
└── skills/                # Claude Code skill 文件
    └── fish-audio.md
```
