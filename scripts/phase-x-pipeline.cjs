/**
 * PHASE X — Master Database Verification, Enrichment & Expansion Pipeline
 *
 * Orchestrates: deduplication → derived data → verified enrichment → audit
 * Never fabricates data. Unverified fields remain flagged.
 */
const fs = require("fs");
const path = require("path");
const { enrichAdmissions } = require("./enrich-admissions.cjs");

const DATA_PATH = path.join(process.cwd(), "data", "masters-data.json");
const VERIFIED_PATH = path.join(process.cwd(), "data", "verified-programs.json");
const REPORT_PATH = path.join(process.cwd(), "data", "audit-report.json");

// ─── Duplicate school merge map: duplicateId → canonicalId ───
const DUPLICATE_MERGE = {
  334: 41,   // univ-galway → university-galway
  325: 46,   // rug → groningen
  333: 67,   // vuw → victoria-wellington
  285: 77,   // iae-montpellier-2 → iae-montpellier
  306: 99,   // univ-larochelle → univ-la-rochelle
  309: 100,  // univ-lehavre → univ-le-havre
  310: 104,  // univ-saint-etienne → univ-st-etienne
  305: 106,  // univ-lemans → univ-le-mans
  304: 125,  // univ-fcomte → univ-franche-comte
  322: 196,  // utwente → univ-twente
  324: 198,  // leiden-delft-erasmus → leiden
};

function loadDB() {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

function saveDB(db) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2) + "\n", "utf-8");
}

function parseTuitionAmount(str) {
  if (!str) return null;
  const eur = str.match(/€([\d,]+(?:\.\d+)?)/);
  if (eur) return parseInt(eur[1].replace(/,/g, ""), 10);
  const gbp = str.match(/£([\d,]+(?:\.\d+)?)/);
  if (gbp) return parseInt(gbp[1].replace(/,/g, ""), 10);
  const num = parseInt(str.replace(/[^\d]/g, ""), 10);
  return isNaN(num) ? null : num;
}

function detectCurrency(str) {
  if (!str) return null;
  if (str.includes("€")) return "EUR";
  if (str.includes("£")) return "GBP";
  if (str.includes("$") || str.includes("NZ$")) return str.includes("NZ$") ? "NZD" : "USD";
  return null;
}

function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// ─── Step 1: Deduplicate schools ─────────────────────────────
function deduplicateSchools(db) {
  const stats = { merged: 0, removed: 0 };
  const schoolById = Object.fromEntries(db.schools.map((s) => [s.id, s]));

  for (const [dupIdStr, canonicalId] of Object.entries(DUPLICATE_MERGE)) {
    const dupId = parseInt(dupIdStr, 10);
    if (!schoolById[dupId] || !schoolById[canonicalId]) continue;

    // Reassign programs
    for (const p of db.programs) {
      if (p.schoolId === dupId) {
        p.schoolId = canonicalId;
        stats.merged++;
      }
    }

    // Reassign admissions/deadlines if canonical missing
    const dupAdmission = db.admissions.find((a) => a.schoolId === dupId);
    const canonAdmission = db.admissions.find((a) => a.schoolId === canonicalId);
    if (dupAdmission && !canonAdmission) {
      dupAdmission.schoolId = canonicalId;
    } else if (dupAdmission && canonAdmission) {
      db.admissions = db.admissions.filter((a) => a.schoolId !== dupId);
    }

    const dupDeadlines = db.deadlines.filter((d) => d.schoolId === dupId);
    const canonDeadlines = db.deadlines.filter((d) => d.schoolId === canonicalId);
    if (dupDeadlines.length && !canonDeadlines.length) {
      for (const d of dupDeadlines) d.schoolId = canonicalId;
    } else if (dupDeadlines.length) {
      db.deadlines = db.deadlines.filter((d) => d.schoolId !== dupId);
    }

    // Reassign scores
    for (const s of db.candidateScores) {
      if (s.schoolId === dupId) s.schoolId = canonicalId;
    }
    for (const r of db.recommendations || []) {
      if (r.schoolId === dupId) r.schoolId = canonicalId;
    }
    for (const f of db.favorites || []) {
      if (f.schoolId === dupId) f.schoolId = canonicalId;
    }

    // Reassign scholarships
    for (const s of db.scholarships) {
      if (s.schoolId === dupId) s.schoolId = canonicalId;
    }

    db.schools = db.schools.filter((s) => s.id !== dupId);
    stats.removed++;
  }

  return stats;
}

// ─── Step 2: Initialize top-level arrays ───────────────────
function initializeArrays(db) {
  if (!db.sources) db.sources = [];
  if (!db.programDeadlines) db.programDeadlines = [];
  if (!db.contacts) db.contacts = [];
  if (!db.programScholarships) db.programScholarships = [];
  if (!db.auditFlags) db.auditFlags = [];
  if (!db.metadata) {
    db.metadata = {
      schemaVersion: "2.0.0",
      lastPipelineRun: null,
      lastAuditRun: null,
    };
  }
}

// ─── Step 3: Build derived data from existing records ───────
function buildDerivedData(db) {
  const stats = { tuitionParsed: 0, deadlinesCreated: 0, sourcesCreated: 0 };
  const schoolById = Object.fromEntries(db.schools.map((s) => [s.id, s]));
  let sourceId = db.sources.length > 0 ? Math.max(...db.sources.map((s) => s.id)) + 1 : 1;
  let deadlineId = db.programDeadlines.length > 0 ? Math.max(...db.programDeadlines.map((d) => d.id)) + 1 : 1;

  for (const program of db.programs) {
    const school = schoolById[program.schoolId];
    if (!school) continue;

    // Parse tuition if not set
    if (program.tuitionYearly == null && program.tuitionFees) {
      const parsed = parseTuitionAmount(program.tuitionFees);
      if (parsed != null) {
        program.tuitionYearly = parsed;
        if (program.tuitionFees.includes("/year")) {
          program.tuitionTotal = parsed * (program.duration?.includes("2") ? 2 : 1);
        } else {
          program.tuitionTotal = parsed;
        }
        stats.tuitionParsed++;

        db.sources.push({
          id: sourceId++,
          entityType: "program",
          entityId: program.id,
          fieldName: "tuitionYearly",
          url: school.website || "",
          sourceType: "derived_from_tuitionFees",
          title: "Parsed from tuitionFees string",
          retrievalDate: new Date().toISOString().split("T")[0],
          confidenceScore: 0.5,
          notes: "Auto-parsed; requires official verification",
        });
        stats.sourcesCreated++;
      }
    }

    // Set defaults for missing verification fields
    if (!program.officialTitle) program.officialTitle = program.name;
    if (!program.verificationStatus) program.verificationStatus = "Pending Verification";
    if (!program.confidenceLevel) program.confidenceLevel = "Low";
    if (!program.sourceType) program.sourceType = "Manual Review Required";
    if (!program.currency) program.currency = detectCurrency(program.tuitionFees) || "EUR";

    // Inherit school deadlines → program deadlines
    const schoolDeadlines = db.deadlines.filter((d) => d.schoolId === program.schoolId);
    const existingProgDeadline = db.programDeadlines.find((d) => d.programId === program.id);
    if (schoolDeadlines.length && !existingProgDeadline) {
      const sd = schoolDeadlines[0];
      db.programDeadlines.push({
        id: deadlineId++,
        programId: program.id,
        schoolId: program.schoolId,
        academicYear: sd.academicYear || "2026/2027",
        applicationsOpen: sd.applicationOpening || null,
        finalDeadline: sd.applicationClosing || null,
        rollingAdmission: false,
        intakePeriod: "September 2026",
        verificationStatus: "Inherited from school — Pending Verification",
        sourceUrl: school.website || null,
        sourceType: "inherited_from_school_deadline",
        verificationDate: null,
        confidenceLevel: "Low",
      });
      stats.deadlinesCreated++;
    }

    // Flag missing critical fields
    const missing = [];
    if (!program.applicationUrl) missing.push("applicationUrl");
    if (!program.programmeUrl) missing.push("programmeUrl");
    if (!program.sourceUrl && program.verificationStatus !== "Verified") missing.push("sourceUrl");
    if (missing.length > 0) {
      const existing = db.auditFlags.find(
        (f) => f.entityType === "program" && f.entityId === program.id && f.flagType === "missing_fields"
      );
      if (!existing) {
        db.auditFlags.push({
          entityType: "program",
          entityId: program.id,
          programName: program.name,
          schoolId: program.schoolId,
          flagType: "missing_fields",
          severity: "medium",
          fields: missing,
          status: "open",
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return stats;
}

function formatTuitionDisplay(vp) {
  const sym = vp.currency === "GBP" ? "£" : vp.currency === "DKK" ? "DKK " : "€";
  if (vp.tuitionYearly == null) return null;
  let str = `${sym}${vp.tuitionYearly.toLocaleString("en-US")}/year`;
  if (vp.euTuition != null && vp.internationalTuition != null) {
    str = `${sym}${vp.euTuition.toLocaleString("en-US")} (EU/EEA); ${sym}${vp.internationalTuition.toLocaleString("en-US")} (non-EU)/year`;
  }
  return str;
}

function programMatches(program, matchStr) {
  const a = program.name.toLowerCase();
  const b = matchStr.toLowerCase();
  return a.includes(b) || b.includes(a);
}

function applyProgramTemplate(db, school, program, template, stats, sourceIdRef) {
  if (template.tuitionYearly != null && program.tuitionYearly != null) {
    const diff = Math.abs(program.tuitionYearly - template.tuitionYearly);
    if (diff > 100) {
      db.auditFlags.push({
        entityType: "program",
        entityId: program.id,
        programName: program.name,
        schoolId: school.id,
        flagType: "tuition_corrected",
        severity: "high",
        oldValue: program.tuitionFees,
        newValue: formatTuitionDisplay(template) || String(template.tuitionYearly),
        status: "resolved",
        createdAt: new Date().toISOString(),
      });
      stats.corrected++;
    }
  }

  const fields = [
    "officialTitle", "programmeUrl", "applicationUrl", "faculty", "department",
    "degreeAwarded", "duration", "ects", "studyMode", "tuitionYearly", "tuitionTotal",
    "internationalTuition", "euTuition", "domesticTuition", "registrationFee",
    "mandatoryFees", "administrativeFee", "studentUnionFee", "estimatedLivingCosts",
    "estimatedYearlyBudget", "programmeRanking", "employabilityStats", "graduateSalary",
    "gmatMinScore", "ieltsMinScore", "toeflMinScore", "gmatRequired", "greRequired",
    "interviewRequired", "cambridgeEnglishLevel", "delfLevel", "minGPA",
    "acceptedDegrees", "prerequisiteCourses", "admissionsEmail", "verificationStatus",
    "sourceUrl", "sourceType", "verificationDate", "confidenceLevel", "currency", "notes",
  ];

  for (const field of fields) {
    if (template[field] != null && template[field] !== "") {
      program[field] = template[field];
    }
  }

  if (!program.programmeUrl && school.website) {
    program.programmeUrl = school.website;
  }

  const tuitionStr = formatTuitionDisplay(template);
  if (tuitionStr) {
    program.tuitionFees = tuitionStr;
    program.lastChecked = template.verificationDate;
  }

  if (template.finalDeadline || template.priorityDeadline) {
    let pd = db.programDeadlines.find((d) => d.programId === program.id);
    if (!pd) {
      pd = {
        id: (db.programDeadlines.length ? Math.max(...db.programDeadlines.map((d) => d.id)) : 0) + 1,
        programId: program.id,
        schoolId: school.id,
      };
      db.programDeadlines.push(pd);
    }
    if (template.priorityDeadline) pd.priorityDeadline = template.priorityDeadline;
    if (template.finalDeadline) pd.finalDeadline = template.finalDeadline;
    if (template.applicationOpening) pd.applicationsOpen = template.applicationOpening;
    if (template.intakePeriod) pd.intakePeriod = template.intakePeriod;
    pd.verificationStatus = template.verificationStatus || "Verified";
    pd.sourceUrl = template.sourceUrl;
    pd.sourceType = template.sourceType;
    pd.verificationDate = template.verificationDate;
    pd.confidenceLevel = template.confidenceLevel;
  }

  db.sources.push({
    id: sourceIdRef.value++,
    entityType: "program",
    entityId: program.id,
    fieldName: "*",
    url: template.sourceUrl,
    sourceType: template.sourceType,
    title: `Verified: ${template.officialTitle || program.name}`,
    retrievalDate: template.verificationDate,
    confidenceScore: template.confidenceLevel === "High" ? 1.0 : 0.7,
    notes: template.notes || "Applied from verified-programs.json",
  });

  stats.applied++;
}

// ─── Step 4: Apply verified official data ────────────────────
function applyVerifiedData(db) {
  if (!fs.existsSync(VERIFIED_PATH)) return { applied: 0, corrected: 0, networkApplied: 0, overrides: 0 };

  const verified = JSON.parse(fs.readFileSync(VERIFIED_PATH, "utf-8"));
  const schoolBySlug = Object.fromEntries(db.schools.map((s) => [s.slug, s]));
  const stats = { applied: 0, corrected: 0, networkApplied: 0, overrides: 0 };
  const sourceIdRef = { value: db.sources.length > 0 ? Math.max(...db.sources.map((s) => s.id)) + 1 : 1 };
  let contactId = db.contacts.length > 0 ? Math.max(...db.contacts.map((c) => c.id)) + 1 : 1;

  for (const vp of verified.programs) {
    const school = schoolBySlug[vp.schoolSlug];
    if (!school) continue;

    const programs = db.programs.filter((p) => p.schoolId === school.id);
    for (const program of programs) {
      if (!programMatches(program, vp.programNameMatch)) continue;
      applyProgramTemplate(db, school, program, vp, stats, sourceIdRef);
    }
  }

  // Network templates (e.g. IAE France)
  for (const np of verified.networkPrograms || []) {
    const pattern = new RegExp(np.schoolSlugPattern);
    for (const school of db.schools) {
      if (!pattern.test(school.slug)) continue;
      const programs = db.programs.filter((p) => p.schoolId === school.id);
      for (const program of programs) {
        if (!programMatches(program, np.programNameMatch)) continue;
        applyProgramTemplate(db, school, program, np, stats, sourceIdRef);
        stats.networkApplied++;
      }
    }
  }

  // Programmes with no current official listing
  for (const ov of verified.programmeStatusOverrides || []) {
    const school = schoolBySlug[ov.schoolSlug];
    if (!school) continue;
    for (const program of db.programs.filter((p) => p.schoolId === school.id)) {
      if (!programMatches(program, ov.programNameMatch)) continue;
      program.verificationStatus = ov.verificationStatus;
      program.sourceUrl = ov.sourceUrl;
      program.sourceType = ov.sourceType;
      program.verificationDate = ov.verificationDate;
      program.confidenceLevel = ov.confidenceLevel;
      if (ov.notes) program.notes = ov.notes;
      stats.overrides++;
    }
  }

  // School contacts
  const contactSources = [...(verified.schoolContacts || [])];
  const discoveredPath = path.join(process.cwd(), "data", "discovered-school-contacts.json");
  if (fs.existsSync(discoveredPath)) {
    const discovered = JSON.parse(fs.readFileSync(discoveredPath, "utf-8"));
    contactSources.push(...(discovered.schoolContacts || []));
  }

  for (const sc of contactSources) {
    const school = schoolBySlug[sc.schoolSlug];
    if (!school) continue;
    const exists = db.contacts.find(
      (c) => c.schoolId === school.id && c.email === sc.email
    );
    if (!exists) {
      db.contacts.push({
        id: contactId++,
        schoolId: school.id,
        role: sc.role,
        email: sc.email,
        sourceUrl: sc.sourceUrl,
        sourceType: sc.sourceType,
        verificationDate: sc.verificationDate,
        confidenceLevel: sc.confidenceLevel,
      });
    }
  }

  // Application portals at school level → propagate to programs
  for (const ap of verified.schoolApplicationPortals || []) {
    const school = schoolBySlug[ap.schoolSlug];
    if (!school) continue;
    for (const program of db.programs.filter((p) => p.schoolId === school.id)) {
      if (!program.applicationPortal) program.applicationPortal = ap.applicationPortal;
      if (!program.applicationGuide) program.applicationGuide = ap.applicationGuide;
      if (!program.applicationUrl) program.applicationUrl = ap.applicationGuide || ap.applicationPortal;
    }
  }

  // Propagate school contact emails to programmes
  for (const contact of db.contacts) {
    if (!contact.email) continue;
    for (const program of db.programs.filter((p) => p.schoolId === contact.schoolId)) {
      if (!program.admissionsEmail) program.admissionsEmail = contact.email;
    }
  }

  return stats;
}

// ─── Step 5: Full audit ─────────────────────────────────────
function runAudit(db) {
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {},
    issues: {
      missingTuition: [],
      incorrectTuition: [],
      duplicateSchools: [],
      inconsistentCurrencies: [],
      outdatedDeadlines: [],
      brokenApplicationLinks: [],
      invalidEmails: [],
      missingContacts: [],
      incompleteMetadata: [],
      missingSources: [],
      orphanedRecords: [],
    },
    completeness: {},
    verification: {},
  };

  const schoolById = Object.fromEntries(db.schools.map((s) => [s.id, s]));
  const schoolNames = {};
  for (const s of db.schools) {
    const k = s.name.toLowerCase();
    if (!schoolNames[k]) schoolNames[k] = [];
    schoolNames[k].push(s);
  }
  report.issues.duplicateSchools = Object.entries(schoolNames)
    .filter(([, v]) => v.length > 1)
    .map(([name, schools]) => ({ name, count: schools.length, ids: schools.map((s) => s.id) }));

  let verified = 0, pending = 0, manual = 0;
  const fieldCompleteness = {};

  const trackField = (field) => {
    const filled = db.programs.filter((p) => p[field] != null && p[field] !== "" && p[field] !== "Pending Verification").length;
    fieldCompleteness[field] = { filled, total: db.programs.length, pct: Math.round((filled / db.programs.length) * 100) };
  };

  const keyFields = [
    "tuitionYearly", "applicationUrl", "programmeUrl", "sourceUrl",
    "ieltsMinScore", "admissionsEmail", "faculty", "studyMode",
    "internationalTuition", "degreeAwarded", "gmatRequired",
  ];
  for (const f of keyFields) trackField(f);

  for (const program of db.programs) {
    const school = schoolById[program.schoolId];

    if (program.verificationStatus === "Verified") verified++;
    else if (program.verificationStatus === "Manual Review Required") manual++;
    else pending++;

    if (!program.tuitionYearly && !program.tuitionFees) {
      report.issues.missingTuition.push({ programId: program.id, name: program.name, schoolId: program.schoolId });
    }

    if (program.applicationUrl && !isValidUrl(program.applicationUrl)) {
      report.issues.brokenApplicationLinks.push({ programId: program.id, url: program.applicationUrl });
    }

    if (program.admissionsEmail && !isValidEmail(program.admissionsEmail)) {
      report.issues.invalidEmails.push({ programId: program.id, email: program.admissionsEmail });
    }

    if (!program.sourceUrl && program.verificationStatus !== "Verified") {
      report.issues.missingSources.push({ programId: program.id, name: program.name });
    }

    const metaMissing = [];
    if (!program.studyMode) metaMissing.push("studyMode");
    if (!program.degreeAwarded) metaMissing.push("degreeAwarded");
    if (!program.programmeUrl) metaMissing.push("programmeUrl");
    if (metaMissing.length >= 2) {
      report.issues.incompleteMetadata.push({ programId: program.id, name: program.name, missing: metaMissing });
    }
  }

  // Orphaned programs
  const schoolIds = new Set(db.schools.map((s) => s.id));
  for (const p of db.programs) {
    if (!schoolIds.has(p.schoolId)) {
      report.issues.orphanedRecords.push({ type: "program", id: p.id, schoolId: p.schoolId });
    }
  }

  // Schools without contacts
  const schoolsWithContacts = new Set(db.contacts.map((c) => c.schoolId));
  for (const s of db.schools) {
    if (!schoolsWithContacts.has(s.id)) {
      report.issues.missingContacts.push({ schoolId: s.id, name: s.name });
    }
  }

  report.completeness = fieldCompleteness;
  report.verification = { verified, pending, manual, total: db.programs.length };
  report.summary = {
    schools: db.schools.length,
    programs: db.programs.length,
    sources: db.sources.length,
    contacts: db.contacts.length,
    programDeadlines: db.programDeadlines.length,
    auditFlags: db.auditFlags.length,
    openFlags: db.auditFlags.filter((f) => f.status === "open").length,
    verificationRate: Math.round((verified / db.programs.length) * 100),
    duplicateSchoolsRemaining: report.issues.duplicateSchools.length,
    missingTuitionCount: report.issues.missingTuition.length,
    missingSourcesCount: report.issues.missingSources.length,
    incompleteMetadataCount: report.issues.incompleteMetadata.length,
  };

  return report;
}

// ─── Main ───────────────────────────────────────────────────
function main() {
  console.log("═══ PHASE X Pipeline ═══\n");
  const db = loadDB();
  initializeArrays(db);

  console.log("Step 1: Deduplicating schools...");
  const dedupStats = deduplicateSchools(db);
  console.log(`  Merged ${dedupStats.merged} program references, removed ${dedupStats.removed} duplicate schools`);

  console.log("Step 2: Building derived data...");
  const derivedStats = buildDerivedData(db);
  console.log(`  Parsed ${derivedStats.tuitionParsed} tuitions, created ${derivedStats.deadlinesCreated} program deadlines, ${derivedStats.sourcesCreated} sources`);

  console.log("Step 3: Applying verified official data...");
  const verifiedStats = applyVerifiedData(db);
  console.log(`  Applied to ${verifiedStats.applied} programs, corrected ${verifiedStats.corrected} tuition values, ${verifiedStats.networkApplied || 0} network matches, ${verifiedStats.overrides || 0} status overrides`);

  console.log("Step 4: Enriching admissions (contacts, apply URLs, requirements)...");
  const admStats = enrichAdmissions(db);
  console.log(`  Parsed ${admStats.admissionsParsed} admissions records, applied ${admStats.profilesApplied} profile fields, propagated ${admStats.requirementsPropagated} requirement sets, ${admStats.contactsPropagated} contact emails`);

  console.log("Step 5: Running audit...");
  const report = runAudit(db);
  db.metadata.lastPipelineRun = new Date().toISOString();
  db.metadata.lastAuditRun = report.generatedAt;

  saveDB(db);
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n", "utf-8");

  console.log("\n═══ Audit Summary ═══");
  console.log(JSON.stringify(report.summary, null, 2));
  console.log(`\nReport saved to ${REPORT_PATH}`);
}

main();
