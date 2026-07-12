#!/usr/bin/env node
/**
 * Merge all batch-admissions-contacts-agent-*.json files into verified-programs.json
 * then run phase-x pipeline.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const dataDir = path.join(__dirname, "../data");
const verifiedPath = path.join(dataDir, "verified-programs.json");
const verified = JSON.parse(fs.readFileSync(verifiedPath, "utf-8"));
if (!verified.schoolContacts) verified.schoolContacts = [];

const files = fs
  .readdirSync(dataDir)
  .filter((f) => /^batch-admissions-contacts-agent-\d+\.json$/.test(f))
  .sort();

let added = 0;
const slugs = new Set(verified.schoolContacts.map((c) => c.schoolSlug));

for (const file of files) {
  const batch = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8"));
  for (const contact of batch.schoolContacts || []) {
    if (!contact.schoolSlug || !contact.email) continue;
    verified.schoolContacts.push(contact);
    slugs.add(contact.schoolSlug);
    added++;
  }
}

verified.lastUpdated = new Date().toISOString().slice(0, 10);
fs.writeFileSync(verifiedPath, JSON.stringify(verified, null, 2) + "\n");
console.log(`Merged ${added} contacts from ${files.length} agent batch files (${slugs.size} unique slugs)`);

execSync("npm run phase-x", { cwd: path.join(__dirname, ".."), stdio: "inherit" });
