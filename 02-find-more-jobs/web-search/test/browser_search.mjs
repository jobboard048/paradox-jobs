// Runs a few web searches in a VISIBLE browser (your installed Chrome) and saves the result URLs, for a small sample.
// Guardrails: headful only, no proxy, no stealth plugin, at most --max queries (default 5) and --pages pages each
// (default 1), 10 seconds between pages. If the search engine shows a CAPTCHA or an "unusual traffic" page, the
// script STOPS: it never solves or works around one. A cookie consent page is left to you, in the window.
//
// Usage (from anywhere; needs playwright-core installed in this folder: npm install playwright-core):
//   node 02-find-more-jobs/web-search/test/browser_search.mjs [--max 5] [--pages 1]
// Output: browser_urls_<date>.txt in this folder, in the format of manual_urls.txt, then run:
//   node 02-find-more-jobs/web-search/test/web_search.mjs --from-file browser_urls_<date>.txt
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(DIR, "package.json"));
const { chromium } = require("playwright-core");

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? Number(args[i + 1]) : def; };
const MAX = Math.min(opt("--max", 5), 5);
const PAGES = Math.min(opt("--pages", 1), 2);
const today = new Date().toISOString().slice(0, 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const queries = fs.readFileSync(path.join(DIR, "queries.txt"), "utf8")
  .split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#")).slice(0, MAX);

const browser = await chromium.launch({ headless: false, channel: "chrome" });
const page = await browser.newPage();
const lines = [];
let stopped = "";

// Google's block page lives under /sorry/ and shows a CAPTCHA form; the text check is limited to the visible page
const blocked = async () => /\/sorry\//.test(page.url()) ||
  (await page.$("#captcha-form, form#captcha-form, iframe[src*='recaptcha']")) !== null ||
  /our systems have detected unusual traffic/i.test(await page.innerText("body").catch(() => ""));

outer:
for (const q of queries) {
  lines.push(`# ${q}`);
  for (let p = 0; p < PAGES; p++) {
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(q)}&hl=en${p ? `&start=${p * 10}` : ""}`, { waitUntil: "domcontentloaded" });
    if (/consent\.google\./.test(page.url())) {
      console.log("Cookie consent page: please choose in the browser window (waiting up to 2 minutes)...");
      await page.waitForURL((u) => !/consent\.google\./.test(u.toString()), { timeout: 120000 }).catch(() => {});
    }
    await page.waitForTimeout(2000);
    if (await blocked()) {
      stopped = `CAPTCHA or "unusual traffic" page at query "${q}", page ${p + 1} (${page.url().slice(0, 80)}): stopped`;
      await page.screenshot({ path: path.join(DIR, `browser_stop_${today}.png`) }).catch(() => {});
      break outer;
    }
    const links = await page.$$eval("#search a h3", (hs) => hs.map((h) => h.closest("a")?.href).filter(Boolean));
    console.log(`"${q}" page ${p + 1}: ${links.length} results`);
    lines.push(...links);
    if (!links.length) break;
    await sleep(10000);
  }
}
await browser.close();

const out = path.join(DIR, `browser_urls_${today}.txt`);
fs.writeFileSync(out, `# Result URLs collected on ${today} by browser_search.mjs (visible Chrome, Google)${stopped ? `\n# ${stopped}` : ""}\n` + lines.join("\n") + "\n");
console.log(stopped || "done", "-> written", path.basename(out));
