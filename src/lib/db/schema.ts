import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─── Candidates ──────────────────────────────────────────────
export const candidates = sqliteTable("candidates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  nationality: text("nationality"),
  education: text("education"),
  experience: text("experience"),
  careerObjectives: text("career_objectives"),
  skills: text("skills"),
  interests: text("interests"),
  preferences: text("preferences"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Countries ───────────────────────────────────────────────
export const countries = sqliteTable("countries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  code: text("code"),
  flag: text("flag"),
  summary: text("summary"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Cities ──────────────────────────────────────────────────
export const cities = sqliteTable("cities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  countryId: integer("country_id").notNull().references(() => countries.id),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  population: integer("population"),
  internationalStudents: integer("international_students"),
  safety: text("safety"),
  costOfLiving: text("cost_of_living"),
  publicTransport: text("public_transport"),
  weather: text("weather"),
  nightlife: text("nightlife"),
  qualityOfLife: text("quality_of_life"),
  walkability: text("walkability"),
  englishFriendliness: text("english_friendliness"),
  frenchFriendliness: text("french_friendliness"),
  jobMarket: text("job_market"),
  housingAvailability: text("housing_availability"),
  averageRent: text("average_rent"),
  lat: real("lat"),
  lng: real("lng"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Schools ─────────────────────────────────────────────────
export const schools = sqliteTable("schools", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  countryId: integer("country_id").notNull().references(() => countries.id),
  cityId: integer("city_id").references(() => cities.id),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  logo: text("logo"),
  photos: text("photos"),
  campus: text("campus"),
  website: text("website"),
  ranking: text("ranking"),
  recognition: text("recognition"),
  type: text("type"),
  teachingLanguage: text("teaching_language"),
  accreditations: text("accreditations"),
  description: text("description"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Programs (Phase X expanded) ─────────────────────────────
export const programs = sqliteTable("programs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  name: text("name").notNull(),
  slug: text("slug"),
  duration: text("duration"),
  canEnterM2: text("can_enter_m2"),
  ects: integer("ects"),
  tuitionFees: text("tuition_fees"),
  tuitionYearly: integer("tuition_yearly"),
  tuitionTotal: integer("tuition_total"),
  internationalTuition: integer("international_tuition"),
  euTuition: integer("eu_tuition"),
  domesticTuition: integer("domestic_tuition"),
  registrationFee: integer("registration_fee"),
  mandatoryFees: integer("mandatory_fees"),
  estimatedLivingCosts: text("estimated_living_costs"),
  currency: text("currency"),
  officialTitle: text("official_title"),
  faculty: text("faculty"),
  department: text("department"),
  degreeAwarded: text("degree_awarded"),
  studyMode: text("study_mode"),
  programmeRanking: text("programme_ranking"),
  employabilityStats: text("employability_stats"),
  graduateSalary: text("graduate_salary"),
  applicationUrl: text("application_url"),
  applicationPortal: text("application_portal"),
  applicationGuide: text("application_guide"),
  programmeUrl: text("programme_url"),
  minGpa: text("min_gpa"),
  gmatRequired: integer("gmat_required", { mode: "boolean" }),
  gmatMinScore: integer("gmat_min_score"),
  greRequired: integer("gre_required", { mode: "boolean" }),
  ieltsMinScore: real("ielts_min_score"),
  admissionsEmail: text("admissions_email"),
  verificationStatus: text("verification_status"),
  sourceUrl: text("source_url"),
  sourceType: text("source_type"),
  verificationDate: text("verification_date"),
  confidenceLevel: text("confidence_level"),
  lastChecked: text("last_checked"),
  scholarships: text("scholarships"),
  internshipIncluded: integer("internship_included", { mode: "boolean" }),
  alternanceAvailable: integer("alternance_available", { mode: "boolean" }),
  employmentRate: text("employment_rate"),
  averageSalary: text("average_salary"),
  industriesHiring: text("industries_hiring"),
  description: text("description"),
  relevantForDina: integer("relevant_for_dina", { mode: "boolean" }),
  relevantForJadiss: integer("relevant_for_jadiss", { mode: "boolean" }),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Program Deadlines (per-program) ─────────────────────────
export const programDeadlines = sqliteTable("program_deadlines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  programId: integer("program_id").notNull().references(() => programs.id),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  academicYear: text("academic_year"),
  applicationsOpen: text("applications_open"),
  priorityDeadline: text("priority_deadline"),
  scholarshipDeadline: text("scholarship_deadline"),
  internationalDeadline: text("international_deadline"),
  euDeadline: text("eu_deadline"),
  domesticDeadline: text("domestic_deadline"),
  finalDeadline: text("final_deadline"),
  rollingAdmission: integer("rolling_admission", { mode: "boolean" }),
  documentDeadline: text("document_deadline"),
  intakePeriod: text("intake_period"),
  verificationStatus: text("verification_status"),
  sourceUrl: text("source_url"),
  sourceType: text("source_type"),
  verificationDate: text("verification_date"),
  confidenceLevel: text("confidence_level"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Contacts (multiple per school/program) ──────────────────
export const contacts = sqliteTable("contacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  programId: integer("program_id").references(() => programs.id),
  role: text("role").notNull(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  officeLocation: text("office_location"),
  sourceUrl: text("source_url"),
  sourceType: text("source_type"),
  verificationDate: text("verification_date"),
  confidenceLevel: text("confidence_level"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Admissions ──────────────────────────────────────────────
export const admissions = sqliteTable("admissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  requirements: text("requirements"),
  englishRequirements: text("english_requirements"),
  frenchRequirements: text("french_requirements"),
  documents: text("documents"),
  process: text("process"),
  interviewRequired: integer("interview_required", { mode: "boolean" }),
  gmatRequired: integer("gmat_required", { mode: "boolean" }),
  greRequired: integer("gre_required", { mode: "boolean" }),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Deadlines ───────────────────────────────────────────────
export const deadlines = sqliteTable("deadlines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  academicYear: text("academic_year"),
  applicationOpening: text("application_opening"),
  applicationClosing: text("application_closing"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Visa ────────────────────────────────────────────────────
export const visa = sqliteTable("visa", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  countryId: integer("country_id").notNull().references(() => countries.id),
  visaType: text("visa_type"),
  requirements: text("requirements"),
  documents: text("documents"),
  financialProof: text("financial_proof"),
  processingTime: text("processing_time"),
  acceptanceRateEstimate: text("acceptance_rate_estimate"),
  commonRejectionReasons: text("common_rejection_reasons"),
  likelihoodOfApproval: text("likelihood_of_approval"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Scholarships ────────────────────────────────────────────
export const scholarships = sqliteTable("scholarships", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  countryId: integer("country_id").references(() => countries.id),
  schoolId: integer("school_id").references(() => schools.id),
  name: text("name").notNull(),
  type: text("type"),
  amount: text("amount"),
  eligibility: text("eligibility"),
  description: text("description"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Living Costs ────────────────────────────────────────────
export const livingCosts = sqliteTable("living_costs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  countryId: integer("country_id").notNull().references(() => countries.id),
  averageRent: text("average_rent"),
  food: text("food"),
  transportation: text("transportation"),
  insurance: text("insurance"),
  utilities: text("utilities"),
  expectedMonthlyBudget: text("expected_monthly_budget"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Student Jobs ────────────────────────────────────────────
export const studentJobs = sqliteTable("student_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  countryId: integer("country_id").notNull().references(() => countries.id),
  canWork: integer("can_work", { mode: "boolean" }),
  hoursAllowed: text("hours_allowed"),
  minimumWage: text("minimum_wage"),
  averageStudentSalary: text("average_student_salary"),
  englishOnlyJobs: text("english_only_jobs"),
  frenchOnlyJobs: text("french_only_jobs"),
  noLanguageJobs: text("no_language_jobs"),
  jobExamples: text("job_examples"),
  remoteJobs: text("remote_jobs"),
  likelihoodOfFindingWork: text("likelihood_of_finding_work"),
  difficulty: text("difficulty"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Graduate Visa ───────────────────────────────────────────
export const graduateVisa = sqliteTable("graduate_visa", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  countryId: integer("country_id").notNull().references(() => countries.id),
  visaName: text("visa_name"),
  duration: text("duration"),
  canStay: integer("can_stay", { mode: "boolean" }),
  canSearchForWork: integer("can_search_for_work", { mode: "boolean" }),
  canStartCompany: integer("can_start_company", { mode: "boolean" }),
  permanentResidencyPathway: text("permanent_residency_pathway"),
  citizenshipPathway: text("citizenship_pathway"),
  averageGraduateSalary: text("average_graduate_salary"),
  mainIndustriesHiring: text("main_industries_hiring"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Sources ─────────────────────────────────────────────────
export const sources = sqliteTable("sources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  fieldName: text("field_name"),
  url: text("url").notNull(),
  sourceType: text("source_type"),
  title: text("title"),
  snippet: text("snippet"),
  retrievalDate: text("retrieval_date").default(sql`CURRENT_TIMESTAMP`),
  confidenceScore: real("confidence_score"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Candidate Scores ────────────────────────────────────────
export const candidateScores = sqliteTable("candidate_scores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  candidateId: integer("candidate_id").notNull().references(() => candidates.id),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  overall: integer("overall"),
  admissionProbability: integer("admission_probability"),
  careerOpportunities: integer("career_opportunities"),
  roi: integer("roi"),
  networking: integer("networking"),
  englishFriendliness: integer("english_friendliness"),
  studentJobs: integer("student_jobs"),
  cost: integer("cost"),
  housing: integer("housing"),
  visaDifficulty: integer("visa_difficulty"),
  employment: integer("employment"),
  recommendation: text("recommendation"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Recommendations ─────────────────────────────────────────
export const recommendations = sqliteTable("recommendations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  candidateId: integer("candidate_id").notNull().references(() => candidates.id),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  rank: integer("rank"),
  rationale: text("rationale"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Reviews ─────────────────────────────────────────────────
export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  author: text("author"),
  rating: integer("rating"),
  source: text("source"),
  sourceUrl: text("source_url"),
  content: text("content"),
  date: text("date"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Favorites ───────────────────────────────────────────────
export const favorites = sqliteTable("favorites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  candidateId: integer("candidate_id").notNull().references(() => candidates.id),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});
