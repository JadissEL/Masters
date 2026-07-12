#!/usr/bin/env node
const https = require("https");

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }, (r) => {
        let d = "";
        r.on("data", (c) => (d += c));
        r.on("end", () => resolve(d));
      })
      .on("error", reject);
  });
}

const KEYWORDS =
  /finance|accounting|compliance|corporate|esg|banking|investment|financial|governance|audit|risk|fintech|money laundering|regulatory|asset pricing|capital market/i;

async function main() {
  const found = [];
  for (let page = 1; page <= 20; page++) {
    const url = `https://www.jobs.ac.uk/search/phds?keywords=business+finance+accounting+compliance&location=United+Kingdom&sortType=2&page=${page}`;
    const html = await fetch(url);
    const re =
      /<a[^>]+href="(\/job\/[^"]+)"[^>]*>\s*([^<]+)<\/a>[\s\S]*?Closes\s+(\d+\s+\w+)/gi;
    let m;
    while ((m = re.exec(html))) {
      const title = m[2].replace(/&amp;/g, "&").trim();
      if (!KEYWORDS.test(title)) continue;
      found.push({
        title,
        link: `https://www.jobs.ac.uk${m[1]}`,
        closes: m[3],
        page,
      });
    }
    if (!html.includes(`Page ${page} of`)) break;
  }
  console.log(JSON.stringify(found, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
