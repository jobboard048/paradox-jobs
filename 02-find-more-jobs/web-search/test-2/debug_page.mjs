import { chromium } from 'playwright';
import fs from 'node:fs';

const browser = await chromium.launch({ headless: false, channel: 'chrome' });
const context = await browser.newContext({ locale: 'en-US' });
const page = await context.newPage();

const url = 'https://www.google.com/search?q=inurl%3A%22%2Fjob%2FP1-%22&hl=en&gl=us';
console.log('Navigating to', url);
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(3000);

const title = await page.title();
console.log('Title:', title);
console.log('URL:', page.url());

const html = await page.content();
fs.writeFileSync('debug_page.html', html);
await page.screenshot({ path: 'debug_page.png', fullPage: true });
console.log('Saved debug_page.html and debug_page.png');

await browser.close();
