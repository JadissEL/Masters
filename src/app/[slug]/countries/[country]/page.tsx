import {
  getCandidate, getCountry, getCountryVisa, getCountryLivingCosts,
  getCountryStudentJobs, getCountryGraduateVisa, getCountryScholarships,
  getCountryCities, getSchoolsByCountryWithScores,
  getMinTuitionForSchoolByCandidate, formatTuition
} from "@/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default async function CountryPage({ params }: { params: Promise<{ slug: string; country: string }> }) {
  const { slug, country: countrySlug } = await params;
  const candidate = getCandidate(slug);
  if (!candidate) return notFound();
  const country = getCountry(countrySlug);
  if (!country) return notFound();

  const visa = getCountryVisa(country.id);
  const livingCosts = getCountryLivingCosts(country.id);
  const studentJobs = getCountryStudentJobs(country.id);
  const graduateVisa = getCountryGraduateVisa(country.id);
  const scholarships = getCountryScholarships(country.id);
  const cities = getCountryCities(country.id);
  const schools = getSchoolsByCountryWithScores(country.id, candidate.id);

  return (
    <div className="container">
      <Link href={`/${candidate.slug}`} className="nav-back" style={{ fontSize: 15, fontWeight: 500, marginBottom: 16, display: "inline-flex" }}>
        <ArrowLeft size={18} /> Back to {candidate.name}
      </Link>
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <Link href={`/${candidate.slug}`}>{candidate.name}</Link>
        <span>›</span>
        <span>{country.name}</span>
      </div>

      <div className="country-header" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <span className="flag">{country.flag}</span>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>{country.name}</h1>
          <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: 600 }}>{country.summary}</p>
        </div>
      </div>

      {schools.length > 0 && (
        <>
          <h2 className="section-title">Schools in {country.name}</h2>
          <p className="section-subtitle">Ranked by recommendation score for {candidate.name}</p>
          <div className="grid grid-3" style={{ marginBottom: 40 }}>
            {schools.map((s: any) => (
              <Link key={s.id} href={`/${candidate.slug}/schools/${s.slug}`} className="card school-card">
                <div className="school-card-header">
                  <div>
                    <div className="school-name">{s.name}</div>
                    <div className="school-meta">{s.ranking}</div>
                  </div>
                  {s.score && (
                    <div className="score-ring" style={{
                      background: s.score.overall >= 90 ? "#e8f9ed" : s.score.overall >= 80 ? "#fff5e6" : "#f0f0f0",
                      color: s.score.overall >= 90 ? "#1a7a3a" : s.score.overall >= 80 ? "#8a5a00" : "#333",
                    }}>{s.score.overall}</div>
                  )}
                </div>
                <div className="school-description">{s.description}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4, alignItems: "center" }}>
                  <span className="badge" style={{ fontWeight: 600, color: "#1a7a3a", background: "#e8f9ed" }}>
                    💰 From {formatTuition(getMinTuitionForSchoolByCandidate(s.id, candidate.slug))}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="grid grid-2" style={{ marginBottom: 32 }}>
        {visa && (
          <div className="card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>🛂 Student Visa</h3>
            <div className="info-row"><span className="info-label">Visa Type</span><span className="info-value">{visa.visaType}</span></div>
            <div className="info-row"><span className="info-label">Requirements</span><span className="info-value">{visa.requirements}</span></div>
            <div className="info-row"><span className="info-label">Financial Proof</span><span className="info-value">{visa.financialProof}</span></div>
            <div className="info-row"><span className="info-label">Processing Time</span><span className="info-value">{visa.processingTime}</span></div>
            <div className="info-row"><span className="info-label">Acceptance Rate</span><span className="info-value">{visa.acceptanceRateEstimate}</span></div>
            <div className="info-row"><span className="info-label">Approval Likelihood</span><span className="info-value">{visa.likelihoodOfApproval}</span></div>
            <div className="info-row"><span className="info-label">Common Rejections</span><span className="info-value">{visa.commonRejectionReasons}</span></div>
          </div>
        )}

        {graduateVisa && (
          <div className="card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>🎓 After Graduation</h3>
            <div className="info-row"><span className="info-label">Visa</span><span className="info-value">{graduateVisa.visaName}</span></div>
            <div className="info-row"><span className="info-label">Duration</span><span className="info-value">{graduateVisa.duration}</span></div>
            <div className="info-row"><span className="info-label">Can Stay</span><span className="info-value">{graduateVisa.canStay ? "Yes" : "No"}</span></div>
            <div className="info-row"><span className="info-label">Search for Work</span><span className="info-value">{graduateVisa.canSearchForWork ? "Yes" : "No"}</span></div>
            <div className="info-row"><span className="info-label">Start Company</span><span className="info-value">{graduateVisa.canStartCompany ? "Yes" : "No"}</span></div>
            <div className="info-row"><span className="info-label">PR Pathway</span><span className="info-value">{graduateVisa.permanentResidencyPathway}</span></div>
            <div className="info-row"><span className="info-label">Citizenship</span><span className="info-value">{graduateVisa.citizenshipPathway}</span></div>
            <div className="info-row"><span className="info-label">Grad Salary</span><span className="info-value">{graduateVisa.averageGraduateSalary}</span></div>
            <div className="info-row"><span className="info-label">Industries</span><span className="info-value">{graduateVisa.mainIndustriesHiring}</span></div>
          </div>
        )}

        {livingCosts && (
          <div className="card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>💰 Living Costs (Monthly)</h3>
            <div className="info-row"><span className="info-label">Rent</span><span className="info-value">{livingCosts.averageRent}</span></div>
            <div className="info-row"><span className="info-label">Food</span><span className="info-value">{livingCosts.food}</span></div>
            <div className="info-row"><span className="info-label">Transport</span><span className="info-value">{livingCosts.transportation}</span></div>
            <div className="info-row"><span className="info-label">Insurance</span><span className="info-value">{livingCosts.insurance}</span></div>
            <div className="info-row"><span className="info-label">Utilities</span><span className="info-value">{livingCosts.utilities}</span></div>
            <div className="info-row"><span className="info-label">Total Budget</span><span className="info-value" style={{ fontWeight: 600 }}>{livingCosts.expectedMonthlyBudget}</span></div>
          </div>
        )}

        {studentJobs && (
          <div className="card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>💼 Student Jobs</h3>
            <div className="info-row"><span className="info-label">Can Work</span><span className="info-value">{studentJobs.canWork ? "Yes" : "No"}</span></div>
            <div className="info-row"><span className="info-label">Hours Allowed</span><span className="info-value">{studentJobs.hoursAllowed}</span></div>
            <div className="info-row"><span className="info-label">Minimum Wage</span><span className="info-value">{studentJobs.minimumWage}</span></div>
            <div className="info-row"><span className="info-label">Avg Student Salary</span><span className="info-value">{studentJobs.averageStudentSalary}</span></div>
            <div className="info-row"><span className="info-label">English-only Jobs</span><span className="info-value">{studentJobs.englishOnlyJobs}</span></div>
            <div className="info-row"><span className="info-label">No-language Jobs</span><span className="info-value">{studentJobs.noLanguageJobs}</span></div>
            <div className="info-row"><span className="info-label">Difficulty</span><span className="info-value">{studentJobs.difficulty}</span></div>
          </div>
        )}
      </div>

      {scholarships.length > 0 && (
        <>
          <h2 className="section-title">Scholarships</h2>
          <p className="section-subtitle">Funding opportunities for international students</p>
          <div className="grid grid-2" style={{ marginBottom: 32 }}>
            {scholarships.map((sc: any) => (
              <div key={sc.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{sc.name}</h3>
                  <span className="badge badge-accent">{sc.type}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 8 }}>{sc.description}</p>
                <div className="info-row"><span className="info-label">Amount</span><span className="info-value">{sc.amount}</span></div>
                <div className="info-row"><span className="info-label">Eligibility</span><span className="info-value">{sc.eligibility}</span></div>
              </div>
            ))}
          </div>
        </>
      )}

      {cities.length > 0 && (
        <>
          <h2 className="section-title">Cities</h2>
          <p className="section-subtitle">Explore cities in {country.name}</p>
          <div className="grid grid-3">
            {cities.map((city: any) => (
              <div key={city.id} className="card">
                <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>{city.name}</h3>
                <div className="info-row"><span className="info-label">Population</span><span className="info-value">{city.population.toLocaleString()}</span></div>
                <div className="info-row"><span className="info-label">Safety</span><span className="info-value">{city.safety}</span></div>
                <div className="info-row"><span className="info-label">Cost of Living</span><span className="info-value">{city.costOfLiving}</span></div>
                <div className="info-row"><span className="info-label">Job Market</span><span className="info-value">{city.jobMarket}</span></div>
                <div className="info-row"><span className="info-label">Avg Rent</span><span className="info-value">{city.averageRent}</span></div>
                <div className="info-row"><span className="info-label">English</span><span className="info-value">{city.englishFriendliness}</span></div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}