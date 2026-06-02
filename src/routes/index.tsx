import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/AppShell";
import { PayRaldLogo } from "@/components/PayRaldLogo";
import { RaldMark } from "@/components/RaldMark";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { ArrowRight, ShieldCheck, Users, Sparkles, Zap, Heart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PayRald — Relationships First. Money Second." },
      { name: "description", content: "The financial layer of the RALD ecosystem. Send, contribute, and grow with people you trust." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/home" });
  }, [isAuthenticated, navigate]);

  return (
    <PhoneFrame>
      <main className="relative flex-1 flex flex-col px-6 pt-14 pb-10 overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-24 size-72 rounded-full bg-primary/30 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full bg-primary/10 blur-[110px]" />

        <header className="relative flex items-center justify-between">
          <PayRaldLogo />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Network
          </span>
        </header>

        <section className="relative mt-12 flex-1">
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
            One wallet for personal, business, and network — built for African relationships and global commerce.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              { i: Heart, t: "Send & receive across any wallet" },
              { i: Users, t: "Community circles & contributions" },
              { i: Zap, t: "Smart routing for lowest fees" },
              { i: Sparkles, t: "Dream Funding for goals & projects" },
            ].map(({ i: Icon, t }) => (
              <li key={t} className="flex items-center gap-3 text-sm text-foreground/90">
                <span className="size-8 rounded-xl bg-primary/10 grid place-items-center">
                  <Icon className="size-4 text-primary" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section className="relative space-y-3">
          <Link
            to="/signin"
            className="group flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-[0_14px_40px_-12px_oklch(0.72_0.21_240/0.7)] active:scale-[0.98] transition-transform"
          >
            <span className="grid place-items-center size-9 rounded-xl bg-white overflow-hidden">
              <RaldMark className="size-7" />
            </span>
            <span className="text-[15px]">Sign in with RALD</span>
            <ArrowRight className="size-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/signup"
            className="flex items-center justify-center w-full h-12 rounded-2xl border border-border bg-surface text-sm font-semibold text-foreground active:scale-[0.98] transition-transform"
          >
            Create your RALD account
          </Link>

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
            <ShieldCheck className="size-3.5 text-primary" />
            Protected by RALD ID · End-to-end encrypted
          </p>
        </section>
      </main>
    </PhoneFrame>
  );
}
