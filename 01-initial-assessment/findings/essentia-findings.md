# Essentia Health: a Paradox career site, applications on Workday

*Checked on 13 November 2026, from `https://www.essentiacareers.org/` in a browser.*

- **It is a Paradox career site.** `www.essentiacareers.org` is an alias (CNAME) of `essentia.sites.paradox.ai`, and the page loads files from `cdn.sites.paradox.ai` and the Olivia widget (`cdn.olivia.paradox.ai`). The bare domain `essentiacareers.org` points to IP addresses.
- **The jobs come from the Paradox API.** `POST /api/get-jobs` answers in the Paradox format: **799 jobs**, 10 per page, mostly in Minnesota (586), North Dakota (179) and Wisconsin (34), with filters by state, city, facility, remote and employment type.
- **Applications go to Workday.** The apply links of the first 10 jobs all lead to `essentiahealth.wd1.myworkdayjobs.com/Essentia_Health/…`, and the job ids are 32-character hashes, not `PDX_`. Paradox's company name says it plainly: `"Essentia Health - Career Site Only"`.
- **The site also runs recruitment-marketing tools.** It loads JobPixel (`jobpixel.com`) and Appcast (`click.appcast.io`), used to promote job ads and track candidates.
- **For scraping:** the list is reachable through `get-jobs` with no 10,000-result cap issue (799 jobs, about 80 pages); the Workday job id in the apply link can serve as a deduplication key with Workday-fed sources. Not checked: access from a script.
