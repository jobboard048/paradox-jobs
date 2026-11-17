# `recruiting.com`: why it matters for finding Paradox jobs

*Found on 15 November 2026; checked on 15 and 16 November 2026.*

## What it is

- **Some Paradox career sites live under `*.recruiting.com`.** Each name is an alias (CNAME) of a Paradox host: `issjobs.recruiting.com` → `issconversationalats562.sites.paradox.ai`, `saxtonjobs.recruiting.com` → `mcalistersdelithesaxtongroup614.sites.paradox.ai`. They answer the same `POST /api/get-jobs` as every Paradox career site.
- **Recruiting.com and Paradox share a founder.** Paradox's own news page states that Aaron Matos founded Recruiting.com in 2012, and that Paradox started as "Recruiting.ai" in 2016 ([paradox.ai, 2018](https://www.paradox.ai/news/growing-ai-company-paradox-plans-to-double-staff)). `www.recruiting.com` itself resolves to IP addresses seen on Paradox career sites. How Recruiting.com's career sites moved to Paradox (acquisition or migration) is not stated.

## How it was found

1. Two case-study career pages linked to it: `tsgrestaurants.com` → `saxtonjobs.recruiting.com`, and ISS's US career page → `issjobs.recruiting.com`.
2. Their DNS pointed to `*.sites.paradox.ai`, and the browser confirmed `get-jobs`.

## Why it matters

- **One search lists them all.** Paradox career sites usually sit on the clients' own, unrelated domains, which no single source lists. Here they share one parent domain, and each has its own certificate, so one crt.sh search returns every name: 234, of which **15 point to Paradox and 12 list 2,439 jobs** (Boddie-Noell's Hardee's 825, three Darden sites 904, ISS 275, Saxton 197…).
- **It reaches small employers.** Many of these sites belong to franchisees and small organisations (a credit union, a YMCA, a university) that no case study names.
- **It is a pattern to watch for.** A shared hosting domain in front of Paradox sites turns a site-by-site search into one query. Other such domains, if they exist, would be worth the same treatment.

## Limits

- **Most names are dead:** 213 of the 234 no longer resolve; certificates outlive sites.
- **The list is incomplete:** `issjobs.recruiting.com` is live but not in the certificate logs, and passive DNS added only a few more names.
- **It is a small share of the total:** 2,439 of the about 229,600 jobs counted so far.

Details: `crt.sh/README.md` (method, the 15 sites, job counts), `passive-dns/recruiting-com/README.md` (the passive DNS search on this domain).
