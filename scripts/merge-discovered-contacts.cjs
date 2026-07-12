#!/usr/bin/env node
/** Merge discovered-school-contacts.json into verified-programs.json (dedupe by slug). */
const fs = require("fs");
const path = require("path");

const verifiedPath = path.join(__dirname, "../data/verified-programs.json");
const discoveredPath = path.join(__dirname, "../data/discovered-school-contacts.json");

if (!fs.existsSync(discoveredPath)) {
  console.log("No discovered contacts file");
  process.exit(0);
}

const verified = JSON.parse(fs.readFileSync(verifiedPath, "utf-8"));
const discovered = JSON.parse(fs.readFileSync(discoveredPath, "utf-8"));

if (!verified.schoolContacts) verified.schoolContacts = [];
const bySlug = new Map(verified.schoolContacts.map((c) => [c.schoolSlug, c]));
let added = 0;
for (const c of discovered.schoolContacts || []) {
  if (!bySlug.has(c.schoolSlug)) {
    bySlug.set(c.schoolSlug, c);
    added++;
  }
}
verified.schoolContacts = [...bySlug.values()];
verified.lastUpdated = new Date().toISOString().slice(0, 10);

fs.writeFileSync(verifiedPath, JSON.stringify(verified, null, 2) + "\n");
console.log(`Merged ${added} new contacts into verified-programs (${verified.schoolContacts.length} total)`);
