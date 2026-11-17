# Public sources: a client known outside Paradox's case studies

One Paradox career site in this assessment was not found by a technical method (DNS, certificates) nor through Paradox's official case studies (`../findings/`): McHire. It was a known Paradox client from public information, then verified on the site itself; `api-discovery-mchire.md` shows that verification step by step, through the `get-jobs` API.

| Client | Career site | Public source | Verified by | File |
| --- | --- | --- | --- | --- |
| McDonald's (McHire) | `jobs.mchire.com` | Paradox's announcement and press coverage (below) | `get-jobs` answers in Paradox's format; `companyID: "paradox-api.mchire.com-486"`; ids `PDX_MC_…`; the assistant is Paradox's "Olivia" | `api-discovery-mchire.md` |

## McHire: where the knowledge comes from

McHire was the starting example of this assessment (10 November 2026), chosen because McDonald's use of Paradox's assistant is publicly known. That knowledge was a lead, not evidence; the evidence is the site's own data. The lead can be traced to:

- **Paradox's own announcement**, in September 2019: [Paradox and McDonald's Corporation Launch McHire](https://paradox.ai/news/paradox-and-mcdonalds-corporation-launch-mchire). Paradox also had a McDonald's case study ([paradox.ai/case-studies/mcdonalds](https://paradox.ai/case-studies/mcdonalds)); both now redirect to general pages, but they remain indexed by search engines.
- **The 2025 press coverage of a security incident:** security researchers Ian Carroll and Sam Curry reported in mid-2025 that McHire's back end, built on Paradox's Olivia, could be reached with default admin credentials. It was widely covered, for example by [Fox News](https://www.foxnews.com/tech/mcdonalds-ai-hiring-chatbot-exposed-data-job-candidates.amp), [Futurism](https://futurism.com/mcdonalds-ai-hackers.md) and the [AI Incident Database](https://incidentdatabase.ai/entities/paradox.ai's-olivia-chatbot/). A search for "McHire Paradox Olivia" returns these.

Such a lead can come from anywhere, including prior knowledge or a suggestion from an LLM; what makes it a result is the check on the site.

## Why this method matters

McHire is the largest Paradox career site found (54,601 jobs on 10 November 2026), and the DNS-based methods cannot see it: `jobs.mchire.com` points to plain IP addresses, with no alias to `sites.paradox.ai`. Without public sources, the biggest site would have been missed.
