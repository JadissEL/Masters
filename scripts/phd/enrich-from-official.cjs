#!/usr/bin/env node
/**
 * Fetch supervisor officialUrl pages and extract published emails / LinkedIn only.
 * Writes back to phd-verified.json — no fabrication.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const VERIFIED_PATH = path.join(__dirname, "../../data/phd/phd-verified.json");
const TODAY = new Date().toISOString().slice(0, 10);
const DELAY_MS = 400;

function fetchUrl(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; PhDEnrich/1.0)" }, timeout: 15000 },
      (r) => {
        if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
          const next = r.headers.location.startsWith("http")
            ? r.headers.location
            : new URL(r.headers.location, url).href;
          resolve(fetchUrl(next));
          return;
        }
        let d = "";
        r.on("data", (c) => (d += c));
        r.on("end", () => resolve({ ok: r.statusCode === 200, html: d, url }));
      }
    );
    req.on("error", () => resolve({ ok: false, html: "", url }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, html: "", url });
    });
  });
}

function extractFromHtml(html) {
  const emails = new Set();
  const linkedin = new Set();
  for (const m of html.matchAll(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi)) {
    emails.add(m[1].toLowerCase());
  }
  for (const m of html.matchAll(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.uk|ac\.nz|edu\.au|be|nl|lu|de|ch|es|fr|no|dk|is|jp|kr|ae|ca))\b/gi)) {
    emails.add(m[1].toLowerCase());
  }
  for (const m of html.matchAll(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/gi)) {
    linkedin.add(m[0].split("?")[0].replace(/\/$/, ""));
  }
  return { emails: [...emails], linkedin: [...linkedin] };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const data = JSON.parse(fs.readFileSync(VERIFIED_PATH, "utf-8"));
  let emailAdded = 0;
  let linkedinAdded = 0;
  let fetched = 0;

  for (const offer of data.phdOffers || []) {
    if (offer.status === "closed") continue;
    for (const sup of offer.supervisors || []) {
      const needsEmail = !sup.email;
      const needsLi = !sup.linkedinUrl;
      if (!sup.officialUrl || (!needsEmail && !needsLi)) continue;

      const { ok, html } = await fetchUrl(sup.officialUrl);
      fetched++;
      await sleep(DELAY_MS);
      if (!ok || !html) continue;

      const { emails, linkedin } = extractFromHtml(html);
      if (needsEmail && emails.length === 1) {
        sup.email = emails[0];
        sup.sourceUrl = sup.sourceUrl || sup.officialUrl;
        emailAdded++;
      } else if (needsEmail && emails.length > 1) {
        const namePart = (sup.name || "").split(/\s+/).pop()?.toLowerCase();
        const match = emails.find((e) => namePart && e.includes(namePart.slice(0, 4)));
        if (match) {
          sup.email = match;
          emailAdded++;
        }
      }
      if (needsLi && linkedin.length === 1) {
        sup.linkedinUrl = linkedin[0];
        linkedinAdded++;
      } else if (needsLi && linkedin.length > 1) {
        const namePart = (sup.name || "").split(/\s+/).pop()?.toLowerCase();
        const match = linkedin.find((u) => namePart && u.toLowerCase().includes(namePart));
        if (match) {
          sup.linkedinUrl = match;
          linkedinAdded++;
        }
      }
    }
  }

  data.lastUpdated = TODAY;
  data.enrichmentPass = { date: TODAY, fetched, emailAdded, linkedinAdded };
  fs.writeFileSync(VERIFIED_PATH, JSON.stringify(data, null, 2) + "\n");
  console.log(JSON.stringify({ fetched, emailAdded, linkedinAdded }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
