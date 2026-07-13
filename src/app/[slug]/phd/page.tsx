import { getCandidate } from "@/lib/queries";
import {
  getFilteredPhdOffers,
  getPhdCountries,
  getPhdFundingTypes,
  getPhdDomains,
  PHD_COUNTRY_META,
  formatFundingType,
  fundingBadgeStyle,
  type PhdFilterCriteria,
} from "@/lib/phd-store";
import { getPhdTrackingMapAsync } from "@/lib/tracking/store";
import { parseTrackingFilterFromSearchParams } from "@/lib/tracking/filters";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Calendar, Users } from "lucide-react";
import PhdFilterControls from "./PhdFilterControls";
import { TrackingBadges } from "@/components/tracking/TrackingBadges";

export default async function PhdPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const candidate = getCandidate(slug);
  if (!candidate) return notFound();

  const sp = await searchParams;
  const urgent = sp.urgent === "true";
  const deadlineBefore = urgent
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    : undefined;
  const trackingByOfferId = await getPhdTrackingMapAsync(slug);

  const criteria: PhdFilterCriteria = {
    countries: Array.isArray(sp.country) ? sp.country : sp.country ? [sp.country] : undefined,
    fundingTypes: Array.isArray(sp.funding) ? sp.funding : sp.funding ? [sp.funding] : undefined,
    domains: Array.isArray(sp.domain) ? sp.domain : sp.domain ? [sp.domain] : undefined,
    languages: Array.isArray(sp.language) ? sp.language : sp.language ? [sp.language] : undefined,
    fundedOnly: sp.fundedOnly !== "false",
    openOnly: true,
    deadlineBefore,
    tracking: parseTrackingFilterFromSearchParams(sp),
    trackingByOfferId,
  };

  const results = getFilteredPhdOffers(criteria);
  const countries = getPhdCountries();
  const fundingTypes = getPhdFundingTypes();
  const domains = getPhdDomains();

  return (
    <div className="container">
      <Link
        href={`/${candidate.slug}`}
        className="nav-back"
        style={{ fontSize: 15, fontWeight: 500, marginBottom: 16, display: "inline-flex" }}
      >
        <ArrowLeft size={18} /> Back to {candidate.name}
      </Link>
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <Link href={`/${candidate.slug}`}>{candidate.name}</Link>
        <span>›</span>
        <span>PhD Opportunities</span>
      </div>

      <h1 className="section-title">PhD Opportunities for {candidate.name}</h1>
      <p className="section-subtitle">
        Open funded doctoral positions in finance, accounting, compliance &amp; related fields — verified{" "}
        {results.length > 0 ? results[0].verificationDate : "2026-07-12"}
      </p>

      <PhdFilterControls
        candidateSlug={candidate.slug}
        countries={countries}
        fundingTypes={fundingTypes}
        domains={domains}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 className="section-title" style={{ fontSize: 22 }}>
          {results.length} Open Position{results.length !== 1 ? "s" : ""}
        </h2>
      </div>

      {results.length === 0 ? (
        <div className="card empty-state">
          <p style={{ fontSize: 16 }}>No PhD positions match these filters.</p>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>Try clearing filters or check back after wave 2 research.</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {results.map((o) => {
            const country = PHD_COUNTRY_META[o.countrySlug];
            const tracking = trackingByOfferId.get(o.id);
            return (
              <Link
                key={o.id}
                href={`/${candidate.slug}/phd/${encodeURIComponent(o.id)}`}
                className="card school-card"
              >
                <div className="school-card-header">
                  <div style={{ flex: 1 }}>
                    <div className="school-name">{o.title}</div>
                    <div className="school-meta">
                      {country?.flag} {country?.name || o.countrySlug} · {o.institution}
                    </div>
                  </div>
                </div>
                <p className="school-description" style={{ fontSize: 14, marginBottom: 12 }}>
                  {o.subject.length > 180 ? `${o.subject.slice(0, 180)}…` : o.subject}
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  <span className="badge" style={fundingBadgeStyle(o.fundingType)}>
                    {formatFundingType(o.fundingType)}
                  </span>
                  <span className="badge">{o.teachingLanguage}</span>
                  {o.applicationDeadline && (
                    <span className="badge badge-accent" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={12} /> {o.applicationDeadline}
                    </span>
                  )}
                  {o.supervisors?.some((s) => s.email) && (
                    <span className="badge badge-success">Supervisor email</span>
                  )}
                  {(o.enrolledStudentsSample?.length || 0) > 0 && (
                    <span className="badge" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Users size={12} /> {o.enrolledStudentsSample!.length} students listed
                    </span>
                  )}
                </div>
                {(o.domains || []).slice(0, 4).map((d) => (
                  <span key={d} className="badge" style={{ marginRight: 4 }}>
                    {d}
                  </span>
                ))}
                <TrackingBadges tracking={tracking} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
