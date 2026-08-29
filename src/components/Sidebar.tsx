type Page =
  | "dashboard"
  | "fraud"
  | "network"
  | "reports"
  | "admin-login"
  | "admin";

type Props = {
  current: Page;
  onNav: (p: Page) => void;
  isAdmin: boolean;
};

const navItems: { id: Page; label: string; icon: string; adminOnly?: boolean }[] = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "fraud", label: "Fraud Detection", icon: "₿" },
  { id: "network", label: "Network Anomaly", icon: "◎" },
  { id: "reports", label: "Reports", icon: "≡" },
  { id: "admin-login", label: "Admin Login", icon: "⬕" },
  { id: "admin", label: "Admin Console", icon: "⚙", adminOnly: true },
];

export default function Sidebar({ current, onNav, isAdmin }: Props) {
  return (
    <aside className="flex flex-col w-56 shrink-0 border-r" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      {/* Logo */}
      <div className="px-5 pt-7 pb-6 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            CF
          </div>
          <div>
            <p className="font-display text-sm font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
              FraudGuard
            </p>
            <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
              ML Detection System
            </p>
          </div>
        </div>
      </div>

      {/* Status pill */}
      <div className="mx-4 mt-4 mb-1 px-3 py-2 rounded flex items-center gap-2" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--safe)" }} />
        <span className="text-[10px] font-mono" style={{ color: "var(--safe)" }}>MODELS LOADED</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-3 flex flex-col gap-0.5">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all duration-150"
                style={{
                  background: active ? "rgba(245,158,11,0.1)" : "transparent",
                  color: active ? "var(--primary)" : "var(--secondary-foreground)",
                  borderLeft: active ? "2px solid var(--primary)" : "2px solid transparent",
                }}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span className="text-[13px] font-medium">{item.label}</span>
              </button>
            );
          })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t" style={{ borderColor: "var(--border)" }}>
        <p className="text-[10px] font-mono leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          v2.1.0 · Academic Demo
          <br />
          Random Forest + Isolation Forest
        </p>
      </div>
    </aside>
  );
}
