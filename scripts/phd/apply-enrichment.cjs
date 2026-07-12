#!/usr/bin/env node
/**
 * Apply enrichment patches from batch-enrichment-pass.json to phd-verified.json
 */
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../data/phd");
const VERIFIED_PATH = path.join(DATA_DIR, "phd-verified.json");
const PATCH_PATH = path.join(DATA_DIR, "batch-enrichment-pass.json");
const TODAY = new Date().toISOString().slice(0, 10);

function main() {
  if (!fs.existsSync(PATCH_PATH)) {
    console.log("No batch-enrichment-pass.json — skip");
    return;
  }
  const patches = JSON.parse(fs.readFileSync(PATCH_PATH, "utf-8"));
  const list = patches.patches || patches;
  const verified = JSON.parse(fs.readFileSync(VERIFIED_PATH, "utf-8"));
  const byId = new Map(verified.phdOffers.map((o) => [o.id, o]));
  let applied = 0;

  for (const patch of list) {
    const offer = byId.get(patch.id);
    if (!offer) continue;
    if (patch.supervisors?.length) {
      offer.supervisors = patch.supervisors;
      applied++;
    }
    if (patch.enrolledStudentsSample?.length) {
      offer.enrolledStudentsSample = patch.enrolledStudentsSample;
      applied++;
    }
  }

  verified.lastUpdated = TODAY;
  verified.enrichmentPass = verified.enrichmentPass || {};
  verified.enrichmentPass.patchesApplied = applied;
  fs.writeFileSync(VERIFIED_PATH, JSON.stringify(verified, null, 2) + "\n");
  console.log(`Applied enrichment to ${applied} offer fields`);
}

main();
