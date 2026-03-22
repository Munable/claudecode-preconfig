import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const PROJECT_DIR = path.dirname(new URL(import.meta.url).pathname);
const AUTH_FILE = path.join(PROJECT_DIR, "fish-audio-auth.json");
const OUTPUT_DIR = path.join(PROJECT_DIR, "output");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

export async function createBrowser({ headless = false } = {}) {
  const browser = await chromium.launch({
    headless,
    channel: "chrome",
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext({
    storageState: AUTH_FILE,
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  return { browser, context, page };
}

export async function closeBrowser(browser, context) {
  if (context) await context.storageState({ path: AUTH_FILE });
  if (browser) await browser.close();
}

export function isLoggedIn() {
  return fs.existsSync(AUTH_FILE);
}

export { AUTH_FILE, OUTPUT_DIR, PROJECT_DIR };
