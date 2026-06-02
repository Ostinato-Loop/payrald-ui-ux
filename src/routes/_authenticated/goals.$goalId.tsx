import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader, ScreenScroll, SectionHeader } from "@/components/AppShell";
import { Heart, MessageCircle, Share2, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/goals/$goalId")({
  head: () => ({ meta: [{ title: "Goal — Dream Funding" }] }),
  component: GoalDetail,
});

function GoalDetail() {
  const { goalId } = Route.useParams();
  return (
    <>
      <AppHeader title="Goal" back showBell={false} />
      <ScreenScroll>
        <div className="rounded-[24px] border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-5">
          <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">DunaRald · Dream Funding · #{goalId}</p>
          <h2 className="mt-1 text-xl font-extrabold leading-tight">Lagos Creative Studio</h2>
          <p className="text-xs text-muted-foreground mt-1">A community workspace for African creators and storytellers.</p>

          <div className="mt-5">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-extrabold">₦860,000</p>
              <span className="text-sm font-bold text-primary">72%</span>
            </div>
            <p className="text-[11px] text-muted-foreground">raised of ₦1,200,000 goal</p>
            <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: "72%", background: "var(--gradient-neon)" }} />
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Users className="size-3" /> 24 contributors · 18 days left
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <Link to="/pay/route" className="h-12 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold grid place-items-center col-span-2">
            Contribute
          </Link>
          <button className="h-12 rounded-2xl bg-surface border border-border grid place-items-center">
            <Share2 className="size-4" />
          </button>
        </div>

        <SectionHeader title="Updates" />
        <div className="space-y-3">
          {[
            { t: "We hit 72%!", d: "Massive thanks — venue tour next Saturday.", time: "2d" },
            { t: "Architectural plans approved", d: "Final design from the team is ready.", time: "1w" },
            { t: "Launch announcement", d: "Founders shared the dream. We're building it together.", time: "3w" },
          ].map((u) => (
            <div key={u.t} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm">{u.t}</p>
                <span className="text-[10px] text-muted-foreground">{u.time}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{u.d}</p>
              <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Heart className="size-3" /> 18</span>
                <span className="flex items-center gap-1"><MessageCircle className="size-3" /> 4</span>
              </div>
            </div>
          ))}
        </div>

        <SectionHeader title="Top contributors" />
        <div className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
          {[
            { n: "Amara A.", a: "₦120,000" },
            { n: "Tunde B.", a: "₦80,000" },
            { n: "Chioma E.", a: "₦60,000" },
          ].map((c) => (
            <div key={c.n} className="flex items-center gap-3 px-4 py-3">
              <div className="size-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 grid place-items-center font-bold text-sm">{c.n[0]}</div>
              <p className="flex-1 text-sm font-semibold">{c.n}</p>
              <p className="text-sm font-bold text-primary">{c.a}</p>
            </div>
          ))}
        </div>
      </ScreenScroll>
    </>
  );
}
