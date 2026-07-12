#!/usr/bin/env node
/**
 * Web-search fallback for schools where page crawl found no admissions email.
 * Uses DuckDuckGo HTML with intelligent boolean query variants per country.
 */
const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../data/masters-data.json");
const DISCOVERED_PATH = path.join(__dirname, "../data/discovered-school-contacts.json");

const VERIFICATION_DATE = "2026-07-12";
const DELAY_MS = 800;

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;

function domainFromWebsite(website) {
  try {
    return new URL(website.startsWith("http") ? website : `https://${website}`).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function buildQueries(school, domain, cc) {
  const name = school.name.replace(/['"]/g, "").slice(0, 60);
  const q = [];

  if (domain) {
    q.push(`site:${domain} ("admissions@" OR "admission@" OR "graduate.admissions@")`);
    q.push(`site:${domain} ("masters@" OR "postgraduate@" OR "pgadmissions@" OR "study@")`);
    if (cc === "FR") {
      q.push(`site:${domain} ("scolarite@" OR "admission@" OR "international@")`);
      q.push(`site:${domain} "@" master admission contact`);
    }
    if (cc === "GB") {
      q.push(`site:${domain} ("enquiries@" OR "ask@" OR "postgraduate@") admissions`);
    }
    if (cc === "NL") {
      q.push(`site:${domain} ("info@" OR "masters@" OR "admission@")`);
    }
    if (cc === "ES") {
      q.push(`site:${domain} ("admision@" OR "secretaria@" OR "info@") master`);
    }
    q.push(`site:${domain} mailto admission master`);
  }

  q.push(`"${name}" official admissions email contact`);
  q.push(`"${name}" "@" admission master programme`);
  return q;
}

function scoreEmail(email, domain) {
  const lower = email.toLowerCase();
  const host = lower.split("@")[1];
  if (!host) return -1;
  if (/webmaster|postmaster|noreply|newsletter|marketing|privacy|dpo@|presse@|w3\.org/i.test(lower)) return -1;

  let score = 0;
  if (/admission/i.test(lower)) score += 90;
  if (/masters?|graduate|postgraduate|pg\./i.test(lower)) score += 40;
  if (/scolarite|international\.admission/i.test(lower)) score += 50;
  if (/enquir|study@|ask@/i.test(lower)) score += 35;
  if (/^info@/.test(lower)) score += 25;
  if (/^contact@/.test(lower)) score += 20;

  if (domain && (host === domain || host.endsWith(`.${domain}`))) score += 35;
  else if (domain && host.includes(domain.split(".")[0])) score += 15;
  else score -= 25;

  return score;
}

function extractEmails(text) {
  const set = new Set();
  for (const e of text.match(EMAIL_RE) || []) set.add(e.toLowerCase());
  return [...set];
}

async function ddgSearch(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MastersFinder/1.0)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

async function searchSchool(school, cc) {
  const domain = domainFromWebsite(school.website);
  const queries = buildQueries(school, domain, cc);
  let best = null;

  for (const query of queries) {
    const html = await ddgSearch(query);
    if (!html) continue;

    for (const email of extractEmails(html)) {
      const score = scoreEmail(email, domain);
      if (score >= 45 && (!best || score > best.score)) {
        best = {
          email,
          score,
          sourceUrl: `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
          query,
        };
      }
    }
    if (best && best.score >= 85) break;
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  if (!best) return null;

  return {
    schoolSlug: school.slug,
    role: "admissions_officer",
    email: best.email,
    sourceUrl: best.sourceUrl,
    sourceType: "official_university_website",
    verificationDate: VERIFICATION_DATE,
    confidenceLevel: best.score >= 80 ? "High" : best.score >= 55 ? "Medium" : "Low",
    notes: `Web search: ${best.query.slice(0, 120)}`,
  };
}

async function main() {
  const db = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  const countries = Object.fromEntries(db.countries.map((c) => [c.id, c.code]));

  let data = { schoolContacts: [], failed: [] };
  if (fs.existsSync(DISCOVERED_PATH)) data = JSON.parse(fs.readFileSync(DISCOVERED_PATH, "utf-8"));

  const foundSlugs = new Set((data.schoolContacts || []).map((c) => c.schoolSlug));
  const failedSlugs = (data.failed || []).filter((s) => !foundSlugs.has(s));
  const schoolBySlug = Object.fromEntries(db.schools.map((s) => [s.slug, s]));

  const limit = parseInt(process.argv[2] || "0", 10) || failedSlugs.length;
  const offset = parseInt(process.argv[3] || "0", 10);
  const batch = failedSlugs.slice(offset, offset + limit);

  console.log(`Web-search fallback for ${batch.length} failed schools...`);

  let newCount = 0;
  for (let i = 0; i < batch.length; i++) {
    const slug = batch[i];
    const school = schoolBySlug[slug];
    if (!school) continue;
    const cc = countries[school.countryId] || "??";
    process.stdout.write(`[${i + 1}/${batch.length}] ${slug} ... `);
    const result = await searchSchool(school, cc);
    if (result) {
      data.schoolContacts.push(result);
      foundSlugs.add(slug);
      data.failed = data.failed.filter((s) => s !== slug);
      newCount++;
      console.log(result.email);
    } else {
      console.log("—");
    }

    if ((i + 1) % 10 === 0) {
      data.lastRun = new Date().toISOString();
      fs.writeFileSync(DISCOVERED_PATH, JSON.stringify(data, null, 2) + "\n");
    }
  }

  data.lastRun = new Date().toISOString();
  fs.writeFileSync(DISCOVERED_PATH, JSON.stringify(data, null, 2) + "\n");
  console.log(`\nWeb search: +${newCount} contacts (${data.schoolContacts.length} total, ${data.failed.length} still failed)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
