#!/usr/bin/env node
/**
 * Agent 3 discovery helper — fetch & parse AcademicTransfer + EURAXESS job pages.
 */
const https = require("https");
const fs = require("fs");
const path = require("path");

const AS_OF = "2026-07-12";
const AS_OF_MS = Date.parse(AS_OF + "T23:59:59Z");

const CANDIDATE_URLS = [
  "https://www.academictransfer.com/en/jobs/360822/phd-candidate-sustainable-long-term-investment-decisions/",
  "https://www.academictransfer.com/en/jobs/361932/phd-candidate-on-social-returns-to-pension-investments/",
  "https://www.academictransfer.com/en/jobs/362418/fully-funded-phd-position-in-health-technology-assessment-hta-in-innovative-neurosurgical-care-at-rotterdam-school-of-management-erasmus-university-rsm-four-year-fully-funded-projects-with-possible-extension-and-state-of-the-art-facilities/",
  "https://www.academictransfer.com/en/jobs/361629/phd-position-on-strengthening-mortgage-portfolio-resilience-to-physical-climate-risks/",
  "https://www.academictransfer.com/en/jobs/361275/phd-position-systemic-risk-in-climate-sensitive-housing-markets/",
  "https://www.academictransfer.com/en/jobs/361448/phd-position-decarbonization-dynamics-of-sme-in-the-netherlands/",
  "https://www.academictransfer.com/en/jobs/361555/phd-candidate-designing-smarter-trials-for-better-value-in-healthcare/",
  "https://www.academictransfer.com/en/jobs/362335/phd-candidate-from-good-intentions-to-real-impact-can-ai-support-sustainable-consumer-choices/",
  "https://www.academictransfer.com/en/jobs/361347/fully-funded-phd-position-in-marketing-management-at-rotterdam-school-of-management-erasmus-university-rsm/",
  "https://www.academictransfer.com/en/jobs/359347/fully-funded-phd-positions-in-strategy-and-entrepreneurship-at-rotterdam-school-of-management-erasmus-university-rsm/",
  "https://www.academictransfer.com/en/jobs/359730/promovendus-op-het-project-authentimark-burgers-beschermen-en-weerbaar-maken-tegen-digitale-fraude/",
  "https://www.academictransfer.com/en/jobs/361420/phd-candidate-in-methodology-statistics/",
  "https://www.academictransfer.com/en/jobs/361417/phd-in-methodolgy-and-statistics/",
  "https://www.academictransfer.com/en/jobs/361452/phd-kandidaat-circulair-inkopen-aan-tilburg-university-center-graduate-school-of-business/",
  "https://www.academictransfer.com/en/jobs/361533/phd-kandidaat-toekomstbestendig-monitoringscentrum/",
  "https://euraxess.ec.europa.eu/jobs/406036",
  "https://euraxess.ec.europa.eu/jobs/434552",
  "https://euraxess.ec.europa.eu/jobs/434535",
  "https://euraxess.ec.europa.eu/jobs/426970",
  "https://euraxess.ec.europa.eu/jobs/426598",
  "https://euraxess.ec.europa.eu/jobs/436774",
  "https://euraxess.ec.europa.eu/jobs/434913",
  "https://euraxess.ec.europa.eu/jobs/410398",
  "https://euraxess.ec.europa.eu/jobs/423270",
  "https://euraxess.ec.europa.eu/jobs/432586",
  "https://euraxess.ec.europa.eu/jobs/421753",
  "https://euraxess.ec.europa.eu/jobs/414688",
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0 PhD-Discovery/1.0" } }, (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve({ status: res.statusCode, body }));
      })
      .on("error", reject);
  });
}

function parseDeadline(html) {
  const patterns = [
    /Deadline\s+(\d{1,2}\s+[A-Za-z]{3}\s+'\d{2})/i,
    /no later than\s+(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})/i,
    /Application Deadline[^0-9]*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
    /(\d{1,2}\s+[A-Za-z]+\s+\d{4})\s*-\s*\d{2}:\d{2}\s*\(UTC\)/,
    /Last application date[^0-9]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1];
  }
  if (/open until filled|rolling basis|processed upon reception/i.test(html)) return "open_until_filled";
  return null;
}

function parseTitle(html) {
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1) return h1[1].replace(/\s+/g, " ").trim();
  const og = html.match(/property="og:title"\s+content="([^"]+)"/i);
  if (og) return og[1].split("—")[0].trim();
  const t = html.match(/<title>([^<]+)<\/title>/i);
  return t ? t[1].split("|")[0].trim() : null;
}

function isFunded(html) {
  return /fully funded|fully-funded|salaried|scholarship|doctoral grant|PhD-scholarship|fellowship|CAO-NU|grant amount|competitively salaried/i.test(
    html
  );
}

function isPhD(html, title) {
  const t = (title || "") + html.slice(0, 8000);
  return /PhD|doctoral|Doctoral|promovendus|doctoral fellow|doctoral researcher/i.test(t);
}

function domainMatch(html, title) {
  const t = ((title || "") + " " + html).toLowerCase();
  const keys = [
    "finance", "accounting", "compliance", "banking", "audit", "tax", "pension",
    "investment", "econometrics", "corporate finance", "financial", "actuarial",
    "health economics", "risk", "mortgage", "sustainability accounting", "fraud",
    "corporate taxation", "corporate governance", "operations management",
  ];
  return keys.filter((k) => t.includes(k));
}

function slugify(s) {
  return (s || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function main() {
  const results = [];
  for (const url of CANDIDATE_URLS) {
    try {
      const { status, body } = await fetch(url);
      const title = parseTitle(body);
      const deadline = parseDeadline(body);
      const funded = isFunded(body);
      const phd = isPhD(body, title);
      const domains = domainMatch(body, title);
      let open = false;
      if (deadline === "open_until_filled") open = true;
      else if (deadline) {
        const normalized = deadline.replace(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/, "$3-$2-$1");
        const ms = Date.parse(normalized);
        open = !Number.isNaN(ms) && ms >= AS_OF_MS;
      }
      results.push({ url, status, title, deadline, funded, phd, domains, open });
      process.stdout.write(".");
    } catch (e) {
      results.push({ url, error: String(e) });
    }
  }
  console.log("\n", JSON.stringify(results, null, 2));
}

main();
