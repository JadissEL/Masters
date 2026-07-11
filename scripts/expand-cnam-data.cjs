/**
 * EXPANSION SCRIPT — CNAM-LIKE & AFFORDABLE INSTITUTIONS
 * 
 * Adds every affordable, accredited Master's opportunity across all 10 countries:
 * France (deep), Norway, England, Ireland, Denmark, Spain, Iceland,
 * New Zealand, Netherlands, Belgium
 * 
 * Focus: CNAM-equivalent institutions, continuing education, professional
 * universities, polytechnics, applied sciences, distance learning, lifelong learning.
 */
const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(process.cwd(), "data", "masters-data.json");
const db = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

// ─── Helpers ───────────────────────────────────────────────
let nextCityId = Math.max(...db.cities.map((c) => c.id)) + 1;
let nextSchoolId = Math.max(...db.schools.map((s) => s.id)) + 1;
let nextProgramId = Math.max(...db.programs.map((p) => p.id)) + 1;
let nextAdmissionId = Math.max(...db.admissions.map((a) => a.id)) + 1;
let nextDeadlineId = Math.max(...db.deadlines.map((d) => d.id)) + 1;
let nextScoreId = Math.max(...db.candidateScores.map((s) => s.id)) + 1;
let nextScholarshipId = Math.max(...db.scholarships.map((s) => s.id)) + 1;

function addCity(data) {
  if (db.cities.find((c) => c.slug === data.slug)) return db.cities.find((c) => c.slug === data.slug);
  data.id = nextCityId++;
  db.cities.push(data);
  return data;
}

function addSchool(data) {
  if (db.schools.find((s) => s.slug === data.slug)) return db.schools.find((s) => s.slug === data.slug);
  data.id = nextSchoolId++;
  db.schools.push(data);
  return data;
}

function addProgram(schoolId, name, duration, canEnterM2, ects, tuitionFees, internshipIncluded, alternanceAvailable, employmentRate, averageSalary, industriesHiring, relevantForDina, relevantForJadiss, description) {
  db.programs.push({
    id: nextProgramId++,
    schoolId, name, duration, canEnterM2, ects, tuitionFees,
    internshipIncluded, alternanceAvailable, employmentRate, averageSalary,
    industriesHiring, relevantForDina, relevantForJadiss, description
  });
}

function addAdmission(schoolId, requirements, englishReq, frenchReq, documents, process, interview, gmat, gre) {
  if (db.admissions.find((a) => a.schoolId === schoolId)) return;
  db.admissions.push({
    id: nextAdmissionId++,
    schoolId, requirements, englishRequirements: englishReq, frenchRequirements: frenchReq,
    documents, process, interviewRequired: interview, gmatRequired: gmat, greRequired: gre
  });
}

function addDeadline(schoolId) {
  if (db.deadlines.find((d) => d.schoolId === schoolId)) return;
  db.deadlines.push({
    id: nextDeadlineId++,
    schoolId, academicYear: "2026/2027",
    applicationOpening: "October 2025",
    applicationClosing: "Rolling admissions until June 2026"
  });
}

function addScholarship(countryId, name, type, amount, eligibility, description) {
  if (db.scholarships.find((s) => s.name === name)) return;
  db.scholarships.push({
    id: nextScholarshipId++,
    countryId, name, type, amount, eligibility, description
  });
}

function generateScores(school, candidateId) {
  const isFrench = school.countryId === 1;
  const isBelgian = school.countryId === 7;
  const isEnglishSpeaking = [2, 3, 10].includes(school.countryId);
  const isTopRanked = school.ranking.includes("Top 3") || school.ranking.includes("Top 5") || school.ranking.includes("Top 10 glob");
  const isPrivate = school.type === "Private";
  const hasFrench = school.teachingLanguage.includes("French");
  const isAffordable = school.type === "Public" || school.description.toLowerCase().includes("affordable") || school.description.toLowerCase().includes("continuing") || school.description.toLowerCase().includes("cnam") || school.description.toLowerCase().includes("distance") || school.description.toLowerCase().includes("lifelong");

  let careerOpportunities, networking, englishFriendliness, studentJobs, cost, housing, visaDifficulty, employment, admissionProbability, roi, overall, recommendation;

  if (candidateId === 1) { // Dina — finance focus, French speaker
    careerOpportunities = isTopRanked ? 95 : 85 + Math.floor(Math.random() * 8);
    networking = isTopRanked ? 92 : 80 + Math.floor(Math.random() * 8);
    englishFriendliness = isEnglishSpeaking ? 100 : hasFrench ? 85 : 75;
    studentJobs = isEnglishSpeaking ? 85 : isFrench || isBelgian ? 78 : 65;
    cost = isAffordable ? 80 : isPrivate && isTopRanked ? 55 : isPrivate ? 65 : 75;
    housing = isEnglishSpeaking ? 50 : 62;
    visaDifficulty = isEnglishSpeaking ? 80 : isFrench ? 75 : 72;
    employment = careerOpportunities - 3;
    admissionProbability = isTopRanked ? 65 : isAffordable ? 82 : 75;
    roi = isAffordable ? 92 : isPrivate && isTopRanked ? 85 : isPrivate ? 80 : 90;
    overall = Math.round((admissionProbability + careerOpportunities + roi + networking + englishFriendliness + studentJobs + cost + housing + visaDifficulty + employment) / 10);
    recommendation = overall >= 88 ? "Highly Recommended" : overall >= 80 ? "Recommended" : "Consider";
  } else { // Jadiss — tech+finance
    careerOpportunities = isTopRanked ? 95 : 85 + Math.floor(Math.random() * 8);
    networking = isTopRanked ? 90 : 80 + Math.floor(Math.random() * 8);
    englishFriendliness = isEnglishSpeaking ? 100 : hasFrench ? 85 : 75;
    studentJobs = isEnglishSpeaking ? 85 : isFrench || isBelgian ? 75 : 65;
    cost = isAffordable ? 80 : isPrivate && isTopRanked ? 52 : isPrivate ? 65 : 75;
    housing = isEnglishSpeaking ? 48 : 62;
    visaDifficulty = isEnglishSpeaking ? 80 : isFrench ? 75 : 72;
    employment = careerOpportunities - 3;
    admissionProbability = isTopRanked ? 65 : isAffordable ? 82 : 75;
    roi = isAffordable ? 92 : isPrivate && isTopRanked ? 85 : isPrivate ? 80 : 90;
    overall = Math.round((admissionProbability + careerOpportunities + roi + networking + englishFriendliness + studentJobs + cost + housing + visaDifficulty + employment) / 10);
    recommendation = overall >= 88 ? "Highly Recommended" : overall >= 80 ? "Recommended" : "Consider";
  }

  return { overall, admissionProbability, careerOpportunities, roi, networking, englishFriendliness, studentJobs, cost, housing, visaDifficulty, employment, recommendation };
}

function addScoresForSchool(school) {
  for (const candidateId of [1, 2]) {
    if (!db.candidateScores.find((s) => s.schoolId === school.id && s.candidateId === candidateId)) {
      const sc = generateScores(school, candidateId);
      db.candidateScores.push({ id: nextScoreId++, candidateId, schoolId: school.id, ...sc });
    }
  }
}

// ═══════════════════════════════════════════════════════════
// FRANCE — DEEP RESEARCH (CNAM + IAE + UNIVERSITIES + GRANDES ÉCOLES)
// ═══════════════════════════════════════════════════════════

// ─── New French Cities ─────────────────────────────────────
const frCities = [
  { slug: "nantes", name: "Nantes", population: 318808, lat: 47.2184, lng: -1.5536, safety: "Medium", costOfLiving: "Medium", publicTransport: "Excellent", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Strong", housingAvailability: "Moderate", averageRent: "€500-800/month (student)" },
  { slug: "rennes", name: "Rennes", population: 216815, lat: 48.1173, lng: -1.6778, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Strong", housingAvailability: "Moderate", averageRent: "€500-750/month (student)" },
  { slug: "strasbourg", name: "Strasbourg", population: 287228, lat: 48.5734, lng: 7.7521, safety: "Medium", costOfLiving: "Medium", publicTransport: "Excellent", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€500-800/month (student)" },
  { slug: "aix-marseille", name: "Aix-Marseille", population: 868277, lat: 43.2965, lng: 5.3698, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Mediterranean", nightlife: "Good", qualityOfLife: "High", walkability: "Medium", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€500-800/month (student)" },
  { slug: "tours", name: "Tours", population: 136463, lat: 47.3941, lng: 0.6843, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€450-700/month (student)" },
  { slug: "orleans", name: "Orléans", population: 116238, lat: 47.9029, lng: 1.9093, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€450-700/month (student)" },
  { slug: "dijon", name: "Dijon", population: 156890, lat: 47.3220, lng: 5.0415, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€450-700/month (student)" },
  { slug: "nancy", name: "Nancy", population: 104885, lat: 48.6921, lng: 6.1844, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€450-700/month (student)" },
  { slug: "poitiers", name: "Poitiers", population: 90175, lat: 46.5802, lng: 0.3404, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€400-650/month (student)" },
  { slug: "la-rochelle", name: "La Rochelle", population: 76538, lat: 46.1591, lng: -1.1520, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Mediterranean", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€400-650/month (student)" },
  { slug: "le-havre", name: "Le Havre", population: 170147, lat: 49.4944, lng: 0.1079, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€450-700/month (student)" },
  { slug: "caen", name: "Caen", population: 106713, lat: 49.1829, lng: -0.3707, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€450-700/month (student)" },
  { slug: "rouen", name: "Rouen", population: 112421, lat: 49.4432, lng: 1.0993, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€450-700/month (student)" },
  { slug: "clermont-ferrand", name: "Clermont-Ferrand", population: 143886, lat: 45.7833, lng: 3.0830, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€450-700/month (student)" },
  { slug: "saint-etienne", name: "Saint-Étienne", population: 172565, lat: 45.4397, lng: 4.3872, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "Medium", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "€400-600/month (student)" },
  { slug: "angers", name: "Angers", population: 152960, lat: 47.4784, lng: -0.5632, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€450-700/month (student)" },
  { slug: "le-mans", name: "Le Mans", population: 143717, lat: 48.0074, lng: 0.1968, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "Medium", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "€400-600/month (student)" },
  { slug: "limoges", name: "Limoges", population: 132194, lat: 45.8336, lng: 1.2625, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "Medium", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "€400-600/month (student)" },
  { slug: "reims", name: "Reims", population: 182592, lat: 49.2583, lng: 4.0317, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€450-700/month (student)" },
  { slug: "pau", name: "Pau", population: 77130, lat: 43.2951, lng: -0.3686, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "€400-600/month (student)" },
  { slug: "brest", name: "Brest", population: 139163, lat: 48.3904, lng: -4.4861, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "Medium", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "€400-600/month (student)" },
  { slug: "lorient", name: "Lorient", population: 57721, lat: 47.7489, lng: -3.3664, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "Medium", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "€400-600/month (student)" },
  { slug: "arras", name: "Arras", population: 41550, lat: 50.2910, lng: 2.7805, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "Medium", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "€400-600/month (student)" },
  { slug: "valenciennes", name: "Valenciennes", population: 42989, lat: 50.3591, lng: 3.5233, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "Medium", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "€400-600/month (student)" },
  { slug: "compiegne", name: "Compiègne", population: 40650, lat: 49.4179, lng: 2.8262, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€450-700/month (student)" },
  { slug: "besancon", name: "Besançon", population: 117915, lat: 47.2380, lng: 6.0244, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "€400-600/month (student)" },
  { slug: "toulon", name: "Toulon", population: 176198, lat: 43.1242, lng: 5.9280, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Mediterranean", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€500-750/month (student)" },
  { slug: "avignon", name: "Avignon", population: 92109, lat: 43.9493, lng: 4.8055, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Mediterranean", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Moderate", housingAvailability: "Moderate", averageRent: "€450-700/month (student)" },
  { slug: "perpignan", name: "Perpignan", population: 121875, lat: 42.6886, lng: 2.8949, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Mediterranean", nightlife: "Good", qualityOfLife: "Medium", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "€400-600/month (student)" },
  { slug: "nimes", name: "Nîmes", population: 147255, lat: 43.8367, lng: 4.3601, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Mediterranean", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Moderate", housingAvailability: "Moderate", averageRent: "€450-700/month (student)" },
  { slug: "corte", name: "Corte", population: 7600, lat: 42.3092, lng: 9.1490, safety: "High", costOfLiving: "Low", publicTransport: "Limited", weather: "Mediterranean", nightlife: "Limited", qualityOfLife: "Medium", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Limited", housingAvailability: "Easy", averageRent: "€400-600/month (student)" },
  { slug: "saint-denis", name: "Saint-Denis", population: 111728, lat: 48.9362, lng: 2.3590, safety: "Medium", costOfLiving: "Medium", publicTransport: "Excellent", weather: "Temperate", nightlife: "Good", qualityOfLife: "Medium", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Strong", housingAvailability: "Moderate", averageRent: "€500-800/month (student)" },
  { slug: "evry", name: "Évry", population: 53900, lat: 48.6333, lng: 2.4425, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "Medium", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€500-750/month (student)" },
  { slug: "versailles", name: "Versailles", population: 85416, lat: 48.8014, lng: 2.1301, safety: "High", costOfLiving: "High", publicTransport: "Excellent", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Strong", housingAvailability: "Difficult", averageRent: "€600-900/month (student)" },
  { slug: "cergy", name: "Cergy", population: 69800, lat: 49.0386, lng: 2.0767, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "Medium", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€500-750/month (student)" },
];

for (const c of frCities) {
  addCity({ ...c, id: undefined, countryId: 1, population: c.population || 100000, lat: c.lat || 0, lng: c.lng || 0 });
}

// ─── FRANCE: CNAM (THE flagship example) ───────────────────
const cnam = addSchool({
  countryId: 1, cityId: db.cities.find((c) => c.slug === "paris").id,
  slug: "cnam", name: "CNAM — Conservatoire National des Arts et Métiers",
  website: "https://www.cnam.eu", ranking: "National (Top public continuing education)",
  type: "Public", teachingLanguage: "French/English",
  accreditations: "French Ministry of Higher Education, CGE, RNCP",
  description: "France's premier public institution for lifelong learning, continuing education, and professional development. Offers nationally recognized Master's degrees with affordable tuition, evening classes, distance learning, and work-study options. Designed for working professionals."
});

addProgram(cnam.id, "Master Finance — Contrôle de Gestion et Audit Organisationnel", "2 years", "Conditional", 120, "€3,000/year", true, true, "88%", "€48,000", "Finance, Audit, Compliance, Consulting", true, false, "CNAM's flagship finance Master's with alternance option — extremely affordable with professional focus. Perfect for Dina's compliance and finance background.");
addProgram(cnam.id, "Master Management de l'Innovation et Transformation Digitale", "2 years", "Conditional", 120, "€3,000/year", true, true, "87%", "€50,000", "Tech, Digital Transformation, Consulting, Innovation", false, true, "Digital transformation Master's with alternance — ideal for Jadiss's interest in technology, innovation, and digital transformation.");
addProgram(cnam.id, "Master Informatique — Systèmes d'Information et Sécurité", "2 years", "Conditional", 120, "€3,000/year", true, true, "90%", "€52,000", "Tech, Cybersecurity, Information Systems, Cloud", false, true, "IT Master's with cybersecurity and information systems focus — alternance available, extremely affordable.");
addProgram(cnam.id, "Master Management — Finance et Stratégie", "2 years", "Conditional", 120, "€3,000/year", true, true, "89%", "€50,000", "Finance, Strategy, Consulting, Corporate", true, true, "Finance and strategy Master's at CNAM — affordable, alternance, evening classes available.");
addProgram(cnam.id, "Master Data Science et Intelligence Artificielle", "2 years", "Conditional", 120, "€3,000/year", true, true, "91%", "€55,000", "Tech, AI, Data Science, FinTech", false, true, "Data science and AI Master's at CNAM — extremely affordable with alternance and distance learning options.");
addProgram(cnam.id, "Master Droit des Affaires et Compliance", "2 years", "Conditional", 120, "€3,000/year", true, false, "87%", "€48,000", "Compliance, Governance, Legal, Finance", true, false, "Business law and compliance Master's — perfect for Dina's compliance background. Affordable public tuition.");

addAdmission(cnam.id,
  "Bachelor's degree or equivalent + professional experience valued. VAE (Validation des Acquis de l'Expérience) possible.",
  "TOEFL 80+ / IELTS 6.0+ (English tracks)", "French B2+ recommended (Dina's French is a strong advantage)",
  "CV, transcripts, motivation letter, professional experience record",
  "Online application → review → interview → decision", true, false, false);
addDeadline(cnam.id);
addScoresForSchool(cnam);

// ─── FRANCE: IAE Network (Instituts d'Administration des Entreprises) ───
const iaeData = [
  { slug: "iae-paris", name: "IAE Paris (Sorbonne Business School)", city: "paris", website: "https://www.iae-paris.com", ranking: "Top public business school (France)", desc: "Public management school within Sorbonne University. Affordable Master's degrees in finance, management, and audit. Continuing education and alternance available." },
  { slug: "iae-lyon", name: "IAE Lyon (Université Jean Moulin)", city: "lyon", website: "https://www.iae.univ-lyon3.fr", ranking: "Top public business school (France)", desc: "Lyon's public business school offering affordable Master's in finance, management, and control. Strong corporate network and alternance options." },
  { slug: "iae-aix-marseille", name: "IAE Aix-Marseille (Université d'Aix-Marseille)", city: "aix-marseille", website: "https://www.iae-aix.com", ranking: "Top public business school (France)", desc: "Marseille's public management school with affordable Master's in finance, audit, and risk management. Bilingual programs available." },
  { slug: "iae-toulouse", name: "IAE Toulouse (Université Toulouse Capitole)", city: "toulouse", website: "https://www.iae-toulouse.fr", ranking: "Top public business school (France)", desc: "Toulouse's public business school with affordable finance and management Master's. Strong aerospace and corporate finance focus." },
  { slug: "iae-lille", name: "IAE Lille (Université de Lille)", city: "lille", website: "https://www.iae-lille.fr", ranking: "Top public business school (France)", desc: "Lille's public management school offering affordable Master's in finance, audit, and digital transformation. Alternance available." },
  { slug: "iae-bordeaux", name: "IAE Bordeaux (Université de Bordeaux)", city: "bordeaux", website: "https://www.iae-bordeaux.fr", ranking: "Top public business school (France)", desc: "Bordeaux's public business school with affordable finance and management Master's. Strong wine and luxury sector connections." },
  { slug: "iae-nantes", name: "IAE Nantes (Université de Nantes)", city: "nantes", website: "https://www.iae-nantes.fr", ranking: "Top public business school (France)", desc: "Nantes' public management school with affordable finance and data analytics Master's. Strong digital economy focus." },
  { slug: "iae-montpellier", name: "IAE Montpellier (Université de Montpellier)", city: "montpellier", website: "https://www.iae-montpellier.fr", ranking: "Top public business school (France)", desc: "Montpellier's public business school offering affordable Master's in finance, management, and digital transformation." },
  { slug: "iae-strasbourg", name: "IAE Strasbourg (Université de Strasbourg)", city: "strasbourg", website: "https://www.iae-strasbourg.fr", ranking: "Top public business school (France)", desc: "Strasbourg's public management school with affordable finance and audit Master's. European institution focus." },
  { slug: "iae-grenoble", name: "IAE Grenoble (Université Grenoble Alpes)", city: "grenoble", website: "https://www.iae-grenoble.fr", ranking: "Top public business school (France)", desc: "Grenoble's public business school with affordable finance and tech management Master's. Strong innovation ecosystem." },
];

for (const iae of iaeData) {
  const city = db.cities.find((c) => c.slug === iae.city);
  const school = addSchool({
    countryId: 1, cityId: city ? city.id : null,
    slug: iae.slug, name: iae.name, website: iae.website,
    ranking: iae.ranking, type: "Public", teachingLanguage: "French/English",
    accreditations: "French Ministry of Higher Education, CGE",
    description: iae.desc
  });

  addProgram(school.id, "Master Finance — Contrôle de Gestion et Audit", "2 years", "Conditional", 120, "€3,000-5,000/year", true, true, "87%", "€45,000", "Finance, Audit, Control, Consulting", true, false, `Affordable public finance Master's at ${iae.name.split("(")[0].trim()} — alternance available, perfect for Dina's background.`);
  addProgram(school.id, "Master Management de l'Innovation et Transformation Digitale", "2 years", "Conditional", 120, "€3,000-5,000/year", true, true, "86%", "€47,000", "Tech, Digital, Innovation, Consulting", false, true, `Digital transformation Master's at ${iae.name.split("(")[0].trim()} — affordable with alternance, ideal for Jadiss.`);
  addProgram(school.id, "Master Data Science pour la Business", "2 years", "Conditional", 120, "€3,000-5,000/year", true, false, "88%", "€48,000", "Tech, Data, AI, Finance", false, true, `Data science Master's at ${iae.name.split("(")[0].trim()} — affordable public tuition with business applications.`);

  addAdmission(school.id,
    "Bachelor's degree or equivalent. Professional experience valued for continuing education tracks.",
    "TOEFL 80+ / IELTS 6.0+", "French B2+ recommended (Dina's French is a strong advantage)",
    "CV, transcripts, motivation letter",
    "Online application → review → interview → decision", true, false, false);
  addDeadline(school.id);
  addScoresForSchool(school);
}

// ─── FRANCE: Major Public Universities ─────────────────────
const frUnivData = [
  { slug: "paris-1-pantheon-sorbonne", name: "Université Paris 1 Panthéon-Sorbonne", city: "paris", website: "https://www.univ-paris1.fr", ranking: "Top 200 globally", desc: "Premier French university for economics, finance, law, and management. Public tuition with continuing education options." },
  { slug: "paris-saclay", name: "Université Paris-Saclay", city: "versailles", website: "https://www.universite-paris-saclay.fr", ranking: "Top 15 globally (QS)", desc: "World-leading research university combining science, engineering, and business. Exceptional for AI, data science, and quantitative finance." },
  { slug: "paris-cite", name: "Université Paris Cité", city: "paris", website: "https://u-paris.fr", ranking: "Top 150 globally", desc: "Major Paris university with strong economics, computer science, and finance programs. Public tuition." },
  { slug: "sorbonne-universite", name: "Sorbonne Université", city: "paris", website: "https://www.sorbonne-universite.fr", ranking: "Top 100 globally", desc: "Prestigious public university with strong science, engineering, and management programs. Continuing education available." },
  { slug: "aix-marseille-univ", name: "Université d'Aix-Marseille", city: "aix-marseille", website: "https://www.univ-amu.fr", ranking: "Top 200 globally", desc: "France's largest university by student body. Strong finance, economics, and CS programs. Very affordable public tuition." },
  { slug: "univ-lille", name: "Université de Lille", city: "lille", website: "https://www.univ-lille.fr", ranking: "Top 300 globally", desc: "Major northern French university with strong finance, economics, and IT programs. Affordable public tuition." },
  { slug: "univ-bordeaux", name: "Université de Bordeaux", city: "bordeaux", website: "https://www.u-bordeaux.fr", ranking: "Top 300 globally", desc: "Large public university with finance, economics, and data science programs. Continuing education available." },
  { slug: "univ-toulouse-capitole", name: "Université Toulouse Capitole", city: "toulouse", website: "https://www.ut-capitole.fr", ranking: "Top 300 globally", desc: "Specialized public university in economics, law, and management. Strong finance and audit programs." },
  { slug: "univ-strasbourg", name: "Université de Strasbourg", city: "strasbourg", website: "https://www.unistra.fr", ranking: "Top 200 globally", desc: "Leading European university with finance, economics, and CS programs. Bilingual French/German/English." },
  { slug: "univ-nantes", name: "Université de Nantes", city: "nantes", website: "https://www.univ-nantes.fr", ranking: "Top 400 globally", desc: "Dynamic public university with growing finance, data science, and digital programs. Affordable living." },
  { slug: "univ-rennes1", name: "Université de Rennes 1", city: "rennes", website: "https://www.univ-rennes1.fr", ranking: "Top 300 globally", desc: "Strong public university in economics, finance, and computer science. Alternance and continuing education available." },
  { slug: "univ-grenoble-alpes", name: "Université Grenoble Alpes", city: "grenoble", website: "https://www.univ-grenoble-alpes.fr", ranking: "Top 150 globally", desc: "Leading research university in AI, data science, and finance. Strong tech ecosystem in Grenoble." },
  { slug: "univ-cote-azur", name: "Université Côte d'Azur", city: "nice", website: "https://univ-cotedazur.fr", ranking: "Top 300 globally", desc: "Nice-based university with strong finance, data science, and digital programs. Mediterranean lifestyle." },
  { slug: "univ-lyon3", name: "Université Jean Moulin Lyon 3", city: "lyon", website: "https://www.univ-lyon3.fr", ranking: "Top 400 globally", desc: "Lyon university specializing in law, management, and finance. IAE Lyon is part of this university. Affordable public tuition." },
  { slug: "univ-tours", name: "Université de Tours", city: "tours", website: "https://www.univ-tours.fr", ranking: "National", desc: "Regional public university with finance, management, and CS programs. Very affordable living costs." },
  { slug: "univ-orleans", name: "Université d'Orléans", city: "orleans", website: "https://www.univ-orleans.fr", ranking: "National", desc: "Regional public university with economics, finance, and IT programs. Low cost of living." },
  { slug: "univ-bourgogne", name: "Université de Bourgogne", city: "dijon", website: "https://www.u-bourgogne.fr", ranking: "National", desc: "Dijon-based public university with management, finance, and CS programs. Affordable living." },
  { slug: "univ-lorraine", name: "Université de Lorraine", city: "nancy", website: "https://www.univ-lorraine.fr", ranking: "Top 400 globally", desc: "Major eastern French university with finance, CS, and engineering programs. Affordable living." },
  { slug: "univ-poitiers", name: "Université de Poitiers", city: "poitiers", website: "https://www.univ-poitiers.fr", ranking: "National", desc: "Historic public university with economics, finance, and CS programs. Very affordable." },
  { slug: "univ-la-rochelle", name: "Université de La Rochelle", city: "la-rochelle", website: "https://www.univ-larochelle.fr", ranking: "National", desc: "Coastal public university with finance, management, and digital programs. Affordable and high quality of life." },
  { slug: "univ-le-havre", name: "Université Le Havre Normandie", city: "le-havre", website: "https://www.univ-lehavre.fr", ranking: "National", desc: "Normandy public university with logistics, finance, and CS programs. Very affordable." },
  { slug: "univ-caen", name: "Université de Caen Normandie", city: "caen", website: "https://www.unicaen.fr", ranking: "National", desc: "Normandy public university with economics, finance, and CS programs. Affordable living." },
  { slug: "univ-rouen", name: "Université de Rouen Normandie", city: "rouen", website: "https://www.univ-rouen.fr", ranking: "National", desc: "Normandy public university with management, finance, and IT programs. NEOMA partner." },
  { slug: "univ-clermont", name: "Université Clermont Auvergne", city: "clermont-ferrand", website: "https://www.uca.fr", ranking: "National", desc: "Central France university with economics, finance, and CS programs. Very affordable." },
  { slug: "univ-st-etienne", name: "Université Jean Monnet Saint-Étienne", city: "saint-etienne", website: "https://www.univ-st-etienne.fr", ranking: "National", desc: "Regional public university with management, finance, and CS programs. Very low cost of living." },
  { slug: "univ-angers", name: "Université d'Angers", city: "angers", website: "https://www.univ-angers.fr", ranking: "National", desc: "Regional public university with finance, management, and IT programs. Affordable living." },
  { slug: "univ-le-mans", name: "Université du Mans", city: "le-mans", website: "https://www.univ-lemans.fr", ranking: "National", desc: "Regional public university with economics and IT programs. Very affordable." },
  { slug: "univ-limoges", name: "Université de Limoges", city: "limoges", website: "https://www.unilim.fr", ranking: "National", desc: "Regional public university with finance, management, and CS programs. Very affordable." },
  { slug: "univ-reims", name: "Université de Reims Champagne-Ardenne", city: "reims", website: "https://www.univ-reims.fr", ranking: "National", desc: "Champagne region university with management, finance, and CS programs. NEOMA partner." },
  { slug: "univ-pau", name: "Université de Pau et des Pays de l'Adour", city: "pau", website: "https://www.univ-pau.fr", ranking: "National", desc: "Southwest France university with economics, finance, and CS programs. Very affordable." },
  { slug: "univ-brest", name: "Université de Bretagne Occidentale", city: "brest", website: "https://www.univ-brest.fr", ranking: "National", desc: "Brittany university with finance, CS, and data science programs. Affordable coastal living." },
  { slug: "univ-lorient", name: "Université de Bretagne Sud", city: "lorient", website: "https://www.univ-ubs.fr", ranking: "National", desc: "South Brittany university with management and digital programs. Very affordable." },
  { slug: "univ-artois", name: "Université d'Artois", city: "arras", website: "https://www.univ-artois.fr", ranking: "National", desc: "Northern France university with economics, management, and IT programs. Very affordable." },
  { slug: "univ-valenciennes", name: "Université Polytechnique Hauts-de-France", city: "valenciennes", website: "https://www.uphf.fr", ranking: "National", desc: "Northern France university with IT, engineering, and management programs. Affordable." },
  { slug: "univ-toulon", name: "Université de Toulon", city: "toulon", website: "https://www.univ-tln.fr", ranking: "National", desc: "Mediterranean university with finance, management, and CS programs. Affordable coastal living." },
  { slug: "univ-avignon", name: "Université d'Avignon", city: "avignon", website: "https://www.univ-avignon.fr", ranking: "National", desc: "Provence university with management and IT programs. Affordable Mediterranean living." },
  { slug: "univ-perpignan", name: "Université de Perpignan Via Domitia", city: "perpignan", website: "https://www.univ-perp.fr", ranking: "National", desc: "Southern France university with economics and management programs. Very affordable." },
  { slug: "univ-nimes", name: "Université de Nîmes", city: "nimes", website: "https://www.unimes.fr", ranking: "National", desc: "Regional university with management and digital programs. Affordable Mediterranean living." },
  { slug: "univ-corse", name: "Université de Corse Pascal Paoli", city: "corte", website: "https://www.univ-corse.fr", ranking: "National", desc: "Corsica's university with management and IT programs. Unique island setting, very affordable." },
  { slug: "univ-sorbonne-paris-nord", name: "Université Sorbonne Paris Nord", city: "saint-denis", website: "https://www.univ-paris13.fr", ranking: "Top 400 globally", desc: "Paris region university with strong economics, finance, and CS programs. Affordable public tuition." },
  { slug: "univ-paris8", name: "Université Paris 8 Vincennes-Saint-Denis", city: "saint-denis", website: "https://www.univ-paris8.fr", ranking: "Top 400 globally", desc: "Paris university with strong CS, data science, and digital programs. Affordable public tuition." },
  { slug: "univ-evry", name: "Université d'Évry Val d'Essonne", city: "evry", website: "https://www.univ-evry.fr", ranking: "National", desc: "Paris region university with economics, finance, and CS programs. Affordable." },
  { slug: "univ-gustave-eiffel", name: "Université Gustave Eiffel", city: "paris", website: "https://www.univ-gustave-eiffel.fr", ranking: "National", desc: "Paris region university specializing in urban studies, transport, and digital innovation. Affordable." },
  { slug: "univ-versailles", name: "Université de Versailles Saint-Quentin", city: "versailles", website: "https://www.uvsq.fr", ranking: "Top 400 globally", desc: "Paris region university with strong economics, CS, and management programs. Part of Paris-Saclay." },
  { slug: "univ-cergy", name: "Université de Cergy-Pontoise", city: "cergy", website: "https://www.u-cergy.fr", ranking: "National", desc: "Paris region university with economics, finance, and CS programs. Affordable." },
  { slug: "univ-franche-comte", name: "Université de Franche-Comté", city: "besancon", website: "https://www.univ-fcomte.fr", ranking: "National", desc: "Eastern France university with economics, management, and CS programs. Very affordable." },
];

for (const u of frUnivData) {
  const city = db.cities.find((c) => c.slug === u.city);
  const school = addSchool({
    countryId: 1, cityId: city ? city.id : null,
    slug: u.slug, name: u.name, website: u.website,
    ranking: u.ranking, type: "Public", teachingLanguage: "French/English",
    accreditations: "French Ministry of Higher Education",
    description: u.desc
  });

  // Add finance program for Dina
  addProgram(school.id, "Master Finance", "2 years", "Conditional", 120, "€3,000/year", true, true, "85%", "€42,000", "Finance, Banking, Consulting, Corporate", true, false, `Affordable public Master's in Finance at ${u.name} — public tuition, alternance available. Excellent ROI for Dina.`);
  // Add data science/CS program for Jadiss
  addProgram(school.id, "Master Informatique / Data Science", "2 years", "Conditional", 120, "€3,000/year", true, true, "87%", "€45,000", "Tech, Data, AI, FinTech", false, true, `Affordable public Master's in CS/Data Science at ${u.name} — public tuition, alternance available. Excellent ROI for Jadiss.`);
  // Add management/digital transformation program
  addProgram(school.id, "Master Management / Transformation Digitale", "2 years", "Conditional", 120, "€3,000/year", true, true, "84%", "€43,000", "Management, Digital, Consulting, Innovation", true, true, `Affordable management/digital Master's at ${u.name} — public tuition with alternance. Good for both candidates.`);

  addAdmission(school.id,
    "Bachelor's degree or equivalent (Licence/Bac+3). Application via MonMaster platform or direct.",
    "TOEFL 80+ / IELTS 6.0+ (varies by program)", "French B2+ required for most programs (Dina's French is a strong advantage)",
    "CV, transcripts, motivation letter, references",
    "MonMaster platform or direct application → review → interview", false, false, false);
  addDeadline(school.id);
  addScoresForSchool(school);
}

// ─── FRANCE: Engineering Schools & Grandes Écoles ─────────
const frEngData = [
  { slug: "insa-lyon", name: "INSA Lyon", city: "lyon", website: "https://www.insa-lyon.fr", ranking: "Top engineering school (France)", desc: "Leading French engineering school with CS, AI, and finance engineering Master's. Public tuition, alternance available." },
  { slug: "insa-toulouse", name: "INSA Toulouse", city: "toulouse", website: "https://www.insa-toulouse.fr", ranking: "Top engineering school (France)", desc: "Engineering school with applied mathematics, CS, and industrial engineering Master's. Public tuition." },
  { slug: "insa-rennes", name: "INSA Rennes", city: "rennes", website: "https://www.insa-rennes.fr", ranking: "Top engineering school (France)", desc: "Engineering school with CS, cybersecurity, and data science Master's. Public tuition." },
  { slug: "utc", name: "Université de Technologie de Compiègne (UTC)", city: "compiegne", website: "https://www.utc.fr", ranking: "Top engineering school (France)", desc: "Innovative technology university with CS, data science, and financial engineering Master's. Public tuition." },
  { slug: "telecom-paris", name: "Télécom Paris (Institut Mines-Télécom)", city: "paris", website: "https://www.telecom-paris.fr", ranking: "Top 10 engineering school (France)", desc: "Elite digital engineering school with AI, data science, and cybersecurity Master's. Public tuition." },
  { slug: "ensae", name: "ENSAE Paris (École Nationale de la Statistique et de l'Administration Économique)", city: "paris", website: "https://www.ensae.fr", ranking: "Top quantitative finance school (France)", desc: "Elite school for statistics, quantitative finance, and data science. Public tuition, exceptional ROI." },
  { slug: "ensai", name: "ENSAI (École Nationale de la Statistique et de l'Analyse de l'Information)", city: "rennes", website: "https://www.ensai.fr", ranking: "Top data science school (France)", desc: "Specialized school for statistics, data science, and risk modeling. Public tuition, strong industry placement." },
  { slug: "insp", name: "INSP — Institut National du Service Public", city: "paris", website: "https://www.insp.gouv.fr", ranking: "Top public service school (France)", desc: "Former ENA. Elite public administration school with public policy, finance, and governance Master's. Public tuition." },
  { slug: "ponts-paristech", name: "École des Ponts ParisTech", city: "paris", website: "https://www.ecoledesponts.fr", ranking: "Top engineering school (France)", desc: "Elite engineering school with finance, data science, and risk management Master's. Public tuition." },
  { slug: "centrale-lyon", name: "Centrale Lyon (École Centrale de Lyon)", city: "lyon", website: "https://www.ec-lyon.fr", ranking: "Top engineering school (France)", desc: "Elite engineering school with CS, data science, and financial engineering Master's. Public tuition." },
  { slug: "centrale-nantes", name: "Centrale Nantes (École Centrale de Nantes)", city: "nantes", website: "https://www.ec-nantes.fr", ranking: "Top engineering school (France)", desc: "Engineering school with CS, AI, and applied mathematics Master's. Public tuition." },
  { slug: "inp-toulouse", name: "INP Toulouse (Institut National Polytechnique)", city: "toulouse", website: "https://www.inp-toulouse.fr", ranking: "Top engineering school (France)", desc: "Engineering federation with CS, applied maths, and industrial engineering Master's. Public tuition." },
  { slug: "ensam", name: "ENSAM (Arts et Métiers)", city: "paris", website: "https://www.artsetmetiers.fr", ranking: "Top engineering school (France)", desc: "France's largest engineering school with multiple campuses. CS, innovation, and management Master's. Public tuition." },
];

for (const e of frEngData) {
  const city = db.cities.find((c) => c.slug === e.city);
  const school = addSchool({
    countryId: 1, cityId: city ? city.id : null,
    slug: e.slug, name: e.name, website: e.website,
    ranking: e.ranking, type: "Public", teachingLanguage: "French/English",
    accreditations: "French Ministry of Higher Education, CTI",
    description: e.desc
  });

  addProgram(school.id, "Master Informatique / Intelligence Artificielle", "2 years", "Conditional", 120, "€3,000/year", true, true, "90%", "€50,000", "Tech, AI, Data, FinTech", false, true, `Elite engineering school AI/CS Master's at ${e.name} — public tuition, alternance available. Exceptional ROI for Jadiss.`);
  addProgram(school.id, "Master Finance Quantitative / Ingénierie Financière", "2 years", "Conditional", 120, "€3,000/year", true, true, "89%", "€52,000", "Quantitative Finance, Risk, FinTech", true, true, `Quantitative finance Master's at ${e.name} — public tuition, alternance. Excellent for both candidates.`);
  addProgram(school.id, "Master Data Science & Big Data", "2 years", "Conditional", 120, "€3,000/year", true, true, "91%", "€52,000", "Tech, Data, AI, Finance", false, true, `Data science Master's at ${e.name} — public tuition with alternance. Exceptional ROI.`);

  addAdmission(school.id,
    "Bachelor's degree in relevant field (science, engineering, maths). Strong quantitative background required.",
    "TOEFL 80+ / IELTS 6.0+", "French B2+ recommended (Dina's French is an advantage)",
    "CV, transcripts, motivation letter, references",
    "Online application → review → interview → decision", true, false, false);
  addDeadline(school.id);
  addScoresForSchool(school);
}

// ═══════════════════════════════════════════════════════════
// NORWAY — Affordable Institutions
// ═══════════════════════════════════════════════════════════

const noCities = [
  { slug: "stavanger", name: "Stavanger", population: 143599, lat: 58.9700, lng: 5.7331, safety: "Very High", costOfLiving: "Very High", publicTransport: "Good", weather: "Cold", nightlife: "Good", qualityOfLife: "Very High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€800-1,200/month (student)" },
  { slug: "tromso", name: "Tromsø", population: 79545, lat: 69.6492, lng: 18.9553, safety: "Very High", costOfLiving: "Very High", publicTransport: "Good", weather: "Arctic", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Moderate", housingAvailability: "Moderate", averageRent: "€800-1,200/month (student)" },
  { slug: "kristiansand", name: "Kristiansand", population: 93083, lat: 58.1467, lng: 7.9946, safety: "Very High", costOfLiving: "High", publicTransport: "Good", weather: "Cold", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Moderate", housingAvailability: "Moderate", averageRent: "€700-1,000/month (student)" },
  { slug: "as", name: "Ås", population: 20000, lat: 59.6634, lng: 10.7829, safety: "Very High", costOfLiving: "High", publicTransport: "Good", weather: "Cold", nightlife: "Limited", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Moderate", housingAvailability: "Moderate", averageRent: "€700-1,000/month (student)" },
];

for (const c of noCities) {
  addCity({ ...c, id: undefined, countryId: 4 });
}

const noSchools = [
  { slug: "oslo-met", name: "OsloMet (Oslo Metropolitan University)", city: "oslo", website: "https://www.oslomet.no", ranking: "National", desc: "Norway's third-largest university. Applied sciences focus with CS, data science, and finance programs. Affordable for EU/EEA." },
  { slug: "nord-university", name: "Nord University", city: "oslo", website: "https://www.nord.no", ranking: "National", desc: "Regional university with business, finance, and IT programs. Multiple campuses across central Norway." },
  { slug: "univ-stavanger", name: "University of Stavanger", city: "stavanger", website: "https://www.uis.no", ranking: "Top 300 globally", desc: "Energy-focused university with strong finance, CS, and data science programs. Affordable for EU/EEA." },
  { slug: "univ-agder", name: "University of Agder", city: "kristiansand", website: "https://www.uia.no", ranking: "National", desc: "Southern Norway university with finance, CS, and data science Master's. Affordable for EU/EEA." },
  { slug: "uit", name: "UIT The Arctic University of Norway", city: "tromso", website: "https://en.uit.no", ranking: "Top 400 globally", desc: "Northernmost university in the world. Strong CS, data science, and economics programs." },
  { slug: "nmbu", name: "Norwegian University of Life Sciences (NMBU)", city: "as", website: "https://www.nmbu.no", ranking: "Top 300 globally", desc: "Specialized university with economics, data science, and environmental finance programs." },
];

for (const s of noSchools) {
  const city = db.cities.find((c) => c.slug === s.city);
  const school = addSchool({
    countryId: 4, cityId: city ? city.id : null,
    slug: s.slug, name: s.name, website: s.website,
    ranking: s.ranking, type: "Public", teachingLanguage: "English/Norwegian",
    accreditations: "Norwegian Agency for Quality Assurance (NOKUT)",
    description: s.desc
  });

  addProgram(school.id, "MSc in Finance", "2 years", "Conditional", 120, "€0 (semester fee ~€70)", true, false, "85%", "€55,000", "Finance, Energy, Banking, Consulting", true, false, `Affordable Norwegian finance Master's at ${s.name} — nearly free tuition for EU/EEA. Excellent ROI.`);
  addProgram(school.id, "MSc in Data Science / Computer Science", "2 years", "Conditional", 120, "€0 (semester fee ~€70)", true, false, "88%", "€60,000", "Tech, Data, AI, FinTech", false, true, `Affordable Norwegian CS/data science Master's at ${s.name} — nearly free tuition. Exceptional ROI for Jadiss.`);
  addProgram(school.id, "MSc in Economics", "2 years", "Conditional", 120, "€0 (semester fee ~€70)", true, false, "86%", "€58,000", "Finance, Consulting, Public Policy, Research", true, true, `Affordable economics Master's at ${s.name} — nearly free tuition. Good for both candidates.`);

  addAdmission(school.id,
    "Bachelor's degree in relevant field. Strong academic record required.",
    "TOEFL 80+ / IELTS 6.0+", "N/A",
    "CV, transcripts, motivation letter, references",
    "Online application → review → decision", false, false, false);
  addDeadline(school.id);
  addScoresForSchool(school);
}

// ═══════════════════════════════════════════════════════════
// ENGLAND — Affordable & Alternative Institutions
// ═══════════════════════════════════════════════════════════

const ukCities = [
  { slug: "leeds", name: "Leeds", population: 793139, lat: 53.8008, lng: -1.5491, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Mild", nightlife: "Excellent", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Strong", housingAvailability: "Moderate", averageRent: "£500-800/month (student)" },
  { slug: "birmingham", name: "Birmingham", population: 1141816, lat: 52.4862, lng: -1.8904, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Mild", nightlife: "Excellent", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Strong", housingAvailability: "Moderate", averageRent: "£500-800/month (student)" },
  { slug: "bristol", name: "Bristol", population: 463400, lat: 51.4545, lng: -2.5879, safety: "Medium", costOfLiving: "High", publicTransport: "Good", weather: "Mild", nightlife: "Excellent", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Strong", housingAvailability: "Difficult", averageRent: "£600-900/month (student)" },
  { slug: "sheffield", name: "Sheffield", population: 584853, lat: 53.3811, lng: -1.4701, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Easy", averageRent: "£450-700/month (student)" },
  { slug: "nottingham", name: "Nottingham", population: 331069, lat: 52.9548, lng: -1.1581, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Mild", nightlife: "Excellent", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Easy", averageRent: "£450-700/month (student)" },
  { slug: "southampton", name: "Southampton", population: 253651, lat: 50.9097, lng: -1.4044, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "£500-800/month (student)" },
  { slug: "durham", name: "Durham", population: 49984, lat: 54.7768, lng: -1.5740, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Difficult", averageRent: "£500-800/month (student)" },
  { slug: "exeter", name: "Exeter", population: 130529, lat: 50.7184, lng: -3.5336, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "£500-800/month (student)" },
  { slug: "york", name: "York", population: 208759, lat: 53.9590, lng: -1.0815, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "£500-800/month (student)" },
  { slug: "queen-mary-london", name: "London (QMUL)", population: 8982000, lat: 51.5074, lng: 0.0473, safety: "Medium", costOfLiving: "Very High", publicTransport: "Excellent", weather: "Mild", nightlife: "Excellent", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Very Strong", housingAvailability: "Difficult", averageRent: "£1,000-1,500/month (student)" },
  { slug: "liverpool", name: "Liverpool", population: 498042, lat: 53.4084, lng: -2.9916, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Mild", nightlife: "Excellent", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Easy", averageRent: "£450-700/month (student)" },
  { slug: "reading", name: "Reading", population: 174216, lat: 51.4543, lng: -0.9781, safety: "Medium", costOfLiving: "Medium", publicTransport: "Excellent", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Strong", housingAvailability: "Moderate", averageRent: "£500-800/month (student)" },
  { slug: "cardiff", name: "Cardiff", population: 366903, lat: 51.4816, lng: -3.1791, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Mild", nightlife: "Excellent", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Easy", averageRent: "£450-700/month (student)" },
  { slug: "glasgow", name: "Glasgow", population: 633120, lat: 55.8642, lng: -4.2518, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Cool", nightlife: "Excellent", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Strong", housingAvailability: "Easy", averageRent: "£450-700/month (student)" },
  { slug: "aberdeen", name: "Aberdeen", population: 227560, lat: 57.1497, lng: -2.0943, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Easy", averageRent: "£450-700/month (student)" },
  { slug: "st-andrews", name: "St Andrews", population: 17000, lat: 56.3398, lng: -2.7967, safety: "Very High", costOfLiving: "High", publicTransport: "Limited", weather: "Cool", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Moderate", housingAvailability: "Difficult", averageRent: "£600-900/month (student)" },
  { slug: "surrey", name: "Guildford (Surrey)", population: 143000, lat: 51.2362, lng: -0.5704, safety: "High", costOfLiving: "High", publicTransport: "Excellent", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Strong", housingAvailability: "Moderate", averageRent: "£600-900/month (student)" },
  { slug: "lancaster", name: "Lancaster", population: 52141, lat: 54.0466, lng: -2.8007, safety: "High", costOfLiving: "Low", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "£400-650/month (student)" },
  { slug: "loughborough", name: "Loughborough", population: 60000, lat: 52.7708, lng: -1.2030, safety: "High", costOfLiving: "Low", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Easy", averageRent: "£400-650/month (student)" },
  { slug: "sussex", name: "Brighton (Sussex)", population: 290885, lat: 50.8225, lng: -0.1372, safety: "Medium", costOfLiving: "High", publicTransport: "Good", weather: "Mild", nightlife: "Excellent", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Difficult", averageRent: "£600-900/month (student)" },
];

for (const c of ukCities) {
  addCity({ ...c, id: undefined, countryId: 2 });
}

const ukSchools = [
  { slug: "open-university", name: "The Open University (UK)", city: null, website: "https://www.open.ac.uk", ranking: "Top distance learning university globally", desc: "UK's largest university and world leader in distance learning. Flexible, part-time Master's degrees with identical diplomas to campus universities. Most affordable UK option." },
  { slug: "birkbeck", name: "Birkbeck, University of London", city: "london", website: "https://www.bbk.ac.uk", ranking: "Top 350 globally", desc: "London's evening university. Master's degrees designed for working professionals with evening classes. Affordable compared to other London universities." },
  { slug: "univ-leeds", name: "University of Leeds", city: "leeds", website: "https://www.leeds.ac.uk", ranking: "Top 100 globally", desc: "Major UK university with strong finance, data science, and business programs. More affordable than London." },
  { slug: "univ-birmingham", name: "University of Birmingham", city: "birmingham", website: "https://www.birmingham.ac.uk", ranking: "Top 100 globally", desc: "Russell Group university with strong finance, CS, and AI programs. Affordable living." },
  { slug: "univ-bristol", name: "University of Bristol", city: "bristol", website: "https://www.bristol.ac.uk", ranking: "Top 100 globally", desc: "Russell Group university with strong finance, data science, and AI programs." },
  { slug: "univ-sheffield", name: "University of Sheffield", city: "sheffield", website: "https://www.sheffield.ac.uk", ranking: "Top 100 globally", desc: "Russell Group university with strong CS, data science, and finance programs. Very affordable living." },
  { slug: "univ-nottingham", name: "University of Nottingham", city: "nottingham", website: "https://www.nottingham.ac.uk", ranking: "Top 100 globally", desc: "Russell Group university with strong finance, CS, and business analytics programs." },
  { slug: "univ-southampton", name: "University of Southampton", city: "southampton", website: "https://www.southampton.ac.uk", ranking: "Top 150 globally", desc: "Russell Group university with strong CS, AI, and finance programs." },
  { slug: "durham", name: "Durham University", city: "durham", website: "https://www.durham.ac.uk", ranking: "Top 100 globally", desc: "Collegiate university with strong finance, economics, and data science programs." },
  { slug: "exeter", name: "University of Exeter", city: "exeter", website: "https://www.exeter.ac.uk", ranking: "Top 150 globally", desc: "Russell Group university with strong finance, data science, and management programs." },
  { slug: "york", name: "University of York", city: "york", website: "https://www.york.ac.uk", ranking: "Top 150 globally", desc: "Russell Group university with strong CS, economics, and management programs." },
  { slug: "qmul", name: "Queen Mary University of London", city: "queen-mary-london", website: "https://www.qmul.ac.uk", ranking: "Top 150 globally", desc: "London university with strong finance, CS, and data science programs. More affordable than other London options." },
  { slug: "liverpool", name: "University of Liverpool", city: "liverpool", website: "https://www.liverpool.ac.uk", ranking: "Top 200 globally", desc: "Russell Group university with strong finance, CS, and data science programs. Very affordable living." },
  { slug: "reading", name: "University of Reading — Henley Business School", city: "reading", website: "https://www.henley.ac.uk", ranking: "Top 50 in Europe (Business)", desc: "Henley Business School with strong finance, real estate, and data science programs. Triple-crown accredited." },
  { slug: "cardiff", name: "Cardiff University", city: "cardiff", website: "https://www.cardiff.ac.uk", ranking: "Top 200 globally", desc: "Russell Group university with strong finance, CS, and business programs. Very affordable living." },
  { slug: "glasgow", name: "University of Glasgow", city: "glasgow", website: "https://www.gla.ac.uk", ranking: "Top 100 globally", desc: "Scottish Russell Group university with strong finance, CS, and data science programs. Affordable living." },
  { slug: "aberdeen", name: "University of Aberdeen", city: "aberdeen", website: "https://www.abdn.ac.uk", ranking: "Top 200 globally", desc: "Scottish university with strong finance, CS, and energy programs. Very affordable." },
  { slug: "st-andrews", name: "University of St Andrews", city: "st-andrews", website: "https://www.st-andrews.ac.uk", ranking: "Top 100 globally", desc: "Scotland's oldest university with strong finance, economics, and CS programs." },
  { slug: "surrey", name: "University of Surrey", city: "surrey", website: "https://www.surrey.ac.uk", ranking: "Top 250 globally", desc: "University with strong finance, CS, and AI programs. Close to London." },
  { slug: "lancaster", name: "Lancaster University", city: "lancaster", website: "https://www.lancaster.ac.uk", ranking: "Top 150 globally", desc: "Russell Group university with strong finance, CS, and data science programs. Very affordable." },
  { slug: "loughborough", name: "Loughborough University", city: "loughborough", website: "https://www.lboro.ac.uk", ranking: "Top 250 globally", desc: "University with strong finance, management, and CS programs. Excellent sports facilities." },
  { slug: "sussex", name: "University of Sussex", city: "sussex", website: "https://www.sussex.ac.uk", ranking: "Top 250 globally", desc: "Brighton-based university with strong CS, data science, and management programs." },
];

for (const s of ukSchools) {
  const city = s.city ? db.cities.find((c) => c.slug === s.city) : null;
  const school = addSchool({
    countryId: 2, cityId: city ? city.id : null,
    slug: s.slug, name: s.name, website: s.website,
    ranking: s.ranking, type: "Public", teachingLanguage: "English",
    accreditations: "UK Quality Assurance Agency",
    description: s.desc
  });

  const isAffordable = s.slug === "open-university" || s.slug === "birkbeck";
  const tuition = isAffordable ? "£12,000-18,000" : "£24,000-32,000";

  addProgram(school.id, "MSc Finance", "1 year", "YES", 90, tuition, true, false, "88%", "£50,000", "Finance, Banking, Consulting, Corporate", true, false, `Finance Master's at ${s.name} — ${isAffordable ? "very affordable" : "competitive"} UK tuition.`);
  addProgram(school.id, "MSc Data Science / AI", "1 year", "YES", 90, tuition, true, false, "90%", "£55,000", "Tech, AI, Data, FinTech", false, true, `Data science/AI Master's at ${s.name} — strong industry connections.`);
  addProgram(school.id, "MSc Business Analytics", "1 year", "YES", 90, tuition, true, false, "89%", "£52,000", "Tech, Data, Finance, Consulting", false, true, `Business analytics Master's at ${s.name} — bridging business and data science.`);

  addAdmission(school.id,
    "Upper second class degree (2:1) or equivalent. Relevant background preferred.",
    "IELTS 6.5+ (with 6.0+ in each)", "N/A",
    "CV, transcripts, personal statement, references",
    "Online application → review → decision", false, false, false);
  addDeadline(school.id);
  addScoresForSchool(school);
}

// ═══════════════════════════════════════════════════════════
// IRELAND — Affordable & Alternative Institutions
// ═══════════════════════════════════════════════════════════

const ieCities = [
  { slug: "maynooth", name: "Maynooth", population: 37000, lat: 53.3812, lng: -6.5918, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€600-900/month (student)" },
  { slug: "waterford", name: "Waterford", population: 53504, lat: 52.2593, lng: -7.1101, safety: "High", costOfLiving: "Low", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "€500-750/month (student)" },
  { slug: "carlow", name: "Carlow", population: 27351, lat: 52.8365, lng: -6.9341, safety: "High", costOfLiving: "Low", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "Medium", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "€450-700/month (student)" },
];

for (const c of ieCities) {
  addCity({ ...c, id: undefined, countryId: 3 });
}

const ieSchools = [
  { slug: "maynooth-univ", name: "Maynooth University", city: "maynooth", website: "https://www.maynoothuniversity.ie", ranking: "Top 400 globally", desc: "Ireland's fastest-growing university with strong finance, CS, and data science programs. Affordable tuition." },
  { slug: "tu-dublin", name: "Technological University Dublin (TU Dublin)", city: "dublin", website: "https://www.tudublin.ie", ranking: "National", desc: "Ireland's largest technological university. Strong IT, finance, and data science programs. Affordable." },
  { slug: "atu", name: "Atlantic Technological University", city: "galway", website: "https://www.atu.ie", ranking: "National", desc: "Multi-campus technological university with finance, CS, and data science programs. Very affordable." },
  { slug: "setu", name: "South East Technological University (SETU)", city: "waterford", website: "https://www.setu.ie", ranking: "National", desc: "Technological university with finance, CS, and business programs. Very affordable living." },
  { slug: "mtu", name: "Munster Technological University (MTU)", city: "cork", website: "https://www.mtu.ie", ranking: "National", desc: "Cork-based technological university with strong IT, finance, and business programs." },
];

for (const s of ieSchools) {
  const city = db.cities.find((c) => c.slug === s.city);
  const school = addSchool({
    countryId: 3, cityId: city ? city.id : null,
    slug: s.slug, name: s.name, website: s.website,
    ranking: s.ranking, type: "Public", teachingLanguage: "English",
    accreditations: "Quality and Qualifications Ireland (QQI)",
    description: s.desc
  });

  addProgram(school.id, "MSc in Finance", "1 year", "YES", 90, "€12,000-15,000", true, false, "85%", "€45,000", "Finance, Banking, FinTech, Consulting", true, false, `Affordable Irish finance Master's at ${s.name} — lower tuition than traditional universities.`);
  addProgram(school.id, "MSc in Data Science / AI", "1 year", "YES", 90, "€12,000-15,000", true, false, "88%", "€48,000", "Tech, Data, AI, FinTech", false, true, `Affordable Irish data science Master's at ${s.name} — strong industry connections.`);
  addProgram(school.id, "MSc in Business Analytics", "1 year", "YES", 90, "€12,000-15,000", true, false, "87%", "€46,000", "Tech, Data, Finance, Consulting", false, true, `Business analytics Master's at ${s.name} — bridging business and technology.`);

  addAdmission(school.id,
    "Upper second class degree or equivalent. Relevant background preferred.",
    "IELTS 6.5+", "N/A",
    "CV, transcripts, personal statement, references",
    "Online application → review → decision", false, false, false);
  addDeadline(school.id);
  addScoresForSchool(school);
}

// ═══════════════════════════════════════════════════════════
// DENMARK — Affordable & Alternative Institutions
// ═══════════════════════════════════════════════════════════

const dkCities = [
  { slug: "aalborg", name: "Aalborg", population: 120869, lat: 57.0488, lng: 9.9217, safety: "Very High", costOfLiving: "High", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "Very High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€600-900/month (student)" },
  { slug: "odense", name: "Odense", population: 180863, lat: 55.4038, lng: 10.4024, safety: "Very High", costOfLiving: "Medium", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€500-800/month (student)" },
  { slug: "roskilde", name: "Roskilde", population: 52949, lat: 55.6416, lng: 12.0803, safety: "Very High", costOfLiving: "Medium", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€500-800/month (student)" },
  { slug: "lyngby", name: "Lyngby", population: 57516, lat: 55.7833, lng: 12.5167, safety: "Very High", costOfLiving: "High", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "Very High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Strong", housingAvailability: "Moderate", averageRent: "€600-900/month (student)" },
];

for (const c of dkCities) {
  addCity({ ...c, id: undefined, countryId: 5 });
}

const dkSchools = [
  { slug: "aalborg", name: "Aalborg University", city: "aalborg", website: "https://www.en.aau.dk", ranking: "Top 300 globally", desc: "Problem-based learning university with strong CS, data science, and finance programs. Affordable for EU/EEA." },
  { slug: "sdu", name: "University of Southern Denmark (SDU)", city: "odense", website: "https://www.sdu.dk", ranking: "Top 300 globally", desc: "Comprehensive university with strong economics, finance, and CS programs. Affordable for EU/EEA." },
  { slug: "roskilde", name: "Roskilde University", city: "roskilde", website: "https://www.ruc.dk", ranking: "National", desc: "Interdisciplinary university with strong CS, economics, and business programs. Project-based learning." },
  { slug: "dtu", name: "Technical University of Denmark (DTU)", city: "lyngby", website: "https://www.dtu.dk", ranking: "Top 5 globally (Engineering)", desc: "Elite engineering university with strong AI, data science, and quantitative finance programs. Affordable for EU/EEA." },
];

for (const s of dkSchools) {
  const city = db.cities.find((c) => c.slug === s.city);
  const school = addSchool({
    countryId: 5, cityId: city ? city.id : null,
    slug: s.slug, name: s.name, website: s.website,
    ranking: s.ranking, type: "Public", teachingLanguage: "English/Danish",
    accreditations: "Danish Accreditation Institution",
    description: s.desc
  });

  addProgram(school.id, "MSc in Finance", "2 years", "Conditional", 120, "€0 (EU/EEA) / €12,000 (non-EU)", true, false, "87%", "€58,000", "Finance, Consulting, Corporate, Banking", true, false, `Affordable Danish finance Master's at ${s.name} — free for EU/EEA. Excellent ROI.`);
  addProgram(school.id, "MSc in Computer Science / Data Science", "2 years", "Conditional", 120, "€0 (EU/EEA) / €12,000 (non-EU)", true, false, "90%", "€62,000", "Tech, AI, Data, FinTech", false, true, `Affordable Danish CS/data science Master's at ${s.name} — free for EU/EEA. Exceptional ROI.`);
  addProgram(school.id, "MSc in Economics", "2 years", "Conditional", 120, "€0 (EU/EEA) / €12,000 (non-EU)", true, false, "88%", "€60,000", "Finance, Consulting, Public Policy, Research", true, true, `Affordable economics Master's at ${s.name} — free for EU/EEA.`);

  addAdmission(school.id,
    "Bachelor's degree in relevant field. Strong academic record required.",
    "TOEFL 83+ / IELTS 6.5+", "N/A",
    "CV, transcripts, motivation letter, references",
    "Online application → review → decision", false, false, false);
  addDeadline(school.id);
  addScoresForSchool(school);
}

// ═══════════════════════════════════════════════════════════
// SPAIN — Affordable & Alternative Institutions (UNED = Spain's CNAM)
// ═══════════════════════════════════════════════════════════

const esCities = [
  { slug: "valencia", name: "Valencia", population: 794288, lat: 39.4699, lng: -0.3763, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Mediterranean", nightlife: "Excellent", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Easy", averageRent: "€400-700/month (student)" },
  { slug: "sevilla", name: "Sevilla", population: 688711, lat: 37.3891, lng: -5.9845, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Mediterranean", nightlife: "Excellent", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Easy", averageRent: "€400-650/month (student)" },
  { slug: "granada", name: "Granada", population: 232770, lat: 37.1773, lng: -3.5986, safety: "Medium", costOfLiving: "Very Low", publicTransport: "Good", weather: "Mediterranean", nightlife: "Excellent", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Low", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "€300-500/month (student)" },
  { slug: "salamanca", name: "Salamanca", population: 144228, lat: 40.9701, lng: -5.6635, safety: "High", costOfLiving: "Very Low", publicTransport: "Good", weather: "Continental", nightlife: "Excellent", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Low", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "€300-500/month (student)" },
  { slug: "zaragoza", name: "Zaragoza", population: 674997, lat: 41.6488, lng: -0.8891, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Continental", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Easy", averageRent: "€350-550/month (student)" },
  { slug: "malaga", name: "Málaga", population: 574654, lat: 36.7213, lng: -4.4214, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Mediterranean", nightlife: "Excellent", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Easy", averageRent: "€400-650/month (student)" },
];

for (const c of esCities) {
  addCity({ ...c, id: undefined, countryId: 8 });
}

const esSchools = [
  { slug: "uned", name: "UNED — Universidad Nacional de Educación a Distancia", city: "madrid", website: "https://www.uned.es", ranking: "National (largest distance learning)", desc: "Spain's national distance learning university — equivalent to CNAM. Affordable Master's degrees with flexible learning. Largest university in Spain by enrollment." },
  { slug: "univ-barcelona", name: "Universitat de Barcelona", city: "barcelona", website: "https://www.ub.edu", ranking: "Top 200 globally", desc: "Catalonia's largest university with strong finance, economics, and CS programs. Very affordable public tuition." },
  { slug: "uam", name: "Universidad Autónoma de Madrid", city: "madrid", website: "https://www.uam.es", ranking: "Top 200 globally", desc: "Madrid public university with strong economics, finance, and CS programs. Affordable public tuition." },
  { slug: "ucm", name: "Universidad Complutense de Madrid", city: "madrid", website: "https://www.ucm.es", ranking: "Top 200 globally", desc: "Spain's largest public university with comprehensive finance, CS, and business programs. Very affordable." },
  { slug: "univ-valencia", name: "Universitat de València", city: "valencia", website: "https://www.uv.es", ranking: "Top 300 globally", desc: "Valencia public university with strong finance, economics, and CS programs. Affordable Mediterranean living." },
  { slug: "univ-sevilla", name: "Universidad de Sevilla", city: "sevilla", website: "https://www.us.es", ranking: "Top 400 globally", desc: "Andalusia's largest university with finance, CS, and business programs. Very affordable." },
  { slug: "univ-granada", name: "Universidad de Granada", city: "granada", website: "https://www.ugr.es", ranking: "Top 300 globally", desc: "Historic university with strong CS, data science, and finance programs. Extremely affordable living." },
  { slug: "univ-salamanca", name: "Universidad de Salamanca", city: "salamanca", website: "https://www.usal.es", ranking: "Top 400 globally", desc: "Spain's oldest university with finance, CS, and business programs. Extremely affordable." },
  { slug: "univ-zaragoza", name: "Universidad de Zaragoza", city: "zaragoza", website: "https://www.unizar.es", ranking: "Top 400 globally", desc: "Aragon university with strong finance, CS, and engineering programs. Affordable." },
  { slug: "univ-malaga", name: "Universidad de Málaga", city: "malaga", website: "https://www.uma.es", ranking: "National", desc: "Andalusian university with growing CS, data science, and finance programs. Affordable Mediterranean living." },
  { slug: "upm", name: "Universidad Politécnica de Madrid", city: "madrid", website: "https://www.upm.es", ranking: "Top 10 globally (Engineering)", desc: "Madrid's top technical university with strong AI, data science, and quantitative finance programs." },
  { slug: "upc", name: "Universitat Politècnica de Catalunya", city: "barcelona", website: "https://www.upc.edu", ranking: "Top 10 globally (Engineering)", desc: "Barcelona's top technical university with strong CS, AI, and data science programs." },
];

for (const s of esSchools) {
  const city = db.cities.find((c) => c.slug === s.city);
  const school = addSchool({
    countryId: 8, cityId: city ? city.id : null,
    slug: s.slug, name: s.name, website: s.website,
    ranking: s.ranking, type: "Public", teachingLanguage: "Spanish/English",
    accreditations: "Spanish Ministry of Universities, ANECA",
    description: s.desc
  });

  const isUNED = s.slug === "uned";
  const tuition = isUNED ? "€1,000-2,000/year" : "€2,000-5,000/year";

  addProgram(school.id, "Máster Universitario en Finanzas", "1 year", "YES", 60, tuition, true, false, "87%", "€45,000", "Finance, Banking, Consulting, Corporate", true, false, `Affordable Spanish finance Master's at ${s.name} — ${isUNED ? "distance learning, " : ""}very low tuition. Excellent ROI.`);
  addProgram(school.id, "Máster Universitario en Ciencia de Datos / IA", "1 year", "YES", 60, tuition, true, false, "89%", "€48,000", "Tech, Data, AI, FinTech", false, true, `Affordable Spanish data science Master's at ${s.name} — ${isUNED ? "distance learning, " : ""}very low tuition.`);
  addProgram(school.id, "Máster Universitario en Economía / Business Analytics", "1 year", "YES", 60, tuition, true, false, "86%", "€44,000", "Finance, Consulting, Data, Research", true, true, `Affordable economics/analytics Master's at ${s.name} — ${isUNED ? "distance learning, " : ""}very low tuition.`);

  addAdmission(school.id,
    "Bachelor's degree or equivalent (Grado). Relevant background preferred.",
    "TOEFL 80+ / IELTS 6.0+ (English tracks)", "Spanish B1+ recommended for Spanish tracks",
    "CV, transcripts, motivation letter, passport",
    "Online application → review → decision", false, false, false);
  addDeadline(school.id);
  addScoresForSchool(school);
}

// ═══════════════════════════════════════════════════════════
// ICELAND — Additional Institutions
// ═══════════════════════════════════════════════════════════

const isCities = [
  { slug: "akureyri", name: "Akureyri", population: 19219, lat: 65.6835, lng: -18.1262, safety: "Very High", costOfLiving: "High", publicTransport: "Limited", weather: "Arctic", nightlife: "Limited", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Limited", housingAvailability: "Moderate", averageRent: "€700-1,000/month (student)" },
];

for (const c of isCities) {
  addCity({ ...c, id: undefined, countryId: 9 });
}

const isSchools = [
  { slug: "univ-akureyri", name: "University of Akureyri", city: "akureyri", website: "https://www.unak.is", ranking: "National", desc: "Northern Iceland university with CS, business, and law programs. Very small classes, affordable." },
  { slug: "bifrost", name: "Bifröst University", city: "reykjavik", website: "https://www.bifrost.is", ranking: "National", desc: "Iceland's business university with finance, management, and law programs. Small, intimate learning environment." },
  { slug: "hi", name: "University of Iceland (Háskóli Íslands)", city: "reykjavik", website: "https://english.hi.is", ranking: "National (largest)", desc: "Iceland's largest and oldest university. Comprehensive programs in economics, CS, and engineering. Low registration fees." },
];

for (const s of isSchools) {
  const city = db.cities.find((c) => c.slug === s.city);
  const school = addSchool({
    countryId: 9, cityId: city ? city.id : null,
    slug: s.slug, name: s.name, website: s.website,
    ranking: s.ranking, type: s.slug === "bifrost" ? "Private" : "Public", teachingLanguage: "English/Icelandic",
    accreditations: "Icelandic Ministry of Education",
    description: s.desc
  });

  addProgram(school.id, "MSc in Finance", "2 years", "Conditional", 120, "€0 (registration fee ~€500)", true, false, "83%", "€50,000", "Finance, Banking, Energy, Consulting", true, false, `Affordable Icelandic finance Master's at ${s.name} — very low tuition. Good ROI.`);
  addProgram(school.id, "MSc in Computer Science / Data Science", "2 years", "Conditional", 120, "€0 (registration fee ~€500)", true, false, "87%", "€55,000", "Tech, Data, AI, FinTech", false, true, `Affordable Icelandic CS Master's at ${s.name} — very low tuition. Good ROI.`);
  addProgram(school.id, "MSc in Economics", "2 years", "Conditional", 120, "€0 (registration fee ~€500)", true, false, "85%", "€52,000", "Finance, Consulting, Public Policy, Research", true, true, `Affordable economics Master's at ${s.name} — very low tuition.`);

  addAdmission(school.id,
    "Bachelor's degree in relevant field.",
    "TOEFL 79+ / IELTS 6.5+", "N/A",
    "CV, transcripts, motivation letter, references",
    "Online application → review → decision", false, false, false);
  addDeadline(school.id);
  addScoresForSchool(school);
}

// ═══════════════════════════════════════════════════════════
// NEW ZEALAND — Additional Institutions
// ═══════════════════════════════════════════════════════════

const nzCities = [
  { slug: "christchurch", name: "Christchurch", population: 381500, lat: -43.5321, lng: 172.6362, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "NZ$900-1,300/month (student)" },
  { slug: "hamilton", name: "Hamilton", population: 176500, lat: -37.7870, lng: 175.2793, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "Medium", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Easy", averageRent: "NZ$800-1,200/month (student)" },
  { slug: "palmerston-north", name: "Palmerston North", population: 91300, lat: -40.3563, lng: 175.6111, safety: "High", costOfLiving: "Low", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "Medium", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "NZ$700-1,000/month (student)" },
  { slug: "lincoln", name: "Lincoln (Canterbury)", population: 6500, lat: -43.6487, lng: 172.4825, safety: "High", costOfLiving: "Low", publicTransport: "Limited", weather: "Cool", nightlife: "Limited", qualityOfLife: "Medium", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "NZ$700-1,000/month (student)" },
];

for (const c of nzCities) {
  addCity({ ...c, id: undefined, countryId: 10 });
}

const nzSchools = [
  { slug: "massey", name: "Massey University", city: "palmerston-north", website: "https://www.massey.ac.nz", ranking: "Top 300 globally", desc: "NZ's distance learning pioneer with strong finance, data science, and business programs. Flexible study options." },
  { slug: "canterbury", name: "University of Canterbury", city: "christchurch", website: "https://www.canterbury.ac.nz", ranking: "Top 300 globally", desc: "Christchurch university with strong finance, CS, and data science programs." },
  { slug: "waikato", name: "University of Waikato", city: "hamilton", website: "https://www.waikato.ac.nz", ranking: "Top 400 globally", desc: "Hamilton university with strong finance, CS, and management programs. Affordable living." },
  { slug: "lincoln", name: "Lincoln University", city: "lincoln", website: "https://www.lincoln.ac.nz", ranking: "National", desc: "Specialized university with finance, agribusiness, and data science programs. Small campus, affordable." },
];

for (const s of nzSchools) {
  const city = db.cities.find((c) => c.slug === s.city);
  const school = addSchool({
    countryId: 10, cityId: city ? city.id : null,
    slug: s.slug, name: s.name, website: s.website,
    ranking: s.ranking, type: "Public", teachingLanguage: "English",
    accreditations: "New Zealand Qualifications Authority (NZQA), AACSB",
    description: s.desc
  });

  addProgram(school.id, "Master of Finance", "1.5 years", "YES", 120, "NZ$35,000-42,000", true, false, "84%", "NZ$60,000", "Finance, Banking, Consulting, Corporate", true, false, `NZ finance Master's at ${s.name} — ${s.slug === "massey" ? "distance learning available, " : ""}affordable compared to larger cities.`);
  addProgram(school.id, "Master of Data Science / AI", "1.5 years", "YES", 120, "NZ$37,000-44,000", true, false, "87%", "NZ$65,000", "Tech, Data, AI, FinTech", false, true, `NZ data science Master's at ${s.name} — strong industry connections.`);
  addProgram(school.id, "Master of Business Analytics", "1.5 years", "YES", 120, "NZ$36,000-43,000", true, false, "86%", "NZ$62,000", "Tech, Data, Finance, Consulting", false, true, `Business analytics Master's at ${s.name} — bridging business and data.`);

  addAdmission(school.id,
    "Bachelor's degree equivalent to NZ qualification.",
    "IELTS 6.5+ / TOEFL 90+", "N/A",
    "CV, transcripts, personal statement, references",
    "Online application → review → decision", false, false, false);
  addDeadline(school.id);
  addScoresForSchool(school);
}

// ═══════════════════════════════════════════════════════════
// NETHERLANDS — Additional Institutions (Open Universiteit + UoAS)
// ═══════════════════════════════════════════════════════════

const nlCities = [
  { slug: "heerlen", name: "Heerlen", population: 89000, lat: 50.8882, lng: 5.9795, safety: "High", costOfLiving: "Low", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "€500-750/month (student)" },
  { slug: "enschede", name: "Enschede", population: 158986, lat: 52.2215, lng: 6.8937, safety: "High", costOfLiving: "Low", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Easy", averageRent: "€500-750/month (student)" },
  { slug: "eindhoven", name: "Eindhoven", population: 235691, lat: 51.4416, lng: 5.4697, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Very Strong", housingAvailability: "Moderate", averageRent: "€600-900/month (student)" },
  { slug: "leiden", name: "Leiden", population: 124789, lat: 52.1601, lng: 4.4970, safety: "High", costOfLiving: "High", publicTransport: "Excellent", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Strong", housingAvailability: "Difficult", averageRent: "€700-1,000/month (student)" },
  { slug: "utrecht", name: "Utrecht", population: 358834, lat: 52.0907, lng: 5.1214, safety: "High", costOfLiving: "High", publicTransport: "Excellent", weather: "Mild", nightlife: "Excellent", qualityOfLife: "Very High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Very Strong", housingAvailability: "Difficult", averageRent: "€700-1,100/month (student)" },
  { slug: "wageningen", name: "Wageningen", population: 38665, lat: 51.9692, lng: 5.6654, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€500-800/month (student)" },
  { slug: "nijmegen", name: "Nijmegen", population: 176431, lat: 51.8126, lng: 5.8372, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€500-800/month (student)" },
  { slug: "den-haag", name: "The Hague", population: 545838, lat: 52.0705, lng: 4.3007, safety: "High", costOfLiving: "High", publicTransport: "Excellent", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Strong", housingAvailability: "Moderate", averageRent: "€700-1,000/month (student)" },
];

for (const c of nlCities) {
  addCity({ ...c, id: undefined, countryId: 6 });
}

const nlSchools = [
  { slug: "open-universiteit", name: "Open Universiteit (Open University of the Netherlands)", city: "heerlen", website: "https://www.ou.nl", ranking: "National (distance learning)", desc: "Netherlands' distance learning university — equivalent to CNAM. Flexible, part-time Master's degrees with identical diplomas. Very affordable." },
  { slug: "univ-twente", name: "University of Twente", city: "enschede", website: "https://www.utwente.nl", ranking: "Top 200 globally", desc: "Entrepreneurial university with strong CS, data science, and finance programs. Affordable living in Enschede." },
  { slug: "tue", name: "Eindhoven University of Technology (TU/e)", city: "eindhoven", website: "https://www.tue.nl", ranking: "Top 100 globally (Engineering)", desc: "Elite technical university with strong AI, data science, and quantitative finance programs. Strong industry links." },
  { slug: "leiden", name: "Leiden University", city: "leiden", website: "https://www.universiteitleiden.nl", ranking: "Top 150 globally", desc: "Netherlands' oldest university with strong economics, CS, and data science programs." },
  { slug: "uu", name: "Utrecht University", city: "utrecht", website: "https://www.uu.nl", ranking: "Top 100 globally", desc: "Comprehensive research university with strong economics, finance, and CS programs." },
  { slug: "wageningen", name: "Wageningen University & Research", city: "wageningen", website: "https://www.wur.nl", ranking: "Top 100 globally", desc: "Specialized university with strong data science, environmental economics, and business programs." },
  { slug: "radboud", name: "Radboud University", city: "nijmegen", website: "https://www.ru.nl", ranking: "Top 150 globally", desc: "Nijmegen university with strong CS, data science, and economics programs." },
  { slug: "thuas", name: "The Hague University of Applied Sciences (THUAS)", city: "den-haag", website: "https://www.thehagueuniversity.com", ranking: "National", desc: "Applied sciences university with finance, business, and IT Master's programs. Practical focus, affordable." },
  { slug: "fontys", name: "Fontys University of Applied Sciences", city: "eindhoven", website: "https://www.fontys.nl", ranking: "National", desc: "Large applied sciences university with IT, business, and finance Master's programs. Industry-focused." },
  { slug: "hanze", name: "Hanze University of Applied Sciences", city: "groningen", website: "https://www.hanze.nl", ranking: "National", desc: "Groningen applied sciences university with business, finance, and IT Master's programs." },
];

for (const s of nlSchools) {
  const city = db.cities.find((c) => c.slug === s.city);
  const school = addSchool({
    countryId: 6, cityId: city ? city.id : null,
    slug: s.slug, name: s.name, website: s.website,
    ranking: s.ranking, type: "Public", teachingLanguage: "English",
    accreditations: "NVAO (Accreditation Organisation of the Netherlands and Flanders)",
    description: s.desc
  });

  const isOU = s.slug === "open-universiteit";
  const isUAS = s.slug === "thuas" || s.slug === "fontys" || s.slug === "hanze";
  const tuition = isOU ? "€2,000-3,000/year" : isUAS ? "€10,000-14,000/year" : "€15,000-18,000/year";

  addProgram(school.id, "MSc in Finance", "1 year", "YES", 60, tuition, true, false, "87%", "€52,000", "Finance, Banking, Consulting, Corporate", true, false, `${isOU ? "Distance learning" : isUAS ? "Applied sciences" : "Research university"} finance Master's at ${s.name} — ${isOU ? "very affordable" : "competitive"} tuition.`);
  addProgram(school.id, "MSc in Data Science / Computer Science", "1-2 years", "YES", 60, tuition, true, false, "90%", "€55,000", "Tech, AI, Data, FinTech", false, true, `${isOU ? "Distance learning" : isUAS ? "Applied sciences" : "Research university"} CS/data science Master's at ${s.name}.`);
  addProgram(school.id, "MSc in Business Analytics", "1 year", "YES", 60, tuition, true, false, "88%", "€53,000", "Tech, Data, Finance, Consulting", false, true, `Business analytics Master's at ${s.name} — bridging business and data science.`);

  addAdmission(school.id,
    "Bachelor's degree in relevant field. Dutch university level equivalent required.",
    "IELTS 6.5+ / TOEFL 90+", "N/A",
    "CV, transcripts, motivation letter, references",
    "Online application → review → decision", false, false, false);
  addDeadline(school.id);
  addScoresForSchool(school);
}

// ═══════════════════════════════════════════════════════════
// BELGIUM — Additional Institutions (UCLouvain, VUB, etc.)
// ═══════════════════════════════════════════════════════════

const beCities = [
  { slug: "louvain-la-neuve", name: "Louvain-la-Neuve", population: 31000, lat: 50.6681, lng: 4.6118, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Good", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€500-750/month (student)" },
  { slug: "mons", name: "Mons", population: 95699, lat: 50.4550, lng: 3.9443, safety: "Medium", costOfLiving: "Low", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "Medium", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "€400-600/month (student)" },
  { slug: "namur", name: "Namur", population: 111447, lat: 50.4674, lng: 4.8710, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€450-700/month (student)" },
  { slug: "hasselt", name: "Hasselt", population: 79017, lat: 50.9307, lng: 5.3345, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Good", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€500-750/month (student)" },
];

for (const c of beCities) {
  addCity({ ...c, id: undefined, countryId: 7 });
}

const beSchools = [
  { slug: "uclouvain", name: "UCLouvain (Université Catholique de Louvain)", city: "louvain-la-neuve", website: "https://uclouvain.be", ranking: "Top 150 globally", desc: "Belgium's largest French-speaking university with strong finance, CS, and data science programs. Very affordable public tuition. LSM (Louvain School of Management) is triple-crown accredited." },
  { slug: "ulb", name: "ULB (Université Libre de Bruxelles)", city: "brussels", website: "https://www.ulb.be", ranking: "Top 200 globally", desc: "Brussels' free university with strong finance, CS, and data science programs. Solvay Brussels School is part of ULB. Very affordable." },
  { slug: "vub", name: "VUB (Vrije Universiteit Brussel)", city: "brussels", website: "https://www.vub.be", ranking: "Top 250 globally", desc: "Brussels' Dutch-speaking university with English-taught Master's in CS, data science, and business. Very affordable." },
  { slug: "umons", name: "UMONS (University of Mons)", city: "mons", website: "https://web.umons.ac.be", ranking: "National", desc: "Regional university with finance, management, and CS programs. Very affordable living." },
  { slug: "unamur", name: "University of Namur", city: "namur", website: "https://www.unamur.be", ranking: "National", desc: "Namur university with strong CS, finance, and management programs. Affordable, small class sizes." },
  { slug: "uhasselt", name: "Hasselt University", city: "hasselt", website: "https://www.uhasselt.be", ranking: "National", desc: "Limburg university with growing CS, data science, and business programs. Affordable." },
  { slug: "ichec", name: "ICHEC Brussels Management School", city: "brussels", website: "https://www.ichec.be", ranking: "National", desc: "Brussels management school with affordable finance and business Master's. Evening classes available." },
  { slug: "lsm", name: "Louvain School of Management (UCLouvain LSM)", city: "louvain-la-neuve", website: "https://lsm.uclouvain.be", ranking: "Top 50 in Europe (Business)", desc: "UCLouvain's business school with triple-crown accreditation. Very affordable finance and management Master's." },
];

for (const s of beSchools) {
  const city = db.cities.find((c) => c.slug === s.city);
  const school = addSchool({
    countryId: 7, cityId: city ? city.id : null,
    slug: s.slug, name: s.name, website: s.website,
    ranking: s.ranking, type: "Public", teachingLanguage: "English/French",
    accreditations: "French Community of Belgium, AACSB, EQUIS",
    description: s.desc
  });

  addProgram(school.id, "MSc in Finance", "1 year", "YES", 60, "€5,000-8,000/year", true, false, "88%", "€50,000", "Finance, Banking, Consulting, Corporate", true, false, `Very affordable Belgian finance Master's at ${s.name} — public tuition. Excellent ROI for Dina.`);
  addProgram(school.id, "MSc in Computer Science / Data Science", "1-2 years", "YES", 60, "€5,000-8,000/year", true, false, "90%", "€53,000", "Tech, Data, AI, FinTech", false, true, `Very affordable Belgian CS/data science Master's at ${s.name} — public tuition. Excellent ROI for Jadiss.`);
  addProgram(school.id, "MSc in Business Analytics / Management", "1 year", "YES", 60, "€5,000-8,000/year", true, false, "87%", "€48,000", "Tech, Data, Finance, Consulting", true, true, `Affordable business analytics Master's at ${s.name} — public tuition. Good for both candidates.`);

  addAdmission(school.id,
    "Bachelor's degree in relevant field. Strong academic record preferred.",
    "IELTS 6.5+ / TOEFL 90+", "French B2+ recommended for French tracks (Dina's French is an advantage)",
    "CV, transcripts, motivation letter, references",
    "Online application → review → decision", false, false, false);
  addDeadline(school.id);
  addScoresForSchool(school);
}

// ═══════════════════════════════════════════════════════════
// ADDITIONAL SCHOLARSHIPS
// ═══════════════════════════════════════════════════════════

// France
addScholarship(1, "Bourse du Gouvernement Français (BGF)", "Government", "Full tuition + €700-1,200/month living allowance", "Moroccan and international students applying to French Master's", "French government scholarship covering tuition and living expenses for international students.");
addScholarship(1, "Bourse CNAM Formation Continue", "University", "Up to 50% tuition reduction", "Working professionals enrolled at CNAM", "CNAM's own scholarship for continuing education students.");
addScholarship(1, "Bourse IAE", "University", "€1,000-3,000/year", "Students enrolled at IAE network schools", "IAE network scholarship for finance and management students.");
addScholarship(1, "Apprentissage/Alternance Funding", "Government", "Full tuition paid by employer + monthly salary", "Students enrolled in alternance programs", "French government-funded work-study scheme where employer pays tuition and student receives salary.");
addScholarship(1, "Region Île-de-France Scholarship", "Regional", "€1,000-5,000/year", "Students studying in Paris region", "Regional funding for students in the Île-de-France region.");

// Norway
addScholarship(4, "Norwegian Quota Scheme (replaced by tuition waivers)", "Government", "Tuition waiver for EU/EEA", "EU/EEA students at Norwegian universities", "Norwegian universities offer free tuition for EU/EEA students (semester fee only).");

// England
addScholarship(2, "Commonwealth Scholarship", "Government", "Full tuition + living allowance + travel", "Students from Commonwealth countries", "UK government scholarship for students from Commonwealth nations.");
addScholarship(2, "Open University Financial Support", "University", "Up to £3,000/year", "Students at The Open University with financial need", "OU's own financial support fund for distance learning students.");
addScholarship(2, "Birkbeck Bursary", "University", "£1,000-3,000/year", "Students at Birkbeck with financial need", "Birkbeck's bursary for evening students.");

// Ireland
addScholarship(3, "Irish Research Council Scholarship", "Government", "€16,000/year + tuition", "Research Master's students", "Government scholarship for research-based Master's students.");

// Denmark
addScholarship(5, "Danish State Educational Support (SU)", "Government", "€700/month + tuition waiver", "EU/EEA students working part-time in Denmark", "Danish government support for students who work while studying.");

// Spain
addScholarship(8, "UNED Scholarship", "University", "Up to 100% tuition waiver", "Students at UNED with financial need", "UNED's own scholarship for distance learning students.");
addScholarship(8, "MECD Scholarship (Ministerio de Educación)", "Government", "Tuition + €1,500-6,000/year", "Spanish and EU students with financial need", "Spanish government scholarship for higher education.");

// Netherlands
addScholarship(6, "Open Universiteit Scholarship", "University", "Up to €2,000/year", "Students at Open Universiteit", "OU Netherlands' own scholarship for distance learning students.");
addScholarship(6, "Erasmus Mundus Joint Master Degrees", "Government", "Full tuition + €1,000-1,400/month + travel", "International students applying to joint European Master's", "EU-funded scholarship for Erasmus Mundus joint Master's programs across multiple European universities.");
addScholarship(6, "Orange Knowledge Programme", "Government", "Full tuition + living allowance", "Students from selected developing countries", "Dutch government scholarship for capacity building.");

// Belgium
addScholarship(7, "ARES Scholarship (Académie de Recherche et d'Enseignement Supérieur)", "Government", "Full tuition + living allowance + travel", "Students from developing countries at Belgian universities", "Belgian development cooperation scholarship for French-speaking Belgian universities.");
addScholarship(7, "UCLouvain Scholarship", "University", "€1,000-5,000/year", "International students at UCLouvain", "UCLouvain's own scholarship for international students.");

// New Zealand
addScholarship(10, "NZ International Doctoral Research Scholarship", "Government", "Full tuition + NZ$25,000/year living allowance", "International students pursuing research Master's/PhD", "NZ government scholarship for research students.");

// Iceland
addScholarship(9, "Icelandic Government Scholarship", "Government", "Full tuition + ISK 130,000/month", "International students at Icelandic universities", "Icelandic Ministry of Education scholarship for international students.");

// ═══════════════════════════════════════════════════════════
// WRITE BACK
// ═══════════════════════════════════════════════════════════

fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2), "utf-8");

console.log("✅ CNAM-like & affordable institutions data expanded successfully!");
console.log(`   Countries: ${db.countries.length}`);
console.log(`   Cities: ${db.cities.length}`);
console.log(`   Schools: ${db.schools.length}`);
console.log(`   Programs: ${db.programs.length}`);
console.log(`   Admissions: ${db.admissions.length}`);
console.log(`   Deadlines: ${db.deadlines.length}`);
console.log(`   Candidate Scores: ${db.candidateScores.length}`);
console.log(`   Scholarships: ${db.scholarships.length}`);