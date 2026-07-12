#!/usr/bin/env node
/**
 * Batch 3: discover official admissions emails for failed schools.
 * Crawls official pages first, then DuckDuckGo boolean queries as fallback.
 */
const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../data/masters-data.json");
const DISCOVERED_PATH = path.join(__dirname, "../data/discovered-school-contacts.json");
const BATCH2_PATH = path.join(__dirname, "../data/batch-admissions-contacts-2.json");
const OUT_PATH = path.join(__dirname, "../data/batch-admissions-contacts-3.json");

const VERIFICATION_DATE = "2026-07-12";
const FETCH_TIMEOUT_MS = 12000;
const CRAWL_DELAY_MS = 120;
const SEARCH_DELAY_MS = 900;

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const SKIP_RE =
  /webmaster|postmaster|noreply|no-reply|newsletter|marketing|privacy|dpo@|presse@|w3\.org|example\.com|facebook|twitter|linkedin|youtube|instagram|gravatar|wordpress|wix\.com/i;

const ADMISSION_PATHS = {
  default: ["/admissions", "/en/admissions", "/admission", "/en/admission", "/contact", "/en/contact", "/contact-us", "/en/contact-us"],
  FR: [
    "/fr/admissions",
    "/admissions",
    "/nous-contacter",
    "/fr/nous-contacter",
    "/scolarite",
    "/fr/scolarite",
    "/international/admissions",
    "/fr/international/admissions",
    "/formation/master/admission",
    "/fr/formation/master/admission",
    "/fr/contact",
    "/contact",
  ],
  GB: [
    "/study/postgraduate/apply/contact-us",
    "/study/postgraduate/contact",
    "/study/postgraduate/apply",
    "/postgraduate/contact",
    "/admissions",
    "/study/admissions",
    "/contact",
    "/about/contact",
  ],
  ES: ["/admision", "/estudiantes/admision", "/en/admissions", "/contacto", "/en/contact"],
  BE: ["/en/admission", "/en/admissions", "/en/contact", "/admission", "/fr/admission"],
  NL: ["/en/education/application-enrolment-tuition-fees/application-masters", "/en/contact", "/en/education/admission"],
  IE: ["/courses/postgraduate/", "/admissions", "/contact", "/en/contact"],
  NO: ["/en/study/admission", "/english/admission", "/en/contact"],
  DK: ["/en/study/admission", "/en/contact", "/english/education/admission"],
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
  if (/enquir|study@|ask@|inschrijving/i.test(lower)) score += 35;
  if (/^info@/.test(lower)) score += 25;
  if (/^contact@/.test(lower)) score += 20;

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
    return (await res.text()).slice(0, 500000);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function buildQueries(school, domain, cc) {
  const name = school.name.replace(/['"]/g, "").slice(0, 70);
  const q = [];
  if (domain) {
    q.push(`site:${domain} ("admissions@" OR "admission@" OR "graduate.admissions@")`);
    q.push(`site:${domain} ("masters@" OR "scolarite@" OR "postgraduate@")`);
    if (cc === "FR") q.push(`site:${domain} ("scolarite@" OR "admission@" OR "international@")`);
    if (cc === "GB") q.push(`site:${domain} ("pgadmissions@" OR "enquiries@" OR "postgraduate@")`);
    if (cc === "ES") q.push(`site:${domain} ("admision@" OR "secretaria@" OR "info@") master`);
    if (cc === "BE") q.push(`site:${domain} ("admission@" OR "info@") master`);
    if (school.slug.startsWith("iae-")) q.push(`site:${domain} "@" admission master contact`);
  }
  q.push(`"${name}" admissions email official contact`);
  return q;
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
  const isIae = school.slug.startsWith("iae-");
  const queries = buildQueries(school, domain, cc);
  let best = null;

  for (const query of queries) {
    const html = await ddgSearch(query);
    if (!html) continue;
    for (const email of extractEmails(html)) {
      const score = scoreEmail(email, domain, isIae);
      if (score >= 50 && (!best || score > best.score)) {
        // Try to resolve a real official page containing the email
        let sourceUrl = school.website;
        const verifyPaths = ["/contact", "/admissions", "/admission", "/en/contact", "/fr/contact", "/nous-contacter"];
        let verifiedScore = score;
        for (const p of verifyPaths) {
          const page = await fetchPage(school.website.replace(/\/$/, "") + p);
          if (page && page.toLowerCase().includes(email)) {
            sourceUrl = school.website.replace(/\/$/, "") + p;
            verifiedScore += 10;
            break;
          }
        }
        best = { email, score: verifiedScore, sourceUrl, query };
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

  return {
    schoolSlug: school.slug,
    role: "admissions_officer",
    email: best.email,
    sourceUrl: best.sourceUrl,
    sourceType: "official_university_website",
    verificationDate: VERIFICATION_DATE,
    confidenceLevel: best.score >= 80 ? "High" : "Medium",
  };
}

function loadExistingContacts() {
  if (!fs.existsSync(OUT_PATH)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(OUT_PATH, "utf-8"));
    return Array.isArray(data.schoolContacts) ? data.schoolContacts : [];
  } catch {
    return [];
  }
}

function prioritizeFailed(failed) {
  const iae = failed.filter((s) => s.startsWith("iae-"));
  const uk = failed.filter((s) =>
    [
      "kcl", "bath", "alliance-manchester", "oxford-said", "edinburgh-bs", "cranfield", "birkbeck",
      "univ-sheffield", "univ-birmingham", "univ-bristol", "durham", "exeter", "univ-nottingham",
      "york", "qmul", "cardiff", "glasgow", "liverpool", "reading", "st-andrews", "lancaster",
      "aberdeen", "surrey", "sussex", "queens-belfast", "heriot-watt", "strathclyde", "newcastle",
      "dundee", "swansea", "royal-holloway", "open-university", "roehampton", "bayes-city", "uva",
    ].includes(s)
  );
  const be = failed.filter((s) =>
    ["solvay", "antwerp", "ku-leuven", "kuleuven", "uclouvain", "unamur", "umons", "lsm", "uliege", "hec-liege", "ghent", "buas"].includes(s)
  );
  const es = failed.filter((s) =>
    s.startsWith("univ-") && ["upf", "carlos-iii", "uam", "upm", "upc", "eada"].includes(s) === false
      ? false
      : ["upf", "carlos-iii", "uam", "univ-valencia", "univ-barcelona", "uned", "ucm", "univ-salamanca",
        "univ-zaragoza", "univ-granada", "univ-sevilla", "upm", "upc", "univ-murcia", "univ-santiago",
        "univ-vigo", "univ-oviedo", "univ-extremadura", "univ-cadiz", "univ-valladolid", "univ-leon",
        "univ-laguna", "univ-lleida", "univ-huelva", "univ-rioja", "univ-baleares", "univ-jaume-i",
        "univ-girona", "eada"].includes(s)
  );
  const frPublic = failed.filter((s) =>
    s.startsWith("univ-") ||
    s.startsWith("insa-") ||
    ["cnam", "paris-saclay", "paris-cite", "aix-marseille-univ", "univ-lille", "univ-toulouse-capitole",
      "centrale-lyon", "ponts-paristech", "ensae", "ensai", "centrale-nantes", "ensam", "utc",
      "inp-toulouse", "insp"].includes(s)
  );

  const seen = new Set();
  const ordered = [];
  for (const group of [iae, uk, be, es, frPublic]) {
    for (const s of group) {
      if (!seen.has(s)) {
        seen.add(s);
        ordered.push(s);
      }
    }
  }
  for (const s of failed) {
    if (!seen.has(s)) {
      seen.add(s);
      ordered.push(s);
    }
  }
  return ordered;
}

async function main() {
  const db = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  const countries = Object.fromEntries(db.countries.map((c) => [c.id, c.code]));
  const discovered = JSON.parse(fs.readFileSync(DISCOVERED_PATH, "utf-8"));
  const batch2 = fs.existsSync(BATCH2_PATH) ? JSON.parse(fs.readFileSync(BATCH2_PATH, "utf-8")) : { schoolContacts: [] };
  const batch2Slugs = new Set((batch2.schoolContacts || []).map((c) => c.schoolSlug));
  const foundSlugs = new Set((discovered.schoolContacts || []).map((c) => c.schoolSlug));
  const existing = loadExistingContacts();
  const existingSlugs = new Set(existing.map((c) => c.schoolSlug));

  const stillFailed = (discovered.failed || []).filter(
    (s) => !foundSlugs.has(s) && !batch2Slugs.has(s) && !existingSlugs.has(s)
  );
  const ordered = prioritizeFailed(stillFailed);

  const limit = parseInt(process.argv[2] || "100", 10);
  const offset = parseInt(process.argv[3] || "0", 10);
  const batch = ordered.slice(offset, offset + limit);
  const schoolBySlug = Object.fromEntries(db.schools.map((s) => [s.slug, s]));

  console.log(
    `Batch 3: ${batch.length} schools (offset ${offset}, ${stillFailed.length} remaining, ${existing.length} existing kept)`
  );

  const results = [...existing];
  const resultSlugs = new Set(existingSlugs);
  const unresolved = [];
  let newlyFound = 0;

  for (let i = 0; i < batch.length; i++) {
    const slug = batch[i];
    const school = schoolBySlug[slug];
    if (!school) {
      unresolved.push(slug);
      continue;
    }
    const cc = countries[school.countryId] || "??";
    process.stdout.write(`[${i + 1}/${batch.length}] ${slug} ... `);
    const result = await discoverSchool(school, cc);
    if (result) {
      if (!resultSlugs.has(slug)) {
        results.push(result);
        resultSlugs.add(slug);
        newlyFound++;
        console.log(`${result.email} (${result.confidenceLevel}) [new]`);
      } else {
        console.log(`${result.email} (skipped — existing kept)`);
      }
    } else {
      unresolved.push(slug);
      console.log("—");
    }

    if ((i + 1) % 5 === 0) {
      fs.writeFileSync(OUT_PATH, JSON.stringify({ schoolContacts: results }, null, 2) + "\n");
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify({ schoolContacts: results }, null, 2) + "\n");
  console.log(`\nExisting kept: ${existing.length}`);
  console.log(`Newly found this run: ${newlyFound} / ${batch.length}`);
  console.log(`Total in file: ${results.length}`);
  console.log(`Unresolved this batch: ${unresolved.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
