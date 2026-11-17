// Writes one findings file per Paradox case study outside early-findings, in 01-initial-assessment/findings/,
// from the results gathered by hand on 11-15 November 2026 (the data object below) and the products listed in
// results/paradox_case_studies.csv. Rerunning it OVERWRITES those files, including any edit made to them since.
// Usage: node code/case_studies/generate_findings_files.cjs
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "../..");
const OUT = path.join(ROOT, "01-initial-assessment/findings");

// products per case study, from the case-study CSV
const csv = fs.readFileSync(path.join(ROOT, "results/paradox_case_studies.csv"), "utf8").replace(/^\uFEFF/, "");
const products = {};
for (const line of csv.split(/\r?\n/).slice(1)) {
  const m = line.match(/^"([^"]+)","[^"]*","([^"]*)"/);
  if (m) products[m[1]] = m[2];
}

const R = {
  site: "Paradox career site with a `get-jobs` API",
  own: "own career site fed by Paradox",
  apply: "Paradox at the application step only, no Paradox job list",
  other: "no Paradox career site found: the jobs are on another platform",
  nd: "NOT DETERMINED",
};

const D = {
  // ---------- Paradox career sites ----------
  "compass-group": { name: "Compass Group USA", res: R.site, date: "13 November 2026", b: [
    "**Career site:** `careers.compass-usa.com`, an alias (CNAME) of `careers-compass-usa-com.sites.paradox.ai`.",
    "**Jobs:** `POST /api/get-jobs` announces **15,466 jobs**, ids as 32-character hashes, `companyName: \"Compass Group Prod 7\"`; filters on contract type, state, city, brand and category.",
    "**Applications:** on SAP SuccessFactors (`career8.successfactors.com`), not on Olivia (pattern B).",
  ]},
  "sodexo": { name: "Sodexo (US)", res: R.site, date: "11 November 2026", b: [
    "**Career site:** `jobs.us.sodexo.com`, an alias of a host under `sites.sodexo.paradox.ai`; Sodexo also has its own Paradox instance (`sodexo.paradox.ai`, found on crt.sh).",
    "**Jobs:** `POST /api/get-jobs` announces **3,856 jobs**, ids `PDX_SO_…`.",
    "**Applications:** on `sodexo.paradox.ai/co/…` (pattern A).",
    "**Scope:** only the US site was checked; the step-by-step API discovery is in `../draft/api-discovery-sodexo.md`.",
  ]},
  "regis-corp": { name: "Regis Corporation", res: R.site, date: "11 November 2026", b: [
    "**Career sites:** `careers.regiscorp.com`, `jobs.supercuts.com` and `jobs.smartstyle.com`, aliases of hosts under `sites.regis.paradox.ai`; Regis has its own Paradox instance (`regis.paradox.ai`, found on crt.sh).",
    "**Jobs:** **5,378 + 2,652 + 1,521 jobs** (9,551 in total), ids as 32-character hashes (no `PDX_` prefix).",
    "**Applications:** on Paradox (pattern A).",
  ]},
  "trugreen": { name: "TruGreen", res: R.site, date: "13 November 2026", b: [
    "**Career site:** `www.trugreenjobs.com`, an alias of `www-trugreenjobs-com.sites.paradox.ai` (`careers.trugreen.com` does not answer).",
    "**Jobs:** **430 jobs**, ids `PDX_TR_…`, `companyName: \"api.paradox.ai-TR\"`.",
    "**Applications:** mixed: 8 of the first 10 jobs on `olivia.paradox.ai`, 2 on Workday (patterns A and B).",
    "**Not checked:** the split beyond the first 10 jobs.",
  ]},
  "geodis-americas": { name: "GEODIS Americas", res: R.site, date: "13 November 2026", b: [
    "**Career site:** `workatgeodis.com`; its `www` form is an alias of `www-workatgeodis-com.sites.paradox.ai`.",
    "**Jobs:** **283 jobs**, ids as 32-character hashes.",
    "**Applications:** on UKG / UltiPro (`recruiting2.ultipro.com`) (pattern B); job board ads say \"Text DELIVER to 88300\", Paradox's text-to-apply.",
  ]},
  "aaa-mountain-west-group": { name: "AAA Mountain West Group (AAA NCNU)", res: R.site, date: "13 November 2026", b: [
    "**Career site:** `careers.mwg.aaa.com`, an alias of `careers-calstate-aaa-com.sites.paradox.ai`.",
    "**Jobs:** **112 jobs**, ids as 32-character hashes, `companyName: \"AAA NCNU - PROD\"`.",
    "**Applications:** on Workday (`ncnu.wd1.myworkdayjobs.com`) (pattern B).",
  ]},
  "valvoline": { name: "Valvoline", res: R.site, date: "15 November 2026", b: [
    "**Career sites:** `jobs.valvoline.com` (alias of `valvoline617.sites.paradox.ai`) is a Paradox landing page with no jobs of its own; it links to `jobs.vioc.com` and to `jobs.valvolineglobal.com` (SAP SuccessFactors, `jobs2web.com`).",
    "**Jobs:** `jobs.vioc.com`, an alias of `viocshell618.sites.paradox.ai`, announces **1,532 jobs** through `POST /api/get-jobs` (ids as 32-character hashes).",
    "**Applications:** mixed on the first page: `olivia.paradox.ai/co/ValvolineInc/…` and UKG / UltiPro for a franchisee (`companyName: \"Valvoline VIOCF Henley\"`) (patterns A and B). An older indexed job used the account `ValvolineInstantOilChange44` and ids `PDX_VIOC_…`.",
    "**Found by:** guessing the domain `jobs.valvoline.com` and testing its DNS.",
    "**Not checked:** the split between Olivia and UltiPro beyond the first 10 jobs.",
  ]},
  "great-wolf-lodge": { name: "Great Wolf Lodge", res: R.site, date: "15 November 2026", b: [
    "**Career site:** `jobs.greatwolfresorts.com`, an alias of `greatwolflodge577.sites.paradox.ai`, linked from `www.greatwolf.com/jobs`. This **corrects an earlier result** (\"no Paradox career site\"), based on a test of `greatwolf.com` itself.",
    "**Jobs:** `POST /api/get-jobs` announces **310 jobs**, ids `PDX_GWL_…` and job pages `/…/job/P1-…`. The list is on the home page: `/jobs` returns 404.",
    "**Applications:** on `olivia.paradox.ai/co/GreatWolfLodge4/Job` (pattern A); `greatwolf.com/jobs` also links to Paradox hiring events (`/co/GreatWolfLodge4/UpcomingEvent`).",
    "**API detail:** the API returns 0 jobs when the request lists the languages `[\"en\",\"en-us\"]`, and the real total with `[\"en\"]` only.",
  ]},
  "iss-world": { name: "ISS (US)", res: R.site, date: "15 November 2026", b: [
    "**Career site:** `issjobs.recruiting.com`, an alias of `issconversationalats562.sites.paradox.ai`, linked from `www.us.issworld.com/careers/search-jobs`.",
    "**Jobs:** `POST /api/get-jobs` announces **275 jobs**, ids `PDX_IS_…`, `companyName: \"paradox-api.paradox.ai-ISS\"`.",
    "**Applications:** on `olivia.paradox.ai/co/ISS13/…` (pattern A).",
    "**Scope:** the US site only; other ISS countries were not checked.",
  ]},
  "the-saxton-group": { name: "The Saxton Group (McAlister's Deli)", res: R.site, date: "15 November 2026", b: [
    "**Career site:** `saxtonjobs.recruiting.com`, an alias of `mcalistersdelithesaxtongroup614.sites.paradox.ai`, linked from `tsgrestaurants.com/join-our-team`.",
    "**Jobs:** `POST /api/get-jobs` announces **197 jobs** (\"Showing 1-10 of 197 jobs\"), ids `PDX_MDTSG_…`, `companyName: \"paradox-api.paradox.ai-McAlisters Deli\"`. The list is on the home page: `/jobs` returns 404.",
    "**Applications:** on `olivia.paradox.ai/co/McAlistersDeliTSGRestaurants/Job` (pattern A).",
    "**API detail:** the API returns 0 jobs when the request lists the languages `[\"en\",\"en-us\"]`, and the real total with `[\"en\"]` only.",
  ]},

  // ---------- own site fed by Paradox ----------
  "fontainebleau-las-vegas": { name: "Fontainebleau Las Vegas", res: R.own, date: "13 November 2026", b: [
    "**Career site:** `careers.fontainebleaulasvegas.com`, its own site behind Cloudflare, with no `/api/get-jobs`.",
    "**Jobs:** **80 jobs**, each with a `JobPosting` block and a Paradox requisition id (`P1-714914-16`).",
    "**Applications:** the \"Apply to Job\" button opens the Olivia widget (pattern C).",
  ]},
  "ihg-hotels-and-resorts": { name: "IHG Hotels & Resorts", res: "probably an own career site fed partly by Paradox", date: "13 November 2026", b: [
    "**Career site:** `careers.ihg.com`, its own site behind Akamai, **4,976 jobs**.",
    "**Paradox trace:** the page code lists the job sources `Oracle|Beisen|ParadoxCRO|ParadoxHotel|Franchise`.",
    "**Applications:** the one job tested applies on Oracle Cloud HCM; no Paradox job was observed.",
    "**Not checked:** what share of the jobs comes from the Paradox sources.",
  ]},

  // ---------- Paradox at the application step only ----------
  "the-good-care-group": { name: "The Good Care Group", res: R.apply, date: "15 November 2026", b: [
    "**Career site:** its own WordPress pages (`www.thegoodcaregroup.com/live-in-care-jobs/`, `/job-listing/`, WP Job Manager), no Paradox DNS.",
    "**Paradox trace:** the pages link to `olivia.paradox.ai/co/TheGoodCareGroup1/ProductionLandingPage`, a Paradox application page.",
    "**Not checked:** whether each listed job applies through that Paradox account.",
  ]},
  "captain-ds": { name: "Captain D's", res: R.apply, date: "15 November 2026", b: [
    "**Career page:** `www.captainds.com/careers/`, no Paradox DNS and no `/api/get-jobs`.",
    "**Paradox trace:** the page embeds the Olivia widget (script from `olivia.paradox.ai`), which handles the conversational application.",
    "**Not checked:** where the job list itself comes from, if any.",
  ]},
  "hattie-bs": { name: "Hattie B's", res: R.apply, date: "15 November 2026", b: [
    "**Career page:** `www.hattieb.com/hiring` (Webflow), no Paradox DNS.",
    "**Paradox trace:** the page embeds the Olivia widget and shows Paradox's text-message consent (links to `paradox.ai/terms-of-use` and `paradox.ai/privacy-policy`).",
    "**Not checked:** whether a job list exists outside the widget.",
  ]},
  "sportclips": { name: "Sport Clips", res: R.apply, date: "15 November 2026", b: [
    "**Career site:** `www.sportclipscareers.com` redirects to `jobs.sportclips.com`, hosted behind an AWS load balancer (`recruitix-…elb.amazonaws.com`), not on Paradox.",
    "**Paradox trace:** the site loads the Olivia widget (`olivia.paradox.ai`).",
    "**Not checked:** where the applications of individual jobs go.",
  ]},
  "sobeys": { name: "Sobeys", res: R.apply, date: "15 November 2026", b: [
    "**Career site:** `postings.sobeyscareers.com`, an alias of `sobeys.jobs2web.com` (SAP SuccessFactors).",
    "**Paradox trace:** the page references `olivia.paradox.ai` (the Olivia widget).",
    "**Not checked:** whether any job applies through Paradox.",
  ]},
  "johnson-controls": { name: "Johnson Controls", res: R.apply, date: "15 November 2026", b: [
    "**Career site:** `jobs.johnsoncontrols.com`, behind Imperva, linking to Workday (`jci.wd5.myworkdayjobs.com`).",
    "**Paradox trace:** the page references `olivia.paradox.ai` (the Olivia widget), matching the case study's scheduling and apply products.",
    "**Not checked:** whether any job applies through Paradox.",
  ]},
  "advantage-solutions": { name: "Advantage Solutions", res: R.apply, date: "11 and 15 November 2026", b: [
    "**Paradox instance:** crt.sh lists `advantage.paradox.ai` and related hosts; indexed jobs apply on `advantage.paradox.ai/co/AdvantageSolutionsInc`.",
    "**Career site:** `careers.youradv.com` (WordPress, `wpeproxy.com`) lists jobs that link to iCIMS (`uscareers2-asm.icims.com`, `cds-uscareers.icims.com`).",
    "**Not checked:** which share of the jobs applies on Paradox rather than iCIMS.",
  ]},
  "wendys": { name: "Wendy's (US franchisees)", res: R.apply, date: "11 and 15 November 2026", b: [
    "**Paradox trace:** indexed franchisee jobs apply on `olivia.paradox.ai/co/…` (e.g. `Wendys89619`, ids `P1-…`); crt.sh lists many Wendy's franchisees under `*.recruiting.com`, Paradox's other host name.",
    "**Career site:** `careers.wendys.com` redirects to `wendys-careers.com`, with no Paradox DNS and no Paradox trace in its raw HTML.",
    "**Note:** franchisees can run their own Paradox career sites (Flynn Group's `frostyjobs.com`, in early-findings).",
  ]},

  // ---------- other platform ----------
  "singtel": { name: "Singtel", res: R.other, date: "15 November 2026", b: [
    "**Career site:** `groupcareers.singtel.com`, an alias of `singtel.jobs2web.com` (SAP SuccessFactors).",
    "**No Paradox trace** on the home page; the case study's apply and scheduling products may sit behind SuccessFactors (not checked).",
  ]},
  "dksh": { name: "DKSH", res: R.other, date: "15 November 2026", b: [
    "**Career site:** `jobs.dksh.com`, an alias of `14644.jobs2web.com` (SAP SuccessFactors).",
    "**No Paradox trace** found; the case study lists Conversational Scheduling only.",
  ]},
  "kpmg-singapore": { name: "KPMG Singapore", res: R.other, date: "15 November 2026", b: [
    "**Career site:** `careers.kpmg.com.sg`, an alias of `12844.jobs2web.com` (SAP SuccessFactors).",
    "**No Paradox trace** found on the careers pages of `kpmg.com/sg`.",
  ]},
  "royal-london": { name: "Royal London", res: R.other, date: "15 November 2026", b: [
    "**Career site:** `jobs.royallondon.com`, an alias of `royallondon.jobs2web.com` (SAP SuccessFactors).",
    "**Not checked:** the careers pages of `royallondon.com` (they answered 500).",
  ]},
  "shiseido": { name: "Shiseido", res: R.other, date: "15 November 2026", b: [
    "**Career sites:** `jobs.shiseidoamericas.com`, an alias of `jobs-shiseidoamericas-com.talentbrew.com` (TalentBrew), linked from `shiseido.com`; `careers.shiseido.com` is an alias of `shiseido.jobs2web.com` (SAP SuccessFactors).",
    "**No Paradox trace** found; not checked: the apply links of individual jobs.",
  ]},
  "zillow": { name: "Zillow", res: R.other, date: "15 November 2026", b: [
    "**Career page:** `www.zillow.com/careers/` links to Workday (`zillow.wd5.myworkdayjobs.com/Zillow_Group_External`).",
    "**No Paradox trace** found; the case study lists no products.",
  ]},
  "jll": { name: "JLL", res: R.other, date: "15 November 2026", b: [
    "**Career page:** `www.jll.com/en-us/careers` links to Workday (`jll.wd1.myworkdayjobs.com/jllcareers`).",
    "**No Paradox trace** found in the page.",
  ]},
  "houston-methodist": { name: "Houston Methodist", res: R.other, date: "15 November 2026", b: [
    "**Career site:** `www.houstonmethodistcareers.org` links to Workday (`houstonmethodist.wd12.myworkdayjobs.com`).",
    "**No Paradox trace** found in the page.",
  ]},
  "one-digital": { name: "OneDigital", res: R.other, date: "15 November 2026", b: [
    "**Career page:** `www.onedigital.com/en-US/careers/` links to Workday (`onedigital.wd504.myworkdayjobs.com`).",
    "**No Paradox trace** found in the page.",
  ]},
  "medtronic": { name: "Medtronic", res: R.other, date: "15 November 2026", b: [
    "**Career page:** `www.medtronic.com/…/our-company/careers.html` links to Workday (`myworkdayjobs.com`).",
    "**No Paradox trace** found in the page.",
  ]},
  "rev-group": { name: "REV Group", res: R.other, date: "15 November 2026", b: [
    "**Career page:** `revgroup.com/careers/` links to Workday (`terex.wd1.myworkdayjobs.com/terexcareers`).",
    "**Paradox trace:** the page HTML mentions `stg.paradox.ai`, a Paradox staging host; what it does there was not checked.",
  ]},
  "dell": { name: "Dell", res: R.other, date: "15 November 2026", b: [
    "**Career site:** `jobs.dell.com` redirects to `enterpriseplatform.dell.com/hcmUI/CandidateExperience/…` (Oracle Cloud HCM).",
    "**No Paradox trace** found; the case study lists no products.",
  ]},
  "touchmark": { name: "Touchmark", res: R.other, date: "15 November 2026", b: [
    "**Career page:** `touchmark.com/careers/` links to Dayforce (`jobs.dayforcehcm.com/en-US/tlc/CANDIDATEPORTAL`).",
    "**No Paradox trace** found, although the case study lists Conversational ATS.",
  ]},
  "us-xpress": { name: "U.S. Xpress", res: R.other, date: "15 November 2026", b: [
    "**Career pages:** `www.usxpress.com/search-driving-jobs/` sends applications to DriverApp Online (`intelliapp.driverapponline.com/c/usxpress`).",
    "**No Paradox trace** found in the page.",
  ]},
  "first-watch": { name: "First Watch", res: R.other, date: "15 November 2026", b: [
    "**Career site:** `careers.firstwatch.com`, behind Cloudflare; its HTML references ClearCompany, an applicant tracking system.",
    "**No Paradox trace** found in the raw HTML; not checked: the apply links of individual jobs.",
  ]},
  "workday": { name: "Workday", res: R.other, date: "15 November 2026", b: [
    "**Career page:** `www.workday.com/en-us/company/careers/overview.html`; Workday's own jobs are on its own platform, and Workday acquired Paradox in October 2025.",
    "**Not checked in detail:** whether Workday's own job pages use Paradox's scheduling (the product its case study lists).",
  ]},
  "altice-usa": { name: "Altice USA (Optimum)", res: R.other, date: "13 November 2026", b: [
    "**Former career site:** `alticeusacareers.com`, an alias of a `jobs2web.com` host, now redirects to a SAP sales page.",
    "**Current career site:** not found, so no Paradox site either, although the case study lists Career Site Studio.",
  ]},

  // ---------- not determined ----------
  "general-motors": { name: "General Motors", nd: [
    "`www.gm.com` answered **403** to a plain request, so its career link could not be read.",
    "`careers.gm.com` goes through Akamai; `search-careers.gm.com` is an alias of an unrelated-looking host (`careers.happydance.website`).",
    "The career site was not opened in a browser.",
  ]},
  "neighborly": { name: "Neighborly", nd: [
    "`www.neighborlybrands.com` showed a **Cloudflare challenge** (\"Just a moment…\", 403), even in the browser; this work does not get around it.",
    "`www.neighborlycareers.com` is a parked domain; web search only found job boards.",
  ]},
  "ncs-group": { name: "NCS Group", nd: [
    "`www.ncs.co` and its careers page answered **403** (Akamai).",
    "No career domain found by DNS guessing.",
  ]},
  "schnucks": { name: "Schnucks", nd: [
    "`schnucks.com` answered **403**, even in the browser.",
    "`careers.schnucks.com` exists (IP `208.188.247.112`, not a Paradox address) but was not opened; web search only found job boards.",
  ]},
  "hamra-enterprises": { name: "Hamra Enterprises", nd: [
    "`hamraenterprises.com` showed a **bot challenge** (\"One moment, please…\") in the browser, and its raw HTML has no career link.",
    "Web search only found job boards; the career domains guessed (`careers.` and `jobs.hamraenterprises.com`, `hamracareers.com`) point to non-Paradox addresses and were not opened.",
  ]},
  "wendys-nz": { name: "Wendy's New Zealand", nd: [
    "`wendys.co.nz` answered **403**.",
    "No official career site found by DNS guessing or web search (jobs appear on Seek and Trade Me).",
  ]},
  "autism-learning-partners": { name: "Autism Learning Partners", nd: [
    "The home page answered **202** with no content, the sign of a bot challenge; `careers.autismlearningpartners.com` did not answer.",
    "Web search only found job boards.",
  ]},
  "pacific-seafood": { name: "Pacific Seafood", nd: [
    "`careers.pacificseafood.com` (behind CloudFront) answered, but its raw HTML shows no job platform and no Paradox trace: the jobs are probably loaded by script.",
    "Not opened in a browser.",
  ]},
  "elevo": { name: "Elevo", nd: [
    "No working domain found (`elevo.com` and `elevo.co.uk` did not answer), and web search did not find the company.",
  ]},
  "stanley-steemer": { name: "Stanley Steemer", nd: [
    "`www.stanleysteemer.com/careers` answered **403**, and the browser navigation failed.",
    "Web search points to `new.stanleysteemer.com/careers`, which also answered 403.",
  ]},
  "nestle": { name: "Nestlé", nd: [
    "`www.nestleusa.com` answered **403**.",
    "Global jobs are on SAP SuccessFactors (`jobdetails.nestle.com` is an alias of `nestlejob.jobs2web.com`), but the US career site, the likely Paradox user, was not reached.",
  ]},
  "uob": { name: "UOB", nd: [
    "`www.uobgroup.com` did not answer a plain request; no career domain found by DNS guessing.",
  ]},
  "dfcu-financial": { name: "DFCU Financial", nd: [
    "`www.dfcufinancial.com/careers` answered, but its raw HTML shows no job platform and no Paradox trace.",
    "Not opened in a browser.",
  ]},
  "american-tire-distributors": { name: "American Tire Distributors", nd: [
    "`www.atd-us.com` and `careers.atd-us.com` (behind CloudFront) did not answer a plain request.",
  ]},
  "southern-rock": { name: "Southern Rock Restaurants", nd: [
    "**Hint:** crt.sh lists `southernrock.recruiting.com`, a Paradox host name, but it no longer resolves: a Paradox career site may have existed.",
    "The company's home page has no career link, and no current career site was found.",
  ]},
  "unitingcare-queensland": { name: "UnitingCare Queensland", nd: [
    "The site answered **429** (too many requests) to a plain request; no career domain found by DNS guessing.",
  ]},
  "pfizer": { name: "Pfizer", nd: [
    "`www.pfizer.com/about/careers` answered **403** (Cloudflare).",
    "`careers.pfizer.com` and `join.pfizer.com` exist behind Cloudflare but were not opened.",
  ]},
  "multicare-health-system": { name: "MultiCare Health System", nd: [
    "`www.multicare.org/careers/` answered **403** (Cloudflare).",
    "`jobs.multicare.org` exists behind Cloudflare but was not opened.",
  ]},
  "mjhs": { name: "MJHS", nd: [
    "`www.mjhs.org/careers/` answered, but its raw HTML shows no job platform and no Paradox trace.",
    "Not opened in a browser.",
  ]},
  "burlington": { name: "Burlington", nd: [
    "`www.burlington.com/careers` links to `burlingtonstores.jobs`, which answered but shows no Paradox trace in its raw HTML; its IP address is not a Paradox address.",
    "Not opened in a browser, so the apply links were not checked.",
  ]},
};

let n = 0;
for (const [slug, d] of Object.entries(D)) {
  const prod = products[slug] || "(not listed)";
  const url = `https://www.paradox.ai/case-studies/${slug}`;
  let md;
  if (d.nd) {
    md = `# ${d.name}: not determined\n\n*Checked on 15 November 2026, from \`${url}\` and the company's sites.*\n\n` +
      `**Result: NOT DETERMINED.** It was not possible to determine whether ${d.name} has a Paradox career site or a Paradox job API.\n\n` +
      `- **Paradox's case study** lists: ${prod}.\n` +
      d.nd.map((x) => `- ${x}`).join("\n") +
      `\n\n**To conclude**, the career site would have to be found and opened in a browser, then checked for a \`*.sites.paradox.ai\` alias, a \`/api/get-jobs\` call and apply links to \`olivia.paradox.ai/co/…\`.\n`;
  } else {
    md = `# ${d.name}: ${d.res}\n\n*Checked on ${d.date}, from \`${url}\` and the company's sites.*\n\n` +
      `**Result:** ${d.res}.\n\n` +
      `- **Paradox's case study** lists: ${prod}.\n` +
      d.b.map((x) => `- ${x}`).join("\n") + "\n";
  }
  fs.writeFileSync(path.join(OUT, `${slug}-findings.md`), md);
  n++;
}
console.log(n, "files written");
const missing = Object.keys(products).filter((s) => !D[s]);
console.log("case studies without a file here:", missing.join(", "));
