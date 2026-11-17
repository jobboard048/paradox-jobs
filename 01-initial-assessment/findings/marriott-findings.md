# Marriott International: a Paradox career site behind Akamai

*Checked on 12 November 2026, from `https://careers.marriott.com/` in a browser.*

- **It is a Paradox career site.** The page loads Paradox's career site files (`cdn.sites.paradox.ai/paradox-prod-careersites/…`) and the Olivia widget (`cdn.olivia.paradox.ai`).
- **The jobs come from the Paradox API.** `POST /api/get-jobs` answers in the Paradox format: **30,969 jobs**, 10 per page, ids `PDX_MI_…`, `companyName: "api.paradox.ai-MI"`.
- **The DNS does not show Paradox.** `careers.marriott.com` points to Akamai (`e258213.x.akamaiedge.net`), so a DNS search on `sites.paradox.ai` would miss this site.
- **Applications go to Oracle, not to Olivia.** The apply link leads to Oracle Cloud HCM (`ejwl.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/…`), so the jobs have no `olivia.paradox.ai/co/…` page.
- **Not checked:** how to get past the 10,000-result cap (the first response returned no `facets`), and whether the API answers a script.
