import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader, ScreenScroll, SectionHeader } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  Split,
  Store,
  Phone,
  Wifi,
  Receipt,
  Sparkles,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({ meta: [{ title: "PayRald — Home" }] }),
  component: HomePage,
});

const QUICK_ACTIONS = {
  Personal: [
    { icon: ArrowUpRight, label: "Send", to: "/pay" },
    { icon: ArrowDownLeft, label: "Request", to: "/pay" },
    { icon: Users, label: "Contribute", to: "/circles" },
    { icon: Split, label: "Split", to: "/pay" },
    { icon: Store, label: "Merchant", to: "/discover" },
    { icon: Phone, label: "Airtime", to: "/airtime" },
    { icon: Wifi, label: "Data", to: "/airtime" },
    { icon: Receipt, label: "Bills", to: "/discover" },
  ],
  Business: [
    { icon: Receipt, label: "Invoice", to: "/business" },
    { icon: ArrowDownLeft, label: "Pay Link", to: "/business" },
    { icon: Store, label: "Products", to: "/business" },
    { icon: Users, label: "Customers", to: "/business" },
    { icon: Sparkles, label: "Subs", to: "/business" },
    { icon: ArrowUpRight, label: "Refund", to: "/business" },
    { icon: Split, label: "Payouts", to: "/business" },
    { icon: Phone, label: "Devs", to: "/business" },
  ],
  Network: [
    { icon: ArrowDownLeft, label: "Accept", to: "/network" },
    { icon: ArrowUpRight, label: "Cash Out", to: "/network" },
    { icon: Store, label: "Cash In", to: "/network" },
    { icon: Users, label: "Requests", to: "/network" },
    { icon: Split, label: "Settle", to: "/network" },
    { icon: Receipt, label: "Float", to: "/network" },
    { icon: Sparkles, label: "Boost", to: "/network" },
    { icon: Phone, label: "Support", to: "/network" },
  ],
} as const;

const BALANCES = {
  Personal: { total: "₦450,000", sub: [["Wallet", "₦220k"], ["Savings", "₦180k"], ["Goals", "₦50k"]] },
  Business: { total: "₦720,000", sub: [["Available", "₦540k"], ["Pending", "₦120k"], ["Refunds", "₦60k"]] },
  Network: { total: "₦80,000", sub: [["Commission", "₦42k"], ["Float", "₦30k"], ["Bonus", "₦8k"]] },
} as const;

function HomePage() {
  const { identity } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const bal = BALANCES[identity];
  const actions = QUICK_ACTIONS[identity];

  return (
    <>
      <AppHeader showIdentitySwitcher />
      <ScreenScroll>
        {/* Balance Card */}
        <section
          className="relative overflow-hidden rounded-[28px] p-6 border border-border mt-2"
          style={{ background: "var(--gradient-balance)" }}
        >
          <div className="absolute -top-16 -right-16 size-48 rounded-full bg-primary/25 blur-[60px]" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                {identity} · Total available
              </span>
              <button
                onClick={() => setShowBalance((v) => !v)}
                className="size-7 rounded-full bg-white/5 grid place-items-center"
                aria-label="Toggle balance"
              >
                {showBalance ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
              </button>
            </div>
            <h2 className="mt-2 text-[40px] font-extrabold tracking-tight leading-none">
              {showBalance ? bal.total : "••••••"}
            </h2>

            <div className="mt-6 grid grid-cols-3 gap-3 pt-5 border-t border-white/10">
              {bal.sub.map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="text-sm font-bold mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-6">
          <div className="grid grid-cols-4 gap-x-2 gap-y-4">
            {actions.map(({ icon: Icon, label, to }) => (
              <Link
                key={label}
                to={to}
                className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
              >
                <span className="size-12 rounded-2xl bg-surface border border-border grid place-items-center">
                  <Icon className="size-5 text-primary" />
                </span>
                <span className="text-[11px] font-medium text-foreground/80 text-center leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Circles */}
        {identity === "Personal" && (
          <section>
            <SectionHeader title="Your Circles" action="View all" />
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
              {[
                { name: "Family", members: 6, balance: "₦240k", tint: "from-rose-400/30" },
                { name: "Lagos Techies", members: 12, balance: "₦1.2M", tint: "from-primary/30" },
                { name: "Creators", members: 24, balance: "₦580k", tint: "from-emerald-400/30" },
                { name: "Community", members: 88, balance: "₦3.4M", tint: "from-amber-400/30" },
              ].map((c, i) => (
                <Link
                  key={c.name}
                  to="/circles/$circleId"
                  params={{ circleId: String(i + 1) }}
                  className="shrink-0 w-40 rounded-2xl border border-border bg-surface p-4 relative overflow-hidden"
                >
                  <div className={`absolute -top-8 -right-8 size-24 rounded-full bg-gradient-to-br ${c.tint} to-transparent blur-2xl`} />
                  <div className="relative">
                    <div className="flex -space-x-1.5 mb-3">
                      {[0,1,2].map((j) => (
                        <div key={j} className="size-6 rounded-full bg-surface-elevated border-2 border-surface" />
                      ))}
                    </div>
                    <p className="font-bold text-sm">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{c.members} members</p>
                    <p className="text-xs font-semibold text-primary mt-2">{c.balance}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Dream Funding */}
        <section>
          <SectionHeader title="Active Goals" action="See all" />
          <Link to="/goals" className="block rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">
                  DunaRald · Dream Funding
                </p>
                <h4 className="mt-1 font-bold">Lagos Creative Studio</h4>
                <p className="text-xs text-muted-foreground mt-0.5">₦860k of ₦1.2M raised</p>
              </div>
              <span className="text-sm font-bold text-primary">72%</span>
            </div>
            <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: "72%", background: "var(--gradient-neon)" }} />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex -space-x-1.5">
                {[0,1,2,3].map((i) => (
                  <div key={i} className="size-6 rounded-full bg-surface-elevated border-2 border-background" />
                ))}
                <span className="ml-3 text-[11px] text-muted-foreground">+24 contributors</span>
              </div>
              <span className="text-xs font-semibold text-primary flex items-center gap-1">
                Contribute <ChevronRight className="size-3" />
              </span>
            </div>
          </Link>
        </section>

        {/* Smart Insight */}
        <section className="mt-4">
          <div className="flex items-start gap-3 rounded-2xl bg-surface border-l-2 border-primary p-4">
            <span className="mt-0.5 size-8 rounded-xl bg-primary/10 grid place-items-center">
              <Sparkles className="size-4 text-primary" />
            </span>
            <div>
              <p className="text-xs font-bold">Save ₦250 on your next transfer</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Route to Adebayo through Kuda — fastest & lowest fee right now.
              </p>
            </div>
          </div>
        </section>

        {/* Recent activity */}
        <section>
          <SectionHeader title="Recent Activity" action="Ledger" />
          <Link to="/transactions" className="block divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
            {[
              { name: "Aisha Shop", sub: "Merchant payment", amount: "-₦12,400", positive: false },
              { name: "Family Circle", sub: "Monthly contribution", amount: "+₦50,000", positive: true },
              { name: "Tunde Adebayo", sub: "Split bill — Dinner", amount: "-₦4,800", positive: false },
            ].map((t) => (
              <div key={t.name} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-surface-elevated grid place-items-center text-[11px] font-bold">
                    {t.name.slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.sub}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${t.positive ? "text-[oklch(0.78_0.17_155)]" : "text-foreground"}`}>
                  {t.amount}
                </span>
              </div>
            ))}
          </Link>
        </section>
      </ScreenScroll>
    </>
  );
}
