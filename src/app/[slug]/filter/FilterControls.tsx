"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { SCHOOL_TYPES, SCHOOL_TYPE_DESCRIPTIONS } from "@/lib/school-types";

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
      // Remove it
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

  const hasActiveFilters = selectedCountries.length > 0 || selectedLanguages.length > 0 ||
    selectedProgramTypes.length > 0 || selectedSchoolTypes.length > 0 || canEnterM2 || maxTuition || minScore || alternanceOnly || internshipOnly || verifiedOnly || sortBy;

  const checkboxStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 0",
    cursor: "pointer",
    fontSize: 14,
  };

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
          <SlidersHorizontal size={18} /> Filters
        </h3>
        {hasActiveFilters && (
          <button onClick={clearAll} className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
            <X size={14} /> Clear all
          </button>
        )}
      </div>

      {/* Countries */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--muted)" }}>Countries</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 0 }}>
          {countries.map((c) => (
            <label key={c.slug} style={checkboxStyle}>
              <input
                type="checkbox"
                checked={selectedCountries.includes(c.slug)}
                onChange={() => toggleArrayParam("country", c.slug)}
                style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
              />
              <span>{c.flag} {c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* School type */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--muted)" }}>School Type</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 0 }}>
          {SCHOOL_TYPES.map((t) => (
            <label key={t} style={checkboxStyle} title={SCHOOL_TYPE_DESCRIPTIONS[t]}>
              <input
                type="checkbox"
                checked={selectedSchoolTypes.includes(t)}
                onChange={() => toggleArrayParam("schoolType", t)}
                style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
              />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Teaching Language */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--muted)" }}>Teaching Language</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 0 }}>
          {LANGUAGES.map((l) => (
            <label key={l} style={checkboxStyle}>
              <input
                type="checkbox"
                checked={selectedLanguages.includes(l)}
                onChange={() => toggleArrayParam("language", l)}
                style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
              />
              <span>{l}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Program Types */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--muted)" }}>Program Topics</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 0 }}>
          {PROGRAM_TYPES.map((p) => (
            <label key={p} style={checkboxStyle}>
              <input
                type="checkbox"
                checked={selectedProgramTypes.includes(p)}
                onChange={() => toggleArrayParam("programType", p)}
                style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
              />
              <span>{p}</span>
            </label>
          ))}
        </div>
      </div>

      {/* M2 Entry */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--muted)" }}>Direct M2 Entry</p>
        <select
          value={canEnterM2}
          onChange={(e) => updateParam("canEnterM2", e.target.value || null)}
          style={{ width: "100%", maxWidth: 300, padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 14, background: "white" }}
        >
          <option value="">Any</option>
          <option value="YES">YES — Direct M2 entry</option>
          <option value="Conditional">Conditional</option>
          <option value="NO">NO — M1 only</option>
        </select>
      </div>

      {/* Numeric filters */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--muted)" }}>Max Tuition (€)</p>
          <select
            value={maxTuition}
            onChange={(e) => updateParam("maxTuition", e.target.value || null)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 14, background: "white" }}
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
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--muted)" }}>Min Score</p>
          <select
            value={minScore}
            onChange={(e) => updateParam("minScore", e.target.value || null)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 14, background: "white" }}
          >
            <option value="">No minimum</option>
            <option value="70">70+</option>
            <option value="80">80+</option>
            <option value="85">85+</option>
            <option value="90">90+</option>
          </select>
        </div>
      </div>

      {/* Sort By */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--muted)" }}>Sort Results By</p>
        <select
          value={sortBy}
          onChange={(e) => updateParam("sortBy", e.target.value || null)}
          style={{ width: "100%", maxWidth: 300, padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 14, background: "white" }}
        >
          <option value="">Recommendation score (default)</option>
          <option value="tuition-asc">Tuition: Low to High</option>
          <option value="tuition-desc">Tuition: High to Low</option>
          <option value="score-desc">Score: High to Low</option>
        </select>
      </div>

      {/* Toggles */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <label style={checkboxStyle}>
          <input
            type="checkbox"
            checked={alternanceOnly}
            onChange={(e) => updateParam("alternanceOnly", e.target.checked ? "true" : null)}
            style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
          />
          <span>Alternance available</span>
        </label>
        <label style={checkboxStyle}>
          <input
            type="checkbox"
            checked={internshipOnly}
            onChange={(e) => updateParam("internshipOnly", e.target.checked ? "true" : null)}
            style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
          />
          <span>Internship included</span>
        </label>
        <label style={checkboxStyle}>
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => updateParam("verifiedOnly", e.target.checked ? "true" : null)}
            style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
          />
          <span>Verified programmes only</span>
        </label>
      </div>
    </div>
  );
}