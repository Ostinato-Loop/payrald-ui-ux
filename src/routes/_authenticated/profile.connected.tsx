import { createFileRoute } from "@tanstack/react-router";
import { AppHeader, ScreenScroll, SectionHeader } from "@/components/AppShell";
import { Plus, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile/connected")({
  head: () => ({ meta: [{ title: "Connected Networks" }] }),
  component: Connected,
});

const NETWORKS = [
  { type: "Bank", items: [
    { n: "Kuda Bank", d: "Verified ••3421", s: "ok" as const },
    { n: "GTB", d: "Verified ••8821", s: "ok" as const },
  ]},
  { type: "Cards", items: [
    { n: "Verve · Access", d: "••2841 · expires 09/27", s: "ok" as const },
    { n: "Mastercard · Zenith", d: "••5512 · verify needed", s: "warn" as const },
  ]},
  { type: "Wallets", items: [
    { n: "Apple Wallet", d: "iPhone 15 · linked", s: "ok" as const },
    { n: "Google Wallet", d: "Disconnected", s: "off" as const },
  ]},
  { type: "Payment partners", items: [
    { n: "Flutterwave", d: "Linked · all currencies", s: "ok" as const },
  ]},
];

function statusIcon(s: "ok" | "warn" | "off") {
  if (s === "ok") return <CheckCircle2 className="size-4 text-[oklch(0.78_0.17_155)]" />;
  if (s === "warn") return <AlertCircle className="size-4 text-amber-400" />;
  return <XCircle className="size-4 text-muted-foreground" />;
}

function Connected() {
  return (
    <>
      <AppHeader title="Connected networks" back showBell={false} />
      <ScreenScroll>
        <p className="text-xs text-muted-foreground mt-2">
          Connect more wallets, banks, and cards. PayRald uses Smart Routing to pick the best channel for every payment.
        </p>

        {NETWORKS.map((g) => (
          <div key={g.type}>
            <SectionHeader title={g.type} />
            <div className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
              {g.items.map((it) => (
                <div key={it.n} className="flex items-center gap-3 px-4 py-3">
                  <div className="size-10 rounded-xl bg-primary/10 grid place-items-center font-bold text-primary">{it.n[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{it.n}</p>
                    <p className="text-[11px] text-muted-foreground">{it.d}</p>
                  </div>
                  {statusIcon(it.s)}
                </div>
              ))}
            </div>
          </div>
        ))}

        <button className="mt-6 w-full h-14 rounded-2xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground flex items-center justify-center gap-2">
          <Plus className="size-4" /> Connect new network
        </button>
      </ScreenScroll>
    </>
  );
}
