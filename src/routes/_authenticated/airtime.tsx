import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppHeader, ScreenScroll } from "@/components/AppShell";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/airtime")({
  head: () => ({ meta: [{ title: "Airtime & Data" }] }),
  component: Airtime,
});

const NETWORKS = [
  { id: "mtn", name: "MTN", color: "from-amber-400 to-yellow-500" },
  { id: "airtel", name: "Airtel", color: "from-red-500 to-rose-600" },
  { id: "glo", name: "Glo", color: "from-emerald-400 to-green-500" },
  { id: "9mobile", name: "9mobile", color: "from-emerald-500 to-teal-600" },
];

const PRESETS = [200, 500, 1000, 2000, 5000, 10000];

function Airtime() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"airtime" | "data">("airtime");
  const [network, setNetwork] = useState("mtn");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(1000);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    navigate({ to: "/transactions" });
  };

  return (
    <>
      <AppHeader title="Airtime & Data" back showBell={false} />
      <ScreenScroll>
        <div className="flex p-1 bg-surface border border-border rounded-full mt-2">
          {(["airtime", "data"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-semibold rounded-full capitalize ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <p className="mt-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Network</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {NETWORKS.map((n) => (
            <button
              key={n.id}
              onClick={() => setNetwork(n.id)}
              className={`p-3 rounded-2xl border ${network === n.id ? "border-primary bg-primary/5" : "border-border bg-surface"}`}
            >
              <div className={`size-8 rounded-xl bg-gradient-to-br ${n.color} mx-auto`} />
              <p className="text-[11px] font-semibold mt-2">{n.name}</p>
            </button>
          ))}
        </div>

        <p className="mt-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone number</p>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          placeholder="0800 000 0000"
          className="mt-2 w-full h-14 rounded-2xl border border-border bg-surface px-4 outline-none focus:border-primary text-base"
        />

        <p className="mt-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              className={`h-12 rounded-2xl border text-sm font-semibold ${amount === p ? "border-primary bg-primary/5 text-primary" : "border-border bg-surface"}`}
            >
              ₦{p.toLocaleString()}
            </button>
          ))}
        </div>

        <button
          onClick={submit}
          disabled={phone.length < 10 || loading}
          className="mt-6 w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          Buy {tab} · ₦{amount.toLocaleString()}
        </button>
      </ScreenScroll>
    </>
  );
}
