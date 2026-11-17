// Guesses career domains for the Paradox case-study clients (careers., jobs., www.<name>careers.com, <name>.jobs…)
// and follows their DNS aliases (CNAME). A host ending in .sites.paradox.ai is flagged "<<< PARADOX".
// Run on 15 November 2026: about 400 names tested, only Valvoline found (jobs.valvoline.com, jobs.vioc.com).
// Usage: node code/case_studies/guess_career_domains.mjs
import dns from "node:dns/promises";
// case study -> [base names, extra explicit hosts]
const C = {
  "general-motors": [["gm.com", "generalmotors.com"], ["search-careers.gm.com", "careers.gm.com"]],
  zillow: [["zillow.com", "zillowgroup.com"], ["careers.zillowgroup.com"]],
  neighborly: [["neighborlybrands.com", "neighborly.com"], ["www.neighborlycareers.com", "careers.neighborlybrands.com"]],
  "johnson-controls": [["johnsoncontrols.com"], []],
  "ncs-group": [["ncs.co", "ncs.com.sg"], []],
  schnucks: [["schnucks.com"], ["www.schnuckscareers.com", "www.schnucksjobs.com"]],
  singtel: [["singtel.com"], []],
  "hamra-enterprises": [["hamraenterprises.com", "hamra.com"], ["www.hamrajobs.com", "www.hamracareers.com", "jobs.hamraenterprises.com"]],
  "wendys-nz": [["wendys.co.nz"], ["careers.wendys.co.nz", "jobs.wendys.co.nz"]],
  "autism-learning-partners": [["autismlearningpartners.com"], ["careers.autismlearningpartners.com"]],
  dell: [["dell.com"], ["jobs.dell.com"]],
  "rev-group": [["revgroup.com"], ["careers.revgroup.com", "jobs.revgroup.com"]],
  "houston-methodist": [["houstonmethodist.org"], ["jobs.houstonmethodist.org", "www.houstonmethodistcareers.org"]],
  sobeys: [["sobeys.com", "sobeyscareers.com", "sobeysinc.com"], ["careers.sobeys.com", "www.sobeyscareers.com", "jobs.sobeys.com"]],
  "pacific-seafood": [["pacificseafood.com"], ["careers.pacificseafood.com", "www.pacificseafoodcareers.com", "jobs.pacificseafood.com"]],
  medtronic: [["medtronic.com"], ["jobs.medtronic.com"]],
  "iss-world": [["issworld.com", "us.issworld.com", "issworld.us"], ["careers.us.issworld.com", "jobs.us.issworld.com", "www.issjobs.com", "jobs.issworld.com"]],
  "hattie-bs": [["hattieb.com", "hattiebs.com"], ["careers.hattieb.com", "jobs.hattieb.com", "www.hattiebsjobs.com"]],
  dksh: [["dksh.com"], []],
  "the-saxton-group": [["thesaxtongroup.com", "saxtongroup.com"], ["www.saxtongroupjobs.com", "www.thesaxtongroupjobs.com"]],
  elevo: [["elevo.com", "elevogroup.com", "elevo.co.uk"], []],
  "captain-ds": [["captainds.com"], ["careers.captainds.com", "jobs.captainds.com", "www.captaindsjobs.com"]],
  shiseido: [["shiseido.com"], []],
  "one-digital": [["onedigital.com"], []],
  workday: [["workday.com"], []],
  "stanley-steemer": [["stanleysteemer.com"], ["careers.stanleysteemer.com", "jobs.stanleysteemer.com", "www.stanleysteemercareers.com"]],
  "the-good-care-group": [["thegoodcaregroup.com"], []],
  nestle: [["nestle.com", "nestleusa.com", "nestlejobs.com"], ["www.nestlejobs.com", "jobdetails.nestle.com"]],
  "us-xpress": [["usxpress.com", "driveusx.com"], ["www.driveusx.com", "careers.usxpress.com"]],
  uob: [["uobgroup.com"], []],
  jll: [["jll.com"], ["careers.jll.com", "jll.wd1.myworkdayjobs.com"]],
  touchmark: [["touchmark.com"], ["careers.touchmark.com", "jobs.touchmark.com", "www.touchmarkcareers.com"]],
  "kpmg-singapore": [["kpmg.com.sg"], []],
  "royal-london": [["royallondon.com"], ["careers.royallondon.com", "jobs.royallondon.com"]],
  burlington: [["burlington.com", "burlingtonstores.com", "burlingtoncareers.com"], ["careers.burlington.com", "careers.burlingtonstores.com", "www.burlingtoncareers.com", "jobs.burlingtonstores.com", "www.burlingtonjobs.com"]],
  "dfcu-financial": [["dfcufinancial.com"], ["careers.dfcufinancial.com"]],
  sportclips: [["sportclips.com"], ["careers.sportclips.com", "jobs.sportclips.com", "www.sportclipsjobs.com", "www.sportclipscareers.com"]],
  "american-tire-distributors": [["atd-us.com", "atdonline.com"], ["careers.atd-us.com", "jobs.atd-us.com"]],
  "southern-rock": [["southernrockrestaurants.com", "southernrock.com", "srrestaurants.com"], ["www.southernrockjobs.com"]],
  "first-watch": [["firstwatch.com"], ["careers.firstwatch.com", "jobs.firstwatch.com", "www.firstwatchcareers.com"]],
  "unitingcare-queensland": [["unitingcareqld.com.au", "unitingcare.org.au"], ["careers.unitingcareqld.com.au", "careers.unitingcare.org.au"]],
  pfizer: [["pfizer.com"], ["www.pfizer.wd1.myworkdayjobs.com"]],
  "multicare-health-system": [["multicare.org"], ["jobs.multicare.org", "careers.multicare.org"]],
  mjhs: [["mjhs.org"], ["careers.mjhs.org", "jobs.mjhs.org"]],
  // checked before but endpoint type unclear
  valvoline: [["valvoline.com", "vioc.com", "valvolineinc.com"], ["jobs.valvoline.com", "careers.valvoline.com", "jobs.vioc.com", "careers.vioc.com", "www.valvolinejobs.com", "jobs.valvolineinc.com", "careers.valvolineinc.com"]],
  "advantage-solutions": [["advantagesolutions.net", "youradv.com"], ["careers.youradv.com", "jobs.youradv.com", "www.advantagesolutionscareers.com"]],
  wendys: [["wendys.com"], ["careers.wendys.com", "jobs.wendys.com", "www.wendys.com"]],
  "great-wolf-lodge": [["greatwolf.com"], ["careers.greatwolf.com", "jobs.greatwolf.com"]],
};
const prefixes = ["careers.", "jobs.", "www.careers.", "join.", "work.", "apply.", "hiring.", "www."];
async function chain(h) {
  const out = [];
  let cur = h;
  for (let i = 0; i < 5; i++) {
    try { const c = await dns.resolveCname(cur); out.push(c[0]); cur = c[0]; } catch (e) { break; }
  }
  if (!out.length) { try { await dns.resolve4(h); return "A"; } catch { return null; } }
  return out.join(" > ");
}
const rows = [];
await Promise.all(Object.entries(C).map(async ([cs, [bases, extra]]) => {
  const hosts = new Set(extra);
  for (const b of bases) {
    for (const p of prefixes) hosts.add(p + b);
    const n = b.split(".")[0];
    for (const t of [`www.${n}careers.com`, `www.${n}jobs.com`, `${n}.jobs`, `www.${n}.jobs`]) hosts.add(t);
  }
  for (const h of hosts) {
    const r = await chain(h);
    if (r) rows.push([cs, h, r]);
  }
}));
rows.sort((a, b) => a[0].localeCompare(b[0]));
for (const [cs, h, r] of rows) {
  if (r === "A" && !/^(careers|jobs)\.|careers\.com|jobs\.com|\.jobs$/.test(h)) continue;
  const flag = /paradox/i.test(r) ? "  <<< PARADOX" : "";
  console.log(`${cs.padEnd(26)} ${h.padEnd(40)} ${r}${flag}`);
}
