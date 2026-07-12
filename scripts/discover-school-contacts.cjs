#!/usr/bin/env node
/**
 * Discover official admissions emails from school websites.
 * Tries intelligent URL paths + mailto extraction — never fabricates.
 */
const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../data/masters-data.json");
const OUT_PATH = path.join(__dirname, "../data/discovered-school-contacts.json");
const EXISTING_PATH = path.join(__dirname, "../data/batch-admissions-enrichment.json");

const VERIFICATION_DATE = "2026-07-12";
const FETCH_TIMEOUT_MS = 12000;
const DELAY_MS = 150;

const ADMISSION_PATHS = {
  default: [
    "/en/admissions",
    "/admissions",
    "/en/admission",
    "/admission",
    "/contact",
    "/en/contact",
    "/contact-us",
    "/en/contact-us",
    "/study/admissions",
    "/en/study/admissions",
  ],
  FR: [
    "/fr/admissions",
    "/admissions",
    "/nous-contacter",
    "/fr/nous-contacter",
    "/contact",
    "/scolarite",
    "/fr/scolarite",
    "/formation/master/admission",
    "/fr/formation/master/admission",
    "/international/admissions",
    "/fr/international/admissions",
  ],
  GB: [
    "/study/postgraduate/contact",
    "/study/postgraduate/apply",
    "/postgraduate/contact",
    "/admissions",
    "/study/admissions",
    "/contact",
    "/about/contact",
  ],
  NL: [
    "/en/education/admission",
    "/en/education/more-about/admission-and-application",
    "/en/contact",
    "/education/master/admission",
    "/en/education/application-enrolment-tuition-fees/application-masters",
  ],
  IE: [
    "/courses/postgraduate/how-to-apply",
    "/contact",
    "/en/contact",
    "/admissions",
  ],
  ES: [
    "/en/admissions",
    "/admision",
    "/estudiantes/admision",
    "/contacto",
    "/en/contact",
  ],
  BE: [
    "/en/admission",
    "/en/admissions",
    "/en/contact",
    "/admission",
  ],
  NO: [
    "/en/admission",
    "/en/study/admission",
    "/english/admission",
    "/contact",
  ],
  DK: [
    "/en/study/admission",
    "/en/study/admissions",
    "/en/contact",
    "/english/education/admission",
  ],
  NZ: [
    "/en/study/applications-and-admissions",
    "/study/apply",
    "/contact",
    "/en/contact",
  ],
  IS: [
    "/en/admissions",
    "/english/admissions",
    "/en/contact",
  ],
};

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const SKIP_DOMAINS = new Set([
  "example.com", "sentry.io", "w3.org", "schema.org", "google.com",
  "facebook.com", "twitter.com", "linkedin.com", "youtube.com",
  "instagram.com", "gravatar.com", "wordpress.com", "wix.com",
]);

const ADMISSION_KEYWORDS = [
  { re: /^(admissions?|admission)@/i, score: 100 },
  { re: /graduate\.?admissions?@/i, score: 95 },
  { re: /masters?@/i, score: 90 },
  { re: /international\.?admissions?@/i, score: 92 },
  { re: /pg\.?admissions?@/i, score: 88 },
  { re: /postgraduate@/i, score: 85 },
  { re: /scolarite@/i, score: 88 },
  { re: /inschrijving@/i, score: 85 },
  { re: /ask[a-z]*@/i, score: 70 },
  { re: /info@/i, score: 40 },
  { re: /contact@/i, score: 35 },
  { re: /enquiries@/i, score: 50 },
  { re: /study@/i, score: 55 },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeBase(url) {
  if (!url) return null;
  return url.replace(/\/$/, "");
}

function domainFromWebsite(website) {
  try {
    return new URL(website.startsWith("http") ? website : `https://${website}`).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function scoreEmail(email, schoolDomain) {
  const lower = email.toLowerCase();
  const host = lower.split("@")[1];
  if (!host || SKIP_DOMAINS.has(host)) return -1;
  if (host.includes("noreply") || host.includes("no-reply")) return -1;
  if (lower.includes("privacy") || lower.includes("dpo@") || lower.includes("presse@")) return -1;
  if (/^(webmaster|postmaster|admin|support|helpdesk|noreply|no-reply|newsletter|marketing|communication|com@|presse|media|hr@|jobs@|career|alumni|library|biblio)@/i.test(lower)) return -1;

  let score = 0;
  for (const { re, score: s } of ADMISSION_KEYWORDS) {
    if (re.test(lower)) score = Math.max(score, s);
  }

  // Prefer same-institution domain
  if (schoolDomain && (host === schoolDomain || host.endsWith(`.${schoolDomain}`))) {
    score += 30;
  } else if (schoolDomain && host.includes(schoolDomain.split(".")[0])) {
    score += 15;
  } else {
    score -= 20;
  }

  return score;
}

function extractEmails(html) {
  const found = new Set();
  const mailtos = html.match(/mailto:([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi) || [];
  for (const m of mailtos) {
    found.add(m.replace(/^mailto:/i, "").split("?")[0].toLowerCase());
  }
  const plain = html.match(EMAIL_RE) || [];
  for (const e of plain) found.add(e.toLowerCase());
  return [...found];
}

async function fetchPage(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "MastersFinder/1.0 (official contact discovery; +https://github.com/JadissEL/Masters)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/html") && !ct.includes("text/plain")) return null;
    const text = await res.text();
    return text.slice(0, 500000);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function discoverForSchool(school, countryCode) {
  const base = normalizeBase(school.website);
  if (!base) return null;
  const schoolDomain = domainFromWebsite(base);
  const paths = [...(ADMISSION_PATHS[countryCode] || []), ...ADMISSION_PATHS.default];
  const uniquePaths = [...new Set(paths)];

  let best = null;

  for (const p of uniquePaths) {
    const url = base + p;
    const html = await fetchPage(url);
    if (!html) continue;

    const emails = extractEmails(html);
    for (const email of emails) {
      const score = scoreEmail(email, schoolDomain);
      if (score < 30) continue;
      if (!best || score > best.score) {
        best = { email, score, sourceUrl: url };
      }
    }
    if (best && best.score >= 90) break;
    await sleep(DELAY_MS);
  }

  // Homepage fallback
  if (!best || best.score < 50) {
    const html = await fetchPage(base);
    if (html) {
      for (const email of extractEmails(html)) {
        const score = scoreEmail(email, schoolDomain);
        if (score >= 50 && (!best || score > best.score)) {
          best = { email, score, sourceUrl: base };
        }
      }
    }
  }

  if (!best || best.score < 35) return null;

  return {
    schoolSlug: school.slug,
    role: "admissions_officer",
    email: best.email,
    sourceUrl: best.sourceUrl,
    sourceType: "official_university_website",
    verificationDate: VERIFICATION_DATE,
    confidenceLevel: best.score >= 80 ? "High" : best.score >= 55 ? "Medium" : "Low",
    notes: `Discovered via page crawl (score ${best.score})`,
  };
}

async function main() {
  const db = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  const countries = Object.fromEntries(db.countries.map((c) => [c.id, c.code]));
  const hasContact = new Set(db.contacts.map((c) => c.schoolId));

  const existingSlugs = new Set();
  for (const src of [EXISTING_PATH, OUT_PATH, path.join(__dirname, "../data/verified-programs.json")]) {
    if (!fs.existsSync(src)) continue;
    const data = JSON.parse(fs.readFileSync(src, "utf-8"));
    for (const c of data.schoolContacts || []) existingSlugs.add(c.schoolSlug);
  }

  const need = db.schools.filter(
    (s) => !hasContact.has(s.id) && !existingSlugs.has(s.slug)
  );

  const limit = parseInt(process.argv[2] || "0", 10) || need.length;
  const offset = parseInt(process.argv[3] || "0", 10);
  const concurrency = parseInt(process.argv[4] || "4", 10);
  const batch = need.slice(offset, offset + limit);

  console.log(`Discovering contacts for ${batch.length} schools (offset ${offset}, concurrency ${concurrency})...`);

  const discovered = [];
  const failed = [];

  async function worker(school, idx) {
    const cc = countries[school.countryId] || "default";
    process.stdout.write(`[${idx + 1}/${batch.length}] ${school.slug} ... `);
    const result = await discoverForSchool(school, cc);
    if (result) {
      discovered.push(result);
      console.log(result.email, `(${result.confidenceLevel})`);
    } else {
      failed.push(school.slug);
      console.log("—");
    }
  }

  for (let i = 0; i < batch.length; i += concurrency) {
    const chunk = batch.slice(i, i + concurrency);
    await Promise.all(chunk.map((s, j) => worker(s, i + j)));
    // Persist incrementally
    let merged = { schoolContacts: [], failed: [] };
    if (fs.existsSync(OUT_PATH)) merged = JSON.parse(fs.readFileSync(OUT_PATH, "utf-8"));
    const bySlug = new Map((merged.schoolContacts || []).map((c) => [c.schoolSlug, c]));
    for (const c of discovered) bySlug.set(c.schoolSlug, c);
    merged.schoolContacts = [...bySlug.values()];
    merged.failed = [...new Set([...(merged.failed || []), ...failed])];
    merged.lastRun = new Date().toISOString();
    fs.writeFileSync(OUT_PATH, JSON.stringify(merged, null, 2) + "\n");
  }

  console.log(`\nDone: ${discovered.length} found this run, ${failed.length} failed this run`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
