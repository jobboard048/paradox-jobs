// Finds Paradox clients from public sources. Two steps:
//   A. Certificate Transparency (crt.sh): every HTTPS certificate is public. Sub-domains of
//      paradox.ai named after a client (fedexapi, api-k8s.sodexo, job.lowes...) reveal the
//      clients with a dedicated instance.
//   B. DNS: a Paradox career site points (CNAME) to <client>.sites.paradox.ai. Each domain of
//      code/career_domains.txt is classified by the platform its CNAME points to.
//
// Usage: node code/find_paradox_clients.mjs [--refresh-crt]
//   --refresh-crt downloads crt.sh again (slow, sometimes 502); otherwise the file saved in
//   02-find-more-jobs/crt.sh/ is reused.
// Output: results/crtsh_paradox_tenants.csv and results/dns_career_sites.csv
import fs from "node:fs/promises";
import dns from "node:dns/promises";
import { toCSV } from "./lib/store.mjs";

const CRT_DIR = "02-find-more-jobs/crt.sh";
const CRT_FILE = `${CRT_DIR}/crt_paradox_ai_2026-11-10.json`;

// ---- A. crt.sh ------------------------------------------------------------
let certs;
if (process.argv.includes("--refresh-crt")) {
  const r = await fetch("https://crt.sh/?q=%25.paradox.ai&output=json", { headers: { "User-Agent": "job-scraper-exercise/1.0" }, signal: AbortSignal.timeout(180_000) });
  if (!r.ok) throw new Error(`crt.sh answered HTTP ${r.status}, retry later`);
  certs = await r.json();
  await fs.writeFile(`${CRT_DIR}/crt_paradox_ai_${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(certs));
} else {
  certs = JSON.parse(await fs.readFile(CRT_FILE, "utf8"));
}

const names = new Set();
for (const c of certs) for (const n of c.name_value.split("\n")) names.add(n.toLowerCase().replace(/^\*\./, ""));
const subs = [...names].filter((n) => n.endsWith(".paradox.ai")).map((n) => n.slice(0, -".paradox.ai".length)).filter(Boolean);

// Paradox's own infrastructure words, not client names.
const INFRA = new Set(["api", "app", "chrome", "chromecf", "demo", "dev", "dev2", "dev3", "stg", "test", "proxy", "eu1", "sites", "job", "status", "www", "www2",
  "olivia", "assistant", "analytics", "grafana", "rancher", "argocd", "vault", "teleport", "jenkins", "genai", "webhook", "load", "email", "news", "info",
  "careers", "custom", "store", "drone", "droneai", "labs", "login", "media", "rasa", "geo", "hello", "intvpn", "privatebin", "privatebindev", "privatebinold",
  "proposals", "public-feeds", "scrape", "sonarqubetest", "use1", "preview", "addins", "myassistant", "ltsstg", "stgent", "devrasa", "applyserviceapi", "lts",
  "prod", "rasa-k8s", "applyserviceapi-dev", "devapi2", "devapik8s", "demo-k8s", "job-k8s", "media-k8s", "smashfly", "luci"]);
const tenantOf = (s) => {
  // fedexapi -> fedex, fedexstgapi -> fedex, api-k8s.fedex -> fedex, chrome.lowesstg -> lowes, job.regis -> regis
  for (const part of s.split(".")) {
    const base = part.replace(/(stg)?(api|chrome|status|demo)?$/, "").replace(/stg$/, "").replace(/-prod$/, "");
    if (base && !INFRA.has(base) && !/^api-k8s|^app-k8s|^k8s|^\d/.test(base) && !INFRA.has(part)) return base;
  }
  return null;
};
const tenants = new Map();
for (const s of subs) {
  const t = tenantOf(s);
  if (!t || /\d{3,}|^test|^ppp|^o-o|^uiui|^asd|^somerandom/.test(t)) continue; // test sites
  const e = tenants.get(t) ?? { tenant: t, subdomains: [] };
  e.subdomains.push(`${s}.paradox.ai`);
  tenants.set(t, e);
}
// A real client instance has several services (api, job, chrome, status...): keep those with >= 2.
const tenantRows = [...tenants.values()].filter((t) => t.subdomains.length >= 2)
  .map((t) => ({ tenant: t.tenant, nb_subdomains: t.subdomains.length, examples: t.subdomains.sort().slice(0, 6).join(" ") }))
  .sort((a, b) => b.nb_subdomains - a.nb_subdomains);
await fs.writeFile("results/crtsh_paradox_tenants.csv", toCSV(tenantRows, ["tenant", "nb_subdomains", "examples"]));
console.log(`A. crt.sh: ${certs.length} certificates, ${new Set(subs).size} sub-domains, ${tenantRows.length} client tenants`);
console.table(tenantRows.map(({ tenant, nb_subdomains }) => ({ tenant, nb_subdomains })));

// ---- B. DNS ---------------------------------------------------------------
const PLATFORMS = [
  [/\.sites\.([a-z0-9-]+\.)?paradox\.ai$/, "Paradox (career site)"],
  [/phenompeople\.com$/, "Phenom"], [/talentbrew\.com$/, "TalentBrew (Radancy)"], [/jibeapply\.com$/, "Jibe (iCIMS)"],
  [/myworkdayjobs\.com$/, "Workday"], [/wpeproxy\.com$/, "WordPress (WP Engine)"], [/azurefd\.net$/, "Azure (own site)"],
  [/trafficmanager\.net$/, "Azure (own site)"], [/impervadns\.net$/, "Imperva (own site)"],
];
const domains = (await fs.readFile("code/career_domains.txt", "utf8")).split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
const dnsRows = [];
for (const d of domains) {
  let cname = "";
  try { cname = (await dns.resolveCname(d))[0] ?? ""; } catch {}
  const platform = cname ? (PLATFORMS.find(([re]) => re.test(cname))?.[1] ?? "other (own site)") : "no CNAME (A record)";
  dnsRows.push({ domain: d, cname, platform });
}
await fs.writeFile("results/dns_career_sites.csv", toCSV(dnsRows, ["domain", "cname", "platform"]));
console.log(`\nB. DNS: ${dnsRows.filter((r) => r.platform.startsWith("Paradox")).length}/${dnsRows.length} domains point to Paradox`);
console.table(dnsRows);
