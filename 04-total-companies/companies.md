# Paradox: all the companies whose jobs can be scraped

*Companies found in `01-initial-assessment` (10–15 November 2026) and `02-find-more-jobs` (15–16 November 2026). A company is listed when at least one of its career sites is a Paradox career site that answered `POST /api/get-jobs` with jobs. Job counts are the `totalJob` values each site announced when it was opened once in a browser.*

## Totals

| | Companies | Career sites | Jobs |
| --- | --- | --- | --- |
| Found in 01 | 14 | 23 | 131,751 |
| Found in 02 | 66 | 73 | 100,153 |
| **Total** | **80** | **96** | **231,904** |

Of these, 32 companies (95,458 jobs) send their applications to Paradox only; the others list their jobs on a Paradox career site but take applications partly or entirely on another system (Workday, SuccessFactors, Oracle…). Applications were read from the first page of jobs of each site.

## Companies

| # | Company | Career sites | Jobs | Applications | Found in | Method |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | McDonald's (McHire) | `jobs.mchire.com` | 54,601 | Paradox | 01 | public source |
| 2 | Marriott | `careers.marriott.com` | 30,969 | Oracle | 01 | case study |
| 3 | Dunkin' | `careers.dunkindonuts.com` | 23,394 | Paradox and others | 02 | passive DNS |
| 4 | Sonic Drive-In | `careers.sonicdrivein.com` | 16,957 | Paradox and others | 02 | passive DNS |
| 5 | Compass Group USA | `careers.compass-usa.com` | 15,466 | SuccessFactors | 01 | case study |
| 6 | Flynn Group | `work4thehut.com` (3,956), `flynnapplebeesjobs.com` (3,103), `flynnarbysjobs.com` (2,604), `flynntacobelljobs.com` (1,858), `frostyjobs.com` (1,009), `flynnpanerajobs.com` (604), `www.flynnplanetfitnessjobs.com` (225), `www.flynnrgcareers.com` (11) | 13,370 | Paradox | 01 | case study, links on flynn.com |
| 7 | Regis | `careers.regiscorp.com` (5,378), `jobs.supercuts.com` (2,652), `jobs.smartstyle.com` (1,521) | 9,551 | Paradox | 01 | case study |
| 8 | Baskin-Robbins | `careers.baskinrobbins.com` | 7,260 | jobappnetwork.com | 02 | passive DNS |
| 9 | Arby's (brand site) | `careers.arbys.com` | 7,145 | Paradox and others | 02 | passive DNS |
| 10 | Love's Travel Stops | `jobs.loves.com` | 5,674 | SuccessFactors | 02 | passive DNS |
| 11 | Bath & Body Works | `careers.bathandbodyworks.com` | 4,780 | no apply link in the data | 02 | passive DNS |
| 12 | FedEx | `careers.fedex.com` | 4,681 | Paradox | 02 | crt.sh |
| 13 | Jimmy John's | `careers.jimmyjohns.com` | 3,981 | Workstream, jobappnetwork.com | 02 | passive DNS |
| 14 | Sodexo (US) | `jobs.us.sodexo.com` | 3,856 | Paradox | 01 | case study |
| 15 | Raising Cane's | `jobs.raisingcanes.com` | 2,623 | Paradox and others | 02 | passive DNS |
| 16 | Pilot Company (Pilot Flying J) | `careers.pilotcompany.com` | 1,978 | SmartRecruiters, A-Suite | 02 | passive DNS |
| 17 | Highmark Health | `careers.highmarkhealth.org` | 1,896 | Workday, no apply link | 02 | passive DNS |
| 18 | Buffalo Wild Wings | `careers.buffalowildwings.com` | 1,754 | Paradox and others | 02 | passive DNS |
| 19 | Valvoline | `jobs.vioc.com` | 1,532 | Paradox and UltiPro | 01 | case study |
| 20 | Stryker | `careers.stryker.com` | 1,451 | Workday | 02 | passive DNS |
| 21 | Victra | `careers.victra.com` | 1,435 | Paradox | 02 | passive DNS |
| 22 | Nordstrom | `careers.nordstrom.com` | 1,228 | Workday | 02 | passive DNS |
| 23 | CarMax | `careers.carmax.com` | 1,176 | Workday | 02 | passive DNS |
| 24 | Carter's | `careers.carters.com` | 1,045 | Paradox | 02 | passive DNS |
| 25 | KBS | `careers.kbs-services.com` | 1,035 | Paradox | 02 | passive DNS |
| 26 | Sunbelt Rentals | `careers.sunbeltrentals.com` | 951 | no apply link in the data | 02 | passive DNS |
| 27 | Darden | `dardenmyjobs.recruiting.com` (492), `dardenmanagerjobs.recruiting.com` (391), `dardenrscjobs.recruiting.com` (21) | 904 | Paradox | 02 | crt.sh |
| 28 | Boddie-Noell (Hardee's) | `bnehardees.recruiting.com` | 825 | Paradox | 02 | crt.sh |
| 29 | Essentia Health | `www.essentiacareers.org` | 799 | Workday | 01 | case study |
| 30 | Neighborly (Molly Maid, Rainbow Restoration, Mr. Electric, Dryer Vent Wizard, Lawn Pride) | `trabajos.mollymaid.com` (336), `jobs.rainbowrestores.com` (237), `jobs.mrelectric.com` (181), `jobs.dryerventwizard.com` (11), `jobs.lawnpride.com` (11), `canadianjobs.rainbowrestores.com` (1) | 777 | Paradox | 02 | passive DNS |
| 31 | Kwik Fill (United Refining) | `jobs.kwikfill.com` | 601 | Paradox | 02 | web search (Bright Data) |
| 32 | Global Partners | `careers.globalp.com` | 523 | no apply link in the data | 02 | web search (Bright Data) |
| 33 | TruGreen | `www.trugreenjobs.com` | 430 | Paradox and Workday | 01 | case study |
| 34 | Safelite | `careers.safelite.com` | 402 | Workday | 02 | passive DNS |
| 35 | Sony Interactive Entertainment (PlayStation) | `careers.playstation.com` | 396 | Greenhouse, no apply link | 02 | passive DNS |
| 36 | Pandora (stores) | `retailcareers.pandoragroup.com` | 378 | Paradox and others | 02 | passive DNS |
| 37 | AMC Theatres | `careers.amctheatres.com` | 358 | Paradox | 02 | web search (Bright Data) |
| 38 | Avis Budget Group | `www.avisbudgetgroup.jobs` | 335 | Paradox | 02 | passive DNS |
| 39 | TIAA (and Nuveen) | `careers.tiaa.org` | 315 | Workday | 02 | passive DNS |
| 40 | Great Wolf Lodge | `jobs.greatwolfresorts.com` | 310 | Paradox | 01 | case study |
| 41 | Intact Financial | `careers.intactfc.com` | 302 | Workday | 02 | passive DNS |
| 42 | The Campbell's Company | `careers.thecampbellscompany.com` | 300 | Workday | 02 | passive DNS |
| 43 | Areas Hospitality USA | `areasjobs.recruiting.com` | 299 | Paradox | 02 | web search (Bright Data) |
| 44 | St. Bernards Healthcare | `stbcareers.recruiting.com` | 292 | HealthcareSource | 02 | web search (Bright Data) |
| 45 | GEODIS Americas | `workatgeodis.com` | 283 | UltiPro | 01 | case study |
| 46 | ISS (US) | `issjobs.recruiting.com` | 275 | Paradox | 01 | case study |
| 47 | Westlake | `www.westlaketalent.com` | 272 | Workday | 02 | passive DNS |
| 48 | UC San Diego | `employment.ucsd.edu` | 246 | UC San Diego's own site | 02 | passive DNS |
| 49 | IPS | `careers.ips.us` | 230 | Paradox | 02 | passive DNS |
| 50 | Northland Restaurant Group (Hardee's, DORO Inc.) | `northlandhardees.recruiting.com` | 222 | Paradox | 02 | web search (Bright Data) |
| 51 | SEARHC (Southeast Alaska Regional Health Consortium) | `careers.searhc.org` | 220 | Paradox | 02 | passive DNS |
| 52 | The Saxton Group (McAlister's Deli) | `saxtonjobs.recruiting.com` | 197 | Paradox | 01 | case study |
| 53 | Washington Elementary School District | `jobs.wesdschools.org` | 172 | SchoolSpring | 02 | passive DNS |
| 54 | Bakkavor | `careers.bakkavor.com` | 163 | Paradox and others | 02 | passive DNS |
| 55 | Kenvue | `jobs.kenvue.com` | 141 | Workday | 02 | passive DNS |
| 56 | Vialto Partners | `careers.vialto.com` | 136 | Workday | 02 | passive DNS |
| 57 | AAA Mountain West | `careers.mwg.aaa.com` | 112 | Workday | 01 | case study |
| 58 | North Country Healthcare | `careers.northcountryhealth.org` | 111 | ADP | 02 | passive DNS |
| 59 | OrthoArizona | `orthoarizona.recruiting.com` | 107 | own website | 02 | crt.sh |
| 60 | McKibbon Hospitality | `www.workwithmckibbon.com` | 105 | Paradox | 02 | passive DNS |
| 61 | Xcel Energy | `jobs.xcelenergy.com` | 102 | Workday | 02 | passive DNS |
| 62 | University of New Mexico | `unmjobs.recruiting.com` | 68 | Cornerstone | 02 | crt.sh |
| 63 | Western Governors University | `jobs.wgu.edu` | 57 | Paradox | 02 | passive DNS |
| 64 | Monarch Casino Resort Spa | `jobs.monarchblackhawk.com` | 41 | Workday | 02 | passive DNS |
| 65 | HOODZ | `careers.hoodzinternational.com` | 40 | Paradox | 02 | passive DNS |
| 66 | Blue Cross Blue Shield of Arizona | `jobs.azblue.com` | 35 | Workday | 02 | passive DNS |
| 67 | Southern Crown Partners | `scpdist.recruiting.com` | 33 | Paradox | 02 | web search (Bright Data) |
| 68 | Forks Community Hospital | `jobs.forkshospital.org` | 32 | Paradox | 02 | passive DNS |
| 69 | Gila River Resorts & Casinos | `jobs.playatgila.com` | 32 | UltiPro | 02 | passive DNS |
| 70 | Eastern New Mexico Medical Center | `jobs.enmmc.com` | 29 | Oracle | 02 | passive DNS |
| 71 | First Credit Union | `firstcu.recruiting.com` | 18 | Paradox and Paycom | 02 | crt.sh |
| 72 | Choolaah | `choolaah.recruiting.com` | 16 | Paradox | 02 | crt.sh |
| 73 | YMCA of Greater Long Beach | `lbymca.recruiting.com` | 16 | Paradox | 02 | crt.sh |
| 74 | SONIFI Solutions | `jobs.sonifisolutions.com` | 14 | Dayforce | 02 | passive DNS |
| 75 | The Redland Company | `redlandjobs.recruiting.com` | 13 | Paradox | 02 | crt.sh |
| 76 | Lauren's Institute for Education | `jobs.laurensinstitute.org` | 10 | Paradox | 02 | passive DNS |
| 77 | Mii amo | `jobs.miiamo.com` | 9 | ADP | 02 | passive DNS |
| 78 | Copenhagen Furniture | `jobs.copenhagenliving.com` | 5 | Paradox | 02 | passive DNS |
| 79 | Wendy's of Colorado Springs (franchisee) | `internalwocswendys.recruiting.com` | 4 | Paradox | 02 | passive DNS |
| 80 | City of Delaware (Ohio) | `jobs.cityofdelawareoh.gov` | 3 | GovernmentJobs | 02 | passive DNS |

## Not included

- **Companies whose jobs are not on a Paradox career site**, even though they use Paradox: their own sites fed by Paradox (Checkers & Rally's, Chipotle, 7-Eleven, Fontainebleau Las Vegas, probably IHG), Paradox's chat widget only (Ace Hardware, Tractor Supply), or no visible Paradox use (Lowe's, Extra Space Storage). Their jobs cannot be read through `get-jobs`.
- **Paradox career sites with no job to collect:** empty sites (Kona Daze, Vitenas, Broward House, Fellowship House), sites that gave no total (Elder's Journey, Wickenburg Community Hospital), a site gone (SOS Children's Villages) and a password-protected one (St. Madeleine Sophie's Center).
- **Sites known but not counted:** `jobs.costcutters.com` (Regis), found by DNS but not checked.

## Limits

- **Read in a browser, not collected:** every total comes from one page view per site; from a script, Paradox career sites answer 403, so collecting these jobs at scale needs authorised access.
- **Announced totals, on different days** (10 to 16 November 2026); possible overlaps between sites of one company (Darden's `dardenmyjobs` and `dardenrscjobs` share an account).
- **Not exhaustive:** each discovery method misses sites, so more Paradox career sites exist.
