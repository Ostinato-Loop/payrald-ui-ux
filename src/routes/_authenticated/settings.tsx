import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader, ScreenScroll } from "@/components/AppShell";
import { useAuth, type Identity } from "@/lib/auth";
import { ChevronRight, Bell, Globe, Lock, Shield, Fingerprint, Sun, Eye, Heart, Briefcase, Network, Check } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, activateType } = useAuth();
  const [biometric, setBiometric] = useState(true);
  const [dark, setDark] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);

  return (
    <>
      <AppHeader title="Settings" back showBell={false} />
      <ScreenScroll>
        <Group title="Activated accounts">
          {(["Personal", "Business", "Network"] as Identity[]).map((t) => {
            const active = user?.activatedTypes.includes(t);
            const Icon = t === "Personal" ? Heart : t === "Business" ? Briefcase : Network;
            return (
              <button
                key={t}
                onClick={() => active ? null : activateType(t)}
                className="w-full flex items-center gap-3 px-4 py-3.5"
                disabled={active}
              >
                <span className="size-9 rounded-xl bg-primary/10 grid place-items-center">
                  <Icon className="size-4 text-primary" />
                </span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold">{t}</p>
                  <p className="text-[11px] text-muted-foreground">{active ? "Active" : "Tap to activate"}</p>
                </div>
                {active ? <Check className="size-4 text-[oklch(0.78_0.17_155)]" /> : <span className="text-xs text-primary font-semibold">Activate</span>}
              </button>
            );
          })}
        </Group>

        <Group title="Security">
          <Toggle icon={Fingerprint} label="Biometric login" value={biometric} onChange={setBiometric} />
          <Toggle icon={Eye} label="Hide balances by default" value={false} onChange={() => {}} />
          <Row icon={Lock} label="Change PIN" />
          <Row icon={Shield} label="Trusted devices" sub="2 active" />
        </Group>

        <Group title="Notifications">
          <Toggle icon={Bell} label="Push notifications" value={pushNotif} onChange={setPushNotif} />
          <Toggle icon={Bell} label="Email summaries" value={true} onChange={() => {}} />
        </Group>

        <Group title="Preferences">
          <Toggle icon={Sun} label="Dark mode" value={dark} onChange={setDark} />
          <Row icon={Globe} label="Language" sub="English" />
          <Row icon={Globe} label="Region" sub="Nigeria" />
        </Group>

        <Group title="API & developers">
          <Link to="/business/developers" className="flex items-center gap-3 px-4 py-3.5">
            <span className="size-9 rounded-xl bg-primary/10 grid place-items-center">
              <Lock className="size-4 text-primary" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">Developer center</p>
              <p className="text-[11px] text-muted-foreground">API keys, webhooks, logs</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </Group>
      </ScreenScroll>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 first:mt-2">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">{title}</p>
      <div className="rounded-2xl border border-border bg-surface divide-y divide-border overflow-hidden">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, sub }: { icon: typeof Bell; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="size-9 rounded-xl bg-primary/10 grid place-items-center">
        <Icon className="size-4 text-primary" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
      </div>
      <ChevronRight className="size-4 text-muted-foreground" />
    </div>
  );
}

function Toggle({ icon: Icon, label, value, onChange }: { icon: typeof Bell; label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="w-full flex items-center gap-3 px-4 py-3.5">
      <span className="size-9 rounded-xl bg-primary/10 grid place-items-center">
        <Icon className="size-4 text-primary" />
      </span>
      <p className="flex-1 text-left text-sm font-semibold">{label}</p>
      <span className={`w-10 h-6 rounded-full p-0.5 transition-colors ${value ? "bg-primary" : "bg-muted"}`}>
        <span className={`block size-5 rounded-full bg-white transition-transform ${value ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}
