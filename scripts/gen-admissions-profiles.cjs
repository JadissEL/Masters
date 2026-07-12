#!/usr/bin/env node
/**
 * Generate school admissions profiles from verified data + official network portals.
 * Output: data/school-admissions-profiles.json
 */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "../data/masters-data.json");
const VERIFIED = path.join(__dirname, "../data/verified-programs.json");
const OUT = path.join(__dirname, "../data/school-admissions-profiles.json");

const db = JSON.parse(fs.readFileSync(DATA, "utf-8"));
const verified = JSON.parse(fs.readFileSync(VERIFIED, "utf-8"));

const schoolBySlug = Object.fromEntries(db.schools.map((s) => [s.slug, s]));
const profiles = [];
const seen = new Set();

function addProfile(p) {
  const key = p.schoolSlug || p.schoolSlugPattern;
  if (!key || seen.has(key)) return;
  seen.add(key);
  profiles.push({
    verificationDate: "2026-07-12",
    sourceType: p.sourceType || "official_university_website",
    confidenceLevel: p.confidenceLevel || "Medium",
    ...p,
  });
}

// ─── From verified programme entries (school-level dedupe) ───
const appBySchool = new Map();
const emailBySchool = new Map();
for (const vp of verified.programs) {
  if (vp.applicationUrl && !appBySchool.has(vp.schoolSlug)) {
    appBySchool.set(vp.schoolSlug, vp.applicationUrl);
  }
  if (vp.admissionsEmail && !emailBySchool.has(vp.schoolSlug)) {
    emailBySchool.set(vp.schoolSlug, vp.admissionsEmail);
  }
}
for (const [slug, url] of appBySchool) {
  addProfile({
    schoolSlug: slug,
    applicationUrl: url,
    sourceUrl: url,
    confidenceLevel: "High",
    notes: "From verified programme applicationUrl",
  });
}
for (const [slug, email] of emailBySchool) {
  const existing = profiles.find((p) => p.schoolSlug === slug);
  if (existing) {
    existing.admissionsEmail = email;
  } else {
    addProfile({
      schoolSlug: slug,
      admissionsEmail: email,
      sourceUrl: appBySchool.get(slug) || schoolBySlug[slug]?.website || "",
      confidenceLevel: "High",
      notes: "From verified programme admissionsEmail",
    });
  }
}

// ─── From verified schoolContacts ───
for (const sc of verified.schoolContacts || []) {
  if (!sc.email) continue;
  const existing = profiles.find((p) => p.schoolSlug === sc.schoolSlug);
  if (existing) {
    if (!existing.admissionsEmail) existing.admissionsEmail = sc.email;
  } else {
    addProfile({
      schoolSlug: sc.schoolSlug,
      admissionsEmail: sc.email,
      sourceUrl: sc.sourceUrl,
      confidenceLevel: sc.confidenceLevel || "High",
      notes: "From verified schoolContacts",
    });
  }
}

// ─── From verified schoolApplicationPortals ───
for (const ap of verified.schoolApplicationPortals || []) {
  const existing = profiles.find((p) => p.schoolSlug === ap.schoolSlug);
  if (existing) {
    if (!existing.applicationUrl) existing.applicationUrl = ap.applicationGuide || ap.applicationPortal;
    if (!existing.applicationPortal) existing.applicationPortal = ap.applicationPortal;
    if (!existing.applicationGuide) existing.applicationGuide = ap.applicationGuide;
  } else {
    addProfile({
      schoolSlug: ap.schoolSlug,
      applicationUrl: ap.applicationGuide || ap.applicationPortal,
      applicationPortal: ap.applicationPortal,
      applicationGuide: ap.applicationGuide,
      sourceUrl: ap.sourceUrl,
      confidenceLevel: "High",
    });
  }
}

// ─── Official network portals (country / institution type) ───
const networks = [
  {
    schoolSlugPattern: "^univ-|^cnam$",
    applicationUrl: "https://www.monmaster.gouv.fr",
    applicationPortal: "https://www.monmaster.gouv.fr",
    sourceUrl: "https://www.monmaster.gouv.fr",
    sourceType: "official_government_website",
    notes: "French national Master application platform (Mon Master)",
  },
  {
    schoolSlugPattern: "^iae-",
    applicationUrl: "https://www.iae-france.fr/en/how-to-apply",
    sourceUrl: "https://www.iae-france.fr/en/how-to-apply",
    sourceType: "official_university_website",
    notes: "IAE France network admissions guidance",
  },
  {
    schoolSlugPattern: "^cnam$",
    applicationUrl: "https://www.cnam.fr/admissions",
    sourceUrl: "https://www.cnam.fr/admissions",
    sourceType: "official_university_website",
  },
  {
    schoolSlugPattern: "^insa-|^utc$|^telecom-|^ensam$|^ensae$|^ensai$|^centrale-|^polytech-|^utbm$|^utt$|^imt-|^enseeiht$|^enseirb$|^enssat$|^ensait$|^ponts-paristech$",
    sourceUrl: "https://www.onisep.fr/",
    sourceType: "official_government_website",
    notes: "French CTI engineering schools: apply via official school admissions portal on school website.",
    confidenceLevel: "Medium",
    useSchoolWebsite: true,
  },
  {
    schoolSlug: "esiee-paris",
    applicationUrl: "https://www.esiee.fr/en/apply",
    sourceUrl: "https://www.esiee.fr/en/apply",
    sourceType: "official_university_website",
    confidenceLevel: "High",
  },
  {
    schoolSlug: "esilv",
    applicationUrl: "https://admissions.devinci.fr/ecole/ESILV",
    sourceUrl: "https://admissions.devinci.fr/ecole/ESILV",
    sourceType: "official_university_website",
    confidenceLevel: "High",
  },
  {
    schoolSlug: "epitech",
    applicationUrl: "https://www.epitech.eu/admission-master-of-science-ecole-informatique/",
    sourceUrl: "https://www.epitech.eu/admission-master-of-science-ecole-informatique/",
    sourceType: "official_university_website",
    confidenceLevel: "High",
  },
  {
    schoolSlugPattern: "^kuleuven$|^ku-leuven$",
    applicationUrl: "https://www.kuleuven.be/english/apply",
    sourceUrl: "https://www.kuleuven.be/english/apply",
    sourceType: "official_university_website",
  },
  {
    schoolSlugPattern: "^ghent$",
    applicationUrl: "https://www.ugent.be/en/education/degree-students/application-and-admission",
    sourceUrl: "https://www.ugent.be/en/education/degree-students/application-and-admission",
    sourceType: "official_university_website",
  },
  {
    schoolSlugPattern: "^antwerp$",
    applicationUrl: "https://www.uantwerpen.be/en/education/admission-enrolment/",
    sourceUrl: "https://www.uantwerpen.be/en/education/admission-enrolment/",
    sourceType: "official_university_website",
  },
  {
    schoolSlugPattern: "^umons$|^unamur$|^solvay$",
    applicationUrl: "https://www.unamur.be/en/education/admission",
    sourceUrl: "https://www.unamur.be/en/education/admission",
    sourceType: "official_university_website",
    notes: "Wallonia-Brussels Federation master admission",
  },
  {
    schoolSlugPattern: "^univ-barcelona$|^upf$|^carlos-iii$|^univ-salamanca$",
    sourceUrl: "https://www.universidad.es/en/study-in-spain/admission-process",
    sourceType: "official_government_website",
    notes: "Spanish public universities: apply via university admission office on official university website.",
    confidenceLevel: "Medium",
    useSchoolWebsite: true,
  },
  {
    schoolSlugPattern: "^ntnu$|^uit$|^uio$|^nhh$|^bi-oslo$",
    applicationUrl: "https://www.samordnaopptak.no/info/english/",
    sourceUrl: "https://www.samordnaopptak.no/info/english/",
    sourceType: "official_government_website",
    notes: "Norwegian coordinated admission (Søknadsweb)",
  },
  {
    schoolSlugPattern: "^cbs$|^ku$|^au$|^sdu$|^dtu$|^aalborg$|^roskilde$",
    applicationUrl: "https://www.optagelse.dk",
    sourceUrl: "https://www.optagelse.dk",
    sourceType: "official_government_website",
    notes: "Danish national application portal (optagelse.dk)",
  },
  {
    schoolSlugPattern: "^victoria-wellington$|^auckland$|^canterbury$|^otago$",
    applicationUrl: "https://www.studyinnewzealand.govt.nz/how-to-apply/",
    sourceUrl: "https://www.studyinnewzealand.govt.nz/how-to-apply/",
    sourceType: "official_government_website",
    notes: "Apply directly to NZ university; Study in NZ official guidance",
    confidenceLevel: "Medium",
  },
  {
    schoolSlugPattern: "^reykjavik$|^univ-iceland$",
    applicationUrl: "https://ugla.hi.is/namsumsoknir/",
    sourceUrl: "https://english.hi.is/admissions",
    sourceType: "official_university_website",
    notes: "University of Iceland Ugla portal",
  },
];

for (const n of networks) {
  addProfile(n);
}

// ─── Per-school from website (public FR/UK where no profile yet) ───
const websitePaths = {
  GB: ["/study/postgraduate/apply", "/postgraduate/apply", "/study/apply/postgraduate-taught/"],
  IE: ["/courses/postgraduate/how-to-apply/", "/apply/"],
  NL: ["/education/master/admission", "/en/education/application-enrolment-tuition-fees/application-masters/"],
};

const countryById = Object.fromEntries(db.countries.map((c) => [c.id, c]));

for (const school of db.schools) {
  if (seen.has(school.slug)) continue;
  const country = countryById[school.countryId];
  if (!country || !school.website) continue;

  let base = school.website.replace(/\/$/, "");
  const paths = websitePaths[country.code];
  if (paths) {
    addProfile({
      schoolSlug: school.slug,
      applicationUrl: base + paths[0],
      sourceUrl: base + paths[0],
      confidenceLevel: "Low",
      notes: `Derived from official website domain + common ${country.code} admissions path; verify on school site`,
    });
    continue;
  }

  // French private business schools — admissions section on official site
  if (country.code === "FR" && school.type === "Private") {
    addProfile({
      schoolSlug: school.slug,
      applicationUrl: base + "/en/admissions",
      sourceUrl: base,
      confidenceLevel: "Low",
      notes: "French private school: admissions path on official website",
    });
  }
}

const out = {
  generatedAt: new Date().toISOString().slice(0, 10),
  schoolProfiles: profiles.filter((p) => p.schoolSlug),
  networkProfiles: profiles.filter((p) => p.schoolSlugPattern),
};

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(
  "Wrote",
  OUT,
  "—",
  out.schoolProfiles.length,
  "school profiles,",
  out.networkProfiles.length,
  "network profiles"
);
