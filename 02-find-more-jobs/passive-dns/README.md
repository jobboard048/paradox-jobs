# Passive DNS, reverse CNAME: finding Paradox career sites on any domain

*Searches made on 16 November 2026. **Result: 55 new Paradox career sites with 91,177 jobs**, almost all from one search (`*.sites.paradox.ai`).*

## Searches and conclusions

| # | Provider | Query | Answer | Conclusion |
| --- | --- | --- | --- | --- |
| 1 | Robtex, free API | reverse search on `frostyjobs-com.sites.paradox.ai`, `sites.paradox.ai`, a Paradox IP | empty; its IP endpoint answers 404 | **Not usable**: its database does not even hold a known site |
| 2 | WhoisXML API | control: `frostyjobs-com.sites.paradox.ai` by target, `www.frostyjobs.com` and `frostyjobs.com` by name | empty | **Coverage is partial**: a known, live site is unknown to the provider |
| 3 | WhoisXML API | **`*.sites.paradox.ai` by target** (`sites-paradox-ai/`) | **72 names**, 71 live, **65 new** | **The useful search**: 55 sites list 91,177 jobs (page check below) |
| 4 | WhoisXML API | `*paradox.ai` by target | `404 Not found` | **Too broad**: the API refuses it |
| 5 | WhoisXML API | `*.recruiting.com` by name (`recruiting-com/`) | 5 names, none new | **No gain**: crt.sh lists far more `recruiting.com` sites |
| 6 | WhoisXML API | dedicated instances (`*.sites.darden.paradox.ai`, `*.sites.regis.paradox.ai`, `*.sites.sodexo.paradox.ai`) | not run | **Small expected gain** (see below) |

**Search 3 in detail.** Among the new names: `careers.arbys.com`, `careers.bathandbodyworks.com`, `careers.buffalowildwings.com`, `careers.carmax.com`, `careers.dunkindonuts.com`, `careers.nordstrom.com`, `careers.playstation.com`, `careers.stryker.com`, `careers.tiaa.org`, `jobs.loves.com`, `jobs.raisingcanes.com`, `jobs.xcelenergy.com`, `employment.ucsd.edu`, `jobs.wgu.edu`, `jobs.kenvue.com`… 6 names were already known (FedEx, Compass Group, Valvoline, Flynn's Planet Fitness site, YMCA Long Beach, St. Madeleine Sophie's), and `jobs.communityhealthchoice.org` no longer points to Paradox. Yet known sites are missing (`www.frostyjobs.com`, `www.trugreenjobs.com`, `careers.regiscorp.com`): the provider only knows the names its sensors saw.

**Search 6, why not run.** A free DNS check of likely brand sites shows that Darden's restaurant brands (`jobs.olivegarden.com`, `jobs.longhornsteakhouse.com`, `careers.cheddars.com`, `careers.yardhouse.com`) run on Darden's own site behind Azure, not on Paradox, and nothing new turned up for Sodexo. Only Regis has more: `jobs.costcutters.com` points to `costcutterscareersite10.sites.regis.paradox.ai`, a site not yet counted. The expected gain is a few hundred to a few thousand jobs, 1 to 2% of the project's total; `*.sites.regis.paradox.ai` alone would be the search worth its credits.

**Overall.** Passive DNS was the most productive discovery method of the project (55 sites with jobs, from one query), but each provider sees only part of the web: a second provider, or a source that reads web pages (Common Crawl, HTTP Archive), would be needed to go further. The trial account has 20 credits left (4 searches).

```bash
# reuse a saved answer (no credit)
node 02-find-more-jobs/passive-dns/reverse_cname_whoisxml.mjs --from sites-paradox-ai/whoisxml_reverse_cname_2026-11-16.json
# new search by target (5 credits); the key is read from the environment, never saved
WHOISXMLAPI_KEY=... node 02-find-more-jobs/passive-dns/reverse_cname_whoisxml.mjs "*.sites.paradox.ai"
# new search by name
WHOISXMLAPI_KEY=... node 02-find-more-jobs/passive-dns/reverse_cname_whoisxml.mjs --by-name "*.recruiting.com"
```

Each search keeps its files in a subfolder named after its query: `sites-paradox-ai/` (raw answer, DNS check, page check) and `recruiting-com/` (raw answer, DNS check, its own README).

## Page check of search 3 (16 November 2026)

Each site was opened once in a browser; the job total is `totalJob` from the site's own `POST /api/get-jobs`, and applications are read from the first page of jobs. Full table: `sites-paradox-ai/page_check_2026-11-16.csv`.

- **55 sites list jobs: 91,177 jobs in total.** 7 names are second names of a site already counted (Pilot ×2, TIAA ×2, Compass Group ×2) or redirect to it; 2 sites are empty (Kona Daze, Vitenas); 2 gave no total (Elder's Journey, Wickenburg hospital).
- **Where the applications go** (first page of each site):

| Applications | Sites | Jobs | Largest |
| --- | --- | --- | --- |
| Paradox only | 18 | 5,149 | Victra 1,435, Carter's 1,045, KBS 1,035 |
| Paradox and other platforms | 8 | 52,595 | Dunkin' 23,394, Sonic 16,957, Arby's 7,145, Raising Cane's 2,623 |
| Other platforms only | 27 | 27,702 | Baskin-Robbins 7,260, Love's 5,674, Jimmy John's 3,981, Pilot 1,978 |
| No apply link in the data | 2 | 5,731 | Bath & Body Works 4,780, Sunbelt Rentals 951 |

- **The other platforms** are mostly Workday (Nordstrom, Stryker, CarMax, TIAA…), then SuccessFactors, SmartRecruiters, Greenhouse, ADP, UltiPro, Oracle, Dayforce, and for restaurant franchisees Workstream, PeopleMatter, HigherMe, Harri and `jobappnetwork.com`.
- **Page sizes vary more than seen before:** 10 on most sites, 12 on some, 50 on PlayStation.

### Which sites can be queried with the Paradox API

All the totals above come from `POST https://<site>/api/get-jobs?page_number=N`, so a site counts as queryable when that call answered with a total. The column `get_jobs_api` of `sites-paradox-ai/page_check_2026-11-16.csv` gives the status of each name.

| Status | Names | Sites |
| --- | --- | --- |
| **Answers `get-jobs` with jobs** | 55 | `careers.dunkindonuts.com` (23,394), `careers.sonicdrivein.com` (16,957), `careers.baskinrobbins.com` (7,260), `careers.arbys.com` (7,145), `jobs.loves.com` (5,674), `careers.bathandbodyworks.com` (4,780), `careers.jimmyjohns.com` (3,981), `jobs.raisingcanes.com` (2,623), `careers.pilotcompany.com` (1,978), `careers.highmarkhealth.org` (1,896), `careers.buffalowildwings.com` (1,754), `careers.stryker.com` (1,451), `careers.victra.com` (1,435), `careers.nordstrom.com` (1,228), `careers.carmax.com` (1,176), `careers.carters.com` (1,045), `careers.kbs-services.com` (1,035), `careers.sunbeltrentals.com` (951), `careers.safelite.com` (402), `careers.playstation.com` (396), `retailcareers.pandoragroup.com` (378), `trabajos.mollymaid.com` (336), `www.avisbudgetgroup.jobs` (335), `careers.tiaa.org` (315), `careers.intactfc.com` (302), `careers.thecampbellscompany.com` (300), `www.westlaketalent.com` (272), `employment.ucsd.edu` (246), `jobs.rainbowrestores.com` (237), `careers.ips.us` (230), `careers.searhc.org` (220), `jobs.mrelectric.com` (181), `jobs.wesdschools.org` (172), `careers.bakkavor.com` (163), `jobs.kenvue.com` (141), `careers.vialto.com` (136), `careers.northcountryhealth.org` (111), `www.workwithmckibbon.com` (105), `jobs.xcelenergy.com` (102), `jobs.wgu.edu` (57), `jobs.monarchblackhawk.com` (41), `careers.hoodzinternational.com` (40), `jobs.azblue.com` (35), `jobs.forkshospital.org` (32), `jobs.playatgila.com` (32), `jobs.enmmc.com` (29), `jobs.sonifisolutions.com` (14), `jobs.dryerventwizard.com` (11), `jobs.lawnpride.com` (11), `jobs.laurensinstitute.org` (10), `jobs.miiamo.com` (9), `jobs.copenhagenliving.com` (5), `internalwocswendys.recruiting.com` (4), `jobs.cityofdelawareoh.gov` (3), `canadianjobs.rainbowrestores.com` (1) |
| Answers, but 0 jobs | 2 | `internalwocssunsetlanaikai.recruiting.com`, `jobs.drvitenas.com` |
| No total returned | 2 | `jobs.eldersjourney.org`, `jobs.wickhosp.com` |
| Same site as another row (not queried twice) | 6 | `cajobs.pilotflyingj.com`, `jobs.pilotflyingj.com` (both open `careers.pilotcompany.com`), `careers.in.tiaa.org`, `careers.nuveen.com` (TIAA), `careers.compassgroupcareers.com`, `trabajos.compassgroupcareers.com` (Compass Group, already known) |

Two caveats:

- **Queryable is not the same as "handled by Paradox".** `get-jobs` lists every job on the site; only the apply link says whether a job applies on Paradox (table above). For example, all of Nordstrom's jobs come through `get-jobs`, but they apply on Workday.
- **Queryable means in a browser.** From a script, Paradox career sites answer 403.

## Why this method

Every Paradox career site is reached through a DNS alias (CNAME) that points to a Paradox host:

```
www.frostyjobs.com      →  frostyjobs-com.sites.paradox.ai
careers.regiscorp.com   →  ….sites.regis.paradox.ai
issjobs.recruiting.com  →  issconversationalats562.sites.paradox.ai
```

The client's name (`www.frostyjobs.com`) can be anything, but the target always ends in `sites.paradox.ai` or `sites.<tenant>.paradox.ai`. So the most direct question is: **which names point to `*.sites.paradox.ai`?**

The methods used so far cannot answer it:

| Method | Why it falls short |
| --- | --- |
| DNS | only goes one way, name → target: each name must be known in advance |
| crt.sh (`../crt.sh/`) | certificates carry the client's name, and one wildcard certificate (`*.sites.paradox.ai`) hides the Paradox side; it only worked for the `*.recruiting.com` sites |
| Guessing domains | about 400 guesses found one site (Valvoline) |

Passive DNS answers it, whatever the client's domain.

## How passive DNS works

### What a DNS resolver does

A computer does not know where `www.frostyjobs.com` is. It asks a **resolver**: usually its internet provider's, or a public one such as Google (`8.8.8.8`) or Cloudflare (`1.1.1.1`). The resolver finds the answer by asking the right servers in turn:

```
your computer ──► resolver: "where is www.frostyjobs.com?"
                  resolver ──► root server:              "who handles .com?"
                  resolver ──► .com server:              "who handles frostyjobs.com?"
                  resolver ──► frostyjobs.com's server:  "www.frostyjobs.com?"
                               ◄── "it's an alias of frostyjobs-com.sites.paradox.ai"
                  resolver ──► paradox.ai's server:      "frostyjobs-com.sites.paradox.ai?"
                               ◄── "34.226.237.46, 98.87.125.241, …"
your computer ◄── resolver: "34.226.237.46"
```

The resolver keeps the answer for a while (its cache), so the next person who asks gets it straight away. `nslookup www.frostyjobs.com` shows which resolver is used, in its first lines (`Server:`, `Address:`).

### Where passive DNS records

- **A sensor watches the resolver's own lookups**: the traffic between the resolver and the servers it asks (lower part of the diagram). It records each answer: "`www.frostyjobs.com` → alias of `frostyjobs-com.sites.paradox.ai`, seen on 16 November 2026".
- **Resolver operators share this data** (internet providers, companies, public resolvers) with the passive DNS provider, usually under agreements.
- **The records are kept for years and indexed both ways**: name → target, and target → name. The second direction is the **reverse CNAME** query: "every name seen pointing to `*.sites.paradox.ai`".

### What is and is not recorded

- **Recorded:** the answers about domains: name, alias or IP, first and last date seen.
- **Not recorded:** who asked. The sensor only sees the resolver's lookups, not the user's computer.
- **Only what someone looked up:** a site nobody visited through a monitored resolver never appears, so small or new sites can be missed.

### No website is contacted

A search goes only to the provider's website or API, which answers from its database, like crt.sh does. Neither Paradox nor the clients' sites receive a request: no bot protection gets in the way, and the sites see nothing. The flip side is that the data shows the past, so each name still needs a DNS check today.

## How it is used here

1. **Reverse CNAME query** on `*.sites.paradox.ai` (and, if worth it, on a dedicated instance such as `*.sites.regis.paradox.ai`).
2. **DNS check today**: keep the names that still point to Paradox (the records include sites that are gone). Done by `reverse_cname_whoisxml.mjs`, output `reverse_cname_<date>.csv`.
3. **Page check**: open each site once in a browser and read `totalJob` from its `get-jobs`, as for `../crt.sh/`. Output `page_check_<date>.csv`.

## What it would find, and miss

- **Finds:** career sites on any client domain (`frostyjobs.com`, `careers.fedex.com`…), the `*.recruiting.com` sites missing from crt.sh (like `issjobs`), and sites that no longer exist (useful history, to be filtered out).
- **Misses:** sites with no alias, such as `jobs.mchire.com` (plain IP addresses), and names that the provider's sensors never saw resolved.
- **Unclear:** sites behind a CDN, such as `careers.marriott.com` (an alias of Akamai). Whether the chain to Paradox is recorded depends on the provider.

## Providers and cost

SecurityTrails, Validin, DomainTools (Farsight DNSDB) and WhoisXML API offer this search. Tested so far: Robtex's free API (empty answers, even for known sites) and WhoisXML API (above). Free tiers, when they exist, are limited in queries and results; a full reverse CNAME export usually needs a paid plan. An account and an API key are needed, created by the user.
