# Chipotle: a TalentBrew career site, restaurant applications on Paradox

*Checked on 13 November 2026, from `https://jobs.chipotle.com/search-jobs`, two job pages and `https://www.paradox.ai/case-studies/chipotle`, in a browser.*

- **The career site is not a Paradox site.** `jobs.chipotle.com` runs on TalentBrew (Radancy): its DNS points to `jobs-chipotle-com.talentbrew.com`, it loads files from `tbcdn.talentbrew.com` and `services.tmpwebeng.com`, and it has no `/api/get-jobs` endpoint. It lists **8,457 jobs**.
- **Paradox is embedded in the page.** The site loads the Olivia widget (`cdn.olivia.paradox.ai/widget/…`, `dokumfe7mps0i.cloudfront.net`, `olivia.paradox.ai`, `api.paradox.ai`). Paradox's case study names Chipotle's assistant "Ava Cado" and lists **Conversational Scheduling** and **Conversational Apply**, not Career Site Studio.
- **Restaurant jobs apply through Paradox.** A Crew Member job (South Portland) sends "Apply Now" to `olivia.paradox.ai/co/Chipotle12/Job?job_id=P1-7241393-0&posting_type=1`, with a Paradox requisition id (`P1-…`) and the account `Chipotle12`.
- **Corporate jobs apply through Workday.** An Accounting Coordinator job (Columbus) sends "Apply Now" to `chipotle.wd5.myworkdayjobs.com/ChipotleCareers/…/Accounting-Coordinator_JR-2026-01328230/apply`.
- **For scraping:** this is an own site fed partly by Paradox (pattern C). The list comes from the TalentBrew site, not from a Paradox API; Paradox jobs can be recognised by their `olivia.paradox.ai/co/Chipotle12` apply link and `P1-` id. Not checked: the share of jobs going to Paradox versus Workday (only two jobs opened), and whether the site answers a script.

## How the job list is loaded

There is no structured job API: the list comes as HTML, first from the server, then through AJAX.

- **Page 1 is rendered by the server.** The raw HTML of `/search-jobs` already holds the first job links (`/job/<city>/<title>/282/<id>`), with no AJAX call.
- **The next pages are loaded through AJAX.** "Next" keeps the page address and sends `GET /search-jobs/results?CurrentPage=2&RecordsPerPage=15&SearchType=5&…`.
- **The answer is JSON wrapping HTML.** It has four fields: `results`, `filters`, `hasJobs`, `hasContent`. `results` is an HTML fragment of 15 jobs (`<a href="/job/…" data-job-id="71611273376">` with `<h2>` title, `job-location`, `job-address`), and the totals sit in attributes: `data-total-results="8457"`, `data-total-pages`, `data-records-per-page`.
- **Collecting it means parsing HTML.** Paging through `CurrentPage` takes about 564 requests at 15 jobs per page, and each fragment must be parsed to get the title, city, address and id.
- **The apply link is only on each job page.** Telling Paradox jobs from Workday jobs takes one more request per job (about 8,457). Not checked: whether `RecordsPerPage` accepts a larger value, whether the job pages carry a `JobPosting` block, and whether `/search-jobs/results` answers a script (called once, from the page).

## Conclusion

Chipotle cannot be covered by a Paradox scraper: the job list comes from another platform (TalentBrew), and Paradox only appears at the application step, job by job.

**The site is not really custom.** It runs on TalentBrew (Radancy), a career site platform used by many companies (Unilever too). A scraper written for `/search-jobs/results` would probably work on other TalentBrew sites (not checked). For an aggregator, Chipotle is not an isolated site but **a platform other than Paradox**.

**Why it does not scale for Paradox jobs**

1. **The list does not come from Paradox.** Finding Chipotle's Paradox jobs means going through TalentBrew; the Paradox scraper (`get-jobs`) does not apply.
2. **Each job has to be sorted one by one.** The list does not say whether a job applies through Paradox or Workday; only each job page shows it, about 8,457 requests for Chipotle alone.
3. **The data is HTML**, not structured JSON: more fragile, and the scraper breaks if the layout changes.
4. **Access from a script is not checked.**

**What could scale instead.** If the goal were to collect **all** jobs, not only Paradox jobs, a **TalentBrew adapter** would cover Chipotle and the other clients of that platform: one adapter per platform, not per site. The issue is not a custom site: it is that **Paradox is only one step of the application, hidden behind another platform**.
