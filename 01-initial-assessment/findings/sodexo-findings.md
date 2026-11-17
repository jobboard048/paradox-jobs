# Sodexo (US): Paradox career site with a `get-jobs` API

*Checked on 11 November 2026, from `https://www.paradox.ai/case-studies/sodexo` and the company's sites.*

**Result:** Paradox career site with a `get-jobs` API.

- **Paradox's case study** lists: Conversational ATS, Career Site Studio.
- **Career site:** `jobs.us.sodexo.com`, an alias (CNAME) of `jobs-us-sodexo-com.sites.sodexo.paradox.ai`, Sodexo's own Paradox instance.
- **Jobs:** `POST /api/get-jobs` announces **3,856 jobs**, ids `PDX_SO_…`. The page's HTML carries the first 10 jobs; page 2 and beyond come from `get-jobs?page_number=N`, which returns `jobs`, `totalJob` and `facets` in JSON, with no HTML to parse.
- **Filters:** the site's filters (Category, State, City, Industry, Job Type, Early Careers) are the API's `facets`; picking a state sends the same request with `filter[state]=…`.
- **Applications:** on `sodexo.paradox.ai/co/…` (pattern A).
- **Same API as other clients:** FedEx's site (`careers.fedex.com`) answers the same `get-jobs` request with the same JSON structure; only the page size (25) and the id prefix (`PDX_FEC_…`) differ.
- **Scope:** only the US site is on Paradox; Sodexo's "Find a job" page sends other countries to other platforms (SmartRecruiters for Canada and Australia, Talentsoft for France, Talentfinder for Belgium and Luxembourg, another provider for the UK).
