import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader, ScreenScroll, IdentityChip } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { RaldMark } from "@/components/RaldMark";
import {
  Shield,
  CreditCard,
  Bell,
  Lock,
  Globe,
  HelpCircle,
  LogOut,
  Settings,
  FileText,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile/")({
  head: () => ({ meta: [{ title: "Profile — PayRald" }] }),
  component: Profile,
});

function Profile() {
  const { user, signOut } = useAuth();

  return (
    <>
      <AppHeader title="Profile" showBell={false} right={
        <Link to="/settings" className="size-10 rounded-full border border-border bg-surface grid place-items-center">
          <Settings className="size-4" />
        </Link>
      } />
      <ScreenScroll>
        <section className="rounded-[24px] border border-border p-5 mt-2" style={{ background: "var(--gradient-balance)" }}>
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-white grid place-items-center">
              <RaldMark className="size-12" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-extrabold">{user?.name}</p>
              <p className="text-xs text-primary">{user?.raldId}</p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {user?.activatedTypes.map((t) => <IdentityChip key={t} identity={t} />)}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-[oklch(0.78_0.17_155)]" />
            Verified RALD identity · KYC tier 2
          </div>
        </section>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { l: "Verify", v: "Tier 2", tone: "text-primary" },
            { l: "Trust", v: "98%", tone: "text-[oklch(0.78_0.17_155)]" },
            { l: "Members", v: "6 circles", tone: "text-foreground" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-border bg-surface p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
              <p className={`text-sm font-bold mt-1 ${s.tone}`}>{s.v}</p>
            </div>
          ))}
        </div>

        <Section title="Account">
          <Row to="/profile/connected" icon={CreditCard} label="Connected payment networks" sub="5 connected · 1 needs attention" />
          <Row to="/settings" icon={Shield} label="Identity & verification" sub="KYC Tier 2 · Add documents" />
          <Row to="/settings" icon={FileText} label="Documents" sub="Tax, ID, contracts" />
        </Section>

        <Section title="Preferences">
          <Row to="/settings" icon={Bell} label="Notifications" sub="Payments, circles, alerts" />
          <Row to="/settings" icon={Globe} label="Language & region" sub="English · Nigeria" />
          <Row to="/settings" icon={Lock} label="Security & PIN" sub="Biometrics on" />
        </Section>

        <Section title="Support">
          <Row to="/settings" icon={HelpCircle} label="Help & support" sub="Chat with the RALD team" />
        </Section>

        <button
          onClick={signOut}
          className="mt-6 w-full h-14 rounded-2xl border border-destructive/40 text-destructive font-semibold flex items-center justify-center gap-2"
        >
          <LogOut className="size-4" />
          Sign out of RALD
        </button>
      </ScreenScroll>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">{title}</p>
      <div className="rounded-2xl border border-border bg-surface divide-y divide-border overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({ to, icon: Icon, label, sub }: { to: string; icon: typeof Shield; label: string; sub?: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3.5">
      <span className="size-9 rounded-xl bg-primary/10 grid place-items-center">
        <Icon className="size-4 text-primary" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
      </div>
      <ChevronRight className="size-4 text-muted-foreground" />
    </Link>
  );
}
