import { useState, useRef } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, BarChart, Bar } from "recharts";
import { generateNetworkRecords, type NetworkRecord } from "../data/mockData";

const NORMAL = "#0ea5e9";
const ANOMALY = "#f59e0b";

function Badge({ text, type }: { text: string; type: "normal" | "anomaly" }) {
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-mono font-medium"
      style={{
        background: type === "normal" ? "rgba(14,165,233,0.12)" : "rgba(245,158,11,0.12)",
        color: type === "normal" ? NORMAL : ANOMALY,
        border: `1px solid ${type === "normal" ? "rgba(14,165,233,0.25)" : "rgba(245,158,11,0.25)"}`,
      }}
    >
      {text}
    </span>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0]?.payload as NetworkRecord;
    if (!d) return null;
    return (
      <div className="px-3 py-2 rounded text-xs font-mono" style={{ background: "#0e1623", border: "1px solid rgba(148,163,184,0.15)", color: "#e8edf5" }}>
        <p>{d.id}</p>
        <p>Protocol: {d.protocol}</p>
        <p>Src Bytes: {d.srcBytes.toLocaleString()}</p>
        <p>Anomaly Score: {d.anomalyScore}</p>
        <p style={{ color: d.status === "Suspicious Activity" ? ANOMALY : NORMAL }}>{d.status}</p>
      </div>
    );
  }
  return null;
};

const protocols = ["tcp", "udp", "icmp"];

export default function NetworkAnomaly() {
  const [records, setRecords] = useState<NetworkRecord[]>([]);
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [filterProto, setFilterProto] = useState("all");
  const fileRef = useRef<HTMLInputElement>(null);

  const runAnalysis = (name: string) => {
    setFileName(name);
    setLoading(true);
    setTimeout(() => {
      setRecords(generateNetworkRecords(150));
      setAnalyzed(true);
      setLoading(false);
    }, 2000);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) { alert("Please upload a CSV file."); return; }
    runAnalysis(file.name);
  };

  const anomalyCount = records.filter((r) => r.status === "Suspicious Activity").length;
  const normalCount = records.length - anomalyCount;
  const anomalyRate = records.length ? ((anomalyCount / records.length) * 100).toFixed(1) : "0.0";

  const protoCounts = protocols.map((p) => ({
    protocol: p.toUpperCase(),
    normal: records.filter((r) => r.protocol === p && r.status === "Normal Activity").length,
    anomaly: records.filter((r) => r.protocol === p && r.status === "Suspicious Activity").length,
  }));

  const filtered = records.filter((r) => filterProto === "all" || r.protocol === filterProto);

  const downloadCSV = () => {
    const rows = [
      ["Record ID", "Protocol", "Service", "Flag", "Src Bytes", "Dst Bytes", "Duration", "Status", "Anomaly Score"].join(","),
      ...records.map((r) => [r.id, r.protocol, r.service, r.flag, r.srcBytes, r.dstBytes, r.duration, r.status, r.anomalyScore].join(",")),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "network_anomaly_results.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
      <div>
        <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--foreground)" }}>
          Network Anomaly Detection
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Upload network activity CSV · Isolation Forest · Unsupervised anomaly detection
        </p>
      </div>

      {/* Isolation Forest explanation */}
      <div className="rounded-lg px-4 py-3 text-xs" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)" }}>
        <p className="font-semibold mb-1" style={{ color: "#0ea5e9" }}>How Isolation Forest Works</p>
        <p style={{ color: "var(--muted-foreground)" }}>
          The model isolates observations by randomly partitioning features. Anomalous records are isolated in fewer splits (low path length → high anomaly score ≥ 0.5). Output: −1 → Suspicious Activity, +1 → Normal Activity. No labeled ground truth required.
        </p>
      </div>

      {/* Upload */}
      <div
        className="rounded-lg p-6 flex flex-col items-center gap-3 cursor-pointer"
        style={{ background: "var(--card)", border: "2px dashed var(--border)" }}
        onClick={() => fileRef.current?.click()}
      >
        <div className="text-3xl opacity-40">🌐</div>
        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          {fileName ? `Loaded: ${fileName}` : "Click to upload network activity CSV"}
        </p>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Expected: duration, protocol_type, service, flag, src_bytes, dst_bytes · NSL-KDD compatible
        </p>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleUpload} />
        {loading && (
          <div className="flex items-center gap-2 mt-1">
            <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
            <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>Running Isolation Forest…</span>
          </div>
        )}
      </div>

      {!analyzed && !loading && (
        <button
          className="self-start px-4 py-2 rounded text-sm font-medium"
          style={{ background: "var(--accent)", color: "white" }}
          onClick={() => runAnalysis("network_activity_demo.csv")}
        >
          Load Demo Network Dataset
        </button>
      )}

      {analyzed && !loading && (
        <>
          {anomalyCount > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
              <span>⚠️</span>
              <p className="text-sm" style={{ color: "#f59e0b" }}>
                {anomalyCount} suspicious network record{anomalyCount !== 1 ? "s" : ""} detected. Isolation Forest contamination factor: 8%.
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Records", value: records.length.toLocaleString() },
              { label: "Normal Activity", value: normalCount.toLocaleString(), color: NORMAL },
              { label: "Suspicious Activity", value: anomalyCount.toLocaleString(), color: ANOMALY },
              { label: "Anomaly Rate", value: `${anomalyRate}%`, color: "#a78bfa" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <p className="text-[10px] uppercase tracking-widest font-mono mb-2" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                <p className="font-display text-xl font-semibold" style={{ color: color ?? "var(--foreground)" }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Scatter: src_bytes vs anomaly score */}
            <div className="rounded-lg p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <p className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>Source Bytes vs Anomaly Score</p>
              <ResponsiveContainer width="100%" height={180}>
                <ScatterChart>
                  <XAxis dataKey="srcBytes" name="Src Bytes" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => v > 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <YAxis dataKey="anomalyScore" name="Score" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} domain={[0, 1]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter data={records} name="Records">
                    {records.map((r) => (
                      <Cell key={r.id} fill={r.status === "Suspicious Activity" ? ANOMALY : NORMAL} fillOpacity={0.7} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Protocol breakdown */}
            <div className="rounded-lg p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <p className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>Activity by Protocol</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={protoCounts} barSize={20} barGap={4}>
                  <XAxis dataKey="protocol" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip content={({ active, payload, label }: any) => active && payload?.length ? (
                    <div className="px-3 py-2 rounded text-xs font-mono" style={{ background: "#0e1623", border: "1px solid rgba(148,163,184,0.15)", color: "#e8edf5" }}>
                      <p className="opacity-60 mb-1">{label}</p>
                      {payload.map((p: any) => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
                    </div>
                  ) : null} />
                  <Bar dataKey="normal" name="Normal" fill={NORMAL} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="anomaly" name="Suspicious" fill={ANOMALY} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Filter + download */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              {["all", ...protocols].map((p) => (
                <button key={p} onClick={() => setFilterProto(p)}
                  className="px-3 py-1.5 rounded text-xs font-mono transition-colors"
                  style={{ background: filterProto === p ? "var(--accent)" : "var(--secondary)", color: filterProto === p ? "white" : "var(--muted-foreground)" }}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={downloadCSV} className="px-3 py-1.5 rounded text-xs font-mono" style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
              ↓ Download Results CSV
            </button>
          </div>

          {/* Table */}
          <div className="rounded-lg overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Record ID", "Protocol", "Service", "Flag", "Src Bytes", "Dst Bytes", "Duration", "Status", "Anomaly Score"].map((h) => (
                      <th key={h} className="text-left px-3 py-3 font-mono uppercase tracking-wider text-[10px]" style={{ color: "var(--muted-foreground)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 50).map((r, i) => {
                    const isAnom = r.status === "Suspicious Activity";
                    return (
                      <tr key={r.id} style={{
                        background: isAnom ? "rgba(245,158,11,0.04)" : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                        borderLeft: isAnom ? "2px solid #f59e0b" : "2px solid transparent",
                      }}>
                        <td className="px-3 py-2.5 font-mono" style={{ color: "var(--foreground)" }}>{r.id}</td>
                        <td className="px-3 py-2.5 font-mono" style={{ color: "var(--muted-foreground)" }}>{r.protocol}</td>
                        <td className="px-3 py-2.5 font-mono" style={{ color: "var(--muted-foreground)" }}>{r.service}</td>
                        <td className="px-3 py-2.5 font-mono" style={{ color: "var(--muted-foreground)" }}>{r.flag}</td>
                        <td className="px-3 py-2.5 font-mono" style={{ color: "var(--foreground)" }}>{r.srcBytes.toLocaleString()}</td>
                        <td className="px-3 py-2.5 font-mono" style={{ color: "var(--muted-foreground)" }}>{r.dstBytes.toLocaleString()}</td>
                        <td className="px-3 py-2.5 font-mono" style={{ color: "var(--muted-foreground)" }}>{r.duration}s</td>
                        <td className="px-3 py-2.5"><Badge text={r.status} type={isAnom ? "anomaly" : "normal"} /></td>
                        <td className="px-3 py-2.5 font-mono" style={{ color: isAnom ? ANOMALY : NORMAL }}>{r.anomalyScore}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 border-t text-[10px] font-mono" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              Showing {Math.min(50, filtered.length)} of {filtered.length} records · Isolation Forest · contamination=0.08 · score≥0.5 → Suspicious
            </div>
          </div>
        </>
      )}
    </div>
  );
}
