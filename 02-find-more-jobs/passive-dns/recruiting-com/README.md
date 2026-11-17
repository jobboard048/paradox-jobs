# Passive DNS search by name: `*.recruiting.com`

*Searched on 16 November 2026 with WhoisXML API's Reverse DNS API (5 credits).*

## Why

Paradox career sites also live under `*.recruiting.com` (`issjobs`, `saxtonjobs`, `bnehardees`…). Two sources had listed them so far, each with gaps:

- **crt.sh** (`../../crt.sh/`): 234 names from certificates, 15 pointing to Paradox, but live sites missing (`issjobs.recruiting.com`).
- **The search by target** (`../sites-paradox-ai/`): only 4 `recruiting.com` names, and it cannot see sites on dedicated instances (Darden's point to `*.sites.darden.paradox.ai`).

A search **by name** (`field: "domain"`, `term: "*.recruiting.com"`, `recordType: "cname"`) lists every `recruiting.com` name the provider saw with an alias, whatever it points to: a third, independent source.

```bash
WHOISXMLAPI_KEY=... node 02-find-more-jobs/passive-dns/reverse_cname_whoisxml.mjs --by-name "*.recruiting.com"
```

## Result

| Name | Points to | DNS today | Status |
| --- | --- | --- | --- |
| `lbymca.recruiting.com` | `ymcaofgreaterlongbeach393.sites.paradox.ai` | same | known (crt.sh) |
| `stmadeleinesophies.recruiting.com` | `stmadeleinesophiescenter386.sites.paradox.ai` | same | known (crt.sh) |
| `internalwocswendys.recruiting.com` | `wocswendys532.sites.paradox.ai` | same | known (`../sites-paradox-ai/`), 4 jobs |
| `internalwocssunsetlanaikai.recruiting.com` | `wocssunsetkailanai526.sites.paradox.ai` | same | known (`../sites-paradox-ai/`), 0 jobs |
| `calendar.recruiting.com` | `ghs.googlehosted.com` | same | not a career site (Google-hosted) |

Files: `whoisxml_reverse_cname_2026-11-16.json` (raw answer), `reverse_cname_2026-11-16.csv` (DNS check; its `already_known` column only compares with the client CSV and the crt.sh list, so the two `internalwocs` names show as new).

## Conclusion

**Nothing new.** The provider knows only 5 `recruiting.com` names, against 234 in the certificate logs and at least 16 live Paradox sites. Its sensors saw almost none of these small sites, so for `recruiting.com`, crt.sh remains the better source. The search was still worth its 5 credits: it shows the limit of this provider's coverage on small, rarely visited sites.
