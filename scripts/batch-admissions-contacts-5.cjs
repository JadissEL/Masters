#!/usr/bin/env node
/**
 * Batch 5: official graduate admissions emails for priority schools missing from verified-programs.
 * Crawls official pages, verifies email on-page, DDG boolean fallback.
 */
const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../data/masters-data.json");
const OUT_PATH = path.join(__dirname, "../data/batch-admissions-contacts-5.json");

const VERIFICATION_DATE = "2026-07-12";
const FETCH_TIMEOUT_MS = 15000;
const CRAWL_DELAY_MS = 150;
const SEARCH_DELAY_MS = 900;

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const SKIP_RE =
  /webmaster|postmaster|noreply|no-reply|newsletter|marketing|privacy|dpo@|presse@|w3\.org|example\.com|facebook|twitter|linkedin|youtube|instagram|gravatar|wordpress|wix\.com|contact@iae-france\.fr/i;

const PRIORITY_SLUGS = [
  "iae-toulouse", "iae-lille", "iae-nantes", "iae-montpellier", "iae-strasbourg", "iae-grenoble", "iae-paris",
  "paris-saclay", "paris-cite", "sorbonne-universite", "aix-marseille-univ", "univ-lille", "univ-bordeaux",
  "univ-toulouse-capitole", "univ-strasbourg", "univ-nantes", "univ-rennes1", "univ-grenoble-alpes",
  "uam", "upm", "upc", "univ-barcelona",
  "nord-university", "univ-stavanger", "nmbu", "uib", "reykjavik-university", "university-of-iceland",
  "ulb", "uclouvain", "lsm",
  "tue", "thuas", "hanze", "buas",
  "dundee", "univ-nottingham", "roehampton",
  "psb", "ipag", "isc-paris", "excelia", "essca", "eada",
];

const SKIP_SLUGS = new Set(["kuleuven"]);

const ADMISSION_PATHS = {
  default: [
    "/admissions", "/en/admissions", "/admission", "/en/admission", "/contact", "/en/contact",
    "/contact-us", "/en/contact-us", "/study/postgraduate/contact", "/postgraduate/contact",
  ],
  FR: [
    "/fr/admissions", "/admissions", "/nous-contacter", "/fr/nous-contacter", "/scolarite", "/fr/scolarite",
    "/international/admissions", "/fr/international/admissions", "/formation/master/admission",
    "/fr/formation/master/admission", "/fr/contact", "/contact", "/fr/admission", "/admission",
    "/en/admission", "/en/admissions",
  ],
  GB: [
    "/study/postgraduate/apply/contact-us", "/study/postgraduate/contact", "/postgraduate/contact",
    "/admissions", "/study/admissions", "/contact", "/about/contact", "/pgstudy/contact",
  ],
  ES: ["/admision", "/estudiantes/admision", "/en/admissions", "/contacto", "/en/contact", "/admission"],
  BE: ["/en/admission", "/en/admissions", "/en/contact", "/admission", "/fr/admission"],
  NL: [
    "/en/education/application-enrolment-tuition-fees/application-masters", "/en/contact",
    "/en/education/admission", "/en/education/graduate-school",
  ],
  NO: ["/en/study/admission", "/english/admission", "/en/contact", "/en/admissions"],
  IS: ["/en/admissions", "/en/study", "/en/contact"],
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function domainFromWebsite(website) {
  try {
    return new URL(website.startsWith("http") ? website : `https://${website}`).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function scoreEmail(email, domain, isIae = false) {
  const lower = email.toLowerCase();
  const host = lower.split("@")[1];
  if (!host || SKIP_RE.test(lower)) return -1;

  let score = 0;
  if (/admission/i.test(lower)) score += 90;
  if (/masters?|graduate|postgraduate|pg\./i.test(lower)) score += 40;
  if (/scolarite|international\.admission/i.test(lower)) score += 50;
  if (/enquir|study@|ask@|inschrijving|opptak/i.test(lower)) score += 35;
  if (/^info@/.test(lower)) score += 25;
  if (/^contact@/.test(lower)) score += 15;

  if (isIae && /iae/i.test(host)) score += 40;
  if (domain && (host === domain || host.endsWith(`.${domain}`))) score += 35;
  else if (domain && host.includes(domain.split(".")[0])) score += 15;
  else score -= 25;

  return score;
}

function extractEmails(text) {
  const set = new Set();
  for (const m of text.match(/mailto:([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi) || []) {
    set.add(m.replace(/^mailto:/i, "").split("?")[0].toLowerCase());
  }
  for (const e of text.match(EMAIL_RE) || []) set.add(e.toLowerCase());
  return [...set];
}

async function fetchPage(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "MastersFinder/1.0 (official contact discovery)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/html") && !ct.includes("text/plain")) return null;
    return (await res.text()).slice(0, 600000);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function booleanQuery(domain) {
  return `site:${domain} ("admissions@" OR "pgadmissions@" OR "admission@" OR "scolarite@" OR "study@" OR "opptak@" OR "inscription@")`;
}

async function ddgSearch(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MastersFinder/1.0)", Accept: "text/html" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

function extractDdgUrls(html) {
  const urls = [];
  const re = /uddg=([^&"]+)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      urls.push(decodeURIComponent(m[1]));
    } catch {
      /* ignore */
    }
  }
  return urls.slice(0, 8);
}

async function verifyEmailOnOfficialPages(email, school, cc) {
  const base = (school.website || "").replace(/\/$/, "");
  const domain = domainFromWebsite(base);
  const paths = [...new Set([...(ADMISSION_PATHS[cc] || []), ...ADMISSION_PATHS.default])];
  const candidates = [base, ...paths.map((p) => base + p)];

  for (const url of candidates) {
    const html = await fetchPage(url);
    if (html && html.toLowerCase().includes(email.toLowerCase())) {
      return url;
    }
    await sleep(80);
  }

  // DDG result pages on same domain
  const ddgHtml = await ddgSearch(booleanQuery(domain));
  for (const url of extractDdgUrls(ddgHtml)) {
    if (!url.includes(domain)) continue;
    const html = await fetchPage(url);
    if (html && html.toLowerCase().includes(email.toLowerCase())) return url;
    await sleep(80);
  }

  return null;
}

async function crawlSchool(school, cc) {
  const base = (school.website || "").replace(/\/$/, "");
  if (!base) return null;
  const domain = domainFromWebsite(base);
  const isIae = school.slug.startsWith("iae-");
  const paths = [...new Set([...(ADMISSION_PATHS[cc] || []), ...ADMISSION_PATHS.default])];
  let best = null;

  for (const p of paths) {
    const url = base + p;
    const html = await fetchPage(url);
    if (!html) continue;
    for (const email of extractEmails(html)) {
      const score = scoreEmail(email, domain, isIae);
      if (score >= 45 && (!best || score > best.score)) best = { email, score, sourceUrl: url };
    }
    if (best && best.score >= 90) break;
    await sleep(CRAWL_DELAY_MS);
  }

  if (!best || best.score < 55) {
    const html = await fetchPage(base);
    if (html) {
      for (const email of extractEmails(html)) {
        const score = scoreEmail(email, domain, isIae);
        if (score >= 50 && (!best || score > best.score)) best = { email, score, sourceUrl: base };
      }
    }
  }

  return best;
}

async function searchSchool(school, cc) {
  const domain = domainFromWebsite(school.website);
  if (!domain) return null;
  const isIae = school.slug.startsWith("iae-");
  const queries = [
    booleanQuery(domain),
    `site:${domain} master admission contact email`,
    `"${school.name.replace(/['"]/g, "").slice(0, 60)}" admissions email`,
  ];
  let best = null;

  for (const query of queries) {
    const html = await ddgSearch(query);
    if (!html) continue;
    for (const email of extractEmails(html)) {
      const score = scoreEmail(email, domain, isIae);
      if (score >= 50 && (!best || score > best.score)) {
        const verifiedUrl = await verifyEmailOnOfficialPages(email, school, cc);
        if (verifiedUrl) {
          best = { email, score: score + 15, sourceUrl: verifiedUrl, query };
        }
      }
    }
    if (best && best.score >= 85) break;
    await sleep(SEARCH_DELAY_MS);
  }

  return best;
}

async function discoverSchool(school, cc) {
  let best = await crawlSchool(school, cc);
  if (!best || best.score < 70) {
    const searched = await searchSchool(school, cc);
    if (searched && (!best || searched.score > best.score)) best = searched;
  }
  if (!best || best.score < 45) return null;

  // Final verification: email must appear on sourceUrl
  const page = await fetchPage(best.sourceUrl);
  if (!page || !page.toLowerCase().includes(best.email.toLowerCase())) {
    const verified = await verifyEmailOnOfficialPages(best.email, school, cc);
    if (!verified) return null;
    best.sourceUrl = verified;
  }

  return {
    schoolSlug: school.slug,
    role: "graduate_admissions",
    email: best.email,
    sourceUrl: best.sourceUrl,
    sourceType: "official_university_website",
    verificationDate: VERIFICATION_DATE,
    confidenceLevel: best.score >= 75 ? "High" : "Medium",
  };
}

async function main() {
  const db = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  const countries = Object.fromEntries(db.countries.map((c) => [c.id, c.code]));
  const schoolBySlug = Object.fromEntries(db.schools.map((s) => [s.slug, s]));

  const batch = PRIORITY_SLUGS.filter((s) => !SKIP_SLUGS.has(s));
  console.log(`Batch 5: ${batch.length} priority schools`);

  const results = [];
  const skippedFormOnly = [];
  const unresolved = [];

  for (let i = 0; i < batch.length; i++) {
    const slug = batch[i];
    const school = schoolBySlug[slug];
    if (!school) {
      unresolved.push(slug);
      console.log(`[${i + 1}/${batch.length}] ${slug} — MISSING in masters-data`);
      continue;
    }
    const cc = countries[school.countryId] || "??";
    process.stdout.write(`[${i + 1}/${batch.length}] ${slug} ... `);
    const result = await discoverSchool(school, cc);
    if (result) {
      results.push(result);
      console.log(`${result.email} (${result.confidenceLevel})`);
    } else {
      // Form-only check for dundee, nottingham
      if (["dundee", "univ-nottingham"].includes(slug)) {
        skippedFormOnly.push(slug);
        console.log("form-only (skipped)");
      } else {
        unresolved.push(slug);
        console.log("—");
      }
    }

    if ((i + 1) % 5 === 0) {
      fs.writeFileSync(
        OUT_PATH,
        JSON.stringify({ schoolContacts: results, skippedFormOnly, unresolved, lastRun: new Date().toISOString() }, null, 2) + "\n"
      );
    }
  }

  const out = { schoolContacts: results, skippedFormOnly, unresolved, lastRun: new Date().toISOString() };
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nFound: ${results.length} / ${batch.length}`);
  console.log(`Skipped form-only: ${skippedFormOnly.join(", ") || "none"}`);
  console.log(`Unresolved: ${unresolved.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
