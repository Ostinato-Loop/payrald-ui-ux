import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";
import Logo from "../components/Logo";

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

  const inputStyle = {
    background: "var(--surface-2)",
    border: "1px solid rgba(27,47,78,0.5)",
  };
  const inputClass = "w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all";
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = "var(--navy-bright)");
  const onBlur  = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = "rgba(27,47,78,0.5)");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: "var(--bg)" }}>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: "absolute", top: "-5%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(27,47,78,0.4) 0%, transparent 70%)",
          filter: "blur(50px)",
        }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="inline-flex justify-center cursor-pointer">
              <Logo size="lg" />
            </span>
          </Link>
          <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>Create your account in seconds</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{
            background: "var(--surface)",
            border: "1px solid rgba(27,47,78,0.55)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-white mb-2">Your RALD ID</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium"
                  style={{ color: "var(--amber)" }}>@</span>
                <input
                  type="text"
                  value={form.raldId}
                  onChange={set("raldId")}
                  placeholder="yourname"
                  className={`${inputClass} pl-8`}
                  style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Others pay you as @{form.raldId || "yourname"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Full name</label>
              <input
                type="text" value={form.name} onChange={set("name")}
                placeholder="Amaka Johnson"
                className={inputClass} style={inputStyle}
                onFocus={onFocus} onBlur={onBlur}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Email address</label>
              <input
                type="email" value={form.email} onChange={set("email")}
                placeholder="amaka@gmail.com"
                className={inputClass} style={inputStyle}
                onFocus={onFocus} onBlur={onBlur}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Phone <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="tel" value={form.phone} onChange={set("phone")}
                placeholder="+2348012345678"
                className={inputClass} style={inputStyle}
                onFocus={onFocus} onBlur={onBlur}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-white mb-2">6-digit PIN</label>
                <input
                  type="password" inputMode="numeric" maxLength={6}
                  value={form.pin}
                  onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                  placeholder="••••••"
                  className={`${inputClass} tracking-widest`}
                  style={{ ...inputStyle, letterSpacing: form.pin ? "0.35em" : undefined }}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Confirm PIN</label>
                <input
                  type="password" inputMode="numeric" maxLength={6}
                  value={form.confirmPin}
                  onChange={(e) => setForm((f) => ({ ...f, confirmPin: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                  placeholder="••••••"
                  className={`${inputClass} tracking-widest`}
                  style={{ ...inputStyle, letterSpacing: form.confirmPin ? "0.35em" : undefined }}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>
            </div>

            {error && (
              <div className="text-xs px-3 py-2.5 rounded-lg"
                style={{ background: "var(--error-dim)", color: "var(--error)", border: "1px solid rgba(255,75,75,0.2)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all"
              style={{
                background: loading ? "var(--navy)" : "var(--red)",
                boxShadow: loading ? "none" : "0 4px 20px rgba(212,48,42,0.35)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-sm" style={{ color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link href="/signin">
            <span className="cursor-pointer font-semibold" style={{ color: "var(--amber)" }}>Sign in</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
