#!/usr/bin/env node
/**
 * PhD OSINT enrichment audit — reports supervisor LinkedIn / student cohort gaps.
 * Does NOT fabricate URLs; only flags offers needing manual enrichment.
 *
 * Usage: node scripts/phd/enrich-offers.cjs
 */
const fs = require("fs");
const path = require("path");

const VERIFIED_PATH = path.join(__dirname, "../../data/phd/phd-verified.json");
const REPORT_PATH = path.join(__dirname, "../../data/phd/enrichment-gaps.json");
const TODAY = new Date().toISOString().slice(0, 10);

function main() {
  const data = JSON.parse(fs.readFileSync(VERIFIED_PATH, "utf-8"));
  const open = (data.phdOffers || []).filter((o) => o.status !== "closed");

  const gaps = open.map((o) => {
    const sups = o.supervisors || [];
    const students = o.enrolledStudentsSample || [];
    return {
      id: o.id,
      institution: o.institution,
      countrySlug: o.countrySlug,
      missingSupervisorLinkedIn: sups.filter((s) => !s.linkedinUrl).map((s) => s.name),
      missingSupervisorEmail: sups.filter((s) => !s.email).map((s) => s.name),
      studentSampleCount: students.length,
      studentSampleTargetMet: students.length >= 10,
      programInfoUrl: o.programInfoUrl,
    };
  });

  const report = {
    generatedAt: TODAY,
    openOffers: open.length,
    withAnySupervisorLinkedIn: gaps.filter((g) => {
      const o = open.find((x) => x.id === g.id);
      const n = o?.supervisors?.length || 0;
      return n > 0 && g.missingSupervisorLinkedIn.length < n;
    }).length,
    withStudentSample10Plus: gaps.filter((g) => g.studentSampleTargetMet).length,
    needsManualEnrichment: gaps.filter(
      (g) => g.missingSupervisorLinkedIn.length > 0 || !g.studentSampleTargetMet
    ),
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n");
  console.log(
    JSON.stringify(
      {
        openOffers: report.openOffers,
        withStudentSample10Plus: report.withStudentSample10Plus,
        needsEnrichment: report.needsManualEnrichment.length,
        reportPath: REPORT_PATH,
      },
      null,
      2
    )
  );
}

main();
