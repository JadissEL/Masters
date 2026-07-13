/**
 * Pure JavaScript JSON-based data store.
 * Replaces SQLite/better-sqlite3 to avoid native compilation requirements.
 * All data is loaded from a JSON file and queried in-memory.
 */

import fs from "fs";
import path from "path";
import { matchesProgramTrackingFilter } from "./tracking/filters";
import type { ProgramTracking, TrackingFilterCriteria } from "./tracking/types";

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

export type VerificationStatus = "Verified" | "Pending Verification" | "Manual Review Required" | "Official Source Not Available";

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
  // Phase X — expanded tuition
  tuitionYearly?: number | null;
  tuitionTotal?: number | null;
  tuitionPerCredit?: number | null;
  domesticTuition?: number | null;
  euTuition?: number | null;
  eeaTuition?: number | null;
  internationalTuition?: number | null;
  nonEuTuition?: number | null;
  reducedTuition?: number | null;
  executiveTuition?: number | null;
  onlineTuition?: number | null;
  mandatoryFees?: number | null;
  registrationFee?: number | null;
  administrativeFee?: number | null;
  studentUnionFee?: number | null;
  technologyFee?: number | null;
  insuranceRequirement?: string | null;
  estimatedLivingCosts?: string | null;
  estimatedYearlyBudget?: string | null;
  currency?: string | null;
  // Phase X — programme metadata
  officialTitle?: string | null;
  faculty?: string | null;
  department?: string | null;
  institute?: string | null;
  degreeAwarded?: string | null;
  diplomaTitle?: string | null;
  studyMode?: string | null;
  attendanceRequirement?: string | null;
  thesisRequired?: boolean | null;
  workPlacement?: boolean | null;
  erasmusParticipation?: boolean | null;
  accreditation?: string | null;
  programmeRanking?: string | null;
  employabilityStats?: string | null;
  graduateSalary?: string | null;
  professionalRecognition?: string | null;
  // Phase X — applications
  applicationUrl?: string | null;
  applicationPortal?: string | null;
  applicationGuide?: string | null;
  programmeUrl?: string | null;
  // Phase X — admissions
  minGPA?: string | null;
  acceptedDegrees?: string | null;
  acceptedBackgrounds?: string | null;
  prerequisiteCourses?: string | null;
  workExperienceRequired?: string | null;
  portfolioRequired?: boolean | null;
  interviewRequired?: boolean | null;
  gmatRequired?: boolean | null;
  gmatMinScore?: number | null;
  greRequired?: boolean | null;
  greMinScore?: number | null;
  ieltsMinScore?: number | null;
  toeflMinScore?: number | null;
  cambridgeEnglishLevel?: string | null;
  delfLevel?: string | null;
  languageExemptions?: string | null;
  // Phase X — contacts
  programmeCoordinator?: string | null;
  admissionsEmail?: string | null;
  programmeEmail?: string | null;
  departmentEmail?: string | null;
  phone?: string | null;
  // Phase X — provenance
  sourceUrl?: string | null;
  sourceType?: string | null;
  verificationDate?: string | null;
  confidenceLevel?: string | null;
  lastChecked?: string | null;
  verificationStatus?: VerificationStatus | null;
}

export interface DataSource {
  id: number;
  entityType: string;
  entityId: number;
  fieldName?: string | null;
  url: string;
  sourceType?: string | null;
  title?: string | null;
  snippet?: string | null;
  retrievalDate?: string | null;
  confidenceScore?: number | null;
  notes?: string | null;
}

export interface ProgramDeadline {
  id: number;
  programId: number;
  schoolId: number;
  academicYear?: string | null;
  applicationsOpen?: string | null;
  priorityDeadline?: string | null;
  scholarshipDeadline?: string | null;
  internationalDeadline?: string | null;
  euDeadline?: string | null;
  domesticDeadline?: string | null;
  finalDeadline?: string | null;
  rollingAdmission?: boolean | null;
  documentDeadline?: string | null;
  intakePeriod?: string | null;
  verificationStatus?: string | null;
  sourceUrl?: string | null;
  sourceType?: string | null;
  verificationDate?: string | null;
  confidenceLevel?: string | null;
}

export interface Contact {
  id: number;
  schoolId: number;
  programId?: number | null;
  role: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  officeLocation?: string | null;
  sourceUrl?: string | null;
  sourceType?: string | null;
  verificationDate?: string | null;
  confidenceLevel?: string | null;
}

export interface AuditFlag {
  entityType: string;
  entityId: number;
  programName?: string;
  schoolId?: number;
  flagType: string;
  severity: string;
  fields?: string[];
  oldValue?: string;
  newValue?: string;
  status: string;
  createdAt: string;
}

export interface AuditReport {
  generatedAt: string;
  summary: Record<string, number | string>;
  completeness: Record<string, { filled: number; total: number; pct: number }>;
  verification: { verified: number; pending: number; manual: number; total: number };
  issues: Record<string, unknown[]>;
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
  applicationUrl?: string | null;
  applicationPortal?: string | null;
  applicationGuide?: string | null;
  ieltsMinScore?: number | null;
  toeflMinScore?: number | null;
  cambridgeEnglishLevel?: string | null;
  delfLevel?: string | null;
  gmatMinScore?: number | null;
  greMinScore?: number | null;
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
  sources?: DataSource[];
  programDeadlines?: ProgramDeadline[];
  contacts?: Contact[];
  programScholarships?: unknown[];
  auditFlags?: AuditFlag[];
  metadata?: {
    schemaVersion?: string;
    lastPipelineRun?: string | null;
    lastAuditRun?: string | null;
  };
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

export function getProgramById(programId: number): Program | undefined {
  return loadDB().programs.find((p) => p.id === programId);
}

export function getSchoolById(schoolId: number): School | undefined {
  return loadDB().schools.find((s) => s.id === schoolId);
}

export function getSchoolAdmission(schoolId: number): Admission | undefined {
  return loadDB().admissions.find((a) => a.schoolId === schoolId);
}

export function getSchoolDeadlines(schoolId: number): Deadline[] {
  return loadDB().deadlines.filter((d) => d.schoolId === schoolId);
}

export function getProgramDeadlines(programId: number): ProgramDeadline[] {
  return (loadDB().programDeadlines || []).filter((d) => d.programId === programId);
}

export function getSchoolContacts(schoolId: number): Contact[] {
  return (loadDB().contacts || []).filter((c) => c.schoolId === schoolId);
}

export function getProgramSources(programId: number): DataSource[] {
  return (loadDB().sources || []).filter(
    (s) => s.entityType === "program" && s.entityId === programId
  );
}

export function getAuditReport(): AuditReport | null {
  try {
    const reportPath = path.join(process.cwd(), "data", "audit-report.json");
    const raw = fs.readFileSync(reportPath, "utf-8");
    return JSON.parse(raw) as AuditReport;
  } catch {
    return null;
  }
}

export function getDatabaseMetadata() {
  return loadDB().metadata || null;
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

// ─── Tuition Helpers ────────────────────────────────────────

/** Parse a tuition string like "€3,000" or "€3,000/year" and return the numeric value. */
export function parseTuition(tuitionStr: string): number | null {
  if (!tuitionStr) return null;
  const match = tuitionStr.match(/€([\d,]+)/);
  if (match) {
    return parseInt(match[1].replace(/,/g, ""), 10);
  }
  // Try plain number
  const num = parseInt(tuitionStr.replace(/[^\d]/g, ""), 10);
  return isNaN(num) ? null : num;
}

/** Get the minimum tuition fee across all programs for a school. */
export function getMinTuitionForSchool(schoolId: number): number | null {
  const progs = loadDB().programs.filter((p) => p.schoolId === schoolId);
  if (progs.length === 0) return null;
  const tuitions = progs
    .map((p) => parseTuition(p.tuitionFees))
    .filter((t): t is number => t !== null);
  if (tuitions.length === 0) return null;
  return Math.min(...tuitions);
}

/** Get the minimum tuition fee across relevant programs for a candidate. */
export function getMinTuitionForSchoolByCandidate(schoolId: number, candidateSlug: string): number | null {
  const allProgs = loadDB().programs.filter((p) => p.schoolId === schoolId);
  const progs = candidateSlug === "dina"
    ? allProgs.filter((p) => p.relevantForDina)
    : candidateSlug === "jadiss"
    ? allProgs.filter((p) => p.relevantForJadiss)
    : allProgs;
  if (progs.length === 0) return null;
  const tuitions = progs
    .map((p) => parseTuition(p.tuitionFees))
    .filter((t): t is number => t !== null);
  if (tuitions.length === 0) return null;
  return Math.min(...tuitions);
}

/** Format a tuition number back to a display string. */
export function formatTuition(amount: number | null): string {
  if (amount === null) return "N/A";
  return `€${amount.toLocaleString("en-US")}`;
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
  verifiedOnly?: boolean;    // only programmes with verificationStatus === "Verified"
  studyModes?: string[];     // "Full-time", "Part-time", etc.
  schoolTypes?: string[];    // "Public", "Semi-private", "Private"
  /** When set, at least one matched programme must satisfy tracking filters */
  tracking?: TrackingFilterCriteria;
  /** Pre-loaded tracking map (server-side) */
  trackingByProgramId?: Map<number, ProgramTracking>;
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

    // Filter by school ownership type (Public / Semi-private / Private)
    if (criteria.schoolTypes && criteria.schoolTypes.length > 0) {
      if (!criteria.schoolTypes.includes(school.type)) continue;
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

    // Filter by verified programmes only
    if (criteria.verifiedOnly) {
      const hasVerified = matchedPrograms.some((p) => p.verificationStatus === "Verified");
      if (!hasVerified) continue;
    }

    // Filter by study mode
    if (criteria.studyModes && criteria.studyModes.length > 0) {
      matchedPrograms = matchedPrograms.filter((p) =>
        p.studyMode && criteria.studyModes!.some((m) => p.studyMode!.toLowerCase().includes(m.toLowerCase()))
      );
      if (matchedPrograms.length === 0) continue;
    }

    // Filter by max tuition (parse EUR from tuitionFees)
    if (criteria.maxTuition) {
      const hasAffordable = matchedPrograms.some((p) => {
        if (p.tuitionYearly != null) return p.tuitionYearly <= criteria.maxTuition!;
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

    // Filter by candidate application tracking (programme-level)
    if (criteria.tracking) {
      const trackingMap = criteria.trackingByProgramId;
      const hasTrackingCriteria = Object.values(criteria.tracking).some(
        (v) => v !== undefined && v !== false && !(Array.isArray(v) && v.length === 0)
      );
      if (hasTrackingCriteria) {
        const anyMatch = matchedPrograms.some((p) =>
          matchesProgramTrackingFilter(
            trackingMap?.get(p.id),
            criteria.tracking!
          )
        );
        if (!anyMatch) continue;
        matchedPrograms = matchedPrograms.filter((p) =>
          matchesProgramTrackingFilter(trackingMap?.get(p.id), criteria.tracking!)
        );
      }
    }

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
