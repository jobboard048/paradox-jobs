# Initial assessment

This note records where the repository states its conclusion about the Paradox jobs API, and what that conclusion means. The source is the report, not a separate finding.

## Where it is written

The full argument is **Limites et approche en production** in [`rapport/rapport.md`](../rapport/rapport.md). The synthèse above that section states the same limit in one sentence:

> Point important : depuis un script, l'API des sites clients répond **403** (protection anti-bot). J'en tiens compte dans l'approche que je propose pour la production.

[`README.md`](../README.md) repeats it as the project limit: a script receives **403**, the scraper does not get around that, and the scraper's logic is tested on a local copy of the API. [`code/paradox_scraper.mjs`](../code/paradox_scraper.mjs) implements the stop. The live failure is [`results/paradox_mchire_real_run.log`](../results/paradox_mchire_real_run.log).

## What the section claims

The section makes three claims.

**A script and a browser are not treated the same.** The jobs handler has no login. The same `POST /api/get-jobs` returns JSON when the career page itself sends it. A script (the report names Node, Deno, Python, and Colab) receives **403** and the body `Access Denied`. The HTML page still loads, but it only contains the first 10 jobs, so reading the HTML does not replace the API. Workday is called out on purpose: that API does answer scripts, which is why `code/workday_scraper.mjs` is the scraper the README marks as actually working.

**The author refuses to bypass the check.** A driven browser might get past it. The report says that would be getting around a protection the publisher put there on purpose, and that it would break whenever the check changes. The scraper stops instead. On status 403, `run()` in `code/paradox_scraper.mjs` throws `BlockedError`, logs that the request did not come from a browser, notes that no login is involved, and returns `{ blocked: true }`.

**Production does not paginate the client sites.** Because those hosts will not serve the full feed to a script, the report does not plan to collect the ~72,700 jobs from them directly. It points at three substitutes:

- Paradox's official API, under a partnership or an agreement with each client.
- A licensed job-data feed (Fantastic.jobs or Apify).
- The `JobPosting` feeds the employers already publish (including feeds sent to Indeed or Google for Jobs).

Paging, the 10,000-result cap, the state-then-city split, `uniqueID` deduplication, and expiry after two complete crawls stay in the scraper. They are proven against `code/test_paradox_scraper.mjs`, a local copy of the API, not against the live 403.

## What a live call showed

Sodexo (`jobs.us.sodexo.com`) is one of the confirmed Paradox career sites in the report. The request is the one defined in `code/paradox_scraper.mjs`:

```
POST /api/get-jobs?radius=15&enable_kilometers=false&page_number=1
{"disable_switch_search_mode": false, "site_available_languages": ["en", "en-us"]}
```

From Node, with the scraper's headers, the response was **403** and the body `Access Denied` (13 bytes). That body is not the Paradox payload (`jobs`, `totalJob`, `facets`), so the jobs handler did not run. Node had opened a fresh connection and had never loaded the career page.

From the loaded career page, the same post returned **200**. The page already showed "Showing 1 - 10 of 3874 jobs". The JSON was `totalJob: 3874`, 10 jobs on page 1, and facets for category, state, city, segment, and employment status. The ids use the `PDX_SO_…` form the report describes for Sodexo. The report's earlier count for this site was 3,898 on 11 November 2026; the total moves between crawls.

A separate `curl` attempt returned **400** with the body `Invalid request`. That call's body was likely mangled by shell quoting, so it is a different failure from the 403 and is not evidence about the bot check.

The split is the one the report describes. The public page may ask for the next page of jobs. A standalone script that hits `/api/get-jobs` directly is refused. There is no missing API key in the request the scraper sends.
