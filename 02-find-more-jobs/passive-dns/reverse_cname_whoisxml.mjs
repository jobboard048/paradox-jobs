// Reverse CNAME search with WhoisXML API's Reverse DNS API: which names are aliases (CNAME) of a Paradox host?
// Then checks each name's DNS today (DNS lookups only, no website contacted) and marks the names already
// known in the project.
//
// Usage (from anywhere):
//   WHOISXMLAPI_KEY=... node 02-find-more-jobs/passive-dns/reverse_cname_whoisxml.mjs ["*.sites.paradox.ai"]
//       queries the API (5 credits per request, up to 1,000 records) and saves the raw answer
//   WHOISXMLAPI_KEY=... node 02-find-more-jobs/passive-dns/reverse_cname_whoisxml.mjs --by-name "*.recruiting.com"
//       searches CNAME records by their name instead of their target (field "domain" instead of "value")
//   node 02-find-more-jobs/passive-dns/reverse_cname_whoisxml.mjs --from sites-paradox-ai/whoisxml_reverse_cname_<date>.json
//       reuses a saved answer, without any credit
// Each search gets its own subfolder, named after the query: "*.sites.paradox.ai" -> sites-paradox-ai/.
// The API key is read from the environment only; it is never written to a file.
// Output: whoisxml_reverse_cname_<date>.json and reverse_cname_<date>.csv in that subfolder.
import fs from "node:fs";
import path from "node:path";
import dns from "node:dns/promises";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIR, "../..");
const today = new Date().toISOString().slice(0, 10);
const args = process.argv.slice(2);

// "*.sites.paradox.ai" -> "sites-paradox-ai"
const folderFor = (term) => term.replace(/^\*+\.?/, "").replace(/\*+/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();

let answer, OUT;
const fromIdx = args.indexOf("--from");
if (fromIdx >= 0) {
  const src = path.resolve(DIR, args[fromIdx + 1]);
  answer = JSON.parse(fs.readFileSync(src, "utf8"));
  OUT = path.dirname(src);
} else {
  const key = process.env.WHOISXMLAPI_KEY;
  if (!key) throw new Error("Set WHOISXMLAPI_KEY, or use --from <saved file>");
  const term = args.find((a) => !a.startsWith("--")) || "*.sites.paradox.ai";
  const field = args.includes("--by-name") ? "domain" : "value";
  OUT = path.join(DIR, folderFor(term));
  fs.mkdirSync(OUT, { recursive: true });
  const r = await fetch("https://reverse-dns.whoisxmlapi.com/api/v1", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ apiKey: key, limit: 1000, includeAdditionalChecks: 0, recordType: "cname", terms: [{ field, term }] }),
  });
  answer = await r.json();
  if (!r.ok || !Array.isArray(answer.result)) throw new Error(`API answered ${r.status}: ${JSON.stringify(answer).slice(0, 200)}`);
  const file = `whoisxml_reverse_cname_${today}.json`;
  fs.writeFileSync(path.join(OUT, file), JSON.stringify({ query: term, field, date: today, ...answer }, null, 1));
  console.log(`saved ${path.relative(DIR, path.join(OUT, file))}: ${answer.result.length} records for ${term}`);
}

// names already known in the project (client CSV and the crt.sh results)
const known = [
  path.join(ROOT, "results/paradox_clients.csv"),
  path.join(ROOT, "02-find-more-jobs/crt.sh/recruiting_com_dns_2026-11-16.csv"),
].filter((f) => fs.existsSync(f)).map((f) => fs.readFileSync(f, "utf8").toLowerCase()).join("\n");
const isKnown = (name) => known.includes(name.toLowerCase()) || known.includes(name.toLowerCase().replace(/^www\./, ""));

async function resolve(h) {
  const chain = [];
  let cur = h;
  for (let i = 0; i < 5; i++) {
    try { const c = await dns.resolveCname(cur); chain.push(c[0]); cur = c[0]; } catch { break; }
  }
  if (chain.length) return chain.join(" > ");
  try { await dns.resolve4(h); return "A record"; } catch { return ""; }
}

const rows = [];
for (const r of answer.result) {
  const now = await resolve(r.name);
  rows.push({
    name: r.name,
    paradox_host: r.value,
    first_seen: new Date(r.first_seen * 1000).toISOString().slice(0, 10),
    last_seen: new Date(r.last_visit * 1000).toISOString().slice(0, 10),
    dns_today: now,
    live: /\.sites\.([a-z0-9-]+\.)?paradox\.ai/.test(now) ? "yes" : "no",
    already_known: isKnown(r.name) ? "yes" : "no",
  });
}
rows.sort((a, b) => a.already_known.localeCompare(b.already_known) || b.live.localeCompare(a.live) || a.name.localeCompare(b.name));

const cols = Object.keys(rows[0]);
const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
const out = path.relative(DIR, path.join(OUT, `reverse_cname_${today}.csv`));
fs.writeFileSync(path.join(DIR, out), "﻿" + cols.join(",") + "\n" + rows.map((r) => cols.map((c) => q(r[c])).join(",")).join("\n") + "\n");
const n = (f) => rows.filter(f).length;
console.log(`${rows.length} names: live ${n((r) => r.live === "yes")}, already known ${n((r) => r.already_known === "yes")}, new and live ${n((r) => r.live === "yes" && r.already_known === "no")}`);
console.log("written", out);
