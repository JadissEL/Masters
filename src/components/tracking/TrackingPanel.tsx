"use client";

import { useEffect, useState } from "react";
import type {
  DecisionStatus,
  Feasibility,
  GmatRequirement,
  InterviewStatus,
  LanguageTestRequirement,
  M2Assessment,
  OutreachChannel,
  OutreachOutcome,
  PhdTracking,
  PipelineStatus,
  PriorityTier,
  ProgramTracking,
  TestPrepStatus,
} from "@/lib/tracking/types";
import {
  BLOCKER_TAGS,
  FEASIBILITY_LABELS,
  PIPELINE_LABELS,
} from "@/lib/tracking/types";

type TrackingData = ProgramTracking | PhdTracking;

interface TrackingPanelProps {
  candidateSlug: string;
  mode: "program" | "phd";
  entityId: number | string;
  initial?: TrackingData | null;
  onSave: (patch: Partial<TrackingData>) => Promise<TrackingData>;
  onAddOutreach: (event: {
    date: string;
    channel: OutreachChannel;
    contactName?: string;
    outcome: OutreachOutcome;
    note?: string;
  }) => Promise<TrackingData>;
  onDeleteOutreach: (eventId: string) => Promise<TrackingData>;
}

const PIPELINE_OPTIONS: PipelineStatus[] = [
  "not_started",
  "reviewing",
  "ongoing",
  "applied",
  "decision_pending",
  "accepted",
  "rejected",
  "withdrawn",
];

const FEASIBILITY_OPTIONS: Feasibility[] = ["undecided", "possible", "not_possible"];
const PRIORITY_OPTIONS: PriorityTier[] = ["A", "B", "C", "archived"];
const LANG_TEST_OPTIONS: LanguageTestRequirement[] = [
  "unknown",
  "none",
  "ielts",
  "tcf",
  "both",
  "waived",
];
const GMAT_OPTIONS: GmatRequirement[] = ["unknown", "required", "not_required", "optional"];
const TEST_PREP: TestPrepStatus[] = ["not_needed", "planned", "booked", "done"];
const INTERVIEW_OPTIONS: InterviewStatus[] = ["n_a", "invited", "done"];
const DECISION_OPTIONS: DecisionStatus[] = ["pending", "accepted", "waitlisted", "rejected"];
const M2_OPTIONS: M2Assessment[] = ["unclear", "yes", "no", "conditional"];

export default function TrackingPanel({
  mode,
  initial,
  onSave,
  onAddOutreach,
  onDeleteOutreach,
}: TrackingPanelProps) {
  const [data, setData] = useState<TrackingData | null>(initial ?? null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const [outreachDate, setOutreachDate] = useState("");
  const [outreachChannel, setOutreachChannel] = useState<OutreachChannel>("email");
  const [outreachContact, setOutreachContact] = useState("");
  const [outreachOutcome, setOutreachOutcome] = useState<OutreachOutcome>("no_reply");
  const [outreachNote, setOutreachNote] = useState("");

  useEffect(() => {
    if (initial) setData(initial);
  }, [initial]);

  const patch = async (p: Partial<TrackingData>) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await onSave(p);
      setData(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof TrackingData>(key: K, value: TrackingData[K]) => {
    if (!data) return;
    setData({ ...data, [key]: value });
    void patch({ [key]: value } as Partial<TrackingData>);
  };

  const toggleBlocker = (tag: string) => {
    if (!data) return;
    const blockers = data.blockers.includes(tag)
      ? data.blockers.filter((b) => b !== tag)
      : [...data.blockers, tag];
    update("blockers", blockers);
  };

  const updateDocuments = (patch: Partial<ProgramTracking["documents"]>) => {
    if (!data) return;
    update("documents", { ...data.documents, ...patch });
  };

  const submitOutreach = async () => {
    if (!outreachDate) return;
    setSaving(true);
    try {
      const updated = await onAddOutreach({
        date: outreachDate,
        channel: outreachChannel,
        contactName: outreachContact || undefined,
        outcome: outreachOutcome,
        note: outreachNote || undefined,
      });
      setData(updated);
      setOutreachDate("");
      setOutreachContact("");
      setOutreachNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add outreach");
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <div className="tracker-panel card">
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading tracker…</p>
      </div>
    );
  }

  const program = mode === "program" ? (data as ProgramTracking) : null;
  const phd = mode === "phd" ? (data as PhdTracking) : null;

  return (
    <div className="tracker-panel card">
      <button
        type="button"
        className="tracker-panel-toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span style={{ fontWeight: 600, fontSize: 16 }}>Application tracker</span>
        <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span className={`badge tracker-badge-${data.pipelineStatus}`}>
            {PIPELINE_LABELS[data.pipelineStatus]}
          </span>
          {data.priorityTier && (
            <span className="badge badge-accent">Tier {data.priorityTier}</span>
          )}
          {saved && <span className="badge badge-success">Saved</span>}
        </span>
      </button>

      {expanded && (
        <div className="tracker-panel-body">
          {error && (
            <p className="tracker-error" role="alert">
              {error}
            </p>
          )}

          <section className="tracker-section">
            <h4 className="tracker-section-title">Pipeline</h4>
            <div className="tracker-grid-2">
              <label className="tracker-field">
                <span>Status</span>
                <select
                  className="filter-select"
                  value={data.pipelineStatus}
                  onChange={(e) => update("pipelineStatus", e.target.value as PipelineStatus)}
                >
                  {PIPELINE_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {PIPELINE_LABELS[o]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="tracker-field">
                <span>Feasibility</span>
                <select
                  className="filter-select"
                  value={data.feasibility}
                  onChange={(e) => update("feasibility", e.target.value as Feasibility)}
                >
                  {FEASIBILITY_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {FEASIBILITY_LABELS[o]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="tracker-field">
                <span>Priority</span>
                <select
                  className="filter-select"
                  value={data.priorityTier ?? ""}
                  onChange={(e) =>
                    update("priorityTier", (e.target.value || null) as PriorityTier | null)
                  }
                >
                  <option value="">None</option>
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o === "archived" ? "Archived" : `Tier ${o}`}
                    </option>
                  ))}
                </select>
              </label>
              <label className="tracker-field">
                <span>Target intake</span>
                <input
                  className="tracker-input"
                  placeholder="e.g. 2026-09"
                  value={data.targetIntake ?? ""}
                  onChange={(e) => update("targetIntake", e.target.value || null)}
                />
              </label>
              <label className="tracker-field">
                <span>Personal deadline</span>
                <input
                  type="date"
                  className="tracker-input"
                  value={data.personalDeadline?.slice(0, 10) ?? ""}
                  onChange={(e) => update("personalDeadline", e.target.value || null)}
                />
              </label>
            </div>
          </section>

          <section className="tracker-section">
            <h4 className="tracker-section-title">Requirements (your assessment)</h4>
            <div className="tracker-grid-2">
              <label className="tracker-field">
                <span>Language tests</span>
                <select
                  className="filter-select"
                  value={data.languageTestRequirement}
                  onChange={(e) =>
                    update("languageTestRequirement", e.target.value as LanguageTestRequirement)
                  }
                >
                  {LANG_TEST_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="tracker-field">
                <span>GMAT</span>
                <select
                  className="filter-select"
                  value={data.gmatRequirement}
                  onChange={(e) =>
                    update("gmatRequirement", e.target.value as GmatRequirement)
                  }
                >
                  {GMAT_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
              {program && (
                <>
                  <label className="tracker-field">
                    <span>Direct M2 entry</span>
                    <select
                      className="filter-select"
                      value={program.m2Assessment}
                      onChange={(e) =>
                        void patch({ m2Assessment: e.target.value as M2Assessment })
                      }
                    >
                      {M2_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="filter-check-label">
                    <input
                      type="checkbox"
                      checked={program.alternanceWanted}
                      onChange={(e) => void patch({ alternanceWanted: e.target.checked })}
                    />
                    <span>Want alternance</span>
                  </label>
                </>
              )}
              {phd && (
                <>
                  <label className="filter-check-label">
                    <input
                      type="checkbox"
                      checked={phd.supervisorContacted}
                      onChange={(e) => void patch({ supervisorContacted: e.target.checked })}
                    />
                    <span>Supervisor contacted</span>
                  </label>
                  <label className="filter-check-label">
                    <input
                      type="checkbox"
                      checked={phd.fundingConfirmed}
                      onChange={(e) => void patch({ fundingConfirmed: e.target.checked })}
                    />
                    <span>Funding confirmed</span>
                  </label>
                </>
              )}
            </div>
          </section>

          <section className="tracker-section">
            <h4 className="tracker-section-title">Test prep</h4>
            <div className="tracker-grid-3">
              {(["ielts", "tcf", "gmat"] as const).map((test) => (
                <div key={test} className="tracker-test-block">
                  <label className="tracker-field">
                    <span>{test.toUpperCase()}</span>
                    <select
                      className="filter-select"
                      value={data.testPrep[test]}
                      onChange={(e) =>
                        update("testPrep", {
                          ...data.testPrep,
                          [test]: e.target.value as TestPrepStatus,
                        })
                      }
                    >
                      {TEST_PREP.map((o) => (
                        <option key={o} value={o}>
                          {o.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </label>
                  <input
                    className="tracker-input"
                    placeholder="Score"
                    value={
                      test === "ielts"
                        ? data.testPrep.ieltsScore ?? ""
                        : test === "tcf"
                          ? data.testPrep.tcfScore ?? ""
                          : data.testPrep.gmatScore ?? ""
                    }
                    onChange={(e) => {
                      const key =
                        test === "ielts"
                          ? "ieltsScore"
                          : test === "tcf"
                            ? "tcfScore"
                            : "gmatScore";
                      update("testPrep", {
                        ...data.testPrep,
                        [key]: e.target.value || undefined,
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="tracker-section">
            <h4 className="tracker-section-title">Documents</h4>
            <div className="tracker-docs">
              {(
                [
                  ["cv", "CV"],
                  ["motivationLetter", "Motivation letter"],
                  ["transcripts", "Transcripts"],
                  ["passportScan", "Passport scan"],
                  ["applicationFeePaid", "Application fee paid"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="filter-check-label">
                  <input
                    type="checkbox"
                    checked={data.documents[key]}
                    onChange={() => updateDocuments({ [key]: !data.documents[key] })}
                  />
                  <span>{label}</span>
                </label>
              ))}
              <label className="tracker-field">
                <span>Recommendation letters</span>
                <select
                  className="filter-select"
                  value={data.documents.recLetters}
                  onChange={(e) =>
                    updateDocuments({
                      recLetters: parseInt(e.target.value, 10) as 0 | 1 | 2,
                    })
                  }
                >
                  <option value={0}>0 / 2</option>
                  <option value={1}>1 / 2</option>
                  <option value={2}>2 / 2</option>
                </select>
              </label>
            </div>
          </section>

          <section className="tracker-section">
            <h4 className="tracker-section-title">Outreach log</h4>
            {data.outreachEvents.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted)" }}>No outreach recorded yet.</p>
            ) : (
              <ul className="tracker-outreach-list">
                {data.outreachEvents.map((ev) => (
                  <li key={ev.id}>
                    <strong>{ev.date}</strong> · {ev.channel}
                    {ev.contactName ? ` · ${ev.contactName}` : ""} · {ev.outcome.replace(/_/g, " ")}
                    {ev.note ? ` — ${ev.note}` : ""}
                    <button
                      type="button"
                      className="tracker-link-btn"
                      onClick={() => void onDeleteOutreach(ev.id).then(setData)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="tracker-outreach-form tracker-grid-2">
              <label className="tracker-field">
                <span>Date</span>
                <input
                  type="date"
                  className="tracker-input"
                  value={outreachDate}
                  onChange={(e) => setOutreachDate(e.target.value)}
                />
              </label>
              <label className="tracker-field">
                <span>Channel</span>
                <select
                  className="filter-select"
                  value={outreachChannel}
                  onChange={(e) => setOutreachChannel(e.target.value as OutreachChannel)}
                >
                  <option value="email">Email</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="phone">Phone</option>
                  <option value="portal_message">Portal message</option>
                </select>
              </label>
              <label className="tracker-field">
                <span>Contact name</span>
                <input
                  className="tracker-input"
                  value={outreachContact}
                  onChange={(e) => setOutreachContact(e.target.value)}
                />
              </label>
              <label className="tracker-field">
                <span>Outcome</span>
                <select
                  className="filter-select"
                  value={outreachOutcome}
                  onChange={(e) => setOutreachOutcome(e.target.value as OutreachOutcome)}
                >
                  <option value="no_reply">No reply</option>
                  <option value="replied">Replied</option>
                  <option value="meeting_scheduled">Meeting scheduled</option>
                  <option value="not_interested">Not interested</option>
                </select>
              </label>
              <label className="tracker-field" style={{ gridColumn: "1 / -1" }}>
                <span>Note</span>
                <input
                  className="tracker-input"
                  value={outreachNote}
                  onChange={(e) => setOutreachNote(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!outreachDate || saving}
                onClick={() => void submitOutreach()}
              >
                Add outreach
              </button>
            </div>
          </section>

          <section className="tracker-section">
            <h4 className="tracker-section-title">Post-application</h4>
            <div className="tracker-grid-2">
              <label className="tracker-field">
                <span>Interview</span>
                <select
                  className="filter-select"
                  value={data.interviewStatus}
                  onChange={(e) =>
                    update("interviewStatus", e.target.value as InterviewStatus)
                  }
                >
                  {INTERVIEW_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="tracker-field">
                <span>Decision</span>
                <select
                  className="filter-select"
                  value={data.decisionStatus}
                  onChange={(e) =>
                    update("decisionStatus", e.target.value as DecisionStatus)
                  }
                >
                  {DECISION_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
              <label className="filter-check-label">
                <input
                  type="checkbox"
                  checked={data.scholarshipApplied}
                  onChange={(e) => update("scholarshipApplied", e.target.checked)}
                />
                <span>Scholarship applied</span>
              </label>
              <label className="tracker-field">
                <span>Scholarship result</span>
                <input
                  className="tracker-input"
                  value={data.scholarshipResult ?? ""}
                  onChange={(e) => update("scholarshipResult", e.target.value || null)}
                />
              </label>
              {program && (
                <label className="tracker-field">
                  <span>Application fee (€)</span>
                  <input
                    type="number"
                    className="tracker-input"
                    value={program.applicationFeeAmount ?? ""}
                    onChange={(e) =>
                      void patch({
                        applicationFeeAmount: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                  />
                </label>
              )}
            </div>
          </section>

          <section className="tracker-section">
            <h4 className="tracker-section-title">Blockers</h4>
            <div className="tracker-blockers">
              {BLOCKER_TAGS.map((tag) => (
                <label key={tag} className="filter-check-label">
                  <input
                    type="checkbox"
                    checked={data.blockers.includes(tag)}
                    onChange={() => toggleBlocker(tag)}
                  />
                  <span>{tag.replace(/_/g, " ")}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="tracker-section">
            <h4 className="tracker-section-title">Notes</h4>
            <label className="tracker-field">
              <span>Pros (one per line)</span>
              <textarea
                className="tracker-textarea"
                rows={2}
                value={data.pros.join("\n")}
                onChange={(e) =>
                  update("pros", e.target.value.split("\n").filter(Boolean))
                }
              />
            </label>
            <label className="tracker-field">
              <span>Cons (one per line)</span>
              <textarea
                className="tracker-textarea"
                rows={2}
                value={data.cons.join("\n")}
                onChange={(e) =>
                  update("cons", e.target.value.split("\n").filter(Boolean))
                }
              />
            </label>
            <label className="tracker-field">
              <span>Comment</span>
              <textarea
                className="tracker-textarea"
                rows={3}
                value={data.comment}
                onChange={(e) => update("comment", e.target.value)}
              />
            </label>
            <label className="tracker-field">
              <span>Private note</span>
              <textarea
                className="tracker-textarea"
                rows={2}
                value={data.privateNote}
                onChange={(e) => update("privateNote", e.target.value)}
              />
            </label>
          </section>

          <p style={{ fontSize: 12, color: "var(--muted)" }}>
            Last updated {new Date(data.lastUpdatedAt).toLocaleString()}
            {saving ? " · Saving…" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
