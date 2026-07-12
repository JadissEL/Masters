#!/usr/bin/env node
/** Remove low-quality / non-admissions emails from discovered contacts. */
const fs = require("fs");
const path = require("path");

const DISCOVERED = path.join(__dirname, "../data/discovered-school-contacts.json");

const REJECT = /^(webmaster|postmaster|admin|support|helpdesk|noreply|no-reply|newsletter|marketing|communication|com@|presse|media|hr|jobs|career|alumni|library|biblio)@/i;

const data = JSON.parse(fs.readFileSync(DISCOVERED, "utf-8"));
const before = data.schoolContacts.length;

data.schoolContacts = data.schoolContacts.filter((c) => {
  if (!c.email || REJECT.test(c.email)) return false;
  if (c.confidenceLevel === "Low" && !/admission|scolarite|masters|graduate|study@|enquir/i.test(c.email)) return false;
  return true;
});

data.removed = before - data.schoolContacts.length;
fs.writeFileSync(DISCOVERED, JSON.stringify(data, null, 2) + "\n");
console.log(`Cleaned: ${before} → ${data.schoolContacts.length} (removed ${data.removed})`);
