"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Bookmark } from "lucide-react";
import {
  BLOCKER_TAGS,
  FEASIBILITY_LABELS,
  PIPELINE_LABELS,
} from "@/lib/tracking/types";
import type {
  DecisionStatus,
  Feasibility,
  GmatRequirement,
  InterviewStatus,
  LanguageTestRequirement,
  M2Assessment,
  PipelineStatus,
  PriorityTier,
} from "@/lib/tracking/types";

interface TrackingFilterSectionProps {
  candidateSlug: string;
  basePath: "filter" | "phd";
}

const PIPELINE: PipelineStatus[] = [
  "not_started",
  "reviewing",
  "ongoing",
  "applied",
  "decision_pending",
  "accepted",
  "rejected",
  "withdrawn",
];

const FEASIBILITY: Feasibility[] = ["undecided", "possible", "not_possible"];
const PRIORITY: PriorityTier[] = ["A", "B", "C", "archived"];
const LANG: LanguageTestRequirement[] = ["ielts", "tcf", "both", "none", "waived", "unknown"];
const GMAT: GmatRequirement[] = ["required", "not_required", "optional", "unknown"];
const INTERVIEW: InterviewStatus[] = ["n_a", "invited", "done"];
const DECISION: DecisionStatus[] = ["pending", "accepted", "waitlisted", "rejected"];
const M2: M2Assessment[] = ["yes", "no", "conditional", "unclear"];

export default function TrackingFilterSection({
  candidateSlug,
  basePath,
}: TrackingFilterSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const push = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      router.push(`/${candidateSlug}/${basePath}?${params.toString()}`);
    },
    [router, searchParams, candidateSlug, basePath]
  );

  const toggleArray = (key: string, value: string) => {
    push((params) => {
      const current = params.getAll(key);
      params.delete(key);
      if (current.includes(value)) {
        current.filter((v) => v !== value).forEach((v) => params.append(key, v));
      } else {
        [...current, value].forEach((v) => params.append(key, v));
      }
    });
  };

  const setParam = (key: string, value: string | null) => {
    push((params) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
  };

  const toggleBool = (key: string, on: boolean) => {
    push((params) => {
      if (on) params.set(key, "true");
      else params.delete(key);
    });
  };

  const selected = (key: string) => searchParams.getAll(key);

  return (
    <div className="filter-section tracker-filter-section">
      <p
        className="filter-section-title"
        style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}
      >
        <Bookmark size={16} /> My application tracking
      </p>

      <div className="filter-section">
        <p className="filter-section-title">Pipeline status</p>
        <div className="filter-check-grid">
          {PIPELINE.map((p) => (
            <label key={p} className="filter-check-label">
              <input
                type="checkbox"
                checked={selected("trackPipeline").includes(p)}
                onChange={() => toggleArray("trackPipeline", p)}
              />
              <span>{PIPELINE_LABELS[p]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <p className="filter-section-title">Feasibility</p>
        <div className="filter-check-grid">
          {FEASIBILITY.map((f) => (
            <label key={f} className="filter-check-label">
              <input
                type="checkbox"
                checked={selected("trackFeasibility").includes(f)}
                onChange={() => toggleArray("trackFeasibility", f)}
              />
              <span>{FEASIBILITY_LABELS[f]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <p className="filter-section-title">Priority tier</p>
        <div className="filter-check-grid">
          {PRIORITY.map((t) => (
            <label key={t} className="filter-check-label">
              <input
                type="checkbox"
                checked={selected("trackPriority").includes(t)}
                onChange={() => toggleArray("trackPriority", t)}
              />
              <span>{t === "archived" ? "Archived" : `Tier ${t}`}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-grid-2">
        <div className="filter-section">
          <p className="filter-section-title">Language tests (your read)</p>
          <div className="filter-check-grid">
            {LANG.map((l) => (
              <label key={l} className="filter-check-label">
                <input
                  type="checkbox"
                  checked={selected("trackLangTest").includes(l)}
                  onChange={() => toggleArray("trackLangTest", l)}
                />
                <span>{l}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="filter-section">
          <p className="filter-section-title">GMAT (your read)</p>
          <div className="filter-check-grid">
            {GMAT.map((g) => (
              <label key={g} className="filter-check-label">
                <input
                  type="checkbox"
                  checked={selected("trackGmat").includes(g)}
                  onChange={() => toggleArray("trackGmat", g)}
                />
                <span>{g.replace(/_/g, " ")}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="filter-section">
        <p className="filter-section-title">Outreach</p>
        <select
          className="filter-select"
          value={searchParams.get("trackOutreach") ?? ""}
          onChange={(e) => setParam("trackOutreach", e.target.value || null)}
        >
          <option value="">Any</option>
          <option value="never_contacted">Never contacted</option>
          <option value="emailed">Emailed</option>
          <option value="linkedin">LinkedIn</option>
          <option value="got_reply">Got reply</option>
          <option value="no_reply">No reply yet</option>
        </select>
      </div>

      <div className="filter-toggles">
        <label className="filter-check-label">
          <input
            type="checkbox"
            checked={searchParams.get("trackNotReviewed") === "true"}
            onChange={(e) => toggleBool("trackNotReviewed", e.target.checked)}
          />
          <span>Not reviewed yet</span>
        </label>
        <label className="filter-check-label">
          <input
            type="checkbox"
            checked={searchParams.get("trackHasComment") === "true"}
            onChange={(e) => toggleBool("trackHasComment", e.target.checked)}
          />
          <span>Has comment</span>
        </label>
        <label className="filter-check-label">
          <input
            type="checkbox"
            checked={searchParams.get("trackHasBlockers") === "true"}
            onChange={(e) => toggleBool("trackHasBlockers", e.target.checked)}
          />
          <span>Has blockers</span>
        </label>
        <label className="filter-check-label">
          <input
            type="checkbox"
            checked={searchParams.get("trackDocsIncomplete") === "true"}
            onChange={(e) => toggleBool("trackDocsIncomplete", e.target.checked)}
          />
          <span>Docs incomplete</span>
        </label>
        <label className="filter-check-label">
          <input
            type="checkbox"
            checked={searchParams.get("trackDocsReady") === "true"}
            onChange={(e) => toggleBool("trackDocsReady", e.target.checked)}
          />
          <span>Docs ready</span>
        </label>
        {basePath === "filter" && (
          <label className="filter-check-label">
            <input
              type="checkbox"
              checked={searchParams.get("trackAlternance") === "true"}
              onChange={(e) => toggleBool("trackAlternance", e.target.checked)}
            />
            <span>Want alternance</span>
          </label>
        )}
      </div>

      <div className="filter-grid-2">
        <label className="tracker-field">
          <span className="filter-section-title">Deadline within (days)</span>
          <select
            className="filter-select"
            value={searchParams.get("trackDeadlineDays") ?? ""}
            onChange={(e) => setParam("trackDeadlineDays", e.target.value || null)}
          >
            <option value="">Any</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </label>
        <label className="tracker-field">
          <span className="filter-section-title">Target intake</span>
          <input
            className="tracker-input"
            placeholder="2026-09"
            value={searchParams.get("trackIntake") ?? ""}
            onChange={(e) => setParam("trackIntake", e.target.value || null)}
          />
        </label>
        <label className="tracker-field">
          <span className="filter-section-title">Test prep</span>
          <select
            className="filter-select"
            value={searchParams.get("trackTestPrep") ?? ""}
            onChange={(e) => setParam("trackTestPrep", e.target.value || null)}
          >
            <option value="">Any</option>
            <option value="ielts_done">IELTS done</option>
            <option value="tcf_done">TCF done</option>
            <option value="gmat_done">GMAT done</option>
            <option value="tests_complete">All needed tests done</option>
          </select>
        </label>
        <label className="tracker-field">
          <span className="filter-section-title">Blocker tag</span>
          <select
            className="filter-select"
            value={searchParams.get("trackBlocker") ?? ""}
            onChange={(e) => setParam("trackBlocker", e.target.value || null)}
          >
            <option value="">Any</option>
            {BLOCKER_TAGS.map((b) => (
              <option key={b} value={b}>
                {b.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="filter-section">
        <p className="filter-section-title">Interview status</p>
        <div className="filter-check-grid">
          {INTERVIEW.map((i) => (
            <label key={i} className="filter-check-label">
              <input
                type="checkbox"
                checked={selected("trackInterview").includes(i)}
                onChange={() => toggleArray("trackInterview", i)}
              />
              <span>{i.replace(/_/g, " ")}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <p className="filter-section-title">Decision</p>
        <div className="filter-check-grid">
          {DECISION.map((d) => (
            <label key={d} className="filter-check-label">
              <input
                type="checkbox"
                checked={selected("trackDecision").includes(d)}
                onChange={() => toggleArray("trackDecision", d)}
              />
              <span>{d}</span>
            </label>
          ))}
        </div>
      </div>

      {basePath === "filter" && (
        <div className="filter-section">
          <p className="filter-section-title">Direct M2 (your assessment)</p>
          <div className="filter-check-grid">
            {M2.map((m) => (
              <label key={m} className="filter-check-label">
                <input
                  type="checkbox"
                  checked={selected("trackM2").includes(m)}
                  onChange={() => toggleArray("trackM2", m)}
                />
                <span>{m}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
