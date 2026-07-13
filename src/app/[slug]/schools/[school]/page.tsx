import {
  getCandidate, getSchool, getRelevantPrograms, getSchoolAdmission,
  getSchoolDeadlines, getScoreForSchool, getCity, getProgramDeadlines,
  getProgramSources, getSchoolContacts
} from "@/lib/queries";
import { getProgramTrackingMapAsync } from "@/lib/tracking/store";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import ProgramDetailCard from "./ProgramDetailCard";
import { schoolTypeBadgeStyle, SCHOOL_TYPE_DESCRIPTIONS } from "@/lib/school-types";

export default async function SchoolPage({ params }: { params: Promise<{ slug: string; school: string }> }) {
  const { slug, school: schoolSlug } = await params;
  const candidate = getCandidate(slug);
  if (!candidate) return notFound();
  const school = getSchool(schoolSlug);
  if (!school) return notFound();

  const programs = getRelevantPrograms(school.id, candidate.slug);
  const admission = getSchoolAdmission(school.id);
  const deadlines = getSchoolDeadlines(school.id);
  const score = getScoreForSchool(candidate.id, school.id);
  const city = school.cityId ? getCity(school.cityId) : null;
  const contacts = getSchoolContacts(school.id);
  const trackingMap = await getProgramTrackingMapAsync(slug);

  const admissionHints = admission
    ? {
        applicationUrl: admission.applicationUrl,
        applicationPortal: admission.applicationPortal,
        englishRequirements: admission.englishRequirements,
        frenchRequirements: admission.frenchRequirements,
        interviewRequired: admission.interviewRequired,
      }
    : undefined;

  const scoreMetrics = score ? [
    { label: "Admission Probability", value: score.admissionProbability },
    { label: "Career Opportunities", value: score.careerOpportunities },
    { label: "ROI", value: score.roi },
    { label: "Networking", value: score.networking },
    { label: "English Friendliness", value: score.englishFriendliness },
    { label: "Student Jobs", value: score.studentJobs },
    { label: "Cost", value: score.cost },
    { label: "Housing", value: score.housing },
    { label: "Visa Difficulty", value: score.visaDifficulty },
    { label: "Employment", value: score.employment },
  ] : [];

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
        <span>{school.name}</span>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div style={{ flex: 1, minWidth: 250 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>{school.name}</h1>
            <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 16, maxWidth: 600 }}>{school.description}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="badge" style={schoolTypeBadgeStyle(school.type)} title={SCHOOL_TYPE_DESCRIPTIONS[school.type as keyof typeof SCHOOL_TYPE_DESCRIPTIONS] ?? school.type}>{school.type}</span>
              <span className="badge">{school.teachingLanguage}</span>
              <span className="badge badge-accent">{school.ranking}</span>
            </div>
          </div>
          {score && (
            <div style={{ textAlign: "center" }}>
              <div className="score-ring" style={{
                width: 80, height: 80, fontSize: 28, fontWeight: 700,
                background: score.overall >= 90 ? "#e8f9ed" : score.overall >= 80 ? "#fff5e6" : "#f0f0f0",
                color: score.overall >= 90 ? "#1a7a3a" : score.overall >= 80 ? "#8a5a00" : "#333",
              }}>{score.overall}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, maxWidth: 100 }}>Overall Score</div>
              <span className={`badge ${score.recommendation === "Highly Recommended" ? "badge-success" : "badge-accent"}`} style={{ marginTop: 8 }}>
                {score.recommendation}
              </span>
            </div>
          )}
        </div>
        <div className="grid grid-3" style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
          <div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>Website</p>
            <a href={school.website} target="_blank" rel="noopener noreferrer" className="link-break" style={{ fontSize: 14, color: "var(--accent)" }}>{school.website}</a>
          </div>
          <div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>Accreditations</p>
            <p style={{ fontSize: 14 }}>{school.accreditations}</p>
          </div>
          {city && (
            <div>
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>Location</p>
              <p style={{ fontSize: 14 }}>{city.name}</p>
            </div>
          )}
        </div>
      </div>

      {score && (
        <>
          <h2 className="section-title">Recommendation Breakdown</h2>
          <p className="section-subtitle">Detailed scores for {candidate.name}</p>
          <div className="card" style={{ marginBottom: 32 }}>
            <div className="grid grid-2">
              {scoreMetrics.map((m) => (
                <div key={m.label} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>{m.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{m.value}/100</span>
                  </div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${m.value}%`,
                      background: m.value >= 90 ? "#1a7a3a" : m.value >= 75 ? "#4a9eff" : m.value >= 60 ? "#8a5a00" : "#c0392b",
                      borderRadius: 3,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <h2 className="section-title">Relevant Master Programs</h2>
      <p className="section-subtitle">Click a programme to open it and track your application progress</p>
      <div className="grid grid-2" style={{ marginBottom: 32 }}>
        {programs.map((p) => (
          <ProgramDetailCard
            key={p.id}
            program={p}
            deadlines={getProgramDeadlines(p.id)}
            sources={getProgramSources(p.id)}
            admissionHints={admissionHints}
            candidateSlug={slug}
            tracking={trackingMap.get(p.id) ?? null}
          />
        ))}
      </div>

      {contacts.length > 0 && (
        <>
          <h2 className="section-title">Contacts</h2>
          <div className="card" style={{ marginBottom: 32 }}>
            {contacts.map((c) => (
              <div key={c.id} className="info-row">
                <span className="info-label">{c.role.replace(/_/g, " ")}</span>
                <span className="info-value">
                  {c.email ? <a href={`mailto:${c.email}`} style={{ color: "var(--accent)" }}>{c.email}</a> : "—"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="grid grid-2" style={{ marginBottom: 32 }}>
        {admission && (
          <div className="card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>📋 Admission</h3>
            <div className="info-row"><span className="info-label">Requirements</span><span className="info-value">{admission.requirements}</span></div>
            <div className="info-row"><span className="info-label">English</span><span className="info-value">{admission.englishRequirements}</span></div>
            <div className="info-row"><span className="info-label">French</span><span className="info-value">{admission.frenchRequirements}</span></div>
            <div className="info-row"><span className="info-label">Documents</span><span className="info-value">{admission.documents}</span></div>
            <div className="info-row"><span className="info-label">Process</span><span className="info-value">{admission.process}</span></div>
            <div className="info-row"><span className="info-label">Interview</span><span className="info-value">{admission.interviewRequired ? "Required" : "Not required"}</span></div>
            <div className="info-row"><span className="info-label">GMAT</span><span className="info-value">{admission.gmatRequired ? "Required" : "Not required"}</span></div>
            <div className="info-row"><span className="info-label">GRE</span><span className="info-value">{admission.greRequired ? "Required" : "Not required"}</span></div>
            {admission.ieltsMinScore != null && (
              <div className="info-row"><span className="info-label">IELTS Min</span><span className="info-value">{admission.ieltsMinScore}</span></div>
            )}
            {admission.toeflMinScore != null && (
              <div className="info-row"><span className="info-label">TOEFL Min</span><span className="info-value">{admission.toeflMinScore}</span></div>
            )}
            {(admission.applicationUrl || admission.applicationPortal) && (
              <div className="info-row">
                <span className="info-label">Apply</span>
                <span className="info-value">
                  <a
                    href={admission.applicationUrl || admission.applicationPortal || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    Application portal <ExternalLink size={12} />
                  </a>
                </span>
              </div>
            )}
          </div>
        )}

        <div className="card">
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>📅 Deadlines (2026/2027)</h3>
          {deadlines.map((d: any) => (
            <div key={d.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
              <div className="info-row"><span className="info-label">Academic Year</span><span className="info-value">{d.academicYear}</span></div>
              <div className="info-row"><span className="info-label">Opening</span><span className="info-value">{d.applicationOpening}</span></div>
              <div className="info-row"><span className="info-label">Closing</span><span className="info-value">{d.applicationClosing}</span></div>
            </div>
          ))}
        </div>
      </div>

      {city && (
        <>
          <h2 className="section-title">City: {city.name}</h2>
          <p className="section-subtitle">Life in {city.name}</p>
          <div className="card">
            <div className="grid grid-3">
              <div className="info-row"><span className="info-label">Population</span><span className="info-value">{city.population.toLocaleString()}</span></div>
              <div className="info-row"><span className="info-label">Safety</span><span className="info-value">{city.safety}</span></div>
              <div className="info-row"><span className="info-label">Cost of Living</span><span className="info-value">{city.costOfLiving}</span></div>
              <div className="info-row"><span className="info-label">Public Transport</span><span className="info-value">{city.publicTransport}</span></div>
              <div className="info-row"><span className="info-label">Weather</span><span className="info-value">{city.weather}</span></div>
              <div className="info-row"><span className="info-label">Nightlife</span><span className="info-value">{city.nightlife}</span></div>
              <div className="info-row"><span className="info-label">Quality of Life</span><span className="info-value">{city.qualityOfLife}</span></div>
              <div className="info-row"><span className="info-label">Walkability</span><span className="info-value">{city.walkability}</span></div>
              <div className="info-row"><span className="info-label">English Friendly</span><span className="info-value">{city.englishFriendliness}</span></div>
              <div className="info-row"><span className="info-label">French Friendly</span><span className="info-value">{city.frenchFriendliness}</span></div>
              <div className="info-row"><span className="info-label">Job Market</span><span className="info-value">{city.jobMarket}</span></div>
              <div className="info-row"><span className="info-label">Housing</span><span className="info-value">{city.housingAvailability}</span></div>
              <div className="info-row"><span className="info-label">Avg Rent</span><span className="info-value">{city.averageRent}</span></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}