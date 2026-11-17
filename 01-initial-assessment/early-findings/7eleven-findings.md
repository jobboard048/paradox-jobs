# 7-Eleven: a TalentBrew career site, store applications on Paradox

*Checked on 15 November 2026, from `https://www.paradox.ai/case-studies/7-eleven`, `https://careers.7-eleven.com/search-jobs` and 5 job pages, in a browser.*

- **Paradox's case study names the assistant "Rita".** It lists **Conversational Scheduling** only, for 7-Eleven in the United States ("Saving store leaders 40,000 hours per week"), and reports a time-to-hire dropping from over 10 days to under 5.
- **The career site is not a Paradox site.** `careers.7-eleven.com` runs on TalentBrew (Radancy): its DNS goes through `careers-7-eleven-com.talentbrew.com` behind Akamai, it loads files from `tbcdn.talentbrew.com` and `tmpwebeng.com`, and it has no `/api/get-jobs` endpoint. It lists **4,950 jobs**.
- **Paradox is embedded in the page.** The site loads the Olivia widget (`cdn.olivia.paradox.ai/widget/…`, `dokumfe7mps0i.cloudfront.net`, `olivia.paradox.ai`, `api.paradox.ai`).
- **Store jobs apply through Paradox.** The 5 Store Crew jobs opened (El Paso, Conroe, Elkin, Calgary, North Charleston) all send "Apply" to `olivia.paradox.ai/co/7Eleven60/Job?job_id=P1-…`, with Paradox requisition ids and the account `7Eleven60`.
- **For scraping:** this is an own site fed partly by Paradox (pattern C), set up like Chipotle's. Not checked: non-store jobs (none found in the sample) and the share of jobs applying through Paradox.

## How the job list is loaded

The site works exactly like Chipotle's TalentBrew site: no structured job API, the list comes as HTML.

- **Page 1 is rendered by the server.** The raw HTML of `/search-jobs` already holds the first job links (`/job/<city>/<title>/45445/<id>`).
- **The next pages are loaded through AJAX.** "Next" sends `GET /search-jobs/results?CurrentPage=2&RecordsPerPage=15&…`.
- **The answer is JSON wrapping HTML.** Its fields are `results`, `filters`, `hasJobs` and `hasContent`; `results` is an HTML fragment of 15 jobs, and the totals sit in attributes: `data-total-results="4950"`, `data-total-pages="330"`, `data-records-per-page="15"`.
- **Collecting it means parsing HTML.** Paging takes about 330 requests, and each fragment must be parsed to get the title, city, address and id.
- **The apply link is only on each job page.** Telling Paradox jobs from the others takes one more request per job (about 4,950). Not checked: whether `/search-jobs/results` answers a script.

## Conclusion

7-Eleven cannot be covered by a Paradox scraper: the job list comes from TalentBrew, and Paradox only appears at the application step of store jobs, job by job. Chipotle and 7-Eleven share the same setup, a TalentBrew site with Paradox behind the "Apply" button of hourly jobs, so a **TalentBrew adapter** written once would cover both, and the Paradox jobs could then be sorted by their `olivia.paradox.ai/co/…` apply link.
