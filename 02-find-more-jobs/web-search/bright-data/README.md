# Google searches through Bright Data: results

*Searches run by the user through Bright Data's SERP API on 16 November 2026; results analysed and checked in this project the same day. The method is described in `../google-search-method.md`.*

## Result: 7 new Paradox career sites, 2,328 jobs

| Site | Organisation | Jobs | Applications (first page) |
| --- | --- | --- | --- |
| `jobs.kwikfill.com` | Kwik Fill (United Refining) | 601 | Paradox |
| `careers.globalp.com` | Global Partners | 523 | no apply link in the data |
| `careers.amctheatres.com` | AMC Theatres | 358 | Paradox |
| `areasjobs.recruiting.com` | Areas Hospitality USA | 299 | Paradox |
| `stbcareers.recruiting.com` | St. Bernards Healthcare | 292 | HealthcareSource |
| `northlandhardees.recruiting.com` | Northland Restaurant Group (Hardee's, DORO Inc.) | 222 | Paradox |
| `scpdist.recruiting.com` | Southern Crown Partners | 33 | Paradox |
| **Total** | | **2,328** | 5 sites (1,513 jobs) on Paradox only |

Each name is an alias (CNAME) of a `*.sites.paradox.ai` host, and each site answered `POST /api/get-jobs` when opened once in a browser. None of the 7 had been found by crt.sh or passive DNS.

## The two runs

**Run 1** (`run1_sd_mwjbhlx0u6wykq2jh.json`): nothing useful.

| Search | Outcome |
| --- | --- |
| `inurl:/job/P1-` | failed: "google_captcha detected" |
| `site:recruiting.com -site:www.recruiting.com` | 0 results ("did not match any documents") |
| `inurl:/job/P1- -site:recruiting.com` | 70 results, none relevant: Google ignored `inurl:` |

**Run 2** (`run2_sd_mwjev0uy2jikdqc3q0.json`): 3 searches, 1 results page each, 120 results.

| Search | Results | Paradox career sites (DNS) | New |
| --- | --- | --- | --- |
| `site:recruiting.com -site:www.recruiting.com` | 10 | 10 | 4 (`areasjobs`, `northlandhardees`, `scpdist`, `stbcareers`) |
| `inurl:/job/P1- -site:recruiting.com` | 40 | 0 | 0 (same off-topic list as run 1) |
| `"inurl:/job/P1-"` (in quotes) | 70 | 6 | 3 (`careers.amctheatres.com`, `jobs.kwikfill.com`, `careers.globalp.com`) |

## What it teaches

- **Search Paradox's URL format as quoted text, not with `inurl:`.** Google ignores `inurl:`, but with quotes it matches the text `/job/P1-` and returns Paradox job pages; the rest of the 70 results is noise (P1 Industries, job boards, videos).
- **`site:recruiting.com` can work:** 0 results in run 1, 10 in run 2, all of them Paradox career sites. Google's answer to the same search varies from one run to the next.
- **Web search finds sites the other methods miss**, but few per page: 7 new sites from 120 results. More result pages of the two productive searches would likely find more.

## Files

| File | Content |
| --- | --- |
| `run1_sd_mwjbhlx0u6wykq2jh.json`, `run2_sd_mwjev0uy2jikdqc3q0.json` | Bright Data's raw answers, as downloaded |
| `run2_result_urls.txt` | the result URLs of run 2, grouped by search |
| `run2_dns_check_2026-11-16.csv` | DNS check of the 73 hostnames (`../test/web_search.mjs --from-file`): 16 point to Paradox, 7 new |
| `run2_page_check_2026-11-16.csv` | job count and applications of the 7 new sites |
