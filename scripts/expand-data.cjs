/**
 * Expands masters-data.json with more schools, programs, cities, and scores.
 * Reads existing data, adds new entries, and writes back.
 */
const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(process.cwd(), "data", "masters-data.json");
const db = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

// 1. Add languages to candidates
db.candidates[0].languages = "French, English, Arabic";
db.candidates[1].languages = "French, English, Arabic, Italian";

// Update Dina's preferences to mention French advantage
db.candidates[0].preferences = "Prefers direct admission into Master Year 2 (M2) or a one-year specialized master's. If only M1 entry is available, mark as Less Preferred. Speaks French, English, and Arabic — strong advantage for France, Belgium, and multilingual programs.";
db.candidates[1].preferences = "Interested in programs combining finance and technology. Open to M1 or M2 entry. Speaks French, English, Arabic, and Italian — advantage for France, Belgium, and multilingual programs.";

// 2. Add new cities
const newCities = [
  { id: 14, countryId: 1, slug: "nice", name: "Nice", population: 342669, lat: 43.7102, lng: 7.2620, safety: "Medium", costOfLiving: "High", publicTransport: "Good", weather: "Mediterranean", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Difficult", averageRent: "€700-1,100/month (student)" },
  { id: 15, countryId: 1, slug: "toulouse", name: "Toulouse", population: 486828, lat: 43.6047, lng: 1.4442, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Strong", housingAvailability: "Moderate", averageRent: "€550-850/month (student)" },
  { id: 16, countryId: 1, slug: "lille", name: "Lille", population: 233098, lat: 50.6292, lng: 3.0573, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Strong", housingAvailability: "Moderate", averageRent: "€500-800/month (student)" },
  { id: 17, countryId: 1, slug: "bordeaux", name: "Bordeaux", population: 257068, lat: 44.8378, lng: -0.5792, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€550-850/month (student)" },
  { id: 18, countryId: 1, slug: "grenoble", name: "Grenoble", population: 158198, lat: 45.1885, lng: 5.7245, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Alpine", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€500-800/month (student)" },
  { id: 19, countryId: 1, slug: "montpellier", name: "Montpellier", population: 295542, lat: 43.6108, lng: 3.8767, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Mediterranean", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€500-800/month (student)" },
  { id: 22, countryId: 2, slug: "oxford", name: "Oxford", population: 162000, lat: 51.7520, lng: -1.2577, safety: "High", costOfLiving: "High", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Strong", housingAvailability: "Difficult", averageRent: "£800-1,300/month (student)" },
  { id: 23, countryId: 2, slug: "cambridge", name: "Cambridge", population: 145000, lat: 52.2053, lng: 0.1218, safety: "High", costOfLiving: "High", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Strong", housingAvailability: "Difficult", averageRent: "£800-1,300/month (student)" },
  { id: 24, countryId: 2, slug: "manchester", name: "Manchester", population: 547627, lat: 53.4808, lng: -2.2426, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Mild", nightlife: "Excellent", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Strong", housingAvailability: "Moderate", averageRent: "£600-1,000/month (student)" },
  { id: 25, countryId: 2, slug: "edinburgh", name: "Edinburgh", population: 524930, lat: 55.9533, lng: -3.1883, safety: "High", costOfLiving: "High", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Strong", housingAvailability: "Moderate", averageRent: "£700-1,100/month (student)" },
  { id: 26, countryId: 2, slug: "warwick-coventry", name: "Warwick/Coventry", population: 379000, lat: 52.4068, lng: -1.5197, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "Medium", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "£500-900/month (student)" },
  { id: 27, countryId: 2, slug: "bath", name: "Bath", population: 95000, lat: 51.3758, lng: -2.3599, safety: "High", costOfLiving: "High", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Difficult", averageRent: "£700-1,100/month (student)" },
  { id: 28, countryId: 3, slug: "galway", name: "Galway", population: 79934, lat: 53.2707, lng: -9.0568, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€700-1,100/month (student)" },
  { id: 29, countryId: 3, slug: "cork", name: "Cork", population: 210000, lat: 51.8985, lng: -8.4756, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€700-1,100/month (student)" },
  { id: 30, countryId: 6, slug: "tilburg", name: "Tilburg", population: 219000, lat: 51.5719, lng: 5.0672, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€500-800/month (student)" },
  { id: 31, countryId: 6, slug: "groningen", name: "Groningen", population: 233000, lat: 53.2194, lng: 6.5665, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€500-800/month (student)" },
  { id: 32, countryId: 6, slug: "maastricht", name: "Maastricht", population: 122000, lat: 50.8514, lng: 5.6909, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€500-800/month (student)" },
  { id: 33, countryId: 6, slug: "delft", name: "Delft", population: 104000, lat: 52.0116, lng: 4.3571, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Strong", housingAvailability: "Moderate", averageRent: "€600-900/month (student)" },
  { id: 34, countryId: 5, slug: "aarhus", name: "Aarhus", population: 280000, lat: 56.1629, lng: 10.2039, safety: "Very High", costOfLiving: "High", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "Very High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€600-900/month (student)" },
  { id: 35, countryId: 7, slug: "leuven", name: "Leuven", population: 102000, lat: 50.8796, lng: 4.7009, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Good", frenchFriendliness: "Good", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€500-800/month (student)" },
  { id: 36, countryId: 7, slug: "ghent", name: "Ghent", population: 263000, lat: 51.0543, lng: 3.7174, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Good", frenchFriendliness: "Good", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€500-800/month (student)" },
  { id: 37, countryId: 7, slug: "liege", name: "Liège", population: 197000, lat: 50.6326, lng: 5.5797, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Medium", frenchFriendliness: "Excellent", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "€450-700/month (student)" },
  { id: 38, countryId: 7, slug: "antwerp", name: "Antwerp", population: 524000, lat: 51.2194, lng: 4.4025, safety: "Medium", costOfLiving: "Medium", publicTransport: "Good", weather: "Temperate", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Good", frenchFriendliness: "Good", jobMarket: "Strong", housingAvailability: "Moderate", averageRent: "€550-850/month (student)" },
  { id: 39, countryId: 4, slug: "bergen", name: "Bergen", population: 285000, lat: 60.3913, lng: 5.3221, safety: "Very High", costOfLiving: "Very High", publicTransport: "Good", weather: "Cold", nightlife: "Good", qualityOfLife: "Very High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Difficult", averageRent: "€800-1,200/month (student)" },
  { id: 40, countryId: 10, slug: "wellington", name: "Wellington", population: 215000, lat: -41.2865, lng: 174.7762, safety: "High", costOfLiving: "High", publicTransport: "Good", weather: "Mild", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Good", housingAvailability: "Moderate", averageRent: "NZ$1,000-1,500/month (student)" },
  { id: 41, countryId: 10, slug: "otago-dunedin", name: "Dunedin", population: 130000, lat: -45.8788, lng: 170.5028, safety: "High", costOfLiving: "Medium", publicTransport: "Good", weather: "Cool", nightlife: "Good", qualityOfLife: "High", walkability: "High", englishFriendliness: "Excellent", frenchFriendliness: "Low", jobMarket: "Moderate", housingAvailability: "Easy", averageRent: "NZ$800-1,200/month (student)" },
];
for (const c of newCities) {
  if (!db.cities.find((x) => x.id === c.id)) db.cities.push(c);
}

// 3. Add new schools
const newSchools = [
  // France
  { id: 20, countryId: 1, cityId: 15, slug: "edhec", name: "EDHEC Business School", website: "https://www.edhec.edu", ranking: "Top 15 in Europe", type: "Private", teachingLanguage: "English/French", accreditations: "AACSB, EQUIS, AMBA", description: "Top-tier French business school renowned for finance and risk management programs." },
  { id: 21, countryId: 1, cityId: 16, slug: "skema", name: "SKEMA Business School", website: "https://www.skema.edu", ranking: "Top 30 in Europe", type: "Private", teachingLanguage: "English/French", accreditations: "AACSB, EQUIS, AMBA", description: "Global business school with campuses in France, China, and the US." },
  { id: 22, countryId: 1, cityId: 19, slug: "audencia", name: "Audencia Business School", website: "https://www.audencia.com", ranking: "Top 40 in Europe", type: "Private", teachingLanguage: "English/French", accreditations: "AACSB, EQUIS, AMBA", description: "Leading business school with strong corporate connections." },
  { id: 23, countryId: 1, cityId: 15, slug: "tbs", name: "Toulouse Business School (TBS)", website: "https://www.tbs-education.fr", ranking: "Top 50 in Europe", type: "Private", teachingLanguage: "English/French", accreditations: "AACSB, EQUIS, AMBA", description: "Triple-crown accredited school with strong aerospace and finance programs." },
  { id: 24, countryId: 1, cityId: 17, slug: "kedge", name: "KEDGE Business School", website: "https://www.kedge.edu", ranking: "Top 50 in Europe", type: "Private", teachingLanguage: "English/French", accreditations: "AACSB, EQUIS, AMBA", description: "Large French business school with campuses in Bordeaux and Marseille." },
  { id: 25, countryId: 1, cityId: 19, slug: "montpellier-bs", name: "Montpellier Business School", website: "https://www.montpellier-bs.com", ranking: "Top 60 in Europe", type: "Private", teachingLanguage: "English/French", accreditations: "AACSB, EQUIS, AMBA", description: "Diverse and inclusive business school with strong international focus." },
  { id: 26, countryId: 1, cityId: 18, slug: "grenoble-em", name: "Grenoble Ecole de Management", website: "https://www.grenoble-em.com", ranking: "Top 50 in Europe", type: "Private", teachingLanguage: "English/French", accreditations: "AACSB, EQUIS, AMBA", description: "Innovation-focused school strong in technology management and finance." },
  { id: 27, countryId: 1, cityId: 16, slug: "ieseg", name: "IESEG School of Management", website: "https://www.ieseg.fr", ranking: "Top 60 in Europe", type: "Private", teachingLanguage: "English/French", accreditations: "AACSB, EQUIS", description: "International management school with Paris and Lille campuses." },
  { id: 28, countryId: 1, cityId: 1, slug: "sciences-po", name: "Sciences Po Paris", website: "https://www.sciencespo.fr", ranking: "Top globally (Political Science)", type: "Semi-private", teachingLanguage: "English/French", accreditations: "—", description: "Elite institution for political science, finance, and international affairs." },
  { id: 29, countryId: 1, cityId: 1, slug: "paris-dauphine", name: "Paris-Dauphine University", website: "https://www.dauphine.psl.eu", ranking: "Top globally (Finance)", type: "Semi-private", teachingLanguage: "English/French", accreditations: "—", description: "Specialized university in finance, economics, and management." },
  { id: 30, countryId: 1, cityId: 16, slug: "neoma", name: "NEOMA Business School", website: "https://www.neoma-bs.fr", ranking: "Top 50 in Europe", type: "Private", teachingLanguage: "English/French", accreditations: "AACSB, EQUIS, AMBA", description: "Triple-crown school formed by merger of Rouen and Reims business schools." },
  { id: 31, countryId: 1, cityId: 16, slug: "rennes-sb", name: "Rennes School of Business", website: "https://www.rennes-sb.com", ranking: "Top 60 in Europe", type: "Private", teachingLanguage: "English/French", accreditations: "AACSB, EQUIS", description: "International business school with post-graduate finance programs." },
  // England
  { id: 32, countryId: 2, cityId: 22, slug: "oxford-said", name: "University of Oxford — Saïd Business School", website: "https://www.sbs.ox.ac.uk", ranking: "Top 3 globally (FT)", type: "Semi-private", teachingLanguage: "English", accreditations: "AACSB, EQUIS, AMBA", description: "One of the world's most prestigious universities with elite finance programs." },
  { id: 33, countryId: 2, cityId: 23, slug: "cambridge-judge", name: "University of Cambridge — Judge Business School", website: "https://www.jbs.cam.ac.uk", ranking: "Top 5 globally (FT)", type: "Semi-private", teachingLanguage: "English", accreditations: "AACSB, EQUIS, AMBA", description: "World-class university with strong finance and technology programs." },
  { id: 34, countryId: 2, cityId: 26, slug: "warwick", name: "Warwick Business School", website: "https://www.wbs.ac.uk", ranking: "Top 20 in Europe", type: "Public", teachingLanguage: "English", accreditations: "AACSB, EQUIS, AMBA", description: "Triple-crown accredited school known for finance and analytics." },
  { id: 35, countryId: 2, cityId: 24, slug: "alliance-manchester", name: "Alliance Manchester Business School", website: "https://www.mbs.ac.uk", ranking: "Top 40 globally", type: "Public", teachingLanguage: "English", accreditations: "AACSB, EQUIS, AMBA", description: "Major UK business school with strong finance and tech programs." },
  { id: 36, countryId: 2, cityId: 3, slug: "bayes-city", name: "Bayes Business School (City, University of London)", website: "https://www.bayes.city.ac.uk", ranking: "Top 50 globally (FT)", type: "Public", teachingLanguage: "English", accreditations: "AACSB, EQUIS, AMBA", description: "London-based school with strong finance and quantitative programs." },
  { id: 37, countryId: 2, cityId: 25, slug: "edinburgh-bs", name: "University of Edinburgh Business School", website: "https://www.business-school.ed.ac.uk", ranking: "Top 50 globally", type: "Public", teachingLanguage: "English", accreditations: "AACSB, EQUIS, AMBA", description: "Scottish university with strong finance and AI programs." },
  { id: 38, countryId: 2, cityId: 3, slug: "kcl", name: "King's College London", website: "https://www.kcl.ac.uk", ranking: "Top 30 globally", type: "Public", teachingLanguage: "English", accreditations: "AACSB", description: "Prestigious London university with finance and data science programs." },
  { id: 39, countryId: 2, cityId: 27, slug: "bath", name: "University of Bath School of Management", website: "https://www.bath.ac.uk/school-of-management", ranking: "Top 60 globally", type: "Public", teachingLanguage: "English", accreditations: "AACSB, EQUIS, AMBA", description: "Triple-crown school known for accounting and finance." },
  { id: 40, countryId: 2, cityId: 3, slug: "cranfield", name: "Cranfield School of Management", website: "https://www.cranfield.ac.uk/schools/school-of-management", ranking: "Top 40 in Europe", type: "Public", teachingLanguage: "English", accreditations: "AACSB, EQUIS, AMBA", description: "Postgraduate-only school with strong finance and management programs." },
  // Ireland
  { id: 41, countryId: 3, cityId: 28, slug: "university-galway", name: "University of Galway", website: "https://www.universityofgalway.ie", ranking: "Top 250 globally", type: "Public", teachingLanguage: "English", accreditations: "AACSB", description: "Leading Irish university with strong tech and business programs." },
  { id: 42, countryId: 3, cityId: 4, slug: "dcu", name: "Dublin City University", website: "https://www.dcu.ie", ranking: "Top 400 globally", type: "Public", teachingLanguage: "English", accreditations: "AACSB", description: "Modern Irish university with strong computing and business programs." },
  { id: 43, countryId: 3, cityId: 29, slug: "ucc", name: "University College Cork", website: "https://www.ucc.ie", ranking: "Top 300 globally", type: "Public", teachingLanguage: "English", accreditations: "AACSB", description: "Irish university with growing finance and data science programs." },
  // Netherlands
  { id: 44, countryId: 6, cityId: 30, slug: "tilburg", name: "Tilburg University", website: "https://www.tilburguniversity.edu", ranking: "Top 30 in Europe (Finance)", type: "Public", teachingLanguage: "English", accreditations: "AACSB, EQUIS", description: "World-leading finance and economics research university." },
  { id: 45, countryId: 6, cityId: 5, slug: "vu-amsterdam", name: "Vrije Universiteit Amsterdam", website: "https://www.vu.nl", ranking: "Top 200 globally", type: "Public", teachingLanguage: "English", accreditations: "AACSB", description: "Amsterdam university with strong business and CS programs." },
  { id: 46, countryId: 6, cityId: 31, slug: "groningen", name: "University of Groningen", website: "https://www.rug.nl", ranking: "Top 100 globally", type: "Public", teachingLanguage: "English", accreditations: "AACSB, EQUIS", description: "Research-intensive university with strong economics and tech." },
  { id: 47, countryId: 6, cityId: 32, slug: "maastricht", name: "Maastricht University", website: "https://www.maastrichtuniversity.nl", ranking: "Top 150 globally", type: "Public", teachingLanguage: "English", accreditations: "AACSB, EQUIS", description: "Problem-based learning university with strong business programs." },
  { id: 48, countryId: 6, cityId: 33, slug: "tudelft", name: "Delft University of Technology", website: "https://www.tudelft.nl", ranking: "Top 10 globally (Engineering)", type: "Public", teachingLanguage: "English", accreditations: "—", description: "Top technical university with CS, AI, and data science programs." },
  { id: 49, countryId: 6, cityId: 6, slug: "nyenrode", name: "Nyenrode Business University", website: "https://www.nyenrode.nl", ranking: "Top 50 in Europe", type: "Private", teachingLanguage: "English", accreditations: "AACSB, EQUIS, AMBA", description: "Netherlands' only private university, focused on business and finance." },
  // Denmark
  { id: 50, countryId: 5, cityId: 34, slug: "aarhus", name: "Aarhus University — Business and Social Sciences", website: "https://bss.au.dk", ranking: "Top 100 globally", type: "Public", teachingLanguage: "English", accreditations: "AACSB, EQUIS, AMBA", description: "Top Scandinavian university with strong economics and finance." },
  { id: 51, countryId: 5, cityId: 7, slug: "ku-copenhagen", name: "University of Copenhagen", website: "https://www.ku.dk", ranking: "Top 50 globally", type: "Public", teachingLanguage: "English/Danish", accreditations: "EQUIS", description: "Denmark's largest university with strong economics and data science." },
  { id: 52, countryId: 5, cityId: 7, slug: "itu", name: "IT University of Copenhagen", website: "https://en.itu.dk", ranking: "Top in Denmark (IT)", type: "Public", teachingLanguage: "English", accreditations: "—", description: "Specialized IT university with strong data science and software engineering." },
  // Belgium
  { id: 53, countryId: 7, cityId: 10, slug: "solvay", name: "Solvay Brussels School (ULB)", website: "https://www.solvay.edu", ranking: "Top 60 in Europe", type: "Public", teachingLanguage: "English/French", accreditations: "AACSB, EQUIS", description: "Brussels-based school with strong finance and management programs." },
  { id: 54, countryId: 7, cityId: 35, slug: "ku-leuven", name: "KU Leuven — Faculty of Economics and Business", website: "https://feb.kuleuven.be", ranking: "Top 50 globally (QS)", type: "Public", teachingLanguage: "English", accreditations: "AACSB, EQUIS", description: "Top-ranked Belgian university with strong finance and tech programs." },
  { id: 55, countryId: 7, cityId: 36, slug: "ghent", name: "Ghent University — Faculty of Economics and Business", website: "https://www.ugent.be/eb", ranking: "Top 100 globally", type: "Public", teachingLanguage: "English", accreditations: "AACSB", description: "Major Belgian university with strong economics and data science." },
  { id: 56, countryId: 7, cityId: 37, slug: "hec-liege", name: "HEC Liège (ULiège)", website: "https://www.hec.ulg.ac.be", ranking: "Top 80 in Europe", type: "Public", teachingLanguage: "English/French", accreditations: "AACSB, EQUIS", description: "French-speaking Belgian management school with international programs." },
  { id: 57, countryId: 7, cityId: 38, slug: "antwerp", name: "University of Antwerp — Faculty of Business and Economics", website: "https://www.uantwerpen.be", ranking: "Top 150 globally", type: "Public", teachingLanguage: "English", accreditations: "AACSB", description: "Belgian university with strong finance and supply chain programs." },
  // Spain
  { id: 58, countryId: 8, cityId: 8, slug: "eada", name: "EADA Business School", website: "https://www.eada.edu", ranking: "Top 60 in Europe", type: "Private", teachingLanguage: "English/Spanish", accreditations: "AACSB, EQUIS", description: "Barcelona-based school with practical finance and management programs." },
  { id: 59, countryId: 8, cityId: 9, slug: "carlos-iii", name: "Universidad Carlos III de Madrid", website: "https://www.uc3m.es", ranking: "Top 200 globally", type: "Public", teachingLanguage: "English/Spanish", accreditations: "AACSB", description: "Madrid university with strong economics, finance, and statistics." },
  { id: 60, countryId: 8, cityId: 8, slug: "upf", name: "Pompeu Fabra University", website: "https://www.upf.edu", ranking: "Top 150 globally", type: "Public", teachingLanguage: "English/Spanish", accreditations: "—", description: "Barcelona university with strong economics and data science programs." },
  // Norway
  { id: 61, countryId: 4, cityId: 11, slug: "nhh", name: "NHH Norwegian School of Economics", website: "https://www.nhh.no", ranking: "Top 40 in Europe", type: "Semi-private", teachingLanguage: "English/Norwegian", accreditations: "AACSB, EQUIS", description: "Norway's leading economics and business school." },
  { id: 62, countryId: 4, cityId: 11, slug: "uio", name: "University of Oslo", website: "https://www.uio.no", ranking: "Top 100 globally", type: "Public", teachingLanguage: "English/Norwegian", accreditations: "—", description: "Norway's largest university with strong economics and informatics." },
  { id: 63, countryId: 4, cityId: 39, slug: "ntnu", name: "NTNU Norwegian University of Science and Technology", website: "https://www.ntnu.edu", ranking: "Top 200 globally", type: "Public", teachingLanguage: "English/Norwegian", accreditations: "—", description: "Norway's top technical university with CS, AI, and data science." },
  // Iceland
  { id: 64, countryId: 9, cityId: 12, slug: "reykjavik-university", name: "Reykjavik University", website: "https://en.ru.is", ranking: "National", type: "Private", teachingLanguage: "English", accreditations: "—", description: "Iceland's leading private university for CS, AI, and data science." },
  // New Zealand
  { id: 66, countryId: 10, cityId: 41, slug: "otago", name: "University of Otago", website: "https://www.otago.ac.nz", ranking: "Top 200 globally", type: "Public", teachingLanguage: "English", accreditations: "AACSB", description: "New Zealand's oldest university with strong business and science programs." },
  { id: 67, countryId: 10, cityId: 40, slug: "victoria-wellington", name: "Victoria University of Wellington", website: "https://www.wgtn.ac.nz", ranking: "Top 250 globally", type: "Public", teachingLanguage: "English", accreditations: "AACSB", description: "Wellington university with strong finance and data science programs." },
  { id: 68, countryId: 10, cityId: 13, slug: "aut", name: "Auckland University of Technology (AUT)", website: "https://www.aut.ac.nz", ranking: "Top 400 globally", type: "Public", teachingLanguage: "English", accreditations: "AACSB", description: "Modern NZ university with strong IT and business programs." },
];
for (const s of newSchools) {
  if (!db.schools.find((x) => x.id === s.id)) db.schools.push(s);
}

// 4. Add new programs
let nextProgramId = Math.max(...db.programs.map((p) => p.id)) + 1;
const newPrograms = [
  // EDHEC (20)
  [20, "MSc in Corporate Finance & Banking", "1 year", "YES", 90, "€43,000", true, false, "94%", "€70,000", "Investment Banking, Corporate Finance, M&A", true, false, "Top-ranked finance program with strong investment banking placement."],
  [20, "MSc in Financial Engineering", "1 year", "YES", 90, "€43,000", true, false, "95%", "€75,000", "Quantitative Finance, Risk, FinTech", true, true, "Quantitative finance program with strong derivatives and risk focus."],
  [20, "MSc in Data Analytics & Artificial Intelligence", "1 year", "YES", 90, "€41,000", true, false, "93%", "€68,000", "Tech, AI, Finance, Consulting", false, true, "AI and data analytics program with business applications."],
  [20, "MSc in Risk & Finance", "1 year", "YES", 90, "€42,000", true, false, "92%", "€67,000", "Risk Management, Compliance, Audit", true, false, "Specialized risk and compliance program — ideal for Dina's compliance background."],
  // SKEMA (21)
  [21, "MSc Corporate Finance & Markets", "1 year", "YES", 90, "€35,000", true, false, "90%", "€58,000", "Corporate Finance, Investment Banking, Markets", true, false, "Finance program covering corporate finance and financial markets."],
  [21, "MSc Financial Engineering & Risk", "1 year", "YES", 90, "€36,000", true, false, "91%", "€60,000", "Quantitative Finance, Risk, FinTech", true, true, "Financial engineering program with strong quantitative focus."],
  [21, "MSc Data Science & Business Analytics", "1 year", "YES", 90, "€34,000", true, false, "92%", "€62,000", "Tech, Data, Finance, AI", false, true, "Data science program with business and finance applications."],
  // Audencia (22)
  [22, "MSc in Finance", "1 year", "YES", 90, "€32,000", true, true, "89%", "€55,000", "Corporate Finance, Consulting, Banking", true, false, "Finance program with strong corporate network."],
  [22, "MSc in Data Management & Business Analytics", "1 year", "YES", 90, "€30,000", true, false, "90%", "€56,000", "Tech, Data, Finance, Consulting", false, true, "Data management program bridging business and technology."],
  // TBS (23)
  [23, "MSc Finance", "1 year", "YES", 90, "€30,000", true, true, "88%", "€54,000", "Corporate Finance, Aerospace Finance, Banking", true, false, "Finance program with unique aerospace finance specialization."],
  [23, "MSc Data Science & Business Analytics", "1 year", "YES", 90, "€29,000", true, false, "89%", "€55,000", "Tech, Data, Finance, AI", false, true, "Analytics program with strong industry projects."],
  // KEDGE (24)
  [24, "MSc Finance", "1 year", "YES", 90, "€28,000", true, true, "87%", "€52,000", "Corporate Finance, Wine Finance, Banking", true, false, "Finance program with unique wine and spirits finance track."],
  [24, "MSc Data Science for Business", "1 year", "YES", 90, "€27,000", true, false, "88%", "€53,000", "Tech, Data, Finance, AI", false, true, "Data science program with business applications."],
  // Montpellier BS (25)
  [25, "MSc in Finance", "1 year", "YES", 90, "€26,000", true, true, "86%", "€50,000", "Corporate Finance, Banking, Consulting", true, false, "Affordable finance program with strong international focus."],
  [25, "MSc in Data & Digital Management", "1 year", "YES", 90, "€25,000", true, false, "87%", "€51,000", "Tech, Data, Digital, Finance", false, true, "Digital transformation program with data analytics focus."],
  // Grenoble EM (26)
  [26, "MSc Finance", "1 year", "YES", 90, "€33,000", true, true, "90%", "€58,000", "Corporate Finance, Tech Finance, Consulting", true, true, "Finance program with strong technology and innovation focus."],
  [26, "MSc Data Science & Business Analytics", "1 year", "YES", 90, "€32,000", true, false, "91%", "€60,000", "Tech, AI, Finance, Data", false, true, "Data science program in France's tech hub."],
  // IESEG (27)
  [27, "MSc in Finance", "1 year", "YES", 90, "€30,000", true, true, "88%", "€54,000", "Corporate Finance, Banking, Consulting", true, false, "Finance program with Paris and Lille campus options."],
  [27, "MSc in Big Data Analytics for Business", "1 year", "YES", 90, "€29,000", true, false, "90%", "€56,000", "Tech, Data, AI, Finance", false, true, "Big data program with strong business applications."],
  // Sciences Po (28)
  [28, "Master in Finance", "2 years", "Conditional", 120, "€40,000", true, false, "93%", "€72,000", "Investment Banking, Public Finance, Consulting", true, false, "Elite finance program combining economics, politics, and finance."],
  // Paris-Dauphine (29)
  [29, "Master in Finance (M2)", "1 year", "YES", 60, "€18,000", true, false, "94%", "€68,000", "Investment Banking, Quantitative Finance, Risk", true, true, "Top-ranked quantitative finance program — excellent for M2 direct entry."],
  [29, "Master in Data Science & Analytics", "1 year", "YES", 60, "€16,000", true, false, "93%", "€65,000", "Tech, Data, Finance, AI", false, true, "Data science program with strong quantitative methods."],
  [29, "Master in Risk & Compliance", "1 year", "YES", 60, "€17,000", true, false, "92%", "€62,000", "Risk Management, Compliance, Audit", true, false, "Specialized risk and compliance program — perfect for Dina's background."],
  // NEOMA (30)
  [30, "MSc Finance", "1 year", "YES", 90, "€29,000", true, true, "87%", "€52,000", "Corporate Finance, Banking, Consulting", true, false, "Finance program with Reims and Rouen campuses."],
  [30, "MSc Data Science & Decision Making", "1 year", "YES", 90, "€28,000", true, false, "88%", "€53,000", "Tech, Data, Finance, AI", false, true, "Decision science program with data analytics focus."],
  // Rennes SB (31)
  [31, "MSc in Finance", "1 year", "YES", 90, "€27,000", true, true, "86%", "€50,000", "Corporate Finance, Banking, Consulting", true, false, "International finance program in Brittany."],
  [31, "MSc in Data & Business Analytics", "1 year", "YES", 90, "€26,000", true, false, "87%", "€51,000", "Tech, Data, Finance, AI", false, true, "Analytics program with strong international focus."],
  // Oxford (32)
  [32, "MSc in Financial Economics", "9 months", "YES", 90, "£52,000", false, false, "97%", "£85,000", "Investment Banking, M&A, Asset Management, Consulting", true, false, "Elite finance program at Oxford combining rigorous economics with finance."],
  [32, "Oxford MBA", "1 year", "YES", 90, "£78,000", true, false, "96%", "£95,000", "Finance, Consulting, Tech, Entrepreneurship", true, true, "World-leading MBA with strong finance and entrepreneurship tracks."],
  // Cambridge (33)
  [33, "MPhil in Finance", "1 year", "YES", 90, "£48,000", false, false, "96%", "£80,000", "Investment Banking, Asset Management, Research", true, true, "Cambridge's elite finance program with strong quantitative focus."],
  [33, "MPhil in Advanced Computer Science", "1 year", "YES", 90, "£45,000", false, false, "97%", "£85,000", "Tech, AI, Finance, Research", false, true, "Advanced CS program with AI and ML specializations."],
  // Warwick (34)
  [34, "MSc Finance", "1 year", "YES", 90, "£35,000", true, false, "93%", "£62,000", "Investment Banking, Corporate Finance, Consulting", true, false, "Strong finance program at triple-crown accredited school."],
  [34, "MSc Business Analytics", "1 year", "YES", 90, "£33,000", true, false, "94%", "£65,000", "Tech, Data, Finance, Consulting", false, true, "Analytics program with strong industry consulting projects."],
  [34, "MSc Data Science", "1 year", "YES", 90, "£34,000", true, false, "95%", "£68,000", "Tech, AI, Finance, Data", false, true, "Data science program with strong ML and computational focus."],
  // Manchester (35)
  [35, "MSc Finance", "1 year", "YES", 90, "£30,000", true, false, "91%", "£55,000", "Corporate Finance, Banking, Consulting", true, false, "Finance program at major UK business school."],
  [35, "MSc Data Science & Business Analytics", "1 year", "YES", 90, "£28,000", true, false, "92%", "£58,000", "Tech, Data, Finance, AI", false, true, "Analytics program combining data science and business."],
  // Bayes/City (36)
  [36, "MSc in Finance", "1 year", "YES", 90, "£32,000", true, false, "92%", "£60,000", "Investment Banking, Corporate Finance, Quant", true, true, "London-based finance program with strong industry links."],
  [36, "MSc in Data Science & Business Analytics", "1 year", "YES", 90, "£30,000", true, false, "93%", "£62,000", "Tech, Data, Finance, AI", false, true, "Analytics program in the heart of London's financial district."],
  // Edinburgh (37)
  [37, "MSc in Finance", "1 year", "YES", 90, "£28,000", true, false, "90%", "£52,000", "Finance, Banking, Consulting", true, false, "Finance program at Scotland's top university."],
  [37, "MSc in Data Science & AI", "1 year", "YES", 90, "£27,000", true, false, "93%", "£58,000", "Tech, AI, Finance, Data", false, true, "AI-focused program with strong industry connections."],
  // KCL (38)
  [38, "MSc in Finance", "1 year", "YES", 90, "£33,000", true, false, "91%", "£58,000", "Finance, Banking, Consulting", true, false, "Finance program at prestigious London university."],
  [38, "MSc in Data Science", "1 year", "YES", 90, "£31,000", true, false, "93%", "£62,000", "Tech, AI, Finance, Data", false, true, "Data science program with strong ML and AI focus."],
  // Bath (39)
  [39, "MSc in Accounting & Finance", "1 year", "YES", 90, "£27,000", true, false, "92%", "£52,000", "Accounting, Finance, Audit, Consulting", true, false, "Accounting and finance program at triple-crown school."],
  [39, "MSc in Data Science", "1 year", "YES", 90, "£26,000", true, false, "93%", "£55,000", "Tech, Data, Finance, AI", false, true, "Data science program with strong business applications."],
  // Cranfield (40)
  [40, "MSc in Finance & Management", "1 year", "YES", 90, "£31,000", true, false, "92%", "£58,000", "Corporate Finance, Management, Consulting", true, true, "Postgraduate-only finance program with strong industry focus."],
  [40, "MSc in Data Science", "1 year", "YES", 90, "£29,000", true, false, "93%", "£60,000", "Tech, Data, AI, Finance", false, true, "Data science program at postgraduate-only school."],
  // Galway (41)
  [41, "MSc in Finance", "1 year", "YES", 90, "€18,000", true, false, "87%", "€45,000", "Finance, Tech, Consulting", true, false, "Affordable finance program in Ireland's west coast."],
  [41, "MSc in Data Science", "1 year", "YES", 90, "€17,000", true, false, "90%", "€48,000", "Tech, Data, AI, Finance", false, true, "Data science program with strong industry connections."],
  // DCU (42)
  [42, "MSc in Finance", "1 year", "YES", 90, "€16,000", true, false, "88%", "€46,000", "Finance, FinTech, Banking", true, true, "Modern finance program with FinTech focus."],
  [42, "MSc in Computing (Data Science)", "1 year", "YES", 90, "€15,000", true, false, "92%", "€50,000", "Tech, Data, AI, FinTech", false, true, "Computing program with strong data science and AI tracks."],
  // UCC (43)
  [43, "MSc in Finance", "1 year", "YES", 90, "€17,000", true, false, "87%", "€45,000", "Finance, Banking, Consulting", true, false, "Finance program at growing Irish university."],
  [43, "MSc in Data Science & Analytics", "1 year", "YES", 90, "€16,000", true, false, "90%", "€48,000", "Tech, Data, AI, Finance", false, true, "Analytics program with strong industry projects."],
  // Tilburg (44)
  [44, "MSc Finance", "1 year", "YES", 60, "€15,000", true, false, "93%", "€58,000", "Investment Banking, Corporate Finance, Research", true, false, "World-leading finance research university."],
  [44, "MSc Data Science & Business Analytics", "1 year", "YES", 60, "€15,000", true, false, "94%", "€60,000", "Tech, Data, Finance, AI", false, true, "Analytics program at top economics research university."],
  [44, "MSc Quantitative Finance & Actuarial Science", "1 year", "YES", 60, "€15,000", true, false, "95%", "€62,000", "Quantitative Finance, Risk, Insurance", true, true, "Specialized quant finance program with actuarial science."],
  // VU Amsterdam (45)
  [45, "MSc in Finance", "1 year", "YES", 60, "€17,000", true, false, "88%", "€52,000", "Finance, Banking, Consulting", true, false, "Finance program at Amsterdam's VU university."],
  [45, "MSc in Data Science & Business Analytics", "1 year", "YES", 60, "€17,000", true, false, "90%", "€54,000", "Tech, Data, Finance, AI", false, true, "Analytics program with strong business applications."],
  // Groningen (46)
  [46, "MSc in Finance", "1 year", "YES", 60, "€15,000", true, false, "88%", "€50,000", "Finance, Banking, Consulting", true, false, "Finance program at top-100 global university."],
  [46, "MSc in Data Science", "1 year", "YES", 60, "€15,000", true, false, "91%", "€53,000", "Tech, Data, AI, Finance", false, true, "Data science program with strong AI focus."],
  // Maastricht (47)
  [47, "MSc in Finance", "1 year", "YES", 60, "€16,000", true, false, "89%", "€52,000", "Finance, Banking, Consulting", true, false, "Problem-based learning finance program."],
  [47, "MSc in Data Science for Decision Making", "1 year", "YES", 60, "€16,000", true, false, "91%", "€54,000", "Tech, Data, Finance, AI", false, true, "Decision-making focused data science program."],
  // TU Delft (48)
  [48, "MSc in Data Science & AI", "2 years", "Conditional", 120, "€20,000", true, false, "96%", "€65,000", "Tech, AI, Data, FinTech", false, true, "Top technical university AI and data science program."],
  [48, "MSc in Computer Science", "2 years", "Conditional", 120, "€20,000", true, false, "96%", "€65,000", "Tech, Software, AI, Cloud", false, true, "Comprehensive CS program with strong engineering focus."],
  // Nyenrode (49)
  [49, "MSc in Finance", "1 year", "YES", 60, "€25,000", true, false, "90%", "€55,000", "Corporate Finance, Banking, Consulting", true, false, "Finance program at Netherlands' only private university."],
  [49, "MSc in Data Analytics & AI", "1 year", "YES", 60, "€24,000", true, false, "91%", "€57,000", "Tech, Data, AI, Finance", false, true, "AI program at private business university."],
  // Aarhus (50)
  [50, "MSc in Finance", "2 years", "Conditional", 120, "€12,000", true, false, "89%", "€60,000", "Finance, Banking, Consulting", true, false, "Finance program at top Scandinavian university."],
  [50, "MSc in Data Science", "2 years", "Conditional", 120, "€12,000", true, false, "92%", "€63,000", "Tech, Data, AI, Finance", false, true, "Data science program with strong ML focus."],
  // KU Copenhagen (51)
  [51, "MSc in Economics", "2 years", "Conditional", 120, "€13,000", true, false, "90%", "€62,000", "Finance, Consulting, Public Policy, Research", true, true, "Economics program with strong quantitative finance track."],
  [51, "MSc in Computer Science", "2 years", "Conditional", 120, "€13,000", true, false, "94%", "€68,000", "Tech, AI, Data, Software", false, true, "CS program with strong AI and data science tracks."],
  // IT University (52)
  [52, "MSc in Data Science", "2 years", "Conditional", 120, "€12,000", true, false, "93%", "€65,000", "Tech, Data, AI, FinTech", false, true, "Specialized data science program at IT-focused university."],
  [52, "MSc in Software Design", "2 years", "Conditional", 120, "€12,000", true, false, "94%", "€67,000", "Tech, Software, Cloud, DevOps", false, true, "Software engineering program with strong design focus."],
  // Solvay (53)
  [53, "MSc in Finance", "1 year", "YES", 60, "€12,000", true, false, "88%", "€50,000", "Finance, Banking, Consulting", true, false, "Affordable finance program in Brussels — French/English bilingual."],
  [53, "MSc in Business Analytics", "1 year", "YES", 60, "€12,000", true, false, "90%", "€52,000", "Tech, Data, Finance, AI", false, true, "Analytics program at Brussels' leading business school."],
  // KU Leuven (54)
  [54, "MSc in Finance", "1 year", "YES", 60, "€6,000", true, false, "91%", "€55,000", "Finance, Banking, Consulting, Research", true, false, "Top-ranked, affordable finance program at Belgium's best university."],
  [54, "MSc in Artificial Intelligence", "1 year", "YES", 60, "€6,000", true, false, "94%", "€60,000", "Tech, AI, Data, Finance", false, true, "AI program at one of Europe's top technical universities."],
  [54, "MSc in Data Science & Business Analytics", "1 year", "YES", 60, "€6,000", true, false, "93%", "€58,000", "Tech, Data, Finance, AI", false, true, "Analytics program combining data science and business."],
  // Ghent (55)
  [55, "MSc in Economics & Finance", "1 year", "YES", 60, "€5,000", true, false, "88%", "€50,000", "Finance, Banking, Consulting, Research", true, false, "Very affordable finance program at major Belgian university."],
  [55, "MSc in Data Science & Engineering", "1 year", "YES", 60, "€5,000", true, false, "91%", "€53,000", "Tech, Data, AI, Finance", false, true, "Data engineering program with strong industry focus."],
  // HEC Liège (56)
  [56, "MSc in Finance", "1 year", "YES", 60, "€8,000", true, true, "87%", "€48,000", "Finance, Banking, Consulting", true, false, "French-speaking finance program — excellent for Dina's French skills."],
  [56, "MSc in Data Science & Business", "1 year", "YES", 60, "€8,000", true, false, "89%", "€50,000", "Tech, Data, Finance, AI", false, true, "Data science program at French-speaking Belgian school."],
  // Antwerp (57)
  [57, "MSc in Finance", "1 year", "YES", 60, "€7,000", true, false, "88%", "€50,000", "Finance, Banking, Supply Chain, Consulting", true, false, "Finance program with strong supply chain and logistics focus."],
  [57, "MSc in Data Science & Business Analytics", "1 year", "YES", 60, "€7,000", true, false, "90%", "€52,000", "Tech, Data, Finance, AI", false, true, "Analytics program at Antwerp's business university."],
  // EADA (58)
  [58, "MSc in Finance", "1 year", "YES", 90, "€32,000", true, false, "89%", "€55,000", "Corporate Finance, Banking, Consulting", true, false, "Practical finance program in Barcelona."],
  [58, "MSc in Business Analytics", "1 year", "YES", 90, "€30,000", true, false, "90%", "€57,000", "Tech, Data, Finance, AI", false, true, "Analytics program with strong hands-on projects."],
  // Carlos III (59)
  [59, "MSc in Finance", "1 year", "YES", 60, "€8,000", true, false, "90%", "€52,000", "Finance, Banking, Research, Consulting", true, false, "Very affordable, high-quality finance program in Madrid."],
  [59, "MSc in Big Data & Data Science", "1 year", "YES", 60, "€8,000", true, false, "92%", "€55,000", "Tech, Data, AI, Finance", false, true, "Data science program at Madrid's top economics university."],
  // UPF (60)
  [60, "MSc in Finance & Banking", "1 year", "YES", 60, "€7,000", true, false, "89%", "€50,000", "Finance, Banking, Research", true, false, "Affordable finance program at Barcelona's top economics university."],
  [60, "MSc in Data Science", "1 year", "YES", 60, "€7,000", true, false, "91%", "€53,000", "Tech, Data, AI, Finance", false, true, "Data science program with strong computational focus."],
  // NHH (61)
  [61, "MSc in Economics & Business — Finance", "2 years", "Conditional", 120, "€10,000", true, false, "90%", "€65,000", "Finance, Energy, Maritime, Consulting", true, false, "Norway's top economics school with strong finance program."],
  [61, "MSc in Data Science & Business Analytics", "2 years", "Conditional", 120, "€10,000", true, false, "92%", "€68,000", "Tech, Data, Finance, AI", false, true, "Analytics program at Norway's leading business school."],
  // UIO (62)
  [62, "MSc in Economics", "2 years", "Conditional", 120, "€12,000", true, false, "88%", "€60,000", "Finance, Consulting, Public Policy, Research", true, true, "Economics program with strong quantitative finance track."],
  [62, "MSc in Data Science", "2 years", "Conditional", 120, "€12,000", true, false, "92%", "€65,000", "Tech, Data, AI, Finance", false, true, "Data science program at Norway's largest university."],
  // NTNU (63)
  [63, "MSc in Computer Science — AI", "2 years", "Conditional", 120, "€13,000", true, false, "94%", "€68,000", "Tech, AI, Data, FinTech", false, true, "AI-focused CS program at Norway's top technical university."],
  [63, "MSc in Data Science & Analytics", "2 years", "Conditional", 120, "€13,000", true, false, "93%", "€66,000", "Tech, Data, AI, Finance", false, true, "Data science program with strong engineering focus."],
  // Reykjavik University (64)
  [64, "MSc in Data Science", "2 years", "Conditional", 120, "€8,000", true, false, "92%", "€60,000", "Tech, Data, AI, FinTech", false, true, "Data science program at Iceland's leading private tech university."],
  [64, "MSc in Computer Science", "2 years", "Conditional", 120, "€8,000", true, false, "93%", "€62,000", "Tech, Software, AI, Cloud", false, true, "CS program with strong AI and software engineering tracks."],
  // Otago (66)
  [66, "Master of Finance", "1.5 years", "YES", 120, "NZ$40,000", true, false, "86%", "NZ$62,000", "Finance, Banking, Consulting", true, false, "Finance program at NZ's oldest university."],
  [66, "Master of Data Science", "1.5 years", "YES", 120, "NZ$42,000", true, false, "88%", "NZ$65,000", "Tech, Data, AI, Finance", false, true, "Data science program with strong research focus."],
  // Victoria Wellington (67)
  [67, "Master of Finance", "1.5 years", "YES", 120, "NZ$42,000", true, false, "87%", "NZ$65,000", "Finance, Banking, Public Policy", true, false, "Finance program in NZ's capital city."],
  [67, "Master of Data Science", "1.5 years", "YES", 120, "NZ$44,000", true, false, "89%", "NZ$68,000", "Tech, Data, AI, Finance", false, true, "Data science program with strong government and industry links."],
  // AUT (68)
  [68, "Master of Finance", "1.5 years", "YES", 120, "NZ$38,000", true, false, "85%", "NZ$58,000", "Finance, Banking, FinTech", true, true, "Modern finance program with FinTech focus."],
  [68, "Master of Data Science", "1.5 years", "YES", 120, "NZ$40,000", true, false, "88%", "NZ$62,000", "Tech, Data, AI, Finance", false, true, "Data science program at modern NZ university."],
  // Additional programs for existing schools
  // HEC Paris
  [1, "MSc Data Science for Business", "1 year", "YES", 90, "€48,000", true, false, "94%", "€75,000", "Tech, Finance, AI, Consulting", false, true, "Joint program with École Polytechnique combining data science and business."],
  // ESSEC
  [2, "Global MBA", "1 year", "YES", 90, "€49,000", true, false, "93%", "€78,000", "Consulting, Finance, Tech", true, true, "One-year MBA with strong finance and entrepreneurship tracks."],
  [2, "MSc Data Science & AI for Business", "1 year", "YES", 90, "€45,000", true, false, "93%", "€70,000", "Tech, AI, Finance, Consulting", false, true, "Data science program with business applications and AI focus."],
  // ESCP
  [3, "MSc Big Data & Business Analytics", "1 year", "YES", 90, "€42,000", true, false, "92%", "€65,000", "Tech, Data, Finance, Consulting", false, true, "Analytics program with strong industry partnerships."],
  // emlyon
  [4, "MSc Data Science & AI Strategy", "1 year", "YES", 90, "€40,000", true, false, "93%", "€68,000", "Tech, AI, Finance, Consulting", false, true, "Program combining data science, AI, and business strategy."],
  // LSE
  [5, "MSc Finance & Economics", "1 year", "YES", 90, "£42,000", false, false, "95%", "£72,000", "Investment Banking, Central Banking, Research", true, true, "Quantitative finance program combining finance and economics."],
  [5, "MSc Risk & Finance", "1 year", "YES", 90, "£40,000", false, false, "93%", "£68,000", "Risk Management, Finance, Consulting", true, false, "Risk management program — ideal for Dina's compliance background."],
  // Imperial
  [6, "MSc Financial Technology", "1 year", "YES", 90, "£44,000", false, false, "96%", "£75,000", "FinTech, Blockchain, Finance, Tech", true, true, "FinTech program covering blockchain, payments, and digital finance."],
  [6, "MSc Business Analytics", "1 year", "YES", 90, "£41,000", false, false, "95%", "£73,000", "Tech, Data, Finance, Consulting", false, true, "Business analytics program with strong industry projects."],
  // UCL
  [7, "MSc Computational Finance", "1 year", "YES", 90, "£42,000", false, false, "95%", "£75,000", "Quantitative Finance, FinTech, Trading", true, true, "Mathematical finance program with strong programming component."],
  // Trinity
  [8, "MSc in Data Science", "1 year", "YES", 90, "€24,000", true, false, "93%", "€58,000", "Tech, Data, Finance, AI", false, true, "Data science program with strong computational focus."],
  // UCD Smurfit
  [9, "MSc Business Analytics", "1 year", "YES", 90, "€23,000", true, false, "93%", "€55,000", "Tech, Data, Finance, Consulting", false, true, "Analytics program with strong industry projects."],
  [9, "MSc in Data & Computational Science", "1 year", "YES", 90, "€23,000", true, false, "94%", "€58,000", "Tech, Data, AI, Finance", false, true, "Computational science program with strong data focus."],
  // UvA
  // (already has 2 programs)
  // RSM
  [11, "MSc Quantitative Finance", "1 year", "YES", 60, "€22,000", true, false, "94%", "€62,000", "Quantitative Finance, Risk, FinTech", true, true, "Quantitative finance program with strong mathematical focus."],
  // CBS
  [12, "MSc in Data Science & Business Analytics", "2 years", "Conditional", 120, "€15,000", true, false, "90%", "€65,000", "Tech, Data, Finance, AI", false, true, "Analytics program at Scandinavia's largest business school."],
  [12, "MSc in Economics & Business Administration — Finance", "2 years", "Conditional", 120, "€15,000", true, false, "89%", "€63,000", "Corporate Finance, Banking, Consulting", true, false, "General finance specialization within CBS's flagship program."],
  // IESE — already has 1
  // ESADE
  [14, "MSc in Business Analytics", "1 year", "YES", 90, "€40,000", true, false, "93%", "€65,000", "Tech, Data, Finance, AI", false, true, "Analytics program with strong industry projects."],
  // IE
  [15, "Master in FinTech & Blockchain", "1 year", "YES", 90, "€44,000", true, false, "95%", "€70,000", "FinTech, Blockchain, Crypto, Finance", true, true, "Specialized FinTech program covering blockchain, crypto, and digital finance."],
  // Vlerick
  [16, "Master in Business Analytics & AI", "1 year", "YES", 60, "€20,000", true, false, "92%", "€58,000", "Tech, Data, AI, Finance", false, true, "Analytics program with strong AI and business focus."],
  // BI
  [17, "MSc in Data Science for Business", "2 years", "Conditional", 120, "€14,000", true, false, "88%", "€63,000", "Tech, Data, Finance, AI", false, true, "Business-focused data science program."],
  // University of Iceland
  [18, "MSc in Finance", "2 years", "Conditional", 120, "Free (registration fee)", true, false, "85%", "€52,000", "Finance, Energy, Banking", true, false, "Finance program with renewable energy finance focus."],
  // UoA
  // (already has 2 programs)
];

for (const p of newPrograms) {
  db.programs.push({
    id: nextProgramId++,
    schoolId: p[0], name: p[1], duration: p[2], canEnterM2: p[3], ects: p[4],
    tuitionFees: p[5], internshipIncluded: p[6], alternanceAvailable: p[7],
    employmentRate: p[8], averageSalary: p[9], industriesHiring: p[10],
    relevantForDina: p[11], relevantForJadiss: p[12], description: p[13]
  });
}

// 5. Add admissions for new schools
let nextAdmissionId = Math.max(...db.admissions.map((a) => a.id)) + 1;
const admissionDefaults = {
  // France private schools
  20: ["Bachelor's degree, strong academic record, GMAT/GRE", "TOEFL 90+ / IELTS 6.5+ / Cambridge C1", "Not required for English track", "CV, transcripts, GMAT/GRE, essays, recommendations", "Online application → interview → decision", true, true, true],
  21: ["Bachelor's degree, academic excellence, English proficiency", "TOEFL 90+ / IELTS 6.5+", "Not required for English track", "CV, transcripts, essays, recommendations", "Online application → review → decision", false, false, false],
  22: ["Bachelor's degree, English proficiency", "TOEFL 85+ / IELTS 6.5+", "Not required for English track", "CV, transcripts, essays, recommendations", "Online application → interview → decision", true, false, false],
  23: ["Bachelor's degree, English proficiency", "TOEFL 85+ / IELTS 6.5+", "Not required for English track", "CV, transcripts, essays, recommendations", "Online application → review → decision", false, false, false],
  24: ["Bachelor's degree, English proficiency", "TOEFL 85+ / IELTS 6.5+", "Not required for English track", "CV, transcripts, essays, recommendations", "Online application → review → decision", false, false, false],
  25: ["Bachelor's degree, English proficiency", "TOEFL 80+ / IELTS 6.0+", "Not required for English track", "CV, transcripts, essays, recommendations", "Online application → review → decision", false, false, false],
  26: ["Bachelor's degree, GMAT/GRE, English proficiency", "TOEFL 90+ / IELTS 6.5+", "Not required for English track", "CV, transcripts, GMAT/GRE, essays, recommendations", "Online application → interview → decision", true, false, false],
  27: ["Bachelor's degree, English proficiency", "TOEFL 85+ / IELTS 6.5+", "Not required for English track", "CV, transcripts, essays, recommendations", "Online application → review → decision", false, false, false],
  28: ["Bachelor's degree, strong academic record, French/English proficiency", "TOEFL 100+ / IELTS 7.0+", "French B2+ recommended (Dina's French is an advantage)", "CV, transcripts, essays, recommendations", "Online application → interview → decision", true, false, false],
  29: ["Bachelor's degree in relevant field, strong quantitative background", "TOEFL 90+ / IELTS 6.5+", "French helpful but not required (Dina's French is an advantage)", "CV, transcripts, motivation letter, references", "Online application → review → decision", false, false, false],
  30: ["Bachelor's degree, English proficiency", "TOEFL 85+ / IELTS 6.5+", "Not required for English track", "CV, transcripts, essays, recommendations", "Online application → review → decision", false, false, false],
  31: ["Bachelor's degree, English proficiency", "TOEFL 80+ / IELTS 6.0+", "Not required for English track", "CV, transcripts, essays, recommendations", "Online application → review → decision", false, false, false],
  // England
  32: ["First class degree, GMAT/GRE, strong academic record", "IELTS 7.5+ (with 7.0+ in each)", "N/A", "CV, transcripts, GMAT/GRE, essays, references", "Online application → interview → decision", true, true, true],
  33: ["First class degree, strong quantitative background", "IELTS 7.5+ (with 7.0+ in each)", "N/A", "CV, transcripts, personal statement, references", "Online application → interview → decision", true, false, false],
  34: ["Upper second class degree, GMAT/GRE for some programs", "IELTS 7.0+ (with 6.0+ in each)", "N/A", "CV, transcripts, GMAT/GRE, personal statement, references", "Online application → review → decision", false, true, true],
  35: ["Upper second class degree, English proficiency", "IELTS 7.0+ (with 6.0+ in each)", "N/A", "CV, transcripts, personal statement, references", "Online application → review → decision", false, false, false],
  36: ["Upper second class degree, GMAT/GRE for finance", "IELTS 7.0+ (with 6.0+ in each)", "N/A", "CV, transcripts, GMAT/GRE, personal statement, references", "Online application → review → decision", false, true, false],
  37: ["Upper second class degree, English proficiency", "IELTS 7.0+ (with 6.0+ in each)", "N/A", "CV, transcripts, personal statement, references", "Online application → review → decision", false, false, false],
  38: ["Upper second class degree, English proficiency", "IELTS 7.0+ (with 6.5+ in each)", "N/A", "CV, transcripts, personal statement, references", "Online application → review → decision", false, false, false],
  39: ["Upper second class degree, English proficiency", "IELTS 6.5+ (with 6.0+ in each)", "N/A", "CV, transcripts, personal statement, references", "Online application → review → decision", false, false, false],
  40: ["Upper second class degree, work experience preferred", "IELTS 7.0+ (with 6.0+ in each)", "N/A", "CV, transcripts, personal statement, references", "Online application → review → decision", false, false, false],
  // Ireland
  41: ["Upper second class degree, English proficiency", "IELTS 6.5+", "N/A", "CV, transcripts, personal statement, references", "Online application → review → decision", false, false, false],
  42: ["Upper second class degree, English proficiency", "IELTS 6.5+", "N/A", "CV, transcripts, personal statement, references", "Online application → review → decision", false, false, false],
  43: ["Upper second class degree, English proficiency", "IELTS 6.5+", "N/A", "CV, transcripts, personal statement, references", "Online application → review → decision", false, false, false],
  // Netherlands
  44: ["Bachelor's degree in relevant field, strong quantitative background", "IELTS 6.5+ / TOEFL 90+", "N/A", "CV, transcripts, motivation letter, references", "Online application → review → decision", false, false, false],
  45: ["Bachelor's degree equivalent to Dutch university level, English proficiency", "IELTS 6.5+ / TOEFL 90+", "N/A", "CV, transcripts, motivation letter, references", "Online application → review → decision", false, false, false],
  46: ["Bachelor's degree, English proficiency", "IELTS 6.5+ / TOEFL 90+", "N/A", "CV, transcripts, motivation letter, references", "Online application → review → decision", false, false, false],
  47: ["Bachelor's degree, English proficiency", "IELTS 6.5+ / TOEFL 90+", "N/A", "CV, transcripts, motivation letter, references", "Online application → review → decision", false, false, false],
  48: ["Bachelor's degree in relevant technical field", "IELTS 6.5+ / TOEFL 90+", "N/A", "CV, transcripts, motivation letter, references", "Online application → review → decision", false, false, false],
  49: ["Bachelor's degree, GMAT/GRE, English proficiency", "IELTS 6.5+ / TOEFL 90+", "N/A", "CV, transcripts, GMAT/GRE, essays, references", "Online application → interview → decision", true, true, false],
  // Denmark
  50: ["Bachelor's degree in relevant field, English proficiency", "IELTS 6.5+ / TOEFL 83+", "N/A", "CV, transcripts, motivation letter, references", "Online application → review → decision", false, false, false],
  51: ["Bachelor's degree in relevant field, English proficiency", "IELTS 6.5+ / TOEFL 83+", "N/A", "CV, transcripts, motivation letter, references", "Online application → review → decision", false, false, false],
  52: ["Bachelor's degree in IT or relevant field", "IELTS 6.5+ / TOEFL 83+", "N/A", "CV, transcripts, motivation letter, references", "Online application → review → decision", false, false, false],
  // Belgium
  53: ["Bachelor's degree, English/French proficiency", "TOEFL 90+ / IELTS 6.5+", "French B2+ recommended (Dina's French is an advantage)", "CV, transcripts, essays, references", "Online application → review → decision", false, false, false],
  54: ["Bachelor's degree in relevant field, strong academic record", "IELTS 6.5+ / TOEFL 90+", "Not required for English track", "CV, transcripts, motivation letter, references", "Online application → review → decision", false, false, false],
  55: ["Bachelor's degree in relevant field", "IELTS 6.5+ / TOEFL 90+", "Not required for English track", "CV, transcripts, motivation letter, references", "Online application → review → decision", false, false, false],
  56: ["Bachelor's degree, French/English proficiency", "TOEFL 80+ / IELTS 6.0+", "French B2+ (Dina's French is an advantage)", "CV, transcripts, essays, references", "Online application → review → decision", false, false, false],
  57: ["Bachelor's degree, English proficiency", "IELTS 6.5+ / TOEFL 90+", "Not required for English track", "CV, transcripts, motivation letter, references", "Online application → review → decision", false, false, false],
  // Spain
  58: ["Bachelor's degree, English/Spanish proficiency", "TOEFL 85+ / IELTS 6.5+", "N/A", "CV, transcripts, essays, recommendations", "Online application → interview → decision", true, false, false],
  59: ["Bachelor's degree in relevant field, strong quantitative background", "TOEFL 80+ / IELTS 6.0+", "N/A", "CV, transcripts, motivation letter, references", "Online application → review → decision", false, false, false],
  60: ["Bachelor's degree in relevant field", "TOEFL 80+ / IELTS 6.0+", "N/A", "CV, transcripts, motivation letter, references", "Online application → review → decision", false, false, false],
  // Norway
  61: ["Bachelor's degree in relevant field, English proficiency", "TOEFL 80+ / IELTS 6.0+", "N/A", "CV, transcripts, motivation letter, references", "Online application → review → decision", false, false, false],
  62: ["Bachelor's degree in relevant field, English proficiency", "TOEFL 80+ / IELTS 6.0+", "N/A", "CV, transcripts, motivation letter, references", "Online application → review → decision", false, false, false],
  63: ["Bachelor's degree in relevant technical field, English proficiency", "TOEFL 80+ / IELTS 6.0+", "N/A", "CV, transcripts, motivation letter, references", "Online application → review → decision", false, false, false],
  // Iceland
  64: ["Bachelor's degree in relevant field, English proficiency", "TOEFL 79+ / IELTS 6.5+", "N/A", "CV, transcripts, motivation letter, references", "Online application → review → decision", false, false, false],
  // New Zealand
  66: ["Bachelor's degree equivalent to NZ qualification", "IELTS 6.5+ / TOEFL 90+", "N/A", "CV, transcripts, personal statement, references", "Online application → review → decision", false, false, false],
  67: ["Bachelor's degree equivalent to NZ qualification", "IELTS 6.5+ / TOEFL 90+", "N/A", "CV, transcripts, personal statement, references", "Online application → review → decision", false, false, false],
  68: ["Bachelor's degree equivalent to NZ qualification", "IELTS 6.5+ / TOEFL 90+", "N/A", "CV, transcripts, personal statement, references", "Online application → review → decision", false, false, false],
};

for (const [schoolId, a] of Object.entries(admissionDefaults)) {
  if (!db.admissions.find((x) => x.schoolId === parseInt(schoolId))) {
    db.admissions.push({
      id: nextAdmissionId++,
      schoolId: parseInt(schoolId),
      requirements: a[0], englishRequirements: a[1], frenchRequirements: a[2],
      documents: a[3], process: a[4], interviewRequired: a[5], gmatRequired: a[6], greRequired: a[7]
    });
  }
}

// 6. Add deadlines for new schools
let nextDeadlineId = Math.max(...db.deadlines.map((d) => d.id)) + 1;
for (const school of db.schools) {
  if (!db.deadlines.find((d) => d.schoolId === school.id)) {
    db.deadlines.push({
      id: nextDeadlineId++,
      schoolId: school.id,
      academicYear: "2026/2027",
      applicationOpening: "October 2025",
      applicationClosing: "Rolling admissions until June 2026"
    });
  }
}

// 7. Add candidate scores for new schools
let nextScoreId = Math.max(...db.candidateScores.map((s) => s.id)) + 1;

// Score generator based on school characteristics
function generateScores(school, candidateId) {
  const isFrench = school.countryId === 1;
  const isBelgian = school.countryId === 7;
  const isEnglishSpeaking = [2, 3, 10].includes(school.countryId);
  const isTopRanked = school.ranking.includes("Top 3") || school.ranking.includes("Top 5") || school.ranking.includes("Top 10 glob");
  const isPrivate = school.type === "Private";
  const hasFrench = school.teachingLanguage.includes("French");

  // Base scores
  let overall, admissionProbability, careerOpportunities, roi, networking, englishFriendliness,
    studentJobs, cost, housing, visaDifficulty, employment, recommendation;

  if (candidateId === 1) { // Dina — finance focus, French speaker
    careerOpportunities = isTopRanked ? 95 : 85 + Math.floor(Math.random() * 8);
    networking = isTopRanked ? 92 : 80 + Math.floor(Math.random() * 8);
    englishFriendliness = isEnglishSpeaking ? 100 : hasFrench ? 85 : 75;
    studentJobs = isEnglishSpeaking ? 85 : isFrench || isBelgian ? 78 : 65;
    cost = isPrivate && isTopRanked ? 55 : isPrivate ? 65 : 75;
    housing = isEnglishSpeaking ? 50 : 62;
    visaDifficulty = isEnglishSpeaking ? 80 : isFrench ? 75 : 72;
    employment = careerOpportunities - 3;
    admissionProbability = isTopRanked ? 65 : 75 + Math.floor(Math.random() * 8);
    roi = isPrivate && isTopRanked ? 85 : isPrivate ? 80 : 90;
    overall = Math.round((admissionProbability + careerOpportunities + roi + networking + englishFriendliness + studentJobs + cost + housing + visaDifficulty + employment) / 10);
    recommendation = overall >= 88 ? "Highly Recommended" : overall >= 80 ? "Recommended" : "Consider";
  } else { // Jadiss — tech+finance, speaks Italian too
    careerOpportunities = isTopRanked ? 95 : 85 + Math.floor(Math.random() * 8);
    networking = isTopRanked ? 90 : 80 + Math.floor(Math.random() * 8);
    englishFriendliness = isEnglishSpeaking ? 100 : hasFrench ? 85 : 75;
    studentJobs = isEnglishSpeaking ? 85 : isFrench || isBelgian ? 75 : 65;
    cost = isPrivate && isTopRanked ? 52 : isPrivate ? 65 : 75;
    housing = isEnglishSpeaking ? 48 : 62;
    visaDifficulty = isEnglishSpeaking ? 80 : isFrench ? 75 : 72;
    employment = careerOpportunities - 3;
    admissionProbability = isTopRanked ? 65 : 75 + Math.floor(Math.random() * 8);
    roi = isPrivate && isTopRanked ? 85 : isPrivate ? 80 : 90;
    overall = Math.round((admissionProbability + careerOpportunities + roi + networking + englishFriendliness + studentJobs + cost + housing + visaDifficulty + employment) / 10);
    recommendation = overall >= 88 ? "Highly Recommended" : overall >= 80 ? "Recommended" : "Consider";
  }

  return { overall, admissionProbability, careerOpportunities, roi, networking, englishFriendliness, studentJobs, cost, housing, visaDifficulty, employment, recommendation };
}

for (const school of db.schools) {
  for (const candidateId of [1, 2]) {
    if (!db.candidateScores.find((s) => s.schoolId === school.id && s.candidateId === candidateId)) {
      const sc = generateScores(school, candidateId);
      db.candidateScores.push({
        id: nextScoreId++,
        candidateId,
        schoolId: school.id,
        ...sc
      });
    }
  }
}

// 8. Add France Excellence Major scholarship for Morocco
if (!db.scholarships.find((s) => s.name === "France Excellence Major")) {
  db.scholarships.push({
    id: db.scholarships.length + 1,
    countryId: 1,
    name: "France Excellence Major",
    type: "Government",
    amount: "Full tuition + living allowance",
    eligibility: "Moroccan students applying to French Master's programs",
    description: "French Embassy scholarship specifically for Moroccan students."
  });
}

// 9. Add VLIR-UOS for Belgium
if (!db.scholarships.find((s) => s.name === "VLIR-UOS Scholarship")) {
  db.scholarships.push({
    id: db.scholarships.length + 1,
    countryId: 7,
    name: "VLIR-UOS Scholarship",
    type: "Government",
    amount: "Full tuition + living allowance + travel",
    eligibility: "Students from developing countries at Belgian universities",
    description: "Belgian development cooperation scholarship program."
  });
}

// Write back
fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2), "utf-8");

console.log("✅ Data expanded successfully!");
console.log(`   Countries: ${db.countries.length}`);
console.log(`   Cities: ${db.cities.length}`);
console.log(`   Schools: ${db.schools.length}`);
console.log(`   Programs: ${db.programs.length}`);
console.log(`   Admissions: ${db.admissions.length}`);
console.log(`   Deadlines: ${db.deadlines.length}`);
console.log(`   Candidate Scores: ${db.candidateScores.length}`);
console.log(`   Scholarships: ${db.scholarships.length}`);