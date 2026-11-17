# Exercice scraping : les offres d'emploi Paradox

> *« Scrape all the jobs from paradox.ai. How would you do it? Give me a list of all the jobs you found. How would you check that those jobs expire? How would you ensure you're not scraping the same jobs twice? »*

**Le rapport complet est dans [`rapport/rapport.pdf`](rapport/rapport.pdf)** (ou [`rapport/rapport.md`](rapport/rapport.md)). Ce README explique ce que contient le dossier et comment exécuter le code.

## En bref

- Toutes les offres hébergées par Paradox passent par **une même API AJAX** (`POST /api/get-jobs`), commune à tous les clients : un scraper générique suffit.
- **6 sites carrières vérifiés, environ 72 700 offres** (McDonald's, FedEx, Sodexo, Regis), et **15 entreprises** qui publient leurs offres via Paradox.
- L'API est plafonnée à **10 000 résultats** par recherche : le scraper découpe par État, puis par ville.
- **Expiration** : l'API ne donne aucune date, donc une offre est expirée quand elle manque à deux crawls complets d'affilée.
- **Doublons** : clé unique `uniqueID`, upsert avec `first_seen` / `last_seen`.
- **Limite** : depuis un script, l'API des sites clients répond **403** (protection anti-bot). Le scraper ne la contourne pas, et sa logique est testée sur une copie locale de l'API.

## Contenu du dossier

```
rapport/
  rapport.pdf                  le rapport à lire en premier
  rapport.md                   le même en Markdown
  images/                      captures insérées dans le rapport (page McHire, 403, tests, Workday)
code/
  workday_scraper.mjs          scrape un portail Workday (fonctionne réellement)
  paradox_scraper.mjs          scraper générique des sites carrières Paradox
  test_paradox_scraper.mjs     tests du scraper Paradox sur une copie locale de l'API
  find_paradox_clients.mjs     trouve les clients Paradox (crt.sh + DNS)
  cc_paradox_accounts.mjs      compte les comptes Paradox dans Common Crawl
  career_domains.txt           sites carrières à classer par DNS
  lib/store.mjs                doublons et expiration (partagé par les scrapers)
  case_studies/                vérification des 66 études de cas Paradox (15/11/2026)
    guess_career_domains.mjs     devine les domaines carrières et suit leur DNS
    check_paradox_ips.mjs        compare les IP des candidats à celles des sites Paradox
    home_page_career_links.mjs   lit les liens « carrières » des pages d'accueil
    career_page_traces.mjs       traces Paradox, plateformes et DNS d'une page donnée
    recruiting_com_hosts.mjs     hôtes *.recruiting.com sur crt.sh (sites Paradox aussi)
    generate_findings_files.cjs  écrit un fichier par étude de cas dans 01-initial-assessment/findings/
results/
  workday_Workday_jobs.csv     offres internes de Paradox (Workday), avec statut
  workday_Workday_jobs.json    les mêmes en JSON
  workday_Workday_store.json   base des offres + historique des crawls
  paradox_clients.csv          29 entreprises étudiées, avec site, source et statut
  crtsh_paradox_tenants.csv    clients avec une instance dédiée (crt.sh)
  dns_career_sites.csv         plateforme de chaque site carrières (DNS)
  test_paradox_scraper.log     résultat des tests
  paradox_mchire_real_run.log  le 403 obtenu sur le vrai site McHire
  *.log                        autres journaux d'exécution
02-find-more-jobs/
  crt.sh/                      résultats crt.sh et sites carrières Paradox sous *.recruiting.com (voir son README)
    crt_paradox_ai_2026-11-10.json       résultat brut de crt.sh pour *.paradox.ai (4 205 certificats), lu par find_paradox_clients.mjs
    crt_recruiting_com_2026-11-15.json   résultat brut de crt.sh pour *.recruiting.com (234 noms)
    resolve_recruiting_com.mjs           résout le DNS de chaque nom (aucun site contacté)
    recruiting_com_dns_2026-11-16.csv    résultat : 15 sites Paradox, 213 noms morts
```

## Exécuter le code

Il faut **Node.js 18 ou plus**, sans aucune dépendance à installer. Toutes les commandes se lancent depuis ce dossier.

| Commande | Ce qu'elle fait | Résultat attendu |
| --- | --- | --- |
| `node code/workday_scraper.mjs` | récupère les offres internes de Paradox sur Workday | ✅ 6 offres au 11/11/2026, CSV + JSON dans `results/` |
| `node code/test_paradox_scraper.mjs` | teste le scraper Paradox sur une copie locale de l'API | ✅ `ALL TESTS PASSED` |
| `node code/find_paradox_clients.mjs` | extrait les clients de crt.sh et classe les sites par DNS | ✅ 12 tenants, 5 sites Paradox sur 18 |
| `node code/paradox_scraper.mjs jobs.mchire.com` | lance le scraper sur un vrai site Paradox | ⛔ s'arrête sur le 403 et l'explique |
| `node code/cc_paradox_accounts.mjs 6` | cherche les comptes Paradox dans Common Crawl | ⚠️ dépend de la disponibilité de Common Crawl |
| `node code/case_studies/recruiting_com_hosts.mjs` | liste les hôtes *.recruiting.com (crt.sh) et teste les noms des clients | ✅ 234 noms, ISS et Saxton sur Paradox |
| `node code/case_studies/career_page_traces.mjs <url>…` | cherche les traces Paradox et les plateformes d'une page carrières | ✅ ex. `https://www.greatwolf.com/jobs` mène à `jobs.greatwolfresorts.com` |
| `node code/case_studies/guess_career_domains.mjs` | teste par DNS environ 400 domaines carrières devinés | ✅ seul Valvoline trouvé |
| `node code/case_studies/generate_findings_files.cjs` | réécrit les fichiers de `01-initial-assessment/findings/` | ⚠️ écrase les modifications faites à la main |

Relancer `workday_scraper.mjs` ne crée pas de doublons : les offres déjà connues sont mises à jour (`last_seen`), et celles qui disparaissent passent en `expired` après deux crawls complets.

Les résultats peuvent changer d'une exécution à l'autre : de nouvelles offres apparaissent, et les services externes (crt.sh, Common Crawl) sont parfois indisponibles. Les fichiers de `results/` montrent ce qui a été obtenu les 10 et 11 novembre 2026.
