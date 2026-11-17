// Opens the queries of queries.txt as Google searches in your normal browser, one tab each.
// It does not control the browser and reads nothing: you look at the results (and solve a CAPTCHA if Google shows one),
// then copy the result links into manual_urls.txt, for example with this line in the DevTools console of each page:
//   copy([...document.querySelectorAll('#search a h3')].map(h => h.closest('a').href).join('\n'))
// Then run: node 02-find-more-jobs/web-search/test/web_search.mjs --from-file manual_urls.txt
//
// Usage: node 02-find-more-jobs/web-search/test/open_searches.mjs [--bing]
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const bing = process.argv.includes("--bing");
const queries = fs.readFileSync(path.join(DIR, "queries.txt"), "utf8")
  .split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));

for (const q of queries) {
  const url = bing ? `https://www.bing.com/search?q=${encodeURIComponent(q)}` : `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  const cmd = process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  spawn(cmd[0], cmd[1], { detached: true, stdio: "ignore" }).unref();
  console.log("opened:", q);
}
