// Fetches the home page of each case-study client (honest User-Agent, one request per site), extracts the links
// that look like career pages, flags "paradox.ai" in the HTML and follows the DNS of the linked hosts.
// Many sites answer 403 or a bot challenge: they are reported as is, nothing is done to get around them.
// Usage: node code/case_studies/home_page_career_links.mjs
import dns from "node:dns/promises";
const H={ "general-motors":"https://www.gm.com/","zillow":"https://www.zillowgroup.com/","neighborly":"https://www.neighborlybrands.com/","johnson-controls":"https://www.johnsoncontrols.com/","ncs-group":"https://www.ncs.co/","schnucks":"https://schnucks.com/","singtel":"https://www.singtel.com/","hamra-enterprises":"https://hamraenterprises.com/","wendys-nz":"https://wendys.co.nz/","autism-learning-partners":"https://www.autismlearningpartners.com/","dell":"https://www.dell.com/","rev-group":"https://www.revgroup.com/","houston-methodist":"https://www.houstonmethodist.org/","sobeys":"https://www.sobeysinc.com/","pacific-seafood":"https://www.pacificseafood.com/","medtronic":"https://www.medtronic.com/","iss-world":"https://www.us.issworld.com/","hattie-bs":"https://www.hattieb.com/","dksh":"https://www.dksh.com/","the-saxton-group":"https://thesaxtongroup.com/","elevo":"https://www.elevo.com/","captain-ds":"https://www.captainds.com/","shiseido":"https://www.shiseido.com/","one-digital":"https://www.onedigital.com/","workday":"https://www.workday.com/","stanley-steemer":"https://www.stanleysteemer.com/","the-good-care-group":"https://www.thegoodcaregroup.com/","nestle":"https://www.nestleusa.com/","us-xpress":"https://www.usxpress.com/","uob":"https://www.uobgroup.com/","jll":"https://www.jll.com/","touchmark":"https://www.touchmark.com/","kpmg-singapore":"https://kpmg.com/sg/en.html","royal-london":"https://www.royallondon.com/","burlington":"https://www.burlington.com/","dfcu-financial":"https://www.dfcufinancial.com/","sportclips":"https://sportclips.com/","american-tire-distributors":"https://www.atd-us.com/","southern-rock":"https://www.southernrockrestaurants.com/","first-watch":"https://www.firstwatch.com/","unitingcare-queensland":"https://www.unitingcareqld.com.au/","pfizer":"https://www.pfizer.com/","multicare-health-system":"https://www.multicare.org/","mjhs":"https://www.mjhs.org/","great-wolf-lodge":"https://www.greatwolf.com/","advantage-solutions":"https://www.youradv.com/","wendys":"https://www.wendys.com/" };
async function chain(h){const out=[];let cur=h;for(let i=0;i<5;i++){try{const c=await dns.resolveCname(cur);out.push(c[0]);cur=c[0]}catch{break}}return out.join(" > ")}
const res=await Promise.all(Object.entries(H).map(async([cs,u])=>{
  try{
    const ac=new AbortController();setTimeout(()=>ac.abort(),20000);
    const r=await fetch(u,{headers:{"user-agent":"paradox-jobs-scraper-demo/1.0"},redirect:"follow",signal:ac.signal});
    const t=await r.text();
    const links=[...new Set([...t.matchAll(/href=["']([^"']+)["']/gi)].map(m=>m[1]).filter(h=>/career|jobs?\b|jobs\.|join|hiring|work-with|workwith|employment|olivia|paradox/i.test(h)).map(h=>{try{return new URL(h,r.url).href}catch{return null}}).filter(Boolean))].slice(0,8);
    const pdxText=/paradox\.ai/i.test(t);
    return {cs,status:r.status,links,pdxText};
  }catch(e){return {cs,status:"ERR "+e.name,links:[]}}
}));
for(const x of res){
  const hosts=[...new Set(x.links.map(l=>new URL(l).host))];
  const dn=[];for(const h of hosts){const c=await chain(h);if(c)dn.push(h+" > "+c)}
  console.log(`## ${x.cs} [${x.status}]${x.pdxText?" PARADOX-IN-HTML":""}\n  ${x.links.join("\n  ")}${dn.length?"\n  DNS: "+dn.join(" | "):""}`);
}
