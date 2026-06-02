import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppHeader, ScreenScroll, SectionHeader } from "@/components/AppShell";
import { useState } from "react";
import { Check, Fingerprint, Zap, Award, TrendingUp, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/pay")({
  head: () => ({ meta: [{ title: "Smart Routing — PayRald" }] }),
  component: SmartRouting,
});

const CHANNELS = [
  { id: "wallet", name: "PayRald Wallet", balance: "₦220k", fee: "Free", time: "Instant" },
  { id: "kuda", name: "Kuda Bank", balance: "₦340k", fee: "₦0", time: "Instant" },
  { id: "gtb", name: "GTB Account", balance: "₦1.2M", fee: "₦25", time: "30 sec" },
  { id: "card", name: "Verve Card ••2841", balance: "—", fee: "1.5%", time: "Instant" },
  { id: "apple", name: "Apple Wallet", balance: "—", fee: "₦50", time: "Instant" },
];

const SUGGESTIONS = [
  { id: "kuda", title: "Lowest Fee", icon: Award, sub: "Save ₦25 with Kuda" },
  { id: "wallet", title: "Fastest", icon: Zap, sub: "Wallet · Instant" },
  { id: "gtb", title: "Highest Success", icon: TrendingUp, sub: "GTB · 99.7%" },
];

function SmartRouting() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("40000");
  const [selected, setSelected] = useState<string[]>(["wallet"]);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (id: string) =>
    setSelected((arr) => arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  const authorize = async () => {
    setConfirming(true);
    await new Promise(r => setTimeout(r, 1200));
    setDone(true);
    await new Promise(r => setTimeout(r, 900));
    navigate({ to: "/transactions" });
  };

  if (done) {
    return (
      <>
        <AppHeader title="Payment" back showBell={false} />
        <ScreenScroll>
          <div className="flex flex-col items-center text-center mt-12">
            <div className="size-20 rounded-full bg-primary grid place-items-center shadow-[0_14px_40px_-10px_oklch(0.72_0.21_240/0.7)]">
              <Check className="size-10 text-primary-foreground" />
            </div>
            <h2 className="mt-6 text-2xl font-extrabold">Payment Sent</h2>
            <p className="text-sm text-muted-foreground mt-1">₦{Number(amount).toLocaleString()} to @adebayo</p>
            <p className="text-xs text-muted-foreground mt-4">Routed across {selected.length} channels</p>
          </div>
        </ScreenScroll>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Smart Routing" back showBell={false} />
      <ScreenScroll>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">To</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="size-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 grid place-items-center font-bold">A</div>
            <div className="flex-1">
              <p className="font-bold text-sm">@adebayo</p>
              <p className="text-[11px] text-muted-foreground">Adebayo Ogundimu · Verified</p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold text-center">Amount</p>
          <div className="mt-3 flex items-center justify-center gap-1">
            <span className="text-2xl font-bold text-muted-foreground">₦</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g,""))}
              className="bg-transparent text-5xl font-extrabold tracking-tight text-center outline-none w-48"
            />
          </div>
        </div>

        <SectionHeader title="Suggested routes" />
        <div className="grid grid-cols-3 gap-2">
          {SUGGESTIONS.map(({ id, title, icon: Icon, sub }) => (
            <button
              key={id}
              onClick={() => setSelected([id])}
              className={`p-3 rounded-2xl border text-left ${selected.length === 1 && selected[0] === id ? "border-primary bg-primary/5" : "border-border bg-surface"}`}
            >
              <Icon className="size-4 text-primary" />
              <p className="text-[11px] font-bold mt-2">{title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
            </button>
          ))}
        </div>

        <SectionHeader title="Connected channels" />
        <div className="space-y-2">
          {CHANNELS.map((c) => {
            const active = selected.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border ${active ? "border-primary bg-primary/5" : "border-border bg-surface"}`}
              >
                <div className={`size-10 rounded-xl grid place-items-center ${active ? "bg-primary text-primary-foreground" : "bg-background text-primary"}`}>
                  {c.name[0]}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">{c.balance} · Fee {c.fee} · {c.time}</p>
                </div>
                <div className={`size-5 rounded-md border-2 grid place-items-center ${active ? "bg-primary border-primary" : "border-border"}`}>
                  {active && <Check className="size-3 text-primary-foreground" />}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={authorize}
          disabled={confirming || selected.length === 0}
          className="mt-6 w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_14px_40px_-12px_oklch(0.72_0.21_240/0.7)]"
        >
          {confirming ? <Loader2 className="size-4 animate-spin" /> : <Fingerprint className="size-4" />}
          {confirming ? "Authorizing…" : `Authorize ₦${Number(amount).toLocaleString()}`}
        </button>
      </ScreenScroll>
    </>
  );
}
