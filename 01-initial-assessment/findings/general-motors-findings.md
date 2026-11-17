# General Motors: not determined

*Checked on 15 November 2026, from `https://www.paradox.ai/case-studies/general-motors` and the company's sites.*

**Result: NOT DETERMINED.** It was not possible to determine whether General Motors has a Paradox career site or a Paradox job API.

- **Paradox's case study** lists: Conversational Apply, Conversational Scheduling.
- `www.gm.com` answered **403** to a plain request, so its career link could not be read.
- `careers.gm.com` goes through Akamai; `search-careers.gm.com` is an alias of an unrelated-looking host (`careers.happydance.website`).
- The career site was not opened in a browser.

**To conclude**, the career site would have to be found and opened in a browser, then checked for a `*.sites.paradox.ai` alias, a `/api/get-jobs` call and apply links to `olivia.paradox.ai/co/…`.
