import { chromium } from "playwright";

const AUTH_FILE = "./fish-audio-auth.json";

async function login() {
  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-first-run",
      "--no-default-browser-check",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => undefined,
    });
  });

  const page = await context.newPage();
  await page.goto("https://fish.audio/auth/");

  console.log("\n========================================");
  console.log("浏览器已打开，请登录 Fish Audio");
  console.log("登录完成并跳过引导后，回到终端按 Enter");
  console.log("========================================\n");

  await new Promise((resolve) => {
    process.stdin.once("data", resolve);
  });

  await context.storageState({ path: AUTH_FILE });
  console.log(`登录状态已保存到 ${AUTH_FILE}`);

  await browser.close();
  console.log("浏览器已关闭，可以开始使用了");
}

login().catch(console.error);
