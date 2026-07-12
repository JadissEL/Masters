#!/usr/bin/env node
/** Finalize batch-4: WebSearch-verified contacts NOT in verified-programs.json */
const fs = require("fs");
const path = require("path");

const VERIFIED = path.join(__dirname, "../data/verified-programs.json");
const OUT = path.join(__dirname, "../data/batch-admissions-contacts-4.json");
const DATE = "2026-07-12";

// Each entry: WebSearch-confirmed on official university website/PDF
const CURATED = [
  { schoolSlug: "tue", email: "io@tue.nl", sourceUrl: "https://www.tue.nl/en/education/become-a-tue-student/admission-and-enrollment/programtype/master-program/program/mechanical-engineering/country/india", confidenceLevel: "High", role: "admissions_officer", notes: "International Office for master OSIRIS/application queries" },
  { schoolSlug: "univ-barcelona", email: "info@ub.edu", sourceUrl: "https://www.ub.edu/masters-industria-farmaceutica/ca/contacte/", confidenceLevel: "Medium", role: "admissions_officer", notes: "General UB contact; masters use faculty secretariats" },
  { schoolSlug: "univ-valencia", email: "infosecundaria@uv.es", sourceUrl: "https://www.uv.es/uvweb/universidad/es/admision-1286131300323.html", confidenceLevel: "Medium", role: "admissions_officer", notes: "Faculty of Education admissions; general PG uses Atención y Consultas form" },
  { schoolSlug: "durham", email: "engineering.admissions@durham.ac.uk", sourceUrl: "https://www.durham.ac.uk/departments/academic/engineering/about-us/contact-us/", confidenceLevel: "High", role: "graduate_admissions", notes: "Published UG/PGT admissions contact; central PG also uses Ask Us form" },
  { schoolSlug: "univ-strasbourg", email: "dri-contact@unistra.fr", sourceUrl: "https://international-welcome.unistra.fr/apply-to-the-university-of-strasbourg/", confidenceLevel: "High", role: "admissions_officer", notes: "Direction des Relations Internationales; faculty-specific contacts for programmes" },
  { schoolSlug: "excelia", email: "globalexchange@excelia-group.com", sourceUrl: "https://www.excelia-group.com/sites/excelia-group.fr/files/2026-04/EXCELIA_FACT%20SHEET%20EN%202026-2027.pdf", confidenceLevel: "High", role: "admissions_officer", notes: "International Admissions Office (official fact sheet PDF)" },
  { schoolSlug: "setu", email: "tpgadmissions.wd@setu.ie", sourceUrl: "https://www.setu.ie/study/postgraduate-study/postgrad-admissions", confidenceLevel: "High", role: "graduate_admissions", notes: "Taught PG Waterford; Carlow/Wexford: tpgadmissions.cw@setu.ie" },
  { schoolSlug: "univ-granada", email: "admisionmasteres@ugr.es", sourceUrl: "https://escuelaposgrado.ugr.es/pages/tablon/*/masteres/procedimiento-extraordinario-de-admision-a-masteres-para-cubrir-las-plazas-de-aquellos-masteres-universitarios-en-los-que-han-quedado-plazas-disponibles-2", confidenceLevel: "High", role: "graduate_admissions", notes: "Official masters extraordinary admission phase; general SAAP uses contact form" },
  { schoolSlug: "upc", email: "admissions.masters.camins@upc.edu", sourceUrl: "https://camins.upc.edu/en/Studies/academic-procedures/contact-siae-camins", confidenceLevel: "High", role: "admissions_officer", notes: "Barcelona School of Civil Engineering masters admissions; UPC is decentralised by school" },
  { schoolSlug: "univ-st-etienne", email: "master.MLDM@univ-st-etienne.fr", sourceUrl: "https://mldm.univ-st-etienne.fr/admission.php", confidenceLevel: "High", role: "admissions_officer", notes: "MLDM master admissions; other masters use Mon Master / eCandidat" },
  { schoolSlug: "univ-la-rochelle", email: "michele.gauteron@univ-lr.fr", sourceUrl: "https://formations.univ-larochelle.fr/IMG/pdf/re_master_sgm_25-26_vf.pdf", confidenceLevel: "Medium", role: "admissions_officer", notes: "Master SGM secretariat; general admissions via SEVE contact form (05 46 45 82 44)" },
  { schoolSlug: "univ-picardie", email: "scolarite@u-picardie.fr", sourceUrl: "https://www.u-picardie.fr/formation/scolarite", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "esg", email: "admissions@esg.fr", sourceUrl: "https://www.esg.fr/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "univ-lleida", email: "secretaria.academica@udl.cat", sourceUrl: "https://www.udl.cat/ca/estudis/masters_universitaris/", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "univ-avignon", email: "scolarite@univ-avignon.fr", sourceUrl: "https://www.univ-avignon.fr/scolarite/", confidenceLevel: "Medium", role: "admissions_officer" },
];

const FORM_ONLY = [
  "open-university", "birkbeck", "univ-nottingham", "qmul", "dundee", "uib",
  "univ-paris8", "univ-evry", "univ-corse", "univ-nimes", "iae-toulouse",
  "oslo-met", "nord-university", "univ-agder", "university-of-iceland", "hi",
  "reykjavik-university", "canterbury", "lincoln", "victoria-wellington",
  "univ-sorbonne-paris-nord", "aut", "otago", "waikato", "massey",
];

async function verify(entry) {
  try {
    const res = await fetch(entry.sourceUrl, {
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "MastersFinder/1.0", Accept: "text/html,application/pdf" },
      redirect: "follow",
    });
    if (!res.ok) return false;
    const text = (await res.text()).slice(0, 400000).toLowerCase();
    const e = entry.email.toLowerCase();
    return text.includes(e) || text.includes(e.split("@")[0] + "@");
  } catch {
    return false;
  }
}

async function main() {
  const verified = JSON.parse(fs.readFileSync(VERIFIED, "utf-8"));
  const have = new Set((verified.schoolContacts || []).map((c) => c.schoolSlug));

  const candidates = CURATED.filter((c) => !have.has(c.schoolSlug));
  const schoolContacts = [];
  const failed = [];

  for (const c of candidates) {
    process.stdout.write(`${c.schoolSlug} ... `);
    const ok = await verify(c);
    if (ok) {
      schoolContacts.push({
        schoolSlug: c.schoolSlug,
        role: c.role || "admissions_officer",
        email: c.email,
        sourceUrl: c.sourceUrl,
        sourceType: "official_university_website",
        verificationDate: DATE,
        confidenceLevel: c.confidenceLevel,
        ...(c.notes ? { notes: c.notes } : {}),
      });
      console.log("OK");
    } else {
      failed.push(c);
      console.log("SKIP");
    }
  }

  const skippedFormOnly = FORM_ONLY.filter((s) => !have.has(s.schoolSlug) && !schoolContacts.some((c) => c.schoolSlug === s));

  const out = {
    batchNotes: "Batch 4: official admissions emails for schools not yet in verified-programs.json schoolContacts (WebSearch + page verification, 2026-07-12)",
    verificationDate: DATE,
    schoolContacts,
    skippedFormOnly,
    failedVerification: failed.map((f) => ({ schoolSlug: f.schoolSlug, email: f.email, sourceUrl: f.sourceUrl })),
    stats: {
      added: schoolContacts.length,
      skippedFormOnly: skippedFormOnly.length,
      failedVerify: failed.length,
      highConfidence: schoolContacts.filter((c) => c.confidenceLevel === "High").length,
      verifiedProgramsCoverageBeforeBatch: have.size,
      schoolsTotal: 323,
    },
  };

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nBatch 4: ${schoolContacts.length} new contacts written`);
}

main().catch((e) => { console.error(e); process.exit(1); });
