/**
 * PhD offers data layer — loads verified PhD discovery output.
 */
import fs from "fs";
import path from "path";

const PHD_PATH = path.join(process.cwd(), "data", "phd", "phd-verified.json");

export interface PhdSupervisor {
  name: string;
  role?: string;
  email?: string | null;
  linkedinUrl?: string | null;
  officialUrl?: string | null;
  sourceUrl?: string;
}

export interface PhdStudentSample {
  name: string;
  linkedinUrl?: string | null;
  cohortYear?: string | null;
  sourceUrl?: string;
}

export interface PhdOffer {
  id: string;
  countrySlug: string;
  institution: string;
  institutionSlug?: string | null;
  title: string;
  subject: string;
  domains?: string[];
  fundingType: string;
  fundingDetails?: string | null;
  openPositions?: number | null;
  teachingLanguage: string;
  startDate?: string | null;
  applicationDeadline?: string | null;
  status: string;
  supervisors: PhdSupervisor[];
  enrolledStudentsSample?: PhdStudentSample[];
  applyUrl: string;
  programInfoUrl: string;
  sourceUrl: string;
  sourceType?: string;
  verificationDate: string;
  confidenceLevel: string;
  notes?: string | null;
}

export interface PhdCountryMeta {
  slug: string;
  name: string;
  flag: string;
}

/** Countries referenced in PhD data (extends beyond masters country list). */
export const PHD_COUNTRY_META: Record<string, { name: string; flag: string }> = {
  france: { name: "France", flag: "🇫🇷" },
  england: { name: "England (UK)", flag: "🇬🇧" },
  ireland: { name: "Ireland", flag: "🇮🇪" },
  belgium: { name: "Belgium", flag: "🇧🇪" },
  luxembourg: { name: "Luxembourg", flag: "🇱🇺" },
  netherlands: { name: "Netherlands", flag: "🇳🇱" },
  spain: { name: "Spain", flag: "🇪🇸" },
  germany: { name: "Germany", flag: "🇩🇪" },
  switzerland: { name: "Switzerland", flag: "🇨🇭" },
  norway: { name: "Norway", flag: "🇳🇴" },
  denmark: { name: "Denmark", flag: "🇩🇰" },
  iceland: { name: "Iceland", flag: "🇮🇸" },
  usa: { name: "United States", flag: "🇺🇸" },
  canada: { name: "Canada", flag: "🇨🇦" },
  australia: { name: "Australia", flag: "🇦🇺" },
  "new-zealand": { name: "New Zealand", flag: "🇳🇿" },
  japan: { name: "Japan", flag: "🇯🇵" },
  "south-korea": { name: "South Korea", flag: "🇰🇷" },
  uae: { name: "United Arab Emirates", flag: "🇦🇪" },
};

export interface PhdFilterCriteria {
  countries?: string[];
  fundingTypes?: string[];
  domains?: string[];
  languages?: string[];
  openOnly?: boolean;
  fundedOnly?: boolean;
  deadlineBefore?: string;
}

function loadPhdData(): { phdOffers: PhdOffer[] } {
  if (!fs.existsSync(PHD_PATH)) return { phdOffers: [] };
  return JSON.parse(fs.readFileSync(PHD_PATH, "utf-8"));
}

export function getPhdOffers(): PhdOffer[] {
  return loadPhdData().phdOffers || [];
}

export function getPhdOffer(id: string): PhdOffer | undefined {
  return getPhdOffers().find((o) => o.id === id);
}

export function getPhdCountries(): PhdCountryMeta[] {
  const slugs = new Set(getPhdOffers().map((o) => o.countrySlug));
  return [...slugs]
    .sort()
    .map((slug) => ({
      slug,
      name: PHD_COUNTRY_META[slug]?.name || slug,
      flag: PHD_COUNTRY_META[slug]?.flag || "🌍",
    }));
}

export function getPhdFundingTypes(): string[] {
  const set = new Set(getPhdOffers().map((o) => o.fundingType).filter(Boolean));
  return [...set].sort();
}

export function getPhdDomains(): string[] {
  const set = new Set<string>();
  for (const o of getPhdOffers()) {
    for (const d of o.domains || []) set.add(d);
  }
  return [...set].sort();
}

function parseDeadline(d: string | null | undefined): number | null {
  if (!d) return null;
  const t = Date.parse(d);
  return Number.isNaN(t) ? null : t;
}

export function getFilteredPhdOffers(criteria: PhdFilterCriteria): PhdOffer[] {
  let offers = getPhdOffers();

  if (criteria.openOnly !== false) {
    offers = offers.filter((o) => o.status === "open");
  }

  if (criteria.fundedOnly) {
    offers = offers.filter(
      (o) => o.fundingType && !["unknown", "self_funded"].includes(o.fundingType)
    );
  }

  if (criteria.countries?.length) {
    offers = offers.filter((o) => criteria.countries!.includes(o.countrySlug));
  }

  if (criteria.fundingTypes?.length) {
    offers = offers.filter((o) => criteria.fundingTypes!.includes(o.fundingType));
  }

  if (criteria.domains?.length) {
    offers = offers.filter((o) =>
      criteria.domains!.some((d) =>
        (o.domains || []).some((od) => od.toLowerCase().includes(d.toLowerCase())) ||
        o.subject.toLowerCase().includes(d.toLowerCase()) ||
        o.title.toLowerCase().includes(d.toLowerCase())
      )
    );
  }

  if (criteria.languages?.length) {
    offers = offers.filter((o) =>
      criteria.languages!.some((l) => o.teachingLanguage.toLowerCase().includes(l.toLowerCase()))
    );
  }

  if (criteria.deadlineBefore) {
    const max = parseDeadline(criteria.deadlineBefore);
    if (max) {
      offers = offers.filter((o) => {
        const dl = parseDeadline(o.applicationDeadline);
        return dl !== null && dl <= max;
      });
    }
  }

  // Urgent first (nearest deadline), then institution
  offers.sort((a, b) => {
    const da = parseDeadline(a.applicationDeadline) ?? Infinity;
    const db = parseDeadline(b.applicationDeadline) ?? Infinity;
    if (da !== db) return da - db;
    return a.institution.localeCompare(b.institution);
  });

  return offers;
}

export function formatFundingType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function fundingBadgeStyle(type: string): { color: string; background: string; fontWeight: number } {
  switch (type) {
    case "fully_funded":
      return { color: "#1a7a3a", background: "#e8f9ed", fontWeight: 600 };
    case "scholarship":
      return { color: "#1a5a8a", background: "#e8f2fc", fontWeight: 600 };
    case "industry_partnership":
      return { color: "#7a4f00", background: "#fff5e0", fontWeight: 600 };
    default:
      return { color: "#333", background: "#f0f0f0", fontWeight: 600 };
  }
}
