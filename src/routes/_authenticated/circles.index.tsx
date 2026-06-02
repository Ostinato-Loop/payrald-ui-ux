import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader, ScreenScroll, SectionHeader } from "@/components/AppShell";
import { Plus, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/circles/")({
  head: () => ({ meta: [{ title: "Circles — PayRald" }] }),
  component: CirclesPage,
});

const CATEGORIES = ["All", "Family", "Friends", "Community", "Church", "School", "Startup", "Sports", "Neighborhood"];

const CIRCLES = [
  { id: "1", name: "Adekunle Family", category: "Family", members: 6, balance: "₦240,000", goal: "House Repair" },
  { id: "2", name: "Lagos Techies", category: "Startup", members: 12, balance: "₦1,200,000", goal: "Co-working space" },
  { id: "3", name: "RCCG Yaba Youth", category: "Church", members: 48, balance: "₦580,000", goal: "Youth Conference" },
  { id: "4", name: "Creator Collective", category: "Friends", members: 24, balance: "₦340,000", goal: "Studio Equipment" },
  { id: "5", name: "Ikoyi Neighbors", category: "Neighborhood", members: 88, balance: "₦3,400,000", goal: "Security upgrades" },
  { id: "6", name: "FC Onikan", category: "Sports", members: 22, balance: "₦92,000", goal: "Away kit" },
];

export default function CirclesPage() {
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? CIRCLES : CIRCLES.filter((c) => c.category === cat);

  return (
    <>
      <AppHeader title="Circles" right={
        <Link to="/circles/new" className="size-10 rounded-full bg-primary text-primary-foreground grid place-items-center">
          <Plus className="size-5" />
        </Link>
      } showBell={false} />
      <ScreenScroll>
        <div className="flex items-center h-12 rounded-2xl border border-border bg-surface px-4 mt-2">
          <Search className="size-4 text-muted-foreground mr-3" />
          <input placeholder="Search circles, members, goals" className="flex-1 bg-transparent outline-none text-sm" />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 mt-4">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-surface border-border text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <SectionHeader title={`${filtered.length} circles`} />
        <div className="space-y-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              to="/circles/$circleId"
              params={{ circleId: c.id }}
              className="block rounded-2xl border border-border bg-surface p-4 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 grid place-items-center font-bold text-primary">
                  {c.name.slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold truncate">{c.name}</p>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground bg-background px-1.5 py-0.5 rounded-full border border-border">
                      {c.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{c.members} members · {c.goal}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{c.balance}</p>
                  <p className="text-[10px] text-muted-foreground">pool</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </ScreenScroll>
    </>
  );
}
