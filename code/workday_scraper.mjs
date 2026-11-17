// Scrapes a Workday job board through its public JSON API (the AJAX calls the page makes).
//
// Usage (from the project folder):
//   node code/workday_scraper.mjs [host] [tenant] [site] [search]
// Default: Paradox's own jobs, now on Workday's board after the acquisition:
//   node code/workday_scraper.mjs workday.wd5.myworkdayjobs.com workday Workday paradox
//
// Output (results/): workday_<site>_jobs.csv / .json and the store with the crawl history.
import { loadStore, saveStore, applyCrawl, toCSV, sleep } from "./lib/store.mjs";
import fs from "node:fs/promises";

const [host = "workday.wd5.myworkdayjobs.com", tenant = "workday", site = "Workday", search = "paradox"] = process.argv.slice(2);
const API = `https://${host}/wday/cxs/${tenant}/${site}`;
const HEADERS = { "Content-Type": "application/json", Accept: "application/json", "User-Agent": "job-scraper-exercise/1.0" };
const PAGE = 20; // Workday returns at most 20 jobs per call
const STORE = `results/workday_${site}_store.json`;

async function call(url, options = {}, tries = 4) {
  for (let i = 1; ; i++) {
    const r = await fetch(url, { ...options, headers: HEADERS, signal: AbortSignal.timeout(30_000) }).catch((e) => ({ ok: false, status: e.name }));
    if (r.ok) return r.json();
    if (r.status === 404) return null; // job removed: used to confirm expiry
    if (i >= tries) throw new Error(`HTTP ${r.status} on ${url}`);
    await sleep(2_000 * i);
  }
}

// 1. List: paginate with offset until we reach `total`.
const listed = [];
let total = Infinity;
for (let offset = 0; offset < total; offset += PAGE) {
  const page = await call(`${API}/jobs`, {
    method: "POST",
    body: JSON.stringify({ appliedFacets: {}, limit: PAGE, offset, searchText: search }),
  });
  if (offset === 0) total = page.total; // Workday only sends the total on the first page
  listed.push(...page.jobPostings);
  if (page.jobPostings.length === 0) break;
  await sleep(500);
}
console.log(`List: ${listed.length} job(s) announced, total = ${total}`);

// 2. Details: one call per job (description, start date, apply status).
const store = await loadStore(STORE);
const jobs = [];
for (const j of listed) {
  const d = await call(`${API}${j.externalPath}`);
  if (!d) continue; // disappeared between the list and the detail call
  const i = d.jobPostingInfo;
  jobs.push({
    id: i.jobReqId, // Workday requisition id: stable unique key
    title: i.title,
    location: i.location,
    country: i.country?.descriptor ?? "",
    remote: i.remoteType ?? "",
    time_type: i.timeType ?? "",
    posted_on: i.startDate,
    can_apply: i.canApply,
    url: i.externalUrl,
  });
  await sleep(500);
}

// 3. Dedup + expiry. Complete crawl = every announced job was fetched.
const complete = jobs.length === total;
const stats = applyCrawl(store, jobs, { complete });

// Confirm expiry on the job page: a removed job returns 404, a closed one canApply=false.
for (const job of Object.values(store.jobs)) {
  if (job.status === "active" && job.miss_count > 0) {
    const path = new URL(job.url).pathname.replace(`/${site}`, "");
    const d = await call(`${API}${path}`);
    if (!d || d.jobPostingInfo?.canApply === false) { job.status = "expired"; job.expired_at = new Date().toISOString(); stats.expired++; }
  }
}
await saveStore(STORE, store);

const rows = Object.values(store.jobs).sort((a, b) => (b.posted_on ?? "").localeCompare(a.posted_on ?? ""));
const cols = ["id", "title", "location", "country", "remote", "time_type", "posted_on", "status", "first_seen", "last_seen", "url"];
await fs.writeFile(`results/workday_${site}_jobs.csv`, toCSV(rows, cols));
await fs.writeFile(`results/workday_${site}_jobs.json`, JSON.stringify(rows, null, 2));

console.log(`Crawl ${complete ? "complete" : "INCOMPLETE (expiry skipped)"}:`, stats);
console.table(rows.map((r) => ({ id: r.id, title: r.title.slice(0, 55), location: r.location, posted: r.posted_on, status: r.status })));
