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
    <nav className="fixed top-0 inset-x-0 z-40" style={{
      borderBottom: "1px solid rgba(27,47,78,0.4)",
      background: "rgba(6,16,30,0.92)",
      backdropFilter: "blur(24px)",
    }}>
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-4">
          <Link href="/history">
            <span className="text-xs font-medium cursor-pointer px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-secondary)", background: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(27,47,78,0.35)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
              History
            </span>
          </Link>
          <button onClick={onSignOut}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)", background: "transparent" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,48,42,0.12)"; e.currentTarget.style.color = "var(--red)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}

const QUICK_ACTIONS = [
  {
    label: "Send",
    href: "/send",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    ),
    bg: "rgba(212,48,42,0.15)",
    color: "#D4302A",
    border: "rgba(212,48,42,0.25)",
  },
  {
    label: "Withdraw",
    href: "/withdraw",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    ),
    bg: "rgba(240,160,32,0.15)",
    color: "#F0A020",
    border: "rgba(240,160,32,0.25)",
  },
  {
    label: "Shop",
    href: "/vouchers",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
      </svg>
    ),
    bg: "rgba(27,47,78,0.4)",
    color: "#A8BFDD",
    border: "rgba(46,79,128,0.35)",
  },
  {
    label: "History",
    href: "/history",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    bg: "rgba(0,200,150,0.12)",
    color: "#00C896",
    border: "rgba(0,200,150,0.2)",
  },
];

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
    <div className="min-h-screen pb-24" style={{ background: "var(--bg)" }}>
      <NavBar onSignOut={signOut} />

      <main className="max-w-2xl mx-auto px-4 pt-20">

        {/* ── Balance card ── */}
        <div className="mt-5 rounded-2xl relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0C1828 0%, #1B2F4E 55%, #243D62 100%)",
            border: "1px solid rgba(46,79,128,0.5)",
            boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
          }}>

          {/* Decorative glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div style={{
              position: "absolute", top: "-30%", right: "-10%",
              width: 220, height: 220, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(240,160,32,0.18) 0%, transparent 70%)",
            }} />
            <div style={{
              position: "absolute", bottom: "-20%", left: "-5%",
              width: 180, height: 180, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(212,48,42,0.12) 0%, transparent 70%)",
            }} />
            {/* Logo watermark */}
            <img src="/payrald-logo.png" alt=""
              className="absolute -right-4 -bottom-4 opacity-[0.06] pointer-events-none select-none"
              style={{ width: 140, height: 140, objectFit: "contain" }} />
          </div>

          <div className="relative z-10 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "rgba(255,255,255,0.5)" }}>
              Available balance
            </p>
            <p className="text-5xl font-black text-white tracking-tight leading-none mb-2">
              {formatNGN(balance)}
            </p>
            {pending > 0 && (
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                {formatNGN(pending)} pending
              </p>
            )}
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(240,160,32,0.18)", color: "#F0A020" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#F0A020" }} />
                @{user?.raldId}
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}>
                KYC Tier {user?.kycTier ?? "—"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-4 gap-2.5 mt-4">
          {QUICK_ACTIONS.map(({ label, href, icon, bg, color, border }) => (
            <Link href={href} key={label}>
              <div className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl cursor-pointer transition-all"
                style={{
                  background: "var(--surface)",
                  border: `1px solid ${border}`,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = bg; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--surface)"; }}>
                <span style={{ color }}>{icon}</span>
                <span className="text-xs font-semibold text-white">{label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Monthly stats ── */}
        {summary && (
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="p-4 rounded-xl"
              style={{ background: "var(--surface)", border: "1px solid rgba(212,48,42,0.2)" }}>
              <p className="text-xs mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Sent this month</p>
              <p className="text-xl font-black" style={{ color: "var(--red)" }}>{formatCompact(summary.sentThisMonth)}</p>
            </div>
            <div className="p-4 rounded-xl"
              style={{ background: "var(--surface)", border: "1px solid rgba(240,160,32,0.2)" }}>
              <p className="text-xs mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Received this month</p>
              <p className="text-xl font-black" style={{ color: "var(--amber)" }}>{formatCompact(summary.receivedThisMonth)}</p>
            </div>
          </div>
        )}

        {/* ── Recent transactions ── */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white">Recent transactions</h2>
            <Link href="/history">
              <span className="text-xs font-semibold cursor-pointer" style={{ color: "var(--amber)" }}>
                See all →
              </span>
            </Link>
          </div>

          {!txPage?.data?.length ? (
            <div className="py-14 text-center rounded-2xl"
              style={{ background: "var(--surface)", border: "1px solid rgba(27,47,78,0.4)" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(212,48,42,0.1)", border: "1px solid rgba(212,48,42,0.2)" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D4302A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-white mb-1">No transactions yet</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Send money to get started</p>
              <Link href="/send">
                <span className="inline-block mt-4 px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
                  style={{ background: "var(--red)", boxShadow: "0 4px 16px rgba(212,48,42,0.3)" }}>
                  Send now
                </span>
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(27,47,78,0.4)" }}>
              {txPage.data.map((tx, i) => {
                const isCredit = tx.direction === "credit";
                return (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-3.5"
                    style={{
                      background: "var(--surface)",
                      borderBottom: i < txPage.data.length - 1 ? "1px solid rgba(27,47,78,0.35)" : undefined,
                    }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: isCredit ? "rgba(240,160,32,0.15)" : "rgba(212,48,42,0.12)",
                        color: isCredit ? "var(--amber)" : "var(--red)",
                        border: `1px solid ${isCredit ? "rgba(240,160,32,0.25)" : "rgba(212,48,42,0.2)"}`,
                      }}>
                      {tx.counterpartyName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{tx.description}</p>
                      <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                        {formatRelative(tx.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold"
                        style={{ color: isCredit ? "var(--amber)" : "var(--red)" }}>
                        {isCredit ? "+" : "-"}{formatCompact(tx.amount)}
                      </p>
                      <p className="text-xs capitalize mt-0.5"
                        style={{ color: tx.status === "completed" ? "var(--success)" : "var(--warning)" }}>
                        {tx.status}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
