export type PipelineStatus =
  | "not_started"
  | "reviewing"
  | "ongoing"
  | "applied"
  | "decision_pending"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type Feasibility = "undecided" | "possible" | "not_possible";

export type PriorityTier = "A" | "B" | "C" | "archived";

export type LanguageTestRequirement =
  | "none"
  | "ielts"
  | "tcf"
  | "both"
  | "waived"
  | "unknown";

export type GmatRequirement = "required" | "not_required" | "optional" | "unknown";

export type TestPrepStatus = "not_needed" | "planned" | "booked" | "done";

export type M2Assessment = "yes" | "no" | "conditional" | "unclear";

export type InterviewStatus = "n_a" | "invited" | "done";

export type DecisionStatus = "pending" | "accepted" | "waitlisted" | "rejected";

export type OutreachChannel = "email" | "linkedin" | "phone" | "portal_message";

export type OutreachOutcome =
  | "no_reply"
  | "replied"
  | "meeting_scheduled"
  | "not_interested";

export const BLOCKER_TAGS = [
  "waiting_transcript",
  "waiting_prof_reply",
  "needs_french_translation",
  "deadline_passed",
  "needs_m1_first",
  "budget_too_high",
  "missing_documents",
  "visa_concern",
] as const;

export type BlockerTag = (typeof BLOCKER_TAGS)[number];

export interface OutreachEvent {
  id: string;
  date: string;
  channel: OutreachChannel;
  contactName?: string;
  outcome: OutreachOutcome;
  note?: string;
}

export interface DocumentChecklist {
  cv: boolean;
  motivationLetter: boolean;
  transcripts: boolean;
  recLetters: 0 | 1 | 2;
  passportScan: boolean;
  applicationFeePaid: boolean;
}

export interface TestPrep {
  ielts: TestPrepStatus;
  ieltsScore?: string;
  tcf: TestPrepStatus;
  tcfScore?: string;
  gmat: TestPrepStatus;
  gmatScore?: string;
}

export interface ProgramTracking {
  programId: number;
  candidateSlug: string;
  feasibility: Feasibility;
  pipelineStatus: PipelineStatus;
  languageTestRequirement: LanguageTestRequirement;
  gmatRequirement: GmatRequirement;
  comment: string;
  pros: string[];
  cons: string[];
  privateNote: string;
  priorityTier: PriorityTier | null;
  blockers: string[];
  targetIntake: string | null;
  personalDeadline: string | null;
  documents: DocumentChecklist;
  testPrep: TestPrep;
  interviewStatus: InterviewStatus;
  decisionStatus: DecisionStatus;
  scholarshipApplied: boolean;
  scholarshipResult: string | null;
  m2Assessment: M2Assessment;
  alternanceWanted: boolean;
  applicationFeeAmount: number | null;
  outreachEvents: OutreachEvent[];
  firstReviewedAt: string | null;
  lastUpdatedAt: string;
  createdAt: string;
}

export interface PhdTracking {
  offerId: string;
  candidateSlug: string;
  feasibility: Feasibility;
  pipelineStatus: PipelineStatus;
  languageTestRequirement: LanguageTestRequirement;
  gmatRequirement: GmatRequirement;
  comment: string;
  pros: string[];
  cons: string[];
  privateNote: string;
  priorityTier: PriorityTier | null;
  blockers: string[];
  targetIntake: string | null;
  personalDeadline: string | null;
  documents: DocumentChecklist;
  testPrep: TestPrep;
  interviewStatus: InterviewStatus;
  decisionStatus: DecisionStatus;
  scholarshipApplied: boolean;
  scholarshipResult: string | null;
  supervisorContacted: boolean;
  fundingConfirmed: boolean;
  outreachEvents: OutreachEvent[];
  firstReviewedAt: string | null;
  lastUpdatedAt: string;
  createdAt: string;
}

export interface TrackingDatabase {
  version: 1;
  programTracking: ProgramTracking[];
  phdTracking: PhdTracking[];
}

export interface TrackingFilterCriteria {
  pipelineStatus?: PipelineStatus[];
  feasibility?: Feasibility[];
  priorityTier?: PriorityTier[];
  languageTestRequirement?: LanguageTestRequirement[];
  gmatRequirement?: GmatRequirement[];
  outreach?: "never_contacted" | "emailed" | "linkedin" | "got_reply" | "no_reply";
  hasBlockers?: boolean;
  blockerTag?: string;
  notReviewed?: boolean;
  hasComment?: boolean;
  targetIntake?: string;
  deadlineWithinDays?: number;
  testPrep?: "ielts_done" | "tcf_done" | "gmat_done" | "tests_complete";
  docsIncomplete?: boolean;
  docsReady?: boolean;
  interviewStatus?: InterviewStatus[];
  decisionStatus?: DecisionStatus[];
  m2Assessment?: M2Assessment[];
  alternanceWanted?: boolean;
}

export const PIPELINE_LABELS: Record<PipelineStatus, string> = {
  not_started: "Not started",
  reviewing: "Reviewing",
  ongoing: "Ongoing",
  applied: "Applied",
  decision_pending: "Decision pending",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const FEASIBILITY_LABELS: Record<Feasibility, string> = {
  undecided: "Undecided",
  possible: "Possible",
  not_possible: "Not possible",
};

export function defaultDocuments(): DocumentChecklist {
  return {
    cv: false,
    motivationLetter: false,
    transcripts: false,
    recLetters: 0,
    passportScan: false,
    applicationFeePaid: false,
  };
}

export function defaultTestPrep(): TestPrep {
  return {
    ielts: "not_needed",
    tcf: "not_needed",
    gmat: "not_needed",
  };
}

export function createDefaultProgramTracking(
  candidateSlug: string,
  programId: number
): ProgramTracking {
  const now = new Date().toISOString();
  return {
    programId,
    candidateSlug,
    feasibility: "undecided",
    pipelineStatus: "not_started",
    languageTestRequirement: "unknown",
    gmatRequirement: "unknown",
    comment: "",
    pros: [],
    cons: [],
    privateNote: "",
    priorityTier: null,
    blockers: [],
    targetIntake: null,
    personalDeadline: null,
    documents: defaultDocuments(),
    testPrep: defaultTestPrep(),
    interviewStatus: "n_a",
    decisionStatus: "pending",
    scholarshipApplied: false,
    scholarshipResult: null,
    m2Assessment: "unclear",
    alternanceWanted: false,
    applicationFeeAmount: null,
    outreachEvents: [],
    firstReviewedAt: null,
    lastUpdatedAt: now,
    createdAt: now,
  };
}

export function createDefaultPhdTracking(
  candidateSlug: string,
  offerId: string
): PhdTracking {
  const now = new Date().toISOString();
  return {
    offerId,
    candidateSlug,
    feasibility: "undecided",
    pipelineStatus: "not_started",
    languageTestRequirement: "unknown",
    gmatRequirement: "unknown",
    comment: "",
    pros: [],
    cons: [],
    privateNote: "",
    priorityTier: null,
    blockers: [],
    targetIntake: null,
    personalDeadline: null,
    documents: defaultDocuments(),
    testPrep: defaultTestPrep(),
    interviewStatus: "n_a",
    decisionStatus: "pending",
    scholarshipApplied: false,
    scholarshipResult: null,
    supervisorContacted: false,
    fundingConfirmed: false,
    outreachEvents: [],
    firstReviewedAt: null,
    lastUpdatedAt: now,
    createdAt: now,
  };
}

export function isDocumentsReady(d: DocumentChecklist): boolean {
  return (
    d.cv &&
    d.motivationLetter &&
    d.transcripts &&
    d.recLetters >= 2 &&
    d.passportScan &&
    d.applicationFeePaid
  );
}

export function isDocumentsIncomplete(d: DocumentChecklist): boolean {
  return !isDocumentsReady(d);
}

export function hasOutreachEmail(events: OutreachEvent[]): boolean {
  return events.some((e) => e.channel === "email");
}

export function hasOutreachLinkedIn(events: OutreachEvent[]): boolean {
  return events.some((e) => e.channel === "linkedin");
}

export function hasOutreachReply(events: OutreachEvent[]): boolean {
  return events.some(
    (e) => e.outcome === "replied" || e.outcome === "meeting_scheduled"
  );
}

export function hasOutreachNoReply(events: OutreachEvent[]): boolean {
  return events.some((e) => e.outcome === "no_reply");
}

export function testsComplete(tp: TestPrep): boolean {
  const needIelts = tp.ielts !== "not_needed";
  const needTcf = tp.tcf !== "not_needed";
  const needGmat = tp.gmat !== "not_needed";
  if (needIelts && tp.ielts !== "done") return false;
  if (needTcf && tp.tcf !== "done") return false;
  if (needGmat && tp.gmat !== "done") return false;
  return needIelts || needTcf || needGmat;
}

export function isNotReviewed(t: { pipelineStatus: PipelineStatus; firstReviewedAt: string | null }): boolean {
  return t.pipelineStatus === "not_started" && !t.firstReviewedAt;
}
