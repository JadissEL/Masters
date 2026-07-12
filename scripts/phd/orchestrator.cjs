#!/usr/bin/env node
/**
 * PhD discovery orchestrator — merge agent batches, audit coverage, report gaps.
 * Usage:
 *   node scripts/phd/orchestrator.cjs merge
 *   node scripts/phd/orchestrator.cjs audit
 *   node scripts/phd/orchestrator.cjs gaps
 *   node scripts/phd/orchestrator.cjs status
 */
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../data/phd");
const VERIFIED_PATH = path.join(DATA_DIR, "phd-verified.json");
const AUDIT_PATH = path.join(DATA_DIR, "audit-report.json");
const UPCOMING_PATH = path.join(DATA_DIR, "phd-upcoming-cycles.json");
const TODAY = new Date().toISOString().slice(0, 10);

const DINA_DOMAINS = [
  "finance", "accounting", "compliance", "investment banking", "m&a",
  "corporate finance", "private equity", "asset management", "risk",
  "financial advisory", "audit", "healthcare", "banking",
];

function loadVerified() {
  if (!fs.existsSync(VERIFIED_PATH)) {
    return { lastUpdated: TODAY, phdOffers: [], waves: [] };
  }
  return JSON.parse(fs.readFileSync(VERIFIED_PATH, "utf-8"));
}

function saveVerified(data) {
  data.lastUpdated = TODAY;
  fs.writeFileSync(VERIFIED_PATH, JSON.stringify(data, null, 2) + "\n");
}

function merge() {
  const verified = loadVerified();
  const byKey = new Map(
    verified.phdOffers.map((o) => [`${o.id || o.applyUrl || o.title}`, o])
  );
  let added = 0;
  let updated = 0;

  const files = fs
    .readdirSync(DATA_DIR)
    .filter(
      (f) =>
        /^batch-agent-\d+\.json$/.test(f) ||
        /^batch-wave2-.+\.json$/.test(f) ||
        /^batch-wave3-.+\.json$/.test(f)
    )
    .sort();

  for (const file of files) {
    const batch = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
    for (const offer of batch.phdOffers || []) {
      const key = offer.id || offer.applyUrl || `${offer.institution}-${offer.title}`;
      if (!byKey.has(key)) {
        added++;
      } else {
        updated++;
      }
      byKey.set(key, offer);
    }
  }

  verified.phdOffers = [...byKey.values()];
  verified.waves = verified.waves || [];
  verified.waves.push({ date: TODAY, action: "merge", added, updated, total: verified.phdOffers.length });
  saveVerified(verified);

  const upcoming = [];
  for (const file of files) {
    const batch = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
    for (const cycle of batch.upcomingCyclesToMonitor || []) {
      upcoming.push({ ...cycle, fromBatch: file, lastChecked: TODAY });
    }
  }
  if (upcoming.length) {
    fs.writeFileSync(
      UPCOMING_PATH,
      JSON.stringify({ lastUpdated: TODAY, cycles: upcoming }, null, 2) + "\n"
    );
  }

  console.log(`Merged +${added} new, ${updated} updated (${verified.phdOffers.length} total)`);
  if (upcoming.length) console.log(`Upcoming cycles tracked: ${upcoming.length}`);
}

function parseDeadline(d) {
  if (!d) return null;
  const t = Date.parse(d);
  return Number.isNaN(t) ? null : t;
}

function audit() {
  const verified = loadVerified();
  const open = [];
  const closed = [];
  const now = Date.now();

  for (const o of verified.phdOffers) {
    const dl = parseDeadline(o.applicationDeadline);
    if (o.status === "closed" || (dl && dl < now)) closed.push(o);
    else open.push(o);
  }

  const byCountry = {};
  for (const o of open) {
    byCountry[o.countrySlug] = (byCountry[o.countrySlug] || 0) + 1;
  }

  const report = {
    generatedAt: TODAY,
    total: verified.phdOffers.length,
    open: open.length,
    closed: closed.length,
    byCountry,
    withSupervisorEmail: open.filter((o) => o.supervisors?.some((s) => s.email)).length,
    withLinkedIn: open.filter((o) => o.supervisors?.some((s) => s.linkedinUrl)).length,
    withStudentSample: open.filter((o) => (o.enrolledStudentsSample?.length || 0) >= 1).length,
    funded: open.filter((o) => o.fundingType && o.fundingType !== "unknown" && o.fundingType !== "self_funded").length,
  };

  fs.writeFileSync(AUDIT_PATH, JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
}

function gaps() {
  const batches = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
    const p = path.join(DATA_DIR, `agent-batch-${n}.json`);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf-8")) : null;
  });

  const verified = loadVerified();
  const openByCountry = {};
  for (const o of verified.phdOffers) {
    if (o.status !== "closed") {
      openByCountry[o.countrySlug] = (openByCountry[o.countrySlug] || 0) + 1;
    }
  }

  console.log("Country coverage (open offers):");
  for (const b of batches) {
    if (!b) continue;
    for (const c of b.countries || []) {
      const n = openByCountry[c.slug] || 0;
      const flag = n === 0 ? "MISSING" : n < 5 ? "LOW" : "OK";
      console.log(`  [${flag}] ${c.slug}: ${n} open (agent ${b.agentId})`);
    }
  }
}

function status() {
  const v = loadVerified();
  const batches = fs.readdirSync(DATA_DIR).filter((f) => /^batch-agent-\d+\.json$/.test(f));
  console.log(`Verified offers: ${v.phdOffers?.length || 0}`);
  console.log(`Agent batch files: ${batches.length}`);
  if (fs.existsSync(AUDIT_PATH)) {
    console.log("Last audit:", JSON.parse(fs.readFileSync(AUDIT_PATH, "utf-8")));
  }
}

const cmd = process.argv[2] || "status";
if (cmd === "merge") merge();
else if (cmd === "audit") audit();
else if (cmd === "gaps") gaps();
else if (cmd === "status") status();
else {
  console.error("Unknown command:", cmd);
  process.exit(1);
}
