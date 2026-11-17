# Initial assessment: discovering the Paradox jobs API on McHire

*Screenshots taken on: YYYY-MM-DD* <!-- replace with the date you take the screenshots -->

## The problem

> Okay you want to scrape all the jobs from from paradox.ai How would you do it? Please give me a list of all the jobs you found. How would you check that those jobs expires? How would you ensure you’re not scraping the same jobs twice?.

## Context

`paradox.ai/careers` returns a 404, and `careers.paradox.ai` now redirects to Workday's career site: Workday acquired Paradox (deal closed on 1 October 2025). Paradox's product, however, still hosts career sites for its clients. I picked **McHire** (`jobs.mchire.com`), McDonald's US career site and the largest Paradox site found, to see how those jobs are loaded. It is also the only one large enough to show the API's 10,000-result cap.

McHire was chosen as a known Paradox client from public sources: Paradox announced it in 2019, and it was widely covered after a 2025 security incident (sources in `README.md`). Paradox no longer mentions McHire on its website: its McHire announcement and McDonald's case study now redirect to general pages. The link shows in McHire itself: the API returns `companyID: "paradox-api.mchire.com-486"`, job ids start with Paradox's `PDX_` prefix, and the assistant is Paradox's "Olivia".

## Step by step

### 1. The starting point

I opened `https://jobs.mchire.com/jobs`. The page announces the total number of jobs, but shows them 10 at a time.

![McHire search page with the total number of jobs](images/mchire_01_page.png)
*The search page announces N jobs and shows the first 10.* <!-- replace N with the number on your screenshot -->

### 2. The HTML does not contain the jobs

I opened the page source (`Ctrl+U`) and searched (`Ctrl+F`) for the title of a job shown on page 2. It is not there: the HTML only carries the first 10 jobs. The rest is loaded after the page is displayed.

![Page source: a page 2 job title is not found](images/mchire_02_code_source.png)
*A job title from page 2 is not in the page source.*

### 3. The AJAX request

In the browser's developer tools (`F12` → **Network** → **Fetch/XHR**), I clicked on page 2 of the results. A single request appears: `POST /api/get-jobs?…&page_number=2`.

![Network tab: the get-jobs request](images/mchire_03_network_get_jobs.png)
*Moving to page 2 sends one POST request to `/api/get-jobs`.*

### 4. What the page sends

The **Payload** tab shows the request: the page number goes in the URL, and the body is a small JSON object.

![Payload of the get-jobs request](images/mchire_04_payload.png)
*`page_number` in the query string; the body only carries search options.*

### 5. What the API returns

The **Preview** tab shows clean JSON: `jobs` (the 10 jobs of the page), `totalJob` (the total) and `facets` (the filters, with the number of jobs for each value). Each job has a `uniqueID` of the form `PDX_MC_…` and a `companyID` that names Paradox. This is the data to collect: no HTML parsing needed.

![JSON response with jobs, totalJob and facets](images/mchire_05_reponse_json.png)
*Each job carries its `uniqueID`, title, full address, employer and apply URL.*

### 6. A 10,000-result cap

With 10 jobs per page, page 1000 is the 10,000th result. I opened `https://jobs.mchire.com/jobs?page_number=1001`: no jobs are displayed, and the API answers `totalJob: "0"`. A single search can reach only 10,000 jobs.

![Page 1001: no results](images/mchire_06_plafond_page_1001.png)
*Past 10,000 results the API returns nothing, so plain pagination cannot reach every job.*

### 7. Filters get around the cap

Back on the list, I picked the filter **State → Texas**. The request now carries `filter[state]=Texas`, and the total drops under 10,000. Splitting the search by state (then by city if needed) reaches every job.

![Request filtered on Texas](images/mchire_07_filtre_texas.png)
*With `filter[state]=Texas` the total fits under the cap.*

### 8. The same API on another client

On `https://careers.fedex.com/jobs`, page 2 triggers the same `get-jobs` request with the same JSON structure. Only the page size (25) and the id prefix (`PDX_FEC_…`) change. One scraper can therefore serve every Paradox client.

![FedEx: the same get-jobs request](images/mchire_08_meme_api_fedex.png)
*FedEx uses the same endpoint and format as McHire.*

## What I conclude

- Paradox career sites load their jobs through **one JSON API**, `POST /api/get-jobs`, shared by all clients.
- The API returns everything needed (jobs, total, filters), so the scraper calls it directly instead of parsing HTML.
- Results stop at **10,000 per search**: the scraper must split the search with the `state` and `city` filters.
- Each job has a stable `uniqueID`, the natural key for deduplication.

## What remains to check

- **Access from a script.** The API answers in the browser; I still have to check that it answers a script the same way. (It does not: see the other files of this folder.)
- **Expiry.** The JSON has no publication or expiry date, so expiry has to be inferred by comparing crawls.
- **Scale.** How many companies use Paradox, and how many jobs in total?

## Next steps

The full answer (scraper, tests, client discovery, production options) is in [`../rapport/rapport.pdf`](../rapport/rapport.pdf).
