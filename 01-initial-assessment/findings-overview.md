# Paradox jobs: overview of the findings

*Findings of 10 to 15 November 2026. Job counts are the `totalJob` values the sites announced on the day they were checked.*

## 1. The problem

> Okay you want to scrape all the jobs from from paradox.ai How would you do it? Please give me a list of all the jobs you found. How would you check that those jobs expires? How would you ensure you’re not scraping the same jobs twice?.

## 2. In short

- `paradox.ai/careers` returns a 404 and `careers.paradox.ai` redirects to Workday, which acquired Paradox in October 2025. Paradox's own openings (6 on 11 November 2026) are on Workday's job board.
- The jobs that matter are those **Paradox hosts for its clients**: 23 Paradox career sites checked announce about **131,800 jobs**.
- All Paradox career sites share **one JSON API**, `POST /api/get-jobs`, so one scraper can serve them all.
- Companies use Paradox in **several ways**: a full Paradox site, a Paradox site with applications in another ATS, or their own site fed by Paradox; some only show Paradox's chat widget, with their jobs held elsewhere. Each needs a different collection method. For some companies linked to Paradox, the site shows no trace of it, and no conclusion is possible.
- From a script, the Paradox APIs and pages are **protected** (403, AWS WAF challenge, reCAPTCHA). Collecting at scale would need authorised access.

## 3. How to recognise Paradox on a site

| Fingerprint | Where to see it | Example |
| --- | --- | --- |
| CNAME to `*.sites.paradox.ai` or `*.sites.<tenant>.paradox.ai` | DNS lookup | `www.frostyjobs.com` → `frostyjobs-com.sites.paradox.ai` |
| Career site on a `*.recruiting.com` host, itself a CNAME to `*.sites.paradox.ai` | DNS lookup | `issjobs.recruiting.com`, `saxtonjobs.recruiting.com` |
| Career site files from `cdn.sites.paradox.ai/…-careersites/…` | DevTools → Sources or Elements | Marriott, Flynn, Essentia |
| Olivia widget from `cdn.olivia.paradox.ai` or `dokumfe7mps0i.cloudfront.net` (same files: same S3 version id) | DevTools → Sources | Checkers, Marriott, 7-Eleven, Tractor Supply |
| `POST /api/get-jobs` returning `jobs`, `totalJob`, `facets` | DevTools → Network | every Paradox career site |
| Job ids starting with `PDX_` | API response | `PDX_MC_…`, `PDX_SO_…`, `PDX_MI_…` |
| Apply links to `…/co/<account>/Job?job_id=…` | API response, apply buttons | `olivia.paradox.ai/co/FlynnGroup/…` |
| Paradox requisition ids `P1-<number>-<number>` | job pages, apply links | Fontainebleau `P1-714914-16`, Five Guys `P1-1319936-1` |

No single fingerprint is enough: the DNS misses McHire (no CNAME) and Marriott (Akamai in front), and some sites have no `PDX_` ids (Regis, Essentia).

## 4. Four ways companies use Paradox, and one inconclusive case

| Pattern | Career site | Job list | Applications | Examples |
| --- | --- | --- | --- | --- |
| **A. Everything on Paradox** | Paradox | `/api/get-jobs` | Paradox (`/co/` pages) | McHire, Sodexo US, Regis, Flynn Group, Great Wolf Lodge, ISS, The Saxton Group |
| **B. Paradox site, other ATS** | Paradox | `/api/get-jobs` | Oracle, Workday, SuccessFactors or UltiPro | Marriott (Oracle), Essentia Health (Workday), Compass Group USA (SuccessFactors), AAA NCNU (Workday), GEODIS Americas (UltiPro) |
| **C. Own site, Paradox jobs** | the company | the company's own pages or API | Paradox (`/co/` pages or Olivia widget), sometimes plus other ATS | Checkers & Rally's, Fontainebleau Las Vegas, Chipotle, 7-Eleven; probably IHG |
| **D. Paradox use not established** | another platform | another platform | another platform | Extra Space (AppVault + Workday) |
| **E. Paradox chat widget only** | the company or another platform | another platform | another platform | Ace Hardware (Workstream, Classet, Workday), Tractor Supply (SuccessFactors) |

The patterns can mix on one site: TruGreen's Paradox career site sends 8 of its first 10 jobs to Olivia and 2 to Workday (A and B), and Valvoline's `jobs.vioc.com` sends its jobs to Olivia or, for a franchisee, to UKG / UltiPro.

**D is not a way of using Paradox: it means the site does not allow a conclusion.** The career site, its jobs and its applications show no trace of Paradox, while another source links the company to Paradox. That source does not say whether, how or since when Paradox is used:

- **Extra Space:** only Paradox's case study links it to Paradox. An old job URL in the Paradox format (`careers.extraspace.com/ai-engineer/job/C9208667E1BED2D6430456AD81BDF98C`) now returns 404, a hint that a Paradox site was replaced, not a proof.

Closing these cases would need more evidence: archived versions of the site (Wayback Machine), apply links on job boards pointing to `olivia.paradox.ai/co/…`, or "Text … to apply" instructions in job ads.

**E: Paradox is on the site, not in the jobs.** The site loads the Olivia widget, but none of the jobs checked applies through Paradox (6 at Ace Hardware, 5 at Tractor Supply). This matches their case studies, which list only conversational products (scheduling, apply, events), not Career Site Studio. Paradox there handles the chat and the interview scheduling on top of another system; for a Paradox scraper, these sites are not a target.

## 5. Sites checked

| Company | Career site | DNS | Jobs | Ids | Applications | Pattern |
| --- | --- | --- | --- | --- | --- | --- |
| McDonald's | `jobs.mchire.com` | no CNAME | 54,601 | `PDX_MC_` | `mchire.com/co/…` | A |
| Marriott | `careers.marriott.com` | Akamai | 30,969 | `PDX_MI_` | Oracle Cloud HCM | B |
| Flynn Group (8 sites) | `www.flynnrgcareers.com`, `work4thehut.com`, `frostyjobs.com`… | `…sites.paradox.ai` | 13,370 | `PDX_FG_`, hash (Arby's) | `olivia.paradox.ai/co/FlynnGroup` | A |
| Regis | `careers.regiscorp.com` | `…sites.regis…` | 5,378 | hash | Paradox | A |
| Sodexo US | `jobs.us.sodexo.com` | `…sites.sodexo…` | 3,856 | `PDX_SO_` | `sodexo.paradox.ai/co/…` | A |
| Regis (Supercuts) | `jobs.supercuts.com` | `…sites.regis…` | 2,652 | hash | Paradox | A |
| Regis (SmartStyle) | `jobs.smartstyle.com` | `…sites.regis…` | 1,521 | hash | Paradox | A |
| Compass Group USA | `careers.compass-usa.com` | `…sites.paradox.ai` | 15,466 | hash | SAP SuccessFactors | B |
| Essentia Health | `www.essentiacareers.org` | `…sites.paradox.ai` | 799 | hash | Workday | B |
| TruGreen | `www.trugreenjobs.com` | `…sites.paradox.ai` | 430 | `PDX_TR_` | Olivia, Workday | A/B |
| GEODIS Americas | `workatgeodis.com` | `…sites.paradox.ai` | 283 | hash | UKG / UltiPro | B |
| AAA NCNU | `careers.mwg.aaa.com` | `…sites.paradox.ai` | 112 | hash | Workday | B |
| Valvoline | `jobs.vioc.com` | `…sites.paradox.ai` | 1,532 | hash | Olivia, UltiPro | A/B |
| Great Wolf Lodge | `jobs.greatwolfresorts.com` | `…sites.paradox.ai` | 310 | `PDX_GWL_` | `olivia.paradox.ai/co/…` | A |
| ISS (US) | `issjobs.recruiting.com` | `…sites.paradox.ai` | 275 | `PDX_IS_` | `olivia.paradox.ai/co/…` | A |
| The Saxton Group | `saxtonjobs.recruiting.com` | `…sites.paradox.ai` | 197 | `PDX_MDTSG_` | `olivia.paradox.ai/co/…` | A |
| IHG Hotels & Resorts | `careers.ihg.com` | Akamai | 4,976 | title, country, number | Oracle (1 job tested) | probably C |
| Checkers & Rally's | `careers.checkers.com` | Azure | 1,566 | `PDX_…` (Paradox jobs) | Paradox 60%, other ATS 40% | C |
| Fontainebleau Las Vegas | `careers.fontainebleaulasvegas.com` | Cloudflare | 80 | `P1-…` (Paradox) | Olivia widget | C |
| Chipotle | `jobs.chipotle.com` | TalentBrew | 8,457 | `P1-…` (restaurant jobs) | restaurants on Olivia, corporate on Workday | C |
| 7-Eleven | `careers.7-eleven.com` | TalentBrew | 4,950 | `P1-…` (store jobs) | stores on Olivia | C |
| Extra Space | `careers.extraspace.com` | Cloudflare | 548 | Workday | Workday | D |
| Ace Hardware | `careers.acehardware.com` | own site | 2,713 | short ids | Workstream, Classet, Workday | E |
| Tractor Supply | `www.tractorsupply.careers` | SAP (jobs2web) | 6,088 (stores) | SuccessFactors | SuccessFactors | E |
| Altice USA | `alticeusacareers.com` | SAP (jobs2web) | — | — | redirects to SAP | no site found |

In the DNS column, `…sites.paradox.ai` is a host named after the client under `sites.paradox.ai` (e.g. `www.frostyjobs.com` → `frostyjobs-com.sites.paradox.ai`). The 23 Paradox career sites (patterns A and B, Flynn Group counting for 8) total about **131,800 jobs**. The jobs of IHG, Chipotle, 7-Eleven, Checkers and Fontainebleau come from their own sites and are counted apart.

## 6. What the Paradox API gives, and its limits

- **One call returns** 10 or 25 jobs (page size depends on the site), the total (`totalJob`) and the filters with their counts (`facets`: state, city, category…).
- **A 10,000-result cap.** On McHire, page 1001 returns 0 jobs and `totalJob: 0`. Large sites must be split by state (`&filter[state]=Texas`), then by city if needed. Marriott returned no `facets` in its first response: how to split it is not known yet.
- **No dates.** The API gives neither a publication date nor an expiry date. A job is marked expired when it is missing from **two complete crawls in a row**.
- **The request languages matter.** On Great Wolf Lodge and The Saxton Group, the API returns 0 jobs when the body lists `["en","en-us"]`, and the real total with `["en"]` only. A scraper must take the languages from each site's own page, or it would record these sites as empty.
- **A stable key.** `uniqueID` (`PDX_<client>_<GUID>_<location>`) identifies each job; the same GUID across locations means the same ad posted in several places.
- **Blocked from a script.** The API answers in a browser without any login, but returns **403 Access Denied** to a script (McHire, Sodexo). It is a bot protection, not an authentication.

## 7. What a Paradox `/co/` page gives

- **It identifies the employer**: the account name (`BMAIncAFranchiseeOfCheckersRallys1`) and the page title (*B.M.A., Inc.: A Franchisee of Checkers & Rally's*).
- **It does not list the employer's jobs.** An account page shows only a chat assistant protected by reCAPTCHA; a job page describes one job and links to no other.
- **A job page holds that job's data** in a `JobPosting` block (schema.org), rendered by the server with no AJAX call: title, `datePosted`, description, employer, address. There is no `validThrough` (expiry date).
- **It can trigger an AWS WAF challenge** (`202`, empty body, `x-amzn-waf-action: challenge`), not on every visit.

## 8. Finding the companies that use Paradox

| Method | What it finds | What it misses | Status |
| --- | --- | --- | --- |
| Public sources (Paradox's announcements, press coverage; a lead from prior knowledge or an LLM, checked on the site) | well-known clients, including sites with no Paradox DNS alias (McHire) | anything not publicised | used for McHire (`public-sources/`), verified through its `get-jobs` API |
| DNS check of known career domains | Paradox career sites (CNAME `.sites.`) | McHire, Marriott, Checkers, IHG, Fontainebleau | done on 30 domains, then on about 400 guessed names for the case studies (found Valvoline only) |
| Links on the company's own site | brand or country career sites on unexpected domains (Flynn's 8 sites, `jobs.greatwolfresorts.com`, `issjobs.recruiting.com`) | sites behind a bot challenge (Neighborly, Schnucks, Hamra…) | done for the case studies |
| Page fingerprints (`cdn.sites.paradox.ai`, Olivia) | Paradox sites whatever their DNS | needs one page load per site | done by hand |
| Apply links in job data | Paradox accounts of one brand (86 for Checkers) | brands not yet known | done for Checkers |
| Web search `site:olivia.paradox.ai` | employers on the shared platform (Wendy's, Five Guys, Valvoline…) | most of them (about 10 results per query) | done |
| Paradox case studies (66, with the products each client uses) | official clients; the "Career Site Studio" product points to likely Paradox sites | not reliable alone: Extra Space shows no Paradox site, Flynn has 8 not listed | products extracted to `../results/paradox_case_studies.csv`; all 66 checked, one file each in `findings/` or `early-findings/`, 20 not determined |
| Common Crawl (`*.paradox.ai/co/*`) | thousands of accounts | career sites on client domains | script ready, server down |
| Passive DNS (SecurityTrails, Validin…) | client domains pointing to `.sites.` | McHire, Marriott, Checkers | not used (paid) |

**Results so far:** 51 companies studied in `../results/paradox_clients.csv`. Among the 7 "Career Site Studio" clients checked last, 4 have a Paradox career site (Compass Group USA, TruGreen, GEODIS Americas, AAA), 1 has its own site fed by Paradox (Fontainebleau), 1 probably does (IHG) and 1 has no career site left (Altice USA). Finding each career domain took searches and DNS tries: `trugreenjobs.com`, `workatgeodis.com` and `careers.mwg.aaa.com` are not the obvious names. Among 4 other case studies checked next, 7-Eleven sends its store jobs to Paradox from a TalentBrew site (C, like Chipotle), Ace Hardware and Tractor Supply only show the Olivia widget (E), and Flynn Group runs 8 Paradox career sites its case study does not mention (A), one per brand (Applebee's, Taco Bell, Panera, Arby's, Pizza Hut, Wendy's, Planet Fitness) plus the head office, found through the links on `flynn.com`, on domains that do not name Flynn (`frostyjobs.com`, `work4thehut.com`). A last pass over the 60 case studies outside early-findings found 4 more Paradox career sites (Valvoline, Great Wolf Lodge, ISS, The Saxton Group, 2,314 jobs), 8 companies using Paradox only at the application step, 17 with their jobs on another platform, and 20 that could not be determined (bot challenges, no career site found). Great Wolf Lodge, first recorded as having no Paradox site, has one on `jobs.greatwolfresorts.com`. Account ids seen up to `company_id=13484` suggest more than 13,000 Paradox accounts, but that is a hint, not a count.

**Validation rule:** a company is a Paradox career site client only if its site loads Paradox's career site files and answers `/api/get-jobs` in the Paradox format. A case study, a `paradoxJobId` field or a `PDX_` id alone is not enough. The reverse also holds: a site with no Paradox API can still send its applications to Paradox (Chipotle, first classified as not Paradox), so the apply links must always be checked.

## 9. Why the approach does not scale as is

1. **No shared list.** Paradox exposes no directory of clients or jobs: each employer's entry point must be found.
2. **Several patterns.** Each pattern C site needs its own adapter (Checkers' `/api/search`, Fontainebleau's job pages, IHG's search, the TalentBrew sites of Chipotle and 7-Eleven), and the jobs of D and E companies are on other platforms (Workday, Phenom, Workstream, SuccessFactors), whatever their link to Paradox.
3. **Protections.** The Paradox APIs answer 403 to scripts, the `/co/` pages can trigger an AWS WAF challenge, and the chats use reCAPTCHA. This work does not get around them.
4. **Volume and freshness.** McHire alone is about 5,500 requests per crawl, and expiry needs full crawls repeated every day.
5. **Discovery gaps.** Each discovery method misses whole groups of clients (section 8).

Collecting Paradox jobs at scale would need a source shared by all employers with access granted: Paradox's official API, agreements with employers, or a licensed job-data provider.

## 10. Not checked

- Whether `/api/search` (Checkers) and the Paradox pages answer a script.
- How to split Marriott's 30,969 jobs under the 10,000-result cap.
- Whether Marriott uses Olivia for some jobs (only one apply link checked).
- What share of IHG's 4,976 jobs comes from its Paradox sources (only one job checked, from Oracle).
- How TruGreen splits its applications between Olivia and Workday beyond the first 10 jobs.
- Whether 7-Eleven's non-store jobs apply through Paradox (only Store Crew jobs checked).
- Whether any Ace Hardware or Tractor Supply job applies through Paradox (samples of 6 and 5 jobs).
- What a Paradox job page returns once the job has expired.
- How many Paradox accounts exist in total (Common Crawl was unavailable).
- Whether 20 case-study companies use Paradox (marked NOT DETERMINED in their `findings/` files): the career site was not found or answered with a bot challenge.

## 11. Files of the assessment

Paths are relative to this `01-initial-assessment/` folder.

| File | Content |
| --- | --- |
| `early-findings/scraping-conclusion.md` | Conclusion of the early findings: how to scrape the jobs Paradox hosts |
| `early-findings/checkers-findings.md` | Checkers & Rally's in detail (pattern C), with conclusion |
| `findings/scraping-conclusion.md` | Conclusion of the case-study findings: what they say about scraping Paradox jobs |
| `findings/<case-study>-findings.md` | one file per Paradox case study outside early-findings (60 files): result, evidence, or why the result is NOT DETERMINED |
| `findings/marriott-findings.md` | Marriott (pattern B, Oracle) |
| `findings/essentia-findings.md` | Essentia Health (pattern B, Workday) |
| `early-findings/flynn-findings.md` | Flynn Group (pattern A, 8 career sites, 13,370 jobs) |
| `early-findings/chipotle-findings.md` | Chipotle (pattern C, TalentBrew site, restaurant jobs on Paradox) |
| `findings/extraspace-findings.md` | Extra Space Storage (D: Paradox use not established) |
| `early-findings/7eleven-findings.md` | 7-Eleven (pattern C, TalentBrew site, store jobs on Paradox) |
| `early-findings/acehardware-findings.md` | Ace Hardware (E: Paradox chat widget only) |
| `early-findings/tractorsupply-findings.md` | Tractor Supply (E: Paradox chat widget only, SuccessFactors) |
| `public-sources/README.md` | McHire, a client known from public sources outside the case studies, and where that knowledge comes from |
| `public-sources/api-discovery-mchire.md` | step-by-step discovery of the API on McHire |
| `images-checkers/` | screenshots of the Checkers analysis |
