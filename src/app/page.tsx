import { getCandidates, getCountries, getSchools } from "@/lib/queries";
import { getPhdOffers } from "@/lib/phd-store";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";

export default function HomePage() {
  const candidates = getCandidates();
  const countries = getCountries();
  const schools = getSchools();
  const phdOpen = getPhdOffers().filter((o) => o.status === "open").length;

  return (
    <div className="page-content-narrow">
      <div className="home-hero">
        <h1>Master Finder</h1>
        <p>
          A personalized research platform for finding the best master&apos;s
          programs across Europe and New Zealand — with application tracking built in.
        </p>
      </div>

      <div className="home-metrics">
        <div className="home-metric">
          <div className="home-metric-value tabular-nums">{schools.length}</div>
          <div className="home-metric-label">Schools</div>
        </div>
        <div className="home-metric">
          <div className="home-metric-value tabular-nums">{countries.length}</div>
          <div className="home-metric-label">Countries</div>
        </div>
        <div className="home-metric">
          <div className="home-metric-value tabular-nums">{phdOpen}</div>
          <div className="home-metric-label">Open PhD offers</div>
        </div>
      </div>

      <SectionHeader
        title="Choose a candidate"
        subtitle="Recommendations are tailored to each person's profile and career goals."
        align="center"
      />

      <div className="grid grid-2" style={{ maxWidth: 760, margin: "0 auto" }}>
        {candidates.map((c) => (
          <Link
            key={c.id}
            href={`/${c.slug}`}
            className={`card candidate-card candidate-card-v2 tint-${c.slug === "dina" ? "dina" : "jadiss"}`}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
              <div className="candidate-avatar" style={{ marginBottom: 0, width: 56, height: 56, fontSize: 22 }}>
                {c.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{c.name}</h3>
                <p style={{ color: "var(--muted)", fontSize: 14 }}>{c.nationality}</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
              {c.education}
            </p>
            <div className="candidate-card-stats">
              <span className="candidate-card-stat">
                <strong>{countries.length}</strong> countries
              </span>
              {c.slug === "dina" && phdOpen > 0 && (
                <span className="candidate-card-stat">
                  <strong>{phdOpen}</strong> PhD offers
                </span>
              )}
            </div>
            <span className="btn btn-primary candidate-card-cta">Open dashboard →</span>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 48 }}>
        <Link href="/audit" className="btn btn-secondary">
          View database quality audit
        </Link>
      </div>
    </div>
  );
}
