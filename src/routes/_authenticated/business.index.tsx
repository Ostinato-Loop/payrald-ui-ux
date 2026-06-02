import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader, ScreenScroll, SectionHeader } from "@/components/AppShell";
import { Receipt, Link as LinkIcon, QrCode, Repeat, ChevronRight, TrendingUp, Users, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/business/")({
  head: () => ({ meta: [{ title: "Business — PayRald" }] }),
  component: BusinessDashboard,
});

function BusinessDashboard() {
  return (
    <>
      <AppHeader title="Business" showIdentitySwitcher />
      <ScreenScroll>
        <section className="rounded-[24px] border border-border p-5 mt-2" style={{ background: "var(--gradient-balance)" }}>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Revenue this month</p>
          <h2 className="mt-1 text-3xl font-extrabold">₦4,820,000</h2>
          <p className="text-[11px] text-[oklch(0.78_0.17_155)] mt-1 flex items-center gap-1">
            <TrendingUp className="size-3" /> +18.4% vs last month
          </p>
          <div className="mt-5 grid grid-cols-4 gap-3 pt-4 border-t border-white/10">
            {[
              ["Txns", "1,284"],
              ["Customers", "642"],
              ["Subs", "48"],
              ["Refunds", "₦60k"],
            ].map(([l, v]) => (
              <div key={l}>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</p>
                <p className="text-sm font-bold mt-0.5">{v}</p>
              </div>
            ))}
          </div>
        </section>

        <SectionHeader title="Quick actions" />
        <div className="grid grid-cols-2 gap-3">
          {[
            { i: Receipt, l: "Create invoice" },
            { i: LinkIcon, l: "Payment link" },
            { i: QrCode, l: "Generate QR" },
            { i: Repeat, l: "Subscription" },
          ].map(({ i: Icon, l }) => (
            <button key={l} className="rounded-2xl border border-border bg-surface p-4 text-left">
              <span className="size-10 rounded-xl bg-primary/10 grid place-items-center">
                <Icon className="size-5 text-primary" />
              </span>
              <p className="mt-3 font-bold text-sm">{l}</p>
            </button>
          ))}
        </div>

        <SectionHeader title="Merchant Center" />
        <div className="rounded-2xl border border-border bg-surface divide-y divide-border overflow-hidden">
          {[
            { i: Users, l: "Customers", s: "642 total · 28 new" },
            { i: Receipt, l: "Invoices", s: "12 unpaid · ₦340k" },
            { i: LinkIcon, l: "Payment links", s: "8 active" },
            { i: Repeat, l: "Subscriptions", s: "48 active · MRR ₦820k" },
            { i: FileText, l: "Settlement", s: "Next: Friday · ₦1.2M" },
          ].map(({ i: Icon, l, s }) => (
            <div key={l} className="flex items-center gap-3 px-4 py-3.5">
              <span className="size-9 rounded-xl bg-primary/10 grid place-items-center">
                <Icon className="size-4 text-primary" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{l}</p>
                <p className="text-[11px] text-muted-foreground">{s}</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          ))}
        </div>

        <SectionHeader title="Developers" />
        <Link to="/business/developers" className="block rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">API & integrations</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Keys, webhooks, SDKs, logs</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </Link>
      </ScreenScroll>
    </>
  );
}
