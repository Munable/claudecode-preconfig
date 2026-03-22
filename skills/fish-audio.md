---
description: "Fish Audio 网页自动化 — 用 Playwright 操控 Fish Audio 网页版，复用订阅额度进行语音合成、音效生成和语音转文字"
---

# Fish Audio 自动化

通过 Playwright 操控 Fish Audio 网页版（fish.audio），复用订阅会员额度，不消耗 API 付费额度。零 AI token 消耗。

## 运行模式

- **默认 headless（无头后台）** — 日常调用主用，不弹窗口
- **--headed（有头可视化）** — 仅在更新脚本/调试选择器时使用

## 首次设置（需用户配合一次）

```bash
cd ~/Developer/fish-audio-cli && nvm use 22
npm install && npx playwright install chromium
node login.mjs
# → 弹出 Chrome → 登录 Fish Audio → 回终端按 Enter
```

## 日常使用

```bash
cd ~/Developer/fish-audio-cli && nvm use 22

# TTS 语音合成
node tts.mjs "你好世界"                                    # 默认音色
node tts.mjs "Hello" --voice Sarah                        # 指定音色
node tts.mjs "你好" --speed 1.2 --volume -3 --enhance    # 调参数
node tts.mjs "你好" --output ./output/hello.mp3           # 指定输出

# 音效生成
node sfx.mjs "雷声"                                       # 默认 10 秒
node sfx.mjs "海浪拍打沙滩" --duration 25                  # 25 秒
node sfx.mjs "鸟叫" --guidance 7.0 --output bird.mp3

# 语音转文字
node stt.mjs ./audio.mp3

# 登录过期时
node login.mjs
```

## 页面改版维护

```bash
node explore-page.mjs --headed                  # 可视化扫描 TTS 页面选择器
node explore-page.mjs "https://fish.audio/zh-CN/app/sound-effects/"
# 根据输出更新 tts.mjs / sfx.mjs / stt.mjs 中的选择器
```

## 新电脑部署

```bash
git clone https://github.com/Munable/claudecode-preconfig.git
cd claudecode-preconfig/fish-audio-cli
nvm use 22 && npm install && npx playwright install chromium
node login.mjs  # 首次登录
# 将 skills/fish-audio.md 复制到 ~/.claude/commands/fish-audio.md
```
