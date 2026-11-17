# Checkers & Rally's: a career site of its own, fed by Paradox

*Findings of 12 November 2026, from `careers.checkers.com` and `olivia.paradox.ai` in a browser.*

Checkers & Rally's uses Paradox, but its career site is its own. Checkers built and hosts `careers.checkers.com`; the site's search API returns jobs that come from Paradox, and candidates apply on Paradox pages.

## 1. The site is hosted by Checkers

A DNS lookup shows that `careers.checkers.com` is an alias of `checkers-careers.azurewebsites.net`: the site runs on Microsoft Azure. It is a Next.js application built for Checkers.

## 2. Paradox is embedded in the page

The site's JavaScript loads the Olivia chat widget from `https://olivia.paradox.ai`, through a script named `paradox-source`. Paradox also lists Checkers & Rally's among its client stories (`paradox.ai/case-studies/checkers-rallys`).

## 3. The site's search API returns Paradox jobs

The search box calls `/api/search?searchQuery=…`, an API that belongs to the Checkers site. An empty search returned **1,566 jobs in one response**, with no pagination. Each job has the fields `referenceid`, `jobtitle`, `address`, `city`, `state`, `zip`, `applylink`, `category` and `distance`. Paradox jobs keep their Paradox id:

```
"referenceid": "PDX_COTQCIAFOCR_E0DF3A3D-58D7-4D06-82EE-7B5624642E_22056304",
"applylink":  "https://olivia.paradox.ai/co/CheckersoftheQuadCitiesIncAFranchiseeofCheckersRallys/Job?job_id=PDX_COTQCIAFOCR_E0DF3A3D-58D7-4D06-82EE-7B5624642E_22056304&posting_type=1"
```

## 4. Paradox handles 60% of the jobs

The apply links of the 1,566 jobs point to three platforms:

| Apply platform | Jobs | Accounts |
| --- | --- | --- |
| Paradox (`olivia.paradox.ai/co/…`) | 938 (60%) | 86 |
| SAP SuccessFactors (`career8.successfactors.com`, company `checkersdr`) | 576 (37%) | 1 |
| PeopleMatter (`my.peoplematter.com`) | 52 (3%) | 2 |

On Paradox, **84 accounts are franchisees** (for example `FalconsBurgerLLCAFranchiseeofCheckersRallys` with 81 jobs) and **2 are brand accounts**: `CheckersRallys4` (1 job, Pennsylvania) and `CheckersRallys5` (12 jobs, Ohio). My reading, not confirmed: company-owned restaurants hire mostly through SuccessFactors, franchisees through Paradox. The numbers 4 and 5 suggest that other brand accounts exist with no open job today.

## 5. A Paradox page identifies the employer, not its job list

An individual Paradox page tells **who is hiring**, but it does not give access to the employer's other jobs. Example:

```
https://olivia.paradox.ai/co/BMAIncAFranchiseeOfCheckersRallys1/Job?job_id=PDX_BIAFOCR_6EA292CD-BCE6-48EE-BA8E-26178E3A3124_24239508&posting_type=1
```

**What the page identifies**

- **The employer**, from the account name in the URL (`BMAIncAFranchiseeOfCheckersRallys1`) and from the page title: *B.M.A., Inc.: A Franchisee of Checkers & Rally's*.
- **The brand** it works for: Checkers & Rally's.
- **The job id** (`PDX_BIAFOCR_6EA292CD-BCE6-48EE-BA8E-26178E3A3124_24239508`), the same key as in `/api/search`.

**What it does not give**

- **No list of the employer's jobs.** The page describes one job (*Team Member*, 505 E. Oakland, Lansing, MI) and links to no other job.
- **No way to find other jobs from it.** Removing the `/Job?job_id=…` part leads to the account page `olivia.paradox.ai/co/<account>`, which shows only a chat assistant ("Mia"), protected by reCAPTCHA. The chat runs on internal messaging endpoints tied to a session, not on a job feed.
- **No way to find other pages.** Each page needs a job id that must already be known; ids come from a list, here Checkers' `/api/search`.

A page found this way still describes its own job in full: section 6 shows how to read it.

## 6. Getting the data of an individual job

Once a job URL is known (the `applylink` of `/api/search`), its Paradox page gives the job's data in a standard format: a **`JobPosting`** block ([schema.org](https://schema.org/JobPosting)), the format search engines such as Google for Jobs read.

**Where it is.** In the page's HTML, inside `<script type="application/ld+json">`. To see it: open the job page, `Ctrl+U` (page source), then `Ctrl+F` → `JobPosting`.

**The job data is also rendered in the HTML itself, without an AJAX call.** The title, location and description that the candidate sees are written into the page by the server, next to the `JobPosting` block. No request is made after the page loads to fetch them (see *How the page is loaded* below).

**What it contains**, on the B.M.A., Inc. job above:

| Field | Value |
| --- | --- |
| `@type` | JobPosting |
| `title` | Team Member |
| `datePosted` | 26-11-04 |
| `description` | the full job description (HTML text) |
| `hiringOrganization` | B.M.A., Inc.: A Franchisee of Checkers & Rally's |
| `identifier` | the job's identifier |
| `jobLocation` | 505 E. Oakland, Lansing, MI 48906, US |

**How to read it in code.** The block is JSON, so it needs no HTML parsing. In the browser console of the job page:

```
JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)
```

returns the object above. A scraper would do the same on the page's HTML: find the `application/ld+json` block and parse it.

**What it adds to `/api/search`**

| Data | `/api/search` | Job page |
| --- | --- | --- |
| Title, address | yes | yes |
| Employer name | in the apply link only | yes (`hiringOrganization`) |
| Publication date | no | yes (`datePosted`) |
| Full description | no | yes |
| Expiry date | no | no (`validThrough` absent) |

**Limits**

- **One page per job.** Each job needs its own request: 938 for the Paradox jobs of Checkers.
- **`datePosted` is not in the standard format.** `26-11-04` probably means 4 November 2026 (ISO would be `2026-11-04`); to check on more jobs before relying on it.
- **No expiry date.** Expiry still has to be inferred by comparing crawls of `/api/search`. Reopening a page may confirm that a job is closed (not tested on an expired job).
- **An AWS WAF challenge, not on every visit.** In a browser that had opened many Paradox pages in a short time, the job pages answered **202** before **200**, and requesting the B.M.A. page again returned **202** with an **empty body** and the header `x-amzn-waf-action: challenge`: Amazon's firewall (AWS WAF) asked for a JavaScript test before serving the page. In another browser, the same pages answered **200** directly, even in a private window. The firewall decides when to test a visitor (for instance after many requests, or without a validation cookie). A browser solves the test and then receives the full page; a request that does not solve it gets neither the HTML nor the `JobPosting`. The data of each job is public for a visitor, but the pages are protected against automated collection, so fetching them at scale would need authorised access.

**How the page is loaded.** The page is rendered on the server: the job data arrives with the HTML, with no AJAX call. The network shows the page itself (`GET /co/<account>/Job?job_id=…`), then only the chat widget's calls (`/api/job-posting/get-widget-rules`, `/api/widget/…`), none of which carries the job's description. The raw HTML of a job page (31,549 characters for a Checkers of the Quad Cities job) already contains the job title. The data is therefore in the page twice: as visible text for candidates and as the `JobPosting` block for machines. `Ctrl+U` shows the HTML as the server sent it.

## What it means for the scraping

- **The list comes from `/api/search`.** It is the only place that lists the jobs, in one response; the Paradox pages only complete each job.
- **Three sources of applications.** The Paradox jobs are 60% of the Checkers jobs: a complete picture also needs the SuccessFactors and PeopleMatter jobs, which `/api/search` returns too.
- **A stable key.** Paradox jobs keep their Paradox id (`PDX_…`), the natural key for deduplication, whether a job is found through `/api/search` or on its Paradox page.
- **Paradox does not show in the DNS.** It shows only in the widget the page loads and in the ids and apply links of the jobs.
- **Many accounts.** Checkers jobs on Paradox are spread over 86 accounts, one per franchisee or brand account.

## Not checked

- Whether `/api/search` answers a script the way it answers the page (I only called it from the page, a few times).
- Whether an empty search really returns every job, or only those near a default location (each job has a `distance` field).
- What a Paradox job page returns once the job has expired.

## Conclusion

The Checkers site gives its own jobs easily, but this approach does not seem to scale.

**What works.** One call to `/api/search` lists the 1,566 Checkers jobs in a single response, and each Paradox job page completes a job with its date and full description, in a standard `JobPosting` block.

**Why it does not seem to scale**

1. **The list belongs to one site.** `/api/search` is Checkers' own API, with its own address and format. It gives Checkers jobs only, and nothing on the Paradox side replaces it: Paradox pages neither list jobs nor list accounts. Every other employer would need its own entry point, found and coded by hand.
2. **The jobs are split across platforms.** Paradox handles 60% of the Checkers jobs; the other 40% are applied for on SuccessFactors and PeopleMatter. A complete collection means following each of these platforms too.
3. **The details cost one request per job.** Getting the date and the full description means opening each job page: 938 requests for the Paradox jobs of Checkers alone, to repeat on every crawl to detect changes.
4. **The Paradox pages are protected.** Job pages can trigger an AWS WAF challenge, and account pages run a chat protected by reCAPTCHA. Fetching them in bulk from a script would run into these protections, which this work does not get around.
5. **Expiry needs repeated full crawls.** No date says when a job ends (`validThrough` is absent), so the whole list has to be compared crawl after crawl.
6. **The entry point itself is unverified.** It is not known yet whether `/api/search` answers a script, nor whether an empty search returns every job.

In short, this site can feed the Checkers jobs, but each step depends on this one site, and the Paradox pages are protected. Collecting Paradox jobs at scale would need a source shared by all employers and access granted for it: Paradox's official API, an agreement, or a licensed data provider.
