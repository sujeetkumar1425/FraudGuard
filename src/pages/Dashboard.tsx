import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { FRAUD_METRICS, ANOMALY_METRICS } from "../data/mockData";

const fraudPie = [
  { name: "Legitimate", value: 56820 },
  { name: "Potentially Fraudulent", value: 349 },
];

const networkPie = [
  { name: "Normal Activity", value: 454019 },
  { name: "Suspicious Activity", value: 40002 },
];

const amountDist = [
  { range: "$0–50", count: 48200 },
  { range: "$50–200", count: 31400 },
  { range: "$200–500", count: 12800 },
  { range: "$500–1k", count: 4200 },
  { range: "$1k–5k", count: 920 },
  { range: "$5k+", count: 149 },
];

const modelPerf = [
  { metric: "Accuracy", fraud: 99.3, network: null },
  { metric: "Precision", fraud: 94.7, network: null },
  { metric: "Recall", fraud: 91.2, network: null },
  { metric: "F1-Score", fraud: 92.9, network: null },
];

const SAFE_COLOR = "#10b981";
const DANGER_COLOR = "#f43f5e";
const ACCENT_COLOR = "#0ea5e9";
const PRIMARY_COLOR = "#f59e0b";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div
        className="px-3 py-2 rounded text-xs font-mono"
        style={{ background: "#0e1623", border: "1px solid rgba(148,163,184,0.15)", color: "#e8edf5" }}
      >
        <p className="mb-1 opacity-60">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-2"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <p className="text-[11px] uppercase tracking-widest font-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </p>
      <p className="font-display text-2xl font-semibold leading-none" style={{ color: color ?? "var(--foreground)" }}>
        {value}
      </p>
      {sub && <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const fraudTotal = fraudPie.reduce((a, b) => a + b.value, 0);
  const netTotal = networkPie.reduce((a, b) => a + b.value, 0);
  const fraudRate = ((349 / fraudTotal) * 100).toFixed(2);
  const anomalyRate = ((40002 / netTotal) * 100).toFixed(1);

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--foreground)" }}>
          System Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Real-time overview of fraud & anomaly detection pipeline
        </p>
      </div>

      {/* Alert banner */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg"
        style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)" }}
      >
        <span className="text-lg">⚠️</span>
        <div>
          <p className="text-sm font-medium" style={{ color: "#f43f5e" }}>
            Active Alerts: 349 potentially fraudulent transactions · 40,002 suspicious network records
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            These are model predictions, not confirmed incidents. Review and validate before escalation.
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Transactions" value={fraudTotal.toLocaleString()} sub="Credit card dataset" />
        <StatCard label="Legitimate" value="56,820" sub="99.39% of total" color={SAFE_COLOR} />
        <StatCard label="Potentially Fraudulent" value="349" sub={`Fraud rate: ${fraudRate}%`} color={DANGER_COLOR} />
        <StatCard label="Fraud Rate" value={`${fraudRate}%`} sub="Below 1% threshold" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Network Records" value={netTotal.toLocaleString()} sub="Historical dataset" />
        <StatCard label="Normal Activity" value="454,019" sub="91.9% of total" color={SAFE_COLOR} />
        <StatCard label="Suspicious Activity" value="40,002" sub={`Anomaly rate: ${anomalyRate}%`} color={DANGER_COLOR} />
        <StatCard label="Model Confidence" value="99.3%" sub="Random Forest accuracy" color={PRIMARY_COLOR} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Fraud pie */}
        <div
          className="rounded-lg p-5"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            Transaction Classification
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={fraudPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2}>
                <Cell fill={SAFE_COLOR} />
                <Cell fill={DANGER_COLOR} />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span className="text-xs" style={{ color: "var(--foreground)" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Network pie */}
        <div
          className="rounded-lg p-5"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            Network Activity Classification
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={networkPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2}>
                <Cell fill={ACCENT_COLOR} />
                <Cell fill={PRIMARY_COLOR} />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span className="text-xs" style={{ color: "var(--foreground)" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Amount distribution + Model metrics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div
          className="rounded-lg p-5"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            Transaction Amount Distribution
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={amountDist} barSize={24}>
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Transactions" fill={ACCENT_COLOR} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          className="rounded-lg p-5"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            Fraud Model Performance Metrics
          </p>
          <div className="flex flex-col gap-3 mt-2">
            {[
              { label: "Accuracy", value: FRAUD_METRICS.accuracy, color: SAFE_COLOR },
              { label: "Precision", value: FRAUD_METRICS.precision, color: ACCENT_COLOR },
              { label: "Recall", value: FRAUD_METRICS.recall, color: PRIMARY_COLOR },
              { label: "F1-Score", value: FRAUD_METRICS.f1, color: "#a78bfa" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs font-mono w-20 shrink-0" style={{ color: "var(--muted-foreground)" }}>
                  {label}
                </span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--secondary)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${value}%`, background: color }}
                  />
                </div>
                <span className="text-xs font-mono w-12 text-right" style={{ color }}>
                  {value}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
            <p className="text-[10px] font-mono" style={{ color: "var(--muted-foreground)" }}>
              {FRAUD_METRICS.algorithm} · {FRAUD_METRICS.modelVersion} · Trained {FRAUD_METRICS.trainingDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
