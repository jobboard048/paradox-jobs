# Conclusion: what step 02 found

*Work of 15 and 16 November 2026. Job counts are the `totalJob` values each site announced through its own `POST /api/get-jobs` when it was opened once in a browser.*

## In numbers

**Step 02 found 73 new Paradox career sites, listing 100,153 jobs.**

| Method | New career sites with jobs | Jobs |
| --- | --- | --- |
| crt.sh on `*.paradox.ai` (FedEx) | 1 | 4,681 |
| crt.sh on `*.recruiting.com` | 10 | 1,967 |
| Passive DNS, reverse CNAME on `*.sites.paradox.ai` | 55 | 91,177 |
| Passive DNS by name on `*.recruiting.com` | 0 | 0 |
| Google searches through Bright Data | 7 | 2,328 |
| **Total of step 02** | **73** | **100,153** |

**With the initial assessment (23 sites, about 131,800 jobs): 96 Paradox career sites listing about 231,900 jobs.**

The largest new sites: Dunkin' (23,394 jobs), Sonic (16,957), Baskin-Robbins (7,260), Arby's (7,145), Love's (5,674), Bath & Body Works (4,780), Jimmy John's (3,981), Raising Cane's (2,623).

## Where the applications go

`get-jobs` lists every job on a Paradox career site, whatever the system that handles the application. Read from the first page of each site:

| Applications | Sites | Jobs |
| --- | --- | --- |
| Paradox only | 31 | 13,117 |
| Paradox and other platforms | 9 | 52,613 |
| Other platforms only (Workday, SuccessFactors, SmartRecruiters, Cornerstone…) | 30 | 28,169 |
| No apply link in the data | 3 | 6,254 |

Of the 100,153 jobs, about **13,100 are handled by Paradox alone**: large brands mostly use Paradox as a display layer in front of another system, and the biggest sites (Dunkin', Sonic, Arby's) mix several platforms.

## What worked, and what did not

- **Passive DNS was the most productive method:** one query returned 72 names, 65 new, 55 of them listing jobs. It also settled a case study the initial assessment had left undetermined (Neighborly: 6 brand sites, 777 jobs).
- **crt.sh worked where names are certified one by one:** `*.paradox.ai` gave the 12 companies with their own Paradox instance (among them FedEx, 4,681 jobs), and `*.recruiting.com` gave 234 names, 15 pointing to Paradox.
- **Web search found a few sites the other methods missed:** through Bright Data, `site:recruiting.com` and the quoted search `"inurl:/job/P1-"` gave 7 new sites (AMC Theatres, Kwik Fill, Global Partners…). Google ignores `inurl:` as an operator, gave 0 results for `site:recruiting.com` in a first run, and blocked our own automated browser with a CAPTCHA.

## Limits

- **Read in a browser, not collected.** Every total comes from one normal page view per site; from a script, Paradox career sites answer 403, so downloading the 100,153 jobs would need authorised access.
- **Announced totals.** Nobody paged through each site to check that it returns exactly that many jobs.
- **Samples.** Application platforms are read from the first 10 jobs of each site.
- **Possible duplicates.** Two Darden sites (`dardenmyjobs`, 492 jobs, and `dardenrscjobs`, 21) apply on the same Paradox account; the 21 jobs may also be among the 492. Matching on the Paradox requisition id would settle it.
- **Partial coverage.** Each source misses sites: the passive DNS provider never saw some known ones (`www.frostyjobs.com`), and crt.sh misses live `recruiting.com` names (`issjobs`, and the 4 found by web search). The dedicated instances were not searched: `jobs.costcutters.com`, a Regis site on Paradox, is not counted. More Paradox career sites exist than the 96 counted.
