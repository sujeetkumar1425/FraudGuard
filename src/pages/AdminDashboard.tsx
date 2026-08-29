import { useState } from "react";
import { FRAUD_METRICS, ANOMALY_METRICS } from "../data/mockData";

type AdminTab = "overview" | "datasets" | "models" | "users" | "config";

const tabs: { id: AdminTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "datasets", label: "Dataset Management" },
  { id: "models", label: "Model Management" },
  { id: "users", label: "User Management" },
  { id: "config", label: "System Config" },
];

const DATASETS = [
  { id: "DS-001", name: "creditcard.csv", type: "Credit Card Transactions", records: 284807, uploaded: "2025-08-14", size: "143 MB" },
  { id: "DS-002", name: "nsl_kdd_train.csv", type: "Network Activity", records: 125973, uploaded: "2025-08-14", size: "28 MB" },
  { id: "DS-003", name: "nsl_kdd_test.csv", type: "Network Activity", records: 22544, uploaded: "2025-08-14", size: "5 MB" },
];

const USERS = [
  { id: "USR-001", username: "admin", role: "Admin", status: "Active", lastLogin: "2025-08-28 09:14" },
  { id: "USR-002", username: "analyst_01", role: "User", status: "Active", lastLogin: "2025-08-27 14:32" },
  { id: "USR-003", username: "analyst_02", role: "User", status: "Inactive", lastLogin: "2025-08-20 08:01" },
];

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-xs font-mono rounded transition-colors"
      style={{
        background: active ? "var(--primary)" : "transparent",
        color: active ? "var(--primary-foreground)" : "var(--muted-foreground)",
      }}
    >
      {label}
    </button>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg ${className}`} style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      {children}
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Models", value: "2", sub: "Fraud + Network" },
          { label: "Datasets Loaded", value: "3", sub: "Train + Test" },
          { label: "Registered Users", value: "3", sub: "1 Admin, 2 Users" },
          { label: "Total Predictions", value: "57,169", sub: "Across sessions" },
        ].map(({ label, value, sub }) => (
          <Card key={label} className="p-4">
            <p className="text-[10px] uppercase tracking-widest font-mono mb-2" style={{ color: "var(--muted-foreground)" }}>{label}</p>
            <p className="font-display text-2xl font-semibold" style={{ color: "var(--foreground)" }}>{value}</p>
            <p className="text-[11px] mt-1" style={{ color: "var(--muted-foreground)" }}>{sub}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Model Performance Summary</p>
        </div>
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--foreground)" }}>Fraud Detection (Random Forest)</p>
            {[
              { m: "Accuracy", v: FRAUD_METRICS.accuracy, c: "#10b981" },
              { m: "Precision", v: FRAUD_METRICS.precision, c: "#0ea5e9" },
              { m: "Recall", v: FRAUD_METRICS.recall, c: "#f59e0b" },
              { m: "F1-Score", v: FRAUD_METRICS.f1, c: "#a78bfa" },
            ].map(({ m, v, c }) => (
              <div key={m} className="flex items-center gap-3 mb-2">
                <span className="text-[11px] font-mono w-20" style={{ color: "var(--muted-foreground)" }}>{m}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--secondary)" }}>
                  <div className="h-full rounded-full" style={{ width: `${v}%`, background: c }} />
                </div>
                <span className="text-[11px] font-mono w-10 text-right" style={{ color: c }}>{v}%</span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--foreground)" }}>Network Anomaly (Isolation Forest)</p>
            <div className="px-3 py-3 rounded text-xs" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)", color: "var(--muted-foreground)" }}>
              Supervised metrics (accuracy/precision/recall) cannot be computed without labeled ground truth. Isolation Forest is unsupervised.
            </div>
            <div className="mt-3 flex flex-col gap-1">
              {[
                { label: "Contamination", value: `${ANOMALY_METRICS.contamination * 100}%` },
                { label: "Training Records", value: ANOMALY_METRICS.totalRecords.toLocaleString() },
                { label: "Anomalies Found", value: ANOMALY_METRICS.anomalyCount.toLocaleString() },
                { label: "n_estimators", value: String(ANOMALY_METRICS.nEstimators) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-1.5 border-b text-xs" style={{ borderColor: "var(--border)" }}>
                  <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
                  <span className="font-mono" style={{ color: "var(--foreground)" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DatasetsTab() {
  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Registered Datasets</p>
        <button className="px-3 py-1.5 rounded text-xs font-mono" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          + Register Dataset
        </button>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["Dataset ID", "Filename", "Type", "Records", "Size", "Upload Date", "Actions"].map((h) => (
              <th key={h} className="text-left px-4 py-3 font-mono uppercase tracking-wider text-[10px]" style={{ color: "var(--muted-foreground)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DATASETS.map((d, i) => (
            <tr key={d.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
              <td className="px-4 py-3 font-mono" style={{ color: "var(--muted-foreground)" }}>{d.id}</td>
              <td className="px-4 py-3 font-mono" style={{ color: "var(--foreground)" }}>{d.name}</td>
              <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>{d.type}</td>
              <td className="px-4 py-3 font-mono" style={{ color: "var(--foreground)" }}>{d.records.toLocaleString()}</td>
              <td className="px-4 py-3 font-mono" style={{ color: "var(--muted-foreground)" }}>{d.size}</td>
              <td className="px-4 py-3 font-mono" style={{ color: "var(--muted-foreground)" }}>{d.uploaded}</td>
              <td className="px-4 py-3">
                <button className="text-[10px] font-mono px-2 py-1 rounded" style={{ color: "#f43f5e", background: "rgba(244,63,94,0.08)" }}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function ModelsTab() {
  const [training, setTraining] = useState<string | null>(null);
  const [trained, setTrained] = useState<string[]>([]);

  const trainModel = (type: string) => {
    setTraining(type);
    setTimeout(() => {
      setTrained((prev) => [...prev.filter((t) => t !== type), type]);
      setTraining(null);
    }, 3000);
  };

  const models = [
    {
      name: "Fraud Detection Model",
      file: "fraud_model.pkl",
      algorithm: FRAUD_METRICS.algorithm,
      version: FRAUD_METRICS.modelVersion,
      trained: FRAUD_METRICS.trainingDate,
      status: "Loaded",
      type: "fraud",
    },
    {
      name: "Network Anomaly Model",
      file: "anomaly_model.pkl",
      algorithm: ANOMALY_METRICS.algorithm,
      version: ANOMALY_METRICS.modelVersion,
      trained: ANOMALY_METRICS.trainingDate,
      status: "Loaded",
      type: "network",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {models.map((m) => (
        <Card key={m.type} className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{m.name}</p>
              <p className="text-xs mt-0.5 font-mono" style={{ color: "var(--muted-foreground)" }}>{m.file}</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
              {trained.includes(m.type) ? "Re-trained ✓" : m.status}
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              { l: "Algorithm", v: m.algorithm },
              { l: "Version", v: m.version },
              { l: "Training Date", v: m.trained },
              { l: "Scaler", v: "StandardScaler" },
            ].map(({ l, v }) => (
              <div key={l}>
                <p className="text-[10px] font-mono uppercase" style={{ color: "var(--muted-foreground)" }}>{l}</p>
                <p className="text-xs mt-1" style={{ color: "var(--foreground)" }}>{v}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => trainModel(m.type)}
            disabled={training === m.type}
            className="px-4 py-2 rounded text-xs font-mono transition-opacity"
            style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)", opacity: training === m.type ? 0.6 : 1 }}
          >
            {training === m.type ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border border-t-transparent animate-spin inline-block" style={{ borderColor: "var(--foreground)", borderTopColor: "transparent" }} />
                Training…
              </span>
            ) : "Re-train Model"}
          </button>
          <p className="text-[10px] mt-2" style={{ color: "var(--muted-foreground)" }}>
            Training runs as a separate operation (python ml/train_{m.type}_model.py). Do not retrain on every prediction.
          </p>
        </Card>
      ))}
    </div>
  );
}

function UsersTab() {
  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>User Management</p>
        <button className="px-3 py-1.5 rounded text-xs font-mono" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          + Add User
        </button>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["User ID", "Username", "Role", "Status", "Last Login", "Actions"].map((h) => (
              <th key={h} className="text-left px-4 py-3 font-mono uppercase tracking-wider text-[10px]" style={{ color: "var(--muted-foreground)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {USERS.map((u, i) => (
            <tr key={u.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
              <td className="px-4 py-3 font-mono" style={{ color: "var(--muted-foreground)" }}>{u.id}</td>
              <td className="px-4 py-3 font-mono" style={{ color: "var(--foreground)" }}>{u.username}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono" style={{
                  background: u.role === "Admin" ? "rgba(245,158,11,0.1)" : "rgba(14,165,233,0.1)",
                  color: u.role === "Admin" ? "#f59e0b" : "#0ea5e9",
                }}>
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono" style={{
                  background: u.status === "Active" ? "rgba(16,185,129,0.1)" : "rgba(148,163,184,0.1)",
                  color: u.status === "Active" ? "#10b981" : "#64748b",
                }}>
                  {u.status}
                </span>
              </td>
              <td className="px-4 py-3 font-mono" style={{ color: "var(--muted-foreground)" }}>{u.lastLogin}</td>
              <td className="px-4 py-3 flex gap-2">
                <button className="text-[10px] font-mono px-2 py-1 rounded" style={{ color: "#f59e0b", background: "rgba(245,158,11,0.08)" }}>
                  {u.status === "Active" ? "Deactivate" : "Activate"}
                </button>
                {u.role !== "Admin" && (
                  <button className="text-[10px] font-mono px-2 py-1 rounded" style={{ color: "#f43f5e", background: "rgba(244,63,94,0.08)" }}>Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function ConfigTab() {
  const [config, setConfig] = useState({
    fraudThreshold: 0.5,
    anomalyContamination: 0.08,
    maxDisplayRows: 50,
    maxFileSize: 50,
    alertEnabled: true,
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="p-5 max-w-lg">
      <p className="text-sm font-semibold mb-5" style={{ color: "var(--foreground)" }}>System Configuration</p>
      <div className="flex flex-col gap-5">
        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>
            Fraud Alert Threshold (probability)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range" min={0.3} max={0.9} step={0.05}
              value={config.fraudThreshold}
              onChange={(e) => setConfig((c) => ({ ...c, fraudThreshold: parseFloat(e.target.value) }))}
              className="flex-1"
            />
            <span className="font-mono text-sm w-10 text-right" style={{ color: "var(--foreground)" }}>{config.fraudThreshold}</span>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>
            Isolation Forest Contamination
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range" min={0.01} max={0.2} step={0.01}
              value={config.anomalyContamination}
              onChange={(e) => setConfig((c) => ({ ...c, anomalyContamination: parseFloat(e.target.value) }))}
              className="flex-1"
            />
            <span className="font-mono text-sm w-10 text-right" style={{ color: "var(--foreground)" }}>{config.anomalyContamination}</span>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>
            Max Display Rows
          </label>
          <input
            type="number" value={config.maxDisplayRows}
            onChange={(e) => setConfig((c) => ({ ...c, maxDisplayRows: parseInt(e.target.value) || 50 }))}
            className="w-full px-3 py-2 rounded text-sm font-mono outline-none"
            style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
        </div>

        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>
            Max File Upload Size (MB)
          </label>
          <input
            type="number" value={config.maxFileSize}
            onChange={(e) => setConfig((c) => ({ ...c, maxFileSize: parseInt(e.target.value) || 50 }))}
            className="w-full px-3 py-2 rounded text-sm font-mono outline-none"
            style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-[11px] font-mono uppercase tracking-wider flex-1" style={{ color: "var(--muted-foreground)" }}>
            Enable Alert System
          </label>
          <button
            onClick={() => setConfig((c) => ({ ...c, alertEnabled: !c.alertEnabled }))}
            className="w-10 h-5 rounded-full transition-colors relative"
            style={{ background: config.alertEnabled ? "var(--primary)" : "var(--secondary)" }}
          >
            <span
              className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
              style={{ background: "white", left: config.alertEnabled ? "calc(100% - 18px)" : "2px" }}
            />
          </button>
        </div>

        <button
          onClick={save}
          className="py-2.5 rounded text-sm font-mono transition-colors"
          style={{ background: saved ? "#10b981" : "var(--primary)", color: saved ? "white" : "var(--primary-foreground)" }}
        >
          {saved ? "✓ Saved" : "Save Configuration"}
        </button>
        <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
          Configuration is persisted to MySQL system_config table. Changes take effect on next session.
        </p>
      </div>
    </Card>
  );
}

type Props = { onLogout: () => void };

export default function AdminDashboard({ onLogout }: Props) {
  const [tab, setTab] = useState<AdminTab>("overview");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div>
          <h1 className="font-display text-xl font-semibold" style={{ color: "var(--foreground)" }}>Admin Console</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Logged in as <span className="font-mono">admin</span></p>
        </div>
        <button
          onClick={onLogout}
          className="px-3 py-1.5 rounded text-xs font-mono"
          style={{ background: "var(--secondary)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
        >
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 pb-3 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
        {tabs.map((t) => (
          <TabButton key={t.id} active={tab === t.id} label={t.label} onClick={() => setTab(t.id)} />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {tab === "overview" && <OverviewTab />}
        {tab === "datasets" && <DatasetsTab />}
        {tab === "models" && <ModelsTab />}
        {tab === "users" && <UsersTab />}
        {tab === "config" && <ConfigTab />}
      </div>
    </div>
  );
}
