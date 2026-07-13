import type { ProgramTracking, PhdTracking, TrackingFilterCriteria } from "./types";
import {
  hasOutreachEmail,
  hasOutreachLinkedIn,
  hasOutreachNoReply,
  hasOutreachReply,
  isDocumentsIncomplete,
  isDocumentsReady,
  isNotReviewed,
  testsComplete,
} from "./types";

function matchesOutreachFilter(
  events: { channel: string; outcome: string }[],
  outreach: NonNullable<TrackingFilterCriteria["outreach"]>
): boolean {
  const ev = events as import("./types").OutreachEvent[];
  switch (outreach) {
    case "never_contacted":
      return events.length === 0;
    case "emailed":
      return hasOutreachEmail(ev);
    case "linkedin":
      return hasOutreachLinkedIn(ev);
    case "got_reply":
      return hasOutreachReply(ev);
    case "no_reply":
      return hasOutreachNoReply(ev);
    default:
      return true;
  }
}

type OutreachEventLike = { channel: string; outcome: string };

function matchesDeadlineWithinDays(
  personalDeadline: string | null,
  days: number
): boolean {
  if (!personalDeadline) return false;
  const d = new Date(personalDeadline);
  if (Number.isNaN(d.getTime())) return false;
  const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}

export function matchesProgramTrackingFilter(
  tracking: ProgramTracking | undefined,
  criteria: TrackingFilterCriteria
): boolean {
  const hasAnyCriteria = Object.values(criteria).some(
    (v) => v !== undefined && v !== false && !(Array.isArray(v) && v.length === 0)
  );
  if (!hasAnyCriteria) return true;
  if (!tracking) return criteria.notReviewed === true;

  if (criteria.pipelineStatus?.length && !criteria.pipelineStatus.includes(tracking.pipelineStatus)) {
    return false;
  }
  if (criteria.feasibility?.length && !criteria.feasibility.includes(tracking.feasibility)) {
    return false;
  }
  if (criteria.priorityTier?.length) {
    if (!tracking.priorityTier || !criteria.priorityTier.includes(tracking.priorityTier)) {
      return false;
    }
  }
  if (
    criteria.languageTestRequirement?.length &&
    !criteria.languageTestRequirement.includes(tracking.languageTestRequirement)
  ) {
    return false;
  }
  if (
    criteria.gmatRequirement?.length &&
    !criteria.gmatRequirement.includes(tracking.gmatRequirement)
  ) {
    return false;
  }
  if (criteria.outreach && !matchesOutreachFilter(tracking.outreachEvents, criteria.outreach)) {
    return false;
  }
  if (criteria.hasBlockers && tracking.blockers.length === 0) return false;
  if (criteria.blockerTag && !tracking.blockers.includes(criteria.blockerTag)) return false;
  if (criteria.notReviewed && !isNotReviewed(tracking)) return false;
  if (criteria.hasComment && !tracking.comment.trim() && !tracking.privateNote.trim()) {
    return false;
  }
  if (criteria.targetIntake && tracking.targetIntake !== criteria.targetIntake) return false;
  if (
    criteria.deadlineWithinDays != null &&
    !matchesDeadlineWithinDays(tracking.personalDeadline, criteria.deadlineWithinDays)
  ) {
    return false;
  }
  if (criteria.testPrep === "ielts_done" && tracking.testPrep.ielts !== "done") return false;
  if (criteria.testPrep === "tcf_done" && tracking.testPrep.tcf !== "done") return false;
  if (criteria.testPrep === "gmat_done" && tracking.testPrep.gmat !== "done") return false;
  if (criteria.testPrep === "tests_complete" && !testsComplete(tracking.testPrep)) return false;
  if (criteria.docsIncomplete && !isDocumentsIncomplete(tracking.documents)) return false;
  if (criteria.docsReady && !isDocumentsReady(tracking.documents)) return false;
  if (
    criteria.interviewStatus?.length &&
    !criteria.interviewStatus.includes(tracking.interviewStatus)
  ) {
    return false;
  }
  if (
    criteria.decisionStatus?.length &&
    !criteria.decisionStatus.includes(tracking.decisionStatus)
  ) {
    return false;
  }
  if (
    criteria.m2Assessment?.length &&
    !criteria.m2Assessment.includes(tracking.m2Assessment)
  ) {
    return false;
  }
  if (criteria.alternanceWanted === true && !tracking.alternanceWanted) return false;

  return true;
}

export function matchesPhdTrackingFilter(
  tracking: PhdTracking | undefined,
  criteria: TrackingFilterCriteria
): boolean {
  const phdCriteria = { ...criteria };
  delete (phdCriteria as { m2Assessment?: unknown }).m2Assessment;
  delete (phdCriteria as { alternanceWanted?: unknown }).alternanceWanted;
  return matchesProgramTrackingFilter(
    tracking as ProgramTracking | undefined,
    phdCriteria
  );
}

export function parseTrackingFilterFromSearchParams(
  sp: Record<string, string | string[] | undefined>
): TrackingFilterCriteria {
  const arr = (key: string) => {
    const v = sp[key];
    if (!v) return undefined;
    return Array.isArray(v) ? v : [v];
  };

  const num = (key: string) => {
    const v = sp[key];
    if (!v || Array.isArray(v)) return undefined;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? undefined : n;
  };

  return {
    pipelineStatus: arr("trackPipeline") as TrackingFilterCriteria["pipelineStatus"],
    feasibility: arr("trackFeasibility") as TrackingFilterCriteria["feasibility"],
    priorityTier: arr("trackPriority") as TrackingFilterCriteria["priorityTier"],
    languageTestRequirement: arr("trackLangTest") as TrackingFilterCriteria["languageTestRequirement"],
    gmatRequirement: arr("trackGmat") as TrackingFilterCriteria["gmatRequirement"],
    outreach: sp.trackOutreach as TrackingFilterCriteria["outreach"],
    hasBlockers: sp.trackHasBlockers === "true",
    blockerTag: sp.trackBlocker as string | undefined,
    notReviewed: sp.trackNotReviewed === "true",
    hasComment: sp.trackHasComment === "true",
    targetIntake: sp.trackIntake as string | undefined,
    deadlineWithinDays: num("trackDeadlineDays"),
    testPrep: sp.trackTestPrep as TrackingFilterCriteria["testPrep"],
    docsIncomplete: sp.trackDocsIncomplete === "true",
    docsReady: sp.trackDocsReady === "true",
    interviewStatus: arr("trackInterview") as TrackingFilterCriteria["interviewStatus"],
    decisionStatus: arr("trackDecision") as TrackingFilterCriteria["decisionStatus"],
    m2Assessment: arr("trackM2") as TrackingFilterCriteria["m2Assessment"],
    alternanceWanted: sp.trackAlternance === "true" ? true : undefined,
  };
}

export function countActiveTrackingFilters(criteria: TrackingFilterCriteria): number {
  let n = 0;
  if (criteria.pipelineStatus?.length) n++;
  if (criteria.feasibility?.length) n++;
  if (criteria.priorityTier?.length) n++;
  if (criteria.languageTestRequirement?.length) n++;
  if (criteria.gmatRequirement?.length) n++;
  if (criteria.outreach) n++;
  if (criteria.hasBlockers) n++;
  if (criteria.blockerTag) n++;
  if (criteria.notReviewed) n++;
  if (criteria.hasComment) n++;
  if (criteria.targetIntake) n++;
  if (criteria.deadlineWithinDays != null) n++;
  if (criteria.testPrep) n++;
  if (criteria.docsIncomplete) n++;
  if (criteria.docsReady) n++;
  if (criteria.interviewStatus?.length) n++;
  if (criteria.decisionStatus?.length) n++;
  if (criteria.m2Assessment?.length) n++;
  if (criteria.alternanceWanted) n++;
  return n;
}
