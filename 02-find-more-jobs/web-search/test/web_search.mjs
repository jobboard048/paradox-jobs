// Web search for Paradox career sites, then DNS check of every hostname found.
// It never scrapes a search engine's result pages (they are protected by CAPTCHAs); results come either from an
// official search API with your own key, or from URLs you copied from your own browser.
//
// Usage (from anywhere):
//   BRAVE_API_KEY=... node 02-find-more-jobs/web-search/test/web_search.mjs --provider brave [--pages 2]
//   GOOGLE_API_KEY=... GOOGLE_CSE_ID=... node 02-find-more-jobs/web-search/test/web_search.mjs --provider google [--pages 2]
//       runs every query of queries.txt through the API; raw answers saved in raw/
//   node 02-find-more-jobs/web-search/test/web_search.mjs --from-file manual_urls.txt
//       reads URLs or hostnames pasted from your own browser (one per line; "# query" lines label the next URLs)
// Options: --out <folder> (default: this folder), --queries <file> (default: queries.txt)
// Output: web_search_<date>.csv: host, query, example URL, DNS today, points to Paradox, already known.
// Keys are read from the environment only; they are never written to a file. No website is contacted.
import fs from "node:fs";
import path from "node:path";
import dns from "node:dns/promises";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIR, "../../..");
const today = new Date().toISOString().slice(0, 10);
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const OUT = path.resolve(opt("--out", DIR));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

// ---- 1. collect URLs: [{ query, url }] ----
const found = [];
const provider = opt("--provider");
const fromFile = opt("--from-file");

if (fromFile) {
  let query = "(manual)";
  for (const raw of fs.readFileSync(path.resolve(DIR, fromFile), "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#")) { query = line.replace(/^#\s*/, "") || "(manual)"; continue; }
    found.push({ query, url: /^https?:\/\//.test(line) ? line : `https://${line}` });
  }
} else if (provider === "brave" || provider === "google") {
  const queries = fs.readFileSync(path.resolve(DIR, opt("--queries", "queries.txt")), "utf8")
    .split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
  const pages = Number(opt("--pages", "2"));
  const rawDir = path.join(OUT, "raw");
  fs.mkdirSync(rawDir, { recursive: true });
  for (const [qi, q] of queries.entries()) {
    for (let p = 0; p < pages; p++) {
      let url, headers = {};
      if (provider === "brave") {
        const key = process.env.BRAVE_API_KEY;
        if (!key) throw new Error("Set BRAVE_API_KEY");
        url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(q)}&count=20&offset=${p}`;
        headers = { Accept: "application/json", "X-Subscription-Token": key };
      } else {
        const key = process.env.GOOGLE_API_KEY, cx = process.env.GOOGLE_CSE_ID;
        if (!key || !cx) throw new Error("Set GOOGLE_API_KEY and GOOGLE_CSE_ID");
        url = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${encodeURIComponent(q)}&num=10&start=${1 + p * 10}`;
      }
      const r = await fetch(url, { headers });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) { console.log(`query ${qi + 1} page ${p + 1}: HTTP ${r.status}, stopping this query`); break; }
      fs.writeFileSync(path.join(rawDir, `${provider}_${today}_q${qi + 1}_p${p + 1}.json`), JSON.stringify({ query: q, page: p + 1, ...body }, null, 1));
      const links = provider === "brave" ? (body.web?.results || []).map((x) => x.url) : (body.items || []).map((x) => x.link);
      for (const link of links) found.push({ query: q, url: link });
      console.log(`query ${qi + 1} page ${p + 1}: ${links.length} results  (${q})`);
      if (!links.length) break;
      await sleep(1100); // stay under the providers' rate limits
    }
  }
} else {
  throw new Error("Use --provider brave|google, or --from-file <file>");
}

// ---- 2. one row per hostname ----
const byHost = new Map();
for (const f of found) {
  let host;
  try { host = new URL(f.url).hostname.toLowerCase(); } catch { continue; }
  if (!byHost.has(host)) byHost.set(host, { host, query: f.query, url: f.url });
}

// hostnames already known in the project: client CSV, crt.sh and passive DNS results
const knownFiles = [path.join(ROOT, "results/paradox_clients.csv")];
for (const sub of ["crt.sh", "passive-dns/sites-paradox-ai", "passive-dns/recruiting-com"]) {
  const d = path.join(ROOT, "02-find-more-jobs", sub);
  if (fs.existsSync(d)) for (const f of fs.readdirSync(d)) if (f.endsWith(".csv")) knownFiles.push(path.join(d, f));
}
const known = knownFiles.filter((f) => fs.existsSync(f)).map((f) => fs.readFileSync(f, "utf8").toLowerCase()).join("\n");
const isKnown = (h) => known.includes(h) || known.includes(h.replace(/^www\./, ""));

async function resolve(h) {
  const chain = [];
  let cur = h;
  for (let i = 0; i < 5; i++) {
    try { const c = await dns.resolveCname(cur); chain.push(c[0]); cur = c[0]; } catch { break; }
  }
  if (chain.length) return chain.join(" > ");
  try { await dns.resolve4(h); return "A record"; } catch { return ""; }
}

// ---- 3. DNS check (DNS lookups only, no website contacted) ----
const rows = [];
for (const r of byHost.values()) {
  const d = await resolve(r.host);
  rows.push({
    host: r.host,
    query: r.query,
    example_url: r.url,
    dns_today: d,
    paradox: /\.sites\.([a-z0-9-]+\.)?paradox\.ai/.test(d) ? "yes" : r.host.endsWith("paradox.ai") ? "paradox.ai host" : "no",
    already_known: isKnown(r.host) ? "yes" : "no",
  });
}
rows.sort((a, b) => b.paradox.localeCompare(a.paradox) || a.already_known.localeCompare(b.already_known) || a.host.localeCompare(b.host));

const cols = ["host", "query", "example_url", "dns_today", "paradox", "already_known"];
const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
const out = path.join(OUT, `web_search_${today}.csv`);
fs.writeFileSync(out, "﻿" + cols.join(",") + "\n" + rows.map((r) => cols.map((c) => q(r[c])).join(",")).join("\n") + "\n");
const n = (f) => rows.filter(f).length;
console.log(`${found.length} URLs, ${rows.length} hostnames: pointing to Paradox ${n((r) => r.paradox === "yes")}, of which new ${n((r) => r.paradox === "yes" && r.already_known === "no")}`);
for (const r of rows.filter((r) => r.paradox === "yes" && r.already_known === "no")) console.log("  NEW", r.host.padEnd(40), r.dns_today);
console.log("written", path.relative(process.cwd(), out));
