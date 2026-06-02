import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader, ScreenScroll } from "@/components/AppShell";
import { useState } from "react";
import { MapPin, Star, Navigation as NavIcon, QrCode, List, Map as MapIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/pay/merchants")({
  head: () => ({ meta: [{ title: "Nearby Merchants" }] }),
  component: NearbyMerchants,
});

const MERCHANTS = [
  { id: 1, name: "Aisha Foods", dist: "120m", rating: 4.8, status: "Open", methods: "Card · Bank · Wallet" },
  { id: 2, name: "Ola Pharmacy", dist: "240m", rating: 4.9, status: "Open", methods: "All methods" },
  { id: 3, name: "Kunle Filling Station", dist: "480m", rating: 4.6, status: "Open", methods: "Wallet · POS" },
  { id: 4, name: "Yaba Tech Hub", dist: "1.1km", rating: 5.0, status: "Closed", methods: "Wallet" },
  { id: 5, name: "Mama Put", dist: "1.3km", rating: 4.7, status: "Open", methods: "Wallet · Cash" },
];

function NearbyMerchants() {
  const [view, setView] = useState<"list" | "map">("list");

  return (
    <>
      <AppHeader title="Nearby Merchants" back showBell={false} right={
        <div className="flex bg-surface border border-border rounded-full p-0.5">
          <button onClick={() => setView("list")} className={`size-8 rounded-full grid place-items-center ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <List className="size-4" />
          </button>
          <button onClick={() => setView("map")} className={`size-8 rounded-full grid place-items-center ${view === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <MapIcon className="size-4" />
          </button>
        </div>
      } />
      <ScreenScroll>
        {view === "map" && (
          <div className="relative h-56 rounded-2xl bg-surface border border-border overflow-hidden mt-2 grid place-items-center">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: "linear-gradient(oklch(0.72 0.21 240 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.21 240 / 0.15) 1px, transparent 1px)",
              backgroundSize: "24px 24px"
            }} />
            <div className="absolute top-1/3 left-1/4 size-3 rounded-full bg-primary animate-ping" />
            <div className="absolute top-1/3 left-1/4 size-3 rounded-full bg-primary" />
            <div className="absolute top-1/2 left-1/2 size-3 rounded-full bg-primary" />
            <div className="absolute bottom-1/3 right-1/4 size-3 rounded-full bg-primary" />
            <div className="relative text-center text-xs text-muted-foreground">
              <MapPin className="size-6 mx-auto mb-1 text-primary" />
              Yaba, Lagos · 5 merchants nearby
            </div>
          </div>
        )}

        <div className="space-y-3 mt-4">
          {MERCHANTS.map((m) => (
            <div key={m.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-start gap-3">
                <div className="size-12 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 grid place-items-center font-bold">
                  {m.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold truncate">{m.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${m.status === "Open" ? "bg-[oklch(0.72_0.17_155)]/20 text-[oklch(0.78_0.17_155)]" : "bg-muted text-muted-foreground"}`}>
                      {m.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><MapPin className="size-3" />{m.dist}</span>
                    <span className="flex items-center gap-0.5"><Star className="size-3 fill-primary text-primary" />{m.rating}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{m.methods}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Link to="/pay/route" className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-xs font-semibold grid place-items-center">
                  Pay here
                </Link>
                <button className="size-10 rounded-xl bg-background border border-border grid place-items-center">
                  <QrCode className="size-4" />
                </button>
                <button className="size-10 rounded-xl bg-background border border-border grid place-items-center">
                  <NavIcon className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </ScreenScroll>
    </>
  );
}
