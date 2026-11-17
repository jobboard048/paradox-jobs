// For each URL given, fetches the page once and reports: the paradox.ai references in the HTML, the outgoing
// links to job platforms (career, apply, Workday, iCIMS, Olivia…) and the DNS aliases of those hosts.
// Usage: node code/case_studies/career_page_traces.mjs https://www.greatwolf.com/jobs https://tsgrestaurants.com/join-our-team/
import dns from "node:dns/promises";
const U=process.argv.slice(2);
async function chain(h){const out=[];let cur=h;for(let i=0;i<5;i++){try{const c=await dns.resolveCname(cur);out.push(c[0]);cur=c[0]}catch{break}}return out.join(" > ")}
for(const u of U){
  try{
    const ac=new AbortController();setTimeout(()=>ac.abort(),20000);
    const r=await fetch(u,{headers:{"user-agent":"paradox-jobs-scraper-demo/1.0"},signal:ac.signal});
    const t=await r.text();
    const pdx=[...new Set((t.match(/[a-z0-9.-]*paradox\.ai[^"'\s<>)]{0,70}/gi)||[]))].slice(0,5);
    const links=[...new Set([...t.matchAll(/href=["']([^"']+)["']/gi)].map(m=>{try{return new URL(m[1],r.url)}catch{return null}}).filter(x=>x&&x.host&&x.host!==new URL(r.url).host&&/career|job|apply|hiring|join|olivia|paradox|talent|recruit|workday|icims/i.test(x.href)).map(x=>x.href))].slice(0,8);
    const hosts=[...new Set([new URL(r.url).host,...links.map(l=>new URL(l).host)])];
    const dn=[];for(const h of hosts){const c=await chain(h);if(c)dn.push(h+" > "+c)}
    console.log(`## ${u} -> ${r.url} [${r.status}]\n  paradox: ${pdx.join(" | ")||"-"}\n  links: ${links.join("\n         ")||"-"}\n  DNS: ${dn.join(" | ")||"-"}`);
  }catch(e){console.log(`## ${u} ERR ${e.message}`)}
}
