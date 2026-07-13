"use client";

import type { Program, ProgramDeadline, DataSource } from "@/lib/queries";
import type { ProgramTracking } from "@/lib/tracking/types";
import ProgramTracker from "@/components/tracking/ProgramTracker";
import { TrackingBadges } from "@/components/tracking/TrackingBadges";
import { ExternalLink, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";

interface AdmissionHints {
  applicationUrl?: string | null;
  applicationPortal?: string | null;
  englishRequirements?: string | null;
  frenchRequirements?: string | null;
  interviewRequired?: boolean | null;
}

function VerificationBadge({ status }: { status?: string | null }) {
  if (status === "Verified") {
    return (
      <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <ShieldCheck size={12} /> Verified
      </span>
    );
  }
  if (status === "Manual Review Required") {
    return (
      <span className="badge" style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fde8e8", color: "#c0392b" }}>
        <ShieldAlert size={12} /> Manual Review
      </span>
    );
  }
  return (
    <span className="badge badge-accent" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <ShieldQuestion size={12} /> Pending Verification
    </span>
  );
}

interface ProgramCardProps {
  program: Program;
  deadlines?: ProgramDeadline[];
  sources?: DataSource[];
  admissionHints?: AdmissionHints;
  candidateSlug: string;
  tracking?: ProgramTracking | null;
}

export default function ProgramDetailCard({ program, deadlines = [], sources = [], admissionHints, candidateSlug, tracking }: ProgramCardProps) {
  const pd = deadlines[0];
  const applyUrl = program.applicationUrl || admissionHints?.applicationUrl;
  const applyPortal = program.applicationPortal || admissionHints?.applicationPortal;
  const showIelts = program.ieltsMinScore != null;
  const showGmat = program.gmatRequired != null || program.greRequired != null;
  const showAdmissions = showIelts || showGmat || admissionHints?.englishRequirements;

  return (
    <div className="card">
      <div className="program-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
        <h3 style={{ fontSize: 17, fontWeight: 600 }}>{program.officialTitle || program.name}</h3>
        <VerificationBadge status={program.verificationStatus} />
      </div>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>{program.description}</p>
      <TrackingBadges tracking={tracking} />

      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Programme</p>
        <div className="info-row"><span className="info-label">Duration</span><span className="info-value">{program.duration}</span></div>
        {program.studyMode && <div className="info-row"><span className="info-label">Study Mode</span><span className="info-value">{program.studyMode}</span></div>}
        {program.faculty && <div className="info-row"><span className="info-label">Faculty</span><span className="info-value">{program.faculty}</span></div>}
        {program.degreeAwarded && <div className="info-row"><span className="info-label">Degree</span><span className="info-value">{program.degreeAwarded}</span></div>}
        <div className="info-row"><span className="info-label">ECTS</span><span className="info-value">{program.ects}</span></div>
        <div className="info-row"><span className="info-label">Enter M2</span><span className="info-value">
          <span className={`badge ${program.canEnterM2 === "YES" ? "badge-success" : program.canEnterM2 === "Conditional" ? "badge-accent" : ""}`}>{program.canEnterM2}</span>
        </span></div>
        {program.programmeRanking && <div className="info-row"><span className="info-label">Ranking</span><span className="info-value">{program.programmeRanking}</span></div>}
      </div>

      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Tuition & Costs</p>
        <div className="info-row"><span className="info-label">Tuition</span><span className="info-value">{program.tuitionFees}</span></div>
        {program.tuitionYearly != null && <div className="info-row"><span className="info-label">Yearly</span><span className="info-value">€{program.tuitionYearly.toLocaleString()}</span></div>}
        {program.internationalTuition != null && <div className="info-row"><span className="info-label">International</span><span className="info-value">€{program.internationalTuition.toLocaleString()}</span></div>}
        {program.euTuition != null && <div className="info-row"><span className="info-label">EU</span><span className="info-value">€{program.euTuition.toLocaleString()}</span></div>}
        {program.registrationFee != null && <div className="info-row"><span className="info-label">Application Fee</span><span className="info-value">€{program.registrationFee}</span></div>}
        {program.estimatedLivingCosts && <div className="info-row"><span className="info-label">Living Costs</span><span className="info-value">{program.estimatedLivingCosts}</span></div>}
      </div>

      {showAdmissions && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Admissions</p>
          {program.minGPA && <div className="info-row"><span className="info-label">Min GPA</span><span className="info-value">{program.minGPA}</span></div>}
          {program.gmatMinScore && <div className="info-row"><span className="info-label">GMAT (median)</span><span className="info-value">{program.gmatMinScore}</span></div>}
          {program.ieltsMinScore != null && <div className="info-row"><span className="info-label">IELTS Min</span><span className="info-value">{program.ieltsMinScore}</span></div>}
          {program.toeflMinScore != null && <div className="info-row"><span className="info-label">TOEFL Min</span><span className="info-value">{program.toeflMinScore}</span></div>}
          {admissionHints?.englishRequirements && !program.ieltsMinScore && (
            <div className="info-row"><span className="info-label">English</span><span className="info-value">{admissionHints.englishRequirements}</span></div>
          )}
          {admissionHints?.frenchRequirements && (
            <div className="info-row"><span className="info-label">French</span><span className="info-value">{admissionHints.frenchRequirements}</span></div>
          )}
          {program.gmatRequired && <div className="info-row"><span className="info-label">GMAT</span><span className="info-value">Required</span></div>}
          {program.greRequired && <div className="info-row"><span className="info-label">GRE</span><span className="info-value">Required</span></div>}
          {(program.interviewRequired || admissionHints?.interviewRequired) && (
            <div className="info-row"><span className="info-label">Interview</span><span className="info-value">Required</span></div>
          )}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Career</p>
        <div className="info-row"><span className="info-label">Internship</span><span className="info-value">{program.internshipIncluded ? "Yes" : "No"}</span></div>
        <div className="info-row"><span className="info-label">Alternance</span><span className="info-value">{program.alternanceAvailable ? "Yes" : "No"}</span></div>
        <div className="info-row"><span className="info-label">Employment Rate</span><span className="info-value">{program.employmentRate}</span></div>
        <div className="info-row"><span className="info-label">Graduate Salary</span><span className="info-value">{program.graduateSalary || program.averageSalary}</span></div>
        {program.employabilityStats && <div className="info-row"><span className="info-label">Employability</span><span className="info-value">{program.employabilityStats}</span></div>}
      </div>

      {pd && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Deadlines</p>
          {pd.applicationsOpen && <div className="info-row"><span className="info-label">Opens</span><span className="info-value">{pd.applicationsOpen}</span></div>}
          {pd.priorityDeadline && <div className="info-row"><span className="info-label">Priority</span><span className="info-value">{pd.priorityDeadline}</span></div>}
          {pd.finalDeadline && <div className="info-row"><span className="info-label">Final</span><span className="info-value">{pd.finalDeadline}</span></div>}
          {pd.intakePeriod && <div className="info-row"><span className="info-label">Intake</span><span className="info-value">{pd.intakePeriod}</span></div>}
        </div>
      )}

      {(program.programmeUrl || applyUrl || applyPortal) && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Apply</p>
          {program.programmeUrl && (
            <a href={program.programmeUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
              Programme page <ExternalLink size={12} />
            </a>
          )}
          {applyUrl && (
            <a href={applyUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
              Apply now <ExternalLink size={12} />
            </a>
          )}
          {applyPortal && applyPortal !== applyUrl && (
            <a href={applyPortal} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}>
              Application portal <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}

      {program.admissionsEmail && (
        <div className="info-row"><span className="info-label">Admissions</span><span className="info-value">
          <a href={`mailto:${program.admissionsEmail}`} style={{ color: "var(--accent)" }}>{program.admissionsEmail}</a>
        </span></div>
      )}

      {(program.sourceUrl || sources.length > 0) && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: 11, color: "var(--muted)" }}>
            Source: {program.sourceType || "unknown"}
            {program.verificationDate && ` · Verified ${program.verificationDate}`}
            {program.confidenceLevel && ` · ${program.confidenceLevel} confidence`}
          </p>
          {program.sourceUrl && (
            <a href={program.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--accent)" }}>
              View official source
            </a>
          )}
        </div>
      )}

      <ProgramTracker candidateSlug={candidateSlug} programId={program.id} initial={tracking} />
    </div>
  );
}
