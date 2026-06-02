import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader, ScreenScroll, SectionHeader } from "@/components/AppShell";
import { Search, Users, Store, Target, Gift } from "lucide-react";

export const Route = createFileRoute("/_authenticated/pay/")({
  head: () => ({ meta: [{ title: "Pay — PayRald" }] }),
  component: PayHub,
});

function PayHub() {
  return (
    <>
      <AppHeader title="Pay" showBell={false} />
      <ScreenScroll>
        <div className="flex items-center h-14 rounded-2xl border border-border bg-surface px-4 mt-2">
          <Search className="size-4 text-muted-foreground mr-3" />
          <input placeholder="Search people, businesses, @rald-id" className="flex-1 bg-transparent outline-none text-sm" />
        </div>

        <SectionHeader title="Quick send" />
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5">
          {["Amara", "Tunde", "Chioma", "Femi", "Boyd", "Zainab"].map((n) => (
            <Link key={n} to="/pay/route" className="shrink-0 flex flex-col items-center gap-2 w-16">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 grid place-items-center font-bold">
                {n[0]}
              </div>
              <span className="text-[11px] text-muted-foreground">{n}</span>
            </Link>
          ))}
        </div>

        <SectionHeader title="How would you like to pay?" />
        <div className="grid grid-cols-2 gap-3">
          {[
            { i: Users, l: "Pay a Person", d: "Send to RALD or phone", to: "/pay/route" },
            { i: Store, l: "Pay a Merchant", d: "QR or merchant ID", to: "/pay/merchants" },
            { i: Users, l: "Pay a Circle", d: "Contribute to group", to: "/circles" },
            { i: Target, l: "Pay a Goal", d: "Dream Funding", to: "/goals" },
            { i: Gift, l: "Send Gift", d: "Birthday, celebration", to: "/pay/route" },
            { i: Users, l: "Split Bill", d: "Share with friends", to: "/pay/route" },
          ].map(({ i: Icon, l, d, to }) => (
            <Link key={l} to={to} className="rounded-2xl border border-border bg-surface p-4 active:scale-[0.98] transition-transform">
              <span className="size-10 rounded-xl bg-primary/10 grid place-items-center">
                <Icon className="size-5 text-primary" />
              </span>
              <p className="mt-3 font-bold text-sm">{l}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{d}</p>
            </Link>
          ))}
        </div>

        <SectionHeader title="Recently paid" />
        <div className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
          {[
            { n: "Aisha Shop", s: "2 hours ago" },
            { n: "Lagos Techies", s: "Yesterday" },
            { n: "DSTV Bill", s: "3 days ago" },
          ].map((r) => (
            <Link key={r.n} to="/pay/route" className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-surface-elevated grid place-items-center text-xs font-bold">{r.n.slice(0,2)}</div>
                <div>
                  <p className="text-sm font-semibold">{r.n}</p>
                  <p className="text-[11px] text-muted-foreground">{r.s}</p>
                </div>
              </div>
              <span className="text-xs text-primary font-semibold">Pay again</span>
            </Link>
          ))}
        </div>
      </ScreenScroll>
    </>
  );
}
