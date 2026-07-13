"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";

const LABELS: Record<string, string> = {
  country: "Country",
  language: "Language",
  programType: "Topic",
  schoolType: "School type",
  canEnterM2: "M2",
  maxTuition: "Max tuition",
  minScore: "Min score",
  sortBy: "Sort",
  trackPipeline: "Status",
  trackFeasibility: "Feasibility",
  trackPriority: "Priority",
  trackLangTest: "Lang test",
  trackGmat: "GMAT",
  trackOutreach: "Outreach",
  trackBlocker: "Blocker",
  trackIntake: "Intake",
  trackDeadlineDays: "Deadline",
  trackTestPrep: "Tests",
  trackInterview: "Interview",
  trackDecision: "Decision",
  trackM2: "M2",
  funding: "Funding",
  domain: "Domain",
};

export default function FilterChips({ candidateSlug }: { candidateSlug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = pathname.includes("/phd") ? "phd" : "filter";

  const chips: { key: string; value: string; label: string }[] = [];

  searchParams.forEach((value, key) => {
    if (["alternanceOnly", "internshipOnly", "verifiedOnly", "fundedOnly", "urgent"].includes(key)) {
      if (value === "true") {
        chips.push({ key, value: "true", label: key.replace(/Only|Only/g, "") });
      }
      return;
    }
    if (
      ["trackNotReviewed", "trackHasComment", "trackHasBlockers", "trackDocsIncomplete", "trackDocsReady", "trackAlternance"].includes(
        key
      ) &&
      value === "true"
    ) {
      chips.push({ key, value: "true", label: key.replace("track", "").replace(/([A-Z])/g, " $1").trim() });
      return;
    }
    const prefix = LABELS[key] || key;
    chips.push({ key, value, label: `${prefix}: ${value.replace(/_/g, " ")}` });
  });

  if (chips.length === 0) return null;

  const remove = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const all = params.getAll(key);
    if (all.length > 1) {
      params.delete(key);
      all.filter((v) => v !== value).forEach((v) => params.append(key, v));
    } else {
      params.delete(key);
    }
    const q = params.toString();
    router.push(`/${candidateSlug}/${basePath}${q ? `?${q}` : ""}`);
  };

  const clearAll = () => router.push(`/${candidateSlug}/${basePath}`);

  return (
    <div className="filter-chips">
      {chips.map((c, i) => (
        <button
          key={`${c.key}-${c.value}-${i}`}
          type="button"
          className="chip chip-removable"
          onClick={() => remove(c.key, c.value)}
        >
          {c.label}
          <X size={14} aria-hidden />
        </button>
      ))}
      <button type="button" className="chip chip-ghost" onClick={clearAll}>
        Clear all
      </button>
    </div>
  );
}
