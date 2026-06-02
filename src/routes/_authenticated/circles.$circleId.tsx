import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader, ScreenScroll, SectionHeader } from "@/components/AppShell";
import { useState } from "react";
import { PlusCircle, MessageCircle, Vote, Calendar, FileText, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/circles/$circleId")({
  head: () => ({ meta: [{ title: "Circle — PayRald" }] }),
  component: CircleDetail,
});

const TABS = ["Overview", "Members", "Goals", "Votes", "Activity"] as const;

function CircleDetail() {
  const { circleId } = Route.useParams();
  const [tab, setTab] = useState<typeof TABS[number]>("Overview");

  return (
    <>
      <AppHeader title="Lagos Techies" back showBell={false} />
      <ScreenScroll>
        <section className="rounded-[24px] p-5 border border-border" style={{ background: "var(--gradient-balance)" }}>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Circle Pool · #{circleId}</p>
          <h2 className="text-3xl font-extrabold mt-1">₦1,200,000</h2>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {[0,1,2,3,4].map((i) => (
                <div key={i} className="size-6 rounded-full bg-surface-elevated border-2 border-background" />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground">12 members · 8 active today</span>
          </div>
        </section>

        <div className="grid grid-cols-4 gap-2 mt-5">
          {[
            { i: PlusCircle, l: "Contribute" },
            { i: Vote, l: "Vote" },
            { i: MessageCircle, l: "Chat" },
            { i: Calendar, l: "Event" },
          ].map(({ i: Icon, l }) => (
            <button key={l} className="flex flex-col items-center gap-2">
              <span className="size-12 rounded-2xl bg-primary/10 border border-primary/20 grid place-items-center">
                <Icon className="size-5 text-primary" />
              </span>
              <span className="text-[11px] font-medium">{l}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-1 p-1 bg-surface rounded-full border border-border overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Overview" && (
          <>
            <SectionHeader title="Active Goal" />
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <p className="font-bold">Co-working Space Deposit</p>
              <p className="text-xs text-muted-foreground mt-1">₦860k of ₦1.2M raised</p>
              <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: "72%", background: "var(--gradient-neon)" }} />
              </div>
            </div>
            <SectionHeader title="Announcements" />
            <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
              <p className="font-semibold">Meeting this Saturday</p>
              <p className="text-xs text-muted-foreground mt-1">We'll review the new co-working location at 10am. Bring your laptops!</p>
              <p className="text-[10px] text-muted-foreground mt-2">2 hours ago · Amara A.</p>
            </div>
          </>
        )}

        {tab === "Members" && (
          <div className="space-y-2 mt-4">
            {["Amara A.", "Tunde B.", "Chioma E.", "Boyd K.", "Femi O.", "Zainab Y."].map((n) => (
              <div key={n} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                <div className="size-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 grid place-items-center font-bold text-sm">
                  {n.slice(0,2)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{n}</p>
                  <p className="text-[11px] text-muted-foreground">Contributed ₦60k this month</p>
                </div>
                <Users className="size-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}

        {tab === "Goals" && (
          <div className="space-y-3 mt-4">
            {[
              { n: "Co-working Space", p: 72 },
              { n: "Team Retreat 2026", p: 35 },
              { n: "Charity Donation", p: 100 },
            ].map((g) => (
              <div key={g.n} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex justify-between"><p className="font-semibold text-sm">{g.n}</p><span className="text-xs font-bold text-primary">{g.p}%</span></div>
                <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${g.p}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Votes" && (
          <div className="space-y-3 mt-4">
            {[
              { q: "Choose new co-working venue?", v: 8, t: 12 },
              { q: "Increase monthly contribution to ₦20k?", v: 5, t: 12 },
            ].map((v) => (
              <div key={v.q} className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-sm font-semibold">{v.q}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{v.v} of {v.t} members voted</p>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-semibold">Yes</button>
                  <button className="flex-1 h-9 rounded-xl bg-surface border border-border text-xs font-semibold">No</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Activity" && (
          <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
            {[
              { n: "Tunde contributed", a: "+₦60,000" },
              { n: "Disbursement to vendor", a: "-₦240,000" },
              { n: "Amara contributed", a: "+₦60,000" },
              { n: "Chioma contributed", a: "+₦60,000" },
            ].map((r) => (
              <div key={r.n} className="px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FileText className="size-4 text-muted-foreground" />
                  <p className="text-sm">{r.n}</p>
                </div>
                <span className="text-sm font-bold">{r.a}</span>
              </div>
            ))}
          </div>
        )}

        <Link to="/circles" className="block mt-6 text-center text-xs text-muted-foreground">← Back to all circles</Link>
      </ScreenScroll>
    </>
  );
}
