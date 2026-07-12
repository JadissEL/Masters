import { getCandidate } from "@/lib/queries";
import {
  getPhdOffer,
  PHD_COUNTRY_META,
  formatFundingType,
  fundingBadgeStyle,
} from "@/lib/phd-store";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Mail, Linkedin } from "lucide-react";

export default async function PhdOfferPage({
  params,
}: {
  params: Promise<{ slug: string; offerId: string }>;
}) {
  const { slug, offerId } = await params;
  const candidate = getCandidate(slug);
  if (!candidate) return notFound();

  const offer = getPhdOffer(decodeURIComponent(offerId));
  if (!offer) return notFound();

  const country = PHD_COUNTRY_META[offer.countrySlug];

  return (
    <div className="container">
      <Link
        href={`/${candidate.slug}/phd`}
        className="nav-back"
        style={{ fontSize: 15, fontWeight: 500, marginBottom: 16, display: "inline-flex" }}
      >
        <ArrowLeft size={18} /> Back to PhD list
      </Link>

      <div className="card" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>{offer.title}</h1>
        <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 16 }}>
          {country?.flag} {country?.name || offer.countrySlug} · {offer.institution}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <span className="badge" style={fundingBadgeStyle(offer.fundingType)}>
            {formatFundingType(offer.fundingType)}
          </span>
          <span className="badge">{offer.teachingLanguage}</span>
          <span className="badge">{offer.status}</span>
          <span className="badge">{offer.confidenceLevel} confidence</span>
        </div>

        <div className="grid grid-2" style={{ marginBottom: 20 }}>
          <div className="info-row">
            <span className="info-label">Start date</span>
            <span className="info-value">{offer.startDate || "—"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Application deadline</span>
            <span className="info-value">{offer.applicationDeadline || "Rolling / TBC"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Open positions</span>
            <span className="info-value">{offer.openPositions ?? "Not specified"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Verified</span>
            <span className="info-value">{offer.verificationDate}</span>
          </div>
        </div>

        {offer.fundingDetails && (
          <>
            <p style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginBottom: 4 }}>Funding</p>
            <p style={{ fontSize: 14, marginBottom: 16 }}>{offer.fundingDetails}</p>
          </>
        )}

        <p style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginBottom: 4 }}>Research subject</p>
        <p style={{ fontSize: 14, marginBottom: 16 }}>{offer.subject}</p>

        <div className="btn-row">
          <a href={offer.applyUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Apply <ExternalLink size={14} style={{ marginLeft: 6 }} />
          </a>
          <a
            href={offer.programInfoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Program info <ExternalLink size={14} style={{ marginLeft: 6 }} />
          </a>
          <a href={offer.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            Official source <ExternalLink size={14} style={{ marginLeft: 6 }} />
          </a>
        </div>
      </div>

      {offer.supervisors?.length > 0 && (
        <>
          <h2 className="section-title" style={{ fontSize: 20 }}>Supervisors</h2>
          <div className="grid grid-2" style={{ marginBottom: 24 }}>
            {offer.supervisors.map((s, i) => (
              <div key={i} className="card">
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{s.name}</h3>
                {s.role && <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>{s.role}</p>}
                {s.email && (
                  <a href={`mailto:${s.email}`} style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                    <Mail size={14} /> {s.email}
                  </a>
                )}
                {s.linkedinUrl && (
                  <a
                    href={s.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}
                  >
                    <Linkedin size={14} /> LinkedIn profile
                  </a>
                )}
                {s.officialUrl && (
                  <a
                    href={s.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 13, marginTop: 8, display: "block" }}
                  >
                    Official page
                  </a>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {(offer.enrolledStudentsSample?.length || 0) > 0 && (
        <>
          <h2 className="section-title" style={{ fontSize: 20 }}>
            Current / recent PhD students (public sources)
          </h2>
          <div className="card" style={{ marginBottom: 24 }}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {offer.enrolledStudentsSample!.map((st, i) => (
                <li key={i} style={{ marginBottom: 8, fontSize: 14 }}>
                  {st.name}
                  {st.cohortYear ? ` (${st.cohortYear})` : ""}
                  {st.linkedinUrl && (
                    <>
                      {" "}
                      —{" "}
                      <a href={st.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        LinkedIn
                      </a>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {offer.notes && (
        <div className="card">
          <p style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginBottom: 4 }}>Notes</p>
          <p style={{ fontSize: 14 }}>{offer.notes}</p>
        </div>
      )}
    </div>
  );
}
