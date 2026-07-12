"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { PhdCountryMeta } from "@/lib/phd-store";

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

  const hasActive =
    selectedCountries.length > 0 ||
    selectedFunding.length > 0 ||
    selectedDomains.length > 0 ||
    selectedLanguages.length > 0 ||
    !fundedOnly ||
    urgent;

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
          <SlidersHorizontal size={18} /> PhD Filters
        </h3>
        {hasActive && (
          <button
            onClick={clearAll}
            className="btn btn-secondary"
            style={{ padding: "6px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}
          >
            <X size={14} /> Clear all
          </button>
        )}
      </div>

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
              <span>
                {c.flag} {c.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--muted)" }}>Funding type</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 0 }}>
          {fundingTypes.map((f) => (
            <label key={f} style={checkboxStyle}>
              <input
                type="checkbox"
                checked={selectedFunding.includes(f)}
                onChange={() => toggleArrayParam("funding", f)}
                style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
              />
              <span>{f.replace(/_/g, " ")}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--muted)" }}>Research domains</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 0 }}>
          {domains.slice(0, 24).map((d) => (
            <label key={d} style={checkboxStyle}>
              <input
                type="checkbox"
                checked={selectedDomains.includes(d)}
                onChange={() => toggleArrayParam("domain", d)}
                style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
              />
              <span>{d}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--muted)" }}>Teaching language</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 0 }}>
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

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <label style={checkboxStyle}>
          <input
            type="checkbox"
            checked={fundedOnly}
            onChange={(e) => updateParam("fundedOnly", e.target.checked ? null : "false")}
            style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
          />
          <span>Funded / scholarship only</span>
        </label>
        <label style={checkboxStyle}>
          <input
            type="checkbox"
            checked={urgent}
            onChange={(e) => updateParam("urgent", e.target.checked ? "true" : null)}
            style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
          />
          <span>Urgent deadlines (next 30 days)</span>
        </label>
      </div>
    </div>
  );
}
