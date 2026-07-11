/**
 * Pure JavaScript JSON-based data store.
 * Replaces SQLite/better-sqlite3 to avoid native compilation requirements.
 * All data is loaded from a JSON file and queried in-memory.
 */

import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "masters-data.json");

export interface Candidate {
  id: number;
  slug: string;
  name: string;
  nationality: string;
  languages: string;
  education: string;
  experience: string;
  careerObjectives: string;
  skills: string;
  interests: string;
  preferences: string;
}

export interface Country {
  id: number;
  slug: string;
  name: string;
  code: string;
  flag: string;
  summary: string;
}

export interface City {
  id: number;
  countryId: number;
  slug: string;
  name: string;
  population: number;
  lat: number;
  lng: number;
  safety: string;
  costOfLiving: string;
  publicTransport: string;
  weather: string;
  nightlife: string;
  qualityOfLife: string;
  walkability: string;
  englishFriendliness: string;
  frenchFriendliness: string;
  jobMarket: string;
  housingAvailability: string;
  averageRent: string;
}

export interface School {
  id: number;
  countryId: number;
  cityId: number | null;
  slug: string;
  name: string;
  website: string;
  ranking: string;
  type: string;
  teachingLanguage: string;
  accreditations: string;
  description: string;
}

export interface Program {
  id: number;
  schoolId: number;
  name: string;
  duration: string;
  canEnterM2: string;
  ects: number;
  tuitionFees: string;
  internshipIncluded: boolean;
  alternanceAvailable: boolean;
  employmentRate: string;
  averageSalary: string;
  industriesHiring: string;
  relevantForDina: boolean;
  relevantForJadiss: boolean;
  description: string;
}

export interface Admission {
  id: number;
  schoolId: number;
  requirements: string;
  englishRequirements: string;
  frenchRequirements: string;
  documents: string;
  process: string;
  interviewRequired: boolean;
  gmatRequired: boolean;
  greRequired: boolean;
}

export interface Visa {
  id: number;
  countryId: number;
  visaType: string;
  requirements: string;
  documents: string;
  financialProof: string;
  processingTime: string;
  acceptanceRateEstimate: string;
  commonRejectionReasons: string;
  likelihoodOfApproval: string;
}

export interface Scholarship {
  id: number;
  countryId: number;
  name: string;
  type: string;
  amount: string;
  eligibility: string;
  description: string;
}

export interface LivingCost {
  id: number;
  countryId: number;
  averageRent: string;
  food: string;
  transportation: string;
  insurance: string;
  utilities: string;
  expectedMonthlyBudget: string;
}

export interface StudentJob {
  id: number;
  countryId: number;
  canWork: boolean;
  hoursAllowed: string;
  minimumWage: string;
  averageStudentSalary: string;
  englishOnlyJobs: string;
  frenchOnlyJobs: string;
  noLanguageJobs: string;
  jobExamples: string;
  remoteJobs: string;
  likelihoodOfFindingWork: string;
  difficulty: string;
}

export interface GraduateVisa {
  id: number;
  countryId: number;
  visaName: string;
  duration: string;
  canStay: boolean;
  canSearchForWork: boolean;
  canStartCompany: boolean;
  permanentResidencyPathway: string;
  citizenshipPathway: string;
  averageGraduateSalary: string;
  mainIndustriesHiring: string;
}

export interface Deadline {
  id: number;
  schoolId: number;
  academicYear: string;
  applicationOpening: string;
  applicationClosing: string;
}

export interface CandidateScore {
  id: number;
  candidateId: number;
  schoolId: number;
  overall: number;
  admissionProbability: number;
  careerOpportunities: number;
  roi: number;
  networking: number;
  englishFriendliness: number;
  studentJobs: number;
  cost: number;
  housing: number;
  visaDifficulty: number;
  employment: number;
  recommendation: string;
}

interface Database {
  candidates: Candidate[];
  countries: Country[];
  cities: City[];
  schools: School[];
  programs: Program[];
  admissions: Admission[];
  visa: Visa[];
  scholarships: Scholarship[];
  livingCosts: LivingCost[];
  studentJobs: StudentJob[];
  graduateVisa: GraduateVisa[];
  deadlines: Deadline[];
  candidateScores: CandidateScore[];
}

let _db: Database | null = null;

function loadDB(): Database {
  if (_db) return _db;
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  _db = JSON.parse(raw) as Database;
  return _db;
}

// ─── Query Functions ───────────────────────────────────────

export function getCandidates(): Candidate[] {
  return loadDB().candidates;
}

export function getCandidate(slug: string): Candidate | undefined {
  return loadDB().candidates.find((c) => c.slug === slug);
}

export function getCountries(): Country[] {
  return loadDB().countries;
}

export function getCountry(slug: string): Country | undefined {
  return loadDB().countries.find((c) => c.slug === slug);
}

export function getCountryVisa(countryId: number): Visa | undefined {
  return loadDB().visa.find((v) => v.countryId === countryId);
}

export function getCountryLivingCosts(countryId: number): LivingCost | undefined {
  return loadDB().livingCosts.find((lc) => lc.countryId === countryId);
}

export function getCountryStudentJobs(countryId: number): StudentJob | undefined {
  return loadDB().studentJobs.find((sj) => sj.countryId === countryId);
}

export function getCountryGraduateVisa(countryId: number): GraduateVisa | undefined {
  return loadDB().graduateVisa.find((gv) => gv.countryId === countryId);
}

export function getCountryScholarships(countryId: number): Scholarship[] {
  return loadDB().scholarships.filter((s) => s.countryId === countryId);
}

export function getCountryCities(countryId: number): City[] {
  return loadDB().cities.filter((c) => c.countryId === countryId);
}

export function getSchools(): School[] {
  return loadDB().schools;
}

export function getSchoolsByCountry(countryId: number): School[] {
  return loadDB().schools.filter((s) => s.countryId === countryId);
}

export function getSchool(slug: string): School | undefined {
  return loadDB().schools.find((s) => s.slug === slug);
}

export function getSchoolPrograms(schoolId: number): Program[] {
  return loadDB().programs.filter((p) => p.schoolId === schoolId);
}

export function getSchoolAdmission(schoolId: number): Admission | undefined {
  return loadDB().admissions.find((a) => a.schoolId === schoolId);
}

export function getSchoolDeadlines(schoolId: number): Deadline[] {
  return loadDB().deadlines.filter((d) => d.schoolId === schoolId);
}

export function getCandidateScores(candidateId: number): CandidateScore[] {
  return loadDB().candidateScores.filter((s) => s.candidateId === candidateId);
}

export function getScoreForSchool(candidateId: number, schoolId: number): CandidateScore | undefined {
  return loadDB().candidateScores.find((s) => s.candidateId === candidateId && s.schoolId === schoolId);
}

export function getCity(id: number): City | undefined {
  return loadDB().cities.find((c) => c.id === id);
}

export function getRelevantPrograms(schoolId: number, candidateSlug: string): Program[] {
  const progs = loadDB().programs.filter((p) => p.schoolId === schoolId);
  if (candidateSlug === "dina") return progs.filter((p) => p.relevantForDina);
  if (candidateSlug === "jadiss") return progs.filter((p) => p.relevantForJadiss);
  return progs;
}

export function getSchoolsWithScores(candidateId: number): (School & { score: CandidateScore | null })[] {
  const db = loadDB();
  const scores = db.candidateScores.filter((s) => s.candidateId === candidateId);
  return db.schools
    .map((s) => ({ ...s, score: scores.find((sc) => sc.schoolId === s.id) || null }))
    .sort((a, b) => (b.score?.overall ?? 0) - (a.score?.overall ?? 0));
}

export function getSchoolsByCountryWithScores(
  countryId: number,
  candidateId: number
): (School & { score: CandidateScore | null })[] {
  const db = loadDB();
  const scores = db.candidateScores.filter((s) => s.candidateId === candidateId);
  return db.schools
    .filter((s) => s.countryId === countryId)
    .map((s) => ({ ...s, score: scores.find((sc) => sc.schoolId === s.id) || null }))
    .sort((a, b) => (b.score?.overall ?? 0) - (a.score?.overall ?? 0));
}

export function getCountryBySchoolId(schoolId: number): Country | undefined {
  const school = loadDB().schools.find((s) => s.id === schoolId);
  if (!school) return undefined;
  return loadDB().countries.find((c) => c.id === school.countryId);
}

export function getCityBySchoolId(schoolId: number): City | undefined {
  const school = loadDB().schools.find((s) => s.id === schoolId);
  if (!school || !school.cityId) return undefined;
  return loadDB().cities.find((c) => c.id === school.cityId);
}

// ─── Filter Query ──────────────────────────────────────────

export interface FilterCriteria {
  candidateSlug: string;
  countries?: string[];      // country slugs
  languages?: string[];      // "English", "French", "Italian"
  canEnterM2?: "YES" | "Conditional" | "NO";
  maxTuition?: number;       // in EUR
  programTypes?: string[];   // keywords: "Finance", "AI", "Data Science", etc.
  minScore?: number;         // minimum overall score
  alternanceOnly?: boolean;
  internshipOnly?: boolean;
}

export interface FilteredSchoolResult {
  school: School;
  country: Country;
  city: City | null;
  score: CandidateScore | null;
  matchedPrograms: Program[];
}

export function getFilteredSchools(criteria: FilterCriteria): FilteredSchoolResult[] {
  const db = loadDB();
  const candidate = db.candidates.find((c) => c.slug === criteria.candidateSlug);
  if (!candidate) return [];

  const scores = db.candidateScores.filter((s) => s.candidateId === candidate.id);

  const results: FilteredSchoolResult[] = [];

  for (const school of db.schools) {
    const country = db.countries.find((c) => c.id === school.countryId);
    if (!country) continue;

    // Filter by country
    if (criteria.countries && criteria.countries.length > 0) {
      if (!criteria.countries.includes(country.slug)) continue;
    }

    // Filter by teaching language
    if (criteria.languages && criteria.languages.length > 0) {
      const lang = school.teachingLanguage.toLowerCase();
      const hasAnyLang = criteria.languages.some((l) => lang.includes(l.toLowerCase()));
      if (!hasAnyLang) continue;
    }

    // Get relevant programs for this candidate
    const allPrograms = db.programs.filter((p) => p.schoolId === school.id);
    const relevantPrograms = criteria.candidateSlug === "dina"
      ? allPrograms.filter((p) => p.relevantForDina)
      : criteria.candidateSlug === "jadiss"
      ? allPrograms.filter((p) => p.relevantForJadiss)
      : allPrograms;

    // Filter by program type keywords
    let matchedPrograms = relevantPrograms;
    if (criteria.programTypes && criteria.programTypes.length > 0) {
      matchedPrograms = relevantPrograms.filter((p) => {
        const text = (p.name + " " + p.description + " " + p.industriesHiring).toLowerCase();
        return criteria.programTypes!.some((kw) => text.includes(kw.toLowerCase()));
      });
      if (matchedPrograms.length === 0) continue;
    }

    // Filter by canEnterM2
    if (criteria.canEnterM2) {
      const hasM2 = matchedPrograms.some((p) => p.canEnterM2 === criteria.canEnterM2);
      if (!hasM2) continue;
    }

    // Filter by alternance
    if (criteria.alternanceOnly) {
      const hasAlt = matchedPrograms.some((p) => p.alternanceAvailable);
      if (!hasAlt) continue;
    }

    // Filter by internship
    if (criteria.internshipOnly) {
      const hasIntern = matchedPrograms.some((p) => p.internshipIncluded);
      if (!hasIntern) continue;
    }

    // Filter by max tuition (parse EUR from tuitionFees)
    if (criteria.maxTuition) {
      const hasAffordable = matchedPrograms.some((p) => {
        const match = p.tuitionFees.match(/€([\d,]+)/);
        if (match) {
          const value = parseInt(match[1].replace(/,/g, ""), 10);
          return value <= criteria.maxTuition!;
        }
        return false;
      });
      if (!hasAffordable) continue;
    }

    // Get score
    const score = scores.find((sc) => sc.schoolId === school.id) || null;

    // Filter by min score
    if (criteria.minScore && (!score || score.overall < criteria.minScore)) continue;

    const city = school.cityId ? db.cities.find((c) => c.id === school.cityId) || null : null;

    results.push({
      school,
      country,
      city,
      score,
      matchedPrograms,
    });
  }

  // Sort by score descending
  results.sort((a, b) => (b.score?.overall ?? 0) - (a.score?.overall ?? 0));

  return results;
}
