// Resolves the DNS of every *.recruiting.com name found on crt.sh and sorts them:
//   paradox  - alias (CNAME) of a *.sites.paradox.ai host: a Paradox career site
//   other    - alias of another host
//   a-record - plain IP addresses, no alias
//   dead     - no DNS answer: the certificate exists, the site no longer does
// Only DNS lookups: none of the sites is contacted.
//
// Usage (from anywhere):
//   node 02-find-more-jobs/crt.sh/resolve_recruiting_com.mjs           uses the newest crt_recruiting_com_*.json here
//   node 02-find-more-jobs/crt.sh/resolve_recruiting_com.mjs --fetch   queries crt.sh again and saves a new file here
// Output: recruiting_com_dns_<date>.csv in this folder.
import fs from "node:fs";
import path from "node:path";
import dns from "node:dns/promises";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const today = new Date().toISOString().slice(0, 10);

let file = fs.readdirSync(DIR).filter((f) => /^crt_recruiting_com_.*\.json$/.test(f)).sort().pop();
if (process.argv.includes("--fetch") || !file) {
  const r = await fetch("https://crt.sh/?q=%25.recruiting.com&output=json", {
    headers: { "user-agent": "paradox-jobs-scraper-demo/1.0" },
  });
  if (!r.ok) throw new Error(`crt.sh answered ${r.status}`);
  file = `crt_recruiting_com_${today}.json`;
  fs.writeFileSync(path.join(DIR, file), await r.text());
  console.log("saved", file);
}

const certs = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8"));
const hosts = [...new Set(certs.flatMap((c) => c.name_value.split("\n")).map((n) => n.toLowerCase().replace(/^\*\./, "")))].sort();

async function resolve(h) {
  const chain = [];
  let cur = h;
  for (let i = 0; i < 5; i++) {
    try { const c = await dns.resolveCname(cur); chain.push(c[0]); cur = c[0]; } catch { break; }
  }
  if (chain.length) return { kind: chain.some((x) => /\.sites\.([a-z0-9-]+\.)?paradox\.ai$/i.test(x)) ? "paradox" : "other", target: chain.join(" > ") };
  try { return { kind: "a-record", target: (await dns.resolve4(h)).sort().join(" ") }; } catch { return { kind: "dead", target: "" }; }
}

const rows = [];
for (let i = 0; i < hosts.length; i += 20) {
  const part = hosts.slice(i, i + 20);
  rows.push(...(await Promise.all(part.map(async (h) => ({ host: h, ...(await resolve(h)) })))));
}

const order = { paradox: 0, other: 1, "a-record": 2, dead: 3 };
rows.sort((a, b) => order[a.kind] - order[b.kind] || a.host.localeCompare(b.host));
const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
const csv = "﻿host,kind,dns_target\n" + rows.map((r) => [r.host, r.kind, r.target].map(q).join(",")).join("\n") + "\n";
const out = `recruiting_com_dns_${today}.csv`;
fs.writeFileSync(path.join(DIR, out), csv);

const count = (k) => rows.filter((r) => r.kind === k).length;
console.log(`${hosts.length} names from ${file}: paradox ${count("paradox")}, other ${count("other")}, a-record ${count("a-record")}, dead ${count("dead")}`);
for (const r of rows.filter((r) => r.kind === "paradox")) console.log("  " + r.host.padEnd(40), r.target);
console.log("written", out);
