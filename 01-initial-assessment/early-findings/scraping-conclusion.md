# Conclusion: how to scrape the jobs Paradox hosts

*Drawn from the six early findings of 10 to 15 November 2026: Checkers, Chipotle, 7-Eleven, Ace Hardware, Tractor Supply and Flynn Group.*

## What the six cases show

| Company | Where the job list comes from | How it is loaded | Applications | Paradox target? | Jobs found | Of which on Paradox | From `/api/get-jobs` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Flynn Group | 8 Paradox career sites | page 1 in the HTML, then `POST /api/get-jobs` (JSON) | Paradox, account `FlynnGroup` | **yes** (pattern A) | 13,370 | all (sample of 10 per site) | **13,370** |
| Checkers & Rally's | its own site (Next.js) | `/api/search`, all jobs in one JSON response | Paradox 60%, SuccessFactors and PeopleMatter 40% | **partly** (pattern C) | 1,566 | 938 | 0 (own `/api/search`) |
| Chipotle | TalentBrew | page 1 in the HTML, then AJAX returning HTML fragments | restaurants on Paradox, corporate on Workday | **partly** (pattern C) | 8,457 | not measured (restaurant jobs) | 0 (TalentBrew) |
| 7-Eleven | TalentBrew | same as Chipotle | store jobs on Paradox | **partly** (pattern C) | 4,950 | not measured (store jobs) | 0 (TalentBrew) |
| Ace Hardware | its own site | server pages only (`?spage=N`) | Workstream, Classet, Workday | **no** (pattern E, widget only) | 2,713 | none in a sample of 6 | 0 |
| Tractor Supply | SAP SuccessFactors | server pages only (offset in the address) | SuccessFactors | **no** (pattern E, widget only) | 6,088 ("Stores" category only) | none in a sample of 5 | 0 |
| **Total** | | | | | **37,144** | **at least 14,308** | **13,370** |

The job counts are the totals each site announced when it was checked (12 to 15 November 2026), not jobs downloaded one by one. The six sites list **37,144 jobs**; at least **14,308** of them apply through Paradox (Flynn Group and Checkers), plus an unmeasured share of Chipotle's and 7-Eleven's.

**Only 13,370 of them can be scraped from `/api/get-jobs`**, all at Flynn Group: the Paradox jobs of Checkers, Chipotle and 7-Eleven sit in lists served by other APIs (Checkers' `/api/search`, TalentBrew), so the generic Paradox scraper does not reach them. "Can be scraped" means the API returns them in a browser; from a script, every Paradox site tested answers 403.

Three lessons come out of this table:

- **Only Paradox career sites share one API.** `POST /api/get-jobs` answers the same way on every Paradox career site, so one scraper covers them all. Everywhere else, the list comes from another platform with its own format.
- **Paradox is often only the application step.** At Checkers, Chipotle and 7-Eleven, Paradox jobs can only be told apart by their apply link (`olivia.paradox.ai/co/…`) or their Paradox id (`PDX_…`, `P1-…`).
- **The Olivia widget on a page proves nothing about the jobs.** Ace Hardware and Tractor Supply load it, but none of their sampled jobs applies through Paradox.

## The way to scrape

### 1. Find the Paradox career sites

- **DNS:** a career host that is an alias (CNAME) of `*.sites.paradox.ai` (or `*.sites.<tenant>.paradox.ai`) is a Paradox career site. The alias sits on the host that serves the site, never on a bare domain: DNS does not allow a CNAME there, so a bare domain like `frostyjobs.com` points to plain IP addresses and only redirects. Test the `www` form (`www.frostyjobs.com`) or the subdomain the site is served from (`careers.fedex.com`, `jobs.us.sodexo.com`, `issjobs.recruiting.com`). A "no" is not final: McHire answers with plain IP addresses and Marriott sits behind Akamai, yet both are Paradox career sites.
- **The employer's own site:** Flynn's 7 brand sites were found through the links on `flynn.com/your-career`. Their domains (`frostyjobs.com`, `work4thehut.com`) do not name Flynn, and Paradox's case study does not mention them.
- **`*.recruiting.com` hosts** are Paradox career sites too (`issjobs.recruiting.com`, `saxtonjobs.recruiting.com`, aliases of `*.sites.paradox.ai`).
- **Paradox's case studies** give official client names, but they are incomplete: Flynn's lists only the Conversational ATS, while Flynn runs 8 Career Site Studio sites.
- **Check the apply links before concluding.** A site that does not run on Paradox can still send its jobs to Paradox (Chipotle, 7-Eleven, Checkers).

### 2. Collect each Paradox career site with one generic scraper

- **Page 1** is already in the HTML of `/jobs`; the next pages come from `POST /api/get-jobs?page_number=N`, 10 or 25 jobs per page, in structured JSON (`jobs`, `totalJob`, `facets`).
- **Take the request languages from each site.** Some sites (Great Wolf Lodge, The Saxton Group) return 0 jobs when the body lists `["en","en-us"]` and the real total with `["en"]` only.
- **Each job carries what is needed**: title, locations, `uniqueID`, `requisitionID` and `applyURL`, with no HTML parsing.
- **Above 10,000 results, split the search**, first by state (`&filter[state]=…`), then by city, using the `facets` counts. None of Flynn's sites needs it (the largest has 3,956 jobs); McHire does.

### 3. Handle the other platforms only if the goal requires it

- **Pattern C sites** (Checkers, Chipotle, 7-Eleven) need one adapter per platform (Checkers' `/api/search`, a TalentBrew adapter for Chipotle and 7-Eleven), then one request per job to read the apply link and keep the Paradox jobs.
- **Pattern E sites** (Ace Hardware, Tractor Supply) are not Paradox targets: their jobs belong to Workstream, Workday or SuccessFactors.

## The three questions of the exercise

**Not scraping the same job twice.** Each job is stored once, keyed on its `uniqueID`, and every crawl updates it in place (upsert) with a `first_seen` and a `last_seen` date. Two cases need care:

- **One ad, several places.** `uniqueID` is `PDX_<client>_<GUID>_<location>`, so the same GUID across locations means one ad posted in several places.
- **One account, several sites.** Flynn's 8 sites all apply on the same `FlynnGroup` account, and Arby's uses a 32-character hash instead of `PDX_FG_…`. The Paradox requisition id (`P1-…`, in `requisitionID`, the apply link and the `JobPosting` block) is the key to detect a job listed on two sites.

**Checking that jobs expire.** The API gives no expiry date, and the job pages have no `validThrough`. A job is marked expired when it is **missing from two complete crawls in a row**, and reactivated if it comes back. A crawl only counts as complete if every page was read; otherwise a partial crawl would expire jobs by mistake. Opening the job page could confirm the expiry, but what a Paradox job page returns once a job has expired is not checked yet.

**The list of jobs.** On the sites checked, the scraper's output is one row per job with its key, title, location, apply link and dates. The counts announced on the day of the checks are 13,370 jobs for Flynn Group alone, and about 131,800 over the 23 Paradox career sites checked so far (see `../findings-overview.md`).

## Limits

- **Protections.** From a script, the Paradox APIs answer **403**, the job pages can trigger an **AWS WAF challenge**, and the account pages use **reCAPTCHA**. The checks here were made in a browser, a few requests per site, and this work does not get around these protections.
- **No shared directory.** Paradox exposes no list of clients or jobs: each career site has to be discovered first, and every discovery method misses some.
- **Freshness has a cost.** Expiry needs full crawls repeated often: 1,340 requests per crawl for Flynn's 8 sites at 10 jobs per page.

## Conclusion

The way to scrape Paradox jobs is clear and mostly generic: **discover the Paradox career sites, collect each one through its own `get-jobs` API, store each job once under its Paradox id, and expire what disappears from two complete crawls.** Flynn Group shows the approach at its best: 8 sites, 13,370 jobs, one scraper, no new adapter. Its limits are elsewhere: finding the sites, the jobs of companies that use Paradox only for applications, and the bot protections. Collecting Paradox jobs at scale would need access granted for it: Paradox's official API, agreements with employers, or a licensed job-data provider.
