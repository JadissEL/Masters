# PhD discovery playbooks — Dina domains

Reference: `docs/intelligence/osint-bible/repo/README.md`, `PHD_ORCHESTRATION.md`

## Domain keywords (all agents)

finance, accounting, compliance, audit, corporate finance, investment banking, M&A, private equity, asset management, financial advisory, risk, banking, healthcare finance, financial regulation

## Boolean dork templates

```
"{portal}" PhD {domain} funded OR scholarship OR studentship deadline 2026
site:{university-domain} (doctorat OR PhD OR "doctoral") ({domain}) (funded OR CIFRE OR fellowship)
site:linkedin.com/in "{university}" "PhD candidate" {domain}
site:{university-domain} filetype:pdf PhD {domain} deadline
```

## Per-region primary portals

| Region | Portals |
|--------|---------|
| EU | EURAXESS, national research councils |
| UK/IE | FindAPhD, jobs.ac.uk, institutional vacancies |
| US/CA | AcademicJobsOnline, Mitacs, university grad pages |
| AU/NZ | scholarshipdb, uni scholarship pages |
| JP/KR | JREC-IN, JSPS, KAIST/SNU job boards |
| UAE | Khalifa/UAEU/AUS career pages |

## Enrichment order (OSINT)

1. Official vacancy page → applyUrl, deadline, funding, supervisors
2. Supervisor official profile → email, lab URL
3. LinkedIn (only if URL found via official page or named on vacancy)
4. Lab / research group page → student list, publications
5. Thesis repository / Google Scholar → enrolled students sample (max public info)

Never invent emails. Mark `confidenceLevel: Low` if deadline unclear.
