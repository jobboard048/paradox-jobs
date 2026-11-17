// Generic scraper for Paradox-hosted career sites (McHire, FedEx, Sodexo, Regis...).
// Every Paradox career site exposes the same AJAX endpoint:
//   POST https://<site>/api/get-jobs?page_number=N&radius=15&enable_kilometers=false
//   body {"disable_switch_search_mode": false, "site_available_languages": ["en","en-us"]}
//   -> { jobs: [...], totalJob: "54602", facets: [{ field: "state", facet_field_keyvalue: [...] }, ...] }
//
// The API stops after 10,000 results (page 1001 returns 0 jobs and totalJob 0), so large
// sites are split with filters: by state, then by city when a state is still above the cap.
//
// IMPORTANT: on the real sites this API answers 403 "Access Denied" to scripts (bot
// protection). This scraper does NOT try to get around it: it stops and explains.
// Its logic is tested against a local mock of the API: code/test_paradox_scraper.mjs
//
// Usage: node code/paradox_scraper.mjs <host> [--base http://localhost:PORT] [--delay ms]
import { loadStore, saveStore, applyCrawl, toCSV, sleep } from "./lib/store.mjs";
import fs from "node:fs/promises";

export const MAX_RESULTS = Number(process.env.PARADOX_MAX_RESULTS ?? 10_000);

export class BlockedError extends Error {}

export function makeClient({ base, delay = 300 }) {
  let requests = 0;
  async function getJobs(filters, page) {
    const q = Object.entries(filters).map(([k, v]) => `&filter[${k}]=${encodeURIComponent(v)}`).join("");
    const url = `${base}/api/get-jobs?radius=15&enable_kilometers=false&page_number=${page}${q}`;
    for (let i = 1; ; i++) {
      requests++;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", "User-Agent": "job-scraper-exercise/1.0" },
        body: JSON.stringify({ disable_switch_search_mode: false, site_available_languages: ["en", "en-us"] }),
        signal: AbortSignal.timeout(30_000),
      }).catch((e) => ({ ok: false, status: e.name }));
      if (r.status === 403) throw new BlockedError(`HTTP 403 on ${url}`);
      if (r.ok) { await sleep(delay); return r.json(); }
      if (i >= 4) throw new Error(`HTTP ${r.status} on ${url}`);
      await sleep(2_000 * i);
    }
  }
  return { getJobs, requests: () => requests };
}

const facet = (resp, field) => resp.facets?.find((f) => f.field === field)?.facet_field_keyvalue ?? [];

// Crawls every page of one query. Returns null if the query is above the cap.
async function crawlQuery(client, filters, first) {
  first ??= await client.getJobs(filters, 1);
  const total = Number(first.totalJob);
  if (total > MAX_RESULTS) return { tooBig: true, first, total };
  const pageSize = first.jobs.length || 1; // 10 on McHire, 25 on FedEx: read it, never hard-code it
  const jobs = [...first.jobs];
  for (let p = 2; p <= Math.ceil(total / pageSize); p++) jobs.push(...(await client.getJobs(filters, p)).jobs);
  return { jobs, total };
}

// Splits by state, then by city, until every query fits under the cap.
export async function crawlSite(client, log = console.log) {
  const first = await client.getJobs({}, 1);
  const announced = Number(first.totalJob);
  log(`${announced} jobs announced`);
  let r = await crawlQuery(client, {}, first);
  if (!r.tooBig) return { jobs: r.jobs, announced };

  const jobs = [];
  for (const s of facet(first, "state")) {
    r = await crawlQuery(client, { state: s.original_value });
    if (r.tooBig) {
      log(`  ${s.original_value}: ${r.total} jobs, above the cap -> split by city`);
      for (const c of facet(r.first, "city")) jobs.push(...(await crawlQuery(client, { state: s.original_value, city: c.original_value })).jobs);
    } else jobs.push(...r.jobs);
  }
  return { jobs, announced };
}

export function normalize(j, host) {
  const loc = j.locations?.[0] ?? {};
  return {
    id: j.uniqueID, // e.g. PDX_MC_<GUID>_<locationID>; a 32-char hash on Regis sites
    posting: /^PDX_[A-Z]+_([0-9A-F-]{36})_/.exec(j.uniqueID)?.[1] ?? j.uniqueID, // same GUID = same ad in several places
    site: host,
    title: j.title,
    employer: j.accountName ?? j.companyName ?? "",
    city: loc.city ?? "",
    state: loc.state ?? "",
    zip: loc.zipCode ?? "",
    lat: loc.latitude ?? "",
    lon: loc.longitude ?? "",
    reference: j.reference ?? "",
    apply_url: j.applyURL ?? "",
  };
}

export async function run(host, { base = `https://${host}`, delay = 300, outDir = "results", log = console.log } = {}) {
  const client = makeClient({ base, delay });
  const storeFile = `${outDir}/paradox_${host}_store.json`;
  const store = await loadStore(storeFile);
  let crawl;
  try {
    crawl = await crawlSite(client, log);
  } catch (e) {
    if (e instanceof BlockedError) {
      log(`\nBLOCKED: ${e.message}`);
      log("The site's bot protection refuses requests that do not come from a browser.");
      log("No authentication is involved (the API answers in a browser without any login).");
      log("This scraper does not get around it. Options: Paradox's official API, an agreement");
      log("with the employer, or a licensed job-data provider.");
      return { blocked: true };
    }
    throw e;
  }
  const jobs = crawl.jobs.map((j) => normalize(j, host));
  const unique = new Set(jobs.map((j) => j.id)).size;
  // Complete = we found every job the API announced (1% tolerance: totals move during a long crawl).
  const complete = unique >= crawl.announced * 0.99;
  const stats = applyCrawl(store, jobs, { complete });
  await saveStore(storeFile, store);
  const rows = Object.values(store.jobs);
  await fs.writeFile(`${outDir}/paradox_${host}_jobs.csv`, toCSV(rows, ["id", "posting", "title", "employer", "city", "state", "zip", "status", "first_seen", "last_seen", "apply_url"]));
  log(`Crawl ${complete ? "complete" : "INCOMPLETE (expiry skipped)"} in ${client.requests()} requests:`, stats);
  return { stats, complete, requests: client.requests(), unique };
}

if (process.argv[1] && /(^|[\\/])paradox_scraper\.mjs$/.test(process.argv[1])) {
  const [host, ...rest] = process.argv.slice(2);
  if (!host) { console.error("Usage: node code/paradox_scraper.mjs <host> [--base URL] [--delay ms]"); process.exit(1); }
  const opt = (k) => { const i = rest.indexOf(k); return i >= 0 ? rest[i + 1] : undefined; };
  const res = await run(host, { base: opt("--base"), delay: Number(opt("--delay") ?? 300) });
  process.exit(res.blocked ? 2 : 0);
}
