# crt.sh: finding more Paradox career sites

## Why this method

Paradox publishes no list of its clients' career sites, and most of them sit on the clients' own, unrelated domains (`frostyjobs.com`, `careers.fedex.com`…). They can only be found one by one.

[crt.sh](https://crt.sh) gives a shortcut. Every HTTPS site needs a certificate carrying its name, and every certificate is published in public logs that crt.sh can search by name.

**Where the data comes from.** Before issuing a certificate, a certificate authority (Let's Encrypt, DigiCert…) must record it in public **Certificate Transparency logs**, or browsers reject it. These logs are run by Google (Argon, Xenon), Cloudflare (Nimbus), Let's Encrypt (Oak), Sectigo, DigiCert and others; each is an append-only list that can only be read in order, not searched by name. crt.sh, run by Sectigo, reads these logs continuously, copies each new certificate into its own database and indexes the names it carries. A search on crt.sh reads that copy, never the websites. One entry of the copy, from `crt_recruiting_com_2026-11-15.json`:

```json
{
  "issuer_name": "C=US, O=Let's Encrypt, CN=R3",
  "name_value": "saxtonjobs.recruiting.com",
  "not_before": "2022-04-17T19:31:35",
  "not_after": "2022-07-16T19:31:34",
  "serial_number": "0452687d4bb7228a7a4f7b3067514d68ba50"
}
```

One search returns every name under a domain, provided each site has its own certificate:

- **`*.paradox.ai`**: lists the clients that have their own Paradox instance (`fedex.paradox.ai`, `sodexo.paradox.ai`…), but not the career sites. One wildcard certificate, `*.sites.paradox.ai`, covers all of them, so their names never appear.
- **`*.recruiting.com`**: some Paradox career sites are served from this domain (found through links on ISS's and The Saxton Group's career pages), and each has its own certificate, so **one search lists them all**.

## How the results are produced

| Step | What | Output |
| --- | --- | --- |
| 1. crt.sh search | `https://crt.sh/?q=%25.recruiting.com&output=json` (15 Nov 2026) | `crt_recruiting_com_2026-11-15.json`: 234 names |
| 2. DNS check | `node 02-find-more-jobs/crt.sh/resolve_recruiting_com.mjs`: resolves each name; a name is kept when it is an alias (CNAME) of a `*.sites.paradox.ai` host. DNS lookups only, no site contacted. | `recruiting_com_dns_2026-11-16.csv` |
| 3. Page check | open each site once in a browser and read `totalJob` from its own `POST /api/get-jobs` (16 Nov 2026) | job count (below) |

Of the 234 names, **15 point to Paradox career sites**; 213 no longer resolve (a certificate outlives its site), and 6 are `recruiting.com`'s own hosts or unrelated. Of the 15, **10 list jobs**, 2 are empty, 1 is gone (404) and 1 is password-protected; the 15th is Saxton.

The other file, `crt_paradox_ai_2026-11-10.json` (search `%.paradox.ai`), is read by `code/find_paradox_clients.mjs` for the 12 clients with their own instance (`results/crtsh_paradox_tenants.csv`).

## Websites that can be scraped

Each one serves the standard Paradox job list: page 1 in the HTML, then `POST https://<site>/api/get-jobs?page_number=N`.

**12 websites list jobs: 2,439 jobs in total.**

| Website | Organisation | Jobs | Applications |
| --- | --- | --- | --- |
| `https://bnehardees.recruiting.com` | Boddie-Noell (Hardee's) | 825 | Paradox (`olivia.paradox.ai/co/Hardees2`) |
| `https://dardenmyjobs.recruiting.com` | Darden, Restaurant Support Center | 492 | Paradox (`darden.paradox.ai/co/DardenRestaurantSupportCenter`) |
| `https://dardenmanagerjobs.recruiting.com` | Darden, restaurant managers | 391 | Paradox (`darden.paradox.ai/co/…`: Ruth's Chris, Yard House, The Capital Grille, Eddie V's) |
| `https://issjobs.recruiting.com` | ISS (US) | 275 | Paradox (`olivia.paradox.ai/co/ISS13`); found through a link, not in the crt.sh list |
| `https://saxtonjobs.recruiting.com` | The Saxton Group (McAlister's Deli) | 197 | Paradox (`olivia.paradox.ai/co/McAlistersDeliTSGRestaurants`) |
| `https://orthoarizona.recruiting.com` | OrthoArizona | 107 | not Paradox (link to `orthoarizona.org`) |
| `https://unmjobs.recruiting.com` | University of New Mexico | 68 | Cornerstone (`unm.csod.com`) |
| `https://dardenrscjobs.recruiting.com` | Darden, Restaurant Support Center | 21 | Paradox (same account as `dardenmyjobs`) |
| `https://firstcu.recruiting.com` | First Credit Union | 18 | Paradox and Paycom |
| `https://choolaah.recruiting.com` | Choolaah | 16 | Paradox (`olivia.paradox.ai/co/ChoolaahIndianBBQ`) |
| `https://lbymca.recruiting.com` | YMCA of Greater Long Beach | 16 | Paradox (`olivia.paradox.ai/co/YMCAofGreaterLongBeach`) |
| `https://redlandjobs.recruiting.com` | The Redland Company | 13 | Paradox (`olivia.paradox.ai/co/TheRedlandCompanyInc`) |

Jobs are the totals announced on 16 November 2026 (15 November for ISS and Saxton); applications are read from the first page of jobs (10 per site). Saxton and the others answer with the languages `["en"]`.

**Not scrapable now:**

| Website | Why |
| --- | --- |
| `https://browardhousejobs.recruiting.com` | live, but "No open jobs" |
| `https://fellowshiphouse.recruiting.com` | live, but "No open jobs" (now titled Legacy Behavioral Health Center) |
| `https://sosflorida.recruiting.com` | 404: the site is gone although its DNS still points to Paradox |
| `https://stmadeleinesophies.recruiting.com` | redirects to a password page (`/protected`); not checked further |

**Watch for duplicates:** `dardenmyjobs` and `dardenrscjobs` apply on the same Darden account, so the same job may appear on both; deduplicate on the Paradox requisition id.

## The `*.paradox.ai` search: companies with their own Paradox instance

*crt.sh queried on 10 November 2026: `crt_paradox_ai_2026-11-10.json` (4,205 certificates), read by `code/find_paradox_clients.mjs`; result in `results/crtsh_paradox_tenants.csv`.*

Sub-domains of `paradox.ai` named after a client (`fedex.paradox.ai`, `api-k8s.sodexo.paradox.ai`, `job.lowes.paradox.ai`…) reveal **12 companies with their own Paradox instance**. The career sites themselves never appear (they sit behind one wildcard certificate, `*.sites.paradox.ai`), so each company was then checked on its own career site:

| Company | What its career site shows | Counted |
| --- | --- | --- |
| **FedEx** | `careers.fedex.com`, an alias of `fedex.sites.paradox.ai`: **4,681 jobs** (10 November), 25 per page, ids `PDX_FEC_…`, applications on `fedex.paradox.ai/co/…` (pattern A) | **yes, 1 site, 4,681 jobs** |
| Sodexo, Regis | Paradox career sites on their own instance (`….sites.sodexo.paradox.ai`, `….sites.regis.paradox.ai`) | in the initial assessment, as official case studies |
| Darden | 3 career sites on `recruiting.com`, pointing to `….sites.darden.paradox.ai` | in the `*.recruiting.com` results below |
| Lowe's | `talent.lowes.com` runs on Phenom and Workday; its jobs carry a `paradoxJobId` field and the instance has 20 sub-domains, so a link exists, but what Paradox does there cannot be seen: **Paradox use not established** | no |
| Advantage Solutions | indexed jobs apply on `advantage.paradox.ai/co/AdvantageSolutionsInc`; its career site lists iCIMS jobs | no |
| Lockheed Martin, Prudential | their own career sites | no |
| Unilever, PepsiCo | TalentBrew; Jibe (iCIMS) | no |
| Aramark | no career site found | no |
| BirdDogHR | an applicant tracking system that integrates with Paradox, not an employer | no |

**Traces on the case studies of the initial assessment**, from the `*.recruiting.com` search: `southernrock.recruiting.com` (Southern Rock Restaurants, a case study left undetermined) is in the certificate logs but no longer resolves, a hint that a Paradox career site existed; many Wendy's franchisees appear there too.

## Limits

- **From a script, Paradox career sites answer 403.** The jobs are reachable in a browser; collecting them at scale needs authorised access.
- **The crt.sh list is incomplete.** `issjobs.recruiting.com` is missing, and the newest Saxton certificate in the file expired in 2022: crt.sh shows names that had a certificate at some point, not every live site.
- **Applications are a sample** of the first 10 jobs per site; sites may mix more platforms further down.
