# Tractor Supply: an SAP SuccessFactors career site with the Olivia widget

*Checked on 15 November 2026, from `https://www.paradox.ai/case-studies/tractor-supply-co`, `https://www.tractorsupply.careers/go/Stores/9175100/` and 5 job pages, in a browser.*

- **Paradox's case study is about applying and scheduling.** It lists **Conversational Apply**, **Conversational Scheduling** and **Conversational Events**, with an **SAP** integration ("Decreasing time-to-apply with automated applications"). It does not mention Career Site Studio.
- **The career site runs on SAP SuccessFactors.** `www.tractorsupply.careers` is an alias of `194900.jobs2web.com` (SuccessFactors Career Site Builder) and loads files from `rmkcdn.successfactors.com`. The "Stores" category lists **6,088 jobs**.
- **Paradox is on the site as a chat widget.** The pages load the Olivia widget (`olivia-widget-client`, `cdn.olivia.paradox.ai`), which calls `api.paradox.ai/api/v3/widget/…/w/rules` and `/w/init`.
- **Applications go to SuccessFactors.** The 5 jobs opened all apply through `/talentcommunity/apply/<id>/`, SuccessFactors' own form; none links to `olivia.paradox.ai/co/…`.
- **For scraping:** this site is not a Paradox target (pattern E). Not checked: the other job categories, and whether the Olivia widget offers its own apply flow.

## How the job list is loaded

The list is HTML rendered by the server; only the filters come through AJAX.

- **Each page is a full server page.** `/go/Stores/9175100/` shows 25 jobs ("Results 1 – 25 of 6088, Page 1 of 244"), already in the raw HTML.
- **Pages are chosen in the address, by offset.** `/go/Stores/9175100/25/` gives jobs 26 to 50, `/50/` the next ones, and so on up to `/6075/`. Collecting the "Stores" category takes 244 requests.
- **Only the filters use AJAX.** The page calls `/services/jobs/options/facetValues/`, which returns JSON with the filter values.
- **The details are on each job page, as microdata.** Job pages carry no JSON-LD block, but HTML attributes (`itemprop="title"`, `datePosted`, `hiringOrganization`, `jobLocation`, `description`), the schema.org format written into the HTML. Reading them takes one request per job.

## Conclusion

Tractor Supply is not a Paradox target: the site, the job list and the applications are on SAP SuccessFactors, and Paradox only adds the chat widget, with the conversational apply, scheduling and events products its case study describes. The jobs are easy to collect from the SuccessFactors pages (244 server pages, then microdata on each job), and a **SuccessFactors Career Site Builder adapter** would serve other companies on that platform, but it would not be Paradox data.
