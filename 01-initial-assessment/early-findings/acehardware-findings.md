# Ace Hardware: own career site, Paradox only as a chat widget

*Checked on 15 November 2026, from `https://www.paradox.ai/case-studies/ace-hardware`, `https://careers.acehardware.com/job-search` and 6 job pages, in a browser.*

- **Paradox's case study is about scheduling.** It lists only **Conversational Scheduling**, with a **Workday** integration, used to schedule interviews for warehouse workers ("Scheduling 200+ interviews daily"). It does not mention Career Site Studio.
- **The career site is Ace's own.** `careers.acehardware.com` has no Paradox DNS and no `/api/get-jobs`; it lists **2,713 jobs**, each on a `/posting/<title>/<id>` page with a `JobPosting` block (`hiringOrganization: Ace Hardware`).
- **Paradox is on the site as a chat widget.** The site loads the Olivia widget (`dokumfe7mps0i.cloudfront.net`, `olivia.paradox.ai`, `api.paradox.ai`, which calls `/api/v3/widget/…/w/rules` and `/w/init`) and allows `*.paradox.ai` and `wss://ws.paradox.ai` in its security policy.
- **No job applies through Paradox in the sample.** Of 6 jobs opened, 4 apply on **Workstream** (`workstream.us`, store jobs of independent Ace retailers), 1 on **Classet** (`call.classet.ai`) and 1 on **Workday** (`acehardware.wd1.myworkdayjobs.com/ARG_External/…`).
- **For scraping:** this site is not a Paradox target (pattern E). Not checked: a larger sample of apply links.

## How the job list is loaded

The list is plain HTML rendered by the server, with no AJAX call.

- **Each page is a full server page.** `/job-search/` shows 100 jobs ("Showing 100 of 2713 Results"), already in the raw HTML.
- **Pages are chosen in the address.** `?spage=2` gives jobs 101 to 200, and so on up to `?spage=28`, which holds the last 13 jobs; `?spage=29` is empty. The "Next" button only sets this number.
- **Collecting the list takes 28 requests.** Each page must be parsed to get the job links (`/posting/<title>/<id>`); the ids mix short codes (`c5ecdab8`) and Workday requisitions (`REQ-34296`).
- **The details and the apply link are on each job page.** Each page has a `JobPosting` block (title, employer, description) and the "Apply" link; reading them takes one request per job (about 2,713).

## Conclusion

Ace Hardware is not a Paradox target: Paradox only provides the chat widget and, according to its case study, interview scheduling for warehouse jobs. The jobs themselves come from Workstream (independent stores), Classet and Workday. The site is easy to collect from (28 server pages, then one `JobPosting` per job), but through Ace's own site and those platforms, not through Paradox.
