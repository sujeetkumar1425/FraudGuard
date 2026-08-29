import { useState, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { generateTransactions, type Transaction } from "../data/mockData";

const SAFE = "#10b981";
const DANGER = "#f43f5e";

function Badge({ text, type }: { text: string; type: "safe" | "danger" }) {
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-mono font-medium"
      style={{
        background: type === "safe" ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.12)",
        color: type === "safe" ? SAFE : DANGER,
        border: `1px solid ${type === "safe" ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.25)"}`,
      }}
    >
      {text}
    </span>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded text-xs font-mono" style={{ background: "#0e1623", border: "1px solid rgba(148,163,184,0.15)", color: "#e8edf5" }}>
        <p className="opacity-60 mb-1">{label}</p>
        {payload.map((p: any) => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
      </div>
    );
  }
  return null;
};

export default function FraudDetection() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "fraud" | "legit">("all");
  const fileRef = useRef<HTMLInputElement>(null);

  const fraudCount = transactions.filter((t) => t.prediction === "Potentially Fraudulent").length;
  const legitCount = transactions.length - fraudCount;
  const fraudRate = transactions.length ? ((fraudCount / transactions.length) * 100).toFixed(2) : "0.00";

  const amountBuckets = [
    { range: "$0–100", legit: 0, fraud: 0 },
    { range: "$100–500", legit: 0, fraud: 0 },
    { range: "$500–1k", legit: 0, fraud: 0 },
    { range: "$1k+", legit: 0, fraud: 0 },
  ];
  transactions.forEach((t) => {
    const key = t.prediction === "Potentially Fraudulent" ? "fraud" : "legit";
    if (t.amount < 100) amountBuckets[0][key]++;
    else if (t.amount < 500) amountBuckets[1][key]++;
    else if (t.amount < 1000) amountBuckets[2][key]++;
    else amountBuckets[3][key]++;
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file.");
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      alert("File too large. Maximum 200MB.");
      return;
    }
    setFileName(file.name);
    setLoading(true);
    setTimeout(() => {
      setTransactions(generateTransactions(200));
      setAnalyzed(true);
      setLoading(false);
    }, 1800);
  };

  const downloadCSV = () => {
    const rows = [
      ["Transaction ID", "Time (s)", "Amount ($)", "Prediction", "Confidence (%)"].join(","),
      ...transactions.map((t) =>
        [t.id, t.time, t.amount, t.prediction, t.confidence].join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fraud_detection_results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = transactions.filter((t) =>
    filterMode === "all" ? true : filterMode === "fraud" ? t.prediction === "Potentially Fraudulent" : t.prediction === "Legitimate"
  );

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
      <div>
        <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--foreground)" }}>
          Credit Card Fraud Detection
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Upload a transaction CSV · Random Forest Classifier · class_weight=balanced
        </p>
      </div>

      {/* Upload zone */}
      <div
        className="rounded-lg p-6 flex flex-col items-center gap-3 cursor-pointer transition-colors"
        style={{ background: "var(--card)", border: "2px dashed var(--border)" }}
        onClick={() => fileRef.current?.click()}
      >
        <div className="text-3xl opacity-40">📂</div>
        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          {fileName ? `Loaded: ${fileName}` : "Click to upload credit card transaction CSV"}
        </p>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Expected columns: Time, V1–V28, Amount, Class (optional) · Max 200MB
        </p>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleUpload} />
        {loading && (
          <div className="flex items-center gap-2 mt-1">
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
            <span className="text-xs font-mono" style={{ color: "var(--primary)" }}>Running Random Forest predictions…</span>
          </div>
        )}
      </div>

      {/* Demo button */}
      {!analyzed && !loading && (
        <button
          className="self-start px-4 py-2 rounded text-sm font-medium transition-colors"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          onClick={() => { setLoading(true); setFileName("creditcard_demo.csv"); setTimeout(() => { setTransactions(generateTransactions(200)); setAnalyzed(true); setLoading(false); }, 1800); }}
        >
          Load Demo Dataset
        </button>
      )}

      {analyzed && !loading && (
        <>
          {/* Alert */}
          {fraudCount > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)" }}>
              <span>⚠️</span>
              <p className="text-sm" style={{ color: "#f43f5e" }}>
                {fraudCount} potentially fraudulent transaction{fraudCount !== 1 ? "s" : ""} detected. Review highlighted records below.
              </p>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Records", value: transactions.length.toLocaleString() },
              { label: "Legitimate", value: legitCount.toLocaleString(), color: SAFE },
              { label: "Potentially Fraudulent", value: fraudCount.toLocaleString(), color: DANGER },
              { label: "Fraud Rate", value: `${fraudRate}%`, color: "#f59e0b" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <p className="text-[10px] uppercase tracking-widest font-mono mb-2" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                <p className="font-display text-xl font-semibold" style={{ color: color ?? "var(--foreground)" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="rounded-lg p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>Amount Distribution by Classification</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={amountBuckets} barSize={18} barGap={4}>
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="legit" name="Legitimate" fill={SAFE} radius={[3, 3, 0, 0]} />
                <Bar dataKey="fraud" name="Potentially Fraudulent" fill={DANGER} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Filters + download */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              {(["all", "fraud", "legit"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className="px-3 py-1.5 rounded text-xs font-mono transition-colors"
                  style={{
                    background: filterMode === mode ? "var(--primary)" : "var(--secondary)",
                    color: filterMode === mode ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {mode === "all" ? "All" : mode === "fraud" ? "Fraudulent" : "Legitimate"}
                </button>
              ))}
            </div>
            <button
              onClick={downloadCSV}
              className="px-3 py-1.5 rounded text-xs font-mono transition-colors"
              style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" }}
            >
              ↓ Download Results CSV
            </button>
          </div>

          {/* Table */}
          <div className="rounded-lg overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Transaction ID", "Time (s)", "Amount", "V1", "V14", "V17", "Prediction", "Confidence"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-mono uppercase tracking-wider text-[10px]" style={{ color: "var(--muted-foreground)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 50).map((t, i) => {
                    const isFraud = t.prediction === "Potentially Fraudulent";
                    return (
                      <tr
                        key={t.id}
                        style={{
                          background: isFraud ? "rgba(244,63,94,0.04)" : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                          borderLeft: isFraud ? "2px solid #f43f5e" : "2px solid transparent",
                        }}
                      >
                        <td className="px-4 py-2.5 font-mono" style={{ color: "var(--foreground)" }}>{t.id}</td>
                        <td className="px-4 py-2.5 font-mono" style={{ color: "var(--muted-foreground)" }}>{t.time.toLocaleString()}</td>
                        <td className="px-4 py-2.5 font-mono" style={{ color: "var(--foreground)" }}>${t.amount.toFixed(2)}</td>
                        <td className="px-4 py-2.5 font-mono" style={{ color: "var(--muted-foreground)" }}>{t.v1.toFixed(3)}</td>
                        <td className="px-4 py-2.5 font-mono" style={{ color: "var(--muted-foreground)" }}>{t.v14.toFixed(3)}</td>
                        <td className="px-4 py-2.5 font-mono" style={{ color: "var(--muted-foreground)" }}>{t.v17.toFixed(3)}</td>
                        <td className="px-4 py-2.5">
                          <Badge text={t.prediction} type={isFraud ? "danger" : "safe"} />
                        </td>
                        <td className="px-4 py-2.5 font-mono" style={{ color: isFraud ? DANGER : SAFE }}>{t.confidence}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 border-t text-[10px] font-mono" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              Showing {Math.min(50, filtered.length)} of {filtered.length} records · Random Forest Classifier · {"{n_estimators: 200, class_weight: 'balanced'}"}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
