// Playwright Google SERP URL scraper (JavaScript / ESM)
//
// Usage:
//   npm install
//   npx playwright install chromium
//   node scrape.js <input.csv> [--headed] [--delay-ms 4000]
//
// Politeness: a randomized delay (default ~3-7 s) is inserted between page loads.
// Increase --delay-ms if Google shows the unusual-traffic page too quickly.
// This script does not solve or wait for CAPTCHAs.

import { chromium } from 'playwright';
import { parse } from 'csv-parse/sync';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Randomized politeness delay: base +/- 30% jitter, minimum 1 s.
function politeDelay(baseMs) {
  const min = Math.max(1000, baseMs * 0.7);
  const max = baseMs * 1.3;
  return Math.round(min + Math.random() * (max - min));
}

// --------------------------------------------------------------------------- //
// URL construction
// --------------------------------------------------------------------------- //
function buildSearchUrl(row, page = 0) {
  const params = new URLSearchParams({ q: row.keyword });

  const mapping = [
    ['language', 'hl'],
    ['country', 'gl'],
    ['tbs', 'tbs'],
    ['tbm', 'tbm'],
    ['nfpr', 'nfpr'],
  ];

  for (const [src, dst] of mapping) {
    const val = (row[src] ?? '').trim();
    if (val) params.set(dst, val);
  }

  if (page > 0) params.set('start', String(page * 10)); // 10 results / page

  const base = (row.url || 'https://www.google.com/').trim().replace(/\/+$/, '');
  return `${base}/search?${params.toString()}`;
}

// --------------------------------------------------------------------------- //
// Consent dialog
// --------------------------------------------------------------------------- //
async function handleConsent(page) {
  const labels = ['Accept all', 'I agree', 'Accept', 'Tout accepter'];

  for (const text of labels) {
    try {
      const btn = page
        .locator(`button:has-text("${text}"), div[role="button"]:has-text("${text}")`)
        .first();

      if (await btn.isVisible({ timeout: 800 })) {
        await btn.click();
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
        return;
      }
    } catch {
      /* ignore */
    }
  }
}

// --------------------------------------------------------------------------- //
// Result extraction
// --------------------------------------------------------------------------- //
async function extractResultUrls(page) {
  const hrefs = await page.$$eval(
    '#search a[href], div[role="main"] a[href]',
    (els) => els.map((e) => e.href),
  );

  const out = [];
  const seen = new Set();

  for (let h of hrefs) {
    try {
      let parsed = new URL(h);

      // Unwrap google.com/url?q=... redirects
      if (parsed.pathname === '/url' && parsed.hostname.includes('google.')) {
        const q = parsed.searchParams.get('q');
        if (!q) continue;
        h = q;
        parsed = new URL(h);
      }

      // Skip internal google links / non-http
      if (parsed.hostname.includes('google.')) continue;
      if (!parsed.protocol.startsWith('http')) continue;
      if (seen.has(h)) continue;

      seen.add(h);
      out.push(h);
    } catch {
      continue;
    }
  }

  return out;
}

// --------------------------------------------------------------------------- //
// Main
// --------------------------------------------------------------------------- //
export async function run(csvPath, headless = true, delayMs = 5000) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parse(content, { columns: true, skip_empty_lines: true });

  const results = {};

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    locale: 'en-US',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  try {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const keyword = row.keyword;

      const sp = row.start_page?.trim() ? parseInt(row.start_page, 10) : 0;
      const ep = row.end_page?.trim() ? parseInt(row.end_page, 10) : sp;
      const start = Number.isNaN(sp) ? 0 : sp;
      const end = Number.isNaN(ep) ? start : ep;

      const allUrls = [];

      for (let pg = start; pg <= end; pg++) {
        const url = buildSearchUrl(row, pg);
        console.log(`[${i + 1}/${rows.length}] page ${pg} -> ${url}`);

        try {
          await page.goto(url, { timeout: 30_000, waitUntil: 'domcontentloaded' });
          await handleConsent(page);

          await page
            .waitForSelector('#search, div[role="main"]', { timeout: 8_000 })
            .catch(() => {});

          // Let the result list settle before extraction.
          await sleep(politeDelay(1500));

          const urls = await extractResultUrls(page);
          allUrls.push(...urls);
          console.log(`   +${urls.length} result(s)`);
        } catch (err) {
          console.log(`   ! error: ${err.message}`);
        }

        await sleep(politeDelay(delayMs)); // randomized politeness delay
      }

      results[keyword] = allUrls;
    }
  } finally {
    await browser.close();
  }

  // Report
  for (const [kw, urls] of Object.entries(results)) {
    console.log(`\n=== ${kw}  (${urls.length}) ===`);
    for (const u of urls) console.log(u);
  }

  return results;
}

// --------------------------------------------------------------------------- //
// CLI entry
// --------------------------------------------------------------------------- //
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  (async () => {
    const args = process.argv.slice(2);
    const csvPath =
      args.find((a) => !a.startsWith('--')) ?? 'sd_mwjcl93o10nrjfo5em_input.csv';
    const headed = args.includes('--headed');
    const delayArg = args.indexOf('--delay-ms');
    const delayMs = delayArg >= 0 ? Number(args[delayArg + 1]) : 5000;

    try {
      await run(csvPath, !headed, Number.isNaN(delayMs) ? 5000 : delayMs);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}