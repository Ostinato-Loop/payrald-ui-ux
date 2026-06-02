import { createFileRoute } from "@tanstack/react-router";
import { AppHeader, ScreenScroll, SectionHeader } from "@/components/AppShell";
import { Copy, Plus, Webhook, Book, Activity, Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/business/developers")({
  head: () => ({ meta: [{ title: "Developer Center" }] }),
  component: Developers,
});

function Developers() {
  return (
    <>
      <AppHeader title="Developers" back showBell={false} />
      <ScreenScroll>
        <SectionHeader title="API Keys" />
        <div className="space-y-2">
          {[
            { env: "Test", key: "pk_test_8K2nQ9vL...mZ4r" },
            { env: "Production", key: "pk_live_••••••••••" },
          ].map((k) => (
            <div key={k.env} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">{k.env}</p>
                <button className="size-8 rounded-lg bg-background grid place-items-center">
                  <Copy className="size-3.5" />
                </button>
              </div>
              <p className="mt-2 font-mono text-xs text-muted-foreground">{k.key}</p>
            </div>
          ))}
          <button className="w-full h-12 rounded-2xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground flex items-center justify-center gap-2">
            <Plus className="size-4" /> Generate new key
          </button>
        </div>

        <SectionHeader title="Webhooks" />
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <span className="size-9 rounded-xl bg-primary/10 grid place-items-center">
              <Webhook className="size-4 text-primary" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">https://api.merchant.dev/payrald</p>
              <p className="text-[11px] text-muted-foreground">5 events · last received 2m ago</p>
            </div>
            <span className="size-2 rounded-full bg-[oklch(0.78_0.17_155)]" />
          </div>
        </div>

        <SectionHeader title="Resources" />
        <div className="grid grid-cols-2 gap-3">
          {[
            { i: Book, l: "API Docs", s: "REST · GraphQL" },
            { i: Activity, l: "Transaction logs", s: "Live tail" },
            { i: Shield, l: "Security", s: "IP allowlist, 2FA" },
            { i: Activity, l: "Rate limits", s: "1k req/min" },
          ].map(({ i: Icon, l, s }) => (
            <button key={l} className="rounded-2xl border border-border bg-surface p-4 text-left">
              <Icon className="size-5 text-primary" />
              <p className="mt-2 font-bold text-sm">{l}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s}</p>
            </button>
          ))}
        </div>

        <SectionHeader title="Usage this month" />
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-extrabold">82,450</p>
              <p className="text-[11px] text-muted-foreground">API calls / 250k</p>
            </div>
            <span className="text-xs font-bold text-primary">33%</span>
          </div>
          <div className="mt-3 h-2 bg-background rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: "33%" }} />
          </div>
        </div>
      </ScreenScroll>
    </>
  );
}
