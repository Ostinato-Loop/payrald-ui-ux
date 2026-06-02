import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader, ScreenScroll, SectionHeader } from "@/components/AppShell";
import { Plus, Users, Target } from "lucide-react";

export const Route = createFileRoute("/_authenticated/goals/")({
  head: () => ({ meta: [{ title: "Dream Funding" }] }),
  component: Goals,
});

const GOALS = [
  { id: "1", n: "Lagos Creative Studio", cat: "Personal · Dream Funding", raised: 860000, target: 1200000, contrib: 24 },
  { id: "2", n: "RCCG Youth Conference", cat: "Community", raised: 240000, target: 500000, contrib: 48 },
  { id: "3", n: "Co-working Deposit", cat: "Lagos Techies · Business", raised: 1200000, target: 1500000, contrib: 12 },
  { id: "4", n: "Mama's Surgery Fund", cat: "Family", raised: 450000, target: 600000, contrib: 9 },
];

function Goals() {
  return (
    <>
      <AppHeader title="Dream Funding" back showBell={false} right={
        <button className="size-10 rounded-full bg-primary text-primary-foreground grid place-items-center">
          <Plus className="size-5" />
        </button>
      } />
      <ScreenScroll>
        <p className="text-xs text-muted-foreground mt-2 mb-4">
          Fund dreams, projects, and goals — with money, skills, equipment, or mentorship.
        </p>

        <div className="space-y-3">
          {GOALS.map((g) => {
            const pct = Math.round((g.raised / g.target) * 100);
            return (
              <Link
                key={g.id}
                to="/goals/$goalId"
                params={{ goalId: g.id }}
                className="block rounded-2xl border border-border bg-surface p-5 active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">{g.cat}</p>
                    <h4 className="mt-1 font-bold truncate">{g.n}</h4>
                  </div>
                  <span className="text-sm font-bold text-primary">{pct}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">₦{(g.raised/1000).toFixed(0)}k of ₦{(g.target/1000).toFixed(0)}k</p>
                <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--gradient-neon)" }} />
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Users className="size-3" /> {g.contrib} contributors
                </div>
              </Link>
            );
          })}
        </div>

        <SectionHeader title="Ways to contribute" />
        <div className="grid grid-cols-2 gap-2 text-xs">
          {["Money", "Skills", "Equipment", "Mentorship", "Partnerships", "Referrals"].map((c) => (
            <div key={c} className="rounded-xl border border-border bg-surface p-3 flex items-center gap-2">
              <Target className="size-3.5 text-primary" /> {c}
            </div>
          ))}
        </div>
      </ScreenScroll>
    </>
  );
}
