// Fish Audio Speech-to-Text - 语音转文字
// 用法:
//   node stt.mjs audio.mp3                       # 后台运行（默认）
//   node stt.mjs audio.mp3 --headed              # 可视化调试
//
// 说明：STT 是异步任务，上传后需要等待后台处理完成。
// 脚本会轮询任务状态直到完成，然后输出转写结果。

import { createBrowser, closeBrowser } from "./lib.mjs";
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const audioFile = args.find(a => !a.startsWith("--"));
const headless = !args.includes("--headed");

if (!audioFile || !fs.existsSync(audioFile)) {
  console.log('用法: node stt.mjs <音频文件路径> [--headed]');
  console.log('支持格式: MP3, WAV, M4A, FLAC, MP4, MOV, WEBM, WEBA, OPUS');
  console.log('默认后台运行，加 --headed 可视化调试');
  process.exit(1);
}

async function stt() {
  const { browser, context, page } = await createBrowser({ headless });

  try {
    await page.goto("https://fish.audio/zh-CN/app/speech-to-text/", {
      waitUntil: "domcontentloaded", timeout: 60000,
    });
    await page.waitForTimeout(5000);

    const createBtn = page.getByText("创建任务").first();
    await createBtn.click();
    await page.waitForTimeout(2000);

    const fileInput = page.locator("input[type='file']").first();
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(path.resolve(audioFile));
      console.log(`已上传: ${audioFile}`);
      await page.waitForTimeout(3000);

      const submitBtn = page.locator("[role='dialog'] button, [data-state='open'] button")
        .filter({ hasText: /提交|确认|开始|创建|转写|Submit|Start|Transcribe/i }).first();
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        console.log("任务已提交，等待处理...");
      }

      for (let i = 0; i < 60; i++) {
        await page.waitForTimeout(2000);
        const status = await page.evaluate(() => {
          const text = document.querySelector("main")?.textContent || "";
          if (text.includes("已完成") || text.includes("completed")) return "done";
          if (text.includes("处理中") || text.includes("processing")) return "processing";
          if (text.includes("失败") || text.includes("failed")) return "failed";
          return "waiting";
        });
        if (status === "done") {
          console.log("转写完成！");
          const result = await page.evaluate(() =>
            document.querySelector("main")?.textContent?.trim().slice(0, 1000) || ""
          );
          console.log(`结果: ${result}`);
          break;
        } else if (status === "failed") {
          console.error("转写失败");
          process.exitCode = 1;
          break;
        } else if (i % 5 === 0) {
          console.log(`  等待中... (${i * 2}s)`);
        }
      }
    } else {
      console.error("未找到文件上传控件");
      process.exitCode = 1;
    }
  } finally {
    await closeBrowser(browser, context);
  }
}

stt().catch(e => { console.error(e.message); process.exit(1); });
