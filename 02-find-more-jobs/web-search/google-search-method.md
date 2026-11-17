# Finding Paradox career sites with 3 Google searches, through Bright Data

*Method chosen by the user: the searches are sent to Bright Data's SERP API, run outside this project's scripts. Not used so far.*

## The 3 searches

| # | Search | What it finds |
| --- | --- | --- |
| 1 | `site:recruiting.com -site:www.recruiting.com` | Paradox career sites hosted on `recruiting.com` |
| 2 | `inurl:/job/P1-` | Paradox job pages on any website |
| 3 | `inurl:/job/P1- -site:recruiting.com` | the same, without the `recruiting.com` sites, so more client domains show up |

## Why these searches work

- **`site:recruiting.com`** keeps only results from `recruiting.com` and all its subdomains (`issjobs.recruiting.com`, `saxtonjobs.recruiting.com`…). Some Paradox career sites live there, and Recruiting.com shares its founder with Paradox.
- **`-site:`** removes a site from the results: `-site:www.recruiting.com` hides Recruiting.com's own website; adding `-site:issjobs.recruiting.com` would hide a site already known.
- **`inurl:/job/P1-`** keeps pages whose address contains `/job/P1-`. Paradox job pages often end like this, whatever the website:

```
https://frostyjobs.com/area-director/job/P1-734476-9
https://jobs.greatwolfresorts.com/accounting-associate/job/P1-260987-1
https://saxtonjobs.recruiting.com/restaurant-assistant-manager/job/P1-1861219-0
```

  `P1-734476-9` is the job's Paradox requisition id. `/job/` alone is too common and `P1-` alone too vague; together they are Paradox's own format.

No space after the colon (`site:recruiting.com`, not `site: recruiting.com`).

## What Bright Data does

- **It runs the Google search on its side** and returns the results (titles, URLs, page by page) in a structured format such as JSON.
- **It works around Google's anti-bot checks:** it routes the searches through its own pool of IP addresses and handles CAPTCHAs itself. That is the protection that stopped this project's automated browser (see `test/README.md`); Google's terms do not allow automated searches.
- **It is paid per request**, and needs an account.

## Steps

1. Send the 3 searches to Bright Data's SERP API, 1 to 5 result pages each.
2. Take the result URLs from its answer.
3. Paste them into `test/manual_urls.txt`, under a line naming the search:

```
# inurl:/job/P1-
https://...
# site:recruiting.com -site:www.recruiting.com
https://...
```

4. Run the script, which keeps one row per website, marks the ones already known and checks their DNS (no website is contacted):

```bash
node 02-find-more-jobs/web-search/test/web_search.mjs --from-file manual_urls.txt
```

5. Open each new Paradox site once, to read its job total from `get-jobs`.
6. Record in this folder's README that the results came from Bright Data, with the date and the number of pages per search, so the source of every site found stays traceable.

The project's own scripts do not call Bright Data and contain no code for it.

## Limits

- **Only a sample:** Google shows a few hundred results at most per search, and the first pages are mostly well-known sites.
- **Some Paradox sites are missed:** job addresses with another id (a 32-character hash on Regis or Arby's sites) do not match `inurl:/job/P1-`.
- **Terms of use:** the results come from automated searches that Google's terms do not allow; Bright Data is the party running them.
