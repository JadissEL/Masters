#!/usr/bin/env node
/**
 * Batch 4: discover official admissions emails for schools missing from verified-programs.json
 */
const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../data/masters-data.json");
const VERIFIED_PATH = path.join(__dirname, "../data/verified-programs.json");
const OUT_PATH = path.join(__dirname, "../data/batch-admissions-contacts-4.json");

const VERIFICATION_DATE = "2026-07-12";
const FETCH_TIMEOUT = 12000;
const DELAY_MS = 120;

const PRIORITY_CC = ["GB", "FR", "NL", "ES", "NO", "DK", "BE", "IE"];

const ADMISSION_PATHS = {
  default: ["/study/postgraduate/contact", "/postgraduate/contact", "/en/admissions", "/admissions", "/contact", "/en/contact", "/contact-us"],
  FR: ["/fr/admissions", "/admissions", "/nous-contacter", "/contact", "/scolarite", "/fr/scolarite", "/international/admissions", "/formation/master/admission"],
  GB: ["/study/postgraduate/contact", "/postgraduate/contact", "/study/postgraduate/apply/contact", "/study/admissions/contact", "/admissions", "/contact", "/about/contact"],
  NL: ["/en/education/admission", "/en/education/more-about/admission-and-application", "/en/contact", "/education/master/admission"],
  ES: ["/admision", "/estudiantes/admision", "/contacto", "/en/admissions", "/en/contact"],
  BE: ["/en/admission", "/en/admissions", "/en/contact", "/admission"],
  NO: ["/en/admission", "/en/study/admission", "/contact"],
  DK: ["/en/study/admission", "/en/study/admissions", "/en/contact"],
  IE: ["/courses/postgraduate/how-to-apply", "/contact", "/admissions"],
};

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function domainFromWebsite(website) {
  try {
    return new URL(website.startsWith("http") ? website : `https://${website}`).hostname.replace(/^www\./, "");
  } catch { return null; }
}

function scoreEmail(email, domain) {
  const lower = email.toLowerCase();
  const host = lower.split("@")[1];
  if (!host) return -1;
  if (/webmaster|postmaster|noreply|newsletter|marketing|privacy|dpo@|presse@|w3\.org|example\.com/i.test(lower)) return -1;
  if (/^(admin|support|helpdesk|hr@|jobs@|library|alumni|media|communication)@/i.test(lower)) return -1;

  let score = 0;
  if (/admission/i.test(lower)) score += 90;
  if (/masters?|graduate|postgraduate|pg\.?admissions?/i.test(lower)) score += 40;
  if (/scolarite|international\.admission|admision/i.test(lower)) score += 50;
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
  for (const m of text.match(/mailto:([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi) || []) {
    set.add(m.replace(/^mailto:/i, "").split("?")[0].toLowerCase());
  }
  for (const e of text.match(EMAIL_RE) || []) set.add(e.toLowerCase());
  return [...set];
}

async function fetchPage(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "MastersFinder/1.0", Accept: "text/html" },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/html") && !ct.includes("text/plain")) return null;
    return (await res.text()).slice(0, 500000);
  } catch { return null; }
  finally { clearTimeout(timer); }
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
  } catch { return ""; }
}

function buildQueries(school, domain, cc) {
  const q = [];
  if (domain) {
    q.push(`site:${domain} ("admissions@" OR "admission@" OR "graduate.admissions@")`);
    q.push(`site:${domain} ("masters@" OR "pgadmissions@" OR "postgraduate@" OR "study@")`);
    if (cc === "FR") q.push(`site:${domain} ("scolarite@" OR "international-contact@" OR "admission@")`);
    if (cc === "GB") q.push(`site:${domain} ("pgadmissions@" OR "enquiries@" OR "ask@") postgraduate`);
    if (cc === "NL") q.push(`site:${domain} ("masters@" OR "admission@" OR "info@")`);
    if (cc === "ES") q.push(`site:${domain} ("admision@" OR "secretaria@" OR "info@") master`);
    q.push(`site:${domain} mailto admission master`);
  }
  return q;
}

async function crawlSchool(school, cc) {
  const base = (school.website || "").replace(/\/$/, "");
  if (!base) return null;
  const domain = domainFromWebsite(base);
  const paths = [...new Set([...(ADMISSION_PATHS[cc] || []), ...ADMISSION_PATHS.default])];
  let best = null;

  for (const p of paths) {
    const url = base + p;
    const html = await fetchPage(url);
    if (!html) continue;
    for (const email of extractEmails(html)) {
      const score = scoreEmail(email, domain);
      if (score >= 35 && (!best || score > best.score)) best = { email, score, sourceUrl: url };
    }
    if (best && best.score >= 90) break;
    await sleep(DELAY_MS);
  }

  if (!best || best.score < 50) {
    const html = await fetchPage(base);
    if (html) {
      for (const email of extractEmails(html)) {
        const score = scoreEmail(email, domain);
        if (score >= 45 && (!best || score > best.score)) best = { email, score, sourceUrl: base };
      }
    }
  }
  return best;
}

async function searchSchool(school, cc) {
  const domain = domainFromWebsite(school.website);
  let best = null;
  for (const query of buildQueries(school, domain, cc)) {
    const html = await ddgSearch(query);
    for (const email of extractEmails(html)) {
      const score = scoreEmail(email, domain);
      if (score >= 50 && (!best || score > best.score)) {
        best = { email, score, sourceUrl: null, query };
      }
    }
    if (best && best.score >= 85) break;
    await sleep(800);
  }

  // Verify email appears on official domain page
  if (best && domain) {
    const verifyHtml = await ddgSearch(`site:${domain} "${best.email}"`);
    const urls = [...verifyHtml.matchAll(/uddg=([^&"]+)/g)].map((m) => {
      try { return decodeURIComponent(m[1]); } catch { return null; }
    }).filter(Boolean).slice(0, 3);

    for (const pageUrl of urls) {
      if (!pageUrl.includes(domain)) continue;
      const html = await fetchPage(pageUrl);
      if (html && html.toLowerCase().includes(best.email)) {
        best.sourceUrl = pageUrl;
        break;
      }
    }
    if (!best.sourceUrl) {
      for (const p of ["/contact", "/admissions", "/en/contact"]) {
        const url = `https://${domain}${p}`;
        const html = await fetchPage(url);
        if (html && html.toLowerCase().includes(best.email)) {
          best.sourceUrl = url;
          break;
        }
      }
    }
  }

  if (!best || !best.sourceUrl) return null;
  return best;
}

async function discoverSchool(school, cc) {
  let best = await crawlSchool(school, cc);
  if (!best || best.score < 70) {
    const searched = await searchSchool(school, cc);
    if (searched && (!best || searched.score > best.score)) best = searched;
  }
  if (!best || best.score < 35) return null;

  return {
    schoolSlug: school.slug,
    role: /graduate|pg/i.test(best.email) ? "graduate_admissions" : "admissions_officer",
    email: best.email,
    sourceUrl: best.sourceUrl,
    sourceType: "official_university_website",
    verificationDate: VERIFICATION_DATE,
    confidenceLevel: best.score >= 80 ? "High" : "Medium",
    notes: best.query ? `Web search verified on official page (score ${best.score})` : `Page crawl (score ${best.score})`,
  };
}

async function main() {
  const db = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  const verified = JSON.parse(fs.readFileSync(VERIFIED_PATH, "utf-8"));
  const countries = Object.fromEntries(db.countries.map((c) => [c.id, c.code]));
  const have = new Set((verified.schoolContacts || []).map((c) => c.schoolSlug));

  let missing = db.schools.filter((s) => !have.has(s.slug));
  missing.sort((a, b) => {
    const pa = PRIORITY_CC.indexOf(countries[a.countryId] || "");
    const pb = PRIORITY_CC.indexOf(countries[b.countryId] || "");
    const sa = pa === -1 ? 99 : pa;
    const sb = pb === -1 ? 99 : pb;
    return sa - sb;
  });

  const limit = parseInt(process.argv[2] || "100", 10);
  const offset = parseInt(process.argv[3] || "0", 10);
  const batch = missing.slice(offset, offset + limit);

  console.log(`Batch 4: ${batch.length} schools (offset ${offset}, ${missing.length} total missing)`);

  const results = [];
  const skipped = [];

  for (let i = 0; i < batch.length; i++) {
    const school = batch[i];
    const cc = countries[school.countryId] || "??";
    process.stdout.write(`[${i + 1}/${batch.length}] ${school.slug} ... `);
    const result = await discoverSchool(school, cc);
    if (result) {
      results.push(result);
      console.log(`${result.email} (${result.confidenceLevel})`);
    } else {
      skipped.push(school.slug);
      console.log("SKIP (form-only / no email)");
    }

    if ((i + 1) % 5 === 0) {
      fs.writeFileSync(OUT_PATH, JSON.stringify({ schoolContacts: results, skippedFormOnly: skipped, lastRun: new Date().toISOString() }, null, 2) + "\n");
    }
  }

  const out = { schoolContacts: results, skippedFormOnly: skipped, lastRun: new Date().toISOString(), stats: { found: results.length, skipped: skipped.length } };
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nDone: ${results.length} found, ${skipped.length} skipped`);
}

main().catch((e) => { console.error(e); process.exit(1); });
