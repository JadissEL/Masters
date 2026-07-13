"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { PhdCountryMeta } from "@/lib/phd-store";
import FilterShell from "@/components/FilterShell";
import TrackingFilterSection from "@/components/tracking/TrackingFilterSection";
import { countActiveTrackingFilters, parseTrackingFilterFromSearchParams } from "@/lib/tracking/filters";

interface PhdFilterControlsProps {
  candidateSlug: string;
  countries: PhdCountryMeta[];
  fundingTypes: string[];
  domains: string[];
}

const LANGUAGES = ["English", "French", "German", "Spanish", "Dutch", "Danish", "Norwegian"];

export default function PhdFilterControls({
  candidateSlug,
  countries,
  fundingTypes,
  domains,
}: PhdFilterControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
      router.push(`/${candidateSlug}/phd?${params.toString()}`);
    },
    [router, searchParams, candidateSlug]
  );

  const toggleArrayParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.getAll(key);
      params.delete(key);
      if (current.includes(value)) {
        current.filter((v) => v !== value).forEach((v) => params.append(key, v));
      } else {
        [...current, value].forEach((v) => params.append(key, v));
      }
      router.push(`/${candidateSlug}/phd?${params.toString()}`);
    },
    [router, searchParams, candidateSlug]
  );

  const clearAll = useCallback(() => {
    router.push(`/${candidateSlug}/phd`);
  }, [router, candidateSlug]);

  const selectedCountries = searchParams.getAll("country");
  const selectedFunding = searchParams.getAll("funding");
  const selectedDomains = searchParams.getAll("domain");
  const selectedLanguages = searchParams.getAll("language");
  const fundedOnly = searchParams.get("fundedOnly") !== "false";
  const urgent = searchParams.get("urgent") === "true";

  const activeCount =
    selectedCountries.length +
    selectedFunding.length +
    selectedDomains.length +
    selectedLanguages.length +
    (!fundedOnly ? 1 : 0) +
    (urgent ? 1 : 0) +
    countActiveTrackingFilters(parseTrackingFilterFromSearchParams(Object.fromEntries(searchParams.entries())));

  const hasActive = activeCount > 0;

  return (
    <FilterShell
      title="PhD Filters"
      activeCount={activeCount}
      showClear={hasActive}
      onClear={clearAll}
    >
      <div className="filter-section">
        <p className="filter-section-title">Countries</p>
        <div className="filter-check-grid">
          {countries.map((c) => (
            <label key={c.slug} className="filter-check-label">
              <input
                type="checkbox"
                checked={selectedCountries.includes(c.slug)}
                onChange={() => toggleArrayParam("country", c.slug)}
              />
              <span>
                {c.flag} {c.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <p className="filter-section-title">Funding type</p>
        <div className="filter-check-grid">
          {fundingTypes.map((f) => (
            <label key={f} className="filter-check-label">
              <input
                type="checkbox"
                checked={selectedFunding.includes(f)}
                onChange={() => toggleArrayParam("funding", f)}
              />
              <span>{f.replace(/_/g, " ")}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <p className="filter-section-title">Research domains</p>
        <div className="filter-check-grid">
          {domains.slice(0, 24).map((d) => (
            <label key={d} className="filter-check-label">
              <input
                type="checkbox"
                checked={selectedDomains.includes(d)}
                onChange={() => toggleArrayParam("domain", d)}
              />
              <span>{d}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <p className="filter-section-title">Teaching language</p>
        <div className="filter-check-grid">
          {LANGUAGES.map((l) => (
            <label key={l} className="filter-check-label">
              <input
                type="checkbox"
                checked={selectedLanguages.includes(l)}
                onChange={() => toggleArrayParam("language", l)}
              />
              <span>{l}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-toggles">
        <label className="filter-check-label">
          <input
            type="checkbox"
            checked={fundedOnly}
            onChange={(e) => updateParam("fundedOnly", e.target.checked ? null : "false")}
          />
          <span>Funded / scholarship only</span>
        </label>
        <label className="filter-check-label">
          <input
            type="checkbox"
            checked={urgent}
            onChange={(e) => updateParam("urgent", e.target.checked ? "true" : null)}
          />
          <span>Urgent deadlines (next 30 days)</span>
        </label>
      </div>

      <TrackingFilterSection candidateSlug={candidateSlug} basePath="phd" />
    </FilterShell>
  );
}
