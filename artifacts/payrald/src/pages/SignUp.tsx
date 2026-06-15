import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";

export default function SignUp() {
  const { signUp } = useAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ raldId: "", name: "", email: "", phone: "", pin: "", confirmPin: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.raldId.trim()) return setError("Choose a RALD ID");
    if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(form.raldId)) return setError("RALD ID: 3-32 chars, letters/numbers/._-");
    if (!form.name.trim()) return setError("Enter your full name");
    if (form.pin.length !== 6) return setError("PIN must be exactly 6 digits");
    if (form.pin !== form.confirmPin) return setError("PINs don't match");
    if (!form.email && !form.phone) return setError("Add at least an email or phone number");

    setLoading(true);
    try {
      await signUp({
        raldId: form.raldId.trim().toLowerCase(),
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        pin: form.pin,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="inline-flex items-center gap-1 cursor-pointer">
              <span className="font-black text-2xl text-white">Pay</span>
              <span className="font-black text-2xl" style={{ color: "var(--blue)" }}>Rald</span>
            </span>
          </Link>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>Create your account in seconds</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-2xl border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Your RALD ID</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-muted)" }}>@</span>
                <input
                  type="text"
                  value={form.raldId}
                  onChange={set("raldId")}
                  placeholder="yourname"
                  className="w-full pl-7 pr-4 py-3 rounded-xl text-sm text-white outline-none border"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Others will send you money as @{form.raldId || "yourname"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="Amaka Johnson"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none border"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="amaka@gmail.com"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none border"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Phone number <span style={{ color: "var(--text-muted)" }}>(optional)</span></label>
              <input
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+2348012345678"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none border"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">6-digit PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={form.pin}
                onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                placeholder="••••••"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none border tracking-widest"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Confirm PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={form.confirmPin}
                onChange={(e) => setForm((f) => ({ ...f, confirmPin: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                placeholder="••••••"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none border tracking-widest"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            {error && (
              <div className="text-sm px-3 py-2.5 rounded-lg" style={{ background: "var(--error-dim)", color: "var(--error)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm"
              style={{ background: "var(--blue)", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </div>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link href="/signin">
            <span className="cursor-pointer font-medium" style={{ color: "var(--blue)" }}>Sign in</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
