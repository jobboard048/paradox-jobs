# Great Wolf Lodge: Paradox career site with a `get-jobs` API

*Checked on 15 November 2026, from `https://www.paradox.ai/case-studies/great-wolf-lodge` and the company's sites.*

**Result:** Paradox career site with a `get-jobs` API.

- **Paradox's case study** lists: Conversational ATS.
- **Career site:** `jobs.greatwolfresorts.com`, an alias of `greatwolflodge577.sites.paradox.ai`, linked from `www.greatwolf.com/jobs`. This **corrects an earlier result** ("no Paradox career site"), based on a test of `greatwolf.com` itself.
- **Jobs:** `POST /api/get-jobs` announces **310 jobs**, ids `PDX_GWL_…` and job pages `/…/job/P1-…`. The list is on the home page: `/jobs` returns 404.
- **Applications:** on `olivia.paradox.ai/co/GreatWolfLodge4/Job` (pattern A); `greatwolf.com/jobs` also links to Paradox hiring events (`/co/GreatWolfLodge4/UpcomingEvent`).
- **API detail:** the API returns 0 jobs when the request lists the languages `["en","en-us"]`, and the real total with `["en"]` only.
