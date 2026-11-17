// Converts a Markdown file to PDF using the Chrome or Edge installed on this machine.
// Handles headings, paragraphs, lists, tasks, tables, code blocks, links and images.
// A missing image is drawn as a dashed placeholder with its file name, so a draft can be
// printed before every screenshot exists.
//
// Usage: node tools/md_to_pdf.mjs <file.md> [out.pdf]     (default: same name, .pdf)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const [src, outArg] = process.argv.slice(2);
if (!src) { console.error("Usage: node tools/md_to_pdf.mjs <file.md> [out.pdf]"); process.exit(1); }
const out = path.resolve(outArg ?? src.replace(/\.md$/i, ".pdf"));
const dir = path.dirname(path.resolve(src));
const md = fs.readFileSync(src, "utf8").replace(/\r/g, "").replace(/<!--[\s\S]*?-->/g, "");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) => {
  const codes = [];
  s = esc(s).replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`);
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
       .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
       .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
};

const lines = md.split("\n");
let html = "", i = 0, missing = [];
while (i < lines.length) {
  const l = lines[i];
  if (!l.trim()) { i++; continue; }
  if (l.startsWith("```")) {
    const buf = []; i++;
    while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]);
    i++; html += `<pre><code>${esc(buf.join("\n"))}</code></pre>\n`; continue;
  }
  const img = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(l.trim());
  if (img) {
    const file = path.resolve(dir, img[2]);
    i++;
    let cap = "";
    if (i < lines.length && /^\*[^*].*\*$/.test(lines[i].trim())) cap = `<figcaption>${inline(lines[i++].trim().slice(1, -1))}</figcaption>`;
    const body = fs.existsSync(file)
      ? `<img src="file:///${file.replace(/\\/g, "/")}" alt="${esc(img[1])}">`
      : (missing.push(img[2]), `<div class="todo">Screenshot to add: <code>${esc(img[2])}</code><br>${esc(img[1])}</div>`);
    html += `<figure>${body}${cap}</figure>\n`;
    continue;
  }
  const h = /^(#{1,4}) (.*)$/.exec(l);
  if (h) { html += `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>\n`; i++; continue; }
  if (l.startsWith("|")) {
    const rows = [];
    while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
    const cells = (r) => r.replace(/^\||\|$/g, "").split(" | ").map((c) => c.trim());
    html += "<table><thead><tr>" + cells(rows[0]).map((c) => `<th>${inline(c)}</th>`).join("") + "</tr></thead><tbody>";
    for (const r of rows.slice(2)) html += "<tr>" + cells(r).map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>";
    html += "</tbody></table>\n"; continue;
  }
  const ol = /^(\d+)\. (.*)$/.exec(l);
  if (ol) {
    html += `<ol start="${ol[1]}">`;
    while (i < lines.length && /^\d+\. /.test(lines[i])) html += `<li>${inline(lines[i++].replace(/^\d+\. /, ""))}</li>`;
    html += "</ol>\n"; continue;
  }
  if (/^- /.test(l)) {
    html += "<ul>";
    while (i < lines.length && /^- /.test(lines[i])) {
      const t = lines[i++].slice(2);
      const task = /^\[ \] (.*)$/.exec(t);
      html += task ? `<li class="task">☐ ${inline(task[1])}</li>` : `<li>${inline(t)}</li>`;
    }
    html += "</ul>\n"; continue;
  }
  if (l.startsWith("> ")) {
    const buf = [];
    while (i < lines.length && lines[i].startsWith("> ")) buf.push(lines[i++].slice(2));
    html += `<blockquote>${inline(buf.join(" "))}</blockquote>\n`; continue;
  }
  const buf = [];
  while (i < lines.length && lines[i].trim() && !/^(#|\||```|- |\d+\. |!\[|> )/.test(lines[i])) buf.push(lines[i++]);
  html += `<p>${inline(buf.join(" "))}</p>\n`;
}

const title = /^# (.*)$/m.exec(md)?.[1] ?? path.basename(src);
const css = `body{font-family:"Segoe UI",Arial,sans-serif;font-size:10.5pt;line-height:1.45;color:#1f2328;max-width:780px;margin:0 auto}
h1{font-size:19pt;margin:0 0 4px}h2{font-size:13.5pt;margin:22px 0 6px;padding-bottom:3px;border-bottom:1px solid #d0d7de}h3{font-size:11.5pt;margin:16px 0 4px}
p{margin:6px 0}ul,ol{margin:6px 0;padding-left:22px}li{margin:3px 0}li.task{list-style:none;margin-left:-18px}
blockquote{margin:8px 0;padding-left:10px;border-left:3px solid #d0d7de;color:#59636e}
table{border-collapse:collapse;width:100%;margin:8px 0;font-size:9.5pt;page-break-inside:avoid}th,td{border:1px solid #d0d7de;padding:4px 7px;text-align:left;vertical-align:top}th{background:#f6f8fa}
code{font-family:Consolas,monospace;font-size:9pt;background:#f2f4f6;padding:0 3px;border-radius:3px}
pre{background:#f6f8fa;border:1px solid #d0d7de;border-radius:6px;padding:8px 10px;font-size:8.5pt;white-space:pre-wrap}pre code{background:none;padding:0}
a{color:#0b57d0;text-decoration:none}figure{margin:8px 0 14px;page-break-inside:avoid}figure img{max-width:100%;display:block;border:1px solid #d0d7de;border-radius:6px}
figcaption{font-size:9pt;color:#59636e;margin-top:4px;font-style:italic}
.todo{border:2px dashed #bf8700;background:#fff8c5;color:#7d4e00;border-radius:6px;padding:22px 14px;text-align:center;font-size:9.5pt}
@page{size:A4;margin:16mm 15mm}`;
const tmp = path.join(os.tmpdir(), `md_to_pdf_${process.pid}.html`);
fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}</style></head><body>${html}</body></html>`);

const browsers = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/chromium",
];
const browser = browsers.find((b) => fs.existsSync(b));
if (!browser) { console.error(`No Chrome/Edge found. HTML written to ${tmp}: open it and print to PDF.`); process.exit(1); }
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "md_to_pdf_profile_"));
execFileSync(browser, ["--headless=new", "--disable-gpu", "--no-first-run", "--allow-file-access-from-files",
  `--user-data-dir=${profile}`, "--no-pdf-header-footer", `--print-to-pdf=${out}`, `file:///${tmp.replace(/\\/g, "/")}`], { stdio: "ignore" });
fs.rmSync(tmp, { force: true });
fs.rmSync(profile, { recursive: true, force: true });
console.log(`PDF written: ${out}`);
if (missing.length) console.log(`${missing.length} screenshot(s) still missing (shown as placeholders):\n  ${missing.join("\n  ")}`);
