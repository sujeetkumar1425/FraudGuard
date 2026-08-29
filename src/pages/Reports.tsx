import { FRAUD_METRICS, ANOMALY_METRICS } from "../data/mockData";

const fraudTotal = 57169;
const fraudCount = 349;
const netTotal = 494021;
const anomalyCount = 40002;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Row({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <span className={`text-xs ${mono ? "font-mono" : ""}`} style={{ color: "var(--foreground)" }}>{value}</span>
    </div>
  );
}

function ConfusionMatrix() {
  const [[tn, fp], [fn, tp]] = FRAUD_METRICS.confusionMatrix;
  const cells = [
    { label: "TN", value: tn, color: "#10b981", desc: "True Negative" },
    { label: "FP", value: fp, color: "#f59e0b", desc: "False Positive" },
    { label: "FN", value: fn, color: "#f59e0b", desc: "False Negative" },
    { label: "TP", value: tp, color: "#10b981", desc: "True Positive" },
  ];
  return (
    <div>
      <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>Confusion Matrix — Test Set</p>
      <div className="grid grid-cols-2 gap-1.5 max-w-xs">
        {cells.map(({ label, value, color, desc }) => (
          <div key={label} className="rounded p-3 text-center" style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
            <p className="font-mono text-lg font-semibold" style={{ color }}>{value.toLocaleString()}</p>
            <p className="text-[10px] font-mono mt-0.5" style={{ color }}>{label}</p>
            <p className="text-[9px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Reports() {
  const downloadFraudReport = () => {
    const rows = [
      "FRAUD DETECTION REPORT",
      `Generated: ${new Date().toISOString()}`,
      "",
      `Total Transactions,${fraudTotal}`,
      `Legitimate,${fraudTotal - fraudCount}`,
      `Potentially Fraudulent,${fraudCount}`,
      `Fraud Rate,${((fraudCount / fraudTotal) * 100).toFixed(2)}%`,
      "",
      "MODEL METRICS",
      `Algorithm,${FRAUD_METRICS.algorithm}`,
      `Version,${FRAUD_METRICS.modelVersion}`,
      `Training Date,${FRAUD_METRICS.trainingDate}`,
      `Accuracy,${FRAUD_METRICS.accuracy}%`,
      `Precision,${FRAUD_METRICS.precision}%`,
      `Recall,${FRAUD_METRICS.recall}%`,
      `F1-Score,${FRAUD_METRICS.f1}%`,
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "fraud_detection_report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadNetReport = () => {
    const rows = [
      "NETWORK ANOMALY REPORT",
      `Generated: ${new Date().toISOString()}`,
      "",
      `Total Records,${netTotal}`,
      `Normal Activity,${netTotal - anomalyCount}`,
      `Suspicious Activity,${anomalyCount}`,
      `Anomaly Rate,${((anomalyCount / netTotal) * 100).toFixed(1)}%`,
      "",
      "MODEL METADATA",
      `Algorithm,${ANOMALY_METRICS.algorithm}`,
      `Version,${ANOMALY_METRICS.modelVersion}`,
      `Training Date,${ANOMALY_METRICS.trainingDate}`,
      `Contamination,${ANOMALY_METRICS.contamination}`,
      "",
      "NOTE: Supervised evaluation metrics (accuracy/precision/recall) cannot be calculated without labeled ground truth.",
      "Isolation Forest is unsupervised. Anomaly rate and score distribution are used instead.",
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "network_anomaly_report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
      <div>
        <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--foreground)" }}>Reports</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Fraud detection and network anomaly detection summary reports
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Fraud Report */}
        <Section title="Fraud Detection Report">
          <div className="flex flex-col gap-1">
            <Row label="Total Transactions" value={fraudTotal.toLocaleString()} />
            <Row label="Legitimate Transactions" value={(fraudTotal - fraudCount).toLocaleString()} />
            <Row label="Potentially Fraudulent" value={fraudCount.toLocaleString()} />
            <Row label="Fraud Rate" value={`${((fraudCount / fraudTotal) * 100).toFixed(2)}%`} />
            <Row label="Algorithm" value={FRAUD_METRICS.algorithm} mono={false} />
            <Row label="Model Version" value={FRAUD_METRICS.modelVersion} />
            <Row label="Training Date" value={FRAUD_METRICS.trainingDate} />
            <Row label="Training Set Size" value={FRAUD_METRICS.trainingSize.toLocaleString()} />
          </div>
          <button
            onClick={downloadFraudReport}
            className="mt-4 px-4 py-2 rounded text-xs font-mono w-full"
            style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}
          >
            ↓ Download Fraud Report CSV
          </button>
        </Section>

        {/* Network Report */}
        <Section title="Network Anomaly Detection Report">
          <div className="flex flex-col gap-1">
            <Row label="Total Network Records" value={netTotal.toLocaleString()} />
            <Row label="Normal Activity" value={(netTotal - anomalyCount).toLocaleString()} />
            <Row label="Suspicious Activity" value={anomalyCount.toLocaleString()} />
            <Row label="Anomaly Rate" value={`${((anomalyCount / netTotal) * 100).toFixed(1)}%`} />
            <Row label="Algorithm" value={ANOMALY_METRICS.algorithm} mono={false} />
            <Row label="Model Version" value={ANOMALY_METRICS.modelVersion} />
            <Row label="Training Date" value={ANOMALY_METRICS.trainingDate} />
            <Row label="Contamination Factor" value={String(ANOMALY_METRICS.contamination)} />
          </div>
          <div className="mt-3 px-3 py-2 rounded text-xs" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)", color: "var(--muted-foreground)" }}>
            Note: Supervised metrics (accuracy/precision/recall) cannot be calculated for Isolation Forest without labeled ground truth. Anomaly rate and score distribution are reported instead.
          </div>
          <button
            onClick={downloadNetReport}
            className="mt-3 px-4 py-2 rounded text-xs font-mono w-full"
            style={{ background: "rgba(14,165,233,0.1)", color: "#0ea5e9", border: "1px solid rgba(14,165,233,0.25)" }}
          >
            ↓ Download Network Report CSV
          </button>
        </Section>
      </div>

      {/* Model Metrics */}
      <Section title="Fraud Model Performance — Evaluation Metrics">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <div className="flex flex-col gap-1">
              <Row label="Accuracy" value={`${FRAUD_METRICS.accuracy}%`} />
              <Row label="Precision" value={`${FRAUD_METRICS.precision}%`} />
              <Row label="Recall (Sensitivity)" value={`${FRAUD_METRICS.recall}%`} />
              <Row label="F1-Score" value={`${FRAUD_METRICS.f1}%`} />
              <Row label="n_estimators" value={String(FRAUD_METRICS.nEstimators)} />
            </div>
            <div className="mt-4 p-3 rounded text-xs" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", color: "var(--muted-foreground)" }}>
              Accuracy alone is misleading for fraud detection — only 0.61% of transactions are fraud. Precision, Recall, and F1 are the primary metrics. class_weight="balanced" was used to handle class imbalance.
            </div>
          </div>
          <ConfusionMatrix />
        </div>
      </Section>
    </div>
  );
}
