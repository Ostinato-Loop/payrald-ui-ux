import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { formatNGN, formatCompact, formatRelative } from "../lib/format";
import Logo from "../components/Logo";

type Wallet = { id: string; type: string; total: number; available: number; pending: number; currency: string };
type WalletResponse = { balances: Wallet[]; totalNgn: number };
type WalletSummary = { sentThisMonth: number; receivedThisMonth: number; feesSaved: number; transactionCount: number; topRecipient: string | null };
type Transaction = { id: string; type: string; description: string; counterpartyName: string; amount: number; fee: number; currency: string; direction: string; status: string; createdAt: string };
type TxPage = { data: Transaction[]; total: number };

function NavBar({ onSignOut }: { onSignOut: () => void }) {
  return (
    <nav className="fixed top-0 inset-x-0 z-40 border-b" style={{ borderColor: "var(--border)", background: "rgba(2,11,23,0.96)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-4">
          <Link href="/history">
            <span className="text-sm cursor-pointer" style={{ color: "var(--text-secondary)" }}>History</span>
          </Link>
          <button onClick={onSignOut} className="text-sm" style={{ color: "var(--text-muted)" }}>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default function Dashboard() {
  const { user, signOut } = useAuth();

  const { data: wallet } = useQuery<WalletResponse>({
    queryKey: ["wallet"],
    queryFn: () => api.get("/wallet"),
  });

  const { data: summary } = useQuery<WalletSummary>({
    queryKey: ["wallet-summary"],
    queryFn: () => api.get("/wallet/summary"),
  });

  const { data: txPage } = useQuery<TxPage>({
    queryKey: ["transactions", 8],
    queryFn: () => api.get("/transactions?limit=8"),
  });

  const balance = wallet?.balances?.[0]?.available ?? 0;
  const pending = wallet?.balances?.[0]?.pending ?? 0;

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--bg)" }}>
      <NavBar onSignOut={signOut} />

      <main className="max-w-2xl mx-auto px-4 pt-20">
        {/* Balance card */}
        <div
          className="mt-6 p-6 rounded-2xl relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0A1E4A 0%, #1045B4 40%, #1A6FFF 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-10" style={{ background: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E\")" }} />
          <p className="text-sm font-medium text-white/70 mb-1">Available balance</p>
          <p className="text-4xl font-black text-white mb-1">{formatNGN(balance)}</p>
          {pending > 0 && (
            <p className="text-sm text-white/60">{formatNGN(pending)} pending</p>
          )}
          <p className="text-sm text-white/60 mt-3">
            @{user?.raldId} · KYC Tier {user?.kycTier}
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: "Send", icon: "→", href: "/send", color: "var(--blue)" },
            { label: "Withdraw", icon: "↑", href: "/withdraw", color: "#00C896" },
            { label: "Shop", icon: "🎁", href: "/vouchers", color: "#A855F7" },
            { label: "History", icon: "≡", href: "/history", color: "#F5A623" },
          ].map(({ label, icon, href, color }) => (
            <Link href={href} key={label}>
              <div
                className="p-4 rounded-xl text-center cursor-pointer transition-all border"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <span className="block text-2xl font-bold mb-1" style={{ color }}>{icon}</span>
                <span className="text-xs font-semibold text-white">{label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Monthly stats */}
        {summary && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Sent this month</p>
              <p className="text-lg font-bold text-white">{formatCompact(summary.sentThisMonth)}</p>
            </div>
            <div className="p-4 rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Received this month</p>
              <p className="text-lg font-bold text-white">{formatCompact(summary.receivedThisMonth)}</p>
            </div>
          </div>
        )}

        {/* Recent transactions */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white">Recent transactions</h2>
            <Link href="/history">
              <span className="text-xs cursor-pointer" style={{ color: "var(--blue)" }}>See all</span>
            </Link>
          </div>

          {!txPage?.data?.length ? (
            <div className="py-12 text-center rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <p className="text-2xl mb-2">💸</p>
              <p className="text-sm font-medium text-white">No transactions yet</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Send money to get started</p>
              <Link href="/send">
                <span className="inline-block mt-4 px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer" style={{ background: "var(--blue)" }}>
                  Send now
                </span>
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              {txPage.data.map((tx, i) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-4"
                  style={{
                    background: "var(--surface)",
                    borderBottom: i < txPage.data.length - 1 ? `1px solid var(--border)` : undefined,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: tx.direction === "credit" ? "var(--success-dim)" : "var(--blue-dim)",
                      color: tx.direction === "credit" ? "var(--success)" : "var(--blue)",
                    }}
                  >
                    {tx.counterpartyName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{tx.description}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{formatRelative(tx.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm font-bold"
                      style={{ color: tx.direction === "credit" ? "var(--success)" : "var(--text)" }}
                    >
                      {tx.direction === "credit" ? "+" : "-"}{formatCompact(tx.amount)}
                    </p>
                    <p className="text-xs capitalize" style={{ color: tx.status === "completed" ? "var(--success)" : "var(--warning)" }}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
