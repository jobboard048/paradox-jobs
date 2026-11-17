# Flynn Group: 8 Paradox career sites, one Paradox account

*Checked on 12 and 15 November 2026, from `https://www.paradox.ai/case-studies/flynn-group`, `https://flynn.com/your-career/` and the 8 career sites it links to, in a browser.*

- **Paradox's case study describes a Conversational ATS.** It lists **Conversational ATS** only, powered by an assistant named "Frankie", across "seven distinct franchises" (75,000+ employees), with 90% of hiring automated. It does not list Career Site Studio, although every Flynn career site runs on it.
- **All 8 career sites linked from flynn.com are Paradox career sites.** Each `www` domain is an alias (CNAME) of a `*.sites.paradox.ai` host, and each page loads files from `cdn.sites.paradox.ai`. The bare domains point to IP addresses, so a DNS check must test the `www` form.
- **The 8 sites list about 13,370 jobs**, one site per brand plus the head office (counts from `totalJob` in each site's `get-jobs` answer):

  | Brand | Link on flynn.com | Final domain | Paradox host (CNAME) | Jobs |
  | --- | --- | --- | --- | --- |
  | Applebee's | `appleamericancareers.com` | `flynnapplebeesjobs.com` | `flynnapplebeesjobs-com.sites.paradox.ai` | 3,103 |
  | Taco Bell | `bellamericanjobs.com` | `flynntacobelljobs.com` | `www-bellamericanjobs-com.sites.paradox.ai` | 1,858 |
  | Panera | `jobs.panamericangroup.com` | `flynnpanerajobs.com` | `flynnpanerajobs-com.sites.paradox.ai` | 604 |
  | Arby's | `rbamericanjobs.com` | `flynnarbysjobs.com` | `flynnarbysjobs-com.sites.paradox.ai` | 2,604 |
  | Pizza Hut | `work4thehut.com` | `work4thehut.com` | `work4thehut-com.sites.paradox.ai` | 3,956 |
  | Wendy's | `frostyjobs.com` | `frostyjobs.com` | `frostyjobs-com.sites.paradox.ai` | 1,009 |
  | Planet Fitness | `flynnplanetfitnessjobs.com` | same | `www-flynnplanetfitnessjobs-com.sites.paradox.ai` | 225 |
  | Head office | `flynnrgcareers.com` | same | `flynnrgcareers-com.sites.paradox.ai` | 11 |

- **All 8 sites apply through one Paradox account.** The jobs sampled all send "Apply" to `olivia.paradox.ai/co/FlynnGroup/Job?job_id=P1-…`, and their `companyName` is `paradox-api.paradox.ai-Flynn Group`. Ids are `PDX_FG_…` on 7 sites; Arby's uses a 32-character hash (`084E52F7…`) as `uniqueID`, with the `P1-…` requisition id in the apply link and the `JobPosting` block.
- **For scraping:** Flynn Group is a pattern A company, spread over 8 domains. Not checked: the apply links beyond the first page of each site (10 jobs per site), and whether the same job appears on two sites.

## How the job list is loaded

All 8 sites work like every Paradox career site.

- **Page 1 is rendered by the server.** The raw HTML of `/jobs` already holds the first 10 jobs (10 `PDX_FG_` ids on most sites). Some sites show the total ("Showing 1-10 of 3103 jobs"); Taco Bell, Arby's and Planet Fitness do not.
- **The next pages come from the Paradox API.** `POST /api/get-jobs?page_number=N` on each site returns structured JSON: `jobs`, `totalJob`, `facets`, and for each job its title, locations, `uniqueID`, `requisitionID` and `applyURL`.
- **Collecting the 8 sites takes about 1,340 requests** at 10 jobs per page, with no parsing. The largest site (Pizza Hut, 3,956 jobs) stays far below the 10,000-result cap, so no state or city split is needed.

## Conclusion

Flynn Group is a clean Paradox case (pattern A): the generic `get-jobs` scraper covers all 8 sites as they are, and no new adapter is needed. Its difficulty is discovery, not technique. The brand sites live on domains that do not name Flynn (`frostyjobs.com`, `work4thehut.com`), and the case study only describes the conversational ATS, so they are found through the links on `flynn.com` or through DNS, not through Paradox's own pages. Because all 8 sites feed the same `FlynnGroup` account, deduplication should rely on the Paradox requisition id (`P1-…`) rather than on the domain.
