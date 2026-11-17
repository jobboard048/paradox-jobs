# Conclusion: what the 60 Paradox case studies say about scraping Paradox jobs

*Drawn from the 60 findings files in this folder, one per Paradox case study outside early-findings, checked from 11 to 15 November 2026.*

## What the case studies show

| Result | Case studies | Count |
| --- | --- | --- |
| **Paradox career site with a `get-jobs` API** | Marriott, Compass Group, Regis, Sodexo (US), Valvoline, Essentia Health, TruGreen, Great Wolf Lodge, GEODIS Americas, ISS (US), The Saxton Group, AAA Mountain West | 12 |
| Own career site fed by Paradox | Fontainebleau Las Vegas; probably IHG | 2 |
| Paradox at the application step only | The Good Care Group, Captain D's, Hattie B's, Sport Clips, Sobeys, Johnson Controls, Advantage Solutions, Wendy's (US franchisees) | 8 |
| Paradox use not established | Extra Space Storage | 1 |
| No Paradox career site, jobs on another platform | Workday (Zillow, JLL, Houston Methodist, OneDigital, Medtronic, REV Group), SAP SuccessFactors (Singtel, DKSH, KPMG Singapore, Royal London), and others (Shiseido, Dell, Touchmark, U.S. Xpress, First Watch, Workday, Altice USA) | 17 |
| **Not determined** | General Motors, Neighborly, NCS, Schnucks, Hamra, Wendy's NZ, Autism Learning Partners, Pacific Seafood, Elevo, Stanley Steemer, Nestlé, UOB, DFCU, ATD, Southern Rock, UnitingCare, Pfizer, MultiCare, MJHS, Burlington | 20 |

### Jobs found per company

The counts are the totals each site announced when it was checked (`totalJob` from `get-jobs` on Paradox career sites, the site's own counter elsewhere), not jobs downloaded one by one.

| Company | Result | Career site | Jobs found | From `/api/get-jobs` | Checked on |
| --- | --- | --- | --- | --- | --- |
| Marriott | Paradox career site (B) | `careers.marriott.com` | 30,969 | 30,969 | 12 Nov |
| Compass Group USA | Paradox career site (B) | `careers.compass-usa.com` | 15,466 | 15,466 | 13 Nov |
| Regis | Paradox career sites (A) | `careers.regiscorp.com`, `jobs.supercuts.com`, `jobs.smartstyle.com` | 9,551 (5,378 + 2,652 + 1,521) | 9,551 | 11 Nov |
| Sodexo (US) | Paradox career site (A) | `jobs.us.sodexo.com` | 3,856 | 3,856 | 11 Nov |
| Valvoline | Paradox career site (A/B) | `jobs.vioc.com` | 1,532 | 1,532 | 15 Nov |
| Essentia Health | Paradox career site (B) | `www.essentiacareers.org` | 799 | 799 | 13 Nov |
| TruGreen | Paradox career site (A/B) | `www.trugreenjobs.com` | 430 | 430 | 13 Nov |
| Great Wolf Lodge | Paradox career site (A) | `jobs.greatwolfresorts.com` | 310 | 310 (with languages `["en"]`) | 15 Nov |
| GEODIS Americas | Paradox career site (B) | `workatgeodis.com` | 283 | 283 | 13 Nov |
| ISS (US) | Paradox career site (A) | `issjobs.recruiting.com` | 275 | 275 | 15 Nov |
| The Saxton Group | Paradox career site (A) | `saxtonjobs.recruiting.com` | 197 | 197 (with languages `["en"]`) | 15 Nov |
| AAA Mountain West | Paradox career site (B) | `careers.mwg.aaa.com` | 112 | 112 | 13 Nov |
| **Total, Paradox career sites** | | 14 sites | **63,780** | **63,780** | |
| IHG Hotels & Resorts | own site, Paradox as one source (probably C) | `careers.ihg.com` | 4,976 (Paradox share not measured) | 0 (own search) | 13 Nov |
| Fontainebleau Las Vegas | own site fed by Paradox (C) | `careers.fontainebleaulasvegas.com` | 80 | 0 (own job pages) | 13 Nov |
| Extra Space Storage | Paradox use not established (D) | `careers.extraspace.com` | 548 (on Workday) | 0 | 12 Nov |

**Not counted:** the 8 companies using Paradox only at the application step (their job lists are not Paradox's, and most have no visible total), the 17 with their jobs on another platform, and the 20 not determined. None of them has a `/api/get-jobs` list.

**63,780 jobs can be scraped from `/api/get-jobs`**, all on the 14 Paradox career sites. That count includes the jobs of pattern B companies, which `get-jobs` lists even though their applications go to another ATS (Oracle at Marriott, SuccessFactors at Compass Group…): 14,189 of the 63,780 belong to companies that apply through Paradox alone (Regis, Sodexo, Great Wolf Lodge, ISS, The Saxton Group), and 1,962 to the mixed sites of TruGreen and Valvoline. "Can be scraped" means the API returns them in a browser; from a script, every Paradox site tested answers 403.

**The 12 scrapable companies run 14 Paradox career sites** (Regis has 3) and announce about **63,800 jobs**, half of them at Marriott (30,969). Their applications go:

- **to Paradox** (`/co/` pages) at Regis, Sodexo, Great Wolf Lodge, ISS and The Saxton Group (pattern A);
- **to another ATS** at Marriott (Oracle), Compass Group (SuccessFactors), Essentia and AAA (Workday) and GEODIS (UltiPro) (pattern B);
- **to both** at TruGreen (Olivia and Workday) and Valvoline (Olivia and UltiPro).

## What it teaches about the way to scrape

### The products a case study lists predict the result

- **Career Site Studio** is the best predictor: of the 13 case studies that list it, 9 have a Paradox career site; the others have their own site fed by Paradox (Fontainebleau, IHG), no visible Paradox use (Extra Space) or no career site left (Altice USA).
- **Conversational ATS** is the second one: Great Wolf Lodge, ISS and The Saxton Group list it without Career Site Studio and still run Paradox career sites (like Flynn Group in early-findings).
- **Scheduling, Apply or Events alone** never led to a Paradox career site among the companies determined. They point to Paradox working behind another system: an Olivia widget on a Workday or SuccessFactors site, or nothing visible at all.

So the case studies are worth checking in that order, but they are only a starting list: 66 case studies against more than 13,000 Paradox accounts.

### Finding the career site is the hard part

- **Guessing domains finds almost nothing.** About 400 guessed names (`careers.`, `jobs.`, `<name>careers.com`…) found one Paradox site (Valvoline). The others were reached through a link on the company's own pages: `greatwolf.com/jobs` → `jobs.greatwolfresorts.com`, the ISS US career page → `issjobs.recruiting.com`, `tsgrestaurants.com` → `saxtonjobs.recruiting.com`.
- **Test the site the company links to, not its main domain.** Great Wolf Lodge was first recorded as having no Paradox site because `greatwolf.com` was tested; its Paradox site lives on another domain.
- **Paradox sites also live under `*.recruiting.com`.** These hosts point to `*.sites.paradox.ai` (ISS, The Saxton Group): one more place where Paradox career sites can be found.
- **A Paradox trace on the page is not a Paradox job list.** The Olivia widget appears on sites whose jobs are on Workday, SuccessFactors or Recruitix (Johnson Controls, Sobeys, Sport Clips); only `/api/get-jobs` and the apply links settle it.

### Collecting the sites found is generic, with one trap

- **The same `get-jobs` scraper works on all 14 sites**, whether they are named after the client, under `sites.paradox.ai` or under `recruiting.com`.
- **The request languages must come from each site.** Great Wolf Lodge and The Saxton Group return 0 jobs when the request lists `["en","en-us"]`, and their real totals with `["en"]` only. A fixed value would record them as empty and, on the next crawl, expire all their jobs.
- **The job list is not always on `/jobs`.** On those two sites `/jobs` returns 404 and the list is on the home page; the API answers either way.

## Limits

- **20 of the 60 case studies (a third) could not be determined.** Most sites answered with a bot challenge or a 403 (Cloudflare, Akamai, AWS), or their career site was not found. This work does not get around these protections, so these results stay open.
- **The checks are samples.** Apply links were read on the first page of each site (10 jobs), and one request per site gave the totals.
- **Scale.** The case studies cover a small share of Paradox's clients; other discovery sources would reach many more, at the cost of testing each one.

## Conclusion

The case studies confirm the method of early-findings and sharpen it. A Paradox career site, when it exists, is collected by the same `get-jobs` scraper everywhere, provided the request languages are read from the site. The work is in finding the sites: the products a case study lists say where to look first (Career Site Studio, then Conversational ATS), and the company's own pages lead to the right domain. Of 60 companies Paradox presents as clients, 12 expose a Paradox job list (about 63,800 jobs), 8 use Paradox only to apply, 17 publish their jobs elsewhere and 20 could not be checked: being a Paradox client does not make a company's jobs collectable through Paradox.
