# Job ids when another ATS than Paradox is used

*Checked on 17 November 2026 in a browser: one `POST /api/get-jobs` call per site from its own listing page (two pages on TruGreen), plus one job page on Essentia. The full answers are saved below, in the same format as `../examples/`.*

## Why

The conclusion of this step proposes `uniqueID` as the storage key and Paradox's `P1-…` Job ID as the key to recognise a job listed on two sites. Both were seen on Saxton, where applications go to Paradox. Many Paradox career sites send their applications to another ATS (Workday, SuccessFactors, Oracle…), so the question was whether those jobs carry the same ids.

## What the 4 sites show

| Site | Applications go to | `uniqueID` | `reference` (and the job page's Job ID) | `requisitionID` |
| --- | --- | --- | --- | --- |
| `www.trugreenjobs.com` | Paradox **and** Workday | `PDX_TR_…` | `P1-7375133-0`, also on the jobs that apply on Workday | **`R35983`**, a Workday-style id, also on the jobs that apply on Paradox (`olivia.paradox.ai/co/TruGreen6/Job?job_id=R35974_1`) |
| `careers.marriott.com` | Oracle | `PDX_MI_…` | `P1-7362753-0` | **`26133899`**: Oracle's id (`…/job/26133899/apply`) |
| `www.essentiacareers.org` | Workday | 32-character hash (`0A9D0825…`) | **`R084998`**: Workday's own id; the job page's `JobPosting` `identifier` is the same `R084998` | `R084998`, same as `reference` |
| `careers.compass-usa.com` | SuccessFactors | 32-character hash (`13924D25…`) | **`1564716`**: SuccessFactors' id, also `career_job_req_id` in the apply link | `1564716`, same as `reference` |

For comparison, Saxton (`../examples/01_get-jobs_raw_saxton_page1.json`, applications on Paradox only) has `PDX_MDTSG_…` and `P1-…` ids and **no `requisitionID` field**.

## What it means

- **Two models, depending on where the job was created.**
  - **Created in Paradox:** the job keeps Paradox's ids (`PDX_…`, `P1-…`), even when the application goes to Workday or Oracle (TruGreen, Marriott).
  - **Imported from another ATS:** the job gets a hash as `uniqueID` and carries the other ATS's id in `reference`, with no `P1-…` at all (Essentia, Compass).
- **A hash does not always mean an imported job:** Flynn's Arby's site uses a hash `uniqueID`, yet its jobs apply on Paradox with a `P1-…` id.
- **`requisitionID` is the employer's own requisition id**, from its HR system (Workday, Oracle, SuccessFactors), whatever system takes the application. It is in the apply link of all 50 jobs read. When the job was imported it equals `reference`; when the job was created in Paradox it differs (`P1-…` against `R35983` or `26133899`). Small employers on Paradox only may not have one (Saxton).
- **`reference`** holds the job's id in the system that created the posting: `P1-…` for Paradox, the ATS's id for imported jobs.
- **`uniqueID` stays the key within a site:** it is present on every job, whatever the model.

On every job of the saved pages (20 on TruGreen, 10 on each other site), the ids follow the pattern of its site: TruGreen's 2 Workday jobs and 18 Paradox jobs all carry `PDX_TR_…`, `P1-…` and an `R3…` `requisitionID`; all 10 Marriott jobs `PDX_MI_…`, `P1-…` and an Oracle number; all 10 Essentia jobs a hash and the same `R0…` id in `reference` and `requisitionID`; all 10 Compass jobs a hash and the same SuccessFactors number in both.

## Which field to use against duplicates

| Order | Field | Use |
| --- | --- | --- |
| 1 | `uniqueID` | primary key within a site; present on every job, never repeated in the pages read |
| 2 | `requisitionID`, when present | the job across sites and other sources (the employer's own Workday, Oracle or SuccessFactors board); paired with the employer, since two employers can use the same number |
| 3 | `reference` | fallback when there is no `requisitionID` (Saxton) |
| 4 | title + location + employer | a weak signal only: the same title is usually several jobs (Saxton's 10 "Restaurant Assistant Manager", TruGreen's 7 "Branch Sales Manager", each at its own location); Marriott's 2 "(Assistant) Style Shift Leader" at the same location with 2 `P1-…` ids may be two openings or one repost |
| — | `sourceID` | the MD5 hash of the job's `uniqueID` (true for all 60 jobs saved, Saxton included: `md5("PDX_MDTSG_528BF0A8-…_21807534")` = `5c6c289f…`); tied to each job, not to the site, and it adds nothing beyond `uniqueID`, so it is not used |

## Files

| File | Content |
| --- | --- |
| `get-jobs_raw_trugreen_page1.json`, `get-jobs_raw_trugreen_page2.json` | TruGreen, pages 1 and 2 (`totalJob` 507) |
| `get-jobs_raw_marriott_page1.json` | Marriott, page 1 (`totalJob` 14,133) |
| `get-jobs_raw_essentia_page1.json` | Essentia Health, page 1 (`totalJob` 802) |
| `get-jobs_raw_compass_page1.json` | Compass Group USA, page 1 (`totalJob` 15,367) |
| `job-page_jobposting_essentia_R084998.json` | the `JobPosting` block of Essentia's first job page (`identifier` `R084998`) |

Each `get-jobs` file holds the request (address, body, `Referer`), the date, then Paradox's answer as received: `totalJob`, `facets`, `jobs`.

## Limits

- **4 sites, one or two pages each**; other sites and ATS may differ.
- **No job was seen on two sites**, so `requisitionID` and `reference` as cross-site keys are a proposal, not a verified match; nor was `uniqueID` checked to stay the same from one crawl to the next.
- **Flynn not rechecked:** the early findings say Flynn's `requisitionID` holds the `P1-…` id; on the 4 sites here it holds the employer's id instead.
- **Totals differ from the earlier counts:** Marriott announced 14,133 jobs today against 30,969 on 10 November (Compass 15,367 against 15,466, Essentia 802 against 799, TruGreen 507 against 430). Small changes are normal; Marriott's drop is large and may come from the languages sent (`["en"]` only today). Not checked.
