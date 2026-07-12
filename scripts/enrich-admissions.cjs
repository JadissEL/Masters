#!/usr/bin/env node
/**
 * Enrich programmes with contacts, application URLs, and admissions requirements.
 * - Parses school-level admissions text → structured fields
 * - Applies school-admissions-profiles.json (individual + network)
 * - Propagates contacts → programme.admissionsEmail
 */
const fs = require("fs");
const path = require("path");
const { parseEnglishRequirements, parseFrenchRequirements } = require("./parse-admissions-text.cjs");

const PROFILES_PATH = path.join(__dirname, "../data/school-admissions-profiles.json");

function applyProfileToProgram(program, profile, school) {
  const fields = [
    "applicationUrl", "applicationPortal", "applicationGuide",
    "admissionsEmail", "programmeEmail", "phone",
    "ieltsMinScore", "toeflMinScore", "cambridgeEnglishLevel", "delfLevel", "dalfLevel",
    "gmatRequired", "greRequired", "gmatMinScore", "greMinScore",
    "interviewRequired", "minGPA", "acceptedDegrees", "workExperienceRequired",
  ];

  let applicationUrl = profile.applicationUrl;
  if (profile.useSchoolWebsite && school.website) {
    applicationUrl = school.website.replace(/\/$/, "");
  }

  for (const field of fields) {
    if (field === "applicationUrl") {
      if (!program.applicationUrl && applicationUrl) program.applicationUrl = applicationUrl;
      continue;
    }
    if (profile[field] != null && profile[field] !== "" && program[field] == null) {
      program[field] = profile[field];
    }
  }

  if (!program.admissionsEmail && profile.admissionsEmail) {
    program.admissionsEmail = profile.admissionsEmail;
  }
}

function enrichAdmissions(db) {
  const stats = {
    admissionsParsed: 0,
    profilesApplied: 0,
    contactsPropagated: 0,
    requirementsPropagated: 0,
  };

  const schoolById = Object.fromEntries(db.schools.map((s) => [s.id, s]));

  // ─── 1. Parse admissions table → structured fields ───
  for (const adm of db.admissions) {
    let changed = false;
    const eng = parseEnglishRequirements(adm.englishRequirements);
    const fr = parseFrenchRequirements(adm.frenchRequirements);

    for (const [k, v] of Object.entries({ ...eng, ...fr })) {
      if (adm[k] == null && v != null) {
        adm[k] = v;
        changed = true;
      }
    }
    if (changed) stats.admissionsParsed++;
  }

  // ─── 2. Propagate school admissions → programmes ───
  for (const program of db.programs) {
    const adm = db.admissions.find((a) => a.schoolId === program.schoolId);
    if (!adm) continue;

    const fields = [
      "ieltsMinScore", "toeflMinScore", "cambridgeEnglishLevel", "delfLevel", "dalfLevel",
      "gmatRequired", "greRequired", "gmatMinScore", "greMinScore",
      "interviewRequired", "minGPA", "acceptedDegrees", "workExperienceRequired",
      "applicationUrl", "applicationPortal", "applicationGuide",
    ];

    let propagated = false;
    for (const field of fields) {
      if (program[field] == null && adm[field] != null) {
        program[field] = adm[field];
        propagated = true;
      }
    }
    if (propagated) stats.requirementsPropagated++;
  }

  // ─── 3. Propagate contacts → programme.admissionsEmail ───
  for (const contact of db.contacts || []) {
    if (!contact.email) continue;
    const isAdmissions = /admission|admissions|graduate|masters|msc|enrol/i.test(contact.role || "");
    if (!isAdmissions && contact.role !== "admissions_officer" && contact.role !== "graduate_admissions") {
      continue;
    }
    for (const program of db.programs.filter((p) => p.schoolId === contact.schoolId)) {
      if (!program.admissionsEmail) {
        program.admissionsEmail = contact.email;
        stats.contactsPropagated++;
      }
    }
  }

  // ─── 4. Apply school admissions profiles ───
  if (!fs.existsSync(PROFILES_PATH)) return stats;

  const profiles = JSON.parse(fs.readFileSync(PROFILES_PATH, "utf-8"));

  // Optional supplemental batch merged into verified-programs
  const verifiedPath = path.join(__dirname, "../data/verified-programs.json");
  if (fs.existsSync(verifiedPath)) {
    const verified = JSON.parse(fs.readFileSync(verifiedPath, "utf-8"));
    if (verified.schoolAdmissionsProfiles) {
      profiles.schoolProfiles = [...(profiles.schoolProfiles || []), ...verified.schoolAdmissionsProfiles];
    }
    if (verified.networkAdmissionsProfiles) {
      profiles.networkProfiles = [...(profiles.networkProfiles || []), ...verified.networkAdmissionsProfiles];
    }
  }

  // Supplemental enrichment batch file
  const batchPath = path.join(__dirname, "../data/batch-admissions-enrichment.json");
  if (fs.existsSync(batchPath)) {
    const batch = JSON.parse(fs.readFileSync(batchPath, "utf-8"));
    if (batch.schoolProfiles) profiles.schoolProfiles.push(...batch.schoolProfiles);
    if (batch.networkProfiles) profiles.networkProfiles.push(...batch.networkProfiles);
  }

  for (const profile of profiles.schoolProfiles || []) {
    const school = db.schools.find((s) => s.slug === profile.schoolSlug);
    if (!school) continue;

    const adm = db.admissions.find((a) => a.schoolId === school.id);
    if (adm) {
      let applicationUrl = profile.applicationUrl;
      if (profile.useSchoolWebsite && school.website) applicationUrl = school.website.replace(/\/$/, "");
      if (!adm.applicationUrl && applicationUrl) adm.applicationUrl = applicationUrl;
      if (!adm.applicationPortal && profile.applicationPortal) adm.applicationPortal = profile.applicationPortal;
      if (!adm.applicationGuide && profile.applicationGuide) adm.applicationGuide = profile.applicationGuide;
    }

    for (const program of db.programs.filter((p) => p.schoolId === school.id)) {
      applyProfileToProgram(program, profile, school);
      stats.profilesApplied++;
    }
  }

  for (const profile of profiles.networkProfiles || []) {
    const pattern = new RegExp(profile.schoolSlugPattern);
    for (const school of db.schools) {
      if (!pattern.test(school.slug)) continue;

      const adm = db.admissions.find((a) => a.schoolId === school.id);
      if (adm) {
        let applicationUrl = profile.applicationUrl;
        if (profile.useSchoolWebsite && school.website) applicationUrl = school.website.replace(/\/$/, "");
        if (!adm.applicationUrl && applicationUrl) adm.applicationUrl = applicationUrl;
        if (!adm.applicationPortal && profile.applicationPortal) adm.applicationPortal = profile.applicationPortal;
      }

      for (const program of db.programs.filter((p) => p.schoolId === school.id)) {
        applyProfileToProgram(program, profile, school);
        stats.profilesApplied++;
      }
    }
  }

  return stats;
}

module.exports = { enrichAdmissions, applyProfileToProgram };

if (require.main === module) {
  const DATA_PATH = path.join(__dirname, "../data/masters-data.json");
  const db = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  const stats = enrichAdmissions(db);
  fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2) + "\n", "utf-8");
  console.log("Admissions enrichment:", stats);
}
