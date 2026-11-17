# Scraping the jobs Paradox hosts

> *"Scrape all the jobs from paradox.ai. How would you do it? Give me a list of all the jobs you found. How would you check that those jobs expire? How would you ensure you're not scraping the same jobs twice?"*

- **Start here:** [`paradox-jobs-report.pdf`](paradox-jobs-report.pdf), a one-page summary of the methodology and results.
- **[`01-initial-assessment/`](01-initial-assessment/):** how Paradox hosts its clients' jobs, its fingerprints, and the 66 official case studies: 23 career sites.
- **[`02-find-more-jobs/`](02-find-more-jobs/):** more career sites found through Certificate Transparency (crt.sh), passive DNS and Google search: 73 more.
- **[`03-scrape-jobs/`](03-scrape-jobs/):** how to scrape the jobs (`POST /api/get-jobs`), what the ids mean, expiry, duplicates, and example records.
- **[`04-total-companies/`](04-total-companies/):** the final list: 80 companies, 96 career sites, ~232,000 jobs.
- **`code/`, `results/`, `rapport/`:** the first scripts, their outputs and the first report (in French, 10–11 November 2026); the scripts need Node.js 18 or later, with no dependencies.
