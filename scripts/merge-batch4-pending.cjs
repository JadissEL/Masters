#!/usr/bin/env node
/** Merge WebSearch-verified contacts that failed automated live fetch (PDF/JS pages). */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const DATE = "2026-07-12";
const verifiedPath = path.join(__dirname, "../data/verified-programs.json");

const PENDING = [
  {
    schoolSlug: "durham",
    email: "engineering.admissions@durham.ac.uk",
    sourceUrl: "https://www.durham.ac.uk/departments/academic/engineering/about-us/contact-us/",
    confidenceLevel: "High",
    role: "graduate_admissions",
    notes: "Engineering UG/PGT admissions; central PG also uses Ask Us form. WebSearch verified; live fetch failed.",
  },
  {
    schoolSlug: "univ-strasbourg",
    email: "dri-contact@unistra.fr",
    sourceUrl: "https://international-welcome.unistra.fr/apply-to-the-university-of-strasbourg/",
    confidenceLevel: "High",
    role: "admissions_officer",
    notes: "Direction des Relations Internationales. WebSearch verified; live fetch failed.",
  },
  {
    schoolSlug: "setu",
    email: "tpgadmissions.wd@setu.ie",
    sourceUrl: "https://www.setu.ie/study/postgraduate-study/postgrad-admissions",
    confidenceLevel: "High",
    role: "graduate_admissions",
    notes: "Taught PG Waterford; Carlow/Wexford: tpgadmissions.cw@setu.ie. WebSearch verified; live fetch failed.",
  },
  {
    schoolSlug: "univ-granada",
    email: "admisionmasteres@ugr.es",
    sourceUrl: "https://escuelaposgrado.ugr.es/pages/tablon/*/masteres/procedimiento-extraordinario-de-admision-a-masteres-para-cubrir-las-plazas-de-aquellos-masteres-universitarios-en-los-que-han-quedado-plazas-disponibles-2",
    confidenceLevel: "High",
    role: "graduate_admissions",
    notes: "Extraordinary master admission phase; general SAAP uses contact form. WebSearch verified; live fetch failed.",
  },
  {
    schoolSlug: "univ-la-rochelle",
    email: "michele.gauteron@univ-lr.fr",
    sourceUrl: "https://formations.univ-larochelle.fr/IMG/pdf/re_master_sgm_25-26_vf.pdf",
    confidenceLevel: "Medium",
    role: "admissions_officer",
    notes: "Master SGM secretariat PDF; general admissions via SEVE form. WebSearch verified; live fetch failed.",
  },
  {
    schoolSlug: "univ-picardie",
    email: "scolarite@u-picardie.fr",
    sourceUrl: "https://www.u-picardie.fr/formation/scolarite",
    confidenceLevel: "Medium",
    role: "admissions_officer",
    notes: "Central scolarité; UFR-specific desks also exist. WebSearch verified; live fetch failed.",
  },
  {
    schoolSlug: "esg",
    email: "admissions@esg.fr",
    sourceUrl: "https://www.esg.fr/admissions",
    confidenceLevel: "Medium",
    role: "admissions_officer",
    notes: "Also uses contact form on esg.fr. WebSearch verified; live fetch failed.",
  },
  {
    schoolSlug: "univ-lleida",
    email: "secretaria.academica@udl.cat",
    sourceUrl: "https://www.udl.cat/ca/estudis/masters_universitaris/",
    confidenceLevel: "Medium",
    role: "admissions_officer",
    notes: "Academic secretariat; decentralised by centre. WebSearch verified; live fetch failed.",
  },
  {
    schoolSlug: "univ-avignon",
    email: "scolarite@univ-avignon.fr",
    sourceUrl: "https://www.univ-avignon.fr/scolarite/",
    confidenceLevel: "Medium",
    role: "admissions_officer",
    notes: "Central scolarité; also ticket system on scola.univ-avignon.fr. WebSearch verified; live fetch failed.",
  },
  {
    schoolSlug: "iae-toulouse",
    email: "incoming@tsm-education.fr",
    sourceUrl: "https://tsm-education.fr/international/programmes-echange/mobilite-entrante",
    confidenceLevel: "High",
    role: "admissions_officer",
    notes: "TSM international relations bureau (IAE Toulouse → TSM); general admissions via contact form.",
  },
  {
    schoolSlug: "univ-evry",
    email: "fc@univ-evry.fr",
    sourceUrl: "https://www.univ-evry.fr/formation/comment-sinscrire/lyceen-ou-etudiant-etranger-jamais-inscrit-dans-lenseignement-superieur-en-france/ressortissant-de-lue/candidature-en-master.html",
    confidenceLevel: "Medium",
    role: "admissions_officer",
    notes: "Formation continue service; Mon Master for standard applications; faculty scolarité for programme queries.",
  },
];

const verified = JSON.parse(fs.readFileSync(verifiedPath, "utf-8"));
if (!verified.schoolContacts) verified.schoolContacts = [];

const bySlug = new Map(verified.schoolContacts.map((c) => [c.schoolSlug, c]));
let added = 0;

for (const c of PENDING) {
  if (bySlug.has(c.schoolSlug)) continue;
  const entry = {
    schoolSlug: c.schoolSlug,
    role: c.role || "admissions_officer",
    email: c.email,
    sourceUrl: c.sourceUrl,
    sourceType: "official_university_website",
    verificationDate: DATE,
    confidenceLevel: c.confidenceLevel,
    notes: c.notes,
  };
  bySlug.set(c.schoolSlug, entry);
  verified.schoolContacts.push(entry);
  added++;
}

verified.lastUpdated = DATE;
fs.writeFileSync(verifiedPath, JSON.stringify(verified, null, 2) + "\n");
console.log(`Merged ${added} pending contacts (${bySlug.size} unique slugs)`);

execSync("npm run phase-x", { cwd: path.join(__dirname, ".."), stdio: "inherit" });
