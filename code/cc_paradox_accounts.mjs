// Lists the Paradox company accounts (/co/<Account>) found in Common Crawl.
// Usage: node cc_paradox_accounts.mjs [number_of_crawls=6]
// Output: data/cc_paradox_urls.txt (unique URLs) and data/cc_paradox_accounts.csv
import fs from "node:fs/promises";

const UA = "paradox-accounts-research/1.0";
const N_CRAWLS = Number(process.argv[2] ?? 6);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// GET with retries and growing backoff: the Common Crawl index often answers 503/504.
async function get(url, tries = 8) {
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(180_000) });
      const t = await r.text();
      if (r.ok) return t;
      if (r.status === 404 && t.includes("No Captures")) return "";
      log(`  HTTP ${r.status} (try ${i}/${tries})`);
    } catch (e) {
      log(`  ${e.name} (try ${i}/${tries})`);
    }
    await sleep(Math.min(120_000, 10_000 * i));
  }
  throw new Error("gave up: " + url);
}

const crawls = JSON.parse(await get("https://index.commoncrawl.org/collinfo.json")).slice(0, N_CRAWLS);
await fs.mkdir("data", { recursive: true });

const urls = new Set();
const perCrawl = [];
for (const c of crawls) {
  const api = c["cdx-api"];
  // Every subdomain of paradox.ai, keeping only /co/ job pages.
  const q = `url=paradox.ai&matchType=domain&filter=~url:/co/&fl=url&output=json`;
  let pages;
  try {
    pages = JSON.parse(await get(`${api}?${q}&showNumPages=true`)).pages;
  } catch (e) {
    log(`${c.id}: skipped (${e.message})`);
    perCrawl.push({ crawl: c.id, status: "failed" });
    continue;
  }
  log(`${c.id}: ${pages} index page(s)`);
  let n = 0;
  for (let p = 0; p < pages; p++) {
    try {
      const body = await get(`${api}?${q}&page=${p}`);
      for (const line of body.split("\n")) {
        if (!line.trim()) continue;
        try { urls.add(JSON.parse(line).url); n++; } catch {}
      }
    } catch (e) {
      log(`${c.id} page ${p}: skipped (${e.message})`);
    }
    await sleep(2_000); // be gentle with the shared index
  }
  log(`${c.id}: ${n} captures, ${urls.size} unique URLs so far`);
  perCrawl.push({ crawl: c.id, status: "ok", captures: n });
  await fs.writeFile("data/cc_paradox_urls.txt", [...urls].sort().join("\n") + "\n");
}

// Account = tenant + the path segment after /co/  (e.g. olivia / Wendys89619)
const accounts = new Map();
for (const u of urls) {
  const m = u.match(/^https?:\/\/([^/]+)\.paradox\.ai\/co\/([^/?#]+)/i);
  if (!m) continue;
  const tenant = m[1].toLowerCase();
  const account = decodeURIComponent(m[2]);
  const key = `${tenant}|${account.toLowerCase()}`;
  const a = accounts.get(key) ?? { tenant, account, urls: 0 };
  a.urls++;
  accounts.set(key, a);
}
// Brand = account name without trailing digits (Wendys89619 -> Wendys)
const brands = new Set([...accounts.values()].map((a) => a.account.replace(/\d+$/, "").toLowerCase()));

const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
const rows = [...accounts.values()].sort((a, b) => b.urls - a.urls);
await fs.writeFile(
  "data/cc_paradox_accounts.csv",
  "﻿" + ["tenant,compte,marque,urls_trouvees", ...rows.map((a) => [a.tenant, a.account, a.account.replace(/\d+$/, ""), a.urls].map(esc).join(","))].join("\n") + "\n",
);

const tenants = {};
for (const a of rows) tenants[a.tenant] = (tenants[a.tenant] ?? 0) + 1;
console.log("\n=== RESULT ===");
console.log(JSON.stringify({ crawls: perCrawl, uniqueUrls: urls.size, accounts: accounts.size, brands: brands.size, accountsPerTenant: tenants }, null, 2));
