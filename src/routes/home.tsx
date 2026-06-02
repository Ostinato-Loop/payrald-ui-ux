import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  Split,
  Store,
  Phone,
  Wifi,
  Receipt,
  Home as HomeIcon,
  Compass,
  User,
  CircleDot,
  Sparkles,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "PayRald — Home" },
      { name: "description", content: "Your unified PayRald dashboard." },
    ],
  }),
  component: HomePage,
});

type Identity = "Personal" | "Business" | "Network";

function HomePage() {
  const [identity, setIdentity] = useState<Identity>("Personal");
  const [showBalance, setShowBalance] = useState(true);

  return (
    <PhoneFrame>
      <div className="relative min-h-screen sm:min-h-[860px] pb-28">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-to-br from-primary to-primary/40 grid place-items-center text-primary-foreground font-bold">
                B
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Good morning,</p>
                <p className="font-bold text-sm">Boyd</p>
              </div>
            </div>
            <button className="relative size-10 rounded-full border border-border bg-surface grid place-items-center">
              <span className="absolute top-2 right-2 size-2 rounded-full bg-primary ring-2 ring-background" />
              <span className="text-base">🔔</span>
            </button>
          </div>

          {/* Identity Switcher */}
          <div className="mt-4 flex p-1 bg-surface border border-border rounded-full">
            {(["Personal", "Business", "Network"] as const).map((id) => (
              <button
                key={id}
                onClick={() => setIdentity(id)}
                className={`flex-1 py-2 text-[12px] font-semibold rounded-full transition-all ${
                  identity === id
                    ? "bg-primary text-primary-foreground shadow-[0_4px_14px_-4px_oklch(0.72_0.21_240/0.6)]"
                    : "text-muted-foreground"
                }`}
              >
                {id}
              </button>
            ))}
          </div>
        </header>

        <main className="px-5 space-y-6 mt-2">
          {/* Balance Card */}
          <section
            className="relative overflow-hidden rounded-[28px] p-6 border border-border"
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
                  <Eye className="size-3.5 text-muted-foreground" />
                </button>
              </div>
              <h2 className="mt-2 text-[40px] font-extrabold tracking-tight leading-none">
                <span className="text-primary/80 mr-1">₦</span>
                {showBalance ? "1,250,000" : "••••••"}
              </h2>

              <div className="mt-6 grid grid-cols-3 gap-3 pt-5 border-t border-white/10">
                {[
                  { label: "Personal", value: "₦450k" },
                  { label: "Business", value: "₦720k" },
                  { label: "Network", value: "₦80k" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </p>
                    <p className="text-sm font-bold mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <div className="grid grid-cols-4 gap-x-2 gap-y-4">
              {[
                { icon: ArrowUpRight, label: "Send" },
                { icon: ArrowDownLeft, label: "Request" },
                { icon: Users, label: "Contribute" },
                { icon: Split, label: "Split" },
                { icon: Store, label: "Merchant" },
                { icon: Phone, label: "Airtime" },
                { icon: Wifi, label: "Data" },
                { icon: Receipt, label: "Bills" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                >
                  <span className="size-12 rounded-2xl bg-surface border border-border grid place-items-center">
                    <Icon className="size-5 text-primary" />
                  </span>
                  <span className="text-[11px] font-medium text-foreground/80">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Circles */}
          <section>
            <SectionHeader title="Your Circles" />
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
              {[
                { name: "Family", members: 6, balance: "₦240k", tint: "from-rose-400/30" },
                { name: "Lagos Techies", members: 12, balance: "₦1.2M", tint: "from-primary/30" },
                { name: "Creators", members: 24, balance: "₦580k", tint: "from-emerald-400/30" },
                { name: "Community", members: 88, balance: "₦3.4M", tint: "from-amber-400/30" },
              ].map((c) => (
                <div
                  key={c.name}
                  className="shrink-0 w-40 rounded-2xl border border-border bg-surface p-4 relative overflow-hidden"
                >
                  <div
                    className={`absolute -top-8 -right-8 size-24 rounded-full bg-gradient-to-br ${c.tint} to-transparent blur-2xl`}
                  />
                  <div className="relative">
                    <div className="flex -space-x-1.5 mb-3">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="size-6 rounded-full bg-surface-elevated border-2 border-surface"
                        />
                      ))}
                    </div>
                    <p className="font-bold text-sm">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {c.members} members
                    </p>
                    <p className="text-xs font-semibold text-primary mt-2">{c.balance}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Dream Funding */}
          <section>
            <SectionHeader title="Active Goals" />
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">
                    DunaRald · Dream Funding
                  </p>
                  <h4 className="mt-1 font-bold">Lagos Creative Studio</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ₦860k of ₦1.2M raised
                  </p>
                </div>
                <span className="text-sm font-bold text-primary">72%</span>
              </div>
              <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: "72%", background: "var(--gradient-neon)" }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="size-6 rounded-full bg-surface-elevated border-2 border-background"
                    />
                  ))}
                  <span className="ml-3 text-[11px] text-muted-foreground">
                    +24 contributors
                  </span>
                </div>
                <button className="text-xs font-semibold text-primary flex items-center gap-1">
                  Contribute <ChevronRight className="size-3" />
                </button>
              </div>
            </div>
          </section>

          {/* Smart Insight */}
          <section>
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
            <SectionHeader title="Recent Activity" />
            <div className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
              {[
                { name: "Aisha Shop", sub: "Merchant payment", amount: "-₦12,400", positive: false },
                { name: "Family Circle", sub: "Monthly contribution", amount: "+₦50,000", positive: true },
                { name: "Tunde Adebayo", sub: "Split bill — Dinner", amount: "-₦4,800", positive: false },
              ].map((t) => (
                <div key={t.name} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-surface-elevated grid place-items-center text-[11px] font-bold">
                      {t.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-[11px] text-muted-foreground">{t.sub}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      t.positive ? "text-[oklch(0.78_0.17_155)]" : "text-foreground"
                    }`}
                  >
                    {t.amount}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Bottom Nav */}
        <nav className="fixed sm:absolute bottom-0 inset-x-0 sm:rounded-b-[44px] px-4 pb-5 pt-3 bg-background/90 backdrop-blur-xl border-t border-border z-40">
          <div className="flex items-end justify-between max-w-md mx-auto">
            <NavItem icon={HomeIcon} label="Home" active />
            <NavItem icon={Users} label="Circles" />
            <PayFab />
            <NavItem icon={Compass} label="Discover" />
            <NavItem icon={User} label="Profile" />
          </div>
        </nav>
      </div>
    </PhoneFrame>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-bold text-base">{title}</h3>
      <button className="text-[11px] font-semibold uppercase tracking-wider text-primary">
        View all
      </button>
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
}: {
  icon: typeof HomeIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <button className="flex flex-col items-center gap-1 w-14">
      <Icon
        className={`size-5 ${active ? "text-primary" : "text-muted-foreground"}`}
        strokeWidth={active ? 2.4 : 2}
      />
      <span
        className={`text-[10px] font-semibold ${
          active ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
      {active && <CircleDot className="size-1 -mt-0.5 text-primary" />}
    </button>
  );
}

function PayFab() {
  return (
    <button
      className="relative -mt-8 size-16 rounded-2xl grid place-items-center text-primary-foreground font-extrabold tracking-tight border-4 border-background active:scale-95 transition-transform"
      style={{
        background: "var(--gradient-neon)",
        boxShadow: "var(--glow-neon)",
      }}
    >
      <span className="text-[13px]">PAY</span>
    </button>
  );
}
