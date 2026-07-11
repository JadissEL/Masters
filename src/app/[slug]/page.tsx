import { getCandidate, getCountries, getSchoolsWithScores } from "@/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

export default async function CandidatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const candidate = getCandidate(slug);
  if (!candidate) return notFound();

  const countries = getCountries();
  const schools = getSchoolsWithScores(candidate.id).slice(0, 5);

  return (
    <div className="container">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Link href="/" className="nav-back" style={{ fontSize: 15, fontWeight: 500 }}>
          <ArrowLeft size={18} /> Back to Home
        </Link>
        <Link href={`/${candidate.slug}/filter`} className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: 14 }}>
          <SlidersHorizontal size={16} style={{ marginRight: 6 }} /> Filter Schools
        </Link>
      </div>
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>{candidate.name}</span>
      </div>

      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
          <div className="candidate-avatar" style={{ marginBottom: 0 }}>{candidate.name.charAt(0)}</div>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>{candidate.name}</h1>
            <p style={{ color: "var(--muted)", fontSize: 15 }}>{candidate.nationality}</p>
          </div>
        </div>
        <div className="grid grid-2">
          <div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4, fontWeight: 500 }}>Languages</p>
            <p style={{ fontSize: 14, marginBottom: 16 }}>{candidate.languages}</p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4, fontWeight: 500 }}>Education</p>
            <p style={{ fontSize: 14, marginBottom: 16 }}>{candidate.education}</p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4, fontWeight: 500 }}>Experience</p>
            <p style={{ fontSize: 14, marginBottom: 16 }}>{candidate.experience}</p>
          </div>
          <div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4, fontWeight: 500 }}>Career Objectives</p>
            <p style={{ fontSize: 14, marginBottom: 16 }}>{candidate.careerObjectives}</p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4, fontWeight: 500 }}>Preferences</p>
            <p style={{ fontSize: 14 }}>{candidate.preferences}</p>
          </div>
        </div>
      </div>

      <h2 className="section-title">Top Recommended Schools</h2>
      <p className="section-subtitle">Best matches based on {candidate.name}'s profile</p>
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
                }}>
                  {s.score.overall}
                </div>
              )}
            </div>
            <div className="school-description">{s.description}</div>
            {s.score && (
              <span className={`badge ${s.score.recommendation === "Highly Recommended" ? "badge-success" : "badge-accent"}`}>
                {s.score.recommendation}
              </span>
            )}
          </Link>
        ))}
      </div>

      <h2 className="section-title">Explore Countries</h2>
      <p className="section-subtitle">Browse schools by destination</p>
      <div className="grid grid-2">
        {countries.map((c: any) => (
          <Link key={c.id} href={`/${candidate.slug}/countries/${c.slug}`} className="card country-card">
            <span className="flag">{c.flag}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>{c.summary}</div>
            </div>
            <span style={{ color: "var(--muted)" }}>›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}