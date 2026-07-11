/**
 * Query layer — re-exports from the pure-JS JSON data store.
 * This keeps the existing import paths (`@/lib/queries`) working
 * while avoiding the native `better-sqlite3` compilation requirement.
 */
export {
  getCandidates,
  getCandidate,
  getCountries,
  getCountry,
  getCountryVisa,
  getCountryLivingCosts,
  getCountryStudentJobs,
  getCountryGraduateVisa,
  getCountryScholarships,
  getCountryCities,
  getSchools,
  getSchoolsByCountry,
  getSchool,
  getSchoolPrograms,
  getSchoolAdmission,
  getSchoolDeadlines,
  getCandidateScores,
  getScoreForSchool,
  getCity,
  getRelevantPrograms,
  getSchoolsWithScores,
  getSchoolsByCountryWithScores,
  getCountryBySchoolId,
  getCityBySchoolId,
  getFilteredSchools,
} from "./data-store";

export type {
  Candidate,
  Country,
  City,
  School,
  Program,
  Admission,
  Visa,
  Scholarship,
  LivingCost,
  StudentJob,
  GraduateVisa,
  Deadline,
  CandidateScore,
  FilterCriteria,
  FilteredSchoolResult,
} from "./data-store";
