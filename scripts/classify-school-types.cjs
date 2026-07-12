#!/usr/bin/env node
/**
 * Assign accurate Public / Semi-private / Private type to every school.
 *
 * Definitions:
 * - Public: state universities, public grandes écoles (INSA, Centrale, IMT, Polytech),
 *   IAE network, UK/Ireland/Nordic/Benelux/Spanish public universities, public UAS.
 * - Semi-private: special-status public institutions (Sciences Po), foundation schools (NHH),
 *   autonomous business schools within collegiate public universities (Oxford/Cambridge).
 * - Private: independent business schools (HEC, ESSEC, …), private universities (Reykjavik, Bifrost),
 *   private engineering schools (EPITA, Epitech, ESILV), private management schools (ICHEC, EADA, …).
 */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "../data/masters-data.json");

/** Independently owned or private non-profit institutions. */
const PRIVATE = new Set([
  "hec-paris", "essec", "escp", "em-lyon", "iese", "esade", "ie-business-school",
  "vlerick", "bi-norwegian", "edhec", "skema", "audencia", "tbs", "kedge",
  "montpellier-bs", "grenoble-em", "ieseg", "neoma", "rennes-sb", "nyenrode",
  "eada", "reykjavik-university", "bifrost", "esilv", "epita", "epitech", "isg",
  "psb", "ipag", "isc-paris", "kedge-marseille", "essca", "excelia", "esg", "esce",
  "idrac", "esdes-lyon", "estya", "mba-paris",
  "ichec", // ICHEC Brussels — private management school (not a public university)
]);

/** Mixed governance, foundation, or autonomous faculty within a public university. */
const SEMI_PRIVATE = new Set([
  "sciences-po", // EPSCP with selective admission and distinct governance
  "oxford-said", // Saïd Business School, University of Oxford
  "cambridge-judge", // Judge Business School, University of Cambridge
  "nhh", // Foundation-owned, state-funded Norwegian School of Economics
]);

function classify(slug) {
  if (PRIVATE.has(slug)) return "Private";
  if (SEMI_PRIVATE.has(slug)) return "Semi-private";
  return "Public";
}

const db = JSON.parse(fs.readFileSync(DATA, "utf-8"));
const counts = { Public: 0, "Semi-private": 0, Private: 0 };
let changed = 0;

for (const school of db.schools) {
  const next = classify(school.slug);
  counts[next]++;
  if (school.type !== next) {
    changed++;
    school.type = next;
  }
}

fs.writeFileSync(DATA, JSON.stringify(db, null, 2) + "\n");
console.log("School type classification complete:");
console.log("  Public:", counts.Public);
console.log("  Semi-private:", counts["Semi-private"]);
console.log("  Private:", counts.Private);
console.log("  Updated:", changed, "schools");
