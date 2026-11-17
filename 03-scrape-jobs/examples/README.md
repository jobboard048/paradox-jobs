# Examples of scraped jobs

*Sample read on 16 November 2026 in a browser, on The Saxton Group's career site (`saxtonjobs.recruiting.com`): page 1 of the job list (10 of 197 jobs) and the job page of the first job. Two normal page loads; nothing was collected beyond this sample.*

| File | Content |
| --- | --- |
| `01_get-jobs_raw_saxton_page1.json` | the raw answer of `POST /api/get-jobs?page_number=1` (listing page as `Referer`): `totalJob`, `facets` and the 10 jobs, field by field, as Paradox returns them |
| `02_job-page_jobposting_P1-1861219-0.json` | the `JobPosting` block (schema.org) of the job page `…/restaurant-assistant-manager/job/P1-1861219-0`: the only place with `datePosted` |
| `03_jobs_normalized_saxton_page1.json` | the same 10 jobs as stored records: key, ad id, location id, requisition, title, address, coordinates, job and apply links, who handles the application, description as plain text, `first_seen`, `last_seen`, `miss_count`, `status` |
| `04_jobs_normalized_saxton_page1.csv` | the same records as a table, without the description |

## How the records are built

- `key` = `uniqueID` (`PDX_MDTSG_<ad>_<location>`); `ad` and `location_id` are its two parts.
- `requisition` = `reference` (`P1-…`).
- `handled_by` = `Paradox` when `applyURL` is on `…paradox.ai`, otherwise the apply host.
- `date_posted` comes from the job page, so it is filled only for the first job (`P1-1861219-0`, 2026-11-10); the other 9 would need one job page each.
- `first_seen` = `last_seen` = 2026-11-16, `miss_count` = 0, `status` = `active`: this is a first crawl.

The 10 jobs show the structure described in `../conclusion.md`: the first 5 are one ad (`528BF0A8-…`, Restaurant Assistant Manager) at 5 restaurants in Oklahoma, the next ones another ad in the Fort Worth area, each with its own location and requisition.
