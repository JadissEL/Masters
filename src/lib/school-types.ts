/** Canonical school ownership / governance types for all institutions in the database. */
export const SCHOOL_TYPES = ["Public", "Semi-private", "Private"] as const;

export type SchoolType = (typeof SCHOOL_TYPES)[number];

export const SCHOOL_TYPE_LABELS: Record<SchoolType, string> = {
  Public: "Public",
  "Semi-private": "Semi-private",
  Private: "Private",
};

export const SCHOOL_TYPE_DESCRIPTIONS: Record<SchoolType, string> = {
  Public:
    "State-funded universities, public grandes écoles, IAE schools, and other government institutions.",
  "Semi-private":
    "Special-status or foundation institutions, or autonomous faculties within public universities (e.g. Sciences Po, Oxford/Cambridge business schools, NHH).",
  Private:
    "Independently owned business schools, private universities, and for-profit or private non-profit institutions.",
};

export function isSchoolType(value: string): value is SchoolType {
  return (SCHOOL_TYPES as readonly string[]).includes(value);
}

export function schoolTypeBadgeStyle(type: string): { color: string; background: string; fontWeight: number } {
  switch (type) {
    case "Public":
      return { color: "#1a5a8a", background: "#e8f2fc", fontWeight: 600 };
    case "Semi-private":
      return { color: "#7a4f00", background: "#fff5e0", fontWeight: 600 };
    case "Private":
      return { color: "#5a2d82", background: "#f3ebfa", fontWeight: 600 };
    default:
      return { color: "#333", background: "#f0f0f0", fontWeight: 600 };
  }
}
