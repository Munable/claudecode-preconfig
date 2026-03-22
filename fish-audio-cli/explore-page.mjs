// Fish Audio 页面探索脚本 — 当页面改版时用此脚本重新扫描选择器
// 用法: node explore-page.mjs [url]
// 默认扫描 TTS 页面，也可指定其他页面 URL
// 注意：explore 始终使用有头模式（headed）便于观察

import { createBrowser, closeBrowser } from "./lib.mjs";

const url = process.argv[2] || "https://fish.audio/zh-CN/app/text-to-speech/";

async function explore() {
  const { browser, context, page } = await createBrowser({ headless: false });

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(5000);

    console.log(`\n页面: ${await page.title()}`);
    console.log(`URL: ${page.url()}\n`);

    const elements = await page.evaluate(() => {
      const results = [];
      const selectors = [
        "input", "textarea", "button", "select",
        "[role='button']", "[role='slider']", "[role='switch']",
        "[role='combobox']", "[contenteditable]",
      ];
      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.x < 240) return;
          results.push({
            tag: el.tagName.toLowerCase(),
            type: el.type || el.getAttribute("role") || "",
            id: el.id || "",
            label: el.getAttribute("aria-label") || el.placeholder || el.textContent?.trim().slice(0, 50) || "",
            class: el.className?.toString().slice(0, 60) || "",
            pos: `(${Math.round(rect.x)},${Math.round(rect.y)}) ${Math.round(rect.width)}x${Math.round(rect.height)}`,
          });
        });
      }
      return results;
    });

    console.log(`找到 ${elements.length} 个交互元素:\n`);
    for (const el of elements) {
      console.log(`  [${el.tag}:${el.type}] "${el.label}" | id=${el.id} | ${el.pos}`);
    }

    console.log("\n导航:");
    const nav = await page.evaluate(() => {
      return [...document.querySelectorAll("nav a[href]")]
        .filter(el => el.getBoundingClientRect().width > 0)
        .map(el => ({ text: el.textContent?.trim(), href: el.getAttribute("href") }));
    });
    nav.forEach(n => console.log(`  ${n.href} → ${n.text}`));

  } finally {
    await closeBrowser(browser, context);
  }
}

explore().catch(e => { console.error(e.message); process.exit(1); });
