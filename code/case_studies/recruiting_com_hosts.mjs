// Lists the *.recruiting.com hosts from Certificate Transparency (crt.sh) and tests
// company names under recruiting.com. Paradox career sites live there too
// (issjobs.recruiting.com -> issconversationalats562.sites.paradox.ai).
//
// Usage (from the project root):
//   node code/case_studies/recruiting_com_hosts.mjs            uses 02-find-more-jobs/crt.sh/crt_recruiting_com_*.json if present
//   node code/case_studies/recruiting_com_hosts.mjs --fetch    queries crt.sh again and saves a new file
//   node code/case_studies/recruiting_com_hosts.mjs --resolve  also resolves every host listed (slow)
import fs from "node:fs";
import path from "node:path";
import dns from "node:dns/promises";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DATA = path.join(ROOT, "02-find-more-jobs", "crt.sh");
const args = process.argv.slice(2);

async function chain(h) {
  const out = [];
  let cur = h;
  for (let i = 0; i < 5; i++) {
    try { const c = await dns.resolveCname(cur); out.push(c[0]); cur = c[0]; } catch { break; }
  }
  if (!out.length) { try { await dns.resolve4(h); return "A"; } catch { return null; } }
  return out.join(" > ");
}

// 1. crt.sh list
let file = fs.readdirSync(DATA).filter((f) => /^crt_recruiting_com_.*\.json$/.test(f)).sort().pop();
if (args.includes("--fetch") || !file) {
  const r = await fetch("https://crt.sh/?q=%25.recruiting.com&output=json", {
    headers: { "user-agent": "paradox-jobs-scraper-demo/1.0" },
  });
  if (!r.ok) throw new Error(`crt.sh answered ${r.status}`);
  file = `crt_recruiting_com_${new Date().toISOString().slice(0, 10)}.json`;
  fs.writeFileSync(path.join(DATA, file), await r.text());
  console.log("saved", file);
}
const certs = JSON.parse(fs.readFileSync(path.join(DATA, file), "utf8"));
const hosts = new Set();
for (const c of certs) for (const n of c.name_value.split("\n")) hosts.add(n.toLowerCase().replace(/^\*\./, ""));
console.log(`${hosts.size} recruiting.com names in ${file}`);

if (args.includes("--resolve")) {
  for (const h of [...hosts].sort()) {
    const r = await chain(h);
    if (r && /paradox/i.test(r)) console.log("  PARADOX ", h.padEnd(48), r);
  }
}

// 2. company names from the case studies, tested under recruiting.com
const names = `zzqx-nonexistent-test southernrock saxtonjobs acehardware unilever careers generalmotors gm zillow neighborly neighborlybrands johnsoncontrols ncs ncsgroup schnucks singtel hamra hamraenterprises wendysnz autismlearningpartners alp dell revgroup houstonmethodist sobeys pacificseafood medtronic issjobs iss hattiebs hattieb dksh saxton elevo captainds captaind shiseido onedigital workday stanleysteemer goodcaregroup thegoodcaregroup nestle usxpress uob jll touchmark kpmg royallondon burlington dfcu dfcufinancial sportclips atd americantire firstwatch unitingcare pfizer multicare mjhs greatwolf greatwolflodge valvoline vioc advantage wendys compass essentia trugreen geodis marriott regis sodexo fedex flynn`.split(/\s+/);
console.log("\nCompany names under recruiting.com (the first one checks there is no wildcard):");
for (const n of names) {
  const r = await chain(`${n}.recruiting.com`);
  if (r) console.log("  " + `${n}.recruiting.com`.padEnd(42), r);
}
