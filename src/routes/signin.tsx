import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/AppShell";
import { RaldMark } from "@/components/RaldMark";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { ChevronLeft, ShieldCheck, Fingerprint, Loader2 } from "lucide-react";

export const Route = createFileRoute("/signin")({
  head: () => ({ meta: [{ title: "Sign in with RALD" }] }),
  component: SignIn,
});

function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"id" | "pin">("id");
  const [raldId, setRaldId] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onContinue = () => {
    setError("");
    if (raldId.replace(/^@/, "").length < 2) {
      setError("Enter your RALD ID");
      return;
    }
    setStep("pin");
  };

  const onPinKey = async (digit: string) => {
    setError("");
    if (digit === "del") return setPin((p) => p.slice(0, -1));
    if (pin.length >= 6) return;
    const next = pin + digit;
    setPin(next);
    if (next.length >= 4) {
      setLoading(true);
      try {
        await signIn(raldId, next);
        navigate({ to: "/home" });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sign in failed");
        setPin("");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <PhoneFrame>
      <div className="relative flex-1 flex flex-col px-6 pt-6 pb-8 overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-24 size-64 rounded-full bg-primary/20 blur-[100px]" />

        <header className="relative flex items-center justify-between">
          <Link to="/" className="size-10 rounded-full border border-border bg-surface grid place-items-center">
            <ChevronLeft className="size-5" />
          </Link>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            RALD ID
          </span>
          <div className="size-10" />
        </header>

        <section className="relative mt-10">
          <div className="size-16 rounded-3xl bg-white grid place-items-center mx-auto shadow-[0_14px_40px_-12px_oklch(0.72_0.21_240/0.4)]">
            <RaldMark className="size-12" />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-center">
            {step === "id" ? "Welcome back" : `Hello, @${raldId.replace(/^@/, "")}`}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-center">
            {step === "id" ? "Sign in to your RALD identity" : "Enter your 4–6 digit PIN to continue"}
          </p>
        </section>

        {step === "id" ? (
          <section className="relative mt-10 flex-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              RALD ID
            </label>
            <div className="mt-2 flex items-center h-14 rounded-2xl border border-border bg-surface px-4 focus-within:border-primary transition-colors">
              <span className="text-primary font-bold mr-2">@</span>
              <input
                autoFocus
                value={raldId.replace(/^@/, "")}
                onChange={(e) => setRaldId(e.target.value.replace(/[^a-zA-Z0-9_.]/g, "").toLowerCase())}
                placeholder="yourhandle"
                className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground/50"
              />
            </div>
            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

            <button
              onClick={onContinue}
              className="mt-6 w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-[0_14px_40px_-12px_oklch(0.72_0.21_240/0.7)] active:scale-[0.98] transition-transform"
            >
              Continue
            </button>

            <p className="mt-6 text-xs text-center text-muted-foreground">
              No account?{" "}
              <Link to="/signup" className="text-primary font-semibold">
                Create RALD ID
              </Link>
            </p>
          </section>
        ) : (
          <section className="relative mt-8 flex-1 flex flex-col">
            <div className="flex justify-center gap-3 mb-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`size-3 rounded-full transition-all ${
                    i < pin.length ? "bg-primary scale-110" : "bg-surface border border-border"
                  }`}
                />
              ))}
            </div>
            {error && <p className="text-xs text-destructive text-center mb-3">{error}</p>}
            {loading && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-3">
                <Loader2 className="size-3 animate-spin" /> Verifying RALD ID…
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mt-auto">
              {["1","2","3","4","5","6","7","8","9","bio","0","del"].map((k) => (
                <button
                  key={k}
                  onClick={() => k === "bio" ? onPinKey("0000".slice(0,1)) : onPinKey(k)}
                  disabled={loading}
                  className="h-14 rounded-2xl bg-surface border border-border text-xl font-semibold active:scale-95 active:bg-primary/10 transition-all disabled:opacity-40"
                >
                  {k === "del" ? "⌫" : k === "bio" ? <Fingerprint className="size-5 mx-auto text-primary" /> : k}
                </button>
              ))}
            </div>

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-4">
              <ShieldCheck className="size-3.5 text-primary" />
              Your PIN never leaves your device
            </p>
          </section>
        )}
      </div>
    </PhoneFrame>
  );
}
