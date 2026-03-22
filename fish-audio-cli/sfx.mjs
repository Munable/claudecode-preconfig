// Fish Audio Sound Effects - 音效生成
// 默认 headless 后台运行，加 --headed 可视化调试
//
// 用法:
//   node sfx.mjs "雷声"
//   node sfx.mjs "海浪" --duration 25
//   node sfx.mjs "鸟叫" --guidance 7.0
//   node sfx.mjs "爆炸" --headed               # 可视化调试
//   node sfx.mjs "风声" --output wind.mp3

import { createBrowser, closeBrowser, OUTPUT_DIR } from "./lib.mjs";
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const prompt = args.find(a => !a.startsWith("--"));
const getArg = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : null; };
const duration = getArg("duration") || "10";
const guidance = getArg("guidance");
const outputFile = getArg("output") || path.join(OUTPUT_DIR, `sfx-${Date.now()}.mp3`);
const headless = !args.includes("--headed");

if (!prompt) {
  console.log(`Fish Audio 音效生成\n\n用法: node sfx.mjs "音效描述" [选项]\n\n选项:\n  --duration <秒>   时长 10 或 25（默认 10）\n  --guidance <值>    引导强度（默认 5.0）\n  --output <路径>    输出文件路径\n  --headed           可视化模式（调试用，默认后台运行）\n\n示例:\n  node sfx.mjs "雷声，远处的雷鸣"\n  node sfx.mjs "海浪拍打沙滩" --duration 25\n  node sfx.mjs "清脆的鸟叫" --guidance 7.0 --output bird.mp3`);
  process.exit(1);
}

async function sfx() {
  const { browser, context, page } = await createBrowser({ headless });

  try {
    await page.goto("https://fish.audio/zh-CN/app/sound-effects/", {
      waitUntil: "domcontentloaded", timeout: 60000,
    });
    await page.waitForTimeout(5000);

    let audioSaved = false;
    page.on("response", async (res) => {
      const ct = res.headers()["content-type"] || "";
      if ((ct.includes("octet-stream") || ct.includes("audio/")) && !audioSaved) {
        try {
          const buffer = await res.body();
          if (buffer.length > 500) {
            const dir = path.dirname(outputFile);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(outputFile, buffer);
            audioSaved = true;
            console.log(`已保存: ${outputFile} (${(buffer.length / 1024).toFixed(1)} KB)`);
          }
        } catch { /* ignore */ }
      }
    });

    if (duration === "25") {
      const btn25 = page.locator("button").filter({ hasText: /^25$/ }).first();
      if (await btn25.count() > 0) {
        await btn25.click();
        await page.waitForTimeout(500);
      }
    }
    console.log(`时长: ${duration}秒`);

    if (guidance) {
      const guidanceBtn = page.locator("button").filter({ hasText: /^5\.0$/ }).first();
      if (await guidanceBtn.count() > 0) {
        await guidanceBtn.click();
        await page.waitForTimeout(500);
        await page.keyboard.press("Meta+a");
        await page.keyboard.type(guidance);
        await page.keyboard.press("Enter");
        console.log(`Guidance: ${guidance}`);
      }
    }

    const textarea = page.locator('textarea[placeholder*="描述"]').first();
    await textarea.click();
    await textarea.fill(prompt);
    console.log(`描述: ${prompt}`);

    await page.keyboard.press("Enter");
    console.log("生成中...");

    for (let i = 0; i < 60; i++) {
      if (audioSaved) break;
      await page.waitForTimeout(1000);
    }

    if (!audioSaved) {
      console.error("未捕获到音频");
      process.exitCode = 1;
    }
  } finally {
    await closeBrowser(browser, context);
  }
}

sfx().catch(e => { console.error(e.message); process.exit(1); });
