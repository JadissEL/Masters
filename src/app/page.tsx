import { getCandidates } from "@/lib/queries";
import Link from "next/link";

export default function HomePage() {
  const candidates = getCandidates();

  return (
    <div className="container">
      <div className="hero">
        <h1>Master Finder</h1>
        <p>
          A personalized research platform for finding the best master's
          programs across Europe and New Zealand.
        </p>
      </div>

      <h2 className="section-title" style={{ textAlign: "center" }}>
        Choose a candidate
      </h2>
      <p className="section-subtitle" style={{ textAlign: "center" }}>
        Recommendations are tailored to each person's profile and career
        goals.
      </p>

      <div className="grid grid-2" style={{ maxWidth: 700, margin: "0 auto" }}>
        {candidates.map((c: any) => (
          <Link
            key={c.id}
            href={`/${c.slug}`}
            className="card candidate-card"
          >
            <div className="candidate-avatar">{c.name.charAt(0)}</div>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              {c.name}
            </h3>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 16 }}>
              {c.nationality}
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--muted)",
                lineHeight: 1.6,
                maxWidth: 280,
              }}
            >
              {c.education}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}