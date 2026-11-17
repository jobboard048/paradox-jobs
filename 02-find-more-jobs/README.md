# 02 – Finding more Paradox career sites

*Work of 15 and 16 November 2026, after the initial assessment (`01-initial-assessment`). Job counts are the `totalJob` values the sites announced on the day they were checked.*

## Starting point

The initial assessment ended with **23 Paradox career sites announcing about 131,800 jobs**, found through Paradox's case studies, the early findings and public sources, links on the companies' own sites and DNS checks of known domains. Paradox publishes no list of its clients' career sites, and most of them sit on the clients' own, unrelated domains, so they had been found one by one.

This stage looks for sources that list many Paradox career sites at once.

## Methods and results

| Method | Folder | What it found | New sites with jobs | Jobs |
| --- | --- | --- | --- | --- |
| crt.sh on `*.paradox.ai` | `crt.sh/` | 12 companies with their own Paradox instance; FedEx's career site; Lowe's (Paradox use not established) | 1 (FedEx) | 4,681 |
| crt.sh on `*.recruiting.com` | `crt.sh/` | 234 names in the certificate logs; 15 point to Paradox career sites | 10 (ISS and Saxton were already known) | 1,967 |
| Passive DNS, reverse CNAME on `*.sites.paradox.ai` (WhoisXML API, trial account) | `passive-dns/` | 72 names seen pointing to Paradox; 65 new | 55 | 91,177 |
| Passive DNS by name on `*.recruiting.com` | `passive-dns/recruiting-com/` | 5 names, none new | 0 | 0 |
| Web search `site:recruiting.com` (first try) | (not saved) | the search tool ignores `site:`; Bing showed a CAPTCHA | 0 | 0 |
| Web search on Paradox URL patterns (`inurl:"/job/P1-"`…) | `web-search/test/` | script ready (search API or URLs copied from a browser); an automated browser run (Playwright, visible Chrome) was stopped by Google's "unusual traffic" page at the first query | – | – |
| Google searches through Bright Data (run by the user) | `web-search/bright-data/` | run 1: nothing; run 2: 120 results, 16 Paradox career sites | 7 | 2,328 |
| **Total of this stage** | | | **73** | **100,153** |

**With the initial assessment: 96 Paradox career sites announcing about 231,900 jobs.**

Why `recruiting.com` matters, and its link to Paradox's founder: `recruiting-com.md`.

## Sites found

From crt.sh on `*.paradox.ai`: FedEx, `careers.fedex.com` (alias of `fedex.sites.paradox.ai`), 4,681 jobs on 10 November, ids `PDX_FEC_`, applications on `fedex.paradox.ai/co/…` (pattern A). Lowe's, also found there, has no Paradox career site (`talent.lowes.com` runs on Phenom and Workday).

From crt.sh on `*.recruiting.com` (checked on 16 November):

| Company | Career site | DNS | Jobs | Ids | Applications | Pattern |
| --- | --- | --- | --- | --- | --- | --- |
| Boddie-Noell (Hardee's) | `bnehardees.recruiting.com` | `…sites.paradox.ai` | 825 | `PDX_HA_` | `olivia.paradox.ai/co/…` | A |
| Darden (3 sites) | `dardenmyjobs.`, `dardenmanagerjobs.`, `dardenrscjobs.recruiting.com` | `…sites.darden.paradox.ai` | 904 (492 + 391 + 21) | hash, `PDX_DRSC_` | `darden.paradox.ai/co/…` | A |
| OrthoArizona | `orthoarizona.recruiting.com` | `…sites.paradox.ai` | 107 | hash | `orthoarizona.org` | B |
| University of New Mexico | `unmjobs.recruiting.com` | `…sites.paradox.ai` | 68 | hash | Cornerstone | B |
| First Credit Union | `firstcu.recruiting.com` | `…sites.paradox.ai` | 18 | `PDX_FCU_` | Olivia, Paycom | A/B |
| Choolaah | `choolaah.recruiting.com` | `…sites.paradox.ai` | 16 | `PDX_CIB_` | `olivia.paradox.ai/co/…` | A |
| YMCA of Greater Long Beach | `lbymca.recruiting.com` | `…sites.paradox.ai` | 16 | `PDX_YOGLB_` | `olivia.paradox.ai/co/…` | A |
| The Redland Company | `redlandjobs.recruiting.com` | `…sites.paradox.ai` | 13 | `PDX_TRCI_` | `olivia.paradox.ai/co/…` | A |

From passive DNS (checked on 16 November), 55 sites listing 91,177 jobs; the largest are Dunkin' 23,394, Sonic 16,957, Baskin-Robbins 7,260, Arby's 7,145, Love's 5,674 and Bath & Body Works 4,780. The full list is in `passive-dns/README.md`.

| Applications (first page of each site) | Sites | Jobs |
| --- | --- | --- |
| Paradox only | 18 | 5,149 |
| Paradox and other platforms | 8 | 52,595 |
| Other platforms only | 27 | 27,702 |
| No apply link in the data | 2 | 5,731 |

## What this stage changes

- **New examples of each pattern.** Pattern A: Darden, Boddie-Noell (Hardee's), Neighborly's brands, Victra, Carter's. Pattern B: Nordstrom and Stryker (Workday), Love's (SuccessFactors). The largest sites mix several platforms: Dunkin' (23,394 jobs), Sonic (16,957), Arby's (7,145).
- **Big brands often use Paradox as a display layer.** Of the 55 passive DNS sites, only 18 apply on Paradox alone.
- **A case study settled.** Neighborly, left "not determined" in the initial assessment because of a Cloudflare challenge, runs 6 Paradox brand sites with 777 jobs (`passive-dns/neighborly.md`). The initial assessment's count of undetermined case studies would go from 20 to 19.
- **A new fingerprint.** A career site on a `*.recruiting.com` host that is a CNAME of `*.sites.paradox.ai` (for example `bnehardees.recruiting.com`).
- **Companies studied.** `../results/paradox_clients.csv` grew from 51 companies (initial assessment) to 118: 6 from crt.sh, 54 from passive DNS and 7 from the Bright Data searches, marked in its `source` column.

## Discovery methods of this stage

| Method | What it finds | What it misses | Status |
| --- | --- | --- | --- |
| Certificate Transparency on `paradox.ai` | 12 clients with their own Paradox instance (Lowe's, FedEx, Darden, Sodexo, Regis…) | clients on the shared platform; the career sites themselves (one wildcard certificate) | done |
| Certificate Transparency on `recruiting.com` | 234 hosts, many of them franchisees (Wendy's, Dunkin', Hardee's…); Paradox sites there have their own certificate | hosts that no longer resolve (213 of 234, e.g. `southernrock`, `acehardware`); live names missing from the logs (`issjobs`) | done: 15 point to Paradox, 12 list 2,439 jobs |
| Passive DNS, reverse CNAME (WhoisXML API, trial account) | names pointing to `*.sites.paradox.ai`, on any domain: 72 names, 65 new | sites the provider's sensors never saw (`www.frostyjobs.com`, `www.trugreenjobs.com`…); sites with no alias (McHire) | done: 55 sites list 91,177 jobs |

## Not checked

- The Paradox career sites that the passive DNS provider never saw (e.g. `www.frostyjobs.com`), and the dedicated instances (`*.sites.regis.paradox.ai`: `jobs.costcutters.com` found by DNS, not counted).
- Which live `*.recruiting.com` Paradox sites are missing from the crt.sh logs (like `issjobs.recruiting.com`).

## Files

| File | Content |
| --- | --- |
| `conclusion.md` | conclusion of step 02: 73 new career sites, 100,153 jobs, where their applications go |
| `recruiting-com.md` | why `*.recruiting.com` matters: Paradox career sites on one shared domain, its link to Paradox's founder |
| `crt.sh/README.md` | crt.sh on `*.recruiting.com`: method, DNS results and the 12 sites that list jobs |
| `passive-dns/README.md` | passive DNS: the 6 searches with their conclusions, and the 55 sites that list jobs |
| `passive-dns/neighborly.md` | Neighborly, settled through passive DNS |
| `passive-dns/how-a-web-page-loads.md` | from a URL to the page on screen: DNS, TLS, HTTP, AJAX |
| `web-search/google-search-method.md` | the 3 Google searches (`site:recruiting.com`, `inurl:/job/P1-`), why they work, and the steps through Bright Data's SERP API |
| `web-search/bright-data/README.md` | the two Bright Data runs, and the 7 new sites they found |
| `web-search/test/README.md` | web search on Paradox URL patterns: queries, script (`web_search.mjs`), how to run it |
