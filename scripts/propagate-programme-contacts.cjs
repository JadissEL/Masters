#!/usr/bin/env node
/** Promote programme-level admissionsEmail to school contacts when consistent. */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "../data/masters-data.json");
const VERIFIED = path.join(__dirname, "../data/verified-programs.json");
const OUT = path.join(__dirname, "../data/discovered-school-contacts.json");

const db = JSON.parse(fs.readFileSync(DATA, "utf-8"));
const verified = JSON.parse(fs.readFileSync(VERIFIED, "utf-8"));

const hasContact = new Set(db.contacts.map((c) => c.schoolId));
const schoolBySlug = Object.fromEntries(db.schools.map((s) => [s.slug, s]));

// Collect emails from verified programmes per school
const bySchool = new Map();
for (const vp of verified.programs) {
  if (!vp.admissionsEmail || !vp.schoolSlug) continue;
  if (!bySchool.has(vp.schoolSlug)) bySchool.set(vp.schoolSlug, new Map());
  const m = bySchool.get(vp.schoolSlug);
  m.set(vp.admissionsEmail, (m.get(vp.admissionsEmail) || 0) + 1);
}

// Collect from DB programmes too
for (const p of db.programs) {
  if (!p.admissionsEmail) continue;
  const school = db.schools.find((s) => s.id === p.schoolId);
  if (!school) continue;
  if (!bySchool.has(school.slug)) bySchool.set(school.slug, new Map());
  const m = bySchool.get(school.slug);
  m.set(p.admissionsEmail, (m.get(p.admissionsEmail) || 0) + 1);
}

let data = { schoolContacts: [], failed: [] };
if (fs.existsSync(OUT)) data = JSON.parse(fs.readFileSync(OUT, "utf-8"));
const existing = new Set((data.schoolContacts || []).map((c) => c.schoolSlug));

let added = 0;
for (const [slug, emailCounts] of bySchool) {
  const school = schoolBySlug[slug];
  if (!school || hasContact.has(school.id) || existing.has(slug)) continue;
  const top = [...emailCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!top) continue;
  const [email, count] = top;
  const vp = verified.programs.find((p) => p.schoolSlug === slug && p.admissionsEmail === email);
  data.schoolContacts.push({
    schoolSlug: slug,
    role: "admissions_officer",
    email,
    sourceUrl: vp?.applicationUrl || vp?.sourceUrl || school.website,
    sourceType: "official_university_website",
    verificationDate: "2026-07-12",
    confidenceLevel: "High",
    notes: `Promoted from verified programme data (${count} programmes)`,
  });
  existing.add(slug);
  added++;
}

fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n");
console.log(`Promoted ${added} school contacts from programme emails`);
