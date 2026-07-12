#!/usr/bin/env node
/** Fast crawl-only discovery for schools missing from verified-programs.json */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "../data/masters-data.json");
const VERIFIED = path.join(__dirname, "../data/verified-programs.json");
const OUT = path.join(__dirname, "../data/batch-admissions-contacts-4.json");
const DATE = "2026-07-12";
const TIMEOUT = 10000;
const CONC = 6;

const PATHS = {
  default: ["/study/postgraduate/contact", "/postgraduate/contact", "/admissions", "/contact", "/en/contact", "/en/admissions"],
  FR: ["/fr/admissions", "/admissions", "/contact", "/nous-contacter", "/scolarite", "/international/admissions", "/formation/master/admission"],
  GB: ["/study/postgraduate/contact", "/postgraduate/contact", "/admissions", "/contact", "/about/contact"],
  NL: ["/en/education/admission", "/en/contact", "/en/education/more-about/admission-and-application"],
  ES: ["/admision", "/contacto", "/en/admissions", "/en/contact"],
  BE: ["/en/admission", "/en/contact", "/admission"],
  NO: ["/en/admission", "/en/study/admission", "/contact"],
  DK: ["/en/study/admission", "/en/contact"],
  IE: ["/courses/postgraduate/how-to-apply", "/contact", "/admissions"],
  NZ: ["/en/study/applications-and-admissions", "/study/apply", "/contact"],
  IS: ["/en/admissions", "/en/contact"],
};

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const SKIP = /webmaster|postmaster|noreply|newsletter|marketing|privacy|dpo@|presse@|accommodation@|housing@|library@|alumni@|press@|media@|hr@|jobs@|career@|communications@/i;
const PRI = ["GB", "FR", "NL", "ES", "NO", "DK", "BE", "IE", "NZ", "IS"];

function domain(url) {
  try { return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, ""); } catch { return null; }
}

function score(email, dom) {
  const l = email.toLowerCase();
  const h = l.split("@")[1];
  if (!h || SKIP.test(l)) return -1;
  let s = 0;
  if (/admission/i.test(l)) s += 90;
  if (/masters?|graduate|postgraduate|pg[-.]?ad/i.test(l)) s += 45;
  if (/scolarite|international\.admission|admision/i.test(l)) s += 50;
  if (/enquir|study@|ask@/i.test(l)) s += 35;
  if (/^info@/.test(l)) s += 22;
  if (dom && (h === dom || h.endsWith(`.${dom}`))) s += 35;
  else if (dom && h.includes(dom.split(".")[0])) s += 12;
  else s -= 30;
  return s;
}

function emails(html) {
  const set = new Set();
  for (const m of html.match(/mailto:([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi) || [])
    set.add(m.replace(/^mailto:/i, "").split("?")[0].toLowerCase());
  for (const e of html.match(EMAIL_RE) || []) set.add(e.toLowerCase());
  return [...set];
}

async function fetch(url) {
  try {
    const r = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT),
      headers: { "User-Agent": "MastersFinder/1.0", Accept: "text/html" },
      redirect: "follow",
    });
    if (!r.ok) return null;
    const ct = r.headers.get("content-type") || "";
    if (!ct.includes("text/html") && !ct.includes("text/plain")) return null;
    return (await r.text()).slice(0, 400000);
  } catch { return null; }
}

async function discover(school, cc) {
  const base = (school.website || "").replace(/\/$/, "");
  if (!base) return null;
  const dom = domain(base);
  const paths = [...new Set([...(PATHS[cc] || []), ...PATHS.default])];
  let best = null;
  for (const p of paths) {
    const url = base + p;
    const html = await fetch(url);
    if (!html) continue;
    for (const e of emails(html)) {
      const sc = score(e, dom);
      if (sc >= 40 && (!best || sc > best.score)) best = { email: e, score: sc, sourceUrl: url };
    }
    if (best?.score >= 95) break;
  }
  if (!best || best.score < 45) return null;
  return {
    schoolSlug: school.slug,
    role: /graduate|pg/i.test(best.email) ? "graduate_admissions" : "admissions_officer",
    email: best.email,
    sourceUrl: best.sourceUrl,
    sourceType: "official_university_website",
    verificationDate: DATE,
    confidenceLevel: best.score >= 80 ? "High" : "Medium",
    notes: `Page crawl score ${best.score}`,
  };
}

async function main() {
  const db = JSON.parse(fs.readFileSync(DATA, "utf-8"));
  const verified = JSON.parse(fs.readFileSync(VERIFIED, "utf-8"));
  const ccMap = Object.fromEntries(db.countries.map((c) => [c.id, c.code]));
  const have = new Set((verified.schoolContacts || []).map((c) => c.schoolSlug));

  let missing = db.schools.filter((s) => !have.has(s.slug));
  missing.sort((a, b) => {
    const pa = PRI.indexOf(ccMap[a.countryId] || "");
    const pb = PRI.indexOf(ccMap[b.countryId] || "");
    return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
  });

  const limit = parseInt(process.argv[2] || "159", 10);
  const batch = missing.slice(0, limit);
  console.log(`Crawling ${batch.length} missing schools (concurrency ${CONC})...`);

  const found = [];
  const skipped = [];

  for (let i = 0; i < batch.length; i += CONC) {
    const chunk = batch.slice(i, i + CONC);
    const results = await Promise.all(
      chunk.map(async (s) => {
        const cc = ccMap[s.countryId] || "??";
        const r = await discover(s, cc);
        return { s, r };
      })
    );
    for (const { s, r } of results) {
      if (r) { found.push(r); console.log(`+ ${s.slug}: ${r.email} (${r.confidenceLevel})`); }
      else { skipped.push(s.slug); console.log(`- ${s.slug}`); }
    }
    fs.writeFileSync(OUT, JSON.stringify({ schoolContacts: found, skippedFormOnly: skipped, lastRun: new Date().toISOString(), stats: { found: found.length, skipped: skipped.length } }, null, 2) + "\n");
  }
  console.log(`\nDone: ${found.length} found, ${skipped.length} skipped`);
}

main().catch((e) => { console.error(e); process.exit(1); });
