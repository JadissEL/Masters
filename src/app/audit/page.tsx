import { getAuditReport, getDatabaseMetadata } from "@/lib/queries";
import Link from "next/link";
import { ArrowLeft, CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function AuditPage() {
  const report = getAuditReport();
  const metadata = getDatabaseMetadata();

  if (!report) {
    return (
      <div className="container">
        <Link href="/" className="nav-back" style={{ fontSize: 15, fontWeight: 500, marginBottom: 16, display: "inline-flex" }}>
          <ArrowLeft size={18} /> Back to Home
        </Link>
        <div className="card empty-state">
          <p>No audit report available. Run <code>npm run phase-x</code> to generate one.</p>
        </div>
      </div>
    );
  }

  const summary = report.summary;
  const verification = report.verification;

  return (
    <div className="container">
      <Link href="/" className="nav-back" style={{ fontSize: 15, fontWeight: 500, marginBottom: 16, display: "inline-flex" }}>
        <ArrowLeft size={18} /> Back to Home
      </Link>

      <h1 className="section-title">Database Quality Audit</h1>
      <p className="section-subtitle">
        Phase X verification report — generated {new Date(report.generatedAt).toLocaleString()}
        {metadata?.schemaVersion && ` · Schema v${metadata.schemaVersion}`}
      </p>

      <div className="grid grid-3" style={{ marginBottom: 32 }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#1a7a3a" }}>{summary.schools}</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Universities</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{summary.programs}</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Master Programmes</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#4a9eff" }}>{summary.verificationRate}%</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Verified Programmes</div>
        </div>
      </div>

      <h2 className="section-title" style={{ fontSize: 20 }}>Verification Status</h2>
      <div className="card" style={{ marginBottom: 32 }}>
        <div className="grid grid-3">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle size={18} color="#1a7a3a" />
            <span><strong>{verification.verified}</strong> Verified</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={18} color="#8a5a00" />
            <span><strong>{verification.pending}</strong> Pending Verification</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={18} color="#c0392b" />
            <span><strong>{verification.manual}</strong> Manual Review Required</span>
          </div>
        </div>
      </div>

      <h2 className="section-title" style={{ fontSize: 20 }}>Field Completeness</h2>
      <div className="card" style={{ marginBottom: 32 }}>
        <div className="grid grid-2">
          {Object.entries(report.completeness).map(([field, stats]) => (
            <div key={field} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontFamily: "monospace" }}>{field}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{stats.pct}% ({stats.filled}/{stats.total})</span>
              </div>
              <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
                <div style={{
                  height: "100%",
                  width: `${stats.pct}%`,
                  background: stats.pct >= 80 ? "#1a7a3a" : stats.pct >= 50 ? "#4a9eff" : stats.pct >= 20 ? "#8a5a00" : "#c0392b",
                  borderRadius: 2,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="section-title" style={{ fontSize: 20 }}>Open Issues</h2>
      <div className="grid grid-2" style={{ marginBottom: 32 }}>
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Data Quality Flags</h3>
          <div className="info-row"><span className="info-label">Missing tuition</span><span className="info-value">{summary.missingTuitionCount as number}</span></div>
          <div className="info-row"><span className="info-label">Missing sources</span><span className="info-value">{summary.missingSourcesCount as number}</span></div>
          <div className="info-row"><span className="info-label">Incomplete metadata</span><span className="info-value">{summary.incompleteMetadataCount as number}</span></div>
          <div className="info-row"><span className="info-label">Duplicate schools</span><span className="info-value">{summary.duplicateSchoolsRemaining as number}</span></div>
          <div className="info-row"><span className="info-label">Open audit flags</span><span className="info-value">{summary.openFlags as number}</span></div>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Provenance</h3>
          <div className="info-row"><span className="info-label">Data sources</span><span className="info-value">{summary.sources as number}</span></div>
          <div className="info-row"><span className="info-label">Contacts</span><span className="info-value">{summary.contacts as number}</span></div>
          <div className="info-row"><span className="info-label">Program deadlines</span><span className="info-value">{summary.programDeadlines as number}</span></div>
          <div className="info-row"><span className="info-label">Audit flags (total)</span><span className="info-value">{summary.auditFlags as number}</span></div>
        </div>
      </div>
    </div>
  );
}
