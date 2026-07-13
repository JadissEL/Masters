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
import { Calendar, Users } from "lucide-react";
import PhdFilterControls from "./PhdFilterControls";
import FilterChipsBoundary from "@/components/filter/FilterChipsBoundary";
import EmptyState from "@/components/ui/EmptyState";
import SectionHeader from "@/components/ui/SectionHeader";
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
    <>
      <SectionHeader
        title={`PhD opportunities`}
        subtitle={`Open funded doctoral positions for ${candidate.name}. Click a position to track your application.`}
      />

      <FilterChipsBoundary candidateSlug={candidate.slug} />

      <div className="filter-page-layout">
        <aside className="filter-page-sidebar">
          <PhdFilterControls
            candidateSlug={candidate.slug}
            countries={countries}
            fundingTypes={fundingTypes}
            domains={domains}
          />
        </aside>

        <div className="filter-page-results">
          <h2 className="section-title" style={{ fontSize: 22, marginBottom: 16 }}>
            {results.length} open position{results.length !== 1 ? "s" : ""}
          </h2>

          {results.length === 0 ? (
            <EmptyState
              title="No PhD positions match your filters"
              description="Try clearing filters or check back after the next research wave."
              action={
                <Link href={`/${candidate.slug}/phd`} className="btn btn-primary">
                  Clear filters
                </Link>
              }
            />
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
      </div>
    </>
  );
}
