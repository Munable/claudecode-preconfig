// Fish Audio TTS - 语音合成
// 默认 headless 后台运行，加 --headed 可视化调试
//
// 用法:
//   node tts.mjs "文本"
//   node tts.mjs "文本" --voice Sarah
//   node tts.mjs "文本" --speed 1.2 --volume -3
//   node tts.mjs "文本" --enhance
//   node tts.mjs "文本" --headed              # 可视化调试
//   node tts.mjs "文本" --output hello.mp3

import { createBrowser, closeBrowser, OUTPUT_DIR } from "./lib.mjs";
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const text = args.find(a => !a.startsWith("--"));
const getArg = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : null; };
const voiceName = getArg("voice");
const speed = parseFloat(getArg("speed") || "0");
const volume = parseFloat(getArg("volume") || "0");
const enhance = args.includes("--enhance");
const outputFile = getArg("output") || path.join(OUTPUT_DIR, `tts-${Date.now()}.mp3`);
const headless = !args.includes("--headed");

if (!text) {
  console.log(`Fish Audio TTS\n\n用法: node tts.mjs "文本" [选项]\n\n选项:\n  --voice <名称>    搜索并使用指定音色（如 Sarah, 穆滨）\n  --speed <值>      语速 0.7~1.3（默认 1.0）\n  --volume <值>     音量 -55~0（默认 0）\n  --enhance         启用增强模式\n  --output <路径>   输出文件路径（默认 output/tts-<时间戳>.mp3）\n  --headed          可视化模式（调试用，默认后台运行）\n\n情绪标签（直接写在文本中）:\n  [angry] [sad] [excited] [whispering] [soft] [breathy]\n  [laughing] [chuckling] [sighing] [pause] [long pause] 等\n\n示例:\n  node tts.mjs "你好世界"\n  node tts.mjs "[excited] 太棒了！" --voice Sarah --speed 1.1\n  node tts.mjs "慢慢说" --speed 0.8 --volume -10 --enhance`);
  process.exit(1);
}

async function tts() {
  const { browser, context, page } = await createBrowser({ headless });

  try {
    await page.goto("https://fish.audio/zh-CN/app/text-to-speech/", {
      waitUntil: "domcontentloaded", timeout: 60000,
    });
    await page.waitForTimeout(5000);

    if (voiceName) {
      console.log(`切换音色: ${voiceName}`);
      const addSpeakerBtn = page.getByText("添加说话人").first();
      await addSpeakerBtn.click();
      await page.waitForTimeout(2000);

      const exploreTab = page.locator("[role='dialog'] button, [data-state='open'] button")
        .filter({ hasText: "探索" }).first();
      if (await exploreTab.count() > 0) {
        await exploreTab.click();
        await page.waitForTimeout(1000);
      }

      const searchInput = page.locator("[role='dialog'] input, [data-state='open'] input").first();
      await searchInput.waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
      await searchInput.click();
      await searchInput.fill(voiceName);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(3000);

      const useBtn = page.locator("[role='dialog'] button, [data-state='open'] button")
        .filter({ hasText: "使用" }).first();
      if (await useBtn.count() > 0) {
        await useBtn.click();
        await page.waitForTimeout(1500);
        console.log(`音色已切换`);
      } else {
        console.log(`未找到 "${voiceName}"，使用默认音色`);
      }

      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
      const dialogOpen = await page.locator("[role='dialog'][data-state='open']").count();
      if (dialogOpen > 0) {
        await page.mouse.click(10, 400);
        await page.waitForTimeout(500);
      }
    }

    if (speed || volume) {
      const settingsTab = page.locator("button").filter({ hasText: "设置" }).first();
      await settingsTab.click();
      await page.waitForTimeout(1000);

      if (speed && speed !== 1) {
        const speedSlider = page.locator("[role='slider']").nth(1);
        if (await speedSlider.count() > 0) {
          const pct = ((speed - 0.7) / 0.6) * 100;
          const box = await speedSlider.boundingBox();
          if (box) {
            const track = speedSlider.locator("..").locator("[class*='track'], [class*='range']").first();
            const trackBox = await track.boundingBox().catch(() => box);
            const targetX = (trackBox || box).x + ((trackBox || box).width * pct / 100);
            await page.mouse.click(targetX, box.y + box.height / 2);
            console.log(`速度: ${speed}`);
          }
        }
      }

      if (volume && volume !== 0) {
        const volumeSlider = page.locator("[role='slider']").nth(0);
        if (await volumeSlider.count() > 0) {
          const pct = ((volume + 55) / 55) * 100;
          const box = await volumeSlider.boundingBox();
          if (box) {
            const track = volumeSlider.locator("..").locator("[class*='track'], [class*='range']").first();
            const trackBox = await track.boundingBox().catch(() => box);
            const targetX = (trackBox || box).x + ((trackBox || box).width * pct / 100);
            await page.mouse.click(targetX, box.y + box.height / 2);
            console.log(`音量: ${volume}`);
          }
        }
      }
    }

    const editor = page.locator(".tiptap.ProseMirror").first();
    await editor.click();
    await page.keyboard.press("Meta+a");
    await page.keyboard.press("Backspace");
    await page.keyboard.type(text, { delay: 20 });
    console.log(`文本: ${text.slice(0, 50)}${text.length > 50 ? "..." : ""}`);

    if (enhance) {
      const enhanceBtn = page.locator("button").filter({ hasText: "增强" }).first();
      if (await enhanceBtn.count() > 0) {
        await enhanceBtn.click();
        await page.waitForTimeout(500);
        console.log(`增强: 已启用`);
      }
    }

    let audioSaved = false;
    page.on("response", async (res) => {
      const ct = res.headers()["content-type"] || "";
      if ((ct.includes("octet-stream") || ct.includes("audio")) && !audioSaved) {
        try {
          const buffer = await res.body();
          if (buffer.length > 1000) {
            const dir = path.dirname(outputFile);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(outputFile, buffer);
            audioSaved = true;
            console.log(`已保存: ${outputFile} (${(buffer.length / 1024).toFixed(1)} KB)`);
          }
        } catch { /* stream chunk */ }
      }
    });

    await page.getByText("生成语音").click();
    console.log("生成中...");

    for (let i = 0; i < 30; i++) {
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

tts().catch(e => { console.error(e.message); process.exit(1); });
