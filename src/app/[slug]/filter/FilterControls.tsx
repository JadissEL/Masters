"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SCHOOL_TYPES, SCHOOL_TYPE_DESCRIPTIONS } from "@/lib/school-types";
import FilterShell from "@/components/FilterShell";
import TrackingFilterSection from "@/components/tracking/TrackingFilterSection";
import { countActiveTrackingFilters, parseTrackingFilterFromSearchParams } from "@/lib/tracking/filters";

interface FilterControlsProps {
  candidateSlug: string;
  countries: { slug: string; name: string; flag: string }[];
}

const PROGRAM_TYPES = [
  "Finance",
  "Investment Banking",
  "M&A",
  "Asset Management",
  "Risk",
  "Compliance",
  "Data Science",
  "AI",
  "Machine Learning",
  "FinTech",
  "Blockchain",
  "Business Analytics",
  "DevOps",
  "Cloud",
  "Software Engineering",
  "Quantitative Finance",
  "Financial Engineering",
];

const LANGUAGES = ["English", "French", "Italian", "Spanish", "Dutch", "Danish", "Norwegian", "Icelandic"];

export default function FilterControls({ candidateSlug, countries }: FilterControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/${candidateSlug}/filter?${params.toString()}`);
  }, [router, searchParams, candidateSlug]);

  const toggleArrayParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(key);
    if (current.includes(value)) {
      params.delete(key);
      current.filter((v) => v !== value).forEach((v) => params.append(key, v));
    } else {
      params.append(key, value);
    }
    router.push(`/${candidateSlug}/filter?${params.toString()}`);
  }, [router, searchParams, candidateSlug]);

  const clearAll = useCallback(() => {
    router.push(`/${candidateSlug}/filter`);
  }, [router, candidateSlug]);

  const selectedCountries = searchParams.getAll("country");
  const selectedLanguages = searchParams.getAll("language");
  const selectedProgramTypes = searchParams.getAll("programType");
  const selectedSchoolTypes = searchParams.getAll("schoolType");
  const canEnterM2 = searchParams.get("canEnterM2") || "";
  const maxTuition = searchParams.get("maxTuition") || "";
  const minScore = searchParams.get("minScore") || "";
  const alternanceOnly = searchParams.get("alternanceOnly") === "true";
  const internshipOnly = searchParams.get("internshipOnly") === "true";
  const verifiedOnly = searchParams.get("verifiedOnly") === "true";
  const sortBy = searchParams.get("sortBy") || "";

  const activeCount =
    selectedCountries.length +
    selectedLanguages.length +
    selectedProgramTypes.length +
    selectedSchoolTypes.length +
    (canEnterM2 ? 1 : 0) +
    (maxTuition ? 1 : 0) +
    (minScore ? 1 : 0) +
    (alternanceOnly ? 1 : 0) +
    (internshipOnly ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (sortBy ? 1 : 0) +
    countActiveTrackingFilters(parseTrackingFilterFromSearchParams(Object.fromEntries(searchParams.entries())));

  const hasActiveFilters = activeCount > 0;

  return (
    <FilterShell
      title="Filters"
      activeCount={activeCount}
      showClear={hasActiveFilters}
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
              <span>{c.flag} {c.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <p className="filter-section-title">School Type</p>
        <div className="filter-check-grid">
          {SCHOOL_TYPES.map((t) => (
            <label key={t} className="filter-check-label" title={SCHOOL_TYPE_DESCRIPTIONS[t]}>
              <input
                type="checkbox"
                checked={selectedSchoolTypes.includes(t)}
                onChange={() => toggleArrayParam("schoolType", t)}
              />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <p className="filter-section-title">Teaching Language</p>
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

      <div className="filter-section">
        <p className="filter-section-title">Program Topics</p>
        <div className="filter-check-grid">
          {PROGRAM_TYPES.map((p) => (
            <label key={p} className="filter-check-label">
              <input
                type="checkbox"
                checked={selectedProgramTypes.includes(p)}
                onChange={() => toggleArrayParam("programType", p)}
              />
              <span>{p}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <p className="filter-section-title">Direct M2 Entry</p>
        <select
          value={canEnterM2}
          onChange={(e) => updateParam("canEnterM2", e.target.value || null)}
          className="filter-select"
        >
          <option value="">Any</option>
          <option value="YES">YES — Direct M2 entry</option>
          <option value="Conditional">Conditional</option>
          <option value="NO">NO — M1 only</option>
        </select>
      </div>

      <div className="filter-grid-2">
        <div>
          <p className="filter-section-title">Max Tuition (€)</p>
          <select
            value={maxTuition}
            onChange={(e) => updateParam("maxTuition", e.target.value || null)}
            className="filter-select"
          >
            <option value="">No limit</option>
            <option value="2000">€2,000</option>
            <option value="3000">€3,000</option>
            <option value="5000">€5,000</option>
            <option value="7000">€7,000</option>
            <option value="9000">€9,000</option>
            <option value="10000">€10,000</option>
            <option value="12000">€12,000</option>
            <option value="15000">€15,000</option>
            <option value="20000">€20,000</option>
            <option value="30000">€30,000</option>
            <option value="40000">€40,000</option>
            <option value="50000">€50,000</option>
          </select>
        </div>
        <div>
          <p className="filter-section-title">Min Score</p>
          <select
            value={minScore}
            onChange={(e) => updateParam("minScore", e.target.value || null)}
            className="filter-select"
          >
            <option value="">No minimum</option>
            <option value="70">70+</option>
            <option value="80">80+</option>
            <option value="85">85+</option>
            <option value="90">90+</option>
          </select>
        </div>
      </div>

      <div className="filter-section">
        <p className="filter-section-title">Sort Results By</p>
        <select
          value={sortBy}
          onChange={(e) => updateParam("sortBy", e.target.value || null)}
          className="filter-select"
          style={{ maxWidth: 360 }}
        >
          <option value="">Recommendation score (default)</option>
          <option value="tuition-asc">Tuition: Low to High</option>
          <option value="tuition-desc">Tuition: High to Low</option>
          <option value="score-desc">Score: High to Low</option>
        </select>
      </div>

      <div className="filter-toggles">
        <label className="filter-check-label">
          <input
            type="checkbox"
            checked={alternanceOnly}
            onChange={(e) => updateParam("alternanceOnly", e.target.checked ? "true" : null)}
          />
          <span>Alternance available</span>
        </label>
        <label className="filter-check-label">
          <input
            type="checkbox"
            checked={internshipOnly}
            onChange={(e) => updateParam("internshipOnly", e.target.checked ? "true" : null)}
          />
          <span>Internship included</span>
        </label>
        <label className="filter-check-label">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => updateParam("verifiedOnly", e.target.checked ? "true" : null)}
          />
          <span>Verified programmes only</span>
        </label>
      </div>

      <TrackingFilterSection candidateSlug={candidateSlug} basePath="filter" />
    </FilterShell>
  );
}
