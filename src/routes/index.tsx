import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { PayRaldLogo } from "@/components/PayRaldLogo";
import raldLogo from "@/assets/rald-logo.asset.json";
import { Apple, Phone, ArrowRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PayRald — Sign in" },
      { name: "description", content: "Sign in to PayRald Network with your RALD identity." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <PhoneFrame>
      <main className="relative min-h-screen sm:min-h-[860px] flex flex-col px-6 pt-14 pb-10 overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-20 -right-24 size-72 rounded-full bg-primary/30 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full bg-primary/10 blur-[110px]" />

        <header className="relative flex items-center justify-between">
          <PayRaldLogo />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Network
          </span>
        </header>

        <section className="relative mt-14 flex-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-[11px] font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Humanity First. Relationships First.
          </span>

          <h1 className="mt-5 text-[40px] leading-[1.05] font-extrabold tracking-tight">
            Money moves<br />
            <span className="text-primary">between people</span><br />
            you trust.
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-[34ch]">
            Send, receive, contribute and build with your circles, businesses and the RALD network — all in one wallet.
          </p>

          <ul className="mt-8 space-y-2.5">
            {[
              "Send & Receive across any wallet",
              "Community contributions & circles",
              "Smart payment routing for lowest fees",
              "Dream Funding for goals & projects",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-foreground/85">
                <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Auth actions */}
        <section className="relative mt-8 space-y-3">
          {/* PRIMARY — Sign in with RALD (Google-style: icon chip + label) */}
          <Link
            to="/home"
            className="group flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-[0_14px_40px_-12px_oklch(0.72_0.21_240/0.7)] active:scale-[0.98] transition-transform"
          >
            <span className="grid place-items-center size-9 rounded-xl bg-white overflow-hidden shadow-sm">
              <img
                src={raldLogo.url}
                alt="RALD"
                className="size-7 object-contain"
                loading="eager"
              />
            </span>
            <span className="text-[15px]">Sign in with RALD</span>
            <ArrowRight className="size-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              or continue with
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-surface border border-border text-sm font-medium active:scale-[0.98] transition-transform"
            >
              <Apple className="size-4" />
              Apple
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-surface border border-border text-sm font-medium active:scale-[0.98] transition-transform"
            >
              <Phone className="size-4" />
              Phone
            </button>
          </div>

          <Link
            to="/home"
            className="flex items-center justify-center w-full h-12 rounded-2xl text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Create a new account
          </Link>

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
            <ShieldCheck className="size-3.5 text-primary" />
            Protected by RALD ID & end-to-end encryption
          </p>
        </section>
      </main>
    </PhoneFrame>
  );
}
