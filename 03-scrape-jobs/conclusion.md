# Conclusion: how to scrape individual Paradox jobs

*Checked on 16 November 2026 in a browser, on The Saxton Group's career site (`saxtonjobs.recruiting.com`, 197 jobs) and its first job, a Restaurant Assistant Manager in Ardmore, Oklahoma.*

## 1. The list gives almost everything

`POST https://saxtonjobs.recruiting.com/api/get-jobs?page_number=N`, body `{"disable_switch_search_mode":false,"site_available_languages":["en"]}`, returns 10 jobs per page and `totalJob: 197`. Adding **`&page_size=20`** to the address returns 20 jobs per page: **10 requests for the whole site** instead of 20. Only 10 and 20 are accepted (5, 15, 25, 30, 40, 50 and 100 fall back to 10, without an error); at 20 per page, `totalJob` stays 197, the last page holds 17 jobs, and the first 2 pages contain exactly the same 40 jobs, in the same order, as the first 4 pages at 10. Each job comes complete:

| Field | Example | Use |
| --- | --- | --- |
| `uniqueID` | `PDX_MDTSG_528BF0A8-423A-4849-8C95-7F88417BC3C3_21807534` | storage key |
| `reference` | `P1-1861219-0` | Paradox requisition id |
| `title` | Restaurant Assistant Manager | |
| `description` | the full ad, in HTML | |
| `locations` | 2401 12th Avenue Northwest Suite 104-A, Ardmore, OK 73401, US, with coordinates | |
| `applyURL` | `olivia.paradox.ai/co/McAlistersDeliTSGRestaurants/Job?job_id=PDX_MDTSG_…` | where to apply: here Paradox |
| `originalURL` | `restaurant-assistant-manager/job/P1-1861219-0` | the job page |
| `companyName`, `accountName` | McAlister's Deli; "TSG Restaurants - McAlister's Deli Franchisee" | employer |

**Only the date is missing.**

**Page 1 is in the HTML, and the API returns it too.** When the listing page loads, the server already puts the first 10 jobs in the HTML (10 `P1-…` links and their `PDX_…` ids); the page makes no `get-jobs` call on load, and only the "Showing 1-10 of 197 jobs" line is filled in by JavaScript (it arrives as `Showing {start_job}-{end_job} of {total} jobs`). Pages 2 and beyond, and filter changes, come from `get-jobs`. Called with `page_number=1`, the API returns exactly the same 10 jobs as the HTML, in the same order, plus `totalJob`. So a scraper can use the API for every page, from page 1: one JSON format, more fields than the HTML list, and the total from the first call.

## 2. The job page adds the date

`https://saxtonjobs.recruiting.com/restaurant-assistant-manager/job/P1-1861219-0` carries a `JobPosting` block (schema.org) in the HTML sent by the server: `datePosted` (`2026-11-10T05:59:21Z`, the only place the date appears), `hiringOrganization` (name, website, logo), `identifier` (`P1-1861219-0`), `jobLocation`. There is **no `validThrough`**: no end date anywhere. Reading it costs one request per job (197 here), needed only for new jobs, since a job's date does not change.

## 3. What the ids mean

On 30 jobs of the site:

- **The last part of `uniqueID` is the location:** it equals the job's `locationID` in 30 cases out of 30 (`…_21807534` ↔ `locationID: "21807534"`, Ardmore).
- **The middle part is an ad posted at several restaurants:** `528BF0A8-…` is shared by 5 Restaurant Assistant Manager jobs (Ardmore, Norman, Lawton, Moore, Chickasha), each with its own location and its own requisition (`P1-1861219-0`, `P1-1861221-0`…); three other ads repeat across 7 or 8 restaurants.
- **So:** `uniqueID` (ad + location) identifies one job at one place and is the right storage key; the middle part groups the copies of one ad; `P1-…` identifies the requisition and recognises the same job on another site. The client code (`MDTSG`) reads as McAlister's Deli The Saxton Group, an interpretation.

## 4. The API depends on the calling page

The same request gave different answers depending on the page it came from:

| Calling context | Answer |
| --- | --- |
| `Referer` = the listing page (home page) | 200, 197 jobs |
| `Referer` = a category page (`/team-member`) | 200, 79 jobs |
| `Referer` = a job page | 200, 0 jobs |
| no `Referer` | 500, error page |
| no cookies | 403, "Access Denied" |

- **The `Referer` sets the scope:** the server applies the filter of the page that calls it. A scraper must call `get-jobs` with the site's listing page as `Referer`, or it gets 0 jobs or a single category, and must treat an empty answer as suspicious rather than as "no jobs".
- **The cookies are the bot protection:** without them, the answer is the same 403 that scripts get. The cookie that matters is not readable from the page's JavaScript (only Google Analytics cookies are); it is set when the page loads.

### How the `Referer` and the protection token work

- **The `Referer`** is an HTTP header the browser adds by itself to every request: the address of the page that made it (the page clicked from, or the page whose script calls the API). The page's `Referrer-Policy` decides how much it reveals; within the same site, the full address is sent. Paradox uses it as the search context, not as a security check: it tells the API which page's filter to apply.
- **The protection token** is a cookie the site sets after its bot check (AWS WAF on Paradox sites; the `202` / `x-amzn-waf-action: challenge` answer was seen on Paradox pages): the browser passes the check, the site answers with `Set-Cookie`, and the browser sends the cookie back with every later request to that domain. With AWS WAF it is usually named `aws-waf-token` (not confirmed on Saxton). The browser keeps it in its cookie store (on disk in the browser profile if it has an expiry date), marked `HttpOnly`: it is attached to requests but hidden from the page's JavaScript, which is why only the Google Analytics cookies were visible. It can be seen in DevTools → Application → Cookies.
- **It cannot be forged or edited:** the server signs it with a secret key only it holds, and checks the signature, the expiry, the domain and possibly a binding to the browser and network on every request; a changed or invented token fails the check. Its weak point is the reuse of a genuine token, which is why such tokens are short-lived (minutes rather than days) and why copying one into a script counts as getting around the protection.

## 5. The record and the crawl

```json
{
  "key": "PDX_MDTSG_528BF0A8-423A-4849-8C95-7F88417BC3C3_21807534",
  "ad": "528BF0A8-423A-4849-8C95-7F88417BC3C3",
  "requisition": "P1-1861219-0",
  "site": "saxtonjobs.recruiting.com",
  "employer": "McAlisters Deli - The Saxton Group",
  "title": "Restaurant Assistant Manager",
  "location": "2401 12th Avenue Northwest Suite 104-A, Ardmore, OK 73401, US",
  "apply_url": "https://olivia.paradox.ai/co/McAlistersDeliTSGRestaurants/Job?job_id=PDX_MDTSG_…",
  "handled_by": "Paradox",
  "date_posted": "2026-11-10",
  "first_seen": "2026-11-16", "last_seen": "2026-11-16", "status": "active"
}
```

Real examples, for the first 10 jobs of the site (raw API answer, job page, stored records): `examples/`.

**Cost per crawl:** one request per 20 jobs for the list with `page_size=20` (10 here), plus one request per new job for its date.

### How to know a job expired

- **There is no end date to rely on:** neither `get-jobs` nor the job page's `JobPosting` has a `validThrough`; `datePosted` only gives the start.
- **Expiry comes from absence:** a job missing from **2 complete crawls in a row** is marked `expired` (one miss can be a glitch); if it comes back later, it is marked `active` again.
- **Only complete crawls count:** every page was read, and the number of jobs received matches `totalJob`. A crawl cut short (an error, a 403, a timeout) must not expire anything.
- **An empty answer is suspicious, not a mass expiry:** called with the wrong `Referer`, `get-jobs` answers `200` with 0 jobs, which looks exactly like "the site has no jobs". Counted as a real crawl, it would expire all 197 Saxton jobs at once. A sudden drop to 0 (or a large drop) is treated as a failed crawl and checked again.
- **Not checked yet:** what a job page returns once the job has expired (a 404, a redirect, or a "no longer available" page); it could confirm an expiry.

### How to avoid scraping the same jobs twice

- **One record per `uniqueID`, updated in place:** a job already known only gets its `last_seen` date updated; it never gets a second row.
- **One ad at several places stays several jobs:** Saxton's 5 Restaurant Assistant Manager jobs share the ad id `528BF0A8-…` but have different locations and requisitions; they are 5 jobs, and the ad id groups them for reporting ("one ad, 5 restaurants").
- **The same job on two sites:** Flynn's 8 sites apply on one Paradox account, and Darden's `dardenmyjobs` and `dardenrscjobs` share one too; matching on the `P1-…` requisition id catches a job listed twice.
- **Duplicates within one crawl:** if jobs are added while the scraper pages through the list, the order shifts and a job can appear on two pages; keying on `uniqueID` absorbs it.
- **Sites whose `uniqueID` is not `PDX_…`:** some use a 32-character hash (Arby's site of Flynn Group, Regis); the `P1-…` requisition id is still in the apply link and in the job page's `JobPosting` (`identifier`), and on Saxton in the `reference` field.

### What to store for each job and each crawl

`first_seen` and `last_seen` record what the scraper observed, not what the employer published (that is `datePosted`):

- **`first_seen`**, set once: spots new jobs (only they need their job page fetched for the date), measures how long a job stays open (`last_seen − first_seen`), reveals reposted or refreshed jobs when compared with `datePosted`, and keeps a job's history if it closes and reopens. On the very first crawl it only means "already open when the scraper started".
- **`last_seen`**, updated at every crawl that finds the job: the safety net when crawls fail. If a site keeps answering 403 or empty lists, no complete crawl happens, nothing is ever "missed", and its jobs would stay active forever; a rule such as "not seen for 30 days → expired" (several times the crawl interval) covers that case.
- **Age is a flag, not an expiry:** a job still in the list is still open, whatever its age (hourly jobs are often hired for continuously); a job open for 6 months or more can be flagged "long-running", not expired.

This is the right minimum for a source with no lifecycle data, and it can be extended cheaply:

| Approach | What it adds | Cost |
| --- | --- | --- |
| `first_seen` / `last_seen` + miss counter + status | new jobs, expiry, safety net | minimal |
| + a fingerprint of the content (a hash of title, description, location, apply link) and an `updated_at` date | detects edited jobs | small |
| + a status history (opened, closed, reopened, each with a date) | keeps every open period | small |
| + a crawl log per site (date, complete or not, jobs received, `totalJob`) | separates "job closed" from "crawl failed"; checks the empty-answer trap | small |

The crawl log and the content fingerprint cover the two real risks seen in this project (failed or empty crawls, jobs edited without notice); the status history matters if reopenings do. If authorised access to Paradox's API became available, its own open and close events would replace these inferences.

## 6. What stops it at scale

Every step above works in a browser. From a script, Paradox career sites answer **403**: the protection cookie is missing.

**Reusing the browser's cookies in a script is not an option here.** A script can technically send any cookie, but the one that matters is not a login: it is the bot-protection token the site gives a browser once it has passed its checks (the page's JavaScript cannot even read it). Copying it into a script would make the script pass for that browser, which is getting around the protection, like a spoofed User-Agent or a solved CAPTCHA; this project does none of these. In practice it would not last either: such tokens are short-lived and can be tied to the browser and network they were issued to.

What remains:

- **in a browser, at the scale of normal use:** one visit and a handful of calls per site, which is how every count in this project was made;
- **at scale, through authorised access:** Paradox's official API, an agreement with the employers (a client can export its own jobs), or a licensed job-data provider. The scraping logic itself (paging, splitting large sites by state and city, the storage with deduplication and expiry) is already written in the project's `code/`.

## Limits

- **One site.** The `Referer` behaviour, the `page_size` values, the id structure and the job page fields were checked on Saxton's site (an earlier test on TruGreen only tried 50 per page, which falls back to 10); other Paradox sites follow the same model as far as seen (same API, same `JobPosting`), but this was not re-tested on each.
- **What an expired job page returns** was not checked.
