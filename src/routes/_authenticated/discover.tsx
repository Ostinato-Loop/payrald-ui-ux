import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader, ScreenScroll } from "@/components/AppShell";
import { Search, Store, Phone, Wifi, Zap, Tv, Bus, ShoppingBag, GraduationCap, Heart, Briefcase, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/discover")({
  head: () => ({ meta: [{ title: "Discover — PayRald" }] }),
  component: Discover,
});

const CATEGORIES = [
  { i: Store, l: "Merchants", to: "/pay/merchants", c: "from-primary/30" },
  { i: Phone, l: "Airtime", to: "/airtime", c: "from-emerald-400/30" },
  { i: Wifi, l: "Data", to: "/airtime", c: "from-cyan-400/30" },
  { i: Zap, l: "Electricity", to: "/discover", c: "from-amber-400/30" },
  { i: Tv, l: "TV", to: "/discover", c: "from-rose-400/30" },
  { i: Bus, l: "Transport", to: "/discover", c: "from-violet-400/30" },
  { i: ShoppingBag, l: "Shopping", to: "/discover", c: "from-pink-400/30" },
  { i: GraduationCap, l: "Education", to: "/discover", c: "from-orange-400/30" },
  { i: Heart, l: "Healthcare", to: "/discover", c: "from-red-400/30" },
  { i: Briefcase, l: "Business", to: "/business", c: "from-blue-400/30" },
  { i: Users, l: "Community", to: "/circles", c: "from-teal-400/30" },
  { i: Store, l: "More", to: "/discover", c: "from-slate-400/30" },
];

function Discover() {
  return (
    <>
      <AppHeader title="Discover" />
      <ScreenScroll>
        <div className="flex items-center h-12 rounded-2xl border border-border bg-surface px-4 mt-2">
          <Search className="size-4 text-muted-foreground mr-3" />
          <input placeholder="Search services, merchants, bills" className="flex-1 bg-transparent outline-none text-sm" />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {CATEGORIES.map(({ i: Icon, l, to, c }) => (
            <Link key={l} to={to} className="relative rounded-2xl border border-border bg-surface p-4 overflow-hidden active:scale-95 transition-transform">
              <div className={`absolute -top-4 -right-4 size-16 rounded-full bg-gradient-to-br ${c} to-transparent blur-xl`} />
              <Icon className="size-5 text-primary relative" />
              <p className="mt-3 text-xs font-bold relative">{l}</p>
            </Link>
          ))}
        </div>

        <h3 className="font-bold mt-8 mb-3">Featured this week</h3>
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-5">
          <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">Zero-fee Tuesday</p>
          <h4 className="mt-1 text-lg font-bold leading-tight">All bill payments fee-free until midnight</h4>
          <p className="text-xs text-muted-foreground mt-2">Pay electricity, TV and data bills today and we'll waive the routing fee.</p>
          <Link to="/airtime" className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            Pay a bill
          </Link>
        </div>
      </ScreenScroll>
    </>
  );
}
