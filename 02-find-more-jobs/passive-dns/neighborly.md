# Neighborly: settled through passive DNS

*The initial assessment left this case study NOT DETERMINED on 15 November 2026; the passive DNS search of this folder settled it on 16 November 2026.*

**Result:** Paradox career sites with a `get-jobs` API, one per brand (pattern A).

- **Paradox's case study** lists: Conversational ATS, Traitify Assessments.
- **First check (15 November): not determined.** `www.neighborlybrands.com` showed a Cloudflare challenge ("Just a moment…", 403), even in the browser, and `www.neighborlycareers.com` is a parked domain.
- **Passive DNS (16 November)** found 6 brand career sites pointing to `*.sites.paradox.ai`, several named "a Neighborly company" on the Paradox side (`dryerventwizardaneighborlycompany455`, `lawnprideaneighborlycompany458`):

| Career site | Brand | Jobs (`get-jobs`, 16 Nov) | Applications (first page) |
| --- | --- | --- | --- |
| `trabajos.mollymaid.com` | Molly Maid (Spanish site) | 336 | Paradox |
| `jobs.rainbowrestores.com` | Rainbow Restoration | 237 | Paradox |
| `jobs.mrelectric.com` | Mr. Electric | 181 | Paradox (9 of 10), `beamister.com` (1) |
| `jobs.dryerventwizard.com` | Dryer Vent Wizard | 11 | Paradox |
| `jobs.lawnpride.com` | Lawn Pride | 11 | Paradox |
| `canadianjobs.rainbowrestores.com` | Rainbow Restoration (Canada) | 1 | Paradox |
| **Total** | | **777** | |

- **Not checked:** Neighborly's other brands (it has about 30, such as Mr. Handyman, Mosquito Joe, The Grounds Guys), which passive DNS did not return.

**Lesson:** a bot challenge on the corporate site hid sites that the brand domains expose openly; passive DNS reaches them without going through the corporate site.
