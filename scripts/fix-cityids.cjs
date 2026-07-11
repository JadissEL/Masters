/**
 * Fixes cityId assignments for schools that should have cities.
 */
const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(process.cwd(), "data", "masters-data.json");
const db = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

// Map school slugs to city slugs for schools with null cityId
const schoolCityMap = {
  "cnam": "paris",
  "nord-university": "oslo", // Nord has Oslo study center
};

let fixed = 0;
for (const school of db.schools) {
  if (school.cityId === null || school.cityId === undefined) {
    const citySlug = schoolCityMap[school.slug];
    if (citySlug) {
      const city = db.cities.find((c) => c.slug === citySlug);
      if (city) {
        school.cityId = city.id;
        fixed++;
        console.log(`Fixed: ${school.slug} → cityId ${city.id} (${city.name})`);
      }
    }
  }
}

fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2), "utf-8");
console.log(`✅ Fixed ${fixed} school cityId assignments.`);
console.log(`   Total schools: ${db.schools.length}`);
console.log(`   Schools with null cityId: ${db.schools.filter(s => !s.cityId).length}`);