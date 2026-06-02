import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/AppShell";
import { RaldMark } from "@/components/RaldMark";
import { useAuth, type Identity } from "@/lib/auth";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Loader2, User, AtSign, Mail, Phone, KeyRound, Heart, Briefcase, Network } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create your RALD account" }] }),
  component: SignUp,
});

type Step = 0 | 1 | 2 | 3 | 4;

function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState({
    name: "",
    raldId: "",
    email: "",
    phone: "",
    pin: "",
    activatedTypes: ["Personal"] as Identity[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const next = () => setStep((s) => (s + 1) as Step);
  const prev = () => (step === 0 ? navigate({ to: "/" }) : setStep((s) => (s - 1) as Step));

  const toggleType = (t: Identity) =>
    setData((d) => ({
      ...d,
      activatedTypes: d.activatedTypes.includes(t)
        ? d.activatedTypes.filter((x) => x !== t)
        : [...d.activatedTypes, t],
    }));

  const submit = async () => {
    setError("");
    if (data.pin.length < 4) return setError("PIN must be at least 4 digits");
    setLoading(true);
    try {
      await signUp(data);
      navigate({ to: "/home" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const canContinue =
    (step === 0 && data.name.trim().length >= 2) ||
    (step === 1 && data.raldId.replace(/^@/, "").length >= 3) ||
    (step === 2 && /.+@.+/.test(data.email) && data.phone.length >= 7) ||
    (step === 3 && data.activatedTypes.length > 0) ||
    (step === 4 && data.pin.length >= 4);

  const labels = ["Your name", "Choose RALD ID", "Contact", "Activate accounts", "Set a PIN"];

  return (
    <PhoneFrame>
      <div className="relative flex-1 flex flex-col px-6 pt-6 pb-8 overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-24 size-64 rounded-full bg-primary/20 blur-[100px]" />

        <header className="relative flex items-center justify-between">
          <button onClick={prev} className="size-10 rounded-full border border-border bg-surface grid place-items-center">
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex items-center gap-1.5">
            {[0,1,2,3,4].map((i) => (
              <div key={i} className={`h-1 rounded-full transition-all ${i <= step ? "bg-primary w-6" : "bg-surface w-3"}`} />
            ))}
          </div>
          <div className="size-10" />
        </header>

        <section className="relative mt-8">
          <div className="size-14 rounded-2xl bg-white grid place-items-center shadow-[0_14px_40px_-12px_oklch(0.72_0.21_240/0.4)]">
            <RaldMark className="size-10" />
          </div>
          <p className="mt-4 text-xs font-semibold text-primary uppercase tracking-widest">Step {step + 1} of 5</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{labels[step]}</h1>
        </section>

        <section className="relative mt-8 flex-1 overflow-y-auto no-scrollbar">
          {step === 0 && (
            <Field label="Full name" icon={User}>
              <input
                autoFocus
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="Boyd Adekunle"
                className="flex-1 bg-transparent outline-none text-base"
              />
            </Field>
          )}

          {step === 1 && (
            <>
              <Field label="RALD ID" icon={AtSign}>
                <input
                  autoFocus
                  value={data.raldId.replace(/^@/, "")}
                  onChange={(e) => setData({ ...data, raldId: e.target.value.replace(/[^a-zA-Z0-9_.]/g, "").toLowerCase() })}
                  placeholder="yourhandle"
                  className="flex-1 bg-transparent outline-none text-base"
                />
              </Field>
              <p className="mt-2 text-xs text-muted-foreground">This is how friends and businesses will pay you. Lowercase letters, numbers, _ and .</p>
            </>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Field label="Email" icon={Mail}>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent outline-none text-base"
                />
              </Field>
              <Field label="Phone" icon={Phone}>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value.replace(/[^\d+ ]/g, "") })}
                  placeholder="+234 800 000 0000"
                  className="flex-1 bg-transparent outline-none text-base"
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground -mt-2">Pick what you need. You can add more later.</p>
              {([
                { t: "Personal", d: "Send, receive, contribute with people you trust.", i: Heart },
                { t: "Business", d: "Invoices, subscriptions, payment links, analytics.", i: Briefcase },
                { t: "Network", d: "POS, agent services, commissions and settlement.", i: Network },
              ] as { t: Identity; d: string; i: typeof Heart }[]).map(({ t, d, i: Icon }) => {
                const active = data.activatedTypes.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleType(t)}
                    className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
                      active ? "border-primary bg-primary/5" : "border-border bg-surface"
                    }`}
                  >
                    <span className={`size-10 rounded-xl grid place-items-center shrink-0 ${active ? "bg-primary text-primary-foreground" : "bg-background text-primary"}`}>
                      <Icon className="size-5" />
                    </span>
                    <div className="flex-1">
                      <p className="font-bold">{t}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{d}</p>
                    </div>
                    <div className={`size-5 rounded-md border-2 grid place-items-center mt-1 ${active ? "bg-primary border-primary" : "border-border"}`}>
                      {active && <Check className="size-3 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 4 && (
            <div>
              <Field label="Create a 4–6 digit PIN" icon={KeyRound}>
                <input
                  autoFocus
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={data.pin}
                  onChange={(e) => setData({ ...data, pin: e.target.value.replace(/\D/g, "") })}
                  placeholder="••••"
                  className="flex-1 bg-transparent outline-none text-base tracking-[0.4em]"
                />
              </Field>
              <p className="mt-2 text-xs text-muted-foreground">You'll use this PIN to sign in and authorize payments.</p>
              {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
            </div>
          )}
        </section>

        <section className="relative mt-4">
          <button
            disabled={!canContinue || loading}
            onClick={step === 4 ? submit : next}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-[0_14px_40px_-12px_oklch(0.72_0.21_240/0.7)] active:scale-[0.98] transition-transform disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {step === 4 ? "Create RALD account" : "Continue"}
            {!loading && step !== 4 && <ChevronRight className="size-4" />}
          </button>

          {step === 0 && (
            <p className="mt-4 text-xs text-center text-muted-foreground">
              Already have RALD?{" "}
              <Link to="/signin" className="text-primary font-semibold">
                Sign in
              </Link>
            </p>
          )}
        </section>
      </div>
    </PhoneFrame>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="mt-2 flex items-center h-14 rounded-2xl border border-border bg-surface px-4 focus-within:border-primary transition-colors">
        <Icon className="size-4 text-muted-foreground mr-3" />
        {children}
      </div>
    </div>
  );
}
