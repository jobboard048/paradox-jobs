# Web search: finding Paradox career sites through search engines

*Status: `web_search.mjs` ready and tested on sample URLs (16 November 2026). An automated browser run was blocked by Google at the first query (see below); results still need to come from your own browser or a search API.*

## Automated browser run (16 November 2026)

`browser_search.mjs` opened a visible Chrome through Playwright (`playwright-core`, installed in this folder, using the installed Chrome; no proxy, no stealth plugin) to run the 5 queries, 1 page each, 10 seconds apart. **Google answered the first query (`inurl:"/job/P1-"`) with its "unusual traffic" page, and the script stopped**, as designed: it never solves or works around a CAPTCHA. Google detects a browser driven by automation even when it is visible; getting past it would need stealth techniques this project does not use. Output: `browser_urls_2026-11-16.txt` (no URLs, only the stop note). Two more runs the same day gave the same result; the third, with a stricter check, landed on Google's block page (`https://www.google.com/sorry/index?…`), saved as `browser_stop_2026-11-16.png`, which rules out a false alarm in the script. Waiting for a person to solve the CAPTCHA so the script can carry on was not done: it would still be getting around Google's bot check.

**Conclusion:** automated searching of Google is not an option here. The two remaining ways are the ones below: searches typed in your own browser (`manual_urls.txt`), or an official search API.

## Why this method

Passive DNS only knows the sites its provider's sensors saw, and it missed known Paradox sites (`www.frostyjobs.com`, `www.trugreenjobs.com`). Search engines index pages that are linked and crawled, so they can surface other sites. Paradox gives them something to search for: its job pages end in `/job/P1-<number>-<number>`, the Paradox requisition id, whatever the client's domain.

## How it works

1. **Queries** (`queries.txt`): Paradox job URLs (`inurl:"/job/P1-"`), `recruiting.com` subdomains, pages linking to `olivia.paradox.ai/co/`, brand families ("a Neighborly company").
2. **Results**, in one of two ways:
   - **an official search API with your own key**: Brave Search API (`BRAVE_API_KEY`) or Google Programmable Search (`GOOGLE_API_KEY`, `GOOGLE_CSE_ID`); raw answers are saved in `raw/`;
   - **your own browser**: run the queries yourself, copy the result URLs into `manual_urls.txt`.

   The script never scrapes a search engine's result pages: they are protected by CAPTCHAs (Bing showed one on 16 November), and this project does not get around bot protection.
3. **Filtering** by `web_search.mjs`: one row per hostname; names already known (client CSV, crt.sh, passive DNS) are marked; each hostname's DNS is resolved, and the ones pointing to `*.sites.paradox.ai` are flagged. DNS lookups only: no website is contacted.
4. **Page check** of the new Paradox hostnames: one normal visit each, to read the `get-jobs` total and where the applications go (as in `../../passive-dns/`).

```bash
# results copied from your own browser
node 02-find-more-jobs/web-search/test/web_search.mjs --from-file manual_urls.txt
# or through an API (keys from the environment, never saved)
BRAVE_API_KEY=... node 02-find-more-jobs/web-search/test/web_search.mjs --provider brave --pages 2
GOOGLE_API_KEY=... GOOGLE_CSE_ID=... node 02-find-more-jobs/web-search/test/web_search.mjs --provider google --pages 2
```

Output: `web_search_<date>.csv` with `host`, `query`, `example_url`, `dns_today`, `paradox` (yes / no / paradox.ai host), `already_known`.

## Test

On 4 sample URLs (`jobs.costcutters.com`, `careers.fedex.com`, `saxtonjobs.recruiting.com`, `www.indeed.com`): 3 point to Paradox, FedEx and Saxton are marked as known, Indeed as not Paradox, and `jobs.costcutters.com` comes out as **new** (`costcutterscareersite10.sites.regis.paradox.ai`, a Regis brand).

## Limits

- **Few results per query**: about 10 to 20 per page, mostly sites already known.
- **Search operators are partly supported**: `inurl:` and `site:` work in Google and Bing for a person; APIs may ignore some of them.
- **Expected yield**: a few to a few dozen new sites. `inurl:"/job/P1-"` is the most promising query, because it searches by Paradox's own URL format.
- **APIs need an account and a key**, created by the user; free tiers are limited.
