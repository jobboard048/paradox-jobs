# The Saxton Group (McAlister's Deli): Paradox career site with a `get-jobs` API

*Checked on 15 November 2026, from `https://www.paradox.ai/case-studies/the-saxton-group` and the company's sites.*

**Result:** Paradox career site with a `get-jobs` API.

- **Paradox's case study** lists: Conversational ATS, Traitify Assessments.
- **Career site:** `saxtonjobs.recruiting.com`, an alias of `mcalistersdelithesaxtongroup614.sites.paradox.ai`, linked from `tsgrestaurants.com/join-our-team`.
- **Jobs:** `POST /api/get-jobs` announces **197 jobs** ("Showing 1-10 of 197 jobs"), ids `PDX_MDTSG_…`, `companyName: "paradox-api.paradox.ai-McAlisters Deli"`. The list is on the home page: `/jobs` returns 404.
- **Applications:** on `olivia.paradox.ai/co/McAlistersDeliTSGRestaurants/Job` (pattern A).
- **API detail:** the API returns 0 jobs when the request lists the languages `["en","en-us"]`, and the real total with `["en"]` only.
