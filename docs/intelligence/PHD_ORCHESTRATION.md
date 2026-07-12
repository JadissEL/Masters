# PhD Discovery Orchestration — Dina

**Candidate:** Dina — Master ENCG (Finance & Accounting), Deloitte Greece (Financial Analyst, Compliance, Healthcare)  
**Languages:** French, English, Arabic  
**Domains:** Investment Banking, M&A, Corporate Finance, PE, Asset Management, Financial Advisory, Risk, Compliance, Financial Consulting, Accounting, Healthcare finance  
**As-of date:** 2026-07-12 — only list offers **still open for application** on or after this date.

## Countries in scope

| Wave | Countries |
|------|-----------|
| Existing Masters set | France, England (UK), Ireland, Norway, Denmark, Netherlands, Belgium, Spain, Iceland, New Zealand |
| Extension | Australia, USA, Canada, Japan, South Korea, UAE, Germany, Switzerland, Luxembourg |

---

## Architecture (4 layers)

```
┌─────────────────────────────────────────────────────────────────┐
│  L1 INGEST — Official vacancy sources (primary, mandatory)      │
│  EURAXESS, FindAPhD, AcademicPositions, DAAD, university jobs │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  L2 OSINT ENRICH — docs/intelligence + playbooks                │
│  Supervisors, LinkedIn, emails, student cohorts, funding clues  │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  L3 VERIFY — sourceUrl per field, confidence, deadline check    │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  L4 MATCH + UI — Dina profile score, filters, PhD section in app│
└─────────────────────────────────────────────────────────────────┘
```

**Rule:** No fabricated emails or LinkedIn URLs. Official page first; OSINT only enriches with cited sources.

---

## 8-agent parallel map

| Agent | Region | Primary portals |
|-------|--------|-----------------|
| **1** | France | EURAXESS FR, ADEL, MonDoctorat/CIFRE, university doctorat pages |
| **2** | UK + Ireland | FindAPhD, jobs.ac.uk, university vacancies |
| **3** | Belgium + Luxembourg + Netherlands | EURAXESS BE/LU/NL, AcademicTransfer, FWO/FNRS |
| **4** | Spain + Germany + Switzerland | EURAXESS ES/DE/CH, DAAD, ETH/EPFL job boards |
| **5** | Norway + Denmark + Iceland | Jobbnorge, EURAXESS NO/DK/IS |
| **6** | USA + Canada | NSF, university grad school, Mitacs, ProQuest jobs |
| **7** | Australia + New Zealand | SeekPhD, university scholarships, NZ uni jobs |
| **8** | Japan + South Korea + UAE | JREC-IN, JSPS, KAIST/SNU boards, UAE university careers |

Each agent writes: `data/phd/batch-agent-{N}.json`

---

## Offer record schema

See [`../../data/phd/schema.json`](../../data/phd/schema.json).

Required per offer when available:
- `title`, `subject`, `institution`, `countrySlug`
- `fundingType` (`fully_funded` | `partial` | `industry_partnership` | `scholarship` | `unknown`)
- `openPositions`, `teachingLanguage`, `startDate`, `applicationDeadline`, `status`
- `supervisors[]` — name, `email`, `linkedinUrl`, `officialUrl` (each with source)
- `enrolledStudentsSample[]` — target ≥10 when publicly listable; cite source
- `applyUrl`, `programInfoUrl`
- `verificationDate`, `confidenceLevel`, `sourceUrl`

---

## Orchestrator loop

```bash
# Merge agent batches → verified store → build derived JSON → audit
node scripts/phd/orchestrator.cjs

# Re-run failed / stale slugs (deadline passed → mark closed)
node scripts/phd/orchestrator.cjs --wave 2
```

**Loop until done:**
1. Launch 8 agents (region batches from `data/phd/agent-batch-{1-8}.json`)
2. `orchestrator.cjs merge` — dedupe by `applyUrl` or institution+title
3. `orchestrator.cjs audit` — open vs closed as of today
4. `orchestrator.cjs gaps` — list countries/topics with &lt; N offers
5. Wave 2 agents on gaps only
6. Repeat until audit shows no open gaps or manual stop

---

## OSINT integration (from project library)

| Need | OSINT-BIBLE section | Handbook (2018) |
|------|---------------------|-----------------|
| Country discovery | §4 Search, §29 Google Dorks, national engines | Search, National Search |
| Supervisors | §5 LinkedIn, §31 People | LinkedIn, People |
| Email verify | §15 Email OSINT (pattern only) | Email investigation |
| Student cohort | §5 Social, lab pages, thesis repos | Social media |
| Industry PhD | §32 Company research | Company research |
| Ethics | §11 Legal, §28 Methodologies | Foreword / ethics |

Playbooks: [`playbooks/`](./playbooks/)

---

## Full-stack delivery (after data waves)

| Layer | Deliverable |
|-------|-------------|
| Data | `data/phd-offers.json`, `data/phd-verified.json` |
| Scripts | `scripts/phd/*`, merge + audit |
| Backend | Query layer in `src/lib/data-store.ts` |
| Frontend | `/dina/phd` filter page (desktop-first), badges for funding type |
| UX | Filters: country, funding, language, deadline, domain |

This feature must be delivered as a complete, unified, full-stack system once ingestion reaches coverage targets.
