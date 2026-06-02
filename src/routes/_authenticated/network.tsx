import { createFileRoute } from "@tanstack/react-router";
import { AppHeader, ScreenScroll, SectionHeader } from "@/components/AppShell";
import { Banknote, Wallet, ArrowUpRight, ArrowDownLeft, MapPin, Activity, MessageCircleQuestion } from "lucide-react";

export const Route = createFileRoute("/_authenticated/network")({
  head: () => ({ meta: [{ title: "Network Partner" }] }),
  component: NetworkDashboard,
});

function NetworkDashboard() {
  return (
    <>
      <AppHeader title="Network Partner" showIdentitySwitcher />
      <ScreenScroll>
        <section className="grid grid-cols-2 gap-3 mt-2">
          <Stat l="Today's Txns" v="248" sub="₦1.2M" />
          <Stat l="Commission" v="₦14,820" sub="2.4% avg" tone />
          <Stat l="Cash Position" v="₦340k" sub="Float" />
          <Stat l="Next Settle" v="6 hrs" sub="Auto-settle" />
        </section>

        <SectionHeader title="Quick actions" />
        <div className="grid grid-cols-2 gap-3">
          {[
            { i: ArrowDownLeft, l: "Accept Payment" },
            { i: Wallet, l: "Cash In" },
            { i: ArrowUpRight, l: "Cash Out" },
            { i: Banknote, l: "Settlement" },
          ].map(({ i: Icon, l }) => (
            <button key={l} className="rounded-2xl border border-border bg-surface p-4 text-left">
              <span className="size-10 rounded-xl bg-primary/10 grid place-items-center">
                <Icon className="size-5 text-primary" />
              </span>
              <p className="mt-3 font-bold text-sm">{l}</p>
            </button>
          ))}
        </div>

        <SectionHeader title="Nearby requests" action="View all" />
        <div className="space-y-2">
          {[
            { n: "Cash-out · ₦40,000", d: "180m away · 4.9★", t: "2 min" },
            { n: "Cash-in · ₦25,000", d: "350m away · new user", t: "8 min" },
            { n: "POS payment · ₦12,400", d: "Aisha Foods · regular", t: "15 min" },
          ].map((r) => (
            <div key={r.n} className="rounded-2xl border border-border bg-surface p-4 flex items-center gap-3">
              <MapPin className="size-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{r.n}</p>
                <p className="text-[11px] text-muted-foreground">{r.d}</p>
              </div>
              <button className="px-3 h-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold">Accept</button>
            </div>
          ))}
        </div>

        <SectionHeader title="Performance" />
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <Activity className="size-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Top 5% of partners this week</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">98.4% success · 4.9★ rating · 1.2s avg response</p>
            </div>
          </div>
        </div>

        <button className="mt-4 w-full h-12 rounded-2xl border border-border bg-surface text-sm font-semibold flex items-center justify-center gap-2">
          <MessageCircleQuestion className="size-4 text-primary" /> Contact support
        </button>
      </ScreenScroll>
    </>
  );
}

function Stat({ l, v, sub, tone }: { l: string; v: string; sub: string; tone?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{l}</p>
      <p className={`text-xl font-extrabold mt-1 ${tone ? "text-primary" : ""}`}>{v}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}
