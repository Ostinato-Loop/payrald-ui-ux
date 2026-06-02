import { createFileRoute } from "@tanstack/react-router";
import { AppHeader, ScreenScroll } from "@/components/AppShell";
import { useState } from "react";
import { Search, ArrowUpRight, ArrowDownLeft, Filter } from "lucide-react";

export const Route = createFileRoute("/_authenticated/transactions")({
  head: () => ({ meta: [{ title: "Transactions — PayRald" }] }),
  component: Transactions,
});

const TXNS = [
  { d: "Today", items: [
    { n: "Aisha Foods", s: "Merchant · Yaba", a: "-₦12,400", out: true },
    { n: "Adebayo Ogundimu", s: "Sent · @adebayo", a: "-₦40,000", out: true },
  ]},
  { d: "Yesterday", items: [
    { n: "Family Circle", s: "Monthly contribution", a: "+₦50,000", out: false },
    { n: "MTN Airtime", s: "Self · 0803...", a: "-₦1,000", out: true },
    { n: "Refund · DSTV", s: "Failed transaction", a: "+₦8,200", out: false },
  ]},
  { d: "This week", items: [
    { n: "Tunde Adebayo", s: "Split bill · Dinner", a: "-₦4,800", out: true },
    { n: "Salary · RALD Inc.", s: "Monthly payroll", a: "+₦650,000", out: false },
    { n: "Goal · Studio", s: "Contribution", a: "-₦25,000", out: true },
  ]},
];

const FILTERS = ["All", "Personal", "Business", "Network", "Circle", "Goal", "Merchant"];

function Transactions() {
  const [filter, setFilter] = useState("All");

  return (
    <>
      <AppHeader title="Transactions" back showBell={false} />
      <ScreenScroll>
        <div className="flex items-center h-12 rounded-2xl border border-border bg-surface px-4 mt-2">
          <Search className="size-4 text-muted-foreground mr-3" />
          <input placeholder="Search by name, reference" className="flex-1 bg-transparent outline-none text-sm" />
          <Filter className="size-4 text-muted-foreground" />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 mt-4">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-surface border-border text-muted-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>

        {TXNS.map((group) => (
          <div key={group.d} className="mt-6">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">{group.d}</p>
            <div className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
              {group.items.map((t) => (
                <div key={t.n + t.a} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-full grid place-items-center ${t.out ? "bg-surface-elevated" : "bg-primary/10"}`}>
                      {t.out ? <ArrowUpRight className="size-4 text-foreground" /> : <ArrowDownLeft className="size-4 text-primary" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.n}</p>
                      <p className="text-[11px] text-muted-foreground">{t.s}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${t.out ? "text-foreground" : "text-[oklch(0.78_0.17_155)]"}`}>
                    {t.a}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </ScreenScroll>
    </>
  );
}
