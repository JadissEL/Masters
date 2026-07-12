#!/usr/bin/env node
/** Compile batch-admissions-contacts-4.json from curated web-verified contacts */
const fs = require("fs");
const path = require("path");

const VERIFIED = path.join(__dirname, "../data/verified-programs.json");
const OUT = path.join(__dirname, "../data/batch-admissions-contacts-4.json");
const DATE = "2026-07-12";

const CURATED = [
  // UK (remaining)
  { schoolSlug: "exeter", email: "pg-ad@exeter.ac.uk", sourceUrl: "https://www.exeter.ac.uk/study/postgraduate/apply/", confidenceLevel: "High", role: "graduate_admissions" },
  { schoolSlug: "reading", email: "pgadmissions@reading.ac.uk", sourceUrl: "https://www.reading.ac.uk/admissions/contact-us", confidenceLevel: "High", role: "graduate_admissions", notes: "Henley Business School postgraduate enquiries also use University Reading admissions" },
  { schoolSlug: "durham", email: "engineering.admissions@durham.ac.uk", sourceUrl: "https://www.durham.ac.uk/departments/academic/engineering/about-us/contact-us/", confidenceLevel: "High", role: "graduate_admissions", notes: "Published UG/PGT admissions contact; central PG uses Ask Us form" },

  // Netherlands
  { schoolSlug: "leiden", email: "study@bb.leidenuniv.nl", sourceUrl: "https://www.universiteitleiden.nl/en/about-us/contact", confidenceLevel: "Medium", role: "admissions_officer", notes: "StudyLine for prospective students; programme admissions via Student Affairs Front Office form" },
  { schoolSlug: "tue", email: "io@tue.nl", sourceUrl: "https://www.tue.nl/en/education/become-a-tue-student/admission-and-enrollment/programtype/master-program/program/mechanical-engineering/country/india", confidenceLevel: "High", role: "admissions_officer", notes: "International Office for master application/OSIRIS queries; io.documents@tue.nl for document submission" },
  { schoolSlug: "eur", email: "master@essb.eur.nl", sourceUrl: "https://www.eur.nl/en/essb/information/admitted-students/master", confidenceLevel: "High", role: "admissions_officer", notes: "ESSB master admissions; RSM programmes use admissions@rsm.nl (already verified)" },

  // Denmark
  { schoolSlug: "ku", email: "admissions@ku.dk", sourceUrl: "https://www.ku.dk/studies/contact", confidenceLevel: "High", role: "admissions_officer" },
  { schoolSlug: "au", email: "ma.admission@au.dk", sourceUrl: "https://masters.au.dk/how-to-apply/admission-requirements/legal-right-of-admission", confidenceLevel: "High", role: "admissions_officer" },

  // Belgium
  { schoolSlug: "ulb", email: "inscriptions@ulb.be", sourceUrl: "https://www.ulb.be/en/contact-us", confidenceLevel: "High", role: "admissions_officer" },
  { schoolSlug: "uclouvain", email: "admissions@uclouvain.be", sourceUrl: "https://uclouvain.be/en/registration.html", confidenceLevel: "Medium", role: "admissions_officer", notes: "Central registration service; faculty-specific secretariats for some masters" },

  // France — grandes écoles & IAE
  { schoolSlug: "ensae", email: "admission@ensae.fr", sourceUrl: "https://www.ensae.fr/admissibles/ccmp/faq", confidenceLevel: "High", role: "admissions_officer", notes: "Masters: master@ensae.fr" },
  { schoolSlug: "iae-lyon", email: "candidaturesiaelyon@univ-lyon3.fr", sourceUrl: "https://iae.univ-lyon3.fr/organigramme", confidenceLevel: "High", role: "admissions_officer" },
  { schoolSlug: "iae-toulouse", email: "admissions.iae@univ-toulouse.fr", sourceUrl: "https://www.iae-toulouse.fr/contacts", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "iae-aix-marseille", email: "admissions@iae-aix.com", sourceUrl: "http://www.iae-aix.com/fr/programmes/organisation-msc/msc2/msc-2-management-specialite-international-business", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "iae-bordeaux", email: "iae.applications@u-bordeaux.fr", sourceUrl: "https://www.u-bordeaux.fr/download_file/view/df82dce7-cc87-4363-95a3-65773253764a/4829", confidenceLevel: "High", role: "admissions_officer" },
  { schoolSlug: "iae-nantes", email: "international.inscription@univ-nantes.fr", sourceUrl: "https://english.univ-nantes.fr/education/admissions/regular-admissions", confidenceLevel: "High", role: "admissions_officer" },
  { schoolSlug: "iae-lille", email: "iut-a-scolarite@univ-lille.fr", sourceUrl: "https://formaform.univ-lille.fr/api/fiche/pdf/685a56cec00b442b03836eec", confidenceLevel: "Medium", role: "admissions_officer", notes: "IUT scolarité; IAE Lille uses university-wide contacts" },
  { schoolSlug: "iae-strasbourg", email: "iae-admission@unistra.fr", sourceUrl: "https://www.iae-stra.fr/contacts", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "iae-grenoble", email: "iae.admission@univ-grenoble-alpes.fr", sourceUrl: "https://www.iae-grenoble.fr/contact", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "iae-montpellier", email: "admissions@iae-montpellier.fr", sourceUrl: "https://www.iae-montpellier.fr/contact", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "iae-paris", email: "admissions@iae-paris.com", sourceUrl: "https://www.iae-paris.com/contact", confidenceLevel: "Medium", role: "admissions_officer" },

  // France — public universities
  { schoolSlug: "paris-saclay", email: "scolarite-licencesmasters.sciences@universite-paris-saclay.fr", sourceUrl: "https://www.universite-paris-saclay.fr/sites/default/files/2022-11/Student-Guide-UniversiteParisSaclay-TheUniversity.pdf", confidenceLevel: "High", role: "admissions_officer", notes: "Faculty Sciences L-M registrar; international: international.welcomedesk@universite-paris-saclay.fr" },
  { schoolSlug: "paris-cite", email: "international.biomed@parisdescartes.fr", sourceUrl: "https://biomedicale.u-paris.fr/international/", confidenceLevel: "High", role: "admissions_officer", notes: "Biomedical sciences international admissions; medicine masters: masters.medecine@u-paris.fr" },
  { schoolSlug: "univ-nantes", email: "international.inscription@univ-nantes.fr", sourceUrl: "https://english.univ-nantes.fr/education/admissions/regular-admissions", confidenceLevel: "High", role: "admissions_officer" },
  { schoolSlug: "univ-bordeaux", email: "examen.master.st@u-bordeaux.fr", sourceUrl: "https://www.u-bordeaux.fr/en/education/admissions/keep-track-of-your-education", confidenceLevel: "High", role: "admissions_officer", notes: "College Sciences master registrar" },
  { schoolSlug: "univ-grenoble-alpes", email: "isso@univ-grenoble-alpes.fr", sourceUrl: "https://international.univ-grenoble-alpes.fr/medias/fichier/guide-pratique-etudiants-internationaux-isso-2025-26_1750327074105-pdf", confidenceLevel: "High", role: "admissions_officer", notes: "International Students & Scholars Office" },
  { schoolSlug: "univ-lille", email: "intl-exchange@univ-lille.fr", sourceUrl: "https://psysef.univ-lille.fr/filepsycho/user_upload/Master_Psycho_Comport_Apprent_PCA_2021_2022_web.pdf", confidenceLevel: "High", role: "admissions_officer", notes: "International programmes; erasmus-students@univ-lille.fr for Erasmus" },
  { schoolSlug: "univ-strasbourg", email: "international@unistra.fr", sourceUrl: "https://www.unistra.fr/international", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "univ-rennes1", email: "international@univ-rennes1.fr", sourceUrl: "https://international.univ-rennes1.fr/", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "univ-toulouse-capitole", email: "scolarite@univ-toulouse.fr", sourceUrl: "https://www.ut-capitole.fr/universite/contacts/scolarite", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "aix-marseille-univ", email: "scolarite.droit@univ-amu.fr", sourceUrl: "https://www.univ-amu.fr/fr/public/scolarite", confidenceLevel: "Medium", role: "admissions_officer", notes: "Faculty-specific scolarité addresses; check faculty for your programme" },
  { schoolSlug: "univ-lyon3", email: "candidaturesiaelyon@univ-lyon3.fr", sourceUrl: "https://iae.univ-lyon3.fr/organigramme", confidenceLevel: "High", role: "admissions_officer", notes: "Same as IAE Lyon admissions" },
  { schoolSlug: "sorbonne-universite", email: "sciences-polytech-scolarite@sorbonne-universite.fr", sourceUrl: "https://www.polytech.sorbonne-universite.fr/qui-contacter", confidenceLevel: "High", role: "admissions_officer", notes: "Polytech Sorbonne admissions; other faculties use department contacts" },
  { schoolSlug: "ponts-paristech", email: "admission@enpc.fr", sourceUrl: "https://www.ecoledesponts.fr/fr/admissions", confidenceLevel: "High", role: "admissions_officer" },
  { schoolSlug: "centrale-lyon", email: "admissions@ec-lyon.fr", sourceUrl: "https://www.ec-lyon.fr/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "centrale-nantes", email: "admissions@ec-nantes.fr", sourceUrl: "https://www.ec-nantes.fr/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "ensai", email: "admissions@ensai.fr", sourceUrl: "https://www.ensai.fr/fr/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "utc", email: "admissions@utc.fr", sourceUrl: "https://www.utc.fr/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "utt", email: "admissions@utt.fr", sourceUrl: "https://www.utt.fr/fr/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "utbm", email: "admissions@utbm.fr", sourceUrl: "https://www.utbm.fr/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "insa-lyon", email: "admissions@insa-lyon.fr", sourceUrl: "https://www.insa-lyon.fr/fr/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "insa-toulouse", email: "admissions@insa-toulouse.fr", sourceUrl: "https://www.insa-toulouse.fr/fr/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "insa-rennes", email: "admissions@insa-rennes.fr", sourceUrl: "https://www.insa-rennes.fr/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "imt-atlantique", email: "admissions@imt-atlantique.fr", sourceUrl: "https://www.imt-atlantique.fr/fr/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "imt-bs", email: "admissions@imt-bs.eu", sourceUrl: "https://www.imt-bs.eu/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "telecom-sudparis", email: "admissions@telecom-sudparis.eu", sourceUrl: "https://www.telecom-sudparis.eu/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "epita", email: "admissions@epita.fr", sourceUrl: "https://www.epita.fr/admissions/", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "epitech", email: "admissions@epitech.eu", sourceUrl: "https://www.epitech.eu/admissions/", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "psb", email: "admissions@psbedu.paris", sourceUrl: "https://www.psbedu.paris/en/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "ipag", email: "admissions@ipag.fr", sourceUrl: "https://www.ipag.fr/en/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "isc-paris", email: "admissions@iscparis.com", sourceUrl: "https://www.isc.fr/en/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "essca", email: "admissions@essca.eu", sourceUrl: "https://www.essca.fr/en/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "excelia", email: "admissions@excelia-group.com", sourceUrl: "https://www.excelia-group.com/en/admissions", confidenceLevel: "Medium", role: "admissions_officer" },

  // Spain
  { schoolSlug: "univ-barcelona", email: "info@ub.edu", sourceUrl: "https://www.ub.edu/masters-industria-farmaceutica/ca/contacte/", confidenceLevel: "Medium", role: "admissions_officer", notes: "General UB contact; programme-specific secretariats for master registration" },
  { schoolSlug: "uam", email: "solicitud.admision@uam.es", sourceUrl: "https://www.uam.es/uam/informacion-admision", confidenceLevel: "High", role: "admissions_officer" },
  { schoolSlug: "univ-valencia", email: "infosecundaria@uv.es", sourceUrl: "https://www.uv.es/uvweb/universidad/es/admision-1286131300323.html", confidenceLevel: "Medium", role: "admissions_officer", notes: "Faculty-specific; general PG uses Atención y Consultas form" },
  { schoolSlug: "univ-granada", email: "secretaria.master@ugr.es", sourceUrl: "https://masteres.ugr.es/pages/contacto", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "upm", email: "admision@upm.es", sourceUrl: "https://www.upm.es/Estudiantes/Admision", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "upc", email: "admision@upc.edu", sourceUrl: "https://www.upc.edu/en/masters/admission", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "eada", email: "admissions@eada.edu", sourceUrl: "https://www.eada.edu/en/admissions", confidenceLevel: "Medium", role: "admissions_officer" },

  // Ireland
  { schoolSlug: "ul", email: "admissions@ul.ie", sourceUrl: "https://www.ul.ie/gps/contact-us", confidenceLevel: "High", role: "graduate_admissions" },
  { schoolSlug: "setu", email: "admissions@setu.ie", sourceUrl: "https://www.setu.ie/contact", confidenceLevel: "Medium", role: "admissions_officer" },

  // Norway
  { schoolSlug: "nmbu", email: "admission@nmbu.no", sourceUrl: "https://www.nmbu.no/en/studies/admission", confidenceLevel: "High", role: "admissions_officer" },
  { schoolSlug: "univ-stavanger", email: "admission@uis.no", sourceUrl: "https://www.uis.no/en/international-office/admission", confidenceLevel: "High", role: "admissions_officer" },

  // Belgium continued
  { schoolSlug: "kuleuven", email: "studeren@kuleuven.be", sourceUrl: "https://www.kuleuven.be/english/kuleuven", confidenceLevel: "Medium", role: "admissions_officer", notes: "Student info desk; programme-specific secretariats for master admissions" },
  { schoolSlug: "antwerp", email: "study@uantwerpen.be", sourceUrl: "https://www.uantwerpen.be/en/study/study-programmes/all-programmes/", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "hec-liege", email: "hec.admissions@uliege.be", sourceUrl: "https://www.hec.ulg.ac.be/en/admissions", confidenceLevel: "Medium", role: "admissions_officer" },

  // NL applied sciences
  { schoolSlug: "thuas", email: "info@thehagueuniversity.com", sourceUrl: "https://www.thehagueuniversity.com/about-thuas/contact", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "hanze", email: "info@hanze.nl", sourceUrl: "https://www.hanze.nl/en/contact", confidenceLevel: "Medium", role: "admissions_officer" },

  // Additional FR regional universities
  { schoolSlug: "univ-cote-azur", email: "scolarite.universite@univ-cotedazur.fr", sourceUrl: "https://univ-cotedazur.fr/formation/scolarite", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "univ-tours", email: "scolarite@univ-tours.fr", sourceUrl: "https://www.univ-tours.fr/scolarite", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "univ-orleans", email: "scolarite@univ-orleans.fr", sourceUrl: "https://www.univ-orleans.fr/scolarite", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "univ-poitiers", email: "scolarite@univ-poitiers.fr", sourceUrl: "https://www.univ-poitiers.fr/scolarite", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "univ-angers", email: "scolarite@univ-angers.fr", sourceUrl: "https://www.univ-angers.fr/scolarite", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "univ-clermont", email: "scolarite@univ-uca.fr", sourceUrl: "https://www.uca.fr/scolarite", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "univ-lorraine", email: "scolarite@univ-lorraine.fr", sourceUrl: "https://www.univ-lorraine.fr/scolarite", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "univ-brest", email: "scolarite@univ-brest.fr", sourceUrl: "https://www.univ-brest.fr/scolarite", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "univ-perpignan", email: "scolarite@univ-perp.fr", sourceUrl: "https://www.univ-perp.fr/scolarite", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "univ-versailles", email: "scolarite@uvsq.fr", sourceUrl: "https://www.uvsq.fr/scolarite", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "univ-evry", email: "scolarite@univ-evry.fr", sourceUrl: "https://www.univ-evry.fr/scolarite", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "polytech-nantes", email: "incoming.mobility@polytech.univ-nantes.fr", sourceUrl: "https://polytech.univ-nantes.fr/en/academic-programs/international-masters/admissions-for-international-masters-degrees-at-polytech-nantes", confidenceLevel: "High", role: "admissions_officer" },
  { schoolSlug: "polytech-lyon", email: "admissions@polytech.univ-lyon1.fr", sourceUrl: "https://polytech.univ-lyon1.fr/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
  { schoolSlug: "polytech-grenoble", email: "admissions@polytech-grenoble.fr", sourceUrl: "https://polytech.grenoble-inp.fr/admissions", confidenceLevel: "Medium", role: "admissions_officer" },
];

const FORM_ONLY_SKIP = [
  "open-university", "birkbeck", "univ-nottingham", "qmul", "dundee",
  "sorbonne-universite", // covered by polytech email only - actually included
  "univ-sorbonne-paris-nord", "univ-paris8", "univ-corse", "univ-nimes",
  "leiden", // has study@ - included
  "uib", "oslo-met", "nord-university", "univ-agder",
  "univ-barcelona", // has info@ - included
  "univ-valencia", // form primary
  "university-of-iceland", "hi", "reykjavik-university",
  "canterbury", "lincoln", "victoria-wellington",
];

async function verifyEmailOnPage(entry) {
  try {
    const res = await fetch(entry.sourceUrl, {
      signal: AbortSignal.timeout(12000),
      headers: { "User-Agent": "MastersFinder/1.0", Accept: "text/html,application/pdf" },
      redirect: "follow",
    });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const text = (await res.text()).slice(0, 300000).toLowerCase();
    const email = entry.email.toLowerCase();
    if (text.includes(email)) return { ok: true };
    const local = email.split("@")[0];
    if (text.includes(local + "@")) return { ok: true };
    return { ok: false, reason: "email not found on page" };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

async function main() {
  const verified = JSON.parse(fs.readFileSync(VERIFIED, "utf-8"));
  const have = new Set((verified.schoolContacts || []).map((c) => c.schoolSlug));

  const candidates = CURATED.filter((c) => !have.has(c.schoolSlug));
  console.log(`Verifying ${candidates.length} curated contacts (${CURATED.length - candidates.length} already in verified)...`);

  const schoolContacts = [];
  const failedVerify = [];
  const skippedFormOnly = [...new Set(FORM_ONLY_SKIP)].filter((s) => !have.has(s));

  for (const c of candidates) {
    process.stdout.write(`${c.schoolSlug} ... `);
    const v = await verifyEmailOnPage(c);
    if (v.ok) {
      schoolContacts.push({
        schoolSlug: c.schoolSlug,
        role: c.role || "admissions_officer",
        email: c.email,
        sourceUrl: c.sourceUrl,
        sourceType: "official_university_website",
        verificationDate: DATE,
        confidenceLevel: c.confidenceLevel || "Medium",
        ...(c.notes ? { notes: c.notes } : {}),
      });
      console.log("OK");
    } else {
      failedVerify.push({ ...c, reason: v.reason });
      console.log(`FAIL (${v.reason})`);
    }
  }

  const out = {
    batchNotes: "Batch 4: WebSearch + official page verification for schools missing from verified-programs.json schoolContacts",
    verificationDate: DATE,
    schoolContacts,
    skippedFormOnly,
    failedVerification: failedVerify.map((f) => ({ schoolSlug: f.schoolSlug, email: f.email, reason: f.reason })),
    stats: {
      added: schoolContacts.length,
      skippedFormOnly: skippedFormOnly.length,
      failedVerify: failedVerify.length,
      highConfidence: schoolContacts.filter((c) => c.confidenceLevel === "High").length,
    },
  };

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nWrote ${schoolContacts.length} contacts to batch-admissions-contacts-4.json`);
  console.log(`High confidence: ${out.stats.highConfidence}, Skipped form-only: ${skippedFormOnly.length}, Failed verify: ${failedVerify.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
