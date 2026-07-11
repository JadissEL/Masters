/**
 * Seed script (legacy).
 *
 * The application now uses a pure-JavaScript JSON data store
 * (`data/masters-data.json`) loaded by `src/lib/data-store.ts`.
 * The SQLite-based seed script is no longer required because
 * the JSON file already contains all countries, cities, schools,
 * programs, admissions, visas, living costs, student jobs,
 * graduate visas, scholarships, scores, and deadlines.
 *
 * This file is kept as a no-op so the `npm run seed` script does
 * not break, while avoiding the native `better-sqlite3` dependency.
 */
async function main() {
  console.log("Seed: skipped — data is served from data/masters-data.json (pure JS data store).");
  console.log("To update data, edit data/masters-data.json directly or run the scraper (npm run scrape).");
}

main().catch(console.error);