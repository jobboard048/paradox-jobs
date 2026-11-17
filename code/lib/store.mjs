// Job store shared by the scrapers: deduplication and expiry tracking.
//
// Each job is kept once, keyed by its unique id. Every crawl updates:
//   first_seen  - date of the first crawl that saw the job
//   last_seen   - date of the latest crawl that saw the job
//   miss_count  - complete crawls in a row that did NOT see the job
//   status      - "active" or "expired"
// A job is marked expired only after MISSES_TO_EXPIRE complete crawls in a row
// without it, so one failed or partial crawl never expires jobs by mistake.
import fs from "node:fs/promises";
import path from "node:path";

export const MISSES_TO_EXPIRE = 2;

export async function loadStore(file) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return { jobs: {}, crawls: [] };
  }
}

export async function saveStore(file, store) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(store, null, 2));
}

/**
 * Applies one crawl to the store (upsert on job.id).
 * @param jobs      normalized jobs from this crawl, each with a unique `id`
 * @param complete  true only if the crawl finished without errors and found
 *                  every job the API announced; expiry is skipped otherwise
 */
export function applyCrawl(store, jobs, { complete, now = new Date().toISOString() }) {
  const stats = { found: 0, new: 0, updated: 0, duplicatesInCrawl: 0, missed: 0, expired: 0, reactivated: 0 };
  const seen = new Set();

  for (const job of jobs) {
    if (seen.has(job.id)) { stats.duplicatesInCrawl++; continue; }
    seen.add(job.id);
    stats.found++;
    const old = store.jobs[job.id];
    if (!old) {
      store.jobs[job.id] = { ...job, first_seen: now, last_seen: now, miss_count: 0, status: "active" };
      stats.new++;
    } else {
      if (old.status === "expired") { stats.reactivated++; delete old.expired_at; }
      Object.assign(old, job, { last_seen: now, miss_count: 0, status: "active" });
      stats.updated++;
    }
  }

  if (complete) {
    for (const job of Object.values(store.jobs)) {
      if (job.status !== "active" || seen.has(job.id)) continue;
      job.miss_count++;
      stats.missed++;
      if (job.miss_count >= MISSES_TO_EXPIRE) {
        job.status = "expired";
        job.expired_at = now;
        stats.expired++;
      }
    }
  }

  store.crawls.push({ at: now, complete, ...stats });
  return stats;
}

export function toCSV(rows, columns) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return "﻿" + [columns.join(","), ...rows.map((r) => columns.map((c) => esc(r[c])).join(","))].join("\n") + "\n";
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
