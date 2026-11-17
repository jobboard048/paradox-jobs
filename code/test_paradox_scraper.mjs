// Tests paradox_scraper.mjs against a local mock of the Paradox /api/get-jobs endpoint.
// The mock reproduces what was observed on jobs.mchire.com and careers.fedex.com:
//   - fixed page size (25 here), facets with counts, filter[state] / filter[city]
//   - a result cap: past it the API returns 0 jobs and totalJob "0"
//     (10,000 on the real sites, scaled down to 1,000 here to keep the test fast)
//   - one ad (same GUID) posted in several locations
// Usage: node code/test_paradox_scraper.mjs
process.env.PARADOX_MAX_RESULTS = "1000";
import http from "node:http";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
const { run } = await import("./paradox_scraper.mjs");

const CAP = 1000, PAGE = 25;
const layout = { Texas: { Houston: 700, Dallas: 500, Austin: 300 }, Florida: { Miami: 900 }, Ohio: { Columbus: 600 } };
let all = [];
let n = 0;
for (const [state, cities] of Object.entries(layout))
  for (const [city, count] of Object.entries(cities))
    for (let i = 0; i < count; i++, n++) {
      const guid = `00000000-0000-0000-0000-${String(Math.floor(n / 3)).padStart(12, "0")}`; // 3 locations per ad
      all.push({ uniqueID: `PDX_MK_${guid}_${n}`, title: `Crew Member ${n}`, accountName: "Mock Franchisee", locations: [{ city, state, zipCode: "00000" }], applyURL: `https://mock/apply/${n}` });
    }
let live = all.slice();

const facetsOf = (jobs) => ["state", "city"].map((field) => {
  const counts = {};
  for (const j of jobs) counts[j.locations[0][field]] = (counts[j.locations[0][field]] ?? 0) + 1;
  return { field, facet_field_keyvalue: Object.entries(counts).map(([v, c]) => ({ original_value: v, doc_count: c })) };
});

const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  if (u.pathname === "/blocked/api/get-jobs") { res.writeHead(403); return res.end("Access Denied"); }
  const state = u.searchParams.get("filter[state]"), city = u.searchParams.get("filter[city]");
  const page = Number(u.searchParams.get("page_number"));
  const hits = live.filter((j) => (!state || j.locations[0].state === state) && (!city || j.locations[0].city === city));
  const beyond = (page - 1) * PAGE >= CAP;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(beyond
    ? { jobs: [], totalJob: "0", facets: [] }
    : { jobs: hits.slice((page - 1) * PAGE, page * PAGE), totalJob: String(hits.length), facets: facetsOf(hits) }));
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;
const outDir = await fs.mkdtemp(path.join(os.tmpdir(), "paradox-test-"));
const quiet = () => {};
const go = () => run("mock.test", { base, delay: 0, outDir, log: quiet });
const results = [];
const step = (name, r) => { results.push({ step: name, ...r.stats, requests: r.requests }); };

try {
  // 1. Full crawl: 3,000 jobs, above the 1,000 cap -> split by state, then Texas by city.
  let r = await go();
  step("1. first crawl", r);
  assert.equal(r.complete, true);
  assert.equal(r.stats.new, 3000, "every job collected despite the cap");

  // 2. Same data again: no duplicates, nothing new.
  r = await go();
  step("2. same data", r);
  assert.equal(r.stats.new, 0);
  assert.equal(r.stats.updated, 3000);

  // 3. 40 jobs removed: missed once, NOT expired yet.
  const removed = new Set(all.slice(100, 140).map((j) => j.uniqueID));
  live = all.filter((j) => !removed.has(j.uniqueID));
  r = await go();
  step("3. 40 jobs removed", r);
  assert.equal(r.stats.missed, 40);
  assert.equal(r.stats.expired, 0, "one miss is not enough to expire");

  // 4. Still missing: now expired.
  r = await go();
  step("4. still missing", r);
  assert.equal(r.stats.expired, 40);

  // 5. 5 of them come back: reactivated, not duplicated.
  live = live.concat(all.slice(100, 105));
  r = await go();
  step("5. 5 jobs back", r);
  assert.equal(r.stats.reactivated, 5);
  assert.equal(r.stats.new, 0);

  // 6. Bot protection: a 403 stops the crawl cleanly.
  const blocked = await run("mock.test", { base: `${base}/blocked`, delay: 0, outDir, log: quiet });
  assert.equal(blocked.blocked, true);
  results.push({ step: "6. 403 response", blocked: true });

  const store = JSON.parse(await fs.readFile(path.join(outDir, "paradox_mock.test_store.json"), "utf8"));
  const postings = new Set(Object.values(store.jobs).map((j) => j.posting)).size;
  assert.equal(postings, 1000, "3 locations per ad -> 1,000 distinct ads");

  console.table(results);
  console.log(`Store: ${Object.keys(store.jobs).length} jobs (${postings} distinct ads, grouped by GUID).`);
  console.log("ALL TESTS PASSED");
} finally {
  server.close();
  await fs.rm(outDir, { recursive: true, force: true });
}
