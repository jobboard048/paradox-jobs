# Checkers: screenshots to take

For [`checkers-findings.md`](checkers-findings.md). Save them in `images/` with the file names below.

Before starting: use a **private window** (or a browser profile without extensions), so extensions such as Phantom do not show in DevTools.

- [ ] **checkers_01_dns.png** (section 1, hosted by Checkers): open `https://dns.google/resolve?name=careers.checkers.com&type=CNAME`. The answer shows `checkers-careers.azurewebsites.net`. Alternative: `nslookup careers.checkers.com` in a terminal, cropped without the `Server:` / `Address:` lines.
- [ ] **checkers_02_nextjs.png** (section 1, Next.js): DevTools → **Elements** → `Ctrl+F` → `_next`. Show the `<script src="/_next/static/chunks/…">` tags. Alternative: DevTools → **Network** → filter **JS** → reload, to also show `_buildManifest.js`.
- [ ] **checkers_03_sources_paradox.png** (section 2, Paradox embedded): DevTools → **Sources**. Show `cdn.olivia.paradox.ai` and `dokumfe7mps0i.cloudfront.net` under `top`.
- [ ] **checkers_04_case_study.png** (section 2): the page `https://www.paradox.ai/case-studies/checkers-rallys`.
- [ ] **checkers_05_code_api_search.png** (section 3, how `/api/search` was found): DevTools → **Sources** → `Ctrl+Shift+F` → `api/search`. Show the results in `_buildManifest.js` and in the search code.
- [ ] **checkers_06_api_search_reponse.png** (section 3, the API returns Paradox jobs): DevTools → **Network** → **Fetch/XHR**, search "crew" on the page, click the `/api/search?searchQuery=crew` request → **Preview**. Expand one job so that `referenceid: "PDX_…"` and `applylink` are readable.
- [ ] **checkers_07_page_offre.png** (section 5, job page): open the `applylink` of one job (`olivia.paradox.ai/co/…/Job?job_id=…`). Optional: `Ctrl+U` and search `JobPosting` to show `datePosted`.
- [ ] **checkers_08_page_compte.png** (section 5, account page): open `https://olivia.paradox.ai/co/CheckersRallys5`. It shows only the "Mia" chat, no job list.

**If you take only three:** 03, 05 and 06. They show the reasoning: Paradox is in the page, the API was found in the code, and the API returns Paradox jobs.

Not needed: section 4 (the 938 / 576 / 52 split) is a calculation, not a page. Do not include the `HEAD https://api.paradox.ai/` request in 403: it is unrelated to the job data.
